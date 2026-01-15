const { query } = require('../config/database');
const emailService = require('../services/emailService');

const getAllUsers = async (req, res) => {
    try {
        const result = await query('SELECT id, email, first_name, last_name, role, status, member_type, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM users WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        console.log(`[DEBUG] getUserById(${id}) found:`, user.email, user.fathers_name, user.id_number);

        // Check permissions: superadmin or own profile
        // Note: req.user.id is from token. 
        if (req.user.role !== 'superadmin' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Remove password_hash before sending
        delete user.password_hash;

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'UPDATE users SET status = $1, approved_at = NOW(), approved_by = $2 WHERE id = $3 RETURNING *',
            ['approved', req.user.id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        // Send email
        await emailService.sendApprovalEmail(user);

        // Log action
        await query(
            'INSERT INTO action_history (user_id, action_type, action_description, performed_by) VALUES ($1, $2, $3, $4)',
            [user.id, 'approval', 'User account approved', req.user.id]
        );

        res.json({ message: 'User approved successfully', user });
    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const denyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
            ['denied', id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        // Send email
        await emailService.sendDenialEmail(user);

        // Log action
        await query(
            'INSERT INTO action_history (user_id, action_type, action_description, performed_by) VALUES ($1, $2, $3, $4)',
            [user.id, 'denial', 'User account denied', req.user.id]
        );

        res.json({ message: 'User denied successfully', user });
    } catch (error) {
        console.error('Deny user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check permissions
        if (req.user.role !== 'superadmin' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await query(
            'SELECT * FROM action_history WHERE user_id = $1 ORDER BY created_at DESC',
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get user history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, fathers_name, id_number, email, phone, address, member_type } = req.body;

        const result = await query(
            `UPDATE users SET first_name = $1, last_name = $2, fathers_name = $3, id_number = $4, 
             email = $5, phone = $6, address = $7, member_type = $8, updated_at = NOW() 
             WHERE id = $9 RETURNING *`,
            [first_name, last_name, fathers_name, id_number, email, phone, address, member_type, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Log the update
        const actionLogger = require('../services/actionLogger');
        await actionLogger.logAction({
            userId: id,
            actionType: 'member_update',
            actionDescription: 'Member information updated',
            performedBy: req.user.id
        });

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Get user info before deletion for logging
        const user = await query('SELECT * FROM users WHERE id = $1', [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete related data first (subscriptions, payments, action history)
        await query('DELETE FROM subscriptions WHERE user_id = $1', [id]);
        await query('DELETE FROM payments WHERE user_id = $1', [id]);
        await query('DELETE FROM action_history WHERE user_id = $1', [id]);

        // Delete the user
        await query('DELETE FROM users WHERE id = $1', [id]);

        // Log the deletion
        const actionLogger = require('../services/actionLogger');
        await actionLogger.logAction({
            userId: req.user.id, // Log under admin's ID since user is deleted
            actionType: 'member_deletion',
            actionDescription: `Deleted member: ${user.rows[0].first_name} ${user.rows[0].last_name}`,
            performedBy: req.user.id,
            metadata: { deleted_user_id: id }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getExpiringMembers = async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM users 
             WHERE member_type = 'Τακτικό' 
             AND status = 'approved'
             AND created_at + INTERVAL '1 year' BETWEEN NOW() AND NOW() + INTERVAL '10 days'
             ORDER BY created_at ASC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get expiring members error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createMember = async (req, res) => {
    try {
        const {
            email, password, first_name, last_name, fathers_name,
            id_number, phone, address, member_type, sendWelcomeEmail
        } = req.body;

        // Check if user already exists
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Generate password if not provided
        const bcrypt = require('bcryptjs');
        const generatedPassword = password || Math.random().toString(36).slice(-10);
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(generatedPassword, salt);

        // Create user with approved status
        const result = await query(
            `INSERT INTO users 
             (email, password_hash, first_name, last_name, fathers_name, id_number, phone, address, member_type, role, status, approved_at, approved_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'user', 'approved', NOW(), $10)
             RETURNING *`,
            [email, password_hash, first_name, last_name, fathers_name, id_number, phone, address, member_type, req.user.id]
        );

        const newUser = result.rows[0];

        // Log action
        const actionLogger = require('../services/actionLogger');
        await actionLogger.logAction({
            userId: newUser.id,
            actionType: 'member_creation',
            actionDescription: `Member manually created by superadmin`,
            performedBy: req.user.id,
            metadata: { created_by: 'superadmin' }
        });

        // Send welcome email if requested
        if (sendWelcomeEmail) {
            try {
                await emailService.sendWelcomeEmail(newUser, generatedPassword);
            } catch (emailError) {
                console.error('Welcome email failed:', emailError);
                // Don't fail the request if email fails
            }
        }

        res.status(201).json({
            message: 'Member created successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                member_type: newUser.member_type
            },
            temporaryPassword: password ? null : generatedPassword // Only return if auto-generated
        });
    } catch (error) {
        console.error('Create member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const changeRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validate role
        if (!['user', 'superadmin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be "user" or "superadmin"' });
        }

        // Get current user
        const userResult = await query('SELECT * FROM users WHERE id = $1', [id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = userResult.rows[0];

        // If demoting from superadmin, check if this is the last superadmin
        if (user.role === 'superadmin' && role === 'user') {
            const superadminCount = await query(
                'SELECT COUNT(*) as count FROM users WHERE role = $1',
                ['superadmin']
            );

            if (parseInt(superadminCount.rows[0].count) <= 1) {
                return res.status(400).json({
                    message: 'Cannot demote the last superadmin. Please promote another user to superadmin first.'
                });
            }
        }

        // Update role
        const result = await query(
            'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [role, id]
        );

        // Log action
        const actionLogger = require('../services/actionLogger');
        await actionLogger.logAction({
            userId: id,
            actionType: 'role_change',
            actionDescription: `Role changed from ${user.role} to ${role}`,
            performedBy: req.user.id,
            metadata: {
                old_role: user.role,
                new_role: role
            }
        });

        // Send notification email
        try {
            await emailService.sendRoleChangeNotification(result.rows[0], user.role, role);
        } catch (emailError) {
            console.error('Role change email failed:', emailError);
            // Don't fail the request if email fails
        }

        res.json({
            message: `User role successfully changed to ${role}`,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Change role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const findDuplicates = async (req, res) => {
    try {
        const { type } = req.query; // 'email', 'name', 'id_number', or 'all'

        const duplicates = {
            emails: [],
            names: [],
            idNumbers: []
        };

        // Find duplicate emails
        if (!type || type === 'email' || type === 'all') {
            const emailDuplicates = await query(`
                SELECT LOWER(email) as email, array_agg(id) as user_ids, COUNT(*) as count
                FROM users
                GROUP BY LOWER(email)
                HAVING COUNT(*) > 1
                ORDER BY count DESC
            `);

            duplicates.emails = emailDuplicates.rows.map(row => ({
                value: row.email,
                count: parseInt(row.count),
                userIds: row.user_ids
            }));
        }

        // Find duplicate ID numbers
        if (!type || type === 'id_number' || type === 'all') {
            const idDuplicates = await query(`
                SELECT id_number, array_agg(id) as user_ids, COUNT(*) as count
                FROM users
                WHERE id_number IS NOT NULL AND id_number != ''
                GROUP BY id_number
                HAVING COUNT(*) > 1
                ORDER BY count DESC
            `);

            duplicates.idNumbers = idDuplicates.rows.map(row => ({
                value: row.id_number,
                count: parseInt(row.count),
                userIds: row.user_ids
            }));
        }

        // Find potential duplicate names (exact match on full name)
        if (!type || type === 'name' || type === 'all') {
            const nameDuplicates = await query(`
                SELECT 
                    LOWER(TRIM(first_name || ' ' || last_name)) as full_name,
                    array_agg(id) as user_ids,
                    COUNT(*) as count
                FROM users
                GROUP BY LOWER(TRIM(first_name || ' ' || last_name))
                HAVING COUNT(*) > 1
                ORDER BY count DESC
            `);

            duplicates.names = nameDuplicates.rows.map(row => ({
                value: row.full_name,
                count: parseInt(row.count),
                userIds: row.user_ids
            }));
        }

        // Get user details for all duplicates
        const allUserIds = [
            ...duplicates.emails.flatMap(d => d.userIds),
            ...duplicates.names.flatMap(d => d.userIds),
            ...duplicates.idNumbers.flatMap(d => d.userIds)
        ];

        const uniqueUserIds = [...new Set(allUserIds)];

        let userDetails = {};
        if (uniqueUserIds.length > 0) {
            const usersResult = await query(
                `SELECT id, email, first_name, last_name, fathers_name, id_number, phone, member_type, status, created_at 
                 FROM users 
                 WHERE id = ANY($1)`,
                [uniqueUserIds]
            );

            userDetails = usersResult.rows.reduce((acc, user) => {
                acc[user.id] = user;
                return acc;
            }, {});
        }

        res.json({
            duplicates,
            userDetails,
            summary: {
                totalEmailDuplicates: duplicates.emails.length,
                totalNameDuplicates: duplicates.names.length,
                totalIdNumberDuplicates: duplicates.idNumbers.length,
                totalAffectedUsers: uniqueUserIds.length
            }
        });
    } catch (error) {
        console.error('Find duplicates error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const mergeUsers = async (req, res) => {
    let client;
    try {
        const { targetUserId, sourceUserId } = req.body;

        if (!targetUserId || !sourceUserId) {
            return res.status(400).json({ message: 'Target and source user IDs are required' });
        }

        if (targetUserId === sourceUserId) {
            return res.status(400).json({ message: 'Cannot merge a user into themselves' });
        }

        client = await require('../config/database').pool.connect();
        await client.query('BEGIN');

        // Check users exist
        const usersCheck = await client.query(
            'SELECT id, email, first_name, last_name FROM users WHERE id IN ($1, $2)',
            [targetUserId, sourceUserId]
        );

        if (usersCheck.rows.length !== 2) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'One or both users not found' });
        }

        const sourceUser = usersCheck.rows.find(u => u.id === parseInt(sourceUserId));
        const targetUser = usersCheck.rows.find(u => u.id === parseInt(targetUserId));

        // Transfer Subscriptions
        await client.query(
            'UPDATE subscriptions SET user_id = $1 WHERE user_id = $2',
            [targetUserId, sourceUserId]
        );

        // Transfer Payments
        await client.query(
            'UPDATE payments SET user_id = $1 WHERE user_id = $2',
            [targetUserId, sourceUserId]
        );

        // Transfer Action Logs
        await client.query(
            'UPDATE action_history SET user_id = $1 WHERE user_id = $2',
            [targetUserId, sourceUserId]
        );

        // Delete Source User
        await client.query(
            'DELETE FROM users WHERE id = $1',
            [sourceUserId]
        );

        // Log the merge action
        const actionLogger = require('../services/actionLogger');
        // We log safely outside the transaction block usually, or inside? 
        // actionLogger might use its own pool/client. 
        // Let's insert directly or use valid logger after commit. 
        // We'll construct a manual log entry reusing the client to ensure atomicity or just log after commit.
        // For consistency with other functions, we'll log after commit using the service.

        await client.query('COMMIT');

        // Log action (using the service)
        await actionLogger.logAction({
            userId: targetUserId,
            actionType: 'user_merge',
            actionDescription: `Merged user ${sourceUser.email} (${sourceUser.first_name} ${sourceUser.last_name}) into this account`,
            performedBy: req.user.id,
            metadata: {
                merged_user_id: sourceUserId,
                merged_user_email: sourceUser.email,
                merged_user_name: `${sourceUser.first_name} ${sourceUser.last_name}`
            }
        });

        res.json({
            message: 'Users merged successfully',
            mergedDetails: {
                target: targetUser.email,
                source: sourceUser.email
            }
        });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Merge users error:', error);
        res.status(500).json({ message: 'Server error during merge' });
    } finally {
        if (client) client.release();
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    approveUser,
    denyUser,
    getUserHistory,
    updateUser,
    deleteUser,
    getExpiringMembers,
    createMember,
    changeRole,
    findDuplicates,
    mergeUsers
};
