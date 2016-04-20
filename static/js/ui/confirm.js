windinsky.define('ui/confirm',['ui/window','jquery'],function(require,exports,module){
	var W = require('ui/window');
	windinsky.loadCss('ui/confirm');

	var Confirm = function(msg,options){
		var self = this;
		var html = '<div class="__confirm_title">'+(options.title || 'Please Confirm')+'</div>' + 
			'<div class="__confirm_content">'+msg+'</div>' +
			'<div class="__confirm_btns">'+
				'<a href="javascript:;" class="yes">'+(options.yesBtn || 'yes')+'</a>'+
				'<a href="javascript:;" class="no">'+(options.noBtn || 'no')+'</a>'+
			'</div>';
		options = $.extend(true,{
			html:html,
			css:{
				width:'600px',
				height:'auto'
			}
		},options);

		this._window = new W.ModalWindow(options);
		this._window.ele.find('a.yes,a.no').click(function(){
			self._window.destory();
		});
		this._window.ele.find('a.yes').click( options.callback.yes );
		this._window.ele.find('a.no').click( options.callback.no );
		this._window.show();
	};

	module.exports = Confirm;
});
