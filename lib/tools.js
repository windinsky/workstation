var fs = require('fs')
    , path = require('path')
    , strip = require('strip-comments')
    , uniq = require('./utils').uniq;

const JS_EXT = '.js';

// tranverse directionary , get all file name
var walk = function( dir , callback , root ){
    var results = [];
    if( !root ) root = dir;
    fs.readdir( dir , function( err , list ) {

        if ( err ) return callback( err );

        var pending = list.length;

        if (!pending) return callback(null, results);

        list.forEach( function( file ) {

            file = path.resolve( dir , file );

            fs.stat( file , function( err , stat ) {

                if ( stat && stat.isDirectory() ) {

                    walk( file , function( err , res ) {
                        results = results.concat( res );
                        if ( !--pending ) callback( null , results );
                    } , root );

                } else {

                    results.push( path.resolve( dir , file ).replace( root , '' ) );
                    if (!--pending) callback(null, results);

                }

            });

        });

    });

}

exports.analyse_js_dependency = function( base_folder , callback ){
    var result = {};
    walk( base_folder , function( err , files ){

        // tranverse all file to analyse each dependency
        files.forEach( function( file ){
            // only handle js file
            if( path.extname( file ).toLowerCase() != JS_EXT ) return;
            var file_id = file.substr( 0 , file.length - JS_EXT.length );
            !result[ file_id ] && ( result[ file_id ] = uniq( get_js_dependency( base_folder , file_id , result ) ) );
        });

        callback( result );
    
    });
};

function get_js_dependency( base_folder , file , result ){


    var f = path.resolve( base_folder , file + JS_EXT );
    if( !fs.existsSync( f ) ) return [];
    
    var content = strip( fs.readFileSync( path.resolve( base_folder , file + JS_EXT ) ).toString() )
        , temp
        , dep = [];

    if(file == 'utils.js'){
        console.log( content , content.match( /require\([\"|\'](.+?)[\"|\']\)/ ) );
    }

    while( temp = content.match( /require\([\"|\'](.+?)[\"|\']\)/ ) ){
        /*
         * Relative require detail :
         * ------ somefolder/test.js------
         *  define('somefolder/test' , ['jquery'] , function( require , exports , module ){
         *      var a = require('./another_script');
         *  });
         *
         *  In order to calculate dependency file ('another_script') with relative path, we need these steps:
         *  1. First get $file_full_path = path.resolve( base_path , file );
         *  2. Get $file_folder = path.dirname( $file_full_path );
         *  3. Get $dependency_file_path = path.resolve( $file_folder , './another_script' , '.js' );
         *  4. In the end we need to remove absolute path $dependency_file_id = $dependency_file_path.replace( base_path , '' );
         */

        var dep_file_path;

        if( temp[1].indexOf('./') == 0 || temp[1].indexOf('../') == 0 ){
            // relative path
            dep_file_path = path.resolve( 
                path.dirname( 
                    path.resolve( base_folder , file ) 
                )
                , temp[1]
            )
        }else{
            // absolute path ( relative to base folder );
            dep_file_path = path.resolve( base_folder , temp[1] );
        }

        var dep_file_id = dep_file_path.replace( base_folder , '' );
        content = content.substr( content.indexOf( temp[0] ) + temp[0].length );

        // if dependency file doesnot exist , leave a warning and ignore this requirement
        if( !fs.existsSync( dep_file_path + JS_EXT ) ){
            console.warn( 'dependency "' + dep_file_id + '" of "' + file + '" doesnot exist!' );
            continue;
        }


        dep.push( dep_file_id );
    }

    // recurse , get sub dependency
    for( var i = 0 ; i < dep.length ; i++ ){

        var d = dep[i];
        
        result[d] = result[d] || get_js_dependency( base_folder , d , result );
        Array.prototype.splice.apply( dep , [ i , 0 ].concat( result[d] ) );
        i += result[d].length;
    }

    return dep;

}
