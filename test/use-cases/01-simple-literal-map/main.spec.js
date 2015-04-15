/*global require global describe it expect*/


/*------------------------------------------------------------------------------
A use-case example

using a local static map definition
using a custom logger
using no custom getters
using just one source file
------------------------------------------------------------------------------*/


var mapper = require('../../../index').mapper;

var getChildren = require('../../_helpers').getChildren;
var fixture = require('../../_fixtures').sampleObjectFixture;


describe('use-cases simple literal map', function () {

    // Set up mapper
    var myMapper = mapper.clone();
    myMapper.settings.logger = {
        logMessage: function (message) {
            //message = {time: ?, severity: ?, context: ?, text: ?, data: ?};
            //message severities = ['log', 'info', 'warn', 'fail', 'error', 'important', 'fatal'];
            //message.context = {path: [sourceGrandParentNode, sourceParentNode, sourceNode]} 
            //message.context = {path: [sourceGrandParentNode, sourceParentNode, sourceNode, firstSelectorStep, secondSelectorStep, currentSelectorStep]} 
            var data = message.data;
            if (data) {
                delete message.data;
                /*console.log(JSON.stringify(message), data);*/
            }
            else {
                /*console.log(JSON.stringify(message));*/
            }
        }
    };


    // define the transform
    var transformationModule = {
        content: {
            people: myMapper.property.get(getChildren, 'person').content({
                firstname: myMapper.property.get(getChildren, 'firstname')(0),
                lastname: myMapper.property.get(getChildren, 'lastname')(0)
            }),
            employeeLastnames: myMapper.property.get(getChildren, 'employees')(0).content({
                lastnames: myMapper.property.get(getChildren, 'lastname')
            }),
            customerFirstnames: myMapper.property.get(getChildren, 'customers').get(getChildren, 'firstname'),
            middlenames: myMapper.property.get(getChildren, 'middlename'),
            firstMiddlename: myMapper.property.get(getChildren, 'middlename')(0),
            employeeMiddlenamesOptional: myMapper.property.get(getChildren, 'employees')(0).content({
                middlenames: myMapper.property.required(false).get(getChildren, 'middlename')
            }),
            employeeMiddlenamesRequired: myMapper.property.get(getChildren, 'employees')(0).content({
                middlenames: myMapper.property.required(true).get(getChildren, 'middlename')
            })
        }
    };
    var transformed = myMapper.compile(transformationModule);


    // bind to the object to tranform
    var objectToTransform = new fixture();
    transformed._ = objectToTransform


    it('transforms the entire object', function (done) {
        // use the transform of the entire object
        transformed._.then( function (transformedObject) {
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
                        firstname: null,
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
            //console.log('result\n', transformedObject);
            expect(transformedObject).toCompareTo(expectedResult);

            done();
        });
    });


    it('transforms part of the object', function (done) {
        // use the transform of part of the object
        transformed.people._.then( function (transformedObject) {
            var expectedResult = [
                {
                    firstname: 'john',
                    lastname: 'smith'
                },
                {
                    firstname: 'fred',
                    lastname: 'astair'
                },
                {
                    firstname: null,
                    lastname: 'brookes'
                },
                {
                    firstname: 'stanley',
                    lastname: 'jones'
                }
            ];
            //console.log('result\n', transformedObject);
            expect(transformedObject).toCompareTo(expectedResult);

            done();
        });
    });


    it('transforms a single property', function (done) {
        // use the transform to access a single property
        transformed.people(1).firstname._.then( function (transformedObject) {
            var expectedResult = 'fred';
            //console.log('result\n', transformedObject);
            expect(transformedObject).toCompareTo(expectedResult);

            done();
        });
    });

});
