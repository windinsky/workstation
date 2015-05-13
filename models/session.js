var md5 = require('../lib/md5');
var util = require('util');
var utils = require('../lib/utils');
var MysqlRecord = require('mysqlrecord');
var columns = require('./columns');


function Session( session ){
	MysqlRecord.call(this,session);
}

util.inherits( Session , MysqlRecord );

utils.extend( Session , MysqlRecord );

Session.$define_table_name( 'sessions' ).$define_columns(columns.sessions);

Session.$belongs_to('user','id,account');

module.exports = Session;
