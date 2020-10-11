'use strict';

/*
 * Created with @iobroker/create-adapter v1.29.1
 */


const utils = require('@iobroker/adapter-core');
const axios = require('axios');

class Defro extends utils.Adapter {

    constructor(options) {
        super({
            ...options,
            name: 'defro',
        });

        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
        this.killTimeout = null;
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {

        const self = this;

        // read config
        const defroUserID = this.config.userID;
        const defroToken = this.config.token;
        const defroUDID = this.config.udid;

        // log config
        this.log.info('UserID: ' + defroUserID);
        this.log.info('Token: ' + defroToken);
        this.log.info('Token: ' + defroUDID);

        // create JSON data point
        await this.setObjectNotExistsAsync('JSON', {
            type: 'state',
            common: {
                name: 'JSON',
                type: 'string',
                role: 'text',
                read: true,
                write: true,
            },
            native: {},
        });

        // get data from API
        await axios({
            method: 'get',
            baseURL: 'https://emodul.eu/api/v1/users/',
            url: defroUserID + '/modules/' + defroUDID,
            headers: { Authorization: 'Bearer ' + defroToken },
            responseType: 'json'
        }).then(function (response){
            // log and store received data
            self.log.info('received data (' + response.status + '): ' + JSON.stringify(response.data));
            self.setState('JSON', {val: JSON.stringify(response.data)}, true);

            // get data from JSON and convert to datapoinst with values
            var key;
            for (let objIndex = 0; response.data.tiles.length; objIndex++) {
                if (typeof response.data.tiles[objIndex] !== 'undefined') {
                    const bodyObj = response.data.tiles[objIndex];
                    for (key in bodyObj) {
                        if (user.hasOwnProperty(key)) {
                            self.log.info(key + " = " + bodyObj[key]);
                        }
                    }
                }
            }    
        });

        this.killTimeout = setTimeout(this.stop.bind(this), 10000);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);

            callback();
        } catch (e) {
            callback();
        }
    }
}

if (module.parent) {
    module.exports = (options) => new Defro(options);
} else {
    new Defro();
}