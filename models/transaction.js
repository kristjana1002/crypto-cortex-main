// models/transaction.js
const db = require('../config/db');

const Transaction = {
    create: async (userId, amount, type, category) => {
        const query = `INSERT INTO transactions (user_id, amount, type, category) VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [userId, amount, type, category];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    findByUserId: async (userId) => {
        const query = `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC`;
        const { rows } = await db.query(query, [userId]);
        return rows;
    },
};

module.exports = Transaction;
