const Query = require("mcquery");
const config = require("../../config.json");
const Log = require("../utils/log.js");

const Logger = new Log();

class query {

    constructor() {

        this.queryTimeout   = config.updateInterval / 2;
        this.serversEnabled = [];
        this.serverQueries  = {};

        //For each server with query enabled, validate the settings - then initialise query class and listeners
        config.servers.forEach(server => {
            if (server.queryInfo) {
                if (server.queryAddress) {
                    if (server.queryPort) {
                        this.serverQueries[server.id] = new Query(server.queryAddress, server.queryPort, {timeout: this.queryTimeout});
                        this.serversEnabled.push(server.id);

                        Logger.info("query", `Server ${server.id} is going to be queried`)
                    } else {
                        Logger.error("query", "none", `Server ${server.id} has queryInfo enabled but no port`)
                    }
                } else {
                    Logger.error("query", "none", `Server ${server.id} has queryInfo enabled but no address`);
                }
            }
        })

    }

    sendAll() {
        return new Promise(async (mResolve, mReject) => {
            let serverRes = [];
            let loop = new Promise((lResolve, reject) => {
                this.serversEnabled.forEach((serverId, index, array) => {
                    this.serverQueries[serverId].connect().then((resolve) => {
                        //Successfully connected
                        this.serverQueries[serverId].full_stat((error, stats) => {
                            if (error) {
                                Logger.error("query", "none", `Failed to create connection for ${serverId}: ${err.message}`);
                                serverRes.push({id: serverId, playersOn: 0, playersMax: 0, version: "None", players: "None"});
                            } else {
                                this.serverQueries[serverId].full_stat((error, stats) => {
                                    if (error) {
                                        Logger.error("query", "none", `Failed to retrieve full stats from ${serverId}: ${err.message}`);
                                        serverRes.push({id: serverId, playersOn: 0, playersMax: 0, version: "None", players: "None"});
                                        if (index == array.length -1) { lResolve() }
                                    } else {
                                        this.serverQueries[serverId].close()
                                        serverRes.push({id: serverId, playersOn: parseInt(stats.numplayers), playersMax: parseInt(stats.maxplayers), version: stats.version, players: stats.player_.length > 0 ? stats.player_.join(", ") : "None"});
                                        Logger.info("query", `Fetched query stats from ${serverId}`)
                                        if (index == array.length -1) { lResolve() }
                                    }
                                })
                            }
                        })
                    }, (reject) => {
                        //Failed to connect
                        Logger.error("query", "none", `Failed to create connection for ${serverId}: ${reject.message}`);
                        serverRes.push({id: serverId, playersOn: 0, playersMax: 0, version: "None", players: "None"});
                        if (index == array.length -1) { lResolve() }
                    })

                })
            }).then((resolve) => {
                mResolve(serverRes)
            }, (reject) => {
                Logger.error("query", "none", "Failed to loop through queries");
                mResolve(serverRes)
            })
        })
    }
}

module.exports = query;