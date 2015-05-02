var Mysql = require('../lib/adapter');
var md5 = require('../lib/md5');
var EventEmitter = require('events').EventEmitter;
var Helper = require('../helper');

var Note = {
	list: function(user_id){
		var mysql = new Mysql()
			, sql = 'select id,title,content,created_at,updated_at from notes where user_id = ? order by updated_at desc;'
			, data = [user_id];
		return mysql.query(sql,data);
	},
	add: function(note,user_id){
		note.content = Helper.xss(note.content);
		var mysql = new Mysql()
			, sql = 'insert into notes (content,title,created_at,user_id) values (?,?,?,?);'
			, data = [note.content,note.title,new Date(),user_id];
		return mysql.query(sql,data);
	},
	update: function(note,user_id){
		var mysql = new Mysql()
			, sql = 'update notes set content = ?,title = ? where id=? and user_id=?;'
			, data = [note.content,note.title,note.id,user_id];
		return mysql.query(sql,data);
	},
	save: function(note,user_id){
		return note.id ? Note.update(note,user_id) : Note.add(note,user_id);
	},
	'delete': function(id,user_id){
		var mysql = new Mysql()
			, sql = 'delete from notes where id=? and user_id=?'
			, data = [id,user_id];

		return mysql.query(sql,data);
	}
};
module.exports = Note;
