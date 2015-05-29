/*global require global describe it expect*/
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


describe('module evaluate', function () {

    it('evaluates an undefined module', function () {
        var module = new Module(undefined);

        var expectedResult = undefined;

        return module.evaluate(null, fixture())
        .then(function (result) {
            expect(result).to.compareTo(fixture());
        });
    });

    scenarios = [
        { test: 1,   description: 'undefined module',                module: undefined,                                          expectedApi: {},            expectedResult: {anything: null}     },
        { test: 2,   description: 'null module',                     module: null,                                               expectedApi: {},            expectedResult: {anything: null}     },
        { test: 3,   description: 'undefined content',               module: {content: undefined},                               expectedApi: {},            expectedResult: undefined            },
        { test: 4,   description: 'null content',                    module: {content: null},                                    expectedApi: {},            expectedResult: null                 },
        { test: 5,   description: 'an empty object',                 module: {content: {}},                                      expectedApi: {},            expectedResult: {}                   },
        { test: 6,   description: 'an empty array',                  module: {content: []},                                      expectedApi: [],            expectedResult: []                   },
        { test: 7,   description: 'a function',                      module: {content: function() {}},                           expectedApi: {},            expectedResult: function() {}        },
        { test: 8,   description: 'a string',                        module: {content: 'y'},                                     expectedApi: {},            expectedResult: 'y'                  },
        { test: 9,   description: 'a number',                        module: {content: 1234567890},                              expectedApi: {},            expectedResult: 1234567890           },
        { test: 10,  description: 'a 1 level object',                module: {content: {x: 'y'}},                                expectedApi: {x: {}},       expectedResult: {x: 'y'}             },
        { test: 11,  description: 'a 1 level array',                 module: {content: ['y']},                                   expectedApi: [{}],          expectedResult: ['y']                },
        { test: 12,  description: 'a submodule of undefined',        module: {content: {x1: Module({content: undefined})}},      expectedApi: {x1: {}},      expectedResult: {x1: undefined}      },
        { test: 13,  description: 'a submodule of null',             module: {content: {x1: Module({content: null})}},           expectedApi: {x1: {}},      expectedResult: {x1: null}           },
        { test: 14,  description: 'a submodule of an empty object',  module: {content: {x1: Module({content: {}})}},             expectedApi: {x1: {}},      expectedResult: {x1: {}}             },
        { test: 15,  description: 'a submodule of an empty array',   module: {content: {x1: Module({content: []})}},             expectedApi: {x1: []},      expectedResult: {x1: []}             },
        { test: 16,  description: 'a submodule of a function',       module: {content: {x1: Module({content: function () {}})}}, expectedApi: {x1: {}},      expectedResult: {x1: function () {}} },
        { test: 17,  description: 'a submodule of a string',         module: {content: {x1: Module({content: 'y'})}},            expectedApi: {x1: {}},      expectedResult: {x1: 'y'}            },
        { test: 18,  description: 'a submodule of a number',         module: {content: {x1: Module({content: 1234567890})}},     expectedApi: {x1: {}},      expectedResult: {x1: 1234567890}     },
        { test: 19,  description: 'a submodule of a 1 level object', module: {content: {x1: Module({content: {x: 'y'}})}},       expectedApi: {x1: {x: {}}}, expectedResult: {x1: {x: 'y'}}       },
        { test: 20,  description: 'a submodule of a 1 level array',  module: {content: {x1: Module({content: ['y']})}},          expectedApi: {x1: [{}]},    expectedResult: {x1: ['y']}          }
    ];
    scenarios.forEach(function (scenario) {
        var description = 'test case: ' + scenario.test + ': evaulates ' + scenario.description;
        it(description, function () {
            var module = new Module(scenario.module);
            var node = {anything: null};

            var expectedApi = scenario.expectedApi;
            var expectedResult = scenario.expectedResult;


            var api = module.compile(null);
            expect(api).to.compareTo(expectedApi);
            api._ = node;
            return api._
            .then(function (result) {
                expect(result).to.compareTo(expectedResult);
            });
        });
    });

    it('evaluates a complex static object module', function () {
        var subModule = function () {
            return {
                n1: [
                    {n10: 'v10'},
                    {n11: 'v11'}
                ],
                n2: {
                    n20: 'v20',
                    n21: 'v21'
                }
            };
        };
        var module = new Module({content: {test: subModule()}});
        var node = {anything: null};

        var expectedApi = {
            test: {
                n1: [
                    {n10: {}},
                    {n11: {}}
                ],
                n2: {
                    n20: {},
                    n21: {}
                }
            }
        };
        var expectedResult = {test: subModule()};

        var api = module.compile(null);
        expect(api).to.compareTo(expectedApi);
        api._ = node;
        return api._
        .then(function (result) {
            expect(result).to.compareTo(expectedResult);
        });
    });

    it('evaluates a complex static array module', function () {
        var subModule = function () {
            return [
                [
                    {n10: 'v10'},
                    {n11: 'v11'}
                ],
                {
                    n20: 'v20',
                    n21: 'v21'
                }
            ];
        };
        var module = new Module({content: {test: subModule()}});
        var node = {anything: null};

        var expectedApi = {
            test: [
                [
                    {n10: {}},
                    {n11: {}}
                ],
                {
                    n20: {},
                    n21: {}
                }
            ]
        };
        var expectedResult = {test: subModule()};

        var api = module.compile(null);
        expect(api).to.compareTo(expectedApi);
        api._ = node;
        return api._
        .then(function (result) {
            expect(result).to.compareTo(expectedResult);
        });
    });

});
