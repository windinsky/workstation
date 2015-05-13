var auth = require('../lib/auth');
var User = require('../models/user');
var Session = require('../models/session');
var Helper = require('../helper');

module.exports = new Controller({
	'new': function(req,res){
		var data = {
			__css:['session'],
			callback: decodeURIComponent(req.__get.callback || ''),
			flash: req.flash()
		};
		res.render('session/new.html',data);
	},
	'create': function(req,res){

		//if(!account || !password){
		//	res.flash({msg:'account & password can not be empty'});
		//	return res.redirect('/session/new');
		//}

		var query = User.$find({
			account: req.__post.account,
			password: Helper.hash_password(req.__post.password)
		},'id');

		query.once('end', function(data){
			if(data.length){
				var session = new Session({
					user_id: data[0].id
				});
				var save = session.$save('user_id,token','token');
				save.once('end',function(_session){
					res.cookie.set(SESSION_NAME,_session[0].token,{
						maxAge:30*24*60*60,
						//httpOnly:true,
						domain:'.windinsky.com',
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
			res.redirect('/session/new');
		});
	},
	'destory': function(req,res){
		res.cookie.set(SESSION_NAME,'',{maxAge:0,path:'/',domain:'.windinsky.com'});
		res.redirect('/session/new');
	}
},{
	'destory':[auth]
});
