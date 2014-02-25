/*global require module*/
module.exports = Context;

function Context(origin) {
    var context = {};

    addContext(origin);

    function addContext(origin) {
        if (origin) {
            origin = origin.getData ? origin.getData() : origin;
            _copyProperties(origin, context);
        }
    }

    function _copyProperties(origin, target) {
        for (var k in origin) {
            if (origin.hasOwnProperty(k)) {
                if (origin[k].forEach) {
                    target[k] = [];
                    _copyItems(origin[k], target[k]);
                }
                else {
                    target[k] = origin[k];
                }
            }
        }
    }

    function _copyItems(origin, target) {
        origin.forEach(function (item) {
            target.push(item);
        });

    }

    return {
        getData: function () {
            return context;
        },

        addContext: function (origin) {
            addContext(origin);
            return this;
        },

        setProperty: function (name, value) {
            context[name] = value;
            return this;
        },

        pushProperty: function (name, value) {
            context[name] = context[name] || [];
            if (context[name].push) {
                context[name].push(value);
            }
            return this;
        }

    };
}

