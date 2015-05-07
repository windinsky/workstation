var Mysql = require('../lib/adapter');
var TagResource = {
	replace: function(resource_id,tag_ids,user_id,type){
		var mysql = new Mysql();
		var del = TagResource['delete'](resource_id,null,user_id,type);
		del.once('end',function(){
			var sql = []; data = [];
			tag_ids.forEach(function(tag){
				sql.push('insert into tag_resource (resource_id,tag_id,type,user_id) values (?,?,?,?)');
				data = data.concat([resource_id,tag,type,user_id]);
			});
			mysql.query(sql.join(';'),data);
		});
		return mysql;
	},
	add: function(resource_id,tag_id,resource_type,user_id){
		var mysql = new Mysql()
			, sql = 'insert into tag_resource (resource_id,tag_id,resource_type,user_id) values (?,?,?,?);'
			, data = [resource_id,tag_id,resource_type,user_id];
		return mysql.query(sql,data);
	},
	'delete': function(resource_id,tag_id,user_id,type){
		var mysql = new Mysql()
			, sql = 'delete form tag_resource where (resource_id = ? or tag_id = ?) and user_id = ?' + type? ' and type = ? ':'' + ';'
			, data = [resource_id,tag_id,user_id,type];
		return mysql.query(sql,data);
	}
}
