/*global require global describe it expect*/
var Mapper = require('../../lib/mapper');
var Module = require('../../lib/module');
var selector = require('../../lib/selector')();
var Logger = require('../../lib/logger');
var helpers = require('../_helpers');
var getChildren = helpers.getChildren;
var fixtures = require('../_fixtures');
var fixture = fixtures.sampleObjectFixture();
var scenarios;


describe('module customize', function () {

    it('evaluates module with custom selector', function (done) {
        try {
        var mapper = new Mapper();
        mapper.settings.property.onGet('children').call(getChildren);
        var subModule = {
            found: mapper.property.get.children('firstname').required(false)
        };
        var tmpFixture = fixture;
        var logger = new Logger();
        var module = new Module({content: {test: subModule}});

        var expectedInstance = {
            test: {
                found: [
                    'john',
                    'fred',
                    'stanley',
                    'samantha',
                    'tessa'
                ]
            }
        };

        module.evaluate(mapper, tmpFixture, logger).done(function (instance) {
            expect(instance).toCompareTo(expectedInstance);
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
        }
        catch(ex) {
            console.log(ex);
            done();
        }
    });

    it('evaluates module with custom selector set as unique', function (done) {
        var mapper = new Mapper();
        mapper.settings.property.onGet('children').call(getChildren).unique();
        var subModule = {
            found: mapper.property.get.children('firstname').required(false)
        };
        var tmpFixture = fixture;
        var logger = new Logger();
        var module = new Module({content: {test: subModule}});

        var expectedInstance = {test: {found: 'john'}};

        module.evaluate(mapper, tmpFixture, logger).done(function (instance) {
            expect(instance).toCompareTo(expectedInstance);
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
    });

});