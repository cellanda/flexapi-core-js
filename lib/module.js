/*global require module*/
var q = require('q');
var async = require('async');
var constants = require('./_constants');
var Logger = require('./logger');
var CompiledNode = require('./compiled-node');
var EvaluatedNode = require('./evaluated-node');


var _8a2a4f008c464f9b81b3b5f4e75772c5 = {
    evaluateValue: function(mapper, logger, parent, name, instanceNode, requiredOnly) {
        var evaluated = new EvaluatedNode(this);
        evaluated.content = this.value;
        return q().then(function () {
            return evaluated;
        });
    },

    evaluateObject: function(mapper, logger, parent, name, instanceNode, requiredOnly) {
        var self = this;
        var defer = q.defer();
        var hasMissingNode = false;
        var evaluated = new EvaluatedNode(this);
        evaluated.children = (this.children instanceof Array) ? [] : {};
        evaluated.content = (this.children instanceof Array) ? [] : {};
        async.each(
            Object.keys(self.children),
            function (key, done) {
                self.children[key].evaluate(mapper, logger, evaluated, key, instanceNode).then(function (child) {
                    evaluated.children[key] = child;
                    evaluated.content[key] = child.content;
                    hasMissingNode = hasMissingNode || child.isMissing;
                })
                .finally(function () {
                    done();
                })
            },
            function (err) {
                if (hasMissingNode) {
                    evaluated.content = null;
                    evaluated.isMissing = (self.isRequired);
                }
                defer.resolve(evaluated);
            }
        );
        return defer.promise
    }
};

module.exports = Module;


/*------------------------------------------------------------------------------
A module contains 0, 1 or more properties
    A property contains 0 or 1 selector and 0 or 1 module
------------------------------------------------------------------------------*/
function Module(source) {
    var helper = _8a2a4f008c464f9b81b3b5f4e75772c5;

    function getSource(mapper, logger) {
        function _getSource(source) {
            if (source) {
                if (typeof(source) === 'function') {
                    return _getSource(source(mapper, logger));
                }
                if (typeof(source.getSource) === 'function') {
                    return _getSource(source.getSource(mapper, logger));
                }
            }
            return source;
        }

        return _getSource(source);
    }

    function validate(mapper, instanceNode, logger) {
        return q().then(function () {
            return getSourceModule(mapper, module);
        })
        .then(function (module) {
            if (module === undefined) {
                return true;
            }
            else if (module === null) {
                return true;
            }
            else if (typeof(module.validate) === 'function') {
                return module.validate(mapper, instanceNode);
            }
            else {
                return true;
            }
        });
    }


    function __compile(parent, source, name) {
        var compiled = new CompiledNode(null, null, parent, name);

        if (source !== undefined && source !== null) {
            var content = source.content;
            
            if (content === undefined) {
                compiled.value = content;
                compiled.setIsRequired(false);
                compiled._evaluate = helper.evaluateValue;
            }

            else if (content === null) {
                compiled.value = content;
                compiled.setIsRequired(false);
                compiled._evaluate = helper.evaluateValue;
            }

            else if (content.$isModule) {
                compiled = content._compile(parent, name);
            }

            else if (content[constants.interface.compile]) {
                compiled = content[constants.interface.compile]._compile(parent, name);
            }

            else if (typeof(content) === 'object') {
                compiled._evaluate = helper.evaluateObject;
                compiled.children = (content instanceof Array) ? [] : {};
                compiled.newContent();

                var keys = Object.keys(content);

                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var child = __compile(compiled, {content: content[key]}, key);
                    compiled.children[key] = child;
                    compiled.content[key] = child.content;
                }

            }

            else {
                compiled.value = content;
                compiled.setIsRequired(false);
                compiled._evaluate = helper.evaluateValue;
            }
        }

        return compiled;
    }


    function _compile(parent, name) {
        var logger = parent.logger;
        var containingModule = parent.mapper && parent.mapper.containingModule;
        var mapper = parent.mapper && parent.mapper.newChild(logger, containingModule);

        var source = getSource(mapper, module);
        return __compile(parent, source, name);
    }


    function compile(mapper, logger) {
        var compiled = new CompiledNode(mapper, logger);
        return _compile(compiled, '');
    }


    return {
        $isModule: true,
        logger: null,

        getSource: function (mapper, logger) {
            return getSource(mapper, logger);
        },

        validate: function (mapper, instanceNode, logger) {
            return validate.call(this, mapper, instanceNode, logger || this.logger);
        },

        _compile: function (parent, name) {
            return _compile(parent, name);
        },

        compile: function (mapper, logger) {
            return compile(mapper, logger || this.logger).content;
        },

        evaluate: function (mapper, instanceNode, logger) {
            var api = this.compile(mapper, logger);
            api._ = instanceNode;
            return api._;
        },

        setLogger: function (val) {
            this.logger = val;
            return this;
        }
    };
}

