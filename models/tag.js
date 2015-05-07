var Mysql = require('../lib/adapter');
var TagResource = require('./tag_resource');

var Tag = {
	list: function(user_id,type){
		var mysql = new Mysql(),sql,data;
		if(type){
			sql = 'select id,name from tags where user_id=? and type=?;';
			data = [user_id,type];
		}else{
			sql = 'selct id,name from tags where user_id=? order by updated_at desc;';
			data = [user_id];
		}
		return mysql.query(sql,data);
	},
	add: function(tag,user_id){
		var mysql = new Mysql()
			, sql = 'insert into tags (name,type,created_at,user_id) values (?,?,?,?);'
			, data = [tag.name,tag.type,new Date(),user_id];

		mysql.once('end',function(data){
			var id = data.insertId;
			mysql.query('select id,name,type from tags where id=? and user_id=?',[id,user_id]);
			mysql.once('end',function(d){
				mysql.emit('save_end',d);
			});
		});

		mysql.query(sql,data);
		return mysql;
	},
	update: function(tag,user_id){
		var mysql = new Mysql()
			, sql = 'update tags set name=?,type=? where user_id = ? and id = ?;'
			, data = [tag.name,tag.type,user_id,tag.id];

		mysql.once('end',function(data){
			mysql.once('end',function(d){
				mysql.emit('save_end',d);
			});
			mysql.query('select id,name,type from tags where id=? and user_id=?',[tag.id,user_id]);
		});

		mysql.query(sql,data);

		return mysql;

	},
	save: function(tag,user_id){
		return tag.id ? Tag.update(tag,user_id) : Tag.add(tag,user_id);
	},
	'delete': function(id,user_id){
		var mysql = new Mysql()
			, sql = 'delete from tags where id=? and user_id=?;'
			, data = [id,user_id];
		var remove_relation = TagResource['delete'](null,id,user_id);
		remove_relation.once('end',function(){
			mysql.query(sql,data);
		});
		remove_relation.once('err',function(err){
			mysql.emit('err',err);
		});
		return mysql;
	},
	is_owner: function(ids,user_id){
		if(!(ids instanceof Array)){
			ids = [ids];
		}
		var mysql = new Mysql()
			, sql = 'select id from tags where user_id=?;'
			, data = [user_id];

		mysql.query(sql,data);
		mysql.once('end',function(data){
			data = data.map(function(d){
				return d.id;
			});
			var yes = ids.every(function(i){
				return data.indexOf(parseInt(i)) !== -1;
			});
			mysql.emit(yes ? 'yes' : 'no');
		});
		return mysql;
	}
}
module.exports = Tag;
