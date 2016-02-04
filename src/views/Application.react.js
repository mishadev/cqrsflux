"use strict";

var React = require("react");

var Component = require("../core/Component");

var UserTokenStore = require("../stores/UserTokenStore");

var SignIn = require("./SignIn.react");

var Application = Component.Create(UserTokenStore, {
    getState: function() {
        return {
            token: UserTokenStore.get("token")
        };
    },

    render: function() {
        return this.state.token ?
            (<div>amma some secret page</div>) :
            (<SignIn />);
    }
});

module.exports = Application;
