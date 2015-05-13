var xss = require('xss');
var md5 = require('../lib/md5');
exports.xss = xss;
exports.hash_password = function(pwd){
	return md5(md5(md5(pwd)));
};
exports.generate_session_token = function(){
	return md5(new Date().getTime().toString());
};
