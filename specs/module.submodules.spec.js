/*global require global describe it expect*/
var q = require("q");
var Module = require('../lib/module');
var selector = require('../lib/selector')();
var Logger = require('../lib/logger');
var fixtures = require('./_fixtures');
var fixture = fixtures.sampleObjectFixture;
var getChildren = fixtures.getChildren;
var scenarios;

var SubmoduleSimple = {
    firstname: selector.required(true).get(getChildren, 'firstname', 0)
};

var SubmoduleEarlyBind = function (selector) {
    return {
        firstname: selector.required(true).get(getChildren, 'firstname', 0)
    };
};


var SubmoduleLateBind = function (selector, node) {
    return {
        firstname: selector.required(true).get(getChildren, 'firstname', 0),
        nodeParameter: node
    };
};


var SubmoduleLateBindPromise = function (selector, node) {
    return q({
        firstname: selector.required(true).get(getChildren, 'firstname', 0),
        nodeParameter: node
    });
};


describe('the test node selector', function () {
    it('works', function () {
        var nodes = getChildren(fixture(), 'person');

        expect(nodes.length).toEqual(4);
        expect(nodes[1].lastname).toEqual('astair');
    });
});


describe('page map moduleInstance', function () {

    it('evaluates a simple encapsulated submodule', function (done) {
        var tmpFixture = fixture();

        var testModule = {
            person: selector.required(true).get(getChildren, 'person', 0).module(SubmoduleSimple)
        };
        var logger = new Logger();
        var module = new Module(testModule);

        var expectedInstance = {
            $node: fixture(),
            person: {
                $node: {firstname: 'john', lastname: 'smith'},
                firstname: {
                    $node: 'john'
                }
            }
        };

        module.evaluate(fixture(), logger).done(function (instance) {
            expect(instance).not.toBeNull();
            expect(instance).toCompareTo(expectedInstance);
            done();
        });

    });

    it('evaluates an early bound encapsulated submodule', function (done) {
        var tmpFixture = fixture();

        var testModule = {
            person: selector.required(true).get(getChildren, 'person', 0).module(new SubmoduleEarlyBind(selector))
        };
        var logger = new Logger();
        var module = new Module(testModule);

        var expectedInstance = {
            $node: fixture(),
            person: {
                $node: {firstname: 'john', lastname: 'smith'},
                firstname: {
                    $node: 'john'
                }
            }
        };

        module.evaluate(fixture(), logger).done(function (instance) {
            expect(instance).not.toBeNull();
            expect(instance).toCompareTo(expectedInstance);
            done();
        });

    });

    it('evaluates a late bound encapsulated submodule', function (done) {
        var tmpFixture = fixture();

        var testModule = {
            person: selector.required(true).get(getChildren, 'person', 0).module(SubmoduleLateBind)
        };
        var logger = new Logger();
        var module = new Module(testModule);

        var expectedInstance = {
            $node: fixture(),
            person: {
                $node: {firstname: 'john', lastname: 'smith'},
                firstname: {
                    $node: 'john'
                },
                nodeParameter: {
                    $node: {firstname: 'john', lastname: 'smith'},
                    firstname: 'john',
                    lastname: 'smith'
                }
            }
        };

        module.evaluate(fixture(), logger).done(function (instance) {
            expect(instance).not.toBeNull();
            expect(instance).toCompareTo(expectedInstance);
            done();
        });

    });

    it('evaluates a late bound encapsulated submodule that returns a promise', function (done) {
        var tmpFixture = fixture();

        var testModule = {
            person: selector.required(true).get(getChildren, 'person', 0).module(SubmoduleLateBindPromise)
        };
        var logger = new Logger();
        var module = new Module(testModule);

        var expectedInstance = {
            $node: fixture(),
            person: {
                $node: {firstname: 'john', lastname: 'smith'},
                firstname: {
                    $node: 'john'
                },
                nodeParameter: {
                    $node: {firstname: 'john', lastname: 'smith'},
                    firstname: 'john',
                    lastname: 'smith'
                }
            }
        };

        module.evaluate(fixture(), logger).done(function (instance) {
            expect(instance).not.toBeNull();
            expect(instance).toCompareTo(expectedInstance);
            done();
        });

    });
});
