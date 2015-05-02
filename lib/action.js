var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Action(func,restrict){
	EventEmitter.call(this);
	var self = this;
	this.execute = function(req,res){
		if(restrict){
			var method = req.method.toLowerCase();
			var _method = req.__post._method;
			if(restrict.indexOf(method) == -1 && restrict.index(_method) == -1){
				return self.emit('error',{
					code:404,
					msg: 'method `'+req.method.toLowerCase()+'` is not supported'
				});
			}
		}
		if(restrict && restrict.indexOf(req.method.toLowerCase()) == -1){
		}
		if(debug){
			return func.call(this,req,res);
		}else{
			try{
				func.call(this,req,res);
			}catch(e){
				console.log(e);
				self.emit('error',500);
			}
		}
	}
}

util.inherits(Action,EventEmitter);

module.exports = Action;
