windinsky.define('session/new',['jquery'],function(require,exports,module){
	var $ = require('jquery');

	$('#go').click(function(){
        ga('send','event','点击','登录','冬季促销');
		//$('#login').submit();
	});
	$(document).on('keydown',function(e){
		if(e.keyCode == 13){
			$('#login').submit();
		}
	})
});
