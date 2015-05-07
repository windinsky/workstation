windinsky.define('notes/list',['jquery','lib/clearHtmlTag','localstorage','ui/confirm'],function(require,exports,module){

	var $             = require('jquery');
	var Confirm       = require('ui/confirm');
	var clearHtmlTag  = require('lib/clearHtmlTag');

	var DEFAULT_TITLE = 'New note';
	var ns            = 'notes';

	function updateMemory(id,note){
		if(id instanceof Object){
			note = id;
			id   = note.id;
		}
		notes.every(function(n,i){
			if(n.id == id){
				notes.splice(i,1);
				notes.push(note);
				return false;
			}
			return true;
		});
	}

	function resetForm(note){
		$('#id').val(note.id);
		$('#title').val(note.title);
		ignore = true;
		ckeditor.setData(note.content);
	}
	
	// init AutoSave
	if(global.AutoSave){
		initAutoSave();
	}else{
		__localstorage_loaded.once('end',initAutoSave);
	}

	function initAutoSave(){
		// stop autosaved notes, preventing last page crashed unexpectly;
		AutoSave.stop(ns);

		// set config of notes
		AutoSave.updateCfg({ namespace:ns, url:'/notes/save' });

		AutoSave.EventEmitter.on('notes_save_ok',function(result){
			// reset local parameters after save.
			var note = result[0], response = result[1];
			var fake_id = note.fake_id,_note = $('#note_'+fake_id);

			if(!note.id){
				_note.attr('data-id',response.id);
				_note.hasClass('selected') && $('#id').val(response.id);
			}
			
			notes.every(function(n,i){
				if(n.id == note.id){
					notes[i].updated_at = response.data.updated_at;
					return false;
				}
				return true;
			});

		});
		
		var records = AutoSave.getRecords(ns);
		if(records.length){
			records.forEach(function(r){
				notes.forEach(function(n,i){
					if(n.id == r.id && new Date(n.updated_at) == new Date(r.updated_at)){
						updateMemory(r);
						if($('#id').val() == n.id){
							ckeditor.setData(r.content);
						}
					}
				});
			});
		}


		AutoSave.EventEmitter.on('notes_save_err',function(result){
			var record = result[0],err = result[1];
			if(err.error.code == windinsky.cfg.error_code.DATABASE.CONFLICT){
				// update conflict process
				// remove false data from localstorage. prevent saving again
				AutoSave.removeRecord(ns,function(data){
					return data.id == record.id;
				});
				// user can choose to save their version as a new one or discard all changes
				new Confirm(
					'Auto save failed, your note has been modified on other client,you can save your version as a new note or load the new version(you would lose all your changes)',
					{
						yesBtn: 'save mine as a new one',
						noBtn: 'load latest version',
						callback: {
							yes: function(){
								// save a new notes
								$.ajax({
									data:{
										title:record.title,
										content:record.content
									},
									url:'/notes/save',
									type:'post',
									success: function(){
										// reload page
										location.href = location.href;
									},
									error: function(e){
										alert('save error' + e);
									}
								});
							},
							no: function(){
								// set local variables back to database version
								var latest_record = err.error.latest_record;
								if($('#id').val() == record.id){
									resetForm(latest_record);
								}
								updateMemory(latest_record);
								$('#note_'+record.fake_id).find('span:first').html(clearHtmlTag.process(latest_record.title));
							}
						}
					}
				);
			}
		});
		// start autosave
		AutoSave.start(ns);
	}

	// click on the menu
	$('.notes_list').delegate('li','click',function(e){
		
		ignore = true;

		$('#title').removeAttr('readonly');

		var self    = $(this),
			id      = self.attr('data-id'),
			fake_id = self.attr('id').split('_')[1],
			note    = notes.filter(function(n){ return n.id == id || n.fake_id == fake_id; })[0];

		$('.notes_list li').removeClass('selected');
		self.addClass('selected');

		ckeditor.setReadOnly(false);

		resetForm(note);

	}).delegate('span.trash','click',function(e){
		// remove a note
		var p       = $(this).parent(),
			id      = p.attr('data-id'), 
			fake_id = p.attr('id').split('_')[1];

		if(!id) return removeNote();

		$.ajax({
			url      : '/notes/delete',
			type     : 'delete',
			data     : { id:id },
			dataType : 'json',
			success  : function(data){

				removeNote();
				data.success && AutoSave.removeRecord(ns , function(note){
					return note.id == id;
				});

			}
		});

		function removeNote(){
			p.remove();
			notes.every(function(n,i){
				if(n.id == id || n.fake_id == fake_id){
					notes.splice(i,1);
					return false;
				} 
				return true;
			});
		}
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

		if(ignore) return ignore = !ignore;
	
		var note,id = $('#id').val();
		notes.forEach(function(n,i){

			if(id == n.id){

				note = notes[i] = {
					updated_at : notes[i].updated_at,
					fake_id    : $('.notes_list li.selected').attr('id').split('_')[1],
					content    : ckeditor.getData(),
					title      : $('#title').val(),
					id         : id
				};

				return false;

			}
			return true;
		});

		if((!note.title || note.title == DEFAULT_TITLE) && !note.content) return;

		if(note.id){
			note.updated_at = notes.filter(function(n){
				return n.id == id;
			})[0].updated_at;
		}

		updateMemory(note);


		var records = AutoSave.getRecords(ns);

		var existed = false;

		records.every(function(r,i){
			if(r.fake_id === note.fake_id){
				records[i] = note;
				AutoSave.updateRecords(ns,records);
				existed = true;
				return false;
			}
			return true;
		});
		if(!existed) AutoSave.addRecord(ns,note);
	}


	if($('.notes_list li').length > 0){
		$('#title').removeAttr('readonly');
		$('.notes_list li:first').trigger('click');
	}

	$('#title').on('keyup',function(){
		save_to_localstorage();
		$('.selected > span:first').html(clearHtmlTag.process(this.value));
	});

	ckeditor.on('change',save_to_localstorage);
});
