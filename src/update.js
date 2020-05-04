const mysql = require("mysql")
const request = require("request")
const config = require("../config.json")
const Webhook = require("./discord.js")

//Create mysql pool
let pool = mysql.createPool(config.mysql)

//Signal that updater child has started
process.send("[Updater] Started")

//Initial read of server details
let headers = { 
	
	"Authorization": `Bearer ${config.apiKey}`,
	"Content-Type": "application/json",
	"Accept": "Application/vnd.pterodactyl.v1+json"

}

//Create table if it doesn't exist already
pool.query(`CREATE TABLE IF NOT EXISTS current (id VARCHAR(20) NOT NULL, name VARCHAR(200) NOT NULL, description VARCHAR(500) NOT NULL, state BOOLEAN NOT NULL)`, (error, results, fields) => {

	if (error) { console.log(`[Updater] ${error}`)}

})

try {
	
	request({ url: `https://${config.panelDomain}/api/application/servers`, headers }, (error, response, body) => {

		if (error) { console.log(`[Updater] ${error}`) }
		else {

			//Check if details about servers defined in config are already set/update
			JSON.parse(body).data.forEach((record) => {

				config.servers.forEach((id) => {

					//If found
					if (record.attributes.identifier == id) {

						//Check if it already exists in table
						pool.query(`SELECT EXISTS(SELECT * FROM current WHERE id = '${id}')`, (error, results, fields) => {

							if (error) { console.log(`[Updater] ${error}`)}
							else {

								//If it doesnt exist create record in table
								if (results[0][fields[0].name] == 0) {

									pool.query(`INSERT INTO current values('${id}', '${record.attributes.name}', '${record.attributes.description}', 0)`, (error, results, fields) => {

										if (error) { console.log(`[Updater] ${error}`)}
										else {

											console.log(`[Updater] Created new record for ${id}`)

										}

									})

								//Else update the record
								} else {

									pool.query(`UPDATE current SET name = '${record.attributes.name}', description = '${record.attributes.description}', state = 0 WHERE id = '${id}'`, (error, results, fields) => {

										if (error) { console.log(`[Updater] ${error}`)}
										else {

											console.log(`[Updater] Updated server record ${id}`)

										}

									})

								}
							}

						})

					}

				})

			})

		}


	})
	
	//Remove servers from the table if they are not in the configs
	pool.query("SELECT id FROM current WHERE 1 = 1", (error, results, fields) => {
		
		if (typeof results == "undefined" || typeof results == "null")  { results = [] } 
		
		let toRemove = results.filter(result => {
			
			if (!config.servers.includes(result.id)) { return true }
			
		})
		
		//If there are some to remove - remove them
		if (toRemove.length > 0) {
			
			toRemove.forEach(record => {
				
				pool.query(`DELETE FROM current WHERE id = '${record.id}'`, (error, results, fields) => {
					
					if (error) { console.log(`[Updater] ${error}`)} else {
						
						console.log(`[Updater] Removed server ${record.id} from database`)
						
					}
					
				})
				
			})
			
		}
		
	})

	let clientHeaders = { 

		"Authorization": `Bearer ${config.apiKeyClient}`,
		"Content-Type": "application/json",
		"Accept": "Application/vnd.pterodactyl.v1+json"

	}
	
	//Begin the updater interval
	const clock = setInterval(() => {

		//For each server is defined get state and update tables
		config.servers.forEach(id => {

			request({ url: `https://${config.panelDomain}/api/client/servers/${id}/utilization`, headers: clientHeaders}, (error, response, body) => {

				if (error) { console.log(`[Updater] ${error}`)}
				else {

					let server = JSON.parse(body)

					//Check if the state has changed (discord webhook)
					if (config.webhook.enabled) {

						pool.query(`SELECT state FROM current WHERE id = '${id}'`, (error, results, fields) => { //This doesnt need to be managed into the flow as it has no dependants
							if (error) { console.log(`[Webhook] ${error}`)}
							else {
								if (results[0].state != (server.attributes.state == "on" ? 1 : 0)) {
									//Send a webhook saying state changed
									Webhook.sendUpdate({
										state: server.attributes.state, 
										name: id,
										memUse: server.attributes.memory.current, 
										memCap: server.attributes.memory.limit,
										cpuUse: server.attributes.cpu.current,
										cpuCap: server.attributes.cpu.limit,
										diskUse: server.attributes.disk.current,
										diskCap: server.attributes.disk.limit
									})
								}
							}
						})

					}

					//Update each record with state
					pool.query(`UPDATE current SET state = ${server.attributes.state == "on" ? 1 : 0} WHERE id = '${id}'`, (error, results, fields) => {

						if (error) { console.log(`[Updater] ${error}`)}

					})
				}

			})

		})
		
		process.send("updated")

	}, config.updateInterval)

} catch (error) {
	
	console.log(`[Updater] ${error}`)
	
}

//Message handler from parent to gracefully shutdown
process.on("message", (message) => {
	
	let args = message.split(":")
	
	switch(args[0]) {
			
		case "shutdown":
			
			pool.end((err) => {
				
				clearInterval(clock)
				
				process.exit(0)
				
			})
			break;
	}
	
})
