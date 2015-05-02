var auth = require('../lib/auth');
var User = require('../models/user');

module.exports = new Controller({
	'new': function(req,res){
		var data = {
			__css:['session']
		}
		res.render('user/new.html',data);
	},
	'create': function(req,res){
		var account = req.__post.account,
			password = req.__post.password,
			err = [];
		if(!account) err.push('account cannot be empty');
		if(!password) err.push('password cannot be empty');

		if(account){
			if(account.length < 6) err.push('account is too short'); 
			if(account.length > 32) err.push('account is too long'); 
		}

		if(password){
			if(password.length < 6) err.push('password is too short'); 
			if(password.length > 48) err.push('password is too long'); 
		}

		if(err.length){
			return res.end(JSON.stringify({
				success:0,
				msg: err
			}));
		}

		var query = User.create(account,password);
		query.once('end', function(data){
			res.redirect('/session/new');
		});

	},
	'destory': function(req,res){
	}
},{
	'create':[auth],
	'destory':[auth]
});
