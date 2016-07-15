'user strict';

const jsonFile = require('jsonfile');
const userhome = require('userhome');
const fs = require('fs');

var template = {
    'user': '',
    'token': ''
}

function getGisterConfigPath() {
    return userhome('.gister-github.json');
};

function createGisterConfig() {
    let path = getGisterConfigPath();

    fs.access(path, fs.OK, function (error) {
        if (error && error.code === 'ENOENT') {
            jsonFile.writeFile(path, template, function (error) {
                if (error) {
                    console.log(error);
                }
            });
        }
    });
};

function getGisterConfig() {
    return new Promise(function (resolve, reject) {
        let path = getGisterConfigPath();
        jsonFile.readFile(path, function (error, config) {
            if (error) {
                reject(err);
            }

            resolve(config);;
        });
    });
};

getGisterConfig().then((config) => { console.log(config)});
