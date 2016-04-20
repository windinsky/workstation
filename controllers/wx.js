var util = require('util');
var xml2js = require('xml2js');
var sha1 = require('sha1');
var wx = require('../models/wx');
var Mysql = require('../lib/adapter');
var O = require('../models/O');

function validate_signature(opt){
	var str = [opt.nonce,opt.timestamp,WX_PUBLIC_ACCOUNT_TOKEN].sort().join('');
	return opt.signature === sha1(str);
}

module.exports = new Controller({
	'get_message' : function(req,res){
		console.log(req.__get,req.__post);
		return res.end(req.__get.echostr);
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
	},
	'tiaozhuan': function(req,res){
		thirdparty.secrets(function(secret){
			return res.render('wx/tiaozhuan.html',{
				secret: secret
			});
		});
	},
	'get_auth_info': function(req,res){
		var token_info = req.__get;
		thirdparty.fetch_user_info(token_info.auth_code,function(err,user_info){
			if(err) res.end('auth failed');
			res.cookie.set('wx_token',user_info.wx_token,{
				maxAge : 90*24*60*60,
				domain : '.windinsky.com',
				path   : '/'
			});
			res.end(JSON.stringify(user_info));
		});
	},
	'show_user': function(req,res){
		thirdparty.get_user_info( req.cookie.wx_token , function( err , user_info ){

			if( err ) res.end(JSON.stringify(err));

			var client = thirdparty.createClient( user_info );
			var openid=req.__get.openid;
			client.getUser(openid,function( err , data ){
				if(data.headimgurl){
					res.setHeader('content-type','text/html');
					res.end('<img src="'+data.headimgurl+'"/>');
				}else{
					res.end(JSON.stringify(data));
				}
			});
			//res.end(JSON.stringify(user_info)); 
		});
	},
	'auth' : function(req,res){
		thirdparty.save_ticket(req.body);
		console.log(req.body || '');
		res.end('success');
	}
});
