#!/usr/bin/env node

//locals
var http		= require('http')
	, port		= process.argv.slice(2)
	, fs		= require('fs')
	//, path		= require('./config/path.json')
	//, sites 	= require('./config/site.json')
	, path      = require('path')
	, cluster	= require('cluster')
	//, numCPUs	= require('os').cpus().length
	, numCPUs   = 1
	, windinsky = require('windinsky_lib');


//globals
Controller.multi_site( require('./config/api.json') );

SESSION_NAME = "adsfginalll";

error_code = require('./config/error_code.json');

global.DEBUG = true;

Router.config({
	ctrls_path: path.resolve(__dirname,'controllers')
    //, multi_sites : true
    //, hosts_mapping : require( './config/hosts.json' )
});

Router.alias('login','/session/new');
Router.alias('register','/user/new');
Router.setDefaultAction('/dashboard');

//middlewares
windinsky.use('ejs',{
	viewPath: function(req){
		var domain = req.headers.host;
		return path.resolve(__dirname,'views');
	},
	default_variables: {
		sites: require('./config/sites.json'),
        etc: require('./config/global.json'),
		error_code: require('./config/error_code.json')
	}
});

windinsky.use('cookie');
windinsky.use('bodyParser');
windinsky.use('flash');
windinsky.use('wants');
windinsky.use('redirect');


// user define;


fs.createWriteStream(__dirname+"/config/pids", {
	flags: "a+",
	encoding: "utf-8",
	mode: 0666
}).write(process.pid + "\n");

if (cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) cluster.fork();

	//global.thirdparty = new ThirdpartyServer(
	//	'wx56752c8692626425' , 
	//	'0c79e1fa963cd80cc0be99b20a18faeb' , 
	//	'D&amp;amp;amp;amp;gt;?YHrvxdc' , 
	//	'yfpnjyVW1SfpMhl9UD0hy7YSRLA58LQ1DP1dTygqO13' , 
	//	'mysql://root@localhost/windinsky' 
	//);
	//thirdparty.start();

	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
		cluster.fork();
	});

} else {
	//global.thirdparty = new ThirdpartyServer(
	//	'wx56752c8692626425' , 
	//	'0c79e1fa963cd80cc0be99b20a18faeb' , 
	//	'D&amp;amp;amp;amp;gt;?YHrvxdc' , 
	//	'yfpnjyVW1SfpMhl9UD0hy7YSRLA58LQ1DP1dTygqO13' , 
	//	'mysql://root@localhost/windinsky',
	//	true
	//);
	// Workers can share any TCP connection
	// In this case its a HTTP server
	http.createServer(function(req, res) {
		windinsky.process(req,res,function(){
			Router.dealwith(req,res);
		});
	}).listen(port[0]);
}
console.log('server started!');
