/*global require module*/

var propertySettingDefault = function (settings) {

    settings.onGet('property').unique().call(function (node, query, index, logger, done) {
        done(null, [node[query]]);
    });

    settings.onGet('match').call(function (node, query, index, logger, done) {
        if (typeof(node) === 'string') {
            done(null, node.match(query));
        }
        else {
            logger.error('node is not string');
            done(null, null);
        }
    });

    settings.onGet('split').call(function (node, query, index, logger, done) {
        if (typeof(node) === 'string') {
            done(null, node.split(query));
        }
        else {
            logger.error('node is not string');
            done(null, null);
        }
    });

    settings.onWait().call(function (periodRequested, periodElapsed, nRetry, logger, done) {
        var timeout;
        if (periodElapsed > periodRequested) {
            done(1, null);
        }
        else {
            timeout = periodElapsed * 2;
            if (timeout < 4) {
                timeout = 10;
            }
            if (periodElapsed + timeout > periodRequested) {
                timeout = periodRequested - periodElapsed;
            }
            return setTimeout(done, timeout);
        }

    });

    return settings;
};

module.exports = propertySettingDefault;