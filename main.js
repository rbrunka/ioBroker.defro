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
        });

        this.killTimeout = setTimeout(this.stop.bind(this), 5000);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            if (this.killTimeout) {
                this.log.debug('clearing kill timeout');
                clearTimeout(this.killTimeout);
            }
            this.log.debug('cleaned everything up...');
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