/*global require global describe it expect jasmine spy.on*/
var Logger = require('../../lib/logger');


describe('logger', function () {

    it('logs text', function () {
        var testLogger = {log: function () {}};
        spy.on(testLogger, 'log');
        var logger = new Logger(testLogger);
        logger.log('message1');

        expect(testLogger.log).to.have.been.called.with('{"severity":"log","context":{},"text":"message1"}');
    });

    it('implicitly warns text', function () {
        var testLogger = {log: function () {}};
        spy.on(testLogger, 'log');
        var logger = new Logger(testLogger);
        logger.setDefaultSeverity('warn');
        logger.log('message1');

        expect(testLogger.log).to.have.been.called.with('{"severity":"warn","context":{},"text":"message1"}');
    });

    it('explicitly warns text', function () {
        var testLogger = {log: function () {}};
        spy.on(testLogger, 'log');
        var logger = new Logger(testLogger);
        logger.warn('message1');

        expect(testLogger.log).to.have.been.called.with('{"severity":"warn","context":{},"text":"message1"}');
    });

    it('logs a message', function () {
        var testLogger = {logMessage: function () {}};
        spy.on(testLogger, 'logMessage');
        var logger = new Logger(testLogger);
        logger.log('message1');

        expect(testLogger.logMessage).to.have.been.called.with({"severity": "log", "context": {}, "text": "message1"});
        expect(logger.getMessages()[0]).to.compareTo({"severity": "log", "context": {}, "text": "message1"});
    });

    it('logs a message with context', function () {
        var testLogger = {logMessage: function () {}};
        spy.on(testLogger, 'logMessage');
        var logger = new Logger(testLogger);
        logger.addContext({n1: "v1", n2: "v2"});
        logger.log('message1');
        logger.addContext({n1: "v1", n2: "a2"});

        expect(testLogger.logMessage).to.have.been.called.with({"severity": "log", "context": {n1: "v1", n2: "v2"}, "text": "message1"});
    });

    it('logs a message with 2 layers of context', function () {
        var testLogger = {logMessage: function () {}};
        spy.on(testLogger, 'logMessage');
        var logger1 = new Logger(testLogger);
        logger1.addContext({n1: "v1", n2: "v2"});
        var logger2 = new Logger(logger1);
        logger2.addContext({n1: "v1", n3: "v3"});
        logger2.log('message1');

        expect(testLogger.logMessage).to.have.been.called.with({"severity": "log", "context": {n1: "v1", n2: "v2", n3: "v3"}, "text": "message1"});
    });

});
