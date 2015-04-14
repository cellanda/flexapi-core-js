/*global require global describe it expect*/
var Mapper = require('../../lib/mapper');
var mapper = new Mapper();
var Module = require('../../lib/module');
var Logger = require('../../lib/logger');
var helpers = require('../_helpers');
var getChildren = helpers.getChildren;
var fixtures = require('../_fixtures');
var fixture = fixtures.sampleObjectFixture;
var scenarios;


describe('the test node selector', function () {
    it('works', function (done) {
        getChildren(fixture(), 'person', null, null, function(err, nodes) {
            expect(nodes.length).toEqual(4);
            expect(nodes[1].lastname).toEqual('astair');
            done();
        });
    });
});


describe('module deep evaluate', function () {

    var expectedInstance = {
        test: {
            person: [
                {name: 'john'},
                {name: 'fred'},
                {name: null},
                {name: 'stanley'}
            ]
        }
    };

    it('evaluates a child property', function (done) {
        var resolved = 0;
        var subModule = {
            person: mapper.property.get(getChildren, 'person')(0).content({
                name: mapper.property.get(getChildren, 'firstname')(0)
            })
        };
        var logger = new Logger();
        var module = new Module({content: {test: subModule}});

        var api = module.compile(mapper, logger)
        api._ = fixture();
        api.test.person._
        .then(function (instance) {
            resolved++;
            expect(instance).toCompareTo(expectedInstance.test.person[0]);
            expect(logger.getMessages().length).toEqual(0);
            resolved++;
        })
        .finally(function () {
            expect(resolved).toBe(2);
            done();
        });
    });

    it('evaluates a property array', function (done) {
        var resolved = 0;
        var subModule = {
            person: mapper.property.get(getChildren, 'person').content({
                name: mapper.property.get(getChildren, 'firstname')(0)
            })
        };
        var logger = new Logger();
        var module = new Module({content: {test: subModule}});

        var api = module.compile(mapper, logger)
        api._ = fixture();
        api.test.person._
        .then(function (instance) {
            resolved++;
            expect(instance).toCompareTo(expectedInstance.test.person);
            expect(logger.getMessages().length).toEqual(1);
            resolved++;
        })
        .finally(function () {
            expect(resolved).toBe(2);
            done();
        });
    });

    it('evaluates a child of a property array', function (done) {
        var resolved = 0;
        var subModule = {
            person: mapper.property.get(getChildren, 'person').content({
                name: mapper.property.get(getChildren, 'firstname')(0)
            })
        };
        var logger = new Logger();
        var module = new Module({content: {test: subModule}});

        var api = module.compile(mapper, logger)
        api._ = fixture();
        api.test.person(1)._
        .then(function (instance) {
            resolved++;
            expect(instance).toCompareTo(expectedInstance.test.person[1]);
            expect(logger.getMessages().length).toEqual(1);
            resolved++;
        })
        .finally(function () {
            expect(resolved).toBe(2);
            done();
        });
    });

    it('evaluates a property of a child of a property array', function (done) {
        var resolved = 0;
        var subModule = {
            person: mapper.property.get(getChildren, 'person').content({
                name: mapper.property.get(getChildren, 'firstname')(0)
            })
        };
        var logger = new Logger();
        var module = new Module({content: {test: subModule}});

        var api = module.compile(mapper, logger)
        api._ = fixture();
        var name1 = api.test.person(1).name;
        var name2 = api.test.person(2).name;   // attempt to confuse the hierarchy by requesting item(2)
        name1._
        .then(function (instance) {
            resolved++;
            expect(instance).toCompareTo(expectedInstance.test.person[1].name);
            expect(logger.getMessages().length).toEqual(1);
            resolved++;
        })
        .finally(function () {
            expect(resolved).toBe(2);
            done();
        });
    });
});

