/*global require global describe it expect*/
var Module = require('../lib/module');
var selector = require('../lib/selector')();
var Logger = require('../lib/logger');
var fixtures = require('./_fixtures');
var fixture = fixtures.sampleObjectFixture();
var getChildren = fixtures.getChildren;
var scenarios;


describe('page map moduleInstance', function () {

    it('evaluates module with custom selector', function (done) {
        selector.onGet('children').call(getChildren);
        var subModule = {
            found: selector.get.children('firstname').required(false)
        };
        var tmpFixture = fixture;
        var logger = new Logger();
        var module = new Module({test: subModule});

        var expectedInstance = {test: {}};
        expectedInstance.test.found = {$node: [
                'john',
                'fred',
                'stanley',
                'samantha',
                'tessa'
            ]};
        expectedInstance.$node = tmpFixture;
        expectedInstance.test.$node = tmpFixture;

        module.evaluate(tmpFixture, logger).done(function (instance) {
            expect(instance).toCompareTo(expectedInstance);
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
    });

    it('evaluates module with custom selector set as unique', function (done) {
        selector.onGet('children').call(getChildren).unique();
        var subModule = {
            found: selector.get.children('firstname').required(false)
        };
        var tmpFixture = fixture;
        var logger = new Logger();
        var module = new Module({test: subModule});

        var expectedInstance = {test: {}};
        expectedInstance.test.found = {$node: 'john'};
        expectedInstance.$node = tmpFixture;
        expectedInstance.test.$node = tmpFixture;

        module.evaluate(tmpFixture, logger).done(function (instance) {
            expect(instance).toCompareTo(expectedInstance);
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
    });

    it('evaluates module with custom selector set as unique and as value', function (done) {
        selector.onGet('children').call(getChildren).unique().asValue();
        var subModule = {
            found: selector.get.children('firstname').required(false)
        };
        var tmpFixture = fixture;
        var logger = new Logger();
        var module = new Module({test: subModule});

        var expectedInstance = {test: {}};
        expectedInstance.test.found = 'john';
        expectedInstance.$node = tmpFixture;
        expectedInstance.test.$node = tmpFixture;

        module.evaluate(tmpFixture, logger).done(function (instance) {
            expect(instance).toCompareTo(expectedInstance);
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
    });

    it('evaluates module with custom selector set as value and as unique', function (done) {
        selector.onGet('children').call(getChildren).asValue().unique();
        var subModule = {
            found: selector.get.children('firstname').required(false)
        };
        var tmpFixture = fixture;
        var logger = new Logger();
        var module = new Module({test: subModule});

        var expectedInstance = {test: {}};
        expectedInstance.test.found = 'john';
        expectedInstance.$node = tmpFixture;
        expectedInstance.test.$node = tmpFixture;

        module.evaluate(tmpFixture, logger).done(function (instance) {
            expect(instance).toCompareTo(expectedInstance);
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
    });

});