#!/usr/bin/env node

//locals
var http		= require('http')
	, port		= process.argv.slice(2)
	, fs		= require('fs')
	, path      = require('path')
	, cluster	= require('cluster')
	, numCPUs	= require('os').cpus().length
    , tools     = require('./lib/tools')
    , url       = require('url')
    , qs        = require('querystring')
    , utils     = require('./lib/utils')
	// , numCPUs = 1
var config = {
    path : require('./config/path.json')
};
var dependency = {
    'js' : {}
    , 'css' : {}
};
tools.analyse_js_dependency( config.path.STATIC_PATH + 'js/', function(dep){ dependency['js'] = dep; console.log(dep); });

fs.createWriteStream(__dirname+"/config/pids", {
	flags: "a+",
	encoding: "utf-8",
	mode: 0666
}).write(process.pid + "\n");

const ETAG = require('./config/etag.json');

var ETAGS = {
    'js' : {}
    , 'css' : {}
}

if (cluster.isMaster) {
	for (var i = 0; i < numCPUs; i++) cluster.fork();

	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
		cluster.fork();
	});

} else {
	http.createServer(function(req, res) {
        var u = url.parse( req.url )
            , _path = u.pathname
            , query = qs.parse( u.query )
            , type = _path.split('/')[1]
            , script_path = _path.split('/')[2]

        //if( !ETAGS[type] ){
        //    res.writeHead( 404 );
        //    return res.end();
        //}

        //if( !ETAGS[type][script_path] ) ETAGS[type][script_path] = require("crypto").createHash('sha1').update(ETAG).digest('base64');
        //var etag = req.headers['if-none-match'];

        //if( etag && etag == ETAGS[type][script_path] ){
        //    res.writeHead( 304 );
        //    return res.end();
        //}

        switch(type){
            case 'js':
                // tools.processJS( req , res );

                function generate_packed_js( _path , req , res ){

                    var _path = _path.split(',').map( function(p){ return p.replace(/\+/g,'/'); } );
                    var dep = _path.map( function(p){ return dependency.js[p] || []; } );
                    dep = utils.uniq( utils.flat( dep ) );
                    dep = dep.concat( _path );
                    console.log(dep);

                    var streams = dep.map( function( _d ){
                        var d = path.resolve( config.path.STATIC_PATH + 'js-min/' , _d + '.js' );
                        return fs.createReadStream( d );
                    });

                    var count = 1;

                    res.writeHead( 200 , {
                        // 'ETag' : ETAGS[type][script_path]
                        'content-type' : 'text/javascript'
                        , 'cache-control' : 'public, max-age=31536000'
                        , 'last-modified' : new Date().toUTCString()
                    });

                    // multi pipe
                    var cb = function(){
                        streams[count].pipe( res , { end : ( count == streams.length - 1 ) } )
                        count++;
                    }

                    streams.forEach( function( s , i ){ ( i < streams.length - 1 ) && s.once( 'end' , cb ) } );


                    streams[0].pipe( res , { end : false });

                }
                generate_packed_js( script_path , req , res );
                break;

            case 'css' :

                // tools.processCSS( req,res );
                generate_packed_css( script_path , function( err , css ){
                    if( err ){
                        res.writeHead( 502 );
                        res.end( JSON.stringify( err ) );
                    }else{
                        res.writeHead( 200 , {
                            'Etag' : ETAGS[type][script_path]
                            , 'content-type' : 'text/css'
                        });
                        res.end( css );
                    }
                });
                break;

            default :
                res.writeHead( 404 );
                return res.end();

        }
	}).listen(port[0]);
}
console.log('static server started!');
