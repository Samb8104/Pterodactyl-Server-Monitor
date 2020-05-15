/* 

Pterodactyl Status Page
By Sam Barfield

Update process

*/
const config = require("../config.json");

const Log = require("./utils/log.js");
const Sql = require("./utils/sql.js");
const Req = require("./utils/req.js");
const query = require("./query/query.js");

const Logger = new Log();
const sql = new Sql();
const Request = new Req();
const Query = new query();

Logger.info("update", "Started")

//Validate tables
sql.init().then((resolve) => {

	//Get servers
	Request.getServers().then(async (resolve) => {
		
		//Add/Update each server if in config
		resolve.forEach(server => {
			config.servers.forEach(async (confServer) => {
				if (server.attributes.identifier == confServer.id) {	
					sql.selectExist("current", confServer.id).then(async (resolve) => {
						if (!resolve) {
							//Add if not in database
							await sql.add("current", {id: confServer.id, name: server.attributes.name, description: server.attributes.description, state: "0"});
						} else {
							//Update the existing record
							await sql.updateRecord("current", {id: confServer.id, name: server.attributes.name, description: server.attributes.description, state: "0"});
						}
					}, (reject) => {
						Logger.error("sql", "none", "Failed to check record exisence");
					})
				}
			})
		})

		//Add query enabled servers into query table if they are not already
		config.servers.forEach(async (confServer) => {
			if (confServer.queryInfo) {
				sql.selectExist("query", confServer.id).then(async (resolve) => {
					if (!resolve) {
						//Add if not in database
						await sql.add("query", {id: confServer.id, playersOn: 0, playersMax: 0, version: "None", players: "None"});
					}
				})
			}
		})

		//Remove servers that aren't in the config
		await sql.syncConfig();
		//Remove servers that aren't query enabled
		await sql.syncQueryConfig();


		//Carry out initial status pterodactyl check so we have some initial results
		//Get state of each server in config
		const statusCheck = () => {
			config.servers.forEach(async (confServer) => {
				Request.getUtilization(confServer.id).then((resolve) => {
					sql.setState(confServer.id, (JSON.parse(resolve).attributes.state == "on" ? 1 : 0));
				}, (reject) => {
					Logger.error("update", "none", `Failed to fetch state of ${confServer.id}`);
				})
			})
		}

		//Carry out initial query check so we have some initial results
		const queryCheck = () => {
			Query.sendAll().then((resolve) => {
				resolve.forEach((queryData) => {
					sql.updateRecord("query", queryData);
				})
			})
		}

		statusCheck();
		queryCheck();

		//Begin updater clock
		const updateClock = setInterval(() => { 
			statusCheck();
			queryCheck();
			process.send("update");
		}, config.updateInterval)

	}, (reject) => {
		Logger.error("update", "none", "Failed to fetch servers, cannot contune");
		process.exit(1)
	})

}, (reject) => {
	Logger.error("update", "none", "Failed to validate, cannot continue");
	process.exit(1);
})

process.on("message", (message) => {
	if (message == "shutdown") {
		sql.close();
		clearInterval(updateClock);
		process.exit(0)
	}
})
