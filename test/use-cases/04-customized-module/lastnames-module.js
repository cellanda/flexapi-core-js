var getChildren = require('../../_helpers').getChildren;



module.exports = function (mapper) {

	var module = {
		name: 'lastnames',
		base: {

		},
		validate: function (mapper, node) {
			return true;
		},
		transform: function (mapper, node) {
			return mapper.transform(this, node).then(function (result) {
				result.lastnamesCount = countChildren(node, 'lastname');
				return result;
			});
		},
		onValid: function (mapper, originalNode) {

		},
		onTransformed: function (mapper, originalNode, transformedNode) {

		},
		content: {
	        lastnames: mapper.property.get(getChildren, 'lastname')
    	}
    };

	function countChildren(node, query) {
	    var result = [];
	    helpers.walkObject(result, '', node, query);
	    return result.length;
	};

	return module;
}