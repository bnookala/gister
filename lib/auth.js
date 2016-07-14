'use strict';

const inquirer = require('inquirer');

function zeroLengthInputValidator(type, input) {
    return function (input) {
        if (input.length === 0) {
            return "Please input a valid " + type;
        }

        return true;
    }
}

function numericalInputValidator(input) {
    if (Number(input)) {
        return true;
    }

    return "Please input a valid two factor token";
}

function createAuthorization (github) {
    console.log('We need authorization to use your github account to create and uploads gists. Please login:');
    let basicAuthQuestions = [
        {
            type: 'input',
            message: 'Github Username:',
            name: 'user',
            validate: zeroLengthInputValidator("username"),
        },
        {
            type: 'password',
            message: 'Github Password:',
            name: 'password',
            validate: zeroLengthInputValidator("password")
        }
    ];

    inquirer.prompt(basicAuthQuestions).then((answers) => {
        github.authenticate({
            type: 'basic',
            username: answers.user,
            password: answers.password,
        });

        let payload = {
            note: 'Gister',
            note_url: 'https://github.com/bnookala/gister',
            scopes: 'gist'
        }

        github.authorization.create(payload, (err, res) => {
            let needsTwoFactorAuth = err && err.message && err.message.indexOf('OTP') > 0;
            if (needsTwoFactorAuth) {
                return requestTwoFactorAuthorization(github, payload);
            }

            if (err) {
                console.log('Bad Password');
                process.exit(1);
                return;
            }

            console.log('succeeded');
        });
    })
};

function requestTwoFactorAuthorization (github, payload) {
    let twoFactorQuestion = [{
        type: 'input',
        message: 'Two Factor Code:',
        name: 'code',
        validate: numericalInputValidator
    }];

    inquirer.prompt(twoFactorQuestion).then((answer) => {
        if (!payload.headers) {
            payload.headers = [];
        }

        payload.headers['X-GitHub-OTP'] = answer.code;

        github.authorization.create(payload, function (err, res) {
            let twoFactorAuthError = err && err.message && (err.message.indexOf('Must specify two-factor authentication OTP code.') > 0);

            if (twoFactorAuthError) {
                console.log('The two factor code you provided is not valid.');
                process.exit(1);
            }
        });
    });
};

module.exports = {
    createAuthorization: createAuthorization,
}