/*global require global describe it expect*/
var Selector = require('../../lib/selector');
var Property = require('../../lib/property');
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


describe('property', function () {

    describe('evaluates simple property', function () {

        scenarios = [
            { test: 1,  description: 'no module',                       index: 0, module: undefined,                expectedApi: {},      expectedResult: {firstname: 'john', lastname: 'smith'}  },
            { test: 2,  description: 'a null module',                   index: 0, module: null,                     expectedApi: {},      expectedResult: {firstname: 'john', lastname: 'smith'}  },
            { test: 3,  description: 'a module with undefined content', index: 0, module: {content: undefined},     expectedApi: {},      expectedResult: undefined                               },
            { test: 4,  description: 'a module with null content',      index: 0, module: {content: null},          expectedApi: {},      expectedResult: null                                    },
            { test: 5,  description: 'an empty object module',          index: 0, module: {content: {}},            expectedApi: {},      expectedResult: {}                                      },
            { test: 6,  description: 'an empty array module',           index: 0, module: {content: []},            expectedApi: [],      expectedResult: []                                      },
            { test: 7,  description: 'a function',                      index: 0, module: {content: function() {}}, expectedApi: {},      expectedResult: function() {}                           },
            { test: 8,  description: 'a string',                        index: 0, module: {content: 'y'},           expectedApi: {},      expectedResult: 'y'                                     },
            { test: 9,  description: 'a number',                        index: 0, module: {content: 1234567890},    expectedApi: {},      expectedResult: 1234567890                              },
            { test: 10, description: 'a 1 level object',                index: 0, module: {content: {x: 'y'}},      expectedApi: {x: {}}, expectedResult: {x: 'y'}                                },
            { test: 11, description: 'a 1 level array',                 index: 0, module: {content: ['y']},         expectedApi: [{}],    expectedResult: ['y']                                   },
            
            { test: 12, description: 'no module',                       index: 1, module: undefined,                expectedApi: {},      expectedResult: {firstname: 'fred', lastname: 'astair'} },
            { test: 13, description: 'a null module',                   index: 1, module: null,                     expectedApi: {},      expectedResult: {firstname: 'fred', lastname: 'astair'} },
            { test: 14, description: 'a module with undefined content', index: 1, module: {content: undefined},     expectedApi: {},      expectedResult: undefined                               },
            { test: 15, description: 'a module with null content',      index: 1, module: {content: null},          expectedApi: {},      expectedResult: null                                    },
            { test: 16, description: 'an empty object module',          index: 1, module: {content: {}},            expectedApi: {},      expectedResult: {}                                      },
            { test: 17, description: 'an empty array module',           index: 1, module: {content: []},            expectedApi: [],      expectedResult: []                                      },
            { test: 18, description: 'a function',                      index: 1, module: {content: function() {}}, expectedApi: {},      expectedResult: function() {}                           },
            { test: 19, description: 'a string',                        index: 1, module: {content: 'y'},           expectedApi: {},      expectedResult: 'y'                                     },
            { test: 20, description: 'a number',                        index: 1, module: {content: 1234567890},    expectedApi: {},      expectedResult: 1234567890                              },
            { test: 21, description: 'a 1 level object',                index: 1, module: {content: {x: 'y'}},      expectedApi: {x: {}}, expectedResult: {x: 'y'}                                },
            { test: 22, description: 'a 1 level array',                 index: 1, module: {content: ['y']},         expectedApi: [{}],    expectedResult: ['y']                                   },
            
            { test: 23, description: 'no module',                       index: 9, module: undefined,                expectedApi: {},      expectedResult: null                                    },
            { test: 24, description: 'a null module',                   index: 9, module: null,                     expectedApi: {},      expectedResult: null                                    },
            { test: 25, description: 'a module with undefined content', index: 9, module: {content: undefined},     expectedApi: {},      expectedResult: null                                    },
            { test: 26, description: 'a module with null content',      index: 9, module: {content: null},          expectedApi: {},      expectedResult: null                                    },
            { test: 27, description: 'an empty object module',          index: 9, module: {content: {}},            expectedApi: {},      expectedResult: null                                    },
            { test: 28, description: 'an empty array module',           index: 9, module: {content: []},            expectedApi: [],      expectedResult: null                                    },
            { test: 29, description: 'a function',                      index: 9, module: {content: function() {}}, expectedApi: {},      expectedResult: null                                    },
            { test: 30, description: 'a string',                        index: 9, module: {content: 'y'},           expectedApi: {},      expectedResult: null                                    },
            { test: 31, description: 'a number',                        index: 9, module: {content: 1234567890},    expectedApi: {},      expectedResult: null                                    },
            { test: 32, description: 'a 1 level object',                index: 9, module: {content: {x: 'y'}},      expectedApi: {x: {}}, expectedResult: null                                    },
            { test: 33, description: 'a 1 level array',                 index: 9, module: {content: ['y']},         expectedApi: [{}],    expectedResult: null                                    }
        ];
        scenarios.forEach(function (scenario) {
            var description = scenario.description + '(test case: ' + scenario.test + ')';

            it('with a unique single level selector and ' + description, function (done) {
                var property = new Property(null);
                property.selector.addGet('children', getChildren, 'person', scenario.index);
                property.module = scenario.module;

                var logger = new Logger();

                var api = property.compile(null, logger);
                expect(api).toCompareTo(scenario.expectedApi);

                api._ = fixture();
                api._
                .then(function (result) {
                    try {
                        expect(result).toCompareTo(scenario.expectedResult);
                        done();
                    }
                    catch(ex) {
                        expect(ex.toString()).toBe(false);
                        done();
                    }
                });
            });

            it('with an indexed list single level selector and ' + description, function (done) {
                var property = new Property(null);
                property.selector.addGet('children', getChildren, 'person');
                property.module = scenario.module;

                var logger = new Logger();

                var api = property.compile(null, logger);
                expect(typeof(api)).toBe('function');

                expect(api(scenario.index)).toCompareTo(scenario.expectedApi);

                api._ = fixture();
                api(scenario.index)._
                .then(function (result) {
                    try {
                        expect(result).toCompareTo(scenario.expectedResult);
                        done();
                    }
                    catch(ex) {
                        expect(ex.toString()).toBe(false);
                        done();
                    }
                });
            });

        });
    });


    describe('evaluates simple property with an unindexed list single level selector and', function () {

        it('no module', function (done) {
            var property = new Property(null);
            property.selector.addGet('children', getChildren, 'person');

            var logger = new Logger();

            var expectedApi = {};
            var expectedResult = [
                {
                    firstname: 'john',
                    lastname: 'smith'
                },
                {
                    firstname: 'fred',
                    lastname: 'astair'
                },
                {
                    lastname: 'brookes'
                },
                {
                    firstname: 'stanley',
                    lastname: 'jones'
                }
            ];

            var api = property.compile(null, logger);
            expect(typeof(api)).toBe('function');

            expect(api(0)).toCompareTo(expectedApi);

            api._ = fixture();
            api._
            .then(function (result) {
                try {
                    expect(result).toCompareTo(expectedResult);
                    done();
                }
                catch(ex) {
                    expect(ex.toString()).toBe(false);
                    done();
                }
            });
        });

        it('a constant object module', function (done) {
            var property = new Property(null);
            property.selector.addGet('children', getChildren, 'person');
            property.module = {content: {test: 'value'}};

            var logger = new Logger();

            var expectedApi = {test: {}};
            var expectedResult = [{test: 'value'},{test: 'value'}, {test: 'value'}, {test: 'value'}];

            var api = property.compile(null, logger);
            expect(typeof(api)).toBe('function');

            expect(api(0)).toCompareTo(expectedApi);

            api._ = fixture();
            api._
            .then(function (result) {
                try {
                    expect(result).toCompareTo(expectedResult);
                    done();
                }
                catch(ex) {
                    expect(ex.toString()).toBe(false);
                    done();
                }
            });
        });

    });

});
