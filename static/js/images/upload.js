windinsky.define('images/upload',['jquery'],function(require,exports,module){
	var $ = require('jquery');
	var cb = function(){};
	exports.setup_upload = function(ele , close_btn , callback ){
		console.log(close_btn,typeof close_btn)
		if(typeof close_btn === 'function'){
			callback = close_btn;
		}
		ele.change(upload_file);
		cb = callback;
		close_btn.click(function(e){
			$('#progress,#masker').fadeOut();
			return false;
		});
	};
	var MAX_SIZE = 1024*1024*8

	function upload_file(event){
		var files = event.target.files, c = files.length;
		if(c > 10){
			return alert('you can only upload 10 photos once');
		}
		$('#file').unbind('change');
		var progress = $('#progress').show().find('tbody').empty();
		$('#masker').show()
		function progressing(e){
			if(e.lengthComputable){
				var max = e.total;
				var current = e.loaded;

				var Percentage = (current * 100)/max;
				$(this).width(Percentage+'%');
			}  
		}
		$.each(files, function(key,value){

			var bar = $('<tr><td>'+value.name+'</td><td><div><div></div></div></td></tr>').appendTo(progress).find('div:last');
			if(value.size > MAX_SIZE) return bar.parents('td:first').html('image is too big');

			var data = new FormData();
			data.append('upload',value);

			$.ajax({
				url:'/image/upload',
				data:data,
				type:'POST',
				dataType:'json',
				processData: false,
				contentType: false,
				xhr: function() {
					var myXhr = $.ajaxSettings.xhr();
					if(myXhr.upload){
						myXhr.upload.addEventListener('progress',progressing.bind(bar), false);
					}
					return myXhr;
				},
				success: cb || function(data){
				},
				complete: function(){
					c--;
					if(!c) {
						$('#file').val('');
						$('#file').bind('change',upload_file);
					}
				}
			});
		});

	}
});
