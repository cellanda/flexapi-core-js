var getChildren = require('../../_helpers').getChildren;

module.exports = function (mapper) {

	return {
		content: {
	        lastnames: mapper.property.get(getChildren, 'lastname')
	    }
    };

}