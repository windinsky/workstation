var mysql = require('mysql');
var EventEmitter = require('events').EventEmitter;
var util = require("util");

var config = {
	host: '127.0.0.1',
	user: 'root',
	password: '',
	database: 'windinsky'
};

function Mysql(){
	
}

function Connection(){
	return mysql.createConnection(config);
}

util.inherits(Mysql,EventEmitter);

Mysql.prototype.query = function(sql,data,callback){
	var self = this;
	var connection = new Connection();
	connection.query(sql,data,function(err,result){
		if(typeof callback === 'function') callback(err,result);
		if (err) {
			self.emit('error',err);
		}else{
			self.emit('end',result);
		}
	});
	connection.once('error',function(err){
		self.emit('error',err);
	});
	connection.end();
	return self;
};

module.exports = Mysql;
