/*global require global describe it expect*/
var mapper = require('../../lib/mapper');
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
            expect(nodes.length).to.equal(4);
            expect(nodes[1].lastname).to.equal('astair');
            done();
        });
    });
});


describe('module deep evaluate', function () {

    var myMapper;
    var expectedInstance;

    beforeEach(function() {
        myMapper = mapper.clone();
        expectedInstance = {
            test: {
                person: [
                    {name: 'john'},
                    {name: 'fred'},
                    {name: null},
                    {name: 'stanley'}
                ]
            }
        };
    });


    it('evaluates a child property', function () {
        var subModule = {
            person: myMapper.property.get(getChildren, 'person')(0).content({
                name: myMapper.property.get(getChildren, 'firstname')(0)
            })
        };
        var logger = new Logger();
        var module = new Module({content: {test: subModule}});

        var api = module.compile(myMapper, logger)
        api._ = fixture();
        return api.test.person._
        .then(function (instance) {
            expect(instance).to.compareTo(expectedInstance.test.person[0]);
            expect(logger.getMessages().length).to.equal(0);
        });
    });

    it('evaluates a property array', function () {
        var subModule = {
            person: myMapper.property.get(getChildren, 'person').content({
                name: myMapper.property.get(getChildren, 'firstname')(0)
            })
        };
        var logger = new Logger();
        var module = new Module({content: {test: subModule}});

        var api = module.compile(myMapper, logger)
        api._ = fixture();
        return api.test.person._
        .then(function (instance) {
            expect(instance).to.compareTo(expectedInstance.test.person);
            expect(logger.getMessages().length).to.equal(1);
        });
    });

    it('evaluates a child of a property array', function () {
        var subModule = {
            person: myMapper.property.get(getChildren, 'person').content({
                name: myMapper.property.get(getChildren, 'firstname')(0)
            })
        };
        var logger = new Logger();
        var module = new Module({content: {test: subModule}});

        var api = module.compile(myMapper, logger)
        api._ = fixture();
        return api.test.person(1)._
        .then(function (instance) {
            expect(instance).to.compareTo(expectedInstance.test.person[1]);
            expect(logger.getMessages().length).to.equal(1);
        });
    });

    it('evaluates a property of a child of a property array', function () {
        var myMapper = mapper.clone();
        var subModule = {
            person: myMapper.property.get(getChildren, 'person').content({
                name: myMapper.property.get(getChildren, 'firstname')(0)
            })
        };
        var logger = new Logger();
        var module = new Module({content: {test: subModule}});

        var api = module.compile(myMapper, logger)
        api._ = fixture();
        var name1 = api.test.person(1).name;
        var name2 = api.test.person(2).name;   // attempt to confuse the hierarchy by requesting item(2)
        return name1._
        .then(function (instance) {
            expect(instance).to.compareTo(expectedInstance.test.person[1].name);
            expect(logger.getMessages().length).to.equal(1);
        });
    });
});

