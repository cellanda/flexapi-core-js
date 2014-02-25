/*global require module*/
var q = require("q");
var async = require("async");
var Logger = require('./logger');

module.exports = Module;

function Module(source) {
    var module = source;

    function getSourceModule(source, node) {
        var selector;

        function _getSourceModule(source) {
            return q(source).then(function (source) {
                if (source) {
                    if (source.$isSelector) {
                        selector = source.factorySelector;
                        return _getSourceModule(source.$module);
                    }
                    if (typeof(source) === 'function') {
                        return _getSourceModule(source(selector, node));
                    }
                    if (typeof(source.getData) === 'function') {
                        return _getSourceModule(source.getData(selector, node));
                    }
                }
                return source;
            });
        }

        return _getSourceModule(source);
    }

    function evaluate(node, logger) {
        function _evaluate(parentNode, name, module, logger, context) {
            var _evaluate_defer = q.defer();
            var selector;
            var result;
            logger = new Logger(logger);
            if (name !== '')
            {
                logger.pushContextProperty('path', '' + name);
            }

            if (module === undefined || module === null) {
                _evaluate_defer.resolve({$node: parentNode});
            }

            else if (module.$isModule) {
                module.evaluate(parentNode, logger).then(_evaluate_defer.resolve);
            }

            else if (module.$isSelector && module.$isArray) {
                selector = module;
                module = new Module(selector);
                result = [];
                result.$node = [];
                logger.mapSeverity('fail', selector.$isRequired ? 'fail' : 'info');
                selector.evaluate(parentNode, logger)
                .then(function (nodes) {
                    var defer = q.defer();
                    if (selector.$module) {
                        logger.mapSeverity('fail', 'info');
                        async.each(
                            Object.keys(nodes),
                            function (key, done) {
                                _evaluate(nodes[key], key, module, logger, context).then(function (child) {
                                    if (child !== null) {
                                        result.push(child);
                                        result.$node.push(nodes[key]);
                                    }
                                    done();
                                });
                            },
                            function (err) {
                                logger.mapSeverity('fail', selector.$isRequired ? 'fail' : 'info');
                                defer.resolve(result);
                            }
                        );
                    }
                    else {
                        result.$node = nodes;
                        defer.resolve(result);
                    }
                    return defer.promise;
                })
                .then(function (result) {
                    if (result.$node.length === 0 && selector.$isRequired) {
                        logger.fail('nothing found', parentNode);
                        context.hasMissingNode = true;
                    }
                    if (selector.$asValue) {
                        result = result.$node;
                    }
                    _evaluate_defer.resolve(result);
                });
            }

            else if (module.$isSelector) {
                selector = module;
                module = new Module(selector);
                logger.mapSeverity('fail', selector.$isRequired ? 'fail' : 'info');
                selector.evaluate(parentNode, logger)
                .then(function (node) {
                    return _evaluate(node, '', module, logger, context);
                })
                .then(function (result) {
                    if ((result === null || result.$node === null) && selector.$isRequired) {
                        context.hasMissingNode = true;
                    }
                    if (selector.$asValue) {
                        result = result.$node;
                    }
                    _evaluate_defer.resolve(result);
                });
            }

            else if (typeof(module) === 'object') {
                result = (module instanceof Array) ? [] : {};
                result.$node = parentNode;

                async.each(
                    Object.keys(module),
                    function (key, done) {
                        _evaluate(parentNode, key, module[key], logger, context).then(
                            function (child) {
                                result[key] = child;
                                done();
                            }
                        );
                    },
                    function (err) {
                        _evaluate_defer.resolve(result);
                    }
                );
            }

            else {
                _evaluate_defer.resolve(module);
            }

            return _evaluate_defer.promise;
        }

        var context = {};
        return q().then(function () {
            return getSourceModule(module, node);
        })
        .then(function (module) {
            return _evaluate(node, '', module, logger, context);
        })
        .then(function (result) {
            result = context.hasMissingNode ? null : result;
            return result;
        });
    }


    return {
        $isModule: true,
        logger: null,

        getData: function () {
            return module;
        },

        evaluate: function (node, logger) {
            return evaluate.call(this, node, logger || this.logger);
        },

        setLogger: function (val) {
            this.logger = val;
            return this;
        }
    };
}

