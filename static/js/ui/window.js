windinsky.define('ui/window',['jquery'],function(require,exports,module){
	var _modal_showing = false;
	var default_options = {
		css:{
			width:'300px',
			height:'120px'
		},
		html: ''
	};
	var __css_loaded = false;
	var template = '<div class="__window"></div>';
	var ModalWindow = exports.ModalWindow = function(options){
		this.opt = $.extend(true,default_options,options);
		!__css_loaded && windinsky.loadCss('ui/window');
		this.ele = $(template).appendTo(document.body).hide();
		this.masker = $('#__modal_window_masker');
		if(!this.masker.length){
			this.masker = $('<div id="__modal_window_masker"></div>').appendTo(document.body);
		}
		this.ele.css(options.css || {});
		this.ele.css('marginLeft',-parseInt(options.css.width || 300)/2 + 'px');
		this.masker.hide();
		this.ele.append(this.opt.html);
	};
	ModalWindow.prototype.show = function(){
		if(_modal_showing){
			return ;
		}else{
			this.ele.show();
			this.masker.show();
			_modal_showing = true;
		}
	};
	ModalWindow.prototype.hide = function(){
		this.ele.hide();
		this.masker.hide();
		_modal_showing = false;
	};

	ModalWindow.prototype.destory = function(){
		this.masker.hide();
		this.ele.remove();
	};

	var StaticWindow = exports.StaticWindow = function(options){
		this.opt = $.extend(true,default_options,options);
		!_css_loaded && windinsky.loadCss('ui/window');
		this.ele = $(template).appendTo(document.body);
		this.ele.css(options.css || {});
	};

	StaticWindow.prototype.show = function(){
		this.ele.show();
	};
	StaticWindow.prototype.hide = function(){
		this.ele.hide();
	}

	StaticWindow.prototype.destory = function(){
		this.ele.remove();
	};

});
