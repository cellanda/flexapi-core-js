/*global require global describe it expect*/


/*------------------------------------------------------------------------------
A use-case example

using a dynamic map definition by using the node parameter in the lastnames-module definition
using a custom logger
using no custom getters
using a separate file to define the mapper
using a separate file to define a mapping module
------------------------------------------------------------------------------*/


var myMapper = require('./my-mapper');

var lastnamesModule = require('./lastnames-module')

var helpers = require('../../_helpers');
var getChildren = helpers.getChildren;
var fixtures = require('../../_fixtures');
var fixture = fixtures.sampleObjectFixture;


xdescribe('use-cases customized module', function () {

    it('transforms an object', function (done) {
        var mapper = myMapper;

        var objectToTransform = new fixture();

        var transformationModule = {
            content: {
                people: mapper.property.get(getChildren, 'person'),
                employeeLastnames: mapper.property.get(getChildren, 'employees')(0).module(lastnamesModule),
                customerFirstnames: mapper.property.get(getChildren, 'customers')(0).get(getChildren, 'firstname'),
                middlenames: mapper.property.get(getChildren, 'middlename'),
                firstMiddlename: mapper.property.get(getChildren, 'middlename')(0),
                employeeMiddlenamesOptional: mapper.property.get(getChildren, 'employees')(0).content({
                    middlenames: mapper.property.required(false).get(getChildren, 'middlename')
                }),
                employeeMiddlenamesRequired: mapper.property.get(getChildren, 'employees')(0).content({
                    middlenames: mapper.property.required(true).get(getChildren, 'middlename')
                })
            }
        };

        var transformedObject;
        mapper.evaluate(transformationModule, objectToTransform).then( function (result) {
            transformedObject = result;

            var expectedResult = {
                people: [
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
                ],
                employeeLastnames: {
                    lastnames: [
                        'brookes',
                        'jones'
                    ],
                    lastnamesCount: 2
                },
                customerFirstnames: [
                    'john',
                    'fred'
                ],
                middlenames: [],
                firstMiddlename: null,
                employeeMiddlenamesOptional: {
                    middlenames: []
                },
                employeeMiddlenamesRequired: null
            };
            //console.log('result\n', result);
            expect(transformedObject).to.compareTo(expectedResult);
            done();
        });
    });

});
