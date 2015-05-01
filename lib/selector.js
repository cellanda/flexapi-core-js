/*global require module*/
var __ = require('underscore');
var q = require('q');
var async = require('async');
var Logger = require('./logger');
module.exports = Selector;

function Selector() {

    function clone(selector) {
        var clone = new Selector();
        var step = selector.$firstStep;
        var cloneStep;

        if (step) {
            cloneStep = clone.$firstStep = __.clone(step);
            while (step.$next) {
                cloneStep.$next = __.clone(step.$next);
                step = step.$next;
                cloneStep = cloneStep.$next;
            }
        }

        clone.$lastStep = cloneStep;

        determineIsArray(clone);
        return clone;
    }

    function addStep(selector, step) {
        if (!selector.$firstStep) {
            selector.$firstStep = step;
            selector.$lastStep = step;
        }
        else {
            selector.$lastStep.$next = step;
            selector.$lastStep = step;
        }

        determineIsArray(selector);
        return selector;
    }

    function setIndexOnLastStep (index) {
        if (this.$lastStep) {
            this.$lastStep.$index = index;
            determineIsArray(this);
        }
    }

    function determineIsArray (selector) {
        selector.$isArray = false;
        for (step = selector.$firstStep; step; step = step.$next) {
            if (step.$type === 'get' && step.$index === undefined) {
                selector.$isArray = true;
                break;
            }
        }
    }

    function addLogger(logger) {
        return addStep(this, {
            $type: 'logger',
            $logger: logger
        });
    }

    function addLog(text) {
        return addStep(this, {
            $type: 'log',
            $text: text
        });
    }

    function addGet(name, fnGet, query, index) {
        return addStep(this, {
            $type: 'get',
            $name: name,
            $fnGet: fnGet,
            $query: query,
            $index: index
        });
    }

    function get(node, step, isRequired, logger, done) {
        logger = new Logger(logger);
        logger.setDefaultSeverity(isRequired ? 'fail' : 'info');
        var result = [];

        if (node === null || node === undefined) {
            logger.log('no node', node);
        }
        else {
            try {
                step.$fnGet(node, step.$query, step.$index, logger, function (err, nodes) {
                    if (err) {
                        logger.log('exception: ' + err, node);
                    }
                    else
                    {
                        nodes = nodes || [];
                        result = __.without(nodes, null, undefined);
                        if (!result.length) {
                            logger.log('nothing found', node);
                        }
                        else if (step.$index !== undefined) {
                            if (step.$index >= result.length) {
                                logger.log('index (' + step.$index + ') exceeds maximum of ' + (result.length - 1), node);
                                result = undefined;
                            }
                            else {
                                result = [result[step.$index]];
                            }
                        }
                    }
                });
            }
            catch (ex) {
                logger.log('exception: ' + ex, node);
            }
        }

        done(null, result);

    }

    function getAll(input, isArray, step, isRequired, logger, done) {
        var nodes = isArray ? input : [input];

        async.concat(
            nodes,
            function (node, doneNode) {
                get(node, step, isRequired, logger, doneNode);
            },
            function (err, result) {
                isArray = isArray || step.$index === undefined;
                result = isArray ? result : result[0];
                result = result || null;
                done(null, result, isArray);
            }
        );
    }

    function evaluate(input, isRequired, logger) {
        var isArray = true;
        var self = this;
        var defer = q.defer();

        function evaluateStep(input, isArray, step, logger, done) {
            logger = new Logger(logger);
            setTimeout(function () {
                if (step) {
                    if (step.$type === 'get') {
                        logger.pushContextProperty('path', step.$type + (step.$name ? '.' : '') + step.$name + '(\'' + step.$query + '\')');
                        getAll(input, isArray, step, isRequired, logger, function (err, output, isArray) {
                            evaluateStep(output, isArray, step.$next, logger, done);
                        });
                    }
                    else if (step.$type === 'log') {
                        logger.important(step.$text, input);
                        evaluateStep(input, isArray, step.$next, logger, done);
                    }
                    else if (step.$type === 'logger') {
                        evaluateStep(input, isArray, step.$next, step.$logger, done);
                    }
                    else {
                        evaluateStep(input, isArray, step.$next, logger, done);
                    }
                }
                else {
                    done(null, input);
                }
            }, 0);
        }

        evaluateStep(input, false, this.$firstStep, logger,
            function (err, output) {
                defer.resolve(output);
            }
        );
        return defer.promise;
    }

    var _public = {
        clone: function () {
            return clone(this);
        },

        addLogger: function (logger) {
            addLogger.call(this, logger);
            return this;
        },

        addLog: function (text) {
            addLog.call(this, text);
            return this;
        },

        addGet: function (name, fnGet, query, index) {
            addGet.call(this, name, fnGet, query, index);
            return this;
        },

        setIndexOnLastStep: function (index) {
            setIndexOnLastStep.call(this, index);
            return this;
        },

        evaluate: function (node, isRequired, logger) {
            return evaluate.call(this, node, isRequired, logger);
        }
    };


    return _public;

}
