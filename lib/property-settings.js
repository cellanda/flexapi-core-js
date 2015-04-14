/*global require module*/
var __ = require('underscore');
module.exports = PropertySettings;

function PropertySettings() {

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
        getters: {},
        waiters: {},

        onGet: function (name) {
            return addGetter.call(this, name);
        },

        onWait: function (name) {
            return addWaiter.call(this, name);
        }

    };


    return _public;

}
