!function(w){
    window.EMPTY_FUNC = function(){};
	if(!console || !console.log){
        console.log = EMPTY_FUNC;
    }
	var cache = {};
	var cssCache = [];
	var loadingModules = [];
	function Module(id){
		EventEmitter.call(this);
		this.id = id;
		this._ready = false;
	}
    var timers = [];
	Module.prototype.isDepend = function(id){
		return this.dependents.indexOf(id) !== -1;
	};
	Module.prototype.ready = function(){
		this._ready = true;
		this.emit('ready');
	}
	Module.prototype.undepend = function(id){
		var index = this.dependents.indexOf(id);
		if (index === -1) return;
		this.dependents.splice(index,1);
		if (this.dependents.length === 0) {
			this.emit('ready');
		};
	};
	for(var i in EventEmitter.prototype){
		if (typeof EventEmitter.prototype[i] === 'function') {
			Module.prototype[i] = EventEmitter.prototype[i];
		};
	};
	
	w.windinsky = {
		use: function(modules,fn){
			if (!modules) return;
			if (typeof modules === 'string') modules = [modules];
			if (modules.constructor !== Array) return ;
			var count = modules.length,unloadedModules = [];
			function checkLoaded(){
				count--;
				if(!count){
					typeof fn === 'function' && setTimeout(function(){
						fn.call(cache);
					},1);
				}
			}
			for(var i = 0 ; i < modules.length ; i++){
				var module = modules[i],_module;
				if(cache[modules[i]]){
					checkLoaded();
					continue;
				}
				if(_module = windinsky.isLoading(module)){
					_module.once('ready',checkLoaded);
					continue;
				}
				unloadedModules.push(module);
			}
			for(var i = 0 ; i < unloadedModules.length ; i ++){
				windinsky.load(unloadedModules[i],checkLoaded);
			}
		},
		isLoading: function(id){
			for(var i = 0 ; i < loadingModules.length; i++){
				var m = loadingModules[i];
				if(m.id === id) return m;
			}
		},
		define: function(id,dependents,fn){
			var _module = { exports:{} };
			if (cache[id] && cache[id]) {
				return;
			};
			var module = windinsky.isLoading(id);
			if (dependents.length === 0) {
				fn && typeof fn == 'function' && fn(windinsky.require,_module.exports,_module);
				cache[id] = _module.exports;
                delete cache[id].__loading;
                cache[id].__loaded = true;
				for(var i = 0 ; i < loadingModules.length ; i++){
					var m = loadingModules[i];
					if(m.id == id){
						m.emit('ready');
						loadingModules.splice(i,1);
						break;
					}
				}
				console.log(id + ' loaded');
				loadingModules.every(function(m,i){
					if(m.id == id){
						loadingModules.splice(i,1);
						return false;
					}
					return true;
				})
			}else{
				var count = dependents.length;
				var module = windinsky.isLoading(id) 
				if(!module){
					module = new Module(id);
					loadingModules.push(module);
				}
				function checkLoaded(){
					count--;
					console.log(id + ' dependency loaded');
					if(!count){
						setTimeout(function(){
							console.log(id + ' loaded');
							loadingModules.every(function(m,i){
								if(m.id == id){
									loadingModules.splice(i,1);
									return false;
								}
								return true;
							})
							module.emit('ready');
						},1);
					}
				}
				module.once('ready',function(){
					fn(windinsky.require,_module.exports,_module);
					cache[id] = _module.exports;
					delete cache[id].__loading;
					cache[id].__loaded = true;
				});
				dependents.forEach(function(m){
					windinsky.load(m,checkLoaded);
				});
			};
		},
		_load: function( id , no_ext ){
			var s = document.createElement('script'),
			head = document.head  || document.getElementsByTagName('head')[0] || document.documentElement;
			s.async = 'async';
			s.defer = 'defer';
			s.onerror = s.onload = s.onreadystatechange = function(){
				var state = s.readyState;
				if (!state || 'loaded' == state || 'complete' == state) {
					s.onerror = s.onload = s.onreadystatechange = null;
	                head.removeChild(s);
	            }
			};
			head.appendChild(s);
			s.src = windinsky.cfg.JS_PATH + id + ( no_ext ? '' : '.js' ) + '?' + windinsky.cfg.VERSION_NUMBER;
		},
		loadCss: function(id){
			if (cssCache.indexOf(id) !== -1) return;
			var style = document.createElement('link');
			style.setAttribute('rel','stylesheet');
			style.setAttribute('rev','stylesheet');
			var head = document.head  || document.getElementsByTagName('head')[0] || document.documentElement;
			head.appendChild(style);
			style.setAttribute('href',windinsky.cfg.CSS_PATH+id+'.css');
			cssCache.push(id);
		},
		load: function(id,fn){
			var _module;
			if(_module = windinsky.isLoading(id)){
				return _module.once('ready',fn);
			}
			if(cache[id] && cache[id].__loaded){
				return fn();
			}
			_module = new Module(id);
			_module.once('ready', fn);
			loadingModules.push(_module);
            timers.push( 
                setTimeout( function(){
                    windinsky._load(id); 
                }, 1 )
            );
		},
        packLoad: function(){
            timers.forEach( function( t ){
                clearTimeout( t );
            });
            var ids = loadingModules.map( function( m ){
                return m.id.replace(/\//g,'+');
            }).join(',');
            windinsky._load( ids , true );
        },
		require: function(id){
			return cache[id];
		}
	}
}(window);
