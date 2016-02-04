'use strict';

var StoreFactory = require('../core/StoreFactory');
var Symbols = require('../core/Symbols');

var RouteStore = StoreFactory.Create({
    getHandlers: function () {
        var _set = function(command) {
            this.set('route', command.route);
        };

        var handlers = {};
        handlers[Symbols.ChangeRoute] = _set;

        return handlers;
    }
});

module.exports = RouteStore;
