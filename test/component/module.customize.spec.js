/*global require global describe it expect*/
var mapper = require('../../lib/mapper');
var Module = require('../../lib/module');
var selector = require('../../lib/selector')();
var Logger = require('../../lib/logger');
var helpers = require('../_helpers');
var getChildren = helpers.getChildren;
var fixtures = require('../_fixtures');
var fixture = fixtures.sampleObjectFixture();
var scenarios;


describe('module customize', function () {
    var myMapper;

    beforeEach(function() {
        myMapper = mapper.clone();
    });


    it('evaluates module with custom selector', function () {
        myMapper.settings.property.onGet('children').call(getChildren);
        var subModule = {
            found: myMapper.property.get.children('firstname').required(false)
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

        return module.evaluate(myMapper, tmpFixture, logger)
        .then(function (instance) {
            expect(instance).to.compareTo(expectedInstance);
            expect(logger.getMessages().length).to.equal(0);
        });
    });

    it('evaluates module with custom selector set as unique', function () {
        myMapper.settings.property.onGet('children').call(getChildren).unique();
        var subModule = {
            found: myMapper.property.get.children('firstname').required(false)
        };
        var tmpFixture = fixture;
        var logger = new Logger();
        var module = new Module({content: {test: subModule}});

        var expectedInstance = {test: {found: 'john'}};

        return module.evaluate(myMapper, tmpFixture, logger)
        .then(function (instance) {
            expect(instance).to.compareTo(expectedInstance);
            expect(logger.getMessages().length).to.equal(0);
        });
    });

});