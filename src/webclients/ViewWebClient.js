"use strict";

var _ = require('lodash');
var Promise = require('promise/lib/es6-extensions');
// var qwest = require("qwest");

var ViewWebClient = {
    GetUserExistenceStatus: function(username) {
        return new Promise(function (resolve, reject) {
            _.delay(function() {
                if (_.isEmpty(username)) reject("nothing to check! (fake request)");
                else resolve({ data: { username: username, exists: username !== "misha" } });
            }, 1000);
        });
        // return qwest.get(
        //     _.template("http://localhost:3001/api/user/exists/${username}/")({username: username})
        // );
    }
};

module.exports = ViewWebClient;
