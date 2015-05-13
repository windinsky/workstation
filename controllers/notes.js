var auth = require('../lib/auth');
var Note = require('../models/note');
var Helper = require('../helper');

module.exports = new Controller({
	'list' : function(req,res){
		var self = this;
		this.user.notes('id,title,content,updated_at')
			.once('end',function(list){
				list.forEach(function(note){
					note.title = Helper.xss(note.title);
					note.content = Helper.xss(note.content);
				});
				res.render('notes/index.html', {
					notes: list,
					useAutoSave: true,
					fake_id: new Date().getTime(),
					__css: ['notes/index']
				});
			});
	},
	'delete': function(req,res){

		var id = req.__post.id
			, query = Note.$delete([{ id:id },{ user_id: this.user.id }]);

		query.once('end', function( data ){

			if( data === 1 ){
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

		var note = new Note(req.__post);
		note.user_id = this.user.id;

		if( note.id ){
		
			Note.$find({id:note.id,updated_at:note.updated_at},'id,updated_at,title,content',function( err , data ){
				if(data.length){
					save();
				}else{
					return res.json({
						success:0, error:{
							code: error_code.DATABASE.CONFLICT,
							msg:'modify conflict',
							latest_record:data[0]
						}
					});
				}
			});

		}else{
			save();
		}

		function save(){
			var s = note.$save('title,content,created_at,user_id',{
				return_columns:'id,title,content,updated_at'
			});
			s.once('end', function(data){
				return res.json({ success:1, data:data[0] });
			});
			s.once('error',function(err){
				return res.json({ success:0, error:err });
			});
		}
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
