var util = require('util');
var utils = require('../lib/utils');
var MysqlRecord = require('mysqlrecord');

function Test( test ){
	MysqlRecord.call(this,test);
}

util.inherits( Test , MysqlRecord );

utils.extend( Test , MysqlRecord );

Test.$belongs_to('note','id,title,content,updated_at');

Test.$define_table_name( 'tests' );

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
		name      : 'note_id',
		validates : {
			type     : 'number',
			not_null : true
		}
	}
]);

module.exports = Test;
