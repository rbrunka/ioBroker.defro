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
            if (response.status !== 200) {
                self.log.error('Error');
            }
            else
            {
                self.setState('JSON', {val: JSON.stringify(response.data)}, true);
                // convert JSON to datapoints
                const jsonResponse = response.data.tiles;

                var key, subkey, objectID;
                for (let i=0; i<jsonResponse.length; i++) {
                    objectID = jsonResponse[i].id;
                    for (key in jsonResponse[i]) {
                        if (jsonResponse[i].hasOwnProperty(key)) {
                            if (key == 'params')
                            {
                                for (subkey in jsonResponse[i][key]) {
                                    if (jsonResponse[i][key].hasOwnProperty(subkey)) {
                                        console.log('subkey: ' + subkey + ": " + jsonResponse[i][key][subkey]);
                                    }
                                }
                            } else {
                                self.setObjectNotExistsAsync('data.'+ objectID +'.' + key, {
                                    type: 'state',
                                    common: {
                                        name: key,
                                        type: 'string',
                                        role: 'text',
                                        read: true,
                                        write: true,
                                    },
                                    native: {}, 
                                });
                                self.setState('data.'+ objectID +'.' + key, {val: jsonResponse[i][key], ack: true});
                            }
                        }
                    }
        
        
                }


            };
        });

        this.killTimeout = setTimeout(this.stop.bind(this), 10000);
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