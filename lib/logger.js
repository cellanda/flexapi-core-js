/*global require module*/
var LogContext = require('./logger-context');

module.exports = Logger;

function Logger(prevLogger) {
    var severities = ['log', 'info', 'warn', 'fail', 'error', 'important', 'fatal'];
    var severityMap = {};
    var defaultSeverity = 'log';
    var messages = [];
    var context = new LogContext(prevLogger && prevLogger.getContext ? prevLogger.getContext() : null);

    function log(severity, text, data) {
        var message = {
//                time: new Date(),
            severity: determineSeverity(severity),
            context: context.getData(),
            text: text
        };
        if (data) {
            message.data = data;
        }
        logMessage(message);
    }

    function logMessage(message) {
        //console.log('logger message ', message);
        var newMessage = copyMessage(message, true);
        messages.push(newMessage);

        if (prevLogger) {
            if (prevLogger.logMessage) {
                prevLogger.logMessage(copyMessage(newMessage, true));
            }
            else if (prevLogger.log) {
                if (message.data) {
                    prevLogger.log(JSON.stringify(copyMessage(message, false)), message.data);
                }
                else {
                    prevLogger.log(JSON.stringify(copyMessage(message, false)));
                }
            }
        }
    }

    function copyMessage(message, includeData) {
        var copy = {
            severity: determineSeverity(message.severity),
            context: new LogContext(context).addContext(message.context).getData(),
            text: message.text
        };
        if (includeData && message.data) {
            copy.data = message.data;
        }
        return copy;
    }

    function determineSeverity(severity) {
        return severityMap[severity] || severity;
    }

    return {
        setDefaultSeverity: function (val) {
            defaultSeverity = val;
            return this;
        },

        mapSeverity: function (requested, actual) {
            severityMap[requested] = actual;
            return this;
        },

        getContext: function () {
            return context;
        },

        addContext: function (val) {
            context.addContext(val);
            return this;
        },

        setContextProperty: function (name, value) {
            context.setProperty(name, value);
            return this;
        },

        pushContextProperty: function (name, value) {
            context.pushProperty(name, value);
            return this;
        },

        log: function (text, data) {
            log(defaultSeverity, text, data);
            return this;
        },

        info: function (text, data) {
            log('info', text, data);
            return this;
        },

        warn: function (text, data) {
            log('warn', text, data);
            return this;
        },

        fail: function (text, data) {
            log('fail', text, data);
            return this;
        },

        error: function (text, data) {
            log('error', text, data);
            return this;
        },

        important: function (text, data) {
            log('important', text, data);
            return this;
        },

        fatal: function (text, data) {
            log('fatal', text, data);
            return this;
        },

        logMessage: function (message) {
            logMessage(message);
            return this;
        },

        getMessages: function () {
            return messages;
        }
    };
}

