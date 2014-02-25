/*global require global describe it expect*/
var Module = require('../lib/module');
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

    it('evaluates an empty object module', function (done) {
        var module = new Module({});

        var expectedInstance = {};
        expectedInstance.$node = fixture();

        module.evaluate(fixture()).done(function (instance) {
            expect(instance).toCompareTo(expectedInstance);
            done();
        });
    });

    it('evaluates an empty array module', function (done) {
        var module = new Module([]);

        var expectedInstance = [];
        expectedInstance.$node = fixture();

        module.evaluate(fixture()).done(function (instance) {
            expect(instance).toCompareTo(expectedInstance);
            done();
        });
    });

    it('evaluates a 1 level object module', function (done) {
        var subModule = 'value';
        var module = new Module({test: subModule});

        var expectedInstance = {$node: fixture, test: subModule};

        var instance = module.evaluate(fixture).done(function (instance) {
            expect(instance).toCompareTo(expectedInstance);
            done();
        });
    });

    it('evaluates a complex static object module', function (done) {
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
        var tmpFixture = 'fixture';
        var module = new Module({test: subModule()});

        var expectedInstance = {test: subModule()};
        expectedInstance.$node = tmpFixture;
        expectedInstance.test.$node = tmpFixture;
        expectedInstance.test.n1.$node = tmpFixture;
        expectedInstance.test.n1[0].$node = tmpFixture;
        expectedInstance.test.n1[1].$node = tmpFixture;
        expectedInstance.test.n2.$node = tmpFixture;

        module.evaluate(tmpFixture).done(function (instance) {
            expect(instance).toCompareTo(expectedInstance);
            done();
        });
    });

    it('evaluates a complex static array module', function (done) {
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
        var tmpFixture = 'fixture';
        var module = new Module([subModule()]);

        var expectedInstance = [subModule()];
        expectedInstance.$node = tmpFixture;
        expectedInstance[0].$node = tmpFixture;
        expectedInstance[0][0].$node = tmpFixture;
        expectedInstance[0][0][0].$node = tmpFixture;
        expectedInstance[0][0][1].$node = tmpFixture;
        expectedInstance[0][1].$node = tmpFixture;

        var instance = module.evaluate(tmpFixture).done(function (instance) {
            expect(instance).toCompareTo(expectedInstance);
            done();
        });
    });

});
