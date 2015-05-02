var auth = require('../lib/auth');
var User = require('../models/user');
var Session = require('../models/session');

module.exports = new Controller({
	'list': function(req,res){
		console.log(this.user_info,'1');
		if(this.user_info){
			return res.redirect('/dashboard/');
		}
		var data = {
			__css:['session.less'],
			flash: req.flash()
		};
		res.render('session/new.html',data);
	},
	'delete': function(req,res){
		if(this.user_info){
			return res.redirect('/dashboard/');
		}
		var account = req.__post.account,
			password = req.__post.password;
		console.log(account,password);

		var query = User.find({
			keys:['account','password'],
			values: [account,password]
		});
		query.once('end', function(data){
			if(data.length){
				var user = data[0];
				query = Session.create(user.id);
				query.once('end',function(token){
					res.cookie.set(SESSION_NAME,token,{
						maxAge:30*24*60*60,
						//httpOnly:true,
						domain:'windinsky.com',
						path:'/'
					});
					res.redirect('/dashboard/');
				});
			}else{
				res.flash({msg:'account & password miss match'});
				res.redirect('/session/new');
			}
		});
		query.once('error',function(err){
			console.log(err);
		});
	},
	'new': function(req,res){
		res.cookie.set(SESSION_NAME,'',{maxAge:0,path:'/',domain:'.windinsky.com'});
		res.redirect('/session/new');
	},
	'create': function(req,res){
	
	},
	'send': function(req,res){
	
	},
	'sent': function(req,res){
	
	},
	'set': function(req,res){
	
	}
},{
	'new':[auth],
	'create':[auth],
	'destory':[auth]
});
