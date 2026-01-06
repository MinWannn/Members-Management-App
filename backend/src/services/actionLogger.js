const { query } = require('../config/database');

/**
 * Centralized action logging service
 * Logs all user actions, admin actions, and system actions
 */

const logAction = async ({ userId, actionType, actionDescription, performedBy = null, metadata = null, ipAddress = null }) => {
    try {
        await query(
            `INSERT INTO action_history (user_id, action_type, action_description, performed_by, metadata, ip_address) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, actionType, actionDescription, performedBy, metadata ? JSON.stringify(metadata) : null, ipAddress]
        );
        console.log(`Action logged: ${actionType} for user ${userId}`);
    } catch (error) {
        console.error('Error logging action:', error);
        // Don't throw error to avoid blocking the main flow
    }
};

// Convenience methods for common actions
const logRegistration = (userId) => {
    return logAction({
        userId,
        actionType: 'registration',
        actionDescription: 'User registered'
    });
};

const logApproval = (userId, performedBy) => {
    return logAction({
        userId,
        actionType: 'approval',
        actionDescription: 'User account approved',
        performedBy
    });
};

const logDenial = (userId, performedBy) => {
    return logAction({
        userId,
        actionType: 'denial',
        actionDescription: 'User account denied',
        performedBy
    });
};

const logLogin = (userId, ipAddress = null) => {
    return logAction({
        userId,
        actionType: 'login',
        actionDescription: 'User logged in',
        ipAddress
    });
};

const logSubscriptionChange = (userId, performedBy, oldType, newType) => {
    return logAction({
        userId,
        actionType: 'subscription_change',
        actionDescription: `Subscription changed from ${oldType} to ${newType}`,
        performedBy,
        metadata: { oldType, newType }
    });
};

const logPayment = (userId, performedBy, amount, subscriptionId) => {
    return logAction({
        userId,
        actionType: 'payment',
        actionDescription: `Payment of €${amount} recorded`,
        performedBy,
        metadata: { amount, subscriptionId }
    });
};

const logAutoConversion = (userId, oldType, newType) => {
    return logAction({
        userId,
        actionType: 'auto_conversion',
        actionDescription: `Subscription expired, auto-converted from ${oldType} to ${newType}`,
        metadata: { oldType, newType }
    });
};

module.exports = {
    logAction,
    logRegistration,
    logApproval,
    logDenial,
    logLogin,
    logSubscriptionChange,
    logPayment,
    logAutoConversion
};
