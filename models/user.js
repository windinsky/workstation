var Mysql = require('../lib/adapter');
var md5 = require('../lib/md5');

var User = {
	get_info_by_token: function(token){
		var mysql = new Mysql();
		mysql.query('select id,account from users where id = (select user_id from sessions where token=?)',[token]);
		return mysql;
	},
	find: function(conditions){
		var mysql = new Mysql()
			, sql = 'select id,account from users where '
			, i;
			
		sql += conditions.keys.map(function(key){
			return key + '=?'
		}).join(' and ');

		if((i = conditions.keys.indexOf('password')) != -1){
			conditions.values[i] = md5(md5(md5(conditions.values[i])));
		}
		mysql.query(sql,conditions.values);
		return mysql;
	},
	create: function(account,password){
		var mysql = new Mysql()
			, sql = 'insert into users(account,password) values (?,?)';
		mysql.query(sql,[account,md5(md5(md5(password)))]);
		return mysql;
	}
};

module.exports = User;
