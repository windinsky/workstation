function Editor(container,editor_root_path){
	this.toolbars = [];
	this.modules = [];
	this.editorWin = null;
	this.init(container,editor_root_path);
}
Editor.prototype.init = function(container,editor_root_path){
	var c = $(container);
	var fragment = $(
		'<div><div class="w-editor-toolbar"></div>'+
		'<div class="editor_con">'+
			'<iframe src="'+editor_root_path+'editor.html?13" frameborder="0" class="w-editor-frame"></iframe>'+
		'</div></div>'
	);
	c.append(fragment);
	this.toolbar = c.find('.w-editor-toolbar');
	this.editorWin = c.find('iframe')[0].contentWindow;

};

Editor.prototype.sendCommand = function(command){
	return this.editorWin.fireCommand.apply(this, arguments);
};

Editor.prototype.use = function(module){
	if(typeof module === 'string'){
		module = new BuildInModules[module];
	}
	if(!module) return ;

	this.applyModule(module);
};

Editor.prototype.applyModule = function(module){
	this.modules.push(module);
	this.toolbar.append(module.template);
	this.bindNewEvents(module.events);
};

Editor.prototype.bindNewEvents = function(events){
	var self = this;
	var DEFAULT_EVENTS = ['focus','click','blur','mouseover','mousedown','mouseup','mouseout','mouseenter','mouseleave','keydown','keyup','change','submit','mousemove','keypress'];
	events.forEach(function(e){
		if(DEFAULT_EVENTS.indexOf(e.event_name) != -1){
			e.element.on(e.event_name,function(ev){
				if(e.command){
					self.sendCommand(e.command,e.params && e.params.call(ev.target));
				}
			})
		}else{
			$(document).on(e.event_name,function(params){
				var result;
				if(e.command){
					result = self.sendCommand(e.command);
				}
				if(e.callback){
					e.callback.apply(null,result);
				}
			})
		}
	})
}
