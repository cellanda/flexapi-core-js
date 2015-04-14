module.exports = function (mapper) {

	return {
		content: {
	        lastnames: mapper.property.get.children('lastname')
	    }
    };

}