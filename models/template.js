var util = require('util');
var utils = require('../lib/utils');
var MysqlRecord = require('mysqlrecord');
var columns = require('./columns');


function Template( template ){
	MysqlRecord.call(this,template);
}

util.inherits( Template , MysqlRecord );

utils.extend( Template , MysqlRecord );

Template.$define_table_name( 'templates' ).$define_columns(columns.templates);

module.exports = Template;
