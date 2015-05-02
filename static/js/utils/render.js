windinsky.define('utils/render',['lib/ejs'],function(require,exports,module){
	var ejs = require('lib/ejs');
	module.exports = function(id,opt){
		var text = document.getElementById(id);
		if (!text) {
			console.log('missing template node '+id);
			return '';
		};
		text = text.innerHTML;
		opt.__open = '<?';
		opt.__close = '?>';
		return ejs.render(text,opt);
	};
})