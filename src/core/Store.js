"use strict";

var _ = require("lodash");

var EventEmitter = require("events").EventEmitter;

var Validation = require("../utils/Validation");

var CHANGE_EVENT = "change";

function Store(options) {
    if(_.has(options, 'getHandlers')) {
        Validation.IsTypeOf(options, 'function', ['getHandlers']);
    } else {
        Validation.IsTypeOf(options, 'function', ['globalHandler']);
    }
    _.extend(this, options);

    EventEmitter.call(this);
    this.setMaxListeners(100);

    var _state;

    var _emit = this.emit;
    this.emit = function() {
        _emit(CHANGE_EVENT);
    };

    var _on = this.on;
    this.on = function(callback) {
        _on(CHANGE_EVENT, callback);
    };

    this.off = function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    };

    this.get = function() {
        var path = _.toArray(arguments);
        return _.cloneDeep(path.length ? _.get(_state, path) : _state);
    };

    this.set = function(state) {
        var path = _.initial(arguments);
        var value = _.last(arguments);

        if (_.any(path)) {
            _state = _state || {};
            _.set(_state, path, value);
        } else {
            _state = value;
        }
    }

    this.has = function() {
        var path = _.toArray(arguments);
        return !_.isUndefined(path.length ? _.get(_state, path) : _state);
    };
}

Store.prototype = _.create(EventEmitter.prototype, {
    "constructor": Store
});

module.exports = Store;
