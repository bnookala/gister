'user strict';

const jsonFile = require('jsonfile');
const userhome = require('userhome');
const fs = require('fs');

let template = {
    'user': '',
    'token': ''
}

function getGisterConfigPath() {
    return userhome('.gister-github.json');
};

function createGisterConfig(auth) {
    template['user'] = auth.user;
    template['token'] = auth.res.token;
    
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

            module.exports.gisterConfig = config;
            resolve(config);
        });
    });
};

module.exports = {
    getGisterConfig,
    createGisterConfig
}