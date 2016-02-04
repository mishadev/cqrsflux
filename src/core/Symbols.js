"use strict";

var _ = require("lodash");

var Symbols = [
    "CreateUser",
    "SignInUser",

    "GetUserExistenceStatus"
];

module.exports = _.mapKeys(Symbols, _.indentity);
