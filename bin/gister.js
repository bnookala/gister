'use strict';

const github = require('github');
const auth = require('../lib/auth.js');

let githubClient = new github({});

auth.createAuthorization(githubClient).then((auth) => {console.log(auth)}, (error) => {console.log(error)});