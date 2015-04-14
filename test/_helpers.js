/*global require module jasmine beforeEach*/

var helpers = {
    walkObject: function (result, name, node, query) {
        return _walkObject(result, name, node, query);

        function _walkObject(result, name, node, query) {
            if (name === query) {
                result.push(node);
            }
            if (node instanceof Array) {
                for (var i = 0, n = node.length; i < n; i++) {
                    _walkObject(result, '', node[i], query);
                }
            }
            else if (typeof(node) === 'object') {
                for (var k in node) {
                    if (node.hasOwnProperty(k)) {
                        _walkObject(result, k, node[k], query);
                    }
                }
            }
        }
    },

    getChildren: function (node, query, index, logger, done) {
        var result = [];
        helpers.walkObject(result, '', node, query);
        done(null, result);
    },


    compare: function (obj1, obj2) {

        function _compare(msg, path, obj1, obj2) {
            var k, val1, val2;
            var isEqual = true;

            if (typeof(obj1) !== typeof(obj2)) {
                msg.log('object 1 ' + path + ' is of type ' + typeof(obj1) + '(' + obj1 + ')' + ' not ' + typeof(obj2));
                return false;
            }

            if (obj1 === undefined) {
                if (obj2 === undefined) {
                    return true;
                }
                else {
                    msg.log('object 1 ' + path + ' is undefined');
                    return false;
                }
            }
            if (obj2 === undefined) {
                msg.log('object 2 ' + path + ' is undefined');
                return false;
            }

            if (obj1 === null) {
                if (obj2 === null) {
                    return true;
                }
                else {
                    msg.log('object 1 ' + path + ' is null');
                    return false;
                }
            }
            if (obj2 === null) {
                msg.log('object 2 ' + path + ' is null');
                return false;
            }


            if (typeof(obj1) === 'object' || typeof(obj1) === 'function') {
                for (k in obj1) {
                    if (obj1.hasOwnProperty(k)) {
                        val1 = obj1[k];
                        val2 = obj2[k];
                        if (val1 !== undefined && val2 === undefined) {
                            msg.log('object 1 ' + path + ' has property ' + k);
                            isEqual = false;
                        }
                        else {
                            isEqual = _compare(msg, path + '."' + k + '"', val1, val2) && isEqual;
                        }
                    }
                }
                for (k in obj2) {
                    if (obj2.hasOwnProperty(k)) {
                        val1 = obj1[k];
                        val2 = obj2[k];
                        if (val2 !== undefined && val1 === undefined) {
                            msg.log('object 1 ' + path + ' does not have property ' + k);
                            isEqual = false;
                        }
                    }
                }
            }


            var arr1 = obj1.forEach ? obj1 : [];
            var arr2 = obj2.forEach ? obj2 : [];
            arr1.forEach(function (item, i) {
                val1 = arr1[i];
                val2 = arr2[i];
                if (val1 !== undefined && val2 === undefined) {
                    msg.log('object 1 ' + path + ' has item ' + i);
                    isEqual = false;
                }
                else {
                    isEqual = _compare(msg, path + '.' + i + '', val1, val2) && isEqual;
                }
            });
            arr2.forEach(function (item, i) {
                val1 = arr1[i];
                val2 = arr2[i];
                if (val1 !== undefined && val2 === undefined) {
                    msg.log('object 1 ' + path + ' does not have item ' + i);
                    isEqual = false;
                }
            });

            if (typeof(obj1) === 'function') {
                //todo
                var noop;
            }


            if (!(typeof(obj1) === 'object' || typeof(obj1) === 'function')) {
                if (obj1 != obj2) {
                    msg.log('object 1 ' + path + ' is ' + obj1 + ' not ' + obj2);
                    isEqual = false;
                }
            }

            return isEqual;
        }

        var msg = {
            fullText: '',
            log: function (text) {
                this.fullText += (this.fullText ? '\r' : '') + text;
            }
        };
        var result = _compare(msg, '', obj1, obj2);
        if (!result) {
            throw new Error('objects are different:\r' + msg.fullText);
        }
        return result;
    }


};

beforeEach(function () {
    this.addMatchers({
        toCompareTo: function (expected) {
            var actual = this.actual;
            var pass;
            var message;
            try {
                pass = helpers.compare(actual, expected);
            }
            catch (ex) {
                pass = false;
                message = ex.toString();
            }
            if (message) {
                this.message = function () {return message; };
            }
            return pass;
        }
    });
});

module.exports = helpers;
