/*global require module*/
var __ = require('underscore');
var q = require('q');
var async = require('async');
var Logger = require('./logger');
var Selector = require('./selector');
var Module = require('./module');
var CompiledNode = require('./compiled-node');
var EvaluatedNode = require('./evaluated-node');

module.exports = Property;


var _51987af75e134a39ac63d1a1824337f7 = {
    evaluateUnique: function(mapper, logger, parent, name, instanceNode, requiredOnly) {
        var self = this;
        var evaluated = new EvaluatedNode(this);

        logger.mapSeverity('fail', this.isRequired ? 'fail' : 'info');
        return this.selector.evaluate(instanceNode, this.isRequired, logger)
        .then(function (childNode) {
            return self.module.evaluate(mapper, logger, evaluated, '', childNode);
        })
        .then(function (child) {
            evaluated.content = child.content;
            evaluated.isMissing = (evaluated.content === null && self.isRequired);
            return evaluated;
        })
    },

    evaluateList: function(mapper, logger, parent, name, instanceNode, requiredOnly) {
        var self = this;
        var defer = q.defer();
        var evaluated = new EvaluatedNode(this);

        logger.mapSeverity('fail', this.isRequired ? 'fail' : 'info');
        this.selector.evaluate(instanceNode, this.isRequired, logger)
        .then(function (childNodes) {
            if (childNodes.length === 0) {
                evaluated.isMissing = (self.isRequired);
                evaluated.content = evaluated.isMissing ? null : [];
                defer.resolve(evaluated);
            }
            else if (self.index !== undefined) {
                var childNode = childNodes[self.index];
                childNode = childNode === undefined ? null : childNode;
                self.module.evaluate(mapper, logger, evaluated, '', childNode)
                .then(function (child) {
                    evaluated.content = child.content;
                    evaluated.isMissing = (evaluated.content === null && self.isRequired);
                    defer.resolve(evaluated);
                });
            }
            else {
                evaluated.children = [];
                evaluated.content = [];
                logger.mapSeverity('fail', 'info');
                async.each(
                    Object.keys(childNodes),
                    function (key, done) {
                        self.module.evaluate(mapper, logger, evaluated, key, childNodes[key])
                        .then(function (child) {
                            if (child.content !== null) {
                                evaluated.children.push(child);
                                evaluated.content.push(child.content);
                            }
                            done();
                        });
                    },
                    function (err) {
                        evaluated.isMissing = (evaluated.content.length === 0 && this.isRequired);
                        evaluated.content = evaluated.isMissing ? null : evaluated.content;
                        defer.resolve(evaluated);
                    }
                );
            }
        });
        return defer.promise;
    },
    
    moduleList: function (index) {
        var child = this.children[index];
        if (!child) {
            var child = this.children[index] = this.module.copy(this, index);
        }
        return child.content;
    }

};


/*------------------------------------------------------------------------------
A module contains 0, 1 or more properties
    A property contains 0 or 1 selector and referes to 0 or 1 module
------------------------------------------------------------------------------*/
function Property(mapper) {
    var helper = _51987af75e134a39ac63d1a1824337f7;
    var isRequired = false;
    var wait = {
        fnWait: null,
        time: 0
    };
    var pause = {
        timeMin: 0,
        timeMax: 0
    };

    function _compile(parent, name) {
        var compiled = new CompiledNode(null, null, parent, name);
        compiled.setIsRequired(isRequired);
        compiled.selector = _public.selector;
        compiled.module = Module(_public.module)._compile(compiled, name);
        compiled.pause = pause;

        if (compiled.selector.$isArray) {
            compiled.setContent(helper.moduleList);
            compiled._evaluate = helper.evaluateList;
        }

        else {
            compiled.setContent(compiled.module.content);
            compiled._evaluate = helper.evaluateUnique;
        }

        return compiled;
    }


    function compile(mapper, logger) {
        var compiled = new CompiledNode(mapper, logger);
        return _compile(compiled, '');
    }


    var _public = {
        $isProperty: true,

        selector: new Selector(),

        module: undefined,

        clone: function () {
            var clone = new Property(mapper);
            clone.selector = this.selector.clone();
            clone.module = this.module;
            clone.setIsRequired(isRequired);
            clone.setPause(pause.timeMin, pause.timeMax);
            return clone;
        },

        setPause: function (timeMin, timeMax) {
            pause.timeMin = timeMin;
            pause.timeMax = timeMax;
            return this;
        },

        setWait: function (name, fnWait, time) {
            wait.fnWait = fnWait;
            wait.time = time;
            return this;
        },

        setIsRequired: function (bool) {
            isRequired = bool;
            return this;
        },

        compile: function (mapper, logger) {
            return compile(mapper, logger).content;
        },

        _compile: function (parent, name) {
            return _compile(parent, name);
        }
    };


    return _public;
}

