-function(){
	var color_template = colorTemplate();
	var font_family_template = fontFamilyTemplate();
	var font_size_template = fontSizeTemplate();
	var FUNCS = {
		'color': {
			template: color_template,
			events: [{
				event_name: 'selectEnd',
				command: 'getSelectionTextColor',
				callback: function(selection,color){
					var li = FUNCS.color.template.find('li').removeClass('focus');
					if(color !== '_mixed'){
						li.filter('[data-color="'+color+'"]').addClass('focus');
					}
				}
			},{
				event_name: 'click',
				element: color_template,
				command: 'setTextColor',
				params: function(){
					return this.style.backgroundColor;
				}
			}]
		},
		'fontFamily': {
			template: font_family_template,
			events: [{
				event_name: 'selectEnd',
				command: 'getSelectionTextFontFamily',
				callback: function(selection,fontFamily){
					var span = FUNCS.fontFamily.template.find('span').removeClass('focus');
					if(fontFamily !== '_mixed'){
						span.filter('[data-family="'+fontFamily+'"]').addClass('focus');
					}
				}
			},{
				event_name:'click',
				element: font_family_template,
				command: 'setTextFontFamily',
				params: function(){
					return this.style.fontFamily;
				}
			}]
		},
		'fontSize': {
			template: font_size_template,
			events: [{
				event_name: 'selectEnd',
				command: 'getSelectionTextFontSize',
				callback: function(selection,fontSize){
					var input = FUNCS.fontSize.template.find('input').val('');
					if(fontSize !== '_mixed'){
						input.val(fontSize);
					}
				}
			},{
				event_name:'change',
				element: font_size_template,
				command: 'setTextFontSize',
				params: function(){
					return this.value;
				}
			}]
		}
	}
	if(!window.BuildInModules){
		BuildInModules = {};
	}
	function Text(functions){
		this.template = $('<div class="module_text"></div>');
		this.events = [];
		if(!functions){
			functions = ['color','fontFamily','fontSize'];
		}
		if(functions.constructor !== Array){
			functions = [functions];
		}
		this.applyFunctions(functions);
	};
	Text.prototype.applyFunctions = function(funcs){
		var self = this;
		funcs.forEach(function(func){
			self.applyFunc(FUNCS[func]);
		});
	};
	Text.prototype.applyFunc = function(func){
		this.template.append(func.template);
		this.events = this.events.concat(func.events);
	};
	BuildInModules['text'] = Text;

	function colorTemplate(){
		var colors = ["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgreen","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","green","greenyellow","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgreen","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","rebeccapurple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"];
		var div = $('<div class="text-color"><ul></ul></div>');
		var ul = div.find('ul');
		colors.forEach(function(color){
			ul.append('<li style="background:'+color+'"></li>');
		});
		return div;
	}
	function fontFamilyTemplate(){
		var fonts = [
			{name:'兰亭黑',family:'Lantinghei SC'},
			{name:'monaco',family:'monaco'},
			{name:'Arial',family:'arial'},
			{name:'黑体',family:'SimHei'}
		];

		var div = $('<div class="text-font-family"><ul></ul></div>');
		var ul = div.find('ul');
		fonts.forEach(function(font){
			ul.append('<li style="font-family:'+font.family+'">'+font.name+'</li>');
		});
		return div;
	}
	function fontSizeTemplate(){
		return $('<div class="text-font-size"><label>字号:</label><input id="editor_font_size"/></div>');
	}
}();
