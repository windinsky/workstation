var md5 = require('../lib/md5');
var util = require('util');
var utils = require('../lib/utils');
var MysqlRecord = require('mysqlrecord');
var columns = require('./columns');
var Mysql = require('../lib/adapter');


function Image( image ){
	MysqlRecord.call(this,image);
}

util.inherits( Image , MysqlRecord );

utils.extend( Image , MysqlRecord );

Image.$define_table_name( 'images' ).$define_columns(columns.images);

Image.$belongs_to('user','id,account');

Image.find = function(conditions,columns,callback){
	Image.$find(conditions,columns,function(err,img){
		if(err) return callback(err);
		if(!img.length) return callback(undefined,[]);
		var ids = img.map(function(image){
			return image.parent_id || image.id;
		}).join(',');

		try{
		return Image._find(ids,columns,callback);
		
		}catch(e){console.log(e);}
	});
};

Image._find = function(ids,columns,callback){
	var sql = 'select * from images where id in ('+ids+') or parent_id in ('+ids+');';
	var mysql = new Mysql();
	mysql.query(sql,[],function(err,images){
		if(err) return callback(err);
		var obj = {};
		images.forEach(function(img){
			obj[img.id] = img;
			obj[img.id].thumbs = [];
		});
		for(var i = 0  ; i < images.length ; i ++){
			var img = images[i];
			if( obj[img.parent_id] ){
				obj[img.parent_id].thumbs.push(img);
				images.splice(i,1);
				i--;
			}
		}
		callback(undefined,images);
	});
};

module.exports = Image;
