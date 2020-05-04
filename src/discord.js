const Discord = require('discord.js');
const config = require("../config.json");

class Webhook {
    constructor() {
        this.hook = new Discord.WebhookClient(config.webhook.id, config.webhook.token);
    }

    sendUpdate(info) {
        this.hook.send({
            embeds: [{
                title: "Server Changed State",
                description: "A servers online status has changed!",
                color: info.state == 1 ? 5025048 : 13632027,
                fields: [{
                    name: "Server",
                    value: `ID: ${info.name}\nMemory: ${info.memUse}/${info.memCap}mb\nCPU: ${info.cpuUse}/${info.cpuCap}%\nDisk: ${info.diskUse}/${info.diskCap}mb`
                }, {
                    name: "State",
                    value: `${info.state == 1 ? "Online" : "Offline"}`
                }],
                footer: config.web.displayName
            }]
        })
    }
}

module.exports = new Webhook();