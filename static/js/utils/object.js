windinsky.define('utils/object',[],function(require,exports){
	exports.equals = function(obj1,obj2){
		return JSON.stringify(obj1) === JSON.stringify(obj2);
	}
});
