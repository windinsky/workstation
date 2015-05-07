var Mysql = require('../lib/adapter');
var Helper = require('../helper');
var Tag = require('./tag');

var Article = {
	get: function(id,user_id){
		var mysql = new Mysql()
			, sql = 'select a.id,a.title,a.content from articles a '+
						'left join tag_resource at on at.resource_id = a.id and a.resource_type="article" '+
							'left join tags t on t.id = at.tag_id and t.user_id=? '+
					'where user_id=? and id=?;'
			, data = [user_id,user_id,id];
		return mysql.query(sql,data);
	},
	list: function(user_id){
		if(!user_id) throw 'Error::Article::list argument user_id missing';
		var mysql = new Mysql()
			, sql = 'select id,title,content from articles where user_id=? order by updated_at desc;'
			, data = [user_id];
		return mysql.query(sql,data);
	},
	add: function(article,user_id){
		article.content = Helper.xss(article.content);
		if(!article.title && !article.content) throw 'Error::Article::add Title and content both empty';
		var mysql = new Mysql()
			, sql = 'insert into articles (content,title,created_at,user_id) values (?,?,?,?);'
			, data = [article.content,article.title,new Date(),user_id];
		return mysql.query(sql,data);
	},
	update: function(article,user_id){
		article.content = Helper.xss(article.content);
		if(!article.title && !article.content) throw 'Error::Article::update Title and content both empty';
		var mysql = new Mysql()
			, sql = 'update articles set content=?,title=? where user_id = ? and id = ?;'
			, data = [article.content,article.title,user_id,article.id];
		return mysql.query(sql,data);
	},
	save: function(article,user_id){
		if(!user_id) throw 'Error::Article::save Try to save article without author';
		return article.id ? Tag.update(article,user_id) : Tag.add(article,user_id);
	},
	'delete': function(id,user_id){
		if(!id || !user_id) throw 'Error::Article::delete argument missing';
		var mysql = new Mysql()
			, sql = 'delete from articles where id=? and user_id=?'
			, data = [id,user_id]
			, remove_relation = TagResource['delete'](id,null,user_id,'article');

		remove_relation.once('end',function(){
			mysql.query(sql,data);
		});
		remove_relation.once('err',function(err){
			mysql.emit('err',err)
		});
		return mysql;
	}
}
module.exports = Tag;
