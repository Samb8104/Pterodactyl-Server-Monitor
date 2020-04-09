const update = async (interval) => {
	
	let initialUpdate = await fetch("/api/status");
	let initialResponse = await initialUpdate.json();
	let tableData = {}
	
	initialResponse.forEach((res, index, array) => {
		
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

		let date = new Date(initialResponse.lastUpdated)
		document.getElementById("lastUpdated").innerHTML = `Last updated: ${date.toString()}`

	})
	
	setInterval(async () => {
		
		let intUpdate = await fetch("/api/status");
		let intResponse = await intUpdate.json();
		
		intResponse.forEach((res) => {
			
			tableData[res.id].name.innerHTML = `${res.name}`
			tableData[res.id].description.innerHTML = `${res.description}`
			tableData[res.id].state.innerHTML = `${res.state == 1 ? "Online" : "Offline"}`
			
			if (res.state == 1) { tableData[res.id].state.style.color = "#7fff7f"}
			else { tableData[res.id].state.style.color = "red"}
			
		})
		
		let date = new Date(intResponse.lastUpdated)
		document.getElementById("lastUpdated").innerHTML = `Last updated: ${date.toString()}`

		console.log("Updated")
		
	}, interval)
	
}

update(60000)