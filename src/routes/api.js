/* 

Pterodactyl Status Page
By Sam Barfield

API Router

*/
const express = require('express');
const router = express.Router();
const config = require("../../config.json");

const Log = require("../utils/log.js");
const Sql = require("../utils/sql.js");
const Logger = new Log();
const sql = new Sql();

//Status page api
router.get("/api/status", (req, res) => {
    //Get all current records
    sql.getAll("current").then((Cresolve) => {
        Cresolve.forEach(server => {
            //Override descriptions if necessary
            config.servers.forEach(override => {
                if (server.id == override.id) {
                    if (typeof override.description !== "undefined") {
                        server.description = override.description;
                    }
                }
            })
        })
        //Get all query records
        sql.getAll("query").then((Qresolve) => {
            if (Qresolve.length == 0) {
                res.send({
                    servers: Cresolve,
                    query: Qresolve,
                    queryEnabled: false
                });
            } else {
                res.send({
                    servers: Cresolve,
                    query: Qresolve,
                    queryEnabled: true
                });
            }
        }, (reject) => {
            Logger.error("web/api", "none", "Failed to get current records");
            res.send({
                error: true
            })
        })
    }, (reject) => {
        Logger.error("web/api", "none", "Failed to get current records");
        res.send({
            error: true
        })
    })
})

module.exports = router;