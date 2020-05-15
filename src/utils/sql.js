/* 

Pterodactyl Status Page
By Sam Barfield

SQL Utilties

*/
const config = require("../../config.json");
const mysql = require("mysql");

const Log = require("./log.js");
const Logger = new Log();

class Sql {

    constructor() {

        this.credentials = config.mysql;
        this.quitOnFatal = true;
        this.pool = mysql.createPool(this.credentials);

    }

    //Comprehend error
    checkError(error) {
        if (error) { 
            if (error.fatal) {
                if (this.quitOnFatal) {
                    Logger.error("sql", error.code, error.message);
                    process.exit(1);
                } else {
                    return true;
                }
            }
            else if (error.sqlMessage) {
                Logger.error("sql", error.code, error.sqlMessage);
                return true;
            }
            else {
                Logger.error("sql", error.code, error.message)
                return true;
            }
        }
    }

    //Validate and setup SQL
    init() {
        return new Promise((resolve, reject) => {
            //Current information table
            this.pool.query("CREATE TABLE IF NOT EXISTS current (id VARCHAR(20) NOT NULL, name VARCHAR(200) NOT NULL, description VARCHAR(500) NOT NULL, state BOOLEAN NOT NULL)", (error, results, fields) => {
                if (this.checkError(error)) { reject() }
                else {
                    //Query information table
                    this.pool.query("CREATE TABLE IF NOT EXISTS `query` ( `id` VARCHAR(20) NOT NULL, `playersOn` INT NOT NULL, `playersMax` INT NOT NULL, `version` VARCHAR(255), `players` TEXT);", (error, results, fields) => {
                        if (this.checkError(error)) { reject() }
                        else { 
                            Logger.info("sql","Validated tables")
                            resolve() 
                        }
                    })
                }
            })
        })
    }

    //Remove servers that are no longer in the config
    syncConfig() {
        return new Promise((resolve, reject) => {
            this.pool.query("SELECT id FROM current", (error, results, fields) => {
                if (this.checkError(error)) { reject() }
                else {
                    if (!results) {
                        Logger.error("sync", "none", "Current table is empty, no servers to remove");
                        resolve();
                    } else {
                        
                        let remove = [];
                        let inConfig = [];
                        config.servers.forEach(server => { inConfig.push(server.id) })
                        remove = results.filter(res => {
                            if (!inConfig.includes(res.id)) { return true }
                            else { return false }
                        })

                        remove.forEach((record) => {
                            this.pool.query(`DELETE FROM current WHERE id = '${record.id}'`, (error, results, fields) => {
                                if (this.checkError(error)) { reject() }
                            })
                        })
                        Logger.info("sync", `Removed ${remove.length} servers from the database`);
                        resolve();
                    }
                }
            })
        })
    }

    //Remove servers that are no longer query enabled in the config
    syncQueryConfig() {
        return new Promise((resolve, reject) => {
            this.pool.query("SELECT id FROM query", (error, results, fields) => {
                if (this.checkError(error)) { reject() }
                else {
                    if (!results) {
                        Logger.error("syncQuery", "none", "Query table is empty, no records to remove");
                        resolve();
                    } else {

                        let remove = [];
                        let inConfig = [];
                        config.servers.forEach(server => {
                            if (server.queryInfo) { inConfig.push(server.id) }
                        })

                        remove = results.filter(res => {
                            if (!inConfig.includes(res.id)) { return true }
                            else { return false }
                        })

                        remove.forEach((record) => {
                            this.pool.query(`DELETE FROM query WHERE id = '${record.id}'`, (error, results, fields) => {
                                if (this.checkError(error)) { reject() }
                            })
                        })
                        Logger.info("syncQuery", `Removed ${remove.length} query records from the database`);
                        resolve();
                    }
                }
            })
        })
    }

    //Create new server record
    add(table, data) {
        return new Promise((resolve, reject) => {
            switch (table) {
                case "current":
                    //Insert new record into current table
                    this.pool.query(`INSERT INTO current values('${data.id}', '${data.name}', '${data.description}', ${data.state})`, (error, results, fields) => {
                        if (this.checkError(error)) { reject() }
                        else {
                            Logger.info("sql", `Inserted into current: ${data.id}`);
                            resolve();
                        }
                    })
                    break;
                case "query":
                    //Insert new record into query table
                    this.pool.query(`INSERT INTO query values('${data.id}', '${data.playersOn}', '${data.playersMax}', '${data.version}', '${data.players}')`, (error, results, fields) => {
                        if (this.checkError(error)) { reject() }
                        else {
                            Logger.info("sql", `Inserted into current: ${data.id}`);
                            resolve();
                        }
                    })
                    break;
                default:
                    Logger.error("sql", "none", "Given invalid table, cannot create new record");
                    reject();
            }
        })
    }

    //Check if a record exists
    selectExist(table, id) {
        return new Promise((resolve, reject) => {
            switch(table) {
                case "current":
                    //Check if record exists in current table
                    this.pool.query(`SELECT EXISTS(SELECT * FROM current WHERE id = '${id}')`, (error, results, fields) => {
                        if (this.checkError(error)) { reject() }
                        else {
                            let exists = false;
                            if (!results[0][fields[0].name] == 0) { exists = true }
                            resolve(exists);
                        }
                    })
                    break;
                case "query":
                    //Check if record exists in query table
                    this.pool.query(`SELECT EXISTS(SELECT * FROM query WHERE id = '${id}')`, (error, results, fields) => {
                        if (this.checkError(error)) { reject() }
                        else {
                            let exists = false;
                            if (!results[0][fields[0].name] == 0) { exists = true }
                            resolve(exists);
                        }
                    })
                    break;
                default:
                    Logger.error("sql", "none", "Given invalid table, cannot check existence");
                    reject();
            }
        })
    }

    //Update a record
    updateRecord(table, data) {
        return new Promise((resolve, reject) => {
            switch(table) {
                case "current":
                    //Update a record within the current table
                    this.pool.query(`UPDATE current SET name = '${data.name}', description = '${data.description}', state = ${data.state} WHERE id = '${data.id}'`, (error, results, fields) => {
                        if (this.checkError(error)) { reject() }
                        else {
                            Logger.info("sql", `Updated record ${data.id}`);
                            resolve();
                        }
                    })
                    break;
                case "query":
                    //Update a record within the query table
                    this.pool.query(`UPDATE query SET playersOn = '${data.playersOn}', playersMax = '${data.playersMax}', version = '${data.version}', players = '${data.players}' WHERE id = '${data.id}'`, (error, results, fields) => {
                        if (this.checkError(error)) { reject() }
                        else {
                            Logger.info("sql", `Updated query record ${data.id}`);
                            resolve();
                        }
                    })
                    break;
                default:
                    Logger.error("sql", "none", "Given invalid table, cannot update record");
                    reject();
            }
        })
    }

    //Update record state
    setState(id, state) {
        return new Promise((resolve, reject) => {
            if (id) {
                this.pool.query(`UPDATE current SET state = ${state} WHERE id = '${id}'`, (error, results, fields) => {
                    if (this.checkError(error)) { reject() }
                    else {
                        Logger.info("sql", `Updated state of server ${id}`);
                        resolve();
                    }
                })
            } else {
                Logger.error("sql", "none", "Given invalid server id, cannot set state");
                reject();
            }
        })
    }

    //Get all server records
    getAll(table) {
        return new Promise((resolve, reject) => {
            switch(table) {
                case "current":
                    //Get all from current
                    this.pool.query("SELECT * FROM current", (error, results, fields) => {
                        if (this.checkError(error)) { reject() }
                        else {
                            resolve(results);
                        }
                    })
                    break;
                case "query":
                    //Get all from query
                    this.pool.query("SELECT * FROM query", (error, results, fields) => {
                        if (this.checkError(error)) { reject() }
                        else {
                            resolve(results);
                        }
                    })
                    break;
                default:
                    Logger.error("sql", "none", "Given invalid table, cannot retrieve records");
                    reject();

            }
        })
    }

    //Close pool
    close() {
        this.pool.end();
    }
}

module.exports = Sql;