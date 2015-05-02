var User = require('../models/user');
var EventEmitter = require('events').EventEmitter;

module.exports = function(req,res){
	var self = this, e = new EventEmitter();
	var token = req.cookie[SESSION_NAME];
	if(!token) {
		res.redirect('/session/new?callback='+encodeURIComponent(req.url));
		return false;
	};

	query = User.get_info_by_token(token);
	query.once('end',function(info){
		if(info.length){
			self.user_info = info[0];
		}
		e.emit('end');
	});
	query.once('error', function(err){
		e.emit('end');
	});
	return e;
}
