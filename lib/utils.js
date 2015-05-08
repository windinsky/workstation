exports.extend = function( to , from , deep ){

	for(var i in from){
		if(from.hasOwnProperty(i)){
			to[i] = from[i];
		}
	}

	return to;

};
