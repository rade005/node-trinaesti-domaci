const { pool } = require('./mysql');

async function getAllProducts() {
    const [ rows ] = await pool.query("SELECT * FROM proizvodi");
    return rows;
}

async function fetchSingleProduct(slug) {
    const [rows] = await pool.query("SELECT * FROM proizvodi WHERE slug = ? LIMIT 1",
        [slug]);
    return rows[0] || null;
}

async function getProductsById(productIds) {
    if(!Array.isArray(productIds) || productIds.length === 0) {
        return [];
    }
    const placeholders = productIds.map(() => "?").join(",");
    const [rows] = await pool.query(`SELECT * FROM proizvodi WHERE id IN (${placeholders})`, productIds);
    return rows;
}

module.exports = { getAllProducts, fetchSingleProduct, getProductsById };