windinsky.define('session/new',['jquery'],function(require,exports,module){
	var $ = require('jquery');

	$('#go').click(function(){
		$('#login').submit();
	});
	$(document).on('keydown',function(e){
		if(e.keyCode == 13){
			$('#login').submit();
		}
	})
});
