var auth = require('../lib/auth');
var User = require('../models/user');
var Helper = require('../helper');

module.exports = new Controller({
	'new': function(req,res){
        console.log(123);
		var data = {
			__css:['session']
		}
		res.render('user/new.html',data);
	},
	'create': function(req,res){
        console.log(456);
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

        var user = new User({
            account : account
            , password : password
            , created_at : new Date()
            , updated_at : new Date()
        });
        console.log(user);

        user.$save( [ 'account' , 'password' , 'created_at' , 'updated_at' ] , [ 'id' ] , function( err , data ){
            console.log(arguments);
			res.redirect('/session/new');
        
        });

	},
	'destory': function(req,res){
	}
},{
	'create':[auth],
	'destory':[auth]
});
