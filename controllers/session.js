var auth = require('../lib/auth');
var User = require('../models/user');
var Session = require('../models/session');

module.exports = new Controller({
	'new': function(req,res){
		if(this.user_info){
			return res.redirect('/dashboard/');
		}
		var data = {
			__css:['session'],
			callback: decodeURIComponent(req.__get.callback || ''),
			flash: req.flash()
		};
		res.render('session/new.html',data);
	},
	'create': function(req,res){
		if(this.user_info){
			return res.redirect('/dashboard/');
		}
		var account = req.__post.account,
			password = req.__post.password;

		if(!account || !password){
			res.flash({msg:'account & password can not be empty'});
			return res.redirect('/session/new');
		}

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
					res.redirect(req.__post.callback || '/dashboard/');
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
	'destory': function(req,res){
		res.cookie.set(SESSION_NAME,'',{maxAge:0,path:'/',domain:'.windinsky.com'});
		res.redirect('/session/new');
	}
},{
	'destory':[auth]
});
