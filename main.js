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

        const defroUserID = this.config.userID;
        const defroToken = this.config.token;
        const defroUDID = this.config.udid;

        this.log.info('UserID: ' + defroUserID);
        this.log.info('Token: ' + defroToken);

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

        await axios({
            method: 'get',
            baseURL: 'https://emodul.eu/api/v1/users/',
            url: defroUserID + '/modules/' + defroUDID,
            headers: { Authorization: 'Bearer ' + defroToken },
            responseType: 'json'
        }).then(function (response){
            self.setState('JSON', response.data, true);
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