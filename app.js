/* 

Pterodactyl Status Page
By Sam Barfield

Main Process

*/
const config = require("./config.json");
const cp = require("child_process");

const Log = require("./src/utils/log.js");
const Logger = new Log();

if (config.updateInterval < 10000) {
	Logger.error("app", "none", "Please use a bigger update interval");
	process.exit(1);
}

let updater = cp.fork(`${__dirname}/src/update.js`);
let web = cp.fork(`${__dirname}/src/web.js`);
	
updater.on("message", () => { 
	const time = new Date();
	web.send(`updated:${time.getTime()}`) 
})		 

updater.on("error", (error) => { Logger.error("app", `${error.code}`, `Updater process failed: ${error.message}`) });
updater.on("exit",  ()      => { Logger.info("app", "Updater process has shutdown") 						      });
web.on("error",     (error) => { Logger.error("app", `${error.code}`, `Web process failed: ${error.message}`) 	  });
web.on("exit",      ()      => { Logger.info("app", "Updater process has shutdown") 					          });

Logger.info("app", `Found ${config.servers.length} servers to monitor`)

const shutdownSeq = () => {
	web.send("shutdown:")
	updater.send("shutdown") 
}

process.on("exit",   () => { shutdownSeq() })
process.on("SIGINT", () => { shutdownSeq() })
	