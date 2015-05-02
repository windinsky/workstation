windinsky.define('lib/tween', [], function(require, exports, module) {
	/* des:tween算法。
		  t: 动画已经执行的时间（实际上时执行多少次/帧数）
		  b: 起始位置
		  c: 终止位置
		  d: 从起始位置到终止位置的经过时间（实际上时执行多少次/帧数）*/
	var tween = {
		linear: function(t, b, c, d) {
			return t * c / d + b;
		},
		//缓入函数：斜率从0到1。
		easeIn: function(t,b,c,d){
			return c*(t/=d)*t + b;
		},
		//缓出函数：将c系数变为负值使图形翻转，然后对t减2，使图形向右平移至正确位置
		easeOut: function(t,b,c,d) {
			return -c *(t/=d)*(t-2) + b;
		},
		//缓入缓出
		easeInOut: function(t,b,c,d){
			//判断当前时间是否在总时间的一半以内，是的话执行缓入函数，否则的话执行缓出函数
			if ((t/=d/2) < 1) return c/2*t*t + b;
			//将总长度设置为一半，并且时间从当前开始递减，对图像进行垂直向上平移。公式变形过程如下图
			return -c/2 * ((--t)*(t-2) - 1) + b;
		}
	};

	module.exports = tween;

});