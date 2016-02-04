"use strict";

var StoreFactory = require("../core/StoreFactory");
var Symbols = require("../core/Symbols");
var Convention = require("../core/Convention");

var ProcessingStore = StoreFactory.Create({
    getHandlers: function() {
        var _setStart = function(name) {
            return function(action) {
                this.set(name, { running: true });
            };
        };

        var _setSuccess = function(name) {
            return function(action) {
                this.set(name, { running: false, success: true });
            };
        };

        var _setFailer = function(name) {
            return function(action) {
                this.set(name, { running: false, success: false });
            };
        };

        var _handlers = {};
        _handlers[Symbols.GetUserExistenceStatus] = _setStart(Symbols.GetUserExistenceStatus);
        _handlers[Convention.Fails(Symbols.GetUserExistenceStatus)] = _setFailer(Symbols.GetUserExistenceStatus);
        _handlers[Convention.Success(Symbols.GetUserExistenceStatus)] = _setSuccess(Symbols.GetUserExistenceStatus);

        return _handlers;
    }
});

module.exports = ProcessingStore;
