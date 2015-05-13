var util = require('util');
var utils = require('../lib/utils');
var MysqlRecord = require('mysqlrecord');
var columns = require('./columns');
var EventEmitter = require('events').EventEmitter;

function TagResource( tag_resource ){
	MysqlRecord.call(this,tag_resource);
}

util.inherits( TagResource , MysqlRecord );

utils.extend( TagResource , MysqlRecord );

TagResource.$define_table_name( 'tag_resources' );
TagResource.$define_columns( columns.tag_resources );

TagResource.$replace = function( resource_id , tag_ids , type ){

	if( !tag_ids ) throw 'tag_ids empty!';
	if( !resource_id ) throw 'resource_id empty!';
	if( !type ) throw 'type empty!';

	tag_ids.split && (tag_ids = tag_ids.split(','));

	var count = tag_ids.length
		, result = []
		, e = new EventEmitter()
		, query = TagResource.$delete({
			resource_id : resource_id,
			type : type
		});


	query.once( 'end' , function(){
		tag_ids.forEach(function(t){
			var tag_resource = new TagResource({
				resource_id : resource_id,
				tag_id : t,
				type : type
			});
			tag_resource.$save('resource_id,tag_id,type',{},function( err , data ){
				if( err ) return e.emit('err',err);
				count--;
				result.push(data[0]);
				if(!count){
					e.emit('end',result);
				}
			});
		});
	} );

	query.once('err',function(err){
		e.emit('err',err);
	});

	return e;

}

module.exports = TagResource;
