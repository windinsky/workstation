/**
 * LocalStorage adapter
 * usage: 
 *	var ls = require('localstorage');
 *	ls.set('this:is:my:record','here it is');
 *	// loacalStorage: {
 *	//		'this': {
 *	//			'is': {
 *	//				'my': {
 *	//					'record': 'here it is'
 *	//				}
 *	//			}
 *	//		}
 *	// }
 *	ls.get('this:is'); => // Object: {'my':{'record':'here it is'}}
 */
windinsky.define('localstorage',['utils','jquery'],function(require,exports,module){
	var $ = require('jquery');
	var utils = require('utils');
	var SPLITER = ':';
	var ls = localStorage;


	// Set a value into localStorage
	//	key: splited by ':'
	//	value: the value you want to save
	//	force: default false. if true the method would create every step for you.
	//		For Example, if you call ls.set('a:b:c','d'), and there is no 'a' exist, you would get an error
	//		if you call ls.set('a:b:c','d',true); localStorage would be like :
	//		{
	//			'a':{
	//				'b':{
	//					'c':'d'
	//				}
	//			}
	//		}
	var set = exports.set = function(key,value,force){
		if(!key || value === undefined) return false;
		var keys = key.split(SPLITER);
		if(keys.length === 1){
			ls[keys[0]] = JSON.stringify(value);
			return true;
		}
		var obj;
		try{
			if(force){
				ls[keys[0]] = ls[keys[0]] === undefined ? '{}' : ls[keys[0]];
			}
			obj = JSON.parse(ls[keys[0]]);
		}catch(e){
			console.log('aaaa',e);
			return false;
		}
		var root_key = keys.splice(0,1)[0];
		try{
			var _obj = obj;
			keys.forEach(function(key,i){
				if(i !== keys.length -1){
					if(force){
						if(_obj[key] === undefined){
							_obj[key] = {};
						}
					}
					_obj = _obj[key];
				}else{
					_obj[key] = value;
				}
			});
			ls[root_key] = JSON.stringify(obj);
			return true;
		}catch(e){
			console.log('bbbb',e);
			return false;
		}
	}
	// nothing to comment...
	var get = exports.get = function(key){
		if(!key) return undefined;
		var keys = key.split(SPLITER);
		if(keys.length === 1){
			return ls[keys[0]] === undefined ? undefined : JSON.parse(ls[keys[0]]);
		}
		var obj = JSON.parse(ls[keys[0]]);
		keys.splice(0,1);
		try{
			keys.forEach(function(k){
				obj = obj[k];
			});
			return obj;
		}catch(e){
			return undefined;
		}
	};

	//Only be used to append element to an Array value
	var append = exports.append = function(key,value){
		if(!value instanceof Array){
			value =[value];
		}
		var obj = get(key);
		if(!obj instanceof Array) return false;
		return set(key,obj.concat(value));
	};


	var config = exports.config = function(opts){
		var ns = opts.namespace;
		delete opts.namespace;
		set(['config',ns].join(SPLITER),opts,true);
	};

	var remove = exports.remove = function(key){
		var keys = key.split(SPLITER);
		if(keys.length == 1){
			ls.removeItem(key);
			return true;
		}
		var obj = JSON.parse(ls[keys[0]]),_obj = obj, root_key = keys.splice(0,1)[0];
		try{
			keys.forEach(function(k,i){
				if(i === keys.length - 1){
					delete _obj[k];
				}else{
					_obj = _obj[k];
				}
			});
			ls[root_key] = JSON.stringify(obj);
			return true;
		}catch(e){
			return false;
		}
	}

	var AutoSave = {
		init: function(){
			global.__page_id = new Date().getTime().toString() + parseInt(Math.random()*9);
			!get('autosave') && set('autosave',{});
			!get('autosave:storage') && set('autosave:storage',{});
		},
		updateCfg: function(cfg){
			var ns = cfg.namespace,_cfg = get('config:'+ns);
			if(!ns) return;
			if(_cfg){
				var started = _cfg.__started;
				delete _cfg.__started;
				_cfg.namespace = ns;
				if(utils.object.equals(_cfg,cfg)){
					return;
				}
				cfg.__started = started;
			}
			config(cfg);
			AutoSave.reloadCfg();
		},
		start: function(ns){
			if(!AutoSave.config){
				AutoSave.reloadCfg();
			}
			if(ns){
				if(!AutoSave.config[ns]){
					throw 'AutoSave ERROR: ' + ns + ' has not been configured. you can not start it.';
				}
				if(AutoSave.config[ns].__started) return;
				AutoSave.config[ns].__started = true;
				set('config:'+ns,AutoSave.config[ns]);
				AutoSave.timers[ns] = setInterval(function(){
					AutoSave.save(ns);
				},AutoSave.config[ns].timer || 10000);
			}else{
				for(var i in AutoSave.config){
					if(AutoSave.config.hasOwnProperty(i)){
						AutoSave.start(i);
					}
				}
			}
		},
		stop: function(ns){
			clearInterval(AutoSave.timers[ns]);
			var cfg = AutoSave.config[ns];
			if(cfg){
				delete cfg.__started;
				cfg['namespace'] = ns;
				config(cfg);
			}
		},
		reloadCfg: function(){
			AutoSave.config = get('config');
		},
		timers: {},
		config: null,
		addRecord: function(ns,record){
			var key = ['autosave','storage',ns].join(SPLITER), storage = get(key);
			if(!storage || !storage.length) set(key,[record]);
			else set(key,storage.concat([record]));
		},
		getRecords: function(ns){
			return get(['autosave','storage',ns].join(SPLITER)) || [];
		},
		clearRecords: function(ns){
			return remove(['autosave','storage',ns].join(SPLITER));
		},
		updateRecords: function(ns,record){
			return set(['autosave','storage',ns].join(SPLITER),record,true);
		},
		removeRecord: function(ns,filter){
			if(!ns) return;
			var key = ['autosave','storage',ns].join(SPLITER);
			var storage = get(key);
			var arr = [];
			storage && storage.forEach(function(s){
				if(filter(s) === false) arr.push(s);
			});
			set(key,arr);
		},
		saveAllImmediately: function(ns,callback){
			var e = new EventEmitter();
			if(ns){
				var key = ['autosave','storage',ns].join(SPLITER)
					, cfg = AutoSave.config[ns]
					, count = 0
					, storage = get(key)
					, failed = false;

				storage.forEach(function(s,i){
					if(s.__isSaving) return;
					count++;
					s.__isSaving = true;
					AutoSave.__save(cfg,s,function(err,data){
						if(!err && data && data.success){
							return e.emit('success',this);
						}
						e.emit('error', {
							error : err || data.msg,
							index: this
						});
					}.bind(i));
				});
				return e.once('error',function(){
					failed = true;
					e.emit('failed');
				}).on('error',function(err){
					count--;
					if(count === 0){
						e.emit('end');
					}
					var record = storage[err.index];
					AutoSave.EventEmitter.emit(ns + '_save_err',[record,err]);
					delete storage[err.index].__isSaving;
				}).on('success',function(data){
					count--;
					var record = storage[data];
					delete record.__isSaving;
					AutoSave.EventEmitter.emit(ns + '_save_ok',$.extend(record,data));
					storage[data] = undefined;
					if(count === 0){
						e.emit('end');
					}
				}).once('end',function(){
					var arr = storage.forEach(function(s){
						if(s === undefined) return;
						arr.push(s);
					});
					set(key,arr);
					if(!failed){
						e.emit('succeeded');
					}
				});
			}else{
				throw 'namespace must be specific';
			}
		},
		save: function(ns){
			var cfg = AutoSave.config[ns]
				, key = ['autosave','storage',ns].join(SPLITER)
				, storage = get(key);

			if(storage && storage.length){
				AutoSave.__save(cfg,storage[0],function(error,data){
					if(!error && data && data.success === 1){
						var record = storage.splice(0,1)[0];
						delete record.__isSaving;
						set(key,storage);
						AutoSave.EventEmitter.emit(ns+'_save_ok',[record,data]);
					}else{
						delete storage[0].__isSaving;
						set(key,storage);
						AutoSave.EventEmitter.emit(ns+'_save_err',[storage[0],data]);
					}
				});
				storage[0].__isSaving = true;
				set(key,storage);
			}
		},
		__save: function(cfg,data,callback){
			$.ajax({
				url : cfg.url,
				data : data,
				type : 'post',
				dataType : 'json',
				success: function(data){
					callback(undefined,data);
				},
				error: function(err){
					callback(err);
				}
			});
		},
		EventEmitter: new EventEmitter()
	}
	ls['config'] = ls['config'] || '{}';

	exports.AutoSave = AutoSave;
});
