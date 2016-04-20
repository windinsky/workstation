windinsky.define('notes/slider',['zepto'],function(require,exports,module){

	var $ = require('zepto');

	setTimeout(function(){
		$('#img').ready(function(){
			alert(123);
		});
	},3000);

	var imgs = $('.container img').css('width','auto');
	const GAPS = 2;
	const MIN_SPEED = .1;
	const FRICTION = 0.05;
	const BOUNDARY_FRICTION = 4;
	const MAX_VELOCITY = 3

	var total_width = imgs.toArray().reduce( function( prev , current ){
		return prev + $(current).width();
	} , 0 ) + GAPS * ( imgs.length + 1 );

	$('.container').css({
		"width" : "100%"
		, "overflow" : "hidden"
		, "padding" : "2px 0"
	});

	var current = 0
		, start_pos = 0
		, start_margin = 0
		, velocity = 0
		, animation_id = null
		, animation_time = 0
		, current_margin = 0
		, time = null;

	imgs.css( 'marginLeft' , GAPS + 'px' )

	var inner = $('.inner').css({ "width" : total_width + 1 + 'px' }).css( 'overflow' , 'hidden' );

	inner.on( 'touchmove' , function(e){

		var time_dis = new Date().getTime() - time;
		velocity = ( e.touches[0].clientX - current ) / time_dis;
		console.log( e.touches[0].clientX , current , time_dis , velocity );
		current = e.touches[0].clientX;

		var ori = parseInt( inner.css( 'marginLeft' ) );
		var target_pos = start_margin + ( e.touches[0].clientX - start_pos );
		var max = 0 ;
		var min = - ( total_width - $(window).width() );
		time = new Date().getTime();

		if( target_pos > max ){
			target_pos = target_pos / 4;
		}
		if( target_pos < min ){
			target_pos = min - ( -total_width + $( window ).width() - target_pos )/4 ;
		}

		inner.css( 'marginLeft' , target_pos + 'px' );
		//parseInt( inner.css( 'marginLeft' ) );

		e.preventDefault();
		e.stopPropagation();

	
	}).on( 'touchstart' , function(e){

		window.cancelAnimationFrame( animation_id );
		time = new Date().getTime();
		velocity = 0;
		start_pos = e.touches[0].clientX;
		current = e.touches[0].clientX;
		start_margin = parseInt( inner.css( 'marginLeft' ) || 0 );
		e.preventDefault();
		e.stopPropagation();

	}).on( 'touchend' , function(e){
		
		if( Math.abs( velocity ) < MIN_SPEED ){
			check_boundary();
		}else{
			decelerate();
		}

		e.preventDefault();
		e.stopPropagation();

	});

	function check_boundary(){
		
		var ml = parseInt( inner.css( 'marginLeft' ) )
			, arr = []
			, max = 0
			, min = - ( total_width - $(window).width() )

		if( ml > max ){
			while(ml > max){
				ml = Math.max( max , ml - 2 );
				arr.push( ml );
			}
		}else if( ml < min ){
			while( ml < min ){
				ml = Math.min( min , ml + 2 );
				arr.push( ml );
			}
		}
		var timer = setInterval( function(){

			inner.css('marginLeft' , arr.shift() + 'px')
			if( ! arr.length ){
				clearInterval( timer );
			}
			
		});
	
	};

	function frame( timestamp ){
	
		var now = new Date().getTime()
			, time_dis = now - animation_time
			, dis = time_dis * velocity
			, friction;

		animation_time = now;
		console.log(velocity , time_dis , dis);

		current_margin = current_margin + dis;

		current_margin = Math.min( Math.max( current_margin , - total_width + $('.container').width()/2 ) , 50 );

		inner.css( 'marginLeft' , current_margin );

		if( current_margin > 0 || current_margin < - ( total_width - $(window).width() ) ){
			friction = BOUNDARY_FRICTION;
		}else{
			friction = FRICTION;
		}

		if( Math.abs(velocity) < Math.abs( friction ) ){
			velocity = 0;
			return check_boundary();
		}

		if( velocity > 0 ){
			velocity -= friction;
		}else{
			velocity += friction;
		}


		animation_id = requestAnimationFrame( frame );

	}

	function decelerate(){
		velocity = velocity * 3/5
		velocity = ( Math.abs(velocity) / velocity ) * Math.min( Math.abs( velocity ) , MAX_VELOCITY );
		animation_time = new Date().getTime();
		current_margin = parseInt( inner.css( 'marginLeft' ) );
		setTimeout(function(){
			animation_id = requestAnimationFrame( frame );
		},2);
	}


});
