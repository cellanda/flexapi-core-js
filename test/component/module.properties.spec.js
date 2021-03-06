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
        getChildren(fixture(), ['person'], null, null, function(err, nodes) {
            expect(nodes.length).to.equal(4);
            expect(nodes[1].lastname).to.equal('astair');
            done();
        });
    });
});


describe('module properties', function () {

    var myMapper;

    beforeEach(function() {
        myMapper = mapper.clone();
    });

    it('evaluates simple object module with single level selectors', function () {
        var subModule = {
            n10: myMapper.property.get(getChildren, 'x').required(false),
            n11: myMapper.property.get(getChildren, 'person')(0)
        };
        var tmpFixture = fixture();
        var logger = new Logger();
        var module = new Module({content: {test: subModule}});

        var expectedInstance = {test: {}};
        expectedInstance.test.n10 = [];
        expectedInstance.test.n11 = {
                    firstname: 'john',
                    lastname: 'smith'
            };

        var expectedLog = {
            severity: 'info',
            text: 'nothing found',
            context: {path: ['test', 'n10', 'get(\'x\')']},
            data: fixture()
        };

        return module.evaluate(myMapper, fixture(), logger)
        .then(function (instance) {
            expect(instance).to.compareTo(expectedInstance);
            expect(logger.getMessages().length).to.equal(1);
            expect(logger.getMessages()[0]).to.compareTo(expectedLog);
        });
    });

    it('evaluates module with single level selectors', function () {
        var subModule = function () {
            return {
                n1: [
                    {n10: myMapper.property.get(getChildren, 'x').required(false)},
                    {n11: myMapper.property.get(getChildren, 'person')(0)}
                ],
                n2: {
                    n20: myMapper.property.get(getChildren, 'firstname'),
                    n21: 'v21'
                }
            };
        };
        var tmpFixture = fixture();
        var logger = new Logger();
        var module = new Module({content: {test: subModule()}});

        var expectedInstance = {test: subModule()};
        expectedInstance.test.n1[0].n10 = [];
        expectedInstance.test.n1[1].n11 = {
                    firstname: 'john',
                    lastname: 'smith'
            };
        expectedInstance.test.n2.n20 = [
                'john',
                'fred',
                'stanley',
                'samantha',
                'tessa'
            ];

        var expectedLog = {
            severity: 'info',
            text: 'nothing found',
            context: {path: ['test', 'n1', '0', 'n10', 'get(\'x\')']},
            data: fixture()
        };

        return module.evaluate(myMapper, fixture(), logger)
        .then(function (instance) {
            expect(instance).to.compareTo(expectedInstance);
            expect(logger.getMessages().length).to.equal(1);
            expect(logger.getMessages()[0]).to.compareTo(expectedLog);
        });
    });

    scenarios = [
        {test: 1, required: false, query: 'firstname', index: undefined, expectedModule: [{n101: 'v101'}, {n101: 'v101'}, {n101: 'v101'}, {n101: 'v101'}, {n101: 'v101'}], severity: ''},
        {test: 2, required: true,  query: 'firstname', index: undefined, expectedModule: [{n101: 'v101'}, {n101: 'v101'}, {n101: 'v101'}, {n101: 'v101'}, {n101: 'v101'}], severity: ''},
        {test: 3, required: false, query: 'firstname', index: 0,         expectedModule: {n101: 'v101'},                                                                                                                                        severity: ''},
        {test: 4, required: true,  query: 'firstname', index: 0,         expectedModule: {n101: 'v101'},                                                                                                                                        severity: ''},
        {test: 5, required: false, query: 'x',         index: undefined, expectedModule: [],                                                                                                                                                                   severity: 'info'},
        {test: 6, required: true,  query: 'x',         index: undefined, expectedModule: undefined,                                                                                                                                                                 severity: 'fail'},
        {test: 7, required: false, query: 'x',         index: 0,         expectedModule: null,                                                                                                                                      severity: 'info'},
        {test: 8, required: true,  query: 'x',         index: 0,         expectedModule: undefined,                                                                                                                                                                 severity: 'fail'}
    ];
    scenarios.forEach(function (scenario) {
        scenario.description = 'test case: ' + scenario.test + ' (required:' + scenario.required + ' query:' + scenario.query + ' index:' + scenario.index + ')';
        it('evaluates module with ' + scenario.description + ' with selectors missing', function () {
            var subModule = function () {
                return {
                    n1: [
                        {
                            n10: myMapper.property.required(scenario.required).log('inline-log').get(getChildren, scenario.query)(scenario.index).content({
                                n101: 'v101'
                            })
                        }
                    ]
                };
            };
            var logger = new Logger();
            var module = new Module({content: {test: subModule()}});

            return module.evaluate(myMapper, fixture(), logger)
            .then(function (instance) {
                if (scenario.expectedModule !== undefined) {
                    expect(instance).to.not.be.undefined;
                    expect(instance.test).to.not.be.undefined;
                    expect(instance.test.n1).to.not.be.undefined;
                    expect(instance.test.n1.length).to.be.above(0);
                    expect(instance.test.n1[0].n10).to.compareTo(scenario.expectedModule);
                }
                else {
                    expect(instance).to.be.null;
                }

                var expectedLogInlineMessage = {
                    severity: 'important',
                    text: 'inline-log',
                    context: {path: ['test', 'n1', '0', 'n10']},
                    data: fixture()
                };
                var expectedLogErrorMessage = {
                    severity: scenario.severity,
                    text: 'nothing found',
                    context: {path: ['test', 'n1', '0', 'n10', 'get(\'x\')']},
                    data: fixture()
                };

                if (scenario.severity) {
                    expect(logger.getMessages()[0]).to.compareTo(expectedLogInlineMessage);
                    expect(logger.getMessages()[1]).to.compareTo(expectedLogErrorMessage);
                }
                else {
                    expect(logger.getMessages().length).to.equal(1);
                    expect(logger.getMessages()[0]).to.compareTo(expectedLogInlineMessage);
                }
           });

        });
    });

    scenarios = [
        {test: 1,  personRequired: false, firstnameRequired: false, query: 'firstname', index: undefined, expectInstance: true,  firstnameNode: ['john'], personModule: {firstname: ['john'], n10: 'v10'}, severity: ''},
        {test: 2,  personRequired: true,  firstnameRequired: false, query: 'firstname', index: undefined, expectInstance: true,  firstnameNode: ['john'], personModule: {firstname: ['john'], n10: 'v10'}, severity: ''},
        {test: 3,  personRequired: false, firstnameRequired: false, query: 'firstname', index: 0,         expectInstance: true,  firstnameNode: 'john',   personModule: {firstname: 'john', n10: 'v10'},   severity: ''},
        {test: 4,  personRequired: true,  firstnameRequired: false, query: 'firstname', index: 0,         expectInstance: true,  firstnameNode: 'john',   personModule: {firstname: 'john', n10: 'v10'},   severity: ''},
        {test: 5,  personRequired: false, firstnameRequired: false, query: 'x',         index: undefined, expectInstance: true,  firstnameNode: [],       personModule: {firstname: [], n10: 'v10'},       severity: 'info'},
        {test: 6,  personRequired: true,  firstnameRequired: false, query: 'x',         index: undefined, expectInstance: true,  firstnameNode: [],       personModule: {firstname: [], n10: 'v10'},       severity: 'info'},
        {test: 7,  personRequired: false, firstnameRequired: false, query: 'x',         index: 0,         expectInstance: true,  firstnameNode: null,     personModule: {firstname: null, n10: 'v10'},     severity: 'info'},
        {test: 8,  personRequired: true,  firstnameRequired: false, query: 'x',         index: 0,         expectInstance: true,  firstnameNode: null,     personModule: {firstname: null, n10: 'v10'},     severity: 'info'},
        {test: 9,  personRequired: false, firstnameRequired: true,  query: 'firstname', index: undefined, expectInstance: true,  firstnameNode: ['john'], personModule: {firstname: ['john'], n10: 'v10'}, severity: ''},
        {test: 10, personRequired: true,  firstnameRequired: true,  query: 'firstname', index: undefined, expectInstance: true,  firstnameNode: ['john'], personModule: {firstname: ['john'], n10: 'v10'}, severity: ''},
        {test: 11, personRequired: false, firstnameRequired: true,  query: 'firstname', index: 0,         expectInstance: true,  firstnameNode: 'john',   personModule: {firstname: 'john', n10: 'v10'},   severity: ''},
        {test: 12, personRequired: true,  firstnameRequired: true,  query: 'firstname', index: 0,         expectInstance: true,  firstnameNode: 'john',   personModule: {firstname: 'john', n10: 'v10'},   severity: ''},
        {test: 13, personRequired: false, firstnameRequired: true,  query: 'x',         index: undefined, expectInstance: true,  firstnameNode: null,     personModule: null,                              severity: 'info'},
        {test: 14, personRequired: true,  firstnameRequired: true,  query: 'x',         index: undefined, expectInstance: false, firstnameNode: null,     personModule: null,                              severity: 'fail'},
        {test: 15, personRequired: false, firstnameRequired: true,  query: 'x',         index: 0,         expectInstance: true,  firstnameNode: null,     personModule: null,                              severity: 'info'},
        {test: 16, personRequired: true,  firstnameRequired: true,  query: 'x',         index: 0,         expectInstance: false, firstnameNode: null,     personModule: null,                              severity: 'fail'}
    ];
    scenarios.forEach(function (scenario) {
        scenario.description = 'test case: ' + scenario.test + ' (personRequired:' + scenario.personRequired + ' firstnameRequired:' + scenario.firstnameRequired + ' query:' + scenario.query + ' index:' + scenario.index + ')';
        it('evaluates module with ' + scenario.description + ' with sub selectors missing', function () {
            var subModule = {
                n1: [
                    {
                        person: myMapper.property.required(scenario.personRequired).get(getChildren, 'person')(0).content({
                            firstname: myMapper.property.required(scenario.firstnameRequired).get(getChildren, scenario.query)(scenario.index),
                            n10: 'v10'
                        })
                    },
                    {n11: 'v11'}
                ]
            };
            var logger = new Logger();
            var module = new Module({content: {test: subModule}});
            return module.evaluate(myMapper, fixture(), logger)
            .then(function (instance) {
                if (scenario.expectInstance) {
                    expect(instance).not.to.be.null;
                    var actual = instance.test.n1[0].person;
                    expect(actual).to.compareTo(scenario.personModule);
                }
                else {
                    expect(instance).to.be.null;
                }

                if (scenario.severity) {
                    var expectedLog = {
                        severity: scenario.severity,
                        text: 'nothing found',
                        context: {path: ['test', 'n1', '0', 'person', 'firstname', 'get(\'x\')']},
                        data: fixture().customers[0].person
                    };
                    expect(logger.getMessages()[0]).to.compareTo(expectedLog);
                }
                else {
                    expect(logger.getMessages().length).to.equal(0);
                }
            });

        });
    });

    it('evaluates module with partial property builder', function () {
        var partialBuilder = myMapper.property.required;
        var getRequiredPerson = partialBuilder.get(getChildren, 'person');

        var subModule = {
            person: partialBuilder.get(getChildren, 'person')(0).content({
                firstname: partialBuilder.get(getChildren, 'firstname'),
                n10: 'v10'
            })
        };
        var xsubModule = {
            person: getRequiredPerson(0).content({
                firstname: partialBuilder.get(getChildren, 'firstname'),
                n10: 'v10'
            })
        };

        var expectedInstance = {person: {firstname: ['john'], n10: 'v10'}};

        var module = new Module({content: subModule});
        return module.evaluate(myMapper, fixture())
        .then(function (instance) {
            expect(instance).to.compareTo(expectedInstance);
        });

    });
});
