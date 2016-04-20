var auth = require('../lib/auth');
var Note = require('../models/note');
var Helper = require('../helper');

module.exports = new Controller({
	'start': function(req,res){
		res.render('test_cookies/start.html',{
			host:'https://accountlab.meilishuo.com'
		});
	},
	'set': function(req,res){
		var is_delete = req.__get.is_delete;
		if(is_delete){
			res.setHeader('Set-Cookie',
				[
					'MEILISHUO_MM=deleted;max-age:0;domain=.meilizhizao.com;path=/;expires='+new Date('1970/1/1').toGMTString(),
					'santorini_mm=deleted;max-age=0;domain=.meilizhizao.com;path=/;expires='+new Date('1970/1/1').toGMTString()
				]
			)
		}else{
			var cookies = req.__get.cookies.split(',');
			res.setHeader('Set-Cookie',
				[
					'MEILISHUO_MM='+cookies[0]+';max-age=2592000;domain=.meilizhizao.com;path=/',
					'santorini_mm='+cookies[1]+';domain=.meilizhizao.com;path=/'
				]
			);
		}
		res.end('');
	}
});
