'use strict';

var _ = require('lodash');

var Store = require('./Store');
var Command = require('./Command');
var Query = require('./Query');

function StoreFactory() {
    var _register = function(dispatcher, store) {
        var handlers = store.getHandlers.call(store);

        return dispatcher.register(function(action) {
            if (_.isUndefined(action.name)) throw "invalid action was performed";

            var handler = handlers[action.name] || store.globalHandler;
            if (_.isFunction(handler)) {
                handler.call(store, action);
                store.emit();
            }
        });
    };

    this.Create = function(storeObject) {
        var store = new Store(storeObject);

        store.commandToken = _register(Command, store);
        store.queryToken = _register(Query, store);

        return store;
    }
}

module.exports = new StoreFactory();
