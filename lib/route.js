var path = require('path');
var url = require('url');

var Router = {
	rules: [],
	alias: function(alias_name , real_path){
		Router.addRule(new RegExp('^\/'+alias_name+'$'), function(){
			return this;
		}.bind(real_path));
	},
	addRule: function(reg,func){
		Router.rules.push({
			reg: reg,
			process: func
		});
	},
	setDefaultAction: function(action){
		Router.alias('',action);
	},
	_config: {
		multi_sites: false,
		basedon: function(req){
			return url.parse(req.url).pathname;
		}
	},
	config: function(cfg){
		for(var i in cfg){
			if(!cfg.hasOwnProperty(i)) continue;
			this._config[i] = cfg[i];
		}
	},
	dealwith: function(req,res){
		var p = Router._config.basedon(req);
		if(p.match(/.*?\.ico/)){
			return res.redirect('http://static.windinsky.com/img'+p);
		}
		var query_path = strip(p)
			, ctrls_path = Router._config.ctrls_path;

		if(Router._config.multi_sites){
			ctrls_path = path.resolve(ctrls_path, Router._config.sites[req.headers.host]);
		}

		if(global.DEBUG){
			var ctrl = require(
				path.resolve(ctrls_path,query_path.file_location)
			)
			, action = query_path.action;
		
		}else{
			try{
				var ctrl = require(
					path.resolve(ctrls_path,query_path.file_location)
				), action = query_path.action;
			}catch(e){
				return res.end('404');
			}
		}

		ctrl[action](req,res);
	}
};

module.exports = Router;

function strip(p){
	
	Router.rules.forEach(function(rule){
		if(p.match(rule.reg)){
			p = rule.process(p);
		}
	});
	
	p = p.match(/^(\/*)(.*?)$/)[2].replace(/\/+/g,'/').split('/');

	var action = p.pop();

	if(p.length == 0){
		return {
			file_location: action,
			action: 'index'
		}
	}else{
		return {
			file_location: p.join('/'),
			action: action || 'index'
		};
	}
}
