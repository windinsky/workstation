function wrapCDATA(data){
	return '<![CDATA[' + data + ']]>';
}
var xml2js = require('xml2js');
var wx = module.exports = {
	'generateTextMsgXML': function(from,to,msg){
		return ['<xml>',
			'<FromUserName>'+from+'</FromUserName>',
			'<ToUserName>'+to+'</ToUserName>',
			'<Content>'+wrapCDATA(msg)+'</Content>',
			'<CreateTime>'+parseInt((new Date().getTime())/1000).toString()+'</CreateTime>',
			'<MsgType>text</MsgType>',
		'</xml>'].join('\n');
	},
	'parseTextMessage': function(xml){
		var parseString = xml2js.parseString,r;
		parseString(xml, function(err,result){
			if(err){
				console.log(err);
			}
			r = result.xml;
		});
		return r;
	}
}
