var auth = require('../lib/auth');
var Article = require('../models/article');
var Tag = require('../models/tag');

module.exports = new Controller({
	'list' : function(req,res){
		var articles = Article.list(this.user_info.id),self = this;
		articles.once('end',function(list){
			var data = {
				articles: list,
				useAutoSave: true,
				fake_id: new Date().getTime(),
				__css: ['articles/index']
			};
			res.render('articles/index.html',data);
		});
	},
	'new': function(req,res){
		var user_id = this.user_info.id;
		var tags = Tag.list(user_id,'article');
		tags.once('end',function(tags){
			res.render('articles/edit.html',{
				__css: ['articles/new'],
				useAutoSave: true,
				article:{},
				user_id: user_id,
				id:undefined,
				tags:tags
			});
		});
	},
	'edit': function(req,res){
		var article_id = req.__get.id, user_id = this.user_info.id;
		var article = Article.get({
			id:article_id,
			user_id: user_id
		});
		article.once('end',function(a){
			var tag = Tag.list(user_id,'article');
			tag.once('end',function(tags){
				if(a){
					return res.render('articles/edit.html',{
						__css: ['articles/new'],
						article:a,
						tags:tags
					});
				}else{
					return res.render('articles/404.html',{msg:'Article not exist',__css:['articles/404']});
				}
			});
			tag.once('err',function(err){
				return res.render('articles/404.html',{msg:'get tags error',err:err,__css:['articles/404']});
			});
		});
		article.once('err',function(err){
			return res.render('articles/404.html',{msg:JSON.stringify(err),_css:['articles/404']});
		});
	},
	'delete': function(req,res){
		var id = req.__post.id, 
			query = Article['delete'](id,this.user_info.id);
		query.once('end',function(data){
			if(data.affectedRows == 1){
				return res.json({success:1, id:id});
			}else{
				return res.json({success:0, msg:'record not found'});
			}
		});
		query.once('error',function(err){
			return res.json({success:0,err:err});
		});
	},
	'save': function(req,res){
		var id = req.__post.id,
			title = req.__post.title,
			content = req.__post.content,
			tags = req.__post.tags,
			user_id = this.user_info.id;

		if(tags){
			var verify = Tag.is_owner(user_id,tags);
			verify.once('yes',function(){
				save_article();
			});
			verify.once('no',function(){
				return res.json({success:0,err:'you are kidding me!'});
			});
		}else{
			save_article();
		}

		function save_article(){
			var query = Article.save(req.__post,user_id);
			query.once('end',function(data){
				id = id || data.insertId;
				if(tags){
					save_tag_relation();
				}else{
					return res.json({success:1});
				}
			});
			query.once('err',function(err){
				return res.json({success:0,err:err});
			});
		}


		function save_tag_relation(){
			var save_relation = TagResource.replace(id,tags,'article');
			save_relation.once('end',function(){
				res.json({success:1,id:id});
			});
			save_relation.once('err',function(err){
				res.json({success:0,msg:'save relation failed',err:err})
			});
		}

	}
},{
	'list':[auth],
	'save':[auth],
	'new':[auth],
	'edit':[auth],
	'delete':[auth]
},{
	'list':['get'],
	'save':['post'],
	'delete':['delete']
});
