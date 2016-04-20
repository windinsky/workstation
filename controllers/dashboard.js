var auth = require('../lib/auth');
module.exports = new Controller({
	'index': function(req,res){
		//if(!this.user) return res.redirect('/session/new');
		res.end('<html><head><meta charset="utf-8"/><meta property="wb:webmaster" content="22889c4fa1adeffe" /></head><body><a href="/session/destory">注销</a>'+req.cookie[SESSION_NAME]+'</body></html>');
	}
},{
});

