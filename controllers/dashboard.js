var auth = require('../lib/auth');
module.exports = new Controller({
	'index': function(req,res){
		if(!this.user_info) return res.redirect('/session/new');
		res.end('<meta charset="utf-8"/><a href="/session/destory">注销</a>'+req.cookie[SESSION_NAME]);
	}
},{
	'index':[auth]
});

