windinsky.define('articles/index',['jquery'],function(require,exports,module){
	$('.trash').click(function(){
		var id = $(this).parents('li:first').attr('id').split('_')[1];
		$.ajax({
			url: '/articles/delete',
			data:{
				id:id
			},
			dataType:'json',
			type:'delete',
			success: function(data){
				var li = $('#article_'+data.id);
				li.fadeOut(function(){
					li.remove();
				});
			}
		})
	})
})
