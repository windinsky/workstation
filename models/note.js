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
		note.title = Helper.xss(note.title);
		var mysql = new Mysql()
			, sql = 'insert into notes (content,title,created_at,user_id) values (?,?,?,?);'
			, data = [note.content,note.title,new Date(),user_id];
		mysql.query(sql,data);
		mysql.once('end',function(){
			mysql.query('select id,content,title,updated_at from notes where user_id = ? and id = ?;',[user_id,d.insertId]);
			mysql.once('end',function(d){
				mysql.emit('save_end',d[0]);
			})
		});
		return mysql;
	},
	check_confliction: function(note,user_id){
		var mysql  =new Mysql()
			, sql = 'select id,title,content,updated_at from notes where id = ? and user_id = ?;'
			, data = [note.id,user_id];
		mysql.query(sql,data);
		mysql.once('end',function(data){
			if(!data.length){
				return mysql.emit('not_exist');
			}
			var updated_at = data[0].updated_at;
			console.log(updated_at,new Date(note.updated_at));
			return mysql.emit(new Date(updated_at).getTime() != new Date(note.updated_at).getTime() ? 'conflict' : 'not_conflict',data[0]);
		});
		return mysql;
	},
	update: function(note,user_id){
		var mysql  =new Mysql();
		var conflict_check = Note.check_confliction(note,user_id);
		conflict_check.once('not_exist',function(){
			return mysql.emit('not_exist');
		});
		conflict_check.once('conflict',function(data){
			return mysql.emit('conflict',data);
		});
		conflict_check.once('not_conflict',function(){
			var sql = 'update notes set content = ?,title = ? where id=? and user_id=?;'
			, data = [note.content,note.title,note.id,user_id];
			mysql.query(sql,data);
			mysql.once('end',function(){
				mysql.query('select id,title,content,updated_at from notes where id=? and user_id = ?',[note.id,user_id]);
				mysql.once('end',function(d){
					mysql.emit('save_end',d[0]);
				});
			});
		});
		return mysql;
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
