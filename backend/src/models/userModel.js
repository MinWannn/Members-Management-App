const { query } = require('../config/database');

const createUser = async (userData) => {
    const { email, password_hash, first_name, last_name, fathers_name, id_number, phone, address, member_type } = userData;
    const sql = `
    INSERT INTO users (email, password_hash, first_name, last_name, fathers_name, id_number, phone, address, member_type)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
    const values = [email, password_hash, first_name, last_name, fathers_name, id_number, phone, address, member_type];
    const result = await query(sql, values);
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0];
};

const findUserById = async (id) => {
    const sql = 'SELECT id, email, first_name, last_name, fathers_name, id_number, phone, address, role, status, member_type, created_at FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById
};
