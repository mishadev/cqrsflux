"use strict";

var _ = require("lodash");
var classnames = require("classnames");

var React = require("react");

var Store = require("./Store");

var RouteStore = require("../stores/RouteStore");

var Validation = require("../utils/Validation");

var _empty = _.partial(_.identity, undefined);

function Component(component, stores) {
    Validation.IsTypeOf(component, "object");
    var _component = component;

    Validation.IsArrayOfInstances(stores, Store);
    var _stores = stores;

    this.route = _.bind(RouteStore.get, RouteStore, "route");
    this.css = classnames;

    this._base = function(method, params) {
        return _.get(_component, method, _empty).apply(this, params);
    };

    if (!_.isEmpty(_stores)) {
        _stores = _.union(_stores, [RouteStore]);

        this.getInitialState = function() {
            return this._base("getInitialState") || this.getState();
        };

        this.componentDidMount = function() {
            this._base("componentDidMount");

            _.invoke(_stores, "on", this._onChange);

            this.componentDidUpdate();
        };

        this.componentWillUnmount = function() {
            this._base("componentWillUnmount");

            _.invoke(_stores, "off", this._onChange);
        };

        this.componentDidUpdate = function() {
            this._base("componentDidUpdate", _.toArray(arguments));
        };

        this.getState = function() {
            return this._base("getState", _.toArray(arguments));
        };

        this._onChange = function() {
            if(this.isMounted()) {
                this._base("_onChange");
                this.setState(this.getState());
            }
        };
    } else {
        this.shouldComponentUpdate = function(nextProp, nextState) {
            var result = this._base("shouldComponentUpdate", _.toArray(arguments));
            if (_.isBoolean(result)) return result;

            return !_.isEqual(nextProp, this.props) || !_.isEqual(nextState, this.state);
        };
    }

    //add if not exists;
    _.defaults(this, _component);
}

Component.Create = function() {
    var component = _.last(arguments),
        stores = _.initial(arguments);

    return React.createClass(new Component(component, stores));
}

module.exports = Component;
