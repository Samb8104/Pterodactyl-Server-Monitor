const config = require("../config.json");

const Log = require("./utils/log.js");
const Sql = require("./utils/sql.js");
const Req = require("./utils/req.js");

const Logger = new Log();
const sql = new Sql();
const Request = new Req();

Logger.info("update", "Started")

//Validate tables
sql.init().then((resolve) => {

	//Get servers
	Request.getServers().then(async (resolve) => {
		
		//Add/Update each server if in config
		resolve.forEach(server => {
			config.servers.forEach(async (confServer) => {
				if (server.attributes.identifier == confServer) {	
					sql.selectExist("current", confServer).then(async (resolve) => {
						if (!resolve) {
							//Add if not in database
							await sql.add("current", {confServer, name: server.attributes.name, description: server.attributes.description, state: "0"});
						} else {
							//Update the existing record
							await sql.updateRecord("current", {confServer, id: confServer, name: server.attributes.name, description: server.attributes.description, state: "0"});
						}
					}, (reject) => {
						Logger.error("sql", "none", "Failed to check record exisence");
					})
				}
			})
		})

		//Remove servers that aren't in the config
		await sql.syncConfig();

		//Carry out initial status check so we have some initial results
		//Get state of each server in config
		const statusCheck = () => {
			config.servers.forEach(async (confServer) => {
				Request.getUtilization(confServer).then((resolve) => {
					sql.setState(confServer, (JSON.parse(resolve).attributes.state == "on" ? 1 : 0));
				}, (reject) => {
					Logger.error("update", "none", `Failed to fetch state of ${confServer}`);
				})
			})
		}

		statusCheck();

		//Begin updater clock
		const updateClock = setInterval(() => { statusCheck() }, config.updateInterval)

	}, (reject) => {
		Logger.error("update", "none", "Failed to fetch servers, cannot contune");
		process.exit(1)
	})

}, (reject) => {
	Logger.error("update", "none", "Failed to validate, cannot continue");
	process.exit(1);
})


// //Message handler from parent to gracefully shutdown
// process.on("message", (message) => {
	
// 	let args = message.split(":")
	
// 	switch(args[0]) {
			
// 		case "shutdown":
			
// 			pool.end((err) => {
				
// 				clearInterval(clock)
				
// 				process.exit(0)
				
// 			})
// 			break;
// 	}
	
// })
