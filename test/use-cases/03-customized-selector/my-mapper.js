var myMapper = require('../../../index').mapper;
var getChildren = require('../../_helpers').getChildren;


var myLogger = {
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
myMapper.settings.logger = myLogger;

myMapper.settings.property.onGet('children').call(getChildren);

module.exports = myMapper;