var gm     = require( 'gm' );
var auth   = require( '../lib/auth' );
var Image  = require( '../models/image' );
var path   = require( 'path' );
var Template   = require( '../models/template' );
const GET_COLUMNS        = [ 'id' , 'width' , 'height' , 'src' , 'path' , 'user_id' , 'parent_id' , 'created_at' , 'md5' ];
const UPLOAD_IMAGE_PATH  = '/home/windinsky/windinsky/static/upload';

module.exports = new Controller({
	'index' : function(req,res){
		var self = this;
		res.render('template/index.html', {
			__css: ['template/index']
		});
	},
	'view': function(req,res){
		var id = req.__get.id;
		Template.$find({id:id},['html'],function(err,data){
			res.end(data[0].html);
		})
	},
	'save': function(req,res){
		var cords = JSON.parse(req.__post.cords)
			, canvas_size = JSON.parse(req.__post.canvas_size)
			, image_id = req.__post.image_id
			, platform = req.__post.platform;
		Image.find( { id:image_id } , GET_COLUMNS , function( err , result ){
			var ext = path.extname(result[0].path).toLowerCase();
			var count = cords.length;
			var timestamp = new Date().getTime()
			cords.forEach(function(cord,i){
				gm(result[0].path).crop(cord.w,cord.h,cord.x,cord.y).quality(75).write(path.resolve(UPLOAD_IMAGE_PATH,'crop',image_id+'_'+timestamp+'_'+i+'.jpg'),function(err){
					if(err) console.log(err);
					count--;
					if(!count){
						var html = '<!doctype html><html><head><style>body{margin:0;padding:0;}div{position:absolute}</style>'+(platform == 'wap' ? '<meta name="viewport" content="width=device-width,     height=device-height, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">':'')+'</head><body><div style="position:relative;width:'+canvas_size.w+'px" class="main">';
						html += cords.map(function(cord,i){
							return '<div style="top:'+cord.y+'px;left:'+cord.x+'px;width:'+cord.w+'px;height:'+cord.h+'px;background-image:url(http://static.windinsky.com/upload/crop/'+image_id+'_'+timestamp+'_'+i+'.jpg);background-size:cover;"></div>'
						}).join('');
						html += '<script>var a = '+canvas_size.w+';console.log(a,document.documentElement.clientWidth);var scale_size = document.documentElement.clientWidth / a;var main = document.querySelector(\'.main\');main.setAttribute(\'style\', "-webkit-transform: scale("+ scale_size +");transform:scale("+ scale_size +");-webkit-transform-origin: center top;transform-origin: center top;")</script></div></body></html>';
						var template = new Template({html:html,created_at:new Date()})
						template.$save(['html','created_at'],{return_columns:['html','id']},function(err,data){
							res.end('http://www.windinsky.com/template/view?id='+data[0].id);
						});
					}
				})
			});
		});

	}
},{
	'save':[auth],
	'index':[auth]
});
