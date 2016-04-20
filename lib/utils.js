exports.extend = function( to , from , deep ){

	for(var i in from){
		if(from.hasOwnProperty(i)){
			to[i] = from[i];
		}
	}

	return to;

};

exports.uniq = function( array ){
    
    var result = [];

    array.forEach( function(a){
        if( result.indexOf( a ) == -1 ) result.push(a);
    });

    return result;

}

var flat = exports.flat = function( array ){

    var result = [];
    array.forEach( function(a){
        if( a && a.constructor === Array ){
            result = result.concat( flat( a ) );
        }else{
            result.push(a);
        }

    });

    return result;

}
