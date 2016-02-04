"use strict";

var _ = require("lodash");
var React = require("react");

var Command = require("../core/Command");
var Symbols = require("../core/Symbols");
var Query = require("../core/Query");
var Component = require("../core/Component");

var UserExistsStore = require("../stores/UserExistsStore");
var ProcessingStore = require("../stores/ProcessingStore");

var signIn = Component.Create(UserExistsStore, ProcessingStore, {
    getState: function() {
        return {
            exists: UserExistsStore.get(_.get(this.state, 'username')),
            progress: ProcessingStore.get(Symbols.GetUserExistenceStatus)
        };
    },

    componentWillMount: function(argument) {
        this._setStateDebounced = _.debounce(this.setState, 500);
    },

    componentDidUpdate: function(props, state) {
        if (this.state.username && !UserExistsStore.has(this.state.username)) {
            Query(Symbols.GetUserExistenceStatus, this.state.username);
        }

        if (!_.isEqual(_.get(state, "username"), this.state.username) && !this.state.username) {
            this.setState({ exists: null });
        }
    },

    signIn: function() {
        var password = this.refs.password.getDOMNode().value;

        Command(Symbols.SignInUser, this.state.username, password);
    },

    singUp: function() {
        var password = this.refs.password.getDOMNode().value;

        Command(Symbols.CreateUser, this.state.username, password);
    },

    _onUsernameChange: function(ev) {
        this._setStateDebounced({ username: ev.target.value });
    },

    render: function() {
        return (<div>
            <div>
                login: <input id="username"
                    onChange={this._onUsernameChange}
                    maxLength="255"
                    name="username"
                    type="text" />
                <div>{!_.get(this.state, ["progress", "running"]) && _.get(this.state, "exists") && 'already exists! (only "misha" left)'}</div>
                <div>{_.get(this.state, ["progress", "running"]) && 'in progress...'}</div>
            </div>
            <div>
                password: <input id="password" ref="password" name="password" type="password" />
            </div>
            <div>
                <button onClick={this.signIn}>Sign In</button>
            </div>
            <div>
                <button onClick={this.singUp}>Sing Up</button>
            </div>
        </div>);
    }
});

module.exports = signIn;
