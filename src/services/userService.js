
const { pool } = require("./mysql");

async function createUser(name, email, password) {

    const [result] =  await pool.query(`INSERT INTO korisnici (name, email, password) VALUES (?, ?, ?)`, [
        name, email, password
    ]);
    return result.insertId;

}

async function getAllUsers() {
    const [rows] = await pool.query("SELECT * FROM korisnici");
    return rows;
}

async function userExists(email) {
    const [rows] = await pool.query("SELECT id FROM korisnici WHERE email = ? LIMIT 1", [email]);
    return rows.length > 0;
}
async function getUserByEmail(email){
    const [rows] = await pool.query("SELECT * FROM korisnici WHERE email = ? LIMIT 1", [email]);
    return rows[0] || null;
}

module.exports = { createUser, getAllUsers, userExists, getUserByEmail };