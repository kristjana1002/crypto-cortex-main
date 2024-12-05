// models/portfolio.js
const db = require('../config/db');

const Portfolio = {
    createEntry: async (userId, assetName, quantity, price) => {
        const query = `INSERT INTO portfolio (user_id, asset_name, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [userId, assetName, quantity, price];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    findByUserId: async (userId) => {
        const query = `SELECT * FROM portfolio WHERE user_id = $1`;
        const { rows } = await db.query(query, [userId]);
        return rows;
    },
};

module.exports = Portfolio;
