const { query } = require('../config/database');

// Get all settings
const getAllSettings = async (req, res) => {
    try {
        const result = await query('SELECT * FROM system_settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get specific setting
const getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const result = await query('SELECT setting_value FROM system_settings WHERE setting_key = $1', [key]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        res.json({ key, value: result.rows[0].setting_value });
    } catch (error) {
        console.error('Get setting error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update setting
const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        const result = await query(
            `INSERT INTO system_settings (setting_key, setting_value, updated_at) 
             VALUES ($1, $2, NOW()) 
             ON CONFLICT (setting_key) 
             DO UPDATE SET setting_value = $2, updated_at = NOW() 
             RETURNING *`,
            [key, value]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update setting error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get bank accounts (public)
const getBankAccounts = async (req, res) => {
    try {
        const result = await query('SELECT setting_value FROM system_settings WHERE setting_key = $1', ['bank_accounts']);

        if (result.rows.length === 0) {
            return res.json({ accounts: [] });
        }

        const bankData = JSON.parse(result.rows[0].setting_value);
        res.json(bankData);
    } catch (error) {
        console.error('Get bank accounts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get pricing (public)
const getPricing = async (req, res) => {
    try {
        const result = await query('SELECT setting_key, setting_value FROM system_settings WHERE setting_key LIKE $1', ['pricing_%']);

        const pricing = {};
        result.rows.forEach(row => {
            const key = row.setting_key.replace('pricing_', '');
            pricing[key] = parseFloat(row.setting_value);
        });

        res.json(pricing);
    } catch (error) {
        console.error('Get pricing error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllSettings,
    getSetting,
    updateSetting,
    getBankAccounts,
    getPricing
};
