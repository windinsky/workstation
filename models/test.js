var util = require('util');
var utils = require('../lib/utils');
var MysqlRecord = require('mysqlrecord');

function Test( test ){
	MysqlRecord.call(this,test);
}

util.inherits( Test , MysqlRecord );

utils.extend( Test , MysqlRecord );

Test.$define_table_name( 'articles' );

Test.$has_and_belongs_to_many('tags','id,name,created_at,updated_at',{
	join_table : 'tag_resource',
	foreign_key : 'resource_id',
	join_condition : 'tag_resource.resource_type = "article"'
});


Test.$define_columns([
	{
		name      : 'id',
		validates : {
			type     : 'number',
			readonly : true
		}
	},
	{
		name      : 'title',
		validates : {
			type      : 'string',
			not_null  : true,
			maxLength : 255
		}
	},
	{
		name      : 'content',
		validates : {
			type     : 'string',
			not_null : true
		}
	},
	{
		name      : 'created_at',
		validates : {
			type     : 'date',
			not_null : true
		}
	},
	{
		name      : 'updated_at',
		validates : {
			type     : 'date',
			not_null : true
		}
	}
]);

module.exports = Test;
