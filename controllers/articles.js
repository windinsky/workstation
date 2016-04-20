var auth = require('../lib/auth');
var Article = require('../models/article');
var Tag = require('../models/tag');
var TagResource = require('../models/tag_resource');

module.exports = new Controller({
	'list' : function(req,res){

		var page_count = req.cookie.page_count || 20;
		var cur = req.__get.page || 0;
		var offset = parseInt(cur)*page_count;

		var articles = Article.$find({user_id:this.user.id},'id,content,title,updated_at','order by articles.updated_at desc',{ $with:'tags' , pagination:{
			offset : offset,
			count : page_count
		} }) , self = this;

		articles.once('end',function(list){
			var data = {
				articles: list.data,
				pagination : {
					total: list.total,
					per: page_count,
					cur: cur,
					url: req.url
				},
				__css: ['articles/index','pagination']
			};
			try{
				res.render('articles/index.html',data);
			}catch(e){
				console.log(e);
			}
		});

	},
	'show': function(req,res){

		var id = req.__get.id;
		
		var article = Article.$find({id:id,user_id:this.user.id},'id,title,content,updated_at',{$with:'tags'},function(err,a){
			res.render('articles/show.html',{
				__css: ['articles/show'],
				article:a[0]
			});
		});

	},
	'new': function(req,res){
		var user_id = this.user.id;
		var tags = Tag.$find({ user_id : user_id , type: 'article' },'id,name','order by updated_at');
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
		var article_id = req.__get.id, user_id = this.user.id;
		var article = Article.$find({ id:article_id , user_id: user_id},'id,content,title,updated_at',{ $with:'tags' });
		article.once('end',function(a){
			a = a[0];
			a.tags = a.tags.map(function(t){return t.id});
			var tag = Tag.$find({user_id:user_id,type:'article'},'id,name');
			tag.once('end',function(tags){
				if(a){
					return res.render('articles/edit.html',{
						__css: ['articles/new'],
						article:a,
						user_id: user_id,
						id: article_id,
						useAutoSave: true,
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
			article = new Article({
				id:id,
				user_id:this.user.id
			});
			query = article.$delete({
				user_id: this.user.id,
				id:id
			});
		query.once('end',function(count){
			if(count == 1){
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
			user_id = this.user.id,
			_article;

		if(tags){
			var verify = Tag.$owner_is(user_id,tags);
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
			var article = new Article(req.__post);
			article.user_id = user_id;
			article.$save('user_id,title,content,created_at',{
				return_columns: 'id,title,content,updated_at',
				conditions:{user_id:user_id}
			});

			article.once('end',function(data){
				id = id || data[0].id;
				_article = data[0];
				if(tags){
					save_tag_relation();
				}else{
					return res.json({success:1,data:_article});
				}
			});
			article.once('error',function(err){
				return res.json({success:0,err:err});
			});
		}


		function save_tag_relation(){
			var save_relation = TagResource.$replace(id,tags,'article');
			save_relation.once('end',function(){
				res.json({success:1,data:_article});
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
	'show':[auth],
	'edit':[auth],
	'delete':[auth]
},{
	'list':['get'],
	'save':['post'],
	'delete':['delete']
});
