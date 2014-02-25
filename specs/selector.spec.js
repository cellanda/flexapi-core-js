/*global require global describe it expect*/
var Selector = require('../lib/selector');
var Logger = require('../lib/logger');
var fixtures = require('./_fixtures');
var fixture = fixtures.sampleObjectFixture();
var getChildren = fixtures.getChildren;


describe('the test node selector', function () {
    it('works', function () {
        var nodes = getChildren(fixture, 'person');

        expect(nodes.length).toEqual(4);
        expect(nodes[1].lastname).toEqual('astair');
    });
});


describe('page map selector', function () {

    it('has the correct initial properties', function () {
        var rootSelector = new Selector();
        expect(rootSelector.$isSelector).toBeFalsy();
        expect(rootSelector.$firstStep).toBeFalsy();
    });

    it('steps are added', function () {
        var rootSelector = new Selector();
        var selector;
        var step;

        selector = rootSelector.get(getChildren, 'person', 1);
        expect(rootSelector.$isSelector).toBeFalsy();
        expect(rootSelector.$firstStep).toBeUndefined();
        expect(selector.$firstStep).toBeDefined();
        expect(selector.$lastStep).toBeDefined();
        expect(selector.$firstStep.$next).toBeUndefined();

        step = selector.$firstStep;
        expect(selector.$lastStep).toEqual(step);
        expect(step.$next).toBeUndefined();
        expect(step.$index).toBe(1);
        expect(step.$query).toBe('person');


        selector = selector.get(getChildren, 'person1', 2);
        expect(rootSelector.$isSelector).toBeFalsy();
        expect(rootSelector.$firstStep).toBeUndefined();
        expect(selector.$firstStep).toBeDefined();
        expect(selector.$lastStep).toBeDefined();
        expect(selector.$lastStep).not.toEqual(selector.$firstStep);
        expect(selector.$firstStep.$next).toBeDefined();
        expect(selector.$lastStep).toEqual(selector.$firstStep.$next);

        step = selector.$firstStep;
        expect(selector.$lastStep).not.toEqual(step);
        expect(step.$next).toBeDefined();
        expect(step.$index).toBe(1);
        expect(step.$query).toBe('person');

        step = step.$next;
        expect(selector.$lastStep).toEqual(step);
        expect(step.$next).toBeUndefined();
        expect(step.$index).toBe(2);
        expect(step.$query).toBe('person1');
    });

    it('evaluates 1 indexed step', function (done) {
        var logger = new Logger();
        var rootSelector = new Selector();
        rootSelector.setLogger(logger);
        var selector = rootSelector.get(getChildren, 'person', 1);
        selector.evaluate(fixture).done(function (node) {
            expect(node.firstname).toEqual('fred');
            expect(node.lastname).toEqual('astair');
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
    });

    it('evaluates 2 indexed step', function (done) {
        var logger = new Logger();
        var rootSelector = new Selector();
        rootSelector.setLogger(logger);
        var selector = rootSelector.get(getChildren, 'person', 1);
        selector = selector.get(getChildren, 'firstname', 0);
        selector.evaluate(fixture).done(function (node) {
            expect(node).toEqual('fred');
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
    });

    it('evaluates 1 unindexed step', function (done) {
        var logger = new Logger();
        var rootSelector = new Selector();
        rootSelector.setLogger(logger);
        var selector = rootSelector.get(getChildren, 'person');
        selector.evaluate(fixture).done(function (nodeList) {
            expect(nodeList.length).toEqual(4);
            expect(nodeList[1].firstname).toEqual('fred');
            expect(nodeList[1].lastname).toEqual('astair');
            expect(nodeList[2].firstname).toBeUndefined();
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
    });

    it('evaluates 1 unindexed step and 1 indexed step', function (done) {
        var logger = new Logger();
        var rootSelector = new Selector();
        rootSelector.setLogger(logger);
        var selector = rootSelector.get(getChildren, 'person');
        selector = selector.get(getChildren, 'firstname', 0);
        selector.evaluate(fixture).done(function (nodeList) {
            expect(nodeList.length).toEqual(3);
            expect(nodeList[1]).toEqual('fred');
            expect(logger.getMessages().length).toEqual(1);
            done();
        });
    });

    it('evaluates 2 unindexed steps', function (done) {
        var logger = new Logger();
        var rootSelector = new Selector();
        rootSelector.setLogger(logger);
        var selector = rootSelector.get(getChildren, 'employees').get(getChildren, 'firstname');
        selector.evaluate(fixture).done(function (nodeList) {
            expect(nodeList.length).toEqual(1);
            expect(nodeList[0]).toEqual('stanley');
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
    });

    it('evaluates 1 indexed step with nothing found', function (done) {
        var logger = new Logger();
        var rootSelector = new Selector();
        rootSelector.setLogger(logger);

        var expectedLog = {
            severity: 'fail',
            text: 'nothing found',
            context: {path: ['get(\'x\')']},
            data: fixture
        };

        var selector = rootSelector.get(getChildren, 'x', 1);
        selector = selector.get(getChildren, 'y', 1);
        selector.evaluate(fixture).done(function (node) {
            expect(node).toBeNull();
            expect(logger.getMessages().length).toEqual(1);
            expect(logger.getMessages()[0]).toCompareTo(expectedLog);
            done();
        });
    });

});
