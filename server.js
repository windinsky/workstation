#!/usr/bin/env node

//locals
var http		= require('http')
	, port		= process.argv.slice(2)
	, fs		= require('fs')
	//, path		= require('./config/path.json')
	//, sites 	= require('./config/site.json')
	, path = require('path')
	, cluster	= require('cluster')
	//, numCPUs	= require('os').cpus().length
	, numCPUs = 1
	, windinsky = require('windinsky_lib');

//globals
Controller = require('./lib/controller.js');
SESSION_NAME = "adsfginalll";
error_code = require('./config/error_code.json');

debug = true;

//middlewares
windinsky.use('ejs',{
	viewPath: function(req){
		var domain = req.headers.host;
		return path.resolve(__dirname,'views');
	},
	default_variables: {
		sites: require('./config/sites.json'),
		error_code: require('./config/error_code.json')
	}
});

windinsky.use('cookie');
windinsky.use('bodyParser');
windinsky.use('flash');
windinsky.use('wants');
windinsky.use('redirect');
var needle = require('needle');
var API = require('./node_modules/wechat/node_modules/wechat-api');



// user define;
var router = require('./lib/route.js');
router.config({
	ctrls_path: path.resolve(__dirname,'controllers')
});
router.alias('login','/session/new');
router.alias('register','/user/new');
router.setDefaultAction('/dashboard');

DEBUG = true;

fs.createWriteStream(__dirname+"/config/pids", {
	flags: "a+",
	encoding: "utf-8",
	mode: 0666
}).write(process.pid + "\n");

if (cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) cluster.fork();

	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
		cluster.fork();
	});

} else {
	// Workers can share any TCP connection
	// In this case its a HTTP server
	http.createServer(function(req, res) {
		windinsky.process(req,res,function(){
			router.dealwith(req,res);
		});
	}).listen(port[0]);
}
console.log('server started!');
//console.log(port[0]);
//http.createServer(function(req, res) {
//	windinsky.process(req,res);
//}).listen(port[0]);
