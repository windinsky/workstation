var error_pages = null;
var Action = require('./action');
var EventEmitter = require('events').EventEmitter;


function Controller(fn,filters,restricts){

	var self = this;
	var restrict = fn.__restrict || {};

	for(var i in fn){
		if(fn.hasOwnProperty(i)){

			self[i] = function(req,res){
				var capsule_data = {};
				var i = this, action = new Action(fn[i],restrict[i]);
				action.once('error', function(err){
					if(error_pages[err.code]){
						res.redirect(error_pages[err.code]);
					}else{
						throw err.msg;
					}
				});
				if(filters && filters[i]){
					var f = process_filters(filters[i],req,res,capsule_data);
					if(f && f !== true){
						f.once('end',function(){
							action.execute.call(capsule_data,req,res,restrict[i]);
						});
					}else if(f === true){
						action.execute(req,res,restrict[i]);
					}
				}else{
					action.execute(req,res);
				}

			}.bind(i);
		}
	}
}

function process_filters(filters,req,res,data){

	var e = new EventEmitter();

	if(filters.constructor == Function){
		e = filters.call(data,req,res);
	}else if(filters.constructor == Array){
		var count = 0;
		filters.forEach(function(filter){
			if(filter && filter.constructor === Function){
				count++;
				var _e = filter.call(data,req,res);
				if(_e.once){
					_e.once('error',function(){
						e.emit('error');
					});
					_e.once('end', function(){
						count--;
						if(count === 0){
							e.emit('end');
						}
					});
				}else if(_e === true){
					count--;
					count === 0 && setTimeout(function(){
						e.emit('end');
					},0);
				}else if(_e === false){
					return false;
				}
			}
		});
	}else{
		console.log('filter无效');
		setTimeout(function(){
			e.emit('end');
		});
	}
	return e;
}

module.exports = Controller;
