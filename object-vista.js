/*global require module*/
var Selector = require("./selector");
var Module = require("./module");

var vista = function () {
    var newVista = new Selector();
    newVista.module = Module;
    return newVista;
};

module.exports = vista;
