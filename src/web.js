const mysql = require("mysql")
const express = require("express")
const config = require("../config.json")
const hbs = require("hbs")
const path = require("path")

//Create mysql pool
let pool = mysql.createPool(config.mysql)
let lastUpdated = 0

process.send("[Web] Started")

const app = express()

const viewsPath = path.join(__dirname, "../templates/views")

app.set("view engine", "hbs")
app.set("views", viewsPath)
app.use(express.static(path.join(__dirname, "../public")))

//Status page api
app.get("/api/status", (req, res) => {
	
	pool.query("SELECT * FROM current WHERE 1=1;", (error, results, fields) => {
	
		if (error) { 
		
			console.log(`[Web] Error: ${error}`)
			res.send({ error: true })
			
		}
		else {
			
			let serversList = []
			
			results.forEach(result => {
				
				//Override description if enabled
				if (config.descriptionOverride.enabled == true) {
					
					config.descriptionOverride.servers.forEach(server => {
								
						if (server.id == result.id) { result.description = server.replacement }
								
					})
							
					serversList.push({ id: result.id, name: result.name, description: result.description, state: result.state })
							
				} else {
							
					serversList.push({ id: result.id, name: result.name, description: result.description, state: result.state })
							
				}
				
			})
			
			res.send({servers: serversList, lastUpdated})
			
		}
	
	})
		
})

//Main status page
app.get("/", (req, res) => {
	
	res.render("index.hbs", {web: config.web, update: config.updateInterval / 1000})
	
})

process.on("message", (message) => {
	
	let args = message.split(":")
	
	switch(args[0]) {
			
		case "updated":
			lastUpdated = parseInt(args[1])
			break;
			
		case "shutdown":
			
			pool.end((err) => {
				
				app.close()
				
				process.exit(0)
				
			})
			break;
	}
	
})

//Begin listening
app.listen(config.web.port, () => console.log(`[Web] Listening on port ${config.web.port}`))
