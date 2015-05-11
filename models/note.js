var EventEmitter = require('events').EventEmitter;
var Helper = require('../helper');
var util = require('util');
var utils = require('../lib/utils');
var MysqlRecord = require('mysqlrecord');

function Note( note ){
	MysqlRecord.call(this,note);
}

util.inherits( Note , MysqlRecord );

utils.extend( Note , MysqlRecord );

Note.$define_table_name( 'notes' );


Note.$define_columns([
	{
		name      : 'id',
		validates : {
			type     : 'number',
			readonly : true
		}
	},
	{
		name      : 'user_id',
		validates : {
			type     : 'number',
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

module.exports = Note;
