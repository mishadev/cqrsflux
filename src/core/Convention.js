"use strict";

var Validation = require("../utils/Validation");

var Convention = {
    Fails: function(name) {
        Validation.IsTypeOf(name, 'string');
        return name + "Fails";
    },
    Success: function(name) {
        Validation.IsTypeOf(name, 'string');
        return name + "Success";
    }
}

module.exports = Convention;
