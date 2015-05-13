var md5 = require('../lib/md5');
var util = require('util');
var utils = require('../lib/utils');
var MysqlRecord = require('mysqlrecord');
var columns = require('./columns');

function User( user ){ MysqlRecord.call( this , user ); }

util.inherits( User , MysqlRecord );

utils.extend( User , MysqlRecord );

User.$define_table_name( 'users' ).$define_columns( columns.users );

User.$has_many('notes','id,title,content,updated_at');
User.$has_many('articles','id,title,content,updated_at');
User.$has_many('tags','id,type,name,updated_at');

module.exports = User;
