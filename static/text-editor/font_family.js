var fonts = [
	{name:'兰亭黑',family:'Lantinghei SC'},
	{name:'monaco',family:'monaco'},
	{name:'Arial',family:'arial'},
	{name:'黑体',family:'SimHei'}
];

var ul = $('#font_family').find('ul');
fonts.forEach(function(font){
	ul.append('<li style="font-family:'+font.family+'">'+font.name+'</li>');
});
$('#font_family').find('li').on('click',function(){
	document.getElementById('editor').contentWindow.setFontFamily(this.style.fontFamily);
});
