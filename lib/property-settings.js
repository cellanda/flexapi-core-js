/*global require module*/
var __ = require('underscore');
module.exports = PropertySettings;

function PropertySettings(origin) {
    var getters = {};
    var waiters = {};

    // clone the origin
    if (origin) {
        var keys = Object.keys(origin.getters);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            getters[key] = origin.getters[key];
        }
        keys = Object.keys(origin.waiters);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            waiters[key] = origin.waiters[key];
        }
    }

    function addGetter(name) {
        var parameters = {};
        var parametersBuilder = {
            call: function (fnGet) {parameters.fnGet = fnGet; return this},
            unique: function () {parameters.isUnique = true; return this; }
        };
        this.getters[name] = parameters;
        return parametersBuilder;
    }

    function addWaiter(name) {
        var parameters = {};
        var parametersBuilder = {
            call: function (fnGet) {parameters.fnGet = fnGet; return this}
        };
        this.waiters[name] = parameters;
        return parametersBuilder;
    }


    var _public = {
        getters: getters,
        waiters: waiters,

        onGet: function (name) {
            return addGetter.call(this, name);
        },

        onWait: function (name) {
            return addWaiter.call(this, name);
        }

    };


    return _public;

}
