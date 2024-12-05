// models/notification.js
const db = require('../config/db');

const Notification = {
    create: async (userId, message) => {
        const query = `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`;
        const values = [userId, message];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    findByUserId: async (userId) => {
        const query = `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`;
        const { rows } = await db.query(query, [userId]);
        return rows;
    },

    delete: async (id) => {
        const query = `DELETE FROM notifications WHERE id = $1 RETURNING *`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },
};

module.exports = Notification;
