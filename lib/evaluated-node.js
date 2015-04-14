/*global require module*/
var q = require("q");
var Logger = require('./logger');


var EvaluatedNode = function (compiledNode) {
    this.name = compiledNode.name;
    this.children = {};
    this.content = {};
}


module.exports = EvaluatedNode;
