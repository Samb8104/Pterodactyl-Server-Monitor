/* 

Pterodactyl Status Page
By Sam Barfield

Web process

*/
const express = require("express");
const config = require("../config.json");
const packageJson = require("../package.json");
const hbs = require("hbs");
const path = require("path");
const helmet = require('helmet');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Sql = require("./utils/sql.js");
const Log = require("./utils/log.js");

const Logger = new Log();
const sql = new Sql();

let time = new Date();
let lastUpdated = time.getTime();

//Configure express to use hbs and serve files
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../templates/views"));
app.use(express.static(path.join(__dirname, "../public")));
app.use(helmet());

//API router
const apiRouter = require("./routes/api.js");
app.use(apiRouter);

//Middleware
const logMiddle = require("./middleware/log.js");
app.use(logMiddle);

//Status page
app.get("/", (req, res) => {
	
	res.render("index.hbs", {
        web: config.web, 
        version: packageJson.version, 
        update: config.updateInterval / 1000
    })
	
})

//404
app.all("*", (req, res) => {
	res.send("404");
})

//Manage IPC messages from app.js
process.on("message", (message) => {
	let args = message.split(":");
	switch(args[0]) {
		case "updated":
			io.emit("update");
			lastUpdated = parseInt(args[1]);
			break;
		case "shutdown":
			sql.close();
			process.exit(0);
	}
})

//Begin listening
http.listen(config.web.port, () => console.log(`[Web] Listening on port ${config.web.port}`))
