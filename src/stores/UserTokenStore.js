"use strict";

var StoreFactory = require("../core/StoreFactory");
var Symbols = require("../core/Symbols");
var Convention = require("../core/Convention");

var UserTokenStore = StoreFactory.Create({
    getHandlers: function() {
        var _set = function(action) {
            this.set("token", action.response.data.token);
        };

        var _handlers = {};
        _handlers[Convention.Success(Symbols.SignInUser)] = _set;
        _handlers[Convention.Success(Symbols.CreateUser)] = _set;

        return _handlers;
    }
});

module.exports = UserTokenStore;
