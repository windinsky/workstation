windinsky.define('article/edit',['jquery','lib/clearHtmlTag','localstorage','ui/confirm'],function(require,exports,module){

	var $             = require('jquery');
	var Confirm       = require('ui/confirm');
	var clearHtmlTag  = require('lib/clearHtmlTag');

	var DEFAULT_TITLE = 'New article';
	var ns            = 'articles';
	var ignore        = false;

	
	// init AutoSave
	if(global.AutoSave){
		initAutoSave();
	}else{
		__localstorage_loaded.once('end',initAutoSave);
	}

	function initAutoSave(){
		// stop autosaved articles, preventing last page crashed unexpectly;
		AutoSave.stop(ns);

		// set config of articles
		AutoSave.updateCfg({ namespace:ns, url:'/articles/save' });

		var records = AutoSave.getRecords(ns);
		if(records.length){
			records.forEach(function(r){
				if(id == r.id){
					ckeditor.setData(r.content);
				}
			});
		}


		AutoSave.EventEmitter.on('articles_save_ok',function(result){
			if($('#id').val()) return;
			$('#id').val(result[i].data.id);
		});
		AutoSave.EventEmitter.on('articles_save_err',function(result){
			var record = result[0],err = result[1];
			if(err.error.code == windinsky.cfg.error_code.DATABASE.CONFLICT){
				// update conflict process
				// remove false data from localstorage. prevent saving again
				AutoSave.removeRecord(ns,function(data){
					return data.id == record.id;
				});
				// user can choose to save their version as a new one or discard all changes
				new Confirm(
					'Auto save failed, your article has been modified on other client,you can save your version as a new article or load the new version(you would lose all your changes)',
					{
						yesBtn: 'save mine as a new one',
						noBtn: 'load latest version',
						callback: {
							yes: function(){
								// save a new articles
								$.ajax({
									data:{
										title:record.title,
										content:record.content
									},
									url:'/articles/save',
									type:'post',
									success: function(data){
										// reload page
										location.href = '/article/show?id='+data.data.id;
									},
									error: function(e){
										alert('save error' + e);
									}
								});
							},
							no: function(){
								// set local variables back to database version
								var latest_record = err.error.latest_record;
								$('#id').val(latest_record.id)
								$('#title').val(latest_record.title);
								ckeditor.setData(latest_record.content);
								$('.tag').attr('checked',false);
								latest_record.tags.forEach(function(t){
									$('#tag_'+t.id).attr('checked','checked');
								});
							}
						}
					}
				);
			}
		});
		// start autosave
		AutoSave.start(ns);
	}

	function save_to_localstorage(){

		if(ignore) return ignore = !ignore;
	
		var article,id = $('#id').val();

		article = {
			id         : id,
			title      : $('#title').val(),
			content    : ckeditor.getData(),
			fake_id    : $('#fake_id').val(),
			tags       : $('.tag:checked').map(function(t){return this.id.split('_')[1]}).toArray().join(','),
			updated_at : $('#updated_at').val()
		};

		if((!article.title || article.title == DEFAULT_TITLE) && !article.content) return;

		var records = AutoSave.getRecords(ns);

		var existed = false;
		records.every(function(r,i){
			if(r.id === id || r.fake_id === $('#fake_id').val()){
				records[i] = article;
				AutoSave.updateRecords(ns,records);
				existed = true;
				return false;
			}
			return true;
		});
		!existed && AutoSave.addRecord(ns,article);
	}


	$('#title').on('keyup',function(){
		save_to_localstorage();
		$('.selected > span:first').html(clearHtmlTag.process(this.value));
	});

	ckeditor.on('change',save_to_localstorage);

	$('.tag').change(save_to_localstorage);

	$('#add_tag').click(function(){
		var tag = $('#new_tag:visible');
		if(tag.length){
			var val = tag.val();
			if(!val) return alert('Are you kidding?');
			$.ajax({
				url:'/tags/save',
				data:{
					name:val,
					type:'article'
				},
				type:'post',
				dataType:'json',
				success: function(data){
					if(data.success == 1){
						$('<input type="checkbox" value="'+data.data.id+'" checked class="tag" id="tag_'+data.data.id+'"/><label for="tag_'+data.data.id+'">'+val+'</label>').insertBefore('#new_tag');
						$('#add_tag').html('+');
						$('#new_tag').val('').hide();
					}
				}
			})
		}else{
			tag = $('#new_tag');
			tag.show();
			this.innerHTML = 'ok';
		}
	})

});
