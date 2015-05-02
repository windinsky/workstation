var auth = require('../lib/auth');
var Note = require('../models/note');

module.exports = new Controller({
	'list' : function(req,res){
		var notes = Note.list(this.user_info.id),self = this;
		notes.once('end',function(list){
			var data = {
				notes: list,
				useAutoSave: true,
				fake_id: new Date().getTime(),
				__css: ['notes/index']
			};
			res.render('notes/index.html',data);
		});
	},
	'delete': function(req,res){
		var id = req.__post.id, 
			query = Note['delete'](id,this.user_info.id);
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
			query = Note.save(req.__post,this.user_info.id);

		query.once('error',function(err){
			return res.json({ success:0, error:err });
		});
		query.once('end', function(data){
			return res.json({ success:1, id: id || data.insertId });
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
