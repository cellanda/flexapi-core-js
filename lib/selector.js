/*global require module*/
var __ = require('underscore');
var q = require("q");
var async = require("async");
var Logger = require('./logger');

module.exports = Selector;

function Selector(factorySelector, baseGetters) {
    var _getters = __.extend({}, baseGetters);

    function getSelector(self) {
        if (self.$isSelector) {
            return self;
        }
        else {
            var selector = new Selector(self, _getters);
            selector.setLogger(self.logger);
            return selector;
        }
    }

    function addGetter(getterName) {
        var parameters = {
            call: function (getterFn) {this.getterFn = getterFn; return this; },
            unique: function () {this.isUnique = true; return this; },
            asValue: function () {this.isAsValue = true; return this; }
        };

        _getters[getterName] = function (query, index) {
            var selector = addStep(getSelector(this), {
                $type: 'get',
                $name: getterName,
                $fnGet: parameters.getterFn,
                $query: query,
                $index: parameters.isUnique ? 0 : index
            });
            if (parameters.isAsValue) {
                selector = selector.asValue();
            }
            return selector;
        };

        this.get[getterName] = _getters[getterName].bind(this);

        return parameters;
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

        selector.$isArray = false;
        for (step = selector.$firstStep; step; step = step.$next) {
            if (step.$index === undefined) {
                selector.$isArray = true;
                break;
            }
        }

        return selector;
    }

    function addStep_get(fnGet, query, index) {
        return addStep(this, {
            $type: 'get',
            $name: '',
            $fnGet: fnGet,
            $query: query,
            $index: index
        });
    }

    function setIsRequired(isRequired) {
        this.$isRequired = isRequired;
        return this;
    }

    function setLog(text) {
        this.$lastStep.$log = text;
        return this;
    }

    function setModule(module) {
        this.$module = module;
        return this;
    }

    function setAsValue() {
        this.$asValue = true;
        return this;
    }

    function get(node, step, isRequired, logger, done) {
        logger = new Logger(logger);
        logger.setDefaultSeverity(isRequired ? 'fail' : 'info');
        logger.pushContextProperty('path', step.$type + (step.$name ? '.' : '') + step.$name + '(\'' + step.$query + '\')');
        var result = [];

        if (node === null || node === undefined) {
            logger.log('no node', node);
        }
        else {
            try {
                var nodes = step.$fnGet(node, step.$query, step.$index, logger);
                nodes = nodes || [];
                result = __.without(nodes, null, undefined);
                if (!result.length) {
                    logger.log('nothing found', node);
                }
                else if (step.$index !== undefined) {
                    if (step.$index >= result.length) {
                        logger.log('index (' + step.$index + ') exceeds maximum of ' + (result.length - 1), node);
                    }
                    else {
                        result = [result[step.$index]];
                    }
                }
            }
            catch (ex) {
                logger.log('exception: ' + ex, node);
            }
        }

        done(null, result);
    }

    function evaluate(input, logger) {
        var isArray = false;
        var self = this;
        var defer = q.defer();

        function evaluateStep(input, step, logger, done) {
            logger = new Logger(logger);
            if (step) {
                isArray = isArray || (step.$index === undefined);
                async.concat(
                    input,
                    function (node, done) {
                        get(node, step, self.$isRequired, logger, done);
                    },
                    function (err, output) {
                        if (step.$log) {
                            logger.important(step.$log, output);
                        }
                        evaluateStep(output, step.$next, logger, done);
                    }
                );
            }
            else {
                done(null, input);
            }
        }

        evaluateStep([input], this.$firstStep, logger,
            function (err, output) {
                output = isArray ? output : output[0];
                output = output || null;
                defer.resolve(output);
            }
        );
        return defer.promise;
    }

    function finalise(selector) {
        selector.get = undefined;
        selector.module = undefined;
        selector.asValue = undefined;
        return selector;
    }

    var _public = {
        $isSelector: !!factorySelector,
        get factorySelector() {return factorySelector || _public; },
        $isRequired: true,
        logger: null,

        setLogger: function (val) {
            this.logger = val;
            return this;
        },

        log: function (val) {
            return setLog.call(getSelector(this), val);
        },

        onGet: function (getterName) {
            return addGetter.call(this, getterName);
        },

        required: function (isRequired) {
            return setIsRequired.call(getSelector(this), isRequired);
        },

        get: function (fnGet, query, index) {
            return addStep_get.call(getSelector(this), fnGet, query, index);
        },

        module: function (module) {
            return finalise(setModule.call(getSelector(this), module));
        },

        asValue: function () {
            return finalise(setAsValue.call(getSelector(this)));
        },

        evaluate: function (node, logger) {
            return evaluate.call(this, node, logger || this.logger);
        }
    };


    __.each(_getters, function (getterFn, getterName) {
        _public.get[getterName] = getterFn.bind(_public);
    });


    return _public;

}
