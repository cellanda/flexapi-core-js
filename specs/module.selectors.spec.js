/*global require global describe it expect*/
var Module = require('../lib/module');
var selector = require('../lib/selector')();
var Logger = require('../lib/logger');
var fixtures = require('./_fixtures');
var fixture = fixtures.sampleObjectFixture;
var getChildren = fixtures.getChildren;
var scenarios;


describe('the test node selector', function () {
    it('works', function () {
        var nodes = getChildren(fixture(), 'person');

        expect(nodes.length).toEqual(4);
        expect(nodes[1].lastname).toEqual('astair');
    });
});


describe('page map moduleInstance', function () {

    it('evaluates simple object module with single level selectors', function (done) {
        var subModule = {
            n10: selector.get(getChildren, 'x').required(false),
            n11: selector.get(getChildren, 'person', 0)
        };
        var tmpFixture = fixture();
        var logger = new Logger();
        var module = new Module({test: subModule});

        var expectedInstance = {test: {}};
        expectedInstance.test.n10 = {$node: []};
        expectedInstance.test.n11 = {
                $node: {
                    firstname: 'john',
                    lastname: 'smith'
                }
            };
        expectedInstance.$node = tmpFixture;
        expectedInstance.test.$node = tmpFixture;

        var expectedLog = {
            severity: 'info',
            text: 'nothing found',
            context: {path: ['test', 'n10', 'get(\'x\')']},
            data: fixture()
        };

        module.evaluate(fixture(), logger).done(function (instance) {
            expect(instance).toCompareTo(expectedInstance);
            expect(logger.getMessages().length).toEqual(1);
            expect(logger.getMessages()[0]).toCompareTo(expectedLog);
            done();
        });
    });

    it('evaluates module with single level selectors', function (done) {
        var subModule = function () {
            return {
                n1: [
                    {n10: selector.get(getChildren, 'x').required(false)},
                    {n11: selector.get(getChildren, 'person', 0)}
                ],
                n2: {
                    n20: selector.get(getChildren, 'firstname'),
                    n21: 'v21'
                }
            };
        };
        var tmpFixture = fixture();
        var logger = new Logger();
        var module = new Module({test: subModule()});

        var expectedInstance = {test: subModule()};
        expectedInstance.test.n1[0].n10 = {$node: []};
        expectedInstance.test.n1[1].n11 = {
                $node: {
                    firstname: 'john',
                    lastname: 'smith'
                }
            };
        expectedInstance.test.n2.n20 = {$node: [
                'john',
                'fred',
                'stanley',
                'samantha',
                'tessa'
            ]};
        expectedInstance.$node = tmpFixture;
        expectedInstance.test.$node = tmpFixture;
        expectedInstance.test.n1.$node = tmpFixture;
        expectedInstance.test.n1[0].$node = tmpFixture;
        expectedInstance.test.n1[1].$node = tmpFixture;
        expectedInstance.test.n2.$node = tmpFixture;

        var expectedLog = {
            severity: 'info',
            text: 'nothing found',
            context: {path: ['test', 'n1', '0', 'n10', 'get(\'x\')']},
            data: fixture()
        };

        module.evaluate(fixture(), logger).done(function (instance) {
            expect(instance).toCompareTo(expectedInstance);
            expect(logger.getMessages().length).toEqual(1);
            expect(logger.getMessages()[0]).toCompareTo(expectedLog);
            done();
        });
    });

    scenarios = [
        {test: 1, required: false, query: 'firstname', index: undefined, expectedNode: ['john', 'fred', 'stanley', 'samantha', 'tessa'], expectedModule: [{$node: 'john', n101: 'v101'}, {$node: 'fred', n101: 'v101'}, {$node: 'stanley', n101: 'v101'}, {$node: 'samantha', n101: 'v101'}, {$node : 'tessa', n101: 'v101'}], severity: ''},
        {test: 2, required: true,  query: 'firstname', index: undefined, expectedNode: ['john', 'fred', 'stanley', 'samantha', 'tessa'], expectedModule: [{$node: 'john', n101: 'v101'}, {$node: 'fred', n101: 'v101'}, {$node: 'stanley', n101: 'v101'}, {$node: 'samantha', n101: 'v101'}, {$node : 'tessa', n101: 'v101'}], severity: ''},
        {test: 3, required: false, query: 'firstname', index: 0,         expectedNode: 'john',                                           expectedModule: {$node: 'john', n101: 'v101'},                                                                                                                                        severity: ''},
        {test: 4, required: true,  query: 'firstname', index: 0,         expectedNode: 'john',                                           expectedModule: {$node: 'john', n101: 'v101'},                                                                                                                                        severity: ''},
        {test: 5, required: false, query: 'x',         index: undefined, expectedNode: [],                                               expectedModule: [],                                                                                                                                                                   severity: 'info'},
        {test: 6, required: true,  query: 'x',         index: undefined, expectedNode: ['john'],                                         expectedModule: null,                                                                                                                                                                 severity: 'fail'},
        {test: 7, required: false, query: 'x',         index: 0,         expectedNode: null,                                             expectedModule: { $node : null, n101 : 'v101' },                                                                                                                                      severity: 'info'},
        {test: 8, required: true,  query: 'x',         index: 0,         expectedNode: ['john'],                                         expectedModule: null,                                                                                                                                                                 severity: 'fail'}
    ];
    scenarios.forEach(function (scenario) {
        scenario.description = 'test case: ' + scenario.test + ' (required:' + scenario.required + ' query:' + scenario.query + ' index:' + scenario.index + ')';
        it('evaluates module with ' + scenario.description + ' with selectors missing', function (done) {
            var tmpFixture = fixture();

            var subModule = function () {
                return {
                    n1: [
                        {n10: selector.required(scenario.required).get(getChildren, scenario.query, scenario.index).module({
                            n101: 'v101'
                        })}
                    ]
                };
            };
            var logger = new Logger();
            var module = new Module({test: subModule()});

            module.evaluate(fixture(), logger).done(function (instance) {
                if (scenario.expectedModule) {
                    if (scenario.expectedNode) {
                        scenario.expectedModule.$node = scenario.expectedNode;
                    }
                    expect(instance.test.n1[0].n10).toCompareTo(scenario.expectedModule);
                }
                else {
                    expect(instance).toBeNull();
                }

                if (scenario.severity) {
                    var expectedLog = {
                        severity: scenario.severity,
                        text: 'nothing found',
                        context: {path: ['test', 'n1', '0', 'n10', 'get(\'x\')']},
                        data: fixture()
                    };
                    expect(logger.getMessages()[0]).toCompareTo(expectedLog);
                }
                else {
                    expect(logger.getMessages().length).toEqual(0);
                }
                done();
            });

        });
    });

    scenarios = [
        {test: 1,  personRequired: false, firstnameRequired: false, query: 'firstname', index: undefined, expectInstance: true,  firstnameNode: ['john'], personModule: {$node: {firstname: 'john', lastname: 'smith'}, firstname: {}, n10: 'v10'},  severity: ''},
        {test: 2,  personRequired: true,  firstnameRequired: false, query: 'firstname', index: undefined, expectInstance: true,  firstnameNode: ['john'], personModule: {$node: {firstname: 'john', lastname: 'smith'}, firstname: {}, n10: 'v10'},  severity: ''},
        {test: 3,  personRequired: false, firstnameRequired: false, query: 'firstname', index: 0,         expectInstance: true,  firstnameNode: 'john',   personModule: {$node: {firstname: 'john', lastname: 'smith'}, firstname: {}, n10: 'v10' }, severity: ''},
        {test: 4,  personRequired: true,  firstnameRequired: false, query: 'firstname', index: 0,         expectInstance: true,  firstnameNode: 'john',   personModule: {$node: {firstname: 'john', lastname: 'smith'}, firstname: {}, n10: 'v10' }, severity: ''},
        {test: 5,  personRequired: false, firstnameRequired: false, query: 'x',         index: undefined, expectInstance: true,  firstnameNode: [],       personModule: {$node: {firstname: 'john', lastname: 'smith'}, firstname: {}, n10: 'v10'},  severity: 'info'},
        {test: 6,  personRequired: true,  firstnameRequired: false, query: 'x',         index: undefined, expectInstance: true,  firstnameNode: [],       personModule: {$node: {firstname: 'john', lastname: 'smith'}, firstname: {}, n10: 'v10'},  severity: 'info'},
        {test: 7,  personRequired: false, firstnameRequired: false, query: 'x',         index: 0,         expectInstance: true,  firstnameNode: null,     personModule: {$node: {firstname: 'john', lastname: 'smith'}, firstname: {}, n10: 'v10'},  severity: 'info'},
        {test: 8,  personRequired: true,  firstnameRequired: false, query: 'x',         index: 0,         expectInstance: true,  firstnameNode: null,     personModule: {$node: {firstname: 'john', lastname: 'smith'}, firstname: {}, n10: 'v10'},  severity: 'info'},
        {test: 9,  personRequired: false, firstnameRequired: true,  query: 'firstname', index: undefined, expectInstance: true,  firstnameNode: ['john'], personModule: {$node: {firstname: 'john', lastname: 'smith'}, firstname: {}, n10: 'v10'},  severity: ''},
        {test: 10, personRequired: true,  firstnameRequired: true,  query: 'firstname', index: undefined, expectInstance: true,  firstnameNode: ['john'], personModule: {$node: {firstname: 'john', lastname: 'smith'}, firstname: {}, n10: 'v10'},  severity: ''},
        {test: 11, personRequired: false, firstnameRequired: true,  query: 'firstname', index: 0,         expectInstance: true,  firstnameNode: 'john',   personModule: {$node: {firstname: 'john', lastname: 'smith'}, firstname: {}, n10: 'v10' }, severity: ''},
        {test: 12, personRequired: true,  firstnameRequired: true,  query: 'firstname', index: 0,         expectInstance: true,  firstnameNode: 'john',   personModule: {$node: {firstname: 'john', lastname: 'smith'}, firstname: {}, n10: 'v10' }, severity: ''},
        {test: 13, personRequired: false, firstnameRequired: true,  query: 'x',         index: undefined, expectInstance: true,  firstnameNode: null,     personModule: null,                                                                        severity: 'info'},
        {test: 14, personRequired: true,  firstnameRequired: true,  query: 'x',         index: undefined, expectInstance: false, firstnameNode: null,     personModule: null,                                                                        severity: 'fail'},
        {test: 15, personRequired: false, firstnameRequired: true,  query: 'x',         index: 0,         expectInstance: true,  firstnameNode: null,     personModule: null,                                                                        severity: 'info'},
        {test: 16, personRequired: true,  firstnameRequired: true,  query: 'x',         index: 0,         expectInstance: false, firstnameNode: null,     personModule: null,                                                                        severity: 'fail'}
    ];
    scenarios.forEach(function (scenario) {
        scenario.description = 'test case: ' + scenario.test + ' (personRequired:' + scenario.personRequired + 'firstnameRequired:' + scenario.firstnameRequired + ' query:' + scenario.query + ' index:' + scenario.index + ')';
        it('evaluates module with ' + scenario.description + ' with sub selectors missing', function (done) {
            var tmpFixture = fixture();

            var subModule = {
                n1: [
                    {person: selector.required(scenario.personRequired).get(getChildren, 'person', 0).module({
                        firstname: selector.required(scenario.firstnameRequired).get(getChildren, scenario.query, scenario.index),
                        n10: 'v10'
                    })},
                    {n11: 'v11'}
                ]
            };
            var logger = new Logger();
            var module = new Module({test: subModule});
            module.evaluate(fixture(), logger).done(function (instance) {
                if (scenario.expectInstance) {
                    expect(instance).not.toBeNull();
                    if (scenario.personModule) {
                        if (scenario.personModule.firstname) {
                            scenario.personModule.firstname.$node = scenario.firstnameNode;
                        }
                    }
                    var actual = instance.test.n1[0].person;
                    expect(actual).toCompareTo(scenario.personModule);
                }
                else {
                    expect(instance).toBeNull();
                }

                if (scenario.severity) {
                    var expectedLog = {
                        severity: scenario.severity,
                        text: 'nothing found',
                        context: {path: ['test', 'n1', '0', 'person', 'firstname', 'get(\'x\')']},
                        data: fixture().customers[0].person
                    };
                    expect(logger.getMessages()[0]).toCompareTo(expectedLog);
                }
                else {
                    expect(logger.getMessages().length).toEqual(0);
                }

                done();
            });

        });
    });

    it('evaluates module with a property "as value"', function (done) {
        var tmpFixture = fixture();

        var subModule = {
            n1: [
                {person: selector.required(true).get(getChildren, 'person', 0).asValue()},
                {n11: 'v11'}
            ]
        };
        var logger = new Logger();
        var module = new Module({test: subModule});
        module.evaluate(fixture(), logger).done(function (instance) {
            var actual = instance.test.n1[0].person;
            var expected = {firstname: 'john', lastname: 'smith'};
            expect(actual).toCompareTo(expected);
            done();
        });

    });

});
