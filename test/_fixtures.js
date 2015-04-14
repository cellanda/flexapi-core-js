/*global require module jasmine beforeEach*/

var fixtures = {
    sampleObjectFixture: function () {
        return {
            customers: [
                {
                    person: {
                        firstname: 'john',
                        lastname: 'smith'
                    }
                },
                {
                    person: {
                        firstname: 'fred',
                        lastname: 'astair'
                    }
                }
            ],
            employees: [
                {
                    person: {
                        lastname: 'brookes'
                    }
                },
                {
                    person: {
                        firstname: 'stanley',
                        lastname: 'jones'
                    }
                }
            ],
            people: {
                person1: {
                    firstname: 'samantha',
                    lastname: 'fox'
                },
                person2: {
                    firstname: 'tessa',
                    lastname: 'may'
                }
            }
        };
    }

};

module.exports = fixtures;
