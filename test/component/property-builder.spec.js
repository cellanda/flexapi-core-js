/*global require global describe it expect*/
var constants = require('../../lib/_constants');
var PropertyBuilder = require('../../lib/property-builder');
var helpers = require('../_helpers');
var getChildren = helpers.getChildren;
var fixtures = require('../_fixtures');
var fixture = fixtures.sampleObjectFixture;
var scenarios;


function compile(propertyBuilder) {
    return propertyBuilder[constants.interface.compile]._compile();
}


describe('the test node selector', function () {
    it('works', function (done) {
        getChildren(fixture(), 'person', null, null, function(err, nodes) {
            expect(nodes.length).to.equal(4);
            expect(nodes[1].lastname).to.equal('astair');
            done();
        });
    });
});


describe('property-builder', function () {

    it('evaluates module with property builder used twice', function () {
        var builder = new PropertyBuilder(null, null);
        var completeBuilder1 = builder.get(getChildren, 'firstname')(0);
        var completeBuilder2 = builder.get(getChildren, 'firstname')(0);
        var compiled = compile(completeBuilder2);
        var api = compiled.content;

        var expectedInstance = 'john';

        api._ = fixture();
        return api._
        .then(function (instance) {
            expect(instance).to.compareTo(expectedInstance);
        });
    });

    it('evaluates module with partial property builder used twice, up to "required"', function () {
        var builder = new PropertyBuilder(null, null);
        var partialBuilder = builder.required;
        var completeBuilder1 = partialBuilder.get(getChildren, 'firstname')(0);
        var completeBuilder2 = partialBuilder.get(getChildren, 'firstname')(0);
        var compiled = compile(completeBuilder2);
        var api = compiled.content;

        var expectedInstance = 'john';

        api._ = fixture();
        return api._
        .then(function (instance) {
            expect(instance).to.compareTo(expectedInstance);
        });
    });

    it('evaluates module with partial property builder used twice, up to "get"', function () {
        var builder = new PropertyBuilder(null, null);
        var partialBuilder = builder.required.get(getChildren, 'customers')(0);
        var completeBuilder1 = partialBuilder.get(getChildren, 'lastname')(0);
        var completeBuilder2 = partialBuilder.get(getChildren, 'firstname')(0);
        var compiled = compile(completeBuilder2);
        var api = compiled.content;

        var expectedInstance = 'john';

        api._ = fixture();
        return api._
        .then(function (instance) {
            expect(instance).to.compareTo(expectedInstance);
        });
    });

});
