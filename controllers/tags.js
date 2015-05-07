var auth = require('../lib/auth');
var Tag = require('../models/tag');

module.exports = new Controller({
	'list' : function(req,res){
		var type = req.__get.type;
		var tags = Tag.list(this.user_info.id,type),self = this;
		tags.once('end',function(list){
			switch(req.wants()){
				case 'json':
					return res.json(list);
				default:
					var data = {
						tags: list,
						__css: ['tags/index']
					};
					res.render('tags/index.html',data);
					break;
			}
		});
	},
	'delete': function(req,res){
		var id = req.__post.id, 
			query = Tag['delete'](id,this.user_info.id);

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
		var id = req.__post.id,query,
			query = Tag.save(req.__post,this.user_info.id);

		query.once('error',function(err){
			return res.json({ success:0, error:err });
		});
		query.once('save_end', function(data){
			return res.json({ success:1, data:data[0]});
		});
	}
},{
	'list':[auth],
	'save':[auth],
	'delete':[auth]
},{
	'list':['get'],
	'save':['post'],
	'delete':['delete']
});
