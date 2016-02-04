"use strict";

var _ = require("lodash");

var Dispatcher = require("flux").Dispatcher;
var _dispatcher = new Dispatcher();
var _dispatch = _dispatcher.dispatch;
_dispatcher.dispatch = function(command) {
    console.log(command);
    _dispatch.apply(_dispatcher, arguments);
};

var ApiWebClient = require("../webclients/ApiWebClient");
var Validation = require("../utils/Validation");

var Convention = require("./Convention");

function Command(name) {
    Validation.IsTypeOf(name, 'string');

    var query = { name: name, args: _.rest(arguments) };
    _dispatcher.dispatch(query);

    var method = ApiWebClient[name];
    if(!_.isFunction(method)) return;

    method.apply(ApiWebClient, query.args)
        .then(function(response) {
            _dispatcher.dispatch(_.extend({}, query, { name: Convention.Success(name), response: response }));
        })
        .catch(function(error) {
            _dispatcher.dispatch(_.extend({}, query, { name: Convention.Fails(name), response: {}, error: error }));
        });
}

Command.register = function() {
    return _dispatcher.register.apply(_dispatcher, arguments);
};

Command.waitFor = function() {
    return _dispatcher.waitFor.apply(_dispatcher, arguments);
}

module.exports = Command;
