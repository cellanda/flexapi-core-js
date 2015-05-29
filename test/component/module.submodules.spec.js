/*global require global describe it expect*/
var q = require("q");
var mapper = require('../../lib/mapper');
var Module = require('../../lib/module');
var Selector = require('../../lib/selector');
var Logger = require('../../lib/logger');
var helpers = require('../_helpers');
var getChildren = helpers.getChildren;
var fixtures = require('../_fixtures');
var fixture = fixtures.sampleObjectFixture;
var scenarios;

var SubmoduleSimple = {
    content: {
        firstname: mapper.property.required.get(getChildren, 'firstname', 0)
    }
};

var SubmoduleEarlyBind = function (mapper) {
    return {
        content: {
            firstname: mapper.property.required.get(getChildren, 'firstname', 0)
        }
    };
};


var SubmoduleLateBind = function (mapper) {
    return {
        evaluate: function (mapper, node) {
            return mapper.evaluate(this, node).then (function (result) {
                result.nodeParameter = node;
                return result;
            })
        },
        content: {
            firstname: mapper.property.required.get(getChildren, 'firstname', 0),
            nodeParameter: undefined
        }
    };
};


var SubmoduleLateBindWithError = function (mapper) {
    return {
        evaluate: function (mapper, node) {
            return mapper.evaluate(this, node).then (function (result) {
                result.nodeParameter = node;
                return result;
            })
        },
        content: {
            firstname: mapper.property.required.get(getChildren, 'x', 0),
            nodeParameter: undefined
        }
    };
};


var SubmoduleLateBindPromise = function (mapper) {
    return q({
        transform: function (mapper, node) {
            return mapper.transform(this, node).then (function (result) {
                result.nodeParameter = node;
                return result;
            })
        },
        content: {
            firstname: mapper.property.required.get(getChildren, 'firstname', 0),
            nodeParameter: undefined
        }
    });
};


describe('the test node selector', function () {
    it('works', function (done) {
        getChildren(fixture(), ['person'], null, null, function(err, nodes) {
            expect(nodes.length).to.equal(4);
            expect(nodes[1].lastname).to.equal('astair');
            done();
        });
    });
});


xdescribe('module submodules', function () {

    it('evaluates a simple encapsulated submodule', function (done) {
        var tmpFixture = fixture();

        var testModule = {
            content: {
                person: mapper.property.required.get(getChildren, 'person', 0).module(SubmoduleSimple)
            }
        };
        var logger = new Logger();
        var module = new Module(testModule);

        var expectedInstance = {
            person: {
                firstname: 'john'
            }
        };

        module.evaluate(mapper, fixture(), logger).then(function (instance) {
            expect(instance).not.to.be.null;
            expect(instance).to.compareTo(expectedInstance);
            expect(logger.getMessages().length).to.equal(0);
        })
        .catch(function (err) {
            expect(err).to.be.undefined;
        })
        .finally(function () {
            done();
        });

    });

    it('evaluates an early bound encapsulated submodule', function (done) {
        var tmpFixture = fixture();

        var testModule = {
            content: {
                person: mapper.property.required(true).get(getChildren, 'person', 0).module(new SubmoduleEarlyBind(mapper))
            }
        };
        var logger = new Logger();
        var module = new Module(testModule);

        var expectedInstance = {
            person: {
                firstname: 'john'
            }
        };

        module.evaluate(mapper, fixture(), logger).then(function (instance) {
            expect(instance).not.to.be.null;
            expect(instance).to.compareTo(expectedInstance);
            expect(logger.getMessages().length).to.equal(0);
        })
        .catch(function (err) {
            expect(err).to.be.undefined;
        })
        .finally(function () {
            done();
        });

    });

    it('evaluates a late bound encapsulated submodule', function (done) {
        var tmpFixture = fixture();

        var testModule = {
            content: {
                person: mapper.property.required(true).get(getChildren, 'person', 0).module(SubmoduleLateBind)
            }
        };
        var logger = new Logger();
        var module = new Module(testModule);

        var expectedInstance = {
            person: {
                firstname: 'john',
                nodeParameter: {
                    firstname: 'john',
                    lastname: 'smith'
                }
            }
        };

        module.evaluate(mapper, fixture(), logger).then(function (instance) {
            expect(instance).not.to.be.null;
            expect(instance).to.compareTo(expectedInstance);
            expect(logger.getMessages().length).to.equal(0);
        })
        .catch(function (err) {
            expect(err).to.be.undefined;
        })
        .finally(function () {
            done();
        });

    });

    it('evaluates a late bound encapsulated submodule with a selector error', function (done) {
        var tmpFixture = fixture();

        var testModule = {
            content: {
                person: mapper.property.required(true).get(getChildren, 'person', 0).module(SubmoduleLateBindWithError)
            }
        };
        var logger = new Logger();
        var module = new Module(testModule);

        var expectedInstance = {};
        var expectedLog = {
            severity: 'fail',
            context: {path: ['person', 'firstname', 'get(\'x\')']},
            text: 'nothing found',
            data: { firstname: 'john', lastname: 'smith' }
        }

        module.evaluate(mapper, fixture(), logger).then(function (instance) {
            expect(instance).not.to.be.null;
            expect(instance).to.compareTo(expectedInstance);
            expect(logger.getMessages().length).to.equal(1);
            expect(logger.getMessages()[0]).to.compareTo(expectedLog);
        })
        .catch(function (err) {
            expect(err).to.be.undefined;
        })
        .finally(function () {
            done();
        });

    });

    it('evaluates a late bound encapsulated submodule that returns a promise', function (done) {
        var tmpFixture = fixture();

        var testModule = {
            person: mapper.property.required(true).get(getChildren, 'person', 0).module(SubmoduleLateBindPromise)
        };
        var logger = new Logger();
        var module = new Module({content: testModule});

        var expectedInstance = {
            person: {
                firstname: 'john',
                nodeParameter: {
                    firstname: 'john',
                    lastname: 'smith'
                }
            }
        };

        module.evaluate(mapper, fixture(), logger).then(function (instance) {
            expect(instance).not.to.be.null;
            expect(instance).to.compareTo(expectedInstance);
            expect(logger.getMessages().length).to.equal(0);
        })
        .catch(function (err) {
            expect(err).to.be.undefined;
        })
        .finally(function () {
            done();
        });

    });
});
