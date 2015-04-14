/*global require module*/
var q = require("q");
var __ = require('underscore');
var Logger = require('./logger');
var EvaluatedNode = require('./evaluated-node');

var CompiledNode = function (mapper, logger, parent, name) {
    var logger = new Logger(logger || parent && parent.logger);
    if (name) {
        logger.pushContextProperty('path', '' + name);
    }

    this.mapper = mapper || parent && parent.mapper;
    this.logger = logger;
    this._setParent(parent);
    this.name = name;
    this.children = {};
    this.newContent();
    this._evaluate = this._evaluatePassthrough;
}

CompiledNode.prototype = {
    _copy: function (parent, name) {
        var copy = __.clone(this);
        copy.newContent();
        var keys = Object.keys(this.children);
        for (var i = 0, n = keys.length; i < n; i++) {
            var key = keys[i];
            this.children[key]._copy(copy, key);
        }
        copy.name = name;
        parent.children[name] = copy;
        parent.content[name] = copy.content;
        return copy;
    },

    copy: function (parent, name) {
        var copy = this._copy(parent, name);
        copy._setParent(parent);
        return copy;
    },

    _setParent: function (parent) {
        var ancestors = parent && parent.ancestors || [];
        this.ancestors = ancestors.concat([this]);

        if (this.children) {
            var keys = Object.keys(this.children);
            for (var i = 0, n = keys.length; i < n; i++) {
                var key = keys[i];
                var child = this.children[key];
                child._setParent(this);
            }
        }
    },

    newContent: function () {
        return this.setContent((this.children instanceof Array) ? [] : {});
    },

    setContent: function (content) {
        if (typeof(content) === 'function') {
            this.content = content.bind(this);
        }
        else {
            this.content = __.clone(content);
        }
        Object.defineProperty(this.content, '_', {
            enumerable: false,
            configurable: true,
            get: this.getEvaluatedContent.bind(this),
            set: this.bindInstanceNode.bind(this)
        });
        return this.content;
    },

    setIsRequired: function (isRequired) {
        this.isRequired = isRequired;

        for (var i = this.ancestors.length - 2; i >= 0; i--) {
            var item = this.ancestors[i];
            if (item.isRequired !== undefined) {
                break;
            }
            item.isRequired = isRequired;
        }
    },

    _getBoundAncestorIndex: function () {
        var ancestors = this.ancestors;
        var index
        for (index = ancestors.length - 1; index >= 0 && ancestors[index].instanceNode === undefined; index--) {}
        return index;
    },

    _getBoundAncestor: function () {
        var boundNode = this.ancestors[this._getBoundAncestorIndex()];
        return boundNode;
    },

    getEvaluatedNode: function () {
        var boundNodeIndex = this._getBoundAncestorIndex();
        var evaluatedNode;
        if (boundNodeIndex >= 0) {
            for (var i = boundNodeIndex, n = this.ancestors.length; i < n; i++) {
                var compiledNode = this.ancestors[i];
                if (compiledNode.evaluatedNode) {
                    evaluatedNode = compiledNode.evaluatedNode;
                }
                else if (evaluatedNode) {
                    evaluatedNode = evaluatedNode.children[compiledNode.name];
                }
            }
        }
        return evaluatedNode;
    },

    _randomPause: function (timeMin, timeMax) {
        var pauseSpread = (timeMax - timeMin);
        var pauseTime = pauseSpread ? Math.max(Math.random() * pauseSpread + timeMin, 0) : timeMin;
        return pauseTime
    },

    evaluate: function (mapper, logger, parent, name, instanceNode, requiredOnly) {
        var self = this;
        var logger = new Logger(logger);
        var pauseTimeMin = self.pause && self.pause.timeMin || 0;
        var pauseTimeMax = self.pause && self.pause.timeMax || pauseTimeMin;
        var pauseTime = this._randomPause(pauseTimeMin, pauseTimeMax);
        if (name !== '')
        {
            logger.pushContextProperty('path', '' + name);
        }

        var evaluatedNode = this.getEvaluatedNode();

        if (evaluatedNode) {
            if (evaluatedNode.promise) {
                return evaluatedNode.promise;
            }
            else {
                return q().then(function () {
                    return evaluatedNode;
                });
            }
        }
        else {
            var defer = q.defer();

            setTimeout(function () {
                var evaluation;
                if (instanceNode === null || instanceNode === undefined) {
                    evaluation = self._evaluateNull();
                }
                else {
                    evaluation = self._evaluate(mapper, logger, parent, name, instanceNode, requiredOnly);
                }

                evaluation.then(function (evaluated) {
                    defer.resolve(evaluated);
                });
            }, pauseTime);

            return defer.promise;
        }
    },

    getEvaluatedContent: function () {
        var defer = q.defer();
        var self = this;
        var requiredOnly = false;
        if (this.instanceNode === undefined) {
            var top = this._getBoundAncestor();
            top.evaluate(top.mapper, top.logger, null, 'top', top.instanceNode)
            .then(function (result) {
                top.evaluatedNode = result;
                return self.evaluate(self.mapper, self.logger, null, 'mid', self.instanceNode);
            })
            .then(function (result) {
                result.promise = defer.promise;
                defer.resolve(result);
            });
        }
        else {
            self.evaluate(this.mapper, this.logger, null, '', this.instanceNode)
            .then(function (result) {
                result.promise = defer.promise;
                defer.resolve(result);
            });
        }
        return defer.promise.then(function (result) {
            return result.content;
        });
    },
    
    bindInstanceNode: function (instanceNode) {
        this.instanceNode = instanceNode;
    },
    
    _evaluateNull: function(mapper, logger, parent, name, instanceNode, requiredOnly) {
        var evaluated = new EvaluatedNode(this);
        evaluated.content = null;
        return q().then(function () {
            return evaluated;
        });
    },

    _evaluatePassthrough: function(mapper, logger, parent, name, instanceNode, requiredOnly) {
        var evaluated = new EvaluatedNode(this);
        evaluated.content = instanceNode;
        return q().then(function () {
            return evaluated;
        });
    }
}

module.exports = CompiledNode;
