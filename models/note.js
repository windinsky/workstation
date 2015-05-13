var util = require('util');
var utils = require('../lib/utils');
var MysqlRecord = require('mysqlrecord');
var columns = require('./columns');

function Note( note ){ MysqlRecord.call(this,note); }

util.inherits( Note , MysqlRecord );

utils.extend( Note , MysqlRecord );

Note.$define_table_name( 'notes' ).$define_columns( columns.notes );

module.exports = Note;
