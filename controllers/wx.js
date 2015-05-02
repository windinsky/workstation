var util = require('util');
var sha1 = require('sha1');
var wx = require('../models/wx');

function validate_signature(opt){
	var str = [opt.nonce,opt.timestamp,WX_PUBLIC_ACCOUNT_TOKEN].sort().join('');
	return opt.signature === sha1(str);
}

module.exports = new Controller({
	'get_message' : function(req,res){
		var get = req.__get;
		if(!validate_signature(get))
			return res.end('You son of a bitch...');
		var msg = wx.parseTextMessage(req.body)
			,xml = wx.generateTextMsgXML(
				msg.ToUserName,
				msg.FromUserName,
				'You are so beautiful'
			);
		console.log(msg);
		res.end(xml);
	},
	'add_image': function(req,res){
		wxapi.uploadMaterial('/home/windinsky/windinsky/static/img/account_icon.png','image',function(err,resp){
			console.log(err,resp);
		});
		res.end('');
	}
});
