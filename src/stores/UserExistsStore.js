"use strict";

var StoreFactory = require("../core/StoreFactory");
var Symbols = require("../core/Symbols");
var Convention = require("../core/Convention");

var UserExistsStore = StoreFactory.Create({
    getHandlers: function() {
        var _setStatus = function(action) {
            this.set(action.response.data.username, action.response.data.exists);
        };

        var _resetStatus = function(action) {
            this.set(action.response.data.username, true);
        };

        var _setFailer = function() { };

        var _handlers = {};
        _handlers[Convention.Success(Symbols.GetUserExistenceStatus)] = _setStatus;
        _handlers[Convention.Fails(Symbols.GetUserExistenceStatus)] = _setFailer;
        _handlers[Convention.Success(Symbols.CreateUser)] = _resetStatus;

        return _handlers;
    }
});

module.exports = UserExistsStore;
