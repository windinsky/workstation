var auth = require('../lib/auth');
var Note = require('../models/note');
var Helper = require('../helper');

module.exports = new Controller({
	'list' : function(req,res){
		var notes = Note.list(this.user_info.id),self = this;
		notes.once('end',function(list){
			list.forEach(function(note){
				note.title = Helper.xss(note.title);
				note.content = Helper.xss(note.content);
			})
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

		query.once('not_exist',function(){
			return res.json({ success:0 , error:{
				code: error_code.DATABASE.NOT_EXIST,
				msg: 'note does not exist'
			}});
		});

		query.once('conflict',function(data){
			return res.json({
				success:0, error:{
					code: error_code.DATABASE.CONFLICT,
					msg:'modify conflict',
					latest_record:data
				}
			});
		});
		query.once('error',function(err){
			return res.json({ success:0, error:err });
		});
		query.once('save_end', function(data){
			return res.json({ success:1, data:data});
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
