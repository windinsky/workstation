var util = require('util');
var utils = require('../lib/utils');
var MysqlRecord = require('mysqlrecord');
var columns = require('./columns');
var EventEmitter = require('events').EventEmitter;

function Tag( tag ){
	MysqlRecord.call(this,tag);
}

util.inherits( Tag , MysqlRecord );

utils.extend( Tag , MysqlRecord );

Tag.$define_table_name( 'tags' );
Tag.$define_columns( columns.tags );

Tag.$has_and_belongs_to_many('articles','id,name,created_at,updated_at',{
	join_table : 'tag_resources',
	association_foreign_key : 'resource_id',
	join_condition : 'tag_resource.resource_type = "article"'
});

Tag.$owner_is = function( user_id , tags ){
	
	var e = new EventEmitter();
	tags = tags.split(',');
	var count = tags.length;
	tags = tags.map(function(t){ return parseInt(t); }).join(',');

	var query = Tag.$find( { user_id : user_id , __ : ' id in (' + tags + ') '} , 'id' );

	query.once( 'end' , function(data){
		if(data.length === count) e.emit('yes');
		else e.emit('no');
	} );

	query.once( 'err' , function(err){
		e.emit('err',err);
	} );

	return e;

}

console.log(columns.tags);
module.exports = Tag;
