'use strict';

const github = require('github');
const auth = require('../lib/auth.js');
const config = require('../lib/config.js');

let githubClient = new github({});

function onRejection (error) {
    throw error;
};

function onConfigResolution (config) {
    console.log(config);
}

function onMissingConfig (error) {
    if (error && error.code === 'ENOENT') {
        auth.createAuthorization(githubClient)
            .then(config.createGisterConfig)
            .then(onConfigResolution)
            .catch(onRejection);
    }
}

config.getGisterConfig().then(
    onConfigResolution,
    onMissingConfig
).catch(onRejection);