
const crypto = require('crypto');
const fs = require("node:fs");



const SESSION_FILE  = "./data/sessions.json";

function loadSessions() {

    try {
        return JSON.parse(fs.readFileSync(SESSION_FILE, "utf8"));

    } catch {
        return {};
    }
}

function saveSession(sessions) {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));
}

const sessions = loadSessions();

function createSession(userId) {
    const sessionId = crypto.randomUUID();
    sessions[sessionId] = {userId: userId, createdAt: Date.now(),
        shoppingCart: []};
    saveSession(sessions);
    return sessionId;
}

function getSession(req) {
    const cookie = req.headers.cookie || "";
    const match = cookie.match(/sid=([^;]+)/);
    if(!match) return null;
    return sessions[match[1]] || null;
}

function deleteSession(userId) {
    for(const id in sessions) {
        if(sessions[id].userId === userId) {
            delete sessions[id];
            saveSession(sessions);
            break;
        }
    }
    return "sid=; HttpOnly; Path=/; Max-Age=0;"
}

function addToCart(sessionId, productId) {
    const session = sessions[sessionId];
    if(!session) {
        return false;
    }
    if(!Array.isArray(session.shoppingCart)) {
        session.shoppingCart = [];
    }
    session.shoppingCart.push(productId);
    saveSession(sessions);
    return true;

}

module.exports = {sessions, createSession, getSession, deleteSession, addToCart};