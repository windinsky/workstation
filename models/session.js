var Mysql = require('../lib/adapter');
var md5 = require('../lib/md5');
var EventEmitter = require('events').EventEmitter;

module.exports = {
	'create': function(user_id){
		var mysql = new Mysql()
			, token = md5(new Date().getTime().toString())
			, e = new EventEmitter();

		mysql.query('insert into sessions(user_id,token) values(?,?)',[user_id,token]);
		mysql.once('end',function(){
			e.emit('end',token);
		});
		mysql.once('error',function(err){
			e.emit('error',err);
		})

		return e;
	}
}
