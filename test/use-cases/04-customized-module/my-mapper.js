var Mapper = require('../../../lib/mapper');

var myMapper = new Mapper();

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
myMapper.settings.logger = myLogger;

module.exports = myMapper;