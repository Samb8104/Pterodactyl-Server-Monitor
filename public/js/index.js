let tableData = {};

fetch("/api/status").then(initialUpdate => {

	initialUpdate.json().then(initialResponse => {

		initialResponse.servers.forEach((res, index, array) => {
			
			let table = document.getElementById("statusTable");
			
			tableData[res.id] = table.insertRow(index + 1)
			tableData[res.id].name = tableData[res.id].insertCell(0)
			tableData[res.id].description = tableData[res.id].insertCell(1)
			tableData[res.id].state = tableData[res.id].insertCell(2)
			
			tableData[res.id].name.innerHTML = `${res.name}`
			tableData[res.id].description.innerHTML = `${res.description}`
			tableData[res.id].state.innerHTML = `${res.state == 1 ? "Online" : "Offline"}`
			
			if (res.state == 1) { tableData[res.id].state.style.color = "#7fff7f"}
			else { tableData[res.id].state.style.color = "red"}
		
		})
		if (initialResponse.queryEnabled) {
			initialResponse.query.forEach((query, index, array) => {

				tableData[query.id].online = tableData[query.id].insertCell(3)
				tableData[query.id].version = tableData[query.id].insertCell(4)
				tableData[query.id].players = tableData[query.id].insertCell(5)
	
				tableData[query.id].online.innerHTML = `${query.playersOn}/${query.playersMax}`
				tableData[query.id].version.innerHTML = query.version
	
			})
		}
	})

})

const update = () => {

	fetch("/api/status").then(intUpdate => {
		intUpdate.json().then(intResponse => {
			intResponse.servers.forEach((res) => {
		
				tableData[res.id].name.innerHTML = `${res.name}`
				tableData[res.id].description.innerHTML = `${res.description}`
				tableData[res.id].state.innerHTML = `${res.state == 1 ? "Online" : "Offline"}`
				
				if (res.state == 1) { tableData[res.id].state.style.color = "#7fff7f"}
				else { tableData[res.id].state.style.color = "red"}
				
				let date = new Date();
				document.getElementById("lastUpdated").innerHTML = `Last updated: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} @ [${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`
			})
			if (intResponse.queryEnabled) {
				intResponse.query.forEach((query, index, array) => {
	
					tableData[query.id].online.innerHTML = `${query.playersOn}/${query.playersMax}`
					tableData[query.id].version.innerHTML = query.version
		
				})
			}
		})
	})
	

}

	
	