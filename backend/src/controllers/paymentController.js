const { query, pool } = require('../config/database');
const stripeService = require('../services/stripeService');
const emailService = require('../services/emailService');

const getUserPayments = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check permissions
        if (req.user.role !== 'superadmin' && req.user.id !== parseInt(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await query(
            'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const recordPayment = async (req, res) => {
    try {
        const { user_id, subscription_id, amount, payment_method, notes } = req.body;

        const result = await query(
            `INSERT INTO payments 
       (user_id, subscription_id, amount, payment_method, payment_status, payment_date, notes)
       VALUES ($1, $2, $3, $4, 'completed', NOW(), $5)
       RETURNING *`,
            [user_id, subscription_id, amount, payment_method, notes]
        );

        // Log action
        await query(
            'INSERT INTO action_history (user_id, action_type, action_description, performed_by, metadata) VALUES ($1, $2, $3, $4, $5)',
            [user_id, 'payment_record', `Recorded payment of €${amount}`, req.user.id, JSON.stringify(result.rows[0])]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Record payment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createStripeIntent = async (req, res) => {
    try {
        const { amount } = req.body;
        const paymentIntent = await stripeService.createPaymentIntent(amount);
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ message: 'Stripe error' });
    }
};

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeService.constructEvent(req.body, sig);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        // Logic to update payment status in DB would go here
        // Need to match paymentIntent.id with a pending payment record
        console.log('Payment succeeded:', paymentIntent.id);
    }

    res.json({ received: true });
};

const addManualPayment = async (req, res) => {
    let client;
    try {
        const { user_id, amount, payment_date, payment_method, notes, duration_months } = req.body;

        if (!user_id || !amount || !payment_date || !duration_months) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Get client from pool for transaction
        client = await pool.connect();

        // Start transaction
        await client.query('BEGIN');

        try {
            // Create subscription
            const startDate = new Date(payment_date);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + parseInt(duration_months));

            const subscriptionResult = await client.query(
                `INSERT INTO subscriptions 
                (user_id, member_type, start_date, end_date, duration_months, price, status) 
                VALUES ($1, 'Τακτικό', $2, $3, $4, $5, 'active') 
                RETURNING *`,
                [user_id, startDate, endDate, duration_months, amount]
            );

            const subscription = subscriptionResult.rows[0];

            // Record payment
            const paymentResult = await client.query(
                `INSERT INTO payments 
                (user_id, subscription_id, amount, payment_method, payment_status, payment_date, notes) 
                VALUES ($1, $2, $3, $4, 'completed', $5, $6) 
                RETURNING *`,
                [user_id, subscription.id, amount, payment_method, payment_date, notes]
            );

            // Update user member_type to Τακτικό
            await client.query(
                `UPDATE users SET member_type = 'Τακτικό', updated_at = NOW() WHERE id = $1`,
                [user_id]
            );

            await client.query('COMMIT');

            // Log action after commit
            try {
                const actionLogger = require('../services/actionLogger');
                await actionLogger.logPayment(user_id, req.user.id, amount, subscription.id);
            } catch (logError) {
                console.error('Failed to log payment action:', logError);
            }

            res.status(201).json({
                payment: paymentResult.rows[0],
                subscription: subscription
            });
        } catch (error) {
            if (client) await client.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Add manual payment error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    } finally {
        if (client) client.release();
    }
};

module.exports = {
    getUserPayments,
    recordPayment,
    createStripeIntent,
    handleStripeWebhook,
    addManualPayment
};
