windinsky.define('template/index',['jquery','images/upload'],function(require,exports,module){
	var upload = require('images/upload');
	var canvas = $('#canvas');
	var deleted = [];
	var image_id;
	var temp = '<div class="area">'+
		'<div class="lt_handle handle"></div>'+
		'<div class="rt_handle handle"></div>'+
		'<div class="lb_handle handle"></div>'+
		'<div class="rb_handle handle"></div>'+
		'<div class="l_handle handle"></div>'+
		'<div class="r_handle handle"></div>'+
		'<div class="t_handle handle"></div>'+
		'<div class="b_handle handle"></div>'+
		'<div class="content"></div>'+
	'</div>';
	function active_area(a){
		area = a;
		line = null;
		$('.area,.line').removeClass('active');
		area.addClass('active');
	}
	function active_line(l){
		line = l;
		area = null;
		$('.area,.line').removeClass('active');
		line.addClass('active');
	}
	$('#clear_line').click(function(){
		$('.line').remove();
		deleted = deleted.filter(function(item){
			return !$(item).hasClass('line');
		});
	});
	$(document).on('keydown',function(e){
		//if(['input','select','textarea'].indexOf(e.target.tagName.toLowerCase()) !== -1) return true;
		if(!area && !line) return;
		// delete
		if(e.keyCode == 68){
			(line || area).hide();
			deleted.push(line || area);
			e.preventDefault();
			return false;
		}
		if(e.keyCode == 90 && (e.ctrlKey || e.metaKey)){
			var a = deleted.pop();
			if(a){
				active_area(a.show());
			}
		}
	});
	$('#add_v_line').click(function(){
		add_line('v');
	})
	$('#add_h_line').click(function(){
		add_line('h');
	});

	function add_line(dir){
		$('.line').removeClass('active');
		line = $('<div class="line active '+dir+'">').appendTo(canvas);
		if(dir === 'v'){
			line.css({
				height:canvas.height() + 'px',
				top:0,
				left:$(document).scrollLeft() - canvas.offset().left + document.documentElement.clientWidth/2+'px'
			});
		}
		if(dir === 'h'){
			line.css({
				width:'100%',
				top:$(document).scrollTop() - canvas.offset().top + document.documentElement.clientHeight/3+'px',
				left:0
			})
		}
	}
	upload.setup_upload($('#file'),$('#progress').find('.close'),function(data){
		canvas.css('width',data.width+'px');
		canvas_pos = $('#canvas').offset();
		image_id = data.id;
		$('#progress').find('.close').trigger('click');
		canvas.find('img').attr('src',data.src).show();
		$('#file').unbind('change');
		$('#save').click(save);
	});
	function stop_default(e){
		e.preventDefault();
	}
	var start_pos,line,end_pos,start_offset,direction,start_size,canvas_pos;
	canvas.find('img')
		.mousedown(stop_default)
		.mouseup(stop_default)
		.click(stop_default)
		.mousemove(stop_default);
	function start_modify(e){
		var src = $(e.target);
		active_area(src.parents('.area:first'));
		start_pos = {
			x: e.clientX + $(document).scrollLeft(),
			y: e.clientY + $(document).scrollTop()
		};
		start_offset = {
			x: parseInt(area.css('left')),
			y: parseInt(area.css('top'))
		};
		start_size = {
			w: area.width(),
			h: area.height()
		};
		var d = '';
		if(src.hasClass('content')){
			start_move();
			return false;
		}else if(src.hasClass('l_handle')){
			d = 'l';
		}else if(src.hasClass('r_handle')){
			d = 'r';
		}else if(src.hasClass('t_handle')){
			d = 't';
		}else if(src.hasClass('b_handle')){
			d = 'b';
		}else if(src.hasClass('lt_handle')){
			d = 'lt';
		}else if(src.hasClass('rb_handle')){
			d = 'rb';
		}else if(src.hasClass('lb_handle')){
			d = 'lb';
		}else if(src.hasClass('rt_handle')){
			d = 'rt';
		}
		direction = d;
		start_resize();
		return false;
	}
	$('#lock_line').click(lock_lines);
	function lock_lines(){
		if($('#lock_line').val() == '编辑热区'){
			$('.line').addClass('lock');
			$('.area').removeClass('lock');
			$('#lock_line').val('编辑参考线');
			canvas.delegate('.handle,.content','mousedown',start_modify)
			canvas.on('mousedown',start_draw);
			canvas.undelegate('.line','mousedown',start_move_line);
		}else{
			$('.line').removeClass('lock');
			$('.area').addClass('lock');
			$('#lock_line').val('编辑热区');
			canvas.unbind('mousedown',start_draw);
			canvas.undelegate('.handle,.content','mousedown',start_modify)
			canvas.delegate('.line','mousedown',start_move_line);
		}
	}
	canvas.delegate('.line','mousedown',start_move_line);
	function start_move_line(e){
		active_line($(e.target));
		start_pos = {
			x: e.clientX + $(document).scrollLeft(),
			y: e.clientY + $(document).scrollTop()
		};
		start_offset = {
			x: parseInt(line.css('left')) || 0,
			y: parseInt(line.css('top')) || 0
		};
		canvas.undelegate('.line','mousedown',start_move_line);
		$(document).bind('mousemove',move_line);
		$(document).bind('mouseup',stop_move_line);
		return false;
	}
	function move_line(e){
		if(line.hasClass('h')){
			mouse_y = e.clientY + $(document).scrollTop();
			var top = start_offset.y + mouse_y - start_pos.y;
			top = Math.max(0,top);
			top = Math.min(canvas.height(),top);
			line.css({
				top: top + 'px'
			})
		}
		if(line.hasClass('v')){
			mouse_x = e.clientX + $(document).scrollLeft();
			var left = start_offset.x + mouse_x - start_pos.x;
			left = Math.max(0,left);
			left = Math.min(left,canvas.width());
			line.css({
				left:left + 'px'
			});
		}
	}
	function stop_move_line(){
		canvas.delegate('.line','mousedown',start_move_line);
		$(document).unbind('mousemove',move_line);
		$(document).unbind('mouseup',stop_move_line);
	}

	function start_move(e){
		canvas.undelegate('.handle,.content','mousedown',start_modify);
		$(document).bind('mousemove',move);
		$(document).bind('mouseup',stop_move);
		return false;
	}
	function move(e){
		var mouse_x = e.clientX + $(document).scrollLeft();
		var mouse_y = e.clientY + $(document).scrollTop();
		var top = mouse_y - start_pos.y + start_offset.y;
		top = Math.max(0,top);
		top = Math.min(canvas.height() - area.height(), top);
		var left = mouse_x - start_pos.x + start_offset.x;
		left = Math.max(0,left);
		left = Math.min(canvas.width() - area.width(), left);
		area.css({
			top:top+'px',
			left:left+'px'
		});
	}
	function stop_move(){
		canvas.delegate('.handle,.content','mousedown',start_modify);
		$(document).unbind('mousemove',move);
		$(document).unbind('mouseup',stop_move);
	}
	var area;

	function start_resize(){
		canvas.undelegate('.handle,.content','mousedown',start_modify);
		$(document).bind('mousemove',resize);
		$(document).bind('mouseup',stop_resize);
	}
	function stop_resize(){
		canvas.delegate('.handle,.content','mousedown',start_modify);
		$(document).unbind('mousemove',resize);
		$(document).unbind('mouseup',stop_resize);
	}

	function resize(e){
		var content = area.find('.content');
		if(direction.indexOf('l') !== -1){
			var offset_x = e.clientX + $(document).scrollLeft() - start_pos.x;
			var width = start_size.w - offset_x; 
			width = Math.max(3,width);
			width = Math.min(start_offset.x + start_size.w,width);
			var left = offset_x + start_offset.x;
			left = Math.max(0,left);
			left = Math.min(left, start_offset.x + start_size.w - 3,left);
			content.css({
				width: width - 2 + 'px'
			});
			area.css({
				left: left + 'px'
			});
		}
		if(direction.indexOf('r') !== -1){
			var offset_x = e.clientX + $(document).scrollLeft() - start_pos.x;
			var width = start_size.w + offset_x;
			width = Math.max(3,width);
			width = Math.min(canvas.width() - start_offset.x - 2,width);
			content.css({
				width: width + 'px'
			});
		}
		if(direction.indexOf('t') !== -1){
			var offset_y = e.clientY + $(document).scrollTop() - start_pos.y;
			var height = start_size.h - offset_y;
			height = Math.max(3,height);
			height = Math.min(start_offset.y + start_size.h - 2,height);
			var top = offset_y + start_offset.y;
			top = Math.max(0,top);
			top = Math.min(start_offset.y + start_size.h - 3,top);
			content.css({
				height: height - 2 + 'px'
			});
			area.css({
				top: top + 'px'
			});
		}
		if(direction.indexOf('b') !== -1){
			var offset_y = e.clientY + $(document).scrollTop() - start_pos.y;
			var height = start_size.h + offset_y;
			height = Math.max(3,height);
			height = Math.min(canvas.height() - start_offset.y,height);
			content.css({
				height: height + 'px'
			});
		}
	}

	function start_draw(e){
		canvas.unbind('mousedown',start_draw);
		start_pos = {
			x: e.clientX + $(document).scrollLeft(),
			y: e.clientY + $(document).scrollTop()
		};
		start_offset = {
			x: start_pos.x - canvas_pos.left,
			y: start_pos.y - canvas_pos.top
		};
		$(document).bind('mousemove',draw);
		$(document).bind('mouseup',stop_draw);
		active_area($(temp).appendTo(canvas).css({
			left: start_offset.x + 'px',
			top: start_offset.y + 'px'
		}));
	}
	function draw(e){
		var mouse_x = e.clientX + $(document).scrollLeft();
		var mouse_y = e.clientY + $(document).scrollTop();
		mouse_x = Math.max(mouse_x,canvas_pos.left);
		mouse_x = Math.min(mouse_x,canvas_pos.left + canvas.width() - 2);
		mouse_y = Math.max(mouse_y,canvas_pos.top);
		mouse_y = Math.min(mouse_y,canvas_pos.top + canvas.height() - 2);
		var offset = {
			x : mouse_x - start_pos.x,
			y : mouse_y - start_pos.y
		};
		area.find('.content').css({
			width: Math.abs(offset.x) + 'px',
			height: Math.abs(offset.y) + 'px'
		});
		if( offset.x < 0 ){
			area.css({left: start_offset.x + offset.x + 'px'})
		}
		if( offset.y < 0 ){
			area.css({top: start_offset.y + offset.y + 'px'});
		}
	}
	function stop_draw(e){
		canvas.bind('mousedown',start_draw);
		$(document).unbind('mousemove',draw);
		$(document).unbind('mouseup',stop_draw);
		area.find('div').show();
	}
	function save(){
		var platform = $('#platform').val();
		var cords = $('.area').map(function(i,item){
			return {
				x: parseInt($(item).css('left')),
				y: parseInt($(item).css('top')),
				w: $(item).width(),
				h: $(item).height()
			}
		}).toArray();
		$.ajax({
			url:'/template/save',
			data:{
				canvas_size:JSON.stringify({
					w: canvas.width(),
					h: canvas.height()
				}),
				cords:JSON.stringify(cords),
				image_id:image_id,
				platform:platform
			},
			dataType:'text',
			type:'post',
			success: function(data){
				window.open(data);
			}
		})
	}
});
