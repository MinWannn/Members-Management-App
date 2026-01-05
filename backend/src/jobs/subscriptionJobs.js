const cron = require('node-cron');
const { query } = require('../config/database');
const emailService = require('../services/emailService');
const { addDays, format } = require('date-fns');

const initJobs = () => {
    // Run every day at 00:00
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily subscription checks...');
        await checkExpiringSubscriptions();
        await checkExpiredSubscriptions();
    });
};

const checkExpiringSubscriptions = async () => {
    try {
        // Find subscriptions expiring in exactly 10 days that haven't been reminded
        const targetDate = addDays(new Date(), 10);
        const formattedDate = format(targetDate, 'yyyy-MM-dd');

        const result = await query(
            `SELECT s.*, u.email, u.first_name, u.last_name 
       FROM subscriptions s
       JOIN users u ON s.user_id = u.id
       WHERE s.end_date = $1 
       AND s.status = 'active' 
       AND s.reminder_sent = false`,
            [formattedDate]
        );

        for (const sub of result.rows) {
            // Send email
            await emailService.sendEmail(
                sub.email,
                'Subscription Expiring Soon',
                `<h2>Subscription Expiring Soon</h2>
         <p>Hello ${sub.first_name} ${sub.last_name},</p>
         <p>Your subscription is expiring on ${format(new Date(sub.end_date), 'dd/MM/yyyy')}.</p>
         <p>Please renew to maintain your status.</p>`
            );

            // Mark as reminded
            await query('UPDATE subscriptions SET reminder_sent = true WHERE id = $1', [sub.id]);
        }
    } catch (error) {
        console.error('Check expiring subscriptions error:', error);
    }
};

const checkExpiredSubscriptions = async () => {
    try {
        // Find active subscriptions that have passed their end date
        const result = await query(
            `SELECT s.*, u.email, u.first_name, u.last_name 
       FROM subscriptions s
       JOIN users u ON s.user_id = u.id
       WHERE s.end_date < CURRENT_DATE 
       AND s.status = 'active'`,
            []
        );

        for (const sub of result.rows) {
            // Auto-convert logic: Downgrade to 'Υποστηρικτής' or just mark expired
            // Requirement: "auto convert to lower subscription if not paid"

            // Update old subscription
            await query("UPDATE subscriptions SET status = 'expired' WHERE id = $1", [sub.id]);

            // Create new lower tier subscription (if applicable) or just update user member_type
            // Assuming 'Υποστηρικτής' is the lower tier
            if (sub.member_type !== 'Υποστηρικτής') {
                await query("UPDATE users SET member_type = 'Υποστηρικτής' WHERE id = $1", [sub.user_id]);

                // Log action
                await query(
                    'INSERT INTO action_history (user_id, action_type, action_description, metadata) VALUES ($1, $2, $3, $4)',
                    [sub.user_id, 'auto_conversion', 'Subscription expired, auto-converted to Υποστηρικτής', JSON.stringify({ old_sub: sub.id })]
                );

                // Notify user
                await emailService.sendEmail(
                    sub.email,
                    'Subscription Expired',
                    `<h2>Subscription Expired</h2>
           <p>Hello ${sub.first_name} ${sub.last_name},</p>
           <p>Your subscription has expired. Your account has been converted to 'Υποστηρικτής'.</p>`
                );
            }
        }
    } catch (error) {
        console.error('Check expired subscriptions error:', error);
    }
};

module.exports = {
    initJobs
};
