/* 

Pterodactyl Status Page
By Sam Barfield

*/

try {
	
	const config = require("./config.json")
	const cp = require("child_process")
	
	let updater = cp.fork(`${__dirname}/src/update.js`)
	let lastUpdated = null
	
	//Updater listeners
	updater.on("message", (message) => { 
		
		switch(message) {
				
			case "updated":
				let time = new Date()
				web.send(`updated:${time.getTime()}`)
				break;
				
			default:
				console.log(message)
		}
	})
						 
	updater.on("error", (error) => { console.log(`[Updater] Error: ${error}`) })
	updater.on("exit", () => { console.log("[Updater] Stopped") })
	
	//Web server listeners
	let web = cp.fork(`${__dirname}/src/web.js`)
	
	web.on("message", (message) => { console.log(message) })
	web.on("error", (error) => { console.log(`[Web] Error: ${error}`) })
	web.on("exit", () =>{ console.log(`[Web] Stopped`)})
	
	//Graceful exit
	process.on("exit", () => { 
		
		web.send("shutdown:")
		updater.send("shutdown:") 
		
	})
	
	process.on("SIGINT", () => { 
		
		web.send("shutdown:")
		updater.send("shutdown:") 
		
	})
	
} catch (err) {
	
	throw `[Status] Failed to start status page: ${err}`
	
}