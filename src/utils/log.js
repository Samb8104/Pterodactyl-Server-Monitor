/* 

Pterodactyl Status Page
By Sam Barfield

Logging Utilties

*/
class Log {

    getTime() {
        let time = new Date();
        return `[${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}>${time.getHours() + 1}:${time.getMinutes() + 1}:${time.getSeconds() + 1}]`;
    }

    //Error logging
    error(process, code, message) {

        console.error(`${this.getTime()} Error (${process}) Code: ${code}: ${message}`);

    }

    //Info logging
    info(process, message) {

        console.log(`${this.getTime()} Info (${process}) ${message}`);

    }

}

module.exports = Log;