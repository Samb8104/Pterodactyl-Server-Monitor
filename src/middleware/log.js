/* 

Pterodactyl Status Page
By Sam Barfield

Request Logger Middleware

*/
const fs = require("fs");
const Log = require("../utils/log.js");
const Logger = new Log();

const log = (req, res, next) => {

    const now = new Date();

    let logObj = {
        time: `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}:${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`,
        url: req.path,
        method: req.method,
        ip: req.ip.replace("::ffff:", "")
    }

    fs.appendFile(`./logs/access-${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}.log`, JSON.stringify(logObj) + "\n", (error) => {
        if (error) { Logger.info("middle/log", `Failed to log request`) }
    })
    next();
}

module.exports = log;