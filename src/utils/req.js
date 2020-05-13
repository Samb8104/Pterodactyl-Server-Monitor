/* 

Pterodactyl Status Page
By Sam Barfield

Request utilties

*/
const config = require("../../config.json");
const request = require("request");

const Log = require("./log.js");
const Logger = new Log();

class Req {

    constructor() {

        if (typeof config.apiKey == "undefined" || typeof config.apiKeyClient == "undefined") {
            Logger.error("request", "none", "Invalid API keys in config");
            process.exit(1)
        }
        
        //Request headers
        this.headers = {
            admin: { 
	
                "Authorization": `Bearer ${config.apiKey}`,
                "Content-Type": "application/json",
                "Accept": "Application/vnd.pterodactyl.v1+json"
            
            },
            client: { 

                "Authorization": `Bearer ${config.apiKeyClient}`,
                "Content-Type": "application/json",
                "Accept": "Application/vnd.pterodactyl.v1+json"
        
            }
        }

    }

    //Check the response with errors to give understandable output
    checkResponse(response) {
        if (response) {
            if (response.statusCode == 200) {
                return false;
            } else {
                switch(response.statusCode) {
                    case 400:
                        Logger.error("request", "400", "Bad request");
                        return true;
                    case 403:
                        Logger.error("request", "403", "Pterodactyl key is invalid");
                        return true;
                    case 404:
                        Logger.error("request", "404", "Endpoint not found");
                        return true;
                    case 429:
                        Logger.error("request", "429", "Exceeded rate limit");
                        return true;
                    case 500:
                        Logger.error("request", "500", "Server responded with error");
                        return true;
                    default:
                        Logger.error("request", response.statusCode, "Error with request")
                }
            }
        } else {
            Logger.error("request", "none", "No response recieved");
            return true;
        }
    }

    //Get servers from pterodactyl
    getServers() {
        return new Promise((resolve, reject) => {
            let elapsedStart = process.hrtime();
            try {
                request({ 
                    url: `https://${config.panelDomain}/api/application/servers`, 
                    headers: this.headers.admin 
                }, (error, response, body) => {
                    if (error) {
                        Logger.error("request", error.code, error.message);
                        reject()
                    } else {
                        //Validate response
                        if (this.checkResponse(response)) { 
                            reject();
                        } else {
                            //Return response
                            let elapsedDiff = process.hrtime(elapsedStart);
                            let took = Math.floor(((elapsedDiff[0] * 1e9 + elapsedDiff[1]) / 1000) / 1000);

                            Logger.info("request", `Fetched servers from pterodactyl (${response.headers['x-ratelimit-remaining']}/${response.headers['x-ratelimit-limit']}) Took ${took}ms`);
                            let data = JSON.parse(body).data;
                            resolve(data);
                        }
                    }
                })
            } catch (error) {
                Logger.error("request", "none", `Failed to execute request: ${error.message}`);
                reject();
            }
        })
    }

    //Get server utilization
    getUtilization(id) {
        return new Promise((resolve, reject) => {
            let elapsedStart = process.hrtime();
            try {
                request({
                    url: `https://${config.panelDomain}/api/client/servers/${id}/utilization`,
                    headers: this.headers.client
                }, (error, response, body) => {
                    if (error) {
                        Logger.error("request", error.code, error.message);
                        reject();
                    } else {
                        //Validate response
                        if (this.checkResponse(response)) {
                            reject();
                        } else {
                            //Return response
                            let elapsedDiff = process.hrtime(elapsedStart);
                            let took = Math.floor(((elapsedDiff[0] * 1e9 + elapsedDiff[1]) / 1000)/ 1000);
    
                            Logger.info("request", `Fetched server utilization from pterodactyl (${response.headers['x-ratelimit-limit']}/${response.headers['x-ratelimit-limit']}) Took ${took}ms`);
                            let data = body;
                            resolve(data);
                        }
                    }
                })
            } catch (error) {
                Logger.error("request", "none", `Failed to execute request: ${error.message}`);
                reject();
            }
        })
    }

}

module.exports = Req;