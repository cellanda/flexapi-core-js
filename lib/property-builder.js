/*global require module*/
var __ = require('underscore');
var Selector = require("./selector");
var Property = require("./property");
module.exports = PropertyBuilder;

function PropertyBuilder(mapper, settings) {

    function _PropertyBuilder (_property) {


        function clone() {
            return new _PropertyBuilder(_property.clone());
        }


        var _protected = {
            _compile: function (mapper, ancestors, logger) {
                return _property._compile(mapper, ancestors, logger);
            }
        };


        var _public = {
            logger: function (logger) {
                _property.selector.addLogger(logger);
                return clone()._interfaceBasic;
            },

            log: function (text) {
                _property.selector.addLog(text);
                return clone()._interfaceBasic;
            },

            get: function (fnGet, query) {
                _property.selector.addGet('', fnGet, query);
                return clone()._interfaceWithIndexParameter;
            },

            pause: function (timeMin, timeMax) {
                _property.setPause(timeMin, timeMax);
                return clone()._interfaceBasic;
            },

            wait: function (time) {
                _property.setWait(time);
                return clone()._interfaceBasic;
            },

            module: function (module) {
                _property.module = module;
                return clone()._interfaceFinal;
            },

            content: function (content) {
                _property.module = {content: content};
                return clone()._interfaceFinal;
            }
        };


        __.each(settings.getters, function (parameters, getterName) {
            _public.get[getterName] = function (query) {
                if (parameters.isUnique) {
                    _property.selector.addGet(getterName, parameters.fnGet, query, 0);
                    return clone()._interfaceBasic;
                }
                else {
                    _property.selector.addGet(getterName, parameters.fnGet, query);
                    return clone()._interfaceWithIndexParameter;
                }
            };
        });

        
        function makePublicInterface(API) {
            Object.defineProperty(API, "required", {
                enumerable: true,
                configurable: true,
                get: function () {
                    _property.setIsRequired(true);
                    return clone()._interfaceWithRequiredParameter;
                }
            });

            Object.defineProperty(API, "optional", {
                enumerable: true,
                configurable: true,
                get: function () {
                    _property.setIsRequired(false);
                    return clone()._interfaceBasic;
                }
            });

            __.each(_public, function (member, memberName) {
                API[memberName] = member;
            });

            addProtectedInterface(API);
        }


        function addProtectedInterface(API) {
            Object.defineProperty(API, "_2a5aeccd964c4d2e92df15cb988f08ac", {
                enumerable: false,
                configurable: false,
                get: function () {
                    return _protected;
                }
            });
        }


        // create the standard version of the public API
        var _interfaceBasic = {};
        makePublicInterface(_interfaceBasic);


        // create a version of the public API following the module or content definition
        var _interfaceFinal = {};
        addProtectedInterface(_interfaceFinal);


        // create a version of the public API as a function that itself can be called to specifiy the index of a gettter
        var _interfaceWithIndexParameter = function (index) {
            _property.selector.setIndexOnLastStep(index);
            return clone()._interfaceBasic;
        }
        makePublicInterface(_interfaceWithIndexParameter);


        // create a version of the public API as a function that itself can be called to specifiy whether the property is required
        var _interfaceWithRequiredParameter = function (isRequired) {
            _property.setIsRequired(isRequired);
            return clone()._interfaceBasic;
        }
        makePublicInterface(_interfaceWithRequiredParameter);



        return {
            _interfaceBasic: _interfaceBasic,
            _interfaceWithRequiredParameter: _interfaceWithRequiredParameter,
            _interfaceWithIndexParameter: _interfaceWithIndexParameter,
            _interfaceFinal: _interfaceFinal
        };
    }


    return new _PropertyBuilder(new Property(mapper))._interfaceBasic;
}
