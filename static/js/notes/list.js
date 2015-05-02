windinsky.define('notes/list',['jquery','localstorage'],function(require,exports,module){

	var $ = require('jquery');
	var DEFAULT_TITLE = 'New note';
	var ns = 'notes';


	var save_record = {
		timestamp: null,
		id: null,
		fake_id: null
	};

	if(global.AutoSave){
		initAutoSave();
	}else{
		__localstorage_loaded.once('end',initAutoSave);
	}

	function initAutoSave(){
		AutoSave.stop(ns);
		AutoSave.updateCfg({
			namespace:ns,
			url:'/notes/save'
		});

		AutoSave.EventEmitter.on('notes_save_ok',function(result){
			var note = result[0], response = result[1];
			var fake_id = note.fake_id,_note = $('#note_'+fake_id);
			if(!note.id){
				_note.attr('data-id',response.id);
				if(_note.hasClass('selected')){
					$('#id').val(response.id);
				}
			}
		});

		AutoSave.start(ns);
	}


	$('.notes_list').delegate('li','click',function(e){
		ignore = true;
		$('#title').removeAttr('readonly');
		ckeditor.on('instanceReady',function(){
			ckeditor.setReadOnly(false);
		})
		var self = $(this), 
			id = self.attr('data-id'), 
			fake_id = self.attr('id').split('_')[1];
		$('.notes_list li').removeClass('selected');
		self.addClass('selected');
		saveCurNote();
		var note = notes.filter(function(n){
			return n.id == id || n.fake_id == fake_id;
		})[0];
		ckeditor.setData(note.content);
		$('#title').val(note.title);
		$('#id').val(note.id);
	}).delegate('span.trash','click',function(e){
		var p = $(this).parent();
		var id = p.attr('data-id'), fake_id = p.attr('id').split('_')[1];
		if(!id) {
			p.remove();
			notes.every(function(n,i){
				if(n.id == id || n.fake_id == fake_id){
					notes.splice(i,1);
					return false;
				} 
			});
			return ;
		}
		$.ajax({
			url:'/notes/delete',
			type: 'delete',
			data:{ id:id },
			dataType:'json',
			success: function(data){
				if(data.success){
					p.remove();
					notes.every(function(n,i){
						if(n.id == id){
							notes.splice(i,1);
							return false;
						}
					});
					AutoSave.removeRecord(function(note){
						return note.id == id;
					});
				}
			}
		});
		return false;
	});

	$('#add_new').on('click',function(){
		var timestamp = new Date().getTime();
		var new_note = $('<li id="note_'+timestamp+'"><span>'+DEFAULT_TITLE+'</span><span class="trash"></span></li>').prependTo($('.notes_list ul'));
		notes.push({
			fake_id:timestamp,
			title:DEFAULT_TITLE,
			content:''
		});
		new_note.trigger('click');
	});
	
	function save_to_localstorage(){

		if(ignore) {
			ignore = false;
			return;
		}
	
		var id = $('#id').val()
			, title = $('#title').val()
			, content = ckeditor.getData();

		if((!title || title == DEFAULT_TITLE) && !content && !id) return;
		var fake_id = $('.notes_list li.selected').attr('id').split('_')[1]
			, records = AutoSave.getRecords(ns);

		var data = {
			id:$('#id').val(),
			title:$('#title').val(),
			fake_id:fake_id,
			content:content
		}
		var existed = false;
		records.every(function(r,i){
			if(r.fake_id === fake_id){
				records[i] = data;
				AutoSave.updateRecords(ns,records);
				existed = true;
				return false;
			}
		});
		if(!existed) AutoSave.addRecord(ns,data);
	}
	
	$('#title').on('change',save_to_localstorage);
	$('#title').on('keyup',function(){
		$('.selected > span:first').html(this.value);
	});
	ckeditor.on('change',save_to_localstorage);

	function saveCurNote(){
		var title = $('#title').val(),content = $('#editor').val(), id = $('#id').val();
	}

	if($('.notes_list li').length > 0){
		$('#title').removeAttr('readonly');
		$('.notes_list li:first').trigger('click');
	}
});
