"use strict";

var _ = require('lodash');
var Promise = require('promise/lib/es6-extensions');

// var qwest = require('qwest');
// qwest.setDefaultDataType('json');

var ApiWebClient = {
    CreateUser: function(username, password) {
        return new Promise(function (resolve, reject) {
            _.delay(function() {
                if (_.isEmpty(username) || _.isEmpty(password)) reject("empty name or password! (fake request)");
                else resolve({ data: { username: username, token: "AMMA_TOKEN" } });
            }, 1000);
        });

        // return qwest.post('http://localhost:3000/api/users/create', {
        //     username: username,
        //     password: password
        // });
    },
    SignInUser: function(username, password) {
        return new Promise(function (resolve, reject) {
            _.delay(function() {
                if (_.isEmpty(username) || _.isEmpty(password)) reject("empty name or password! (fake request)");
                else resolve({ data: { username: username, token: "AMMA_TOKEN" } });
            }, 1000);
        });

        // return qwest.post('http://localhost:3000/api/users/login', {
        //     username: username,
        //     password: password
        // });
    }
};

module.exports = ApiWebClient;
