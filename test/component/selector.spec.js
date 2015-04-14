/*global require global describe it expect*/
var Selector = require('../../lib/selector');
var Logger = require('../../lib/logger');
var helpers = require('../_helpers');
var getChildren = helpers.getChildren;
var fixtures = require('../_fixtures');
var fixture = fixtures.sampleObjectFixture();


describe('the test node selector', function () {
    it('works', function (done) {
        getChildren(fixture, 'person', null, null, function(err, nodes) {
            expect(nodes.length).toEqual(4);
            expect(nodes[1].lastname).toEqual('astair');
            done();
        });
    });
});


describe('selector', function () {

    it('steps are added', function () {
        var selector = new Selector();
        var step;

        selector.addGet('children', getChildren, 'person', 1);
        expect(selector.$firstStep).toBeDefined();
        expect(selector.$lastStep).toBeDefined();
        expect(selector.$firstStep.$next).toBeUndefined();

        step = selector.$firstStep;
        expect(selector.$lastStep).toEqual(step);
        expect(step.$next).toBeUndefined();
        expect(step.$name).toBe('children');
        expect(step.$index).toBe(1);
        expect(step.$query).toBe('person');


        selector.addGet('children', getChildren, 'person1', 2);
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
        var selector = new Selector();
        selector.addLogger(logger);
        selector.addGet('children', getChildren, 'person', 1);
        selector.evaluate(fixture).done(function (node) {
            expect(node.firstname).toEqual('fred');
            expect(node.lastname).toEqual('astair');
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
    });

    it('evaluates 2 indexed step', function (done) {
        var logger = new Logger();
        var selector = new Selector();
        selector.addLogger(logger);
        selector.addGet('children', getChildren, 'person', 1);
        selector.addGet('children', getChildren, 'firstname', 0);
        selector.evaluate(fixture).done(function (node) {
            expect(node).toEqual('fred');
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
    });

    it('evaluates 1 unindexed step', function (done) {
        var logger = new Logger();
        var selector = new Selector();
        selector.addLogger(logger);
        selector.addGet('children', getChildren, 'person');
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
        var selector = new Selector();
        selector.addLogger(logger);
        selector.addGet('children', getChildren, 'person');
        selector.addGet('children', getChildren, 'firstname', 0);
        selector.evaluate(fixture).done(function (nodeList) {
            expect(nodeList.length).toEqual(3);
            expect(nodeList[1]).toEqual('fred');
            expect(logger.getMessages().length).toEqual(1);
            done();
        });
    });

    it('evaluates 1 unindexed step and 1 indexed step where the index is too high', function (done) {
        var logger = new Logger();
        var selector = new Selector();
        selector.addLogger(logger);
        selector.addGet('children', getChildren, 'person');
        selector.addGet('children', getChildren, 'firstname', 9);
        selector.evaluate(fixture).done(function (nodeList) {
            expect(nodeList.length).toEqual(0);
            expect(nodeList[1]).toEqual(undefined);
            expect(logger.getMessages().length).toEqual(4);
            done();
        });
    });

    it('evaluates 2 unindexed steps', function (done) {
        var logger = new Logger();
        var selector = new Selector();
        selector.addLogger(logger);
        selector.addGet('children', getChildren, 'employees');
        selector.addGet('children', getChildren, 'firstname');
        selector.evaluate(fixture).done(function (nodeList) {
            expect(nodeList.length).toEqual(1);
            expect(nodeList[0]).toEqual('stanley');
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
    });

    it('evaluates 1 indexed step with nothing found', function (done) {
        var isRequired = true;
        var logger = new Logger();
        var selector = new Selector();
        selector.addLogger(logger);

        var expectedLogX = {
            severity: 'fail',
            text: 'nothing found',
            context: {path: ['get.children(\'x\')']},
            data: fixture
        };

        var expectedLogY = {
            severity: 'fail',
            text: 'no node',
            context: {path: ['get.children(\'x\')', 'get.moreChildren(\'y\')']}
        };

        selector.addGet('children', getChildren, 'x', 1);
        selector.addGet('moreChildren', getChildren, 'y', 1);
        selector.evaluate(fixture, isRequired).done(function (node) {
            expect(node).toBeNull();
            expect(logger.getMessages().length).toEqual(2);
            expect(logger.getMessages()[0]).toCompareTo(expectedLogX);
            expect(logger.getMessages()[1]).toCompareTo(expectedLogY);
            done();
        });
    });

    it('creates a clone', function (done) {
        var logger = new Logger();
        var selector = new Selector();

        selector.addLogger(logger);
        selector.addGet('children', getChildren, 'employees');
        selector.addGet('children', getChildren, 'firstname');

        var clone = selector.clone();
        selector.addGet('children', getChildren, 'xx');

        clone.evaluate(fixture).done(function (nodeList) {
            expect(nodeList.length).toEqual(1);
            expect(nodeList[0]).toEqual('stanley');
            expect(logger.getMessages().length).toEqual(0);
            done();
        });
    });

});
