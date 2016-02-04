"use strict";

var _ = require("lodash");

function _exists(object, property) {
    if (!_.has(object, property)) {
        throw "Validation: '" + property + "' is not exists";
    }
}

function _getProperty(object, property) {
    if (_.isUndefined(property)) return object;

    _exists(object, property);
    return object[property];
}

function _inRange(value, range) {
    _exists(range, value);
}

function _isMatch(value, pattern) {
    var regexp = new RegExp(pattern);

    if(!regexp.test(value)) {
        throw "Validation: object or its property is not match";
    }
}

function _isVersion(value) {
    _isMatch(value, "^[0-9]+\.[0-9]+\.[0-9]+$");
}

function _isInstanceOf(value, type) {
    if(!(value instanceof type)) {
        throw "Validation: value is not an instance of expected type";
    }
}

function _isTypeOf(value, typeName) {
    if(_.isNaN(value) || typeof value !== typeName) {
        throw "Validation: value has wrong expected type";
    }
}

function _isTypeOfOrEmpty(value, typeName) {
    if(_.isEmpty(value)) return;

    _isTypeOf(value, typeName);
}

function _isArrayOfInstances(value, type) {
    if(!_.isArray(value)) {
        throw "Validation: array value is required to perform array of check";
    }
    _.each(value, _.curry(_isInstanceOf)(_, type));
}

function _isArrayOfType(value, typeName) {
    if(!_.isArray(value)) {
        throw "Validation: array value is required to perform array of check";
    }
    _.each(value, _.curry(_isTypeOf)(_, typeName));
}

function _isFunction(value) {
    if(!_.isFunction(value)) {
        throw "Validation: value is required to be a function";
    }
}

function _isNull(value) {
    if(!_.isNull(value)) {
        throw "Validation: value is required to be a null";
    }
}

function _create(validator) {
    return function() {
        var properties = _.last(arguments);

        if(_.isArray(properties)) {
            var target = _.first(arguments);
            var params = _.rest(_.initial(arguments));
            _.each(properties, function(property) {
                var value = _getProperty(target, property);

                validator.apply(validator, [value].concat(params));
            });
        } else {
            validator.apply(validator, arguments);
        }
    };
}

module.exports = {
    InRange: _create(_inRange),
    IsVersion: _create(_isVersion),
    IsMatch: _create(_isMatch),
    IsInstanceOf: _create(_isInstanceOf),
    IsFunction: _create(_isFunction),
    IsTypeOf: _create(_isTypeOf),
    IsTypeOfOrEmpty: _create(_isTypeOfOrEmpty),
    IsArrayOfInstances: _create(_isArrayOfInstances),
    IsArrayOfType: _create(_isArrayOfType),
    IsNull: _create(_isNull)
};
