/*global require module*/
var Logger = require('./logger');
var PropertySettings = require('./property-settings.js');
var PropertyBuilder = require('./property-builder.js');
var Module = require('./module.js');

var Mapper = function (originMapper, logger, containingModule) {
    var _public = {
        settings: {
            property: new PropertySettings(originMapper && originMapper.settings.property),
            logger: logger || (originMapper ? originMapper.settings.logger : new Logger())
        },

        parameters: {},

        containingModule: containingModule || (originMapper ? originMapper.containingModule : null),

        clone: function () {
            return new Mapper(this);
        },

        newChild: function (logger, containingModule) {
            return new Mapper(this, logger, containingModule);
        },

        newProperty: function () {
            return new PropertyBuilder(this, this.settings.property);
        },

        compile: function (module, logger) {
            return Module(module).compile(this, logger || this.settings.logger);
        },

        evaluate: function (module, node, logger) {
            return Module(module).evaluate(this, node, logger || this.settings.logger);
        }
    };

    Object.defineProperty(_public, 'property', {
        enumerable: true,
        configurable: true,
        get: function () {
            return this.newProperty();
        }
    });

    return _public;
};


module.exports = new Mapper();
