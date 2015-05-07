windinsky.define('lib/clearHtmlTag',[],function(require,exports){
	exports.process = function(html){
		return html.replace(/\</g,'&lt;');
	};
});
