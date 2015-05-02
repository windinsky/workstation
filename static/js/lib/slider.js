windinsky.define('lib/slider', ['jquery', 'lib/tween'], function(require, exports, module) {
	var $ = require('jquery'),
		tween = require('lib/tween');

	var Slider = function(container, options) {
		this.container = container;

		var dftOpts = {
			unitCounts: 1,        // 每次滑动几个item
			time: 0,			  // 滚动了几次
			beginingPositoin: 0,  // 开始的位置
			druation: 20		  // 滚动几次结束
		};

		this.opts = $.extend(dftOpts, options);

		this.init();
		this.addEvents();
	}

	Slider.prototype = {
		init: function() {
			var self = this,
				ctn = this.container.children().first(),
				c = ctn.children();

			self.unit = c.outerWidth() + parseInt(c.css('marginRight')) + parseInt(c.css('marginLeft'));

			ctn.width(self.unit * c.length);

			self.opts.changePositioin = self.container.width();
		},
		addEvents: function() {
			var opts = this.opts;

			opts.prev.click(this.prev.bind(this));

			opts.next.click(this.next.bind(this));
		},
		prev: function() {
			var self = this,
				opts = self.opts,
				ctn = self.container;

			// 为了滑动顺滑，将最后一帧变为第一帧
			if(ctn[0].scrollLeft == 0) {
				var c = ctn.children(':first').children();
				c.first().before(c.slice(c.length - opts.unitCounts));
				ctn[0].scrollLeft += opts.changePositioin;
				opts.beginingPositoin += opts.changePositioin;
			}

			var mvTimer = setInterval(function() {
				//判断动画已经执行的时间（次数/帧数）是否小于总时间，是的话继续执行改变位置的函数，否则的话，清理该interval。
				var t = opts.time,
					b = opts.beginingPositoin,
					c = -opts.changePositioin,
					d = opts.druation;

				opts.time <= opts.druation ? function() {
					ctn[0].scrollLeft = parseInt(tween['easeInOut'](t, b, c, d));
					opts.time++;
				}() : function() {
					clearInterval(mvTimer);
					opts.time = 0;
					opts.beginingPositoin += -opts.changePositioin;
				}();
			}, 20);
		},
		next: function() {
			var self = this,
				opts = self.opts,
				ctn = self.container;

			var mvTimer = setInterval(function() {
				//判断动画已经执行的时间（次数/帧数）是否小于总时间，是的话继续执行改变位置的函数，否则的话，清理该interval。
				var t = opts.time,
					b = opts.beginingPositoin,
					c = opts.changePositioin,
					d = opts.druation;

				opts.time <= opts.druation ? function() {
					ctn[0].scrollLeft = parseInt(tween['easeInOut'](t, b, c, d));
					opts.time++;
				}() : function() {
					clearInterval(mvTimer);
					opts.time = 0;
					opts.beginingPositoin += opts.changePositioin;

					// 为了滑动顺滑，如果滚动到最后一帧，则将第一帧变为最后一帧
					if(opts.beginingPositoin + self.unit * opts.unitCounts == ctn.children().first().width()) {
						var c = ctn.children(':first').children();
						c.last().after(c.slice(0, opts.unitCounts));
						ctn[0].scrollLeft -= opts.changePositioin;
						opts.beginingPositoin -= opts.changePositioin;
					}
				}();
			}, 20);
		}
	}

	module.exports = Slider;
});