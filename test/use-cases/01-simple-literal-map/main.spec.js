/*global require global describe it expect*/


/*------------------------------------------------------------------------------
A use-case example

using a local static map definition
using a custom logger
using no custom getters
using just one source file
------------------------------------------------------------------------------*/


var Mapper = require('../../../lib/mapper');

var getChildren = require('../../_helpers').getChildren;
var fixture = require('../../_fixtures').sampleObjectFixture;


describe('use-cases simple literal map', function () {

    it('transforms an object', function (done) {
        var mapper = new Mapper();

        var myLogger = {
            logMessage: function (message) {
                //severities = ['log', 'info', 'warn', 'fail', 'error', 'important', 'fatal'];
                //message = {time: ?, severity: ?, context: ?, text: ?, data: ?};
                //message.context = {path: [sourceGrandParentNode, sourceParentNode, sourceNode]} 
                //message.context = {path: [sourceGrandParentNode, sourceParentNode, sourceNode, firstSelectorStep, secondSelectorStep, currentSelectorStep]} 

                var data = message.data;
                if (data) {
                    delete message.data;
                    console.log(JSON.stringify(message), data);
                }
                else {
                    console.log(JSON.stringify(message));
                }

            }
        };
        mapper.settings.logger = myLogger;


        var objectToTransform = new fixture();

        var transformationModule = {
            content: {
                people: mapper.property.get(getChildren, 'person'),
                employeeLastnames: mapper.property.get(getChildren, 'employees')(0).content({
                    lastnames: mapper.property.get(getChildren, 'lastname')
                }),
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
