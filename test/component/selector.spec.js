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
            expect(nodes.length).to.equal(4);
            expect(nodes[1].lastname).to.equal('astair');
            done();
        });
    });
});


describe('selector', function () {

    it('steps are added', function () {
        var selector = new Selector();
        var step;

        selector.addGet('children', getChildren, 'person', 1);
        expect(selector.$firstStep).to.not.be.undefined;
        expect(selector.$lastStep).to.not.be.undefined;
        expect(selector.$firstStep.$next).to.be.undefined;

        step = selector.$firstStep;
        expect(selector.$lastStep).to.equal(step);
        expect(step.$next).to.be.undefined;
        expect(step.$name).to.equal('children');
        expect(step.$index).to.equal(1);
        expect(step.$query).to.equal('person');


        selector.addGet('children', getChildren, 'person1', 2);
        expect(selector.$firstStep).to.not.be.undefined;
        expect(selector.$lastStep).to.not.be.undefined;
        expect(selector.$lastStep).not.to.equal(selector.$firstStep);
        expect(selector.$firstStep.$next).to.not.be.undefined;
        expect(selector.$lastStep).to.equal(selector.$firstStep.$next);

        step = selector.$firstStep;
        expect(selector.$lastStep).not.to.equal(step);
        expect(step.$next).to.not.be.undefined;
        expect(step.$index).to.equal(1);
        expect(step.$query).to.equal('person');

        step = step.$next;
        expect(selector.$lastStep).to.equal(step);
        expect(step.$next).to.be.undefined;
        expect(step.$index).to.equal(2);
        expect(step.$query).to.equal('person1');
    });

    it('evaluates 1 indexed step', function (done) {
        var logger = new Logger();
        var selector = new Selector();
        selector.addLogger(logger);
        selector.addGet('children', getChildren, 'person', 1);
        selector.evaluate(fixture).done(function (node) {
            expect(node.firstname).to.equal('fred');
            expect(node.lastname).to.equal('astair');
            expect(logger.getMessages().length).to.equal(0);
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
            expect(node).to.equal('fred');
            expect(logger.getMessages().length).to.equal(0);
            done();
        });
    });

    it('evaluates 1 unindexed step', function (done) {
        var logger = new Logger();
        var selector = new Selector();
        selector.addLogger(logger);
        selector.addGet('children', getChildren, 'person');
        selector.evaluate(fixture).done(function (nodeList) {
            expect(nodeList.length).to.equal(4);
            expect(nodeList[1].firstname).to.equal('fred');
            expect(nodeList[1].lastname).to.equal('astair');
            expect(nodeList[2].firstname).to.be.undefined;
            expect(logger.getMessages().length).to.equal(0);
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
            expect(nodeList.length).to.equal(3);
            expect(nodeList[1]).to.equal('fred');
            expect(logger.getMessages().length).to.equal(1);
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
            expect(nodeList.length).to.equal(0);
            expect(nodeList[1]).to.equal(undefined);
            expect(logger.getMessages().length).to.equal(4);
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
            expect(nodeList.length).to.equal(1);
            expect(nodeList[0]).to.equal('stanley');
            expect(logger.getMessages().length).to.equal(0);
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
            expect(node).to.be.null;
            expect(logger.getMessages().length).to.equal(2);
            expect(logger.getMessages()[0]).to.compareTo(expectedLogX);
            expect(logger.getMessages()[1]).to.compareTo(expectedLogY);
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
            expect(nodeList.length).to.equal(1);
            expect(nodeList[0]).to.equal('stanley');
            expect(logger.getMessages().length).to.equal(0);
            done();
        });
    });

});
