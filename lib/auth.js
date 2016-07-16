'use strict';

const inquirer = require('inquirer');

function zeroLengthInputValidator (type, input) {
    return function (input) {
        if (input.length === 0) {
            return "Please input a valid " + type;
        }

        return true;
    }
}

function numericalInputValidator (input) {
    if (Number(input)) {
        return true;
    }

    return "Please input a valid two factor token";
}


function createAuthorization(github) {
    return new Promise(function (resolve, reject) {
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
                note: 'Gister ' + new Date().toString(),
                note_url: 'https://github.com/bnookala/gister',
                scopes: ['gist']
            }

            github.authorization.create(payload, (err, res) => {
                let needsTwoFactorAuth = err && err.message && err.message.indexOf('OTP') > 0;
                if (needsTwoFactorAuth) {
                    return requestTwoFactorAuthorization(resolve, reject, github, answers.user, payload);
                }

                if (err) {
                    reject(err);
                }

                resolve(answers.user, res);
            });
        })
    });
};

function requestTwoFactorAuthorization (resolve, reject, github, user, payload) {
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
                reject(err);
            }

            resolve({user, res});
        });
    });
};

module.exports = {
    createAuthorization
}