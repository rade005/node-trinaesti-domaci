const { createUser, userExists, getUserByEmail } = require("../services/userService")
const bcrypt = require("bcrypt")
const querystring = require("node:querystring");
const { sessions, createSession, getSession, deleteSession, addToCart} = require("../services/sessionService")

async function handleApiCall(req, res) {

    const urlMatch = req.url.match(/^\/api\/([\w-]+)$/);

    if (urlMatch[1] === "register" && req.method === "POST") {

        let body = "";

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const formData = querystring.parse(body);
            const errors = [];

            if (!formData.name || formData.name.length < 3) {
                errors.push("Name must be set and at least 3 characters");
            }
            if (!formData.password || formData.password.length < 3) {
                errors.push("Passwords must be at least 3 characters");
            }
            if (!formData.confirmPassword) {
                errors.push("Please confirm your password");
            }
            if (formData.password !== formData.confirmPassword) {
                errors.push("Password must be the same");
            }
            if (!formData.terms) {
                errors.push("You must agree with terms");
            }
            if (errors.length === 0 && await userExists(formData.email)) {
                errors.push("This email is already taken");
            }
            if (errors.length > 0) {
                res.writeHead(400, {"Content-Type": "application/json"});
                return res.end(JSON.stringify(errors));
            }

            const password = await bcrypt.hash(formData.password, 10);
            const userId = await createUser(formData.name, formData.email, password);
            const sessionId = await createSession(userId);

            res.setHeader("Set-Cookie", `sid=${sessionId}; HttpOnly; Path=/`);
            res.writeHead(303, {"Location": "/"});
            return res.end();

        });
        return;
    }
    if (urlMatch[1] === "login" && req.method === "POST") {

        let body = "";

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const formData = querystring.parse(body);
            const errors = [];

            if (!formData.email || !formData.email.includes("@")) {
                errors.push("Email must be valid");
            }

            if (!formData.password || formData.password.length < 3) {
                errors.push("Passwords must be at least 3 characters");
            }


            if (errors.length > 0) {
                res.writeHead(400, {"Content-Type": "application/json"});
                return res.end(JSON.stringify(errors));
            }

            const user = await getUserByEmail(formData.email);

            if (!user) {
                res.writeHead(400, {"Content-Type": "application/json"});
                return res.end(JSON.stringify({success: false, message: "User does not exist"}));
            }

            const passwordMatch = await bcrypt.compare(formData.password, user.password);

            if (!passwordMatch) {
                res.writeHead(400, {"Content-Type": "application/json"});
                return res.end(JSON.stringify({message: "Wrong password"}));
            }
            const sessionId = await createSession(user.id);

            res.setHeader("Set-Cookie", `sid=${sessionId}; HttpOnly; Path=/`);
            res.writeHead(303, {"Location": "/"});
            return res.end();

        });
        return;

    } else if (urlMatch[1] === "logout" && req.method === "GET") {
        const user = getSession(req);
        if (user) {
            const cookie = deleteSession(user.userId);
            res.setHeader("Set-Cookie", cookie);

            res.writeHead(303, {"Location": "/"});
            return res.end();
        }
    }
    else if (urlMatch[1] === "add-to-cart" && req.method === "POST") {

        let body = "";

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const formData = querystring.parse(body);
            const cookie = req.headers.cookie || "";
            const match = cookie.match(/sid=([^;]+)/);

            if (!match) {
                res.writeHead(303, {"Location": "/login"});
                return res.end();
            }
            const sessionId = match[1];


            const user = getSession(req);

            addToCart(sessionId, formData.productId);

            const backUrl = req.headers.referer || "/";
            res.writeHead(303, {"Location": backUrl});
            return res.end();


        });
        return;

    }
    const response = {success: true};
    const data = JSON.stringify(response);

    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(data);
}

module.exports = {handleApiCall};