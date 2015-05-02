windinsky.define('ui/upload',['jquery'],function(require,imports,module){
	var $ = require('jquery');
	var upload = {
		setup: function(el,opt){
			el = $(el);
			var w = el.outerWidth(), h = el.outerHeight();
			var input = $('<div><input type="file"/></div>').appendTo(el);
			var ori_position = el.css('position');
			if(ori_position != 'absolute' && ori_position != 'relative' && ori_position != 'fixed'){
				el.css('position','relative');
			}
			input.css({
				position:'absolute',
				width:w+'px',
				height:h+'px',
				top:0,
				left:0,
				overflow:'hidden',
				zIndex:'50',
				opacity:0
			}).find('input').css({
				fontSize:'300px'
			}).change(function(){
				var formData = this.files[0];
				console.log(formData);
				if(!formData) return;
				var action = opt.src;
				var form = new FormData();
				form.append('image',formData);
				var xhr = new XMLHttpRequest();
				xhr.withCredentials = true;
				xhr.open('post',action,true);
				var self = $(this);
				var uploadProgress = function(evt){
					console.log(evt);
				}
				xhr.upload.onprogress = uploadProgress;
				xhr.onload = function(){
					self.val('');
					var data = JSON.parse(xhr.responseText);
					opt.success.call(el,data);
				};
				xhr.onerror = opt.error;
				xhr.send(form);
			});
		}
	}
	module.exports = upload;
});
