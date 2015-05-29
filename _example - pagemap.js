/*global require module $*/
var pm = require('../page-map/zombie-mapper');
var Logger = require('./logger');
var Money = require('./money');
var DateTime = require('./datetime');

pm.settigs.logger = new Logger();

pm.settings.property.onGet('money').unique().call(function (node, args, index, logger) {
    var val = new Money('' + node, args[0]);
    val = val.amount !== null ? val : null;
    return [val];
});

pm.settings.property.onGet('datetime').unique().call(function (node, args, index, logger) {
    if (typeof(node) === 'string') {
        return [DateTime.parse(node)];
    }
    else {
        return null;
    }
});


var pageMaps = {

    login: pm.property.page({
        name: 'login',
        url: '',
        at: {
            form: pm.property.get.children('#frmLogin')
        },
        on: {
            at: function (document) {
                return this.content(document);
            },
            map: function (page) {
                page.useridInput.value = this.parameters.user;
                page.passwordInput.value = this.parameters.pass;
                return this.parameters.browser.fire(page.submitButton, 'click');
            }
        },
        content: {
            useridInput: pm.property.required.get.child('#frmLogin\\:strCustomerLogin_userID'),
            passwordInput: pm.property.required.get.child('#frmLogin\\:strCustomerLogin_pwd'),
            submitButton: pm.property.required.get.child('#frmLogin\\:btnLogin1')
        }
    }),

    memorableinformation: mapper.page.module({
        name: 'memorableinformation',
        url: '',
        at: {
            form: pm.property.required.get.children('#frmentermemorableinformation1')
        },
        on: {
            at: function (document) {
                return this.content(document);
            },
            transformed: function (page) {
                return page.continue();
            }
        },
        content: {
            continue: mapper.property.module(function (mapper, compiler) {
                var subModule = compiler.compile({
                    content: {
                        characterPos: mapper.property.$required.$is.children('#frmentermemorableinformation1 label').$each.html.split(' ')(1),
                        character: [
                            mapper.property.required.get.child('[name=frmentermemorableinformation1\\:strEnterMemorableInformation_memInfo1]'),
                            mapper.property.required.get.child('[name=frmentermemorableinformation1\\:strEnterMemorableInformation_memInfo2]'),
                            mapper.property.required.get.child('[name=frmentermemorableinformation1\\:strEnterMemorableInformation_memInfo3]')
                        ],
                        continueButton: mapper.property.required.get.child('#frmentermemorableinformation1\\:btnContinue')
                    });
                }
                return {
                    content: function (evaluator) {
                        return evaluator.evaluate(subModule).then(function (result) {
                            for (var i = 0, n = result.characterPos.length; i < n; i++) {
                                var character = pm.parameters.word.substr(result.characterPos[i] - 1, 1);
                                pm.parameters.browser.select(result.character[i], character);
                            }
                            return pm.parameters.browser.fire(result.continueButton, 'click');
                        });
                    }
                }
            })
        }
    }),

    messages: pm.property.page({
        name: 'messages',
        url: '',
        at: {
            form: pm.property.get.children('#frmmandatoryMsgs')
        },
        on: {
            at: function (document) {
                return this.content(document);
            },
            map: function (page) {
                return this.parameters.browser.fire(page.continueButton, 'click');
            }
        },
        content: {
            continueButton: pm.required.property.get.child('#frmmandatoryMsgs\\:continue_to_your_accounts2')
        }
    }),

    overview: pm.property.page({
        name: 'overview',
        url: 'https://secure.lloydsbank.co.uk/personal/a/account_overview_personal/',
        default: {
            wait: 500
        },
        at: {
        },
        on: {
            at: function (document) {
                return this.content(document);
            }
        },
        content: {
            customer: pm.property.$required.$wait.$is.child('.user').$content({
                name: pm.property.$required.$is.child('.name').html
            }),
            accounts: pm.property.$required.$waitFor('page.customer').$is.children('.accountDetails').$content({
                name: pm.property.$required.$is.child('h2 a').html.match(/<.*?>([0-9,a-z, ]*)/i)(1),
                link: pm.property.$required.$is.child('h2 a').href,
                sortCode: pm.property.$optional.$is.html.match(/sort code.*?>([0-9]{2}-[0-9]{2}-[0-9]{2})</i)(1),
                number: pm.property.$required.$is.html.match(/ number.*?>([0-9]*)</i)(1)
            })
        }
    }),

    account: pm.property.page({
        name: 'account',
        url: '',
        at: {
        },
        on: {
            at: function (document) {
                return this.content(document);
            }
        },
        content: {
            details: {
                numbers: pm.property.$required.$is.child('.myAccountDetails .numbers').html,
                balance: pm.property.$required.$is.child('.myAccountDetails .balance').html.money(),
                available: pm.property.$required.$is.child('.myAccountDetails .accountBalance').html.money({intro: 'funds available:'}),
                overdraft: pm.property.required.get.child('.myAccountDetails .accountBalance').get.property('innerHTML').get.money({intro: 'overdraft limit:'})
            },
            statement: {
                nextButton: pm.property.optional.get.child('.next input'),
                previousButton: pm.property.optional.get.child('.previous input'),
                transactions: pm.property.required.get.children('.statement tbody tr').content({
                    date: pm.property.required.get.child('th').get.property('innerHTML').get.datetime(),
                    description: pm.property.get.required.children('td')(0).get.children('span').get.property('innerHTML'),
                    type: pm.property.get.required.children('td')(1).get.child('*').get.property('innerHTML'),
                    incomingAmount: pm.property.optional.get.children('td')(2).get.property('innerHTML').get.money({defaultAmount: 0, negate: false}),
                    outgoingAmount: pm.property.optional.get.children('td')(3).get.property('innerHTML').get.money({defaultAmount: 0, negate: true}),
                    balance: pm.property.required.get.children('td')(4).get.property('innerHTML').get.money()
                })
            },
            goto: {
                scheduled: pm.property.required.get.child('#pnlTabDirectDebitAndStandingOrder').content({
                    //dd: pm.property.get.children('', 0),
                    //so: pm.property.get.children('', 0)
                })
            }
        }
    })

};


module.exports = pageMaps;
