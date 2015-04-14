/*global require global describe it expect*/


/*------------------------------------------------------------------------------
A use-case example

using a static map definition
using a custom logger
using a custom getter called 'children'
using a separate file to define the mapper
using a separate file to define a mapping module
------------------------------------------------------------------------------*/


var myMapper = require('./my-mapper');

var lastnamesModule = require('./lastnames-module')

var fixture = require('../../_fixtures').sampleObjectFixture;


describe('use-cases customized selector', function () {

    it('transforms an object', function (done) {
        var mapper = myMapper;

        var objectToTransform = new fixture();

        var transformationModule = {
            content: {
                people: mapper.property.get.children('person'),
                employeeLastnames: mapper.property.get.children('employees')(0).module(lastnamesModule),
                customerFirstnames: mapper.property.get.children('customers')(0).get.children('firstname'),
                middlenames: mapper.property.get.children('middlename'),
                firstMiddlename: mapper.property.get.children('middlename')(0),
                employeeMiddlenamesOptional: mapper.property.get.children('employees')(0).content({
                    middlenames: mapper.property.required(false).get.children('middlename')
                }),
                employeeMiddlenamesRequired: mapper.property.get.children('employees')(0).content({
                    middlenames: mapper.property.required(true).get.children('middlename')
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
                    ]
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
            expect(transformedObject).toCompareTo(expectedResult);
            done();
        });
    });

});
