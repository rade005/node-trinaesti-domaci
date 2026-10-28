
const fs = require("fs");
const path = require("path");

function logFile(file, message) {
    const now = new Date().toISOString();
    const formattedMessage = `[${now}] ${message} \n`;
    const logPath = path.join(__dirname, `../../storage/${file}.log`);

    fs.appendFile(logPath, formattedMessage, (err) => {
        if (err) {
            console.error("Greska pri upisu loga", err);
        }

    });
}
module.exports = logFile;