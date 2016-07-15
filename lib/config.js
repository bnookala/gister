'user strict';

const jsonFile = require('jsonfile');
const userhome = require('userhome');
const fs = require('fs');

let template = {
    'user': '',
    'token': ''
}

let gisterConfig = undefined;

function getGisterConfigPath() {
    return userhome('.gister-github.json');
};

function createGisterConfig(user, authToken) {
    return new Promise(function (resolve, reject) {
        let path = getGisterConfigPath();

        let onResolve = function (config) {
            resolve(config);
        };

        let onReject = function (error) {
            if (error && error.code === 'ENOENT') {
                jsonFile.writeFile(path, template, function (error) {
                    if (error) {
                        console.log(error);
                        reject(error);
                    }

                    resolve(template);
                });
            }
        };

        getGisterConfig().then(onResolve, onReject);
    });
};

function getGisterConfig() {
    return new Promise(function (resolve, reject) {
        let path = getGisterConfigPath();
        jsonFile.readFile(path, function (error, config) {
            if (error) {
                reject(error);
            }

            gisterConfig = config;
            resolve(config);
        });
    });
};

createGisterConfig().then((config) => {console.log(config)}, (error) => {console.log(error)});

module.exports = {
    gisterConfig,
    getGisterConfig,
    createGisterConfig
}