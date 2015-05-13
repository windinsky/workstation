var util = require('util');
var utils = require('../lib/utils');
var MysqlRecord = require('mysqlrecord');
var columns = require('./columns');

function Test( test ){
	MysqlRecord.call(this,test);
}

util.inherits( Test , MysqlRecord );

utils.extend( Test , MysqlRecord );

Test.$define_table_name( 'articles' );

Test.$has_and_belongs_to_many('tags','id,name,created_at,updated_at',{
	join_table : 'tag_resources',
	foreign_key : 'resource_id',
	join_condition : 'tag_resources.type = "article"'
});


Test.$define_columns( columns.articles );

module.exports = Test;
