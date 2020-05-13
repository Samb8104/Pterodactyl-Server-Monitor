const express = require('express');
const router = express.Router();

//Status page api
router.get("/api/status", (req, res) => {
	
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

module.exports = router;