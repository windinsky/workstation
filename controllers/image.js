var auth   = require( '../lib/auth' );
var mkdirp = require( 'mkdirp' );
var path   = require( 'path' );
var url    = require( 'url' );
var fs     = require( 'fs' );
var gm     = require( 'gm' );
var md5    = require( '../lib/md5' );
var Image  = require( '../models/image' );

const UPLOAD_IMAGE_PATH  = '/home/windinsky/windinsky/static/upload';
const PRIVATE_IMAGE_PATH = '/home/windinsky/windinsky/private/';
const STATIC_URL         = 'http://static.windinsky.com/upload/';
const PRIVATE_URL        = 'http://www.windinsky.com/images/get';
const GET_COLUMNS        = [ 'id' , 'width' , 'height' , 'src' , 'path' , 'user_id' , 'parent_id' , 'created_at' , 'md5' ];
const SAVE_COLUMNS       = [ 'width' , 'height' , 'src' , 'path' , 'user_id' , 'parent_id' , 'created_at' , 'md5' ];

module.exports = new Controller( {
	'index' : function( req , res ){
		return res.render( 'images/upload.html' , {
			__css : [ 'images/upload' ] 
		});
	},
	'upload' : function(req,res){
		
		var _path      = req.files.upload.path
			, name     = req.files.upload.name
			, func_num = req.__get.CKEditorFuncNum
			, data     = fs.readFileSync( _path )
			, _md5     = md5( data )
			, self     = this;

		// check if image already exists
		Image.find( { md5 : _md5 , user_id : self.user.id } , GET_COLUMNS , function( err , result ){

			if(err) return failed(err);

			if(result.length) {
				return success( result[0] );
			}else{
				save_image();
			}

		});

		// generate src based on private or not
		function _src( file_name ){
			return req.fields.is_private ? ( PRIVATE_URL + '?src='+ encodeURIComponent( file_name ) ) : ( STATIC_URL + self.user.id + '/' + file_name );
		}

		function save_image(){

			var ext = path.extname( name ).toLowerCase();
			// check file type
			if( ['.git','.png','.jpeg','.jpg'].indexOf( ext ) === -1 ) return failed( 'only gif|png|jpeg|jpg is allowed.' );
			
			// different sizes thumb that will be created
			var thumb_sizes    = ['180x150',{height:180}]
				// user image folder
				, folder       = path.resolve( req.fields.is_private ? PRIVATE_IMAGE_PATH : UPLOAD_IMAGE_PATH , self.user.id.toString())
				// generate a random name for the image
				, file_name    = ( parseInt( Math.random()*10e8 )+new Date().getTime() ).toString()
				// image full path
				, file_path    = path.resolve( folder , file_name+ext )
				// thumbs folder dirname
				, thumb_folder = path.resolve( folder , file_name + '_thumbs' )
				// image src
				, src          = _src( file_name+ext );

			var temp = gm( _path );

			temp.size( { bufferStream : true } , function( err , size ){

				var image = new Image( {
					src        : src,
					path       : file_path,
					width      : size.width,
					height     : size.height,
					md5        : _md5,
					user_id    : self.user.id,
					parent_id  : 0,
					created_at : new Date()
				});

				image.$save( SAVE_COLUMNS , { return_columns : GET_COLUMNS } ,function( err , img ){

					if( err ) return failed( err );

					img = img[0];
					delete img.path;
					img.thumbs = [];
					// create folder if not exist
					mkdirp( folder , function(){
						
						fs.writeFileSync( file_path , data );
						// total thumbs count
						var c = thumb_sizes.length;
						
						// make thumb dir
						mkdirp( thumb_folder , function(){
							
							// generate thumbs file and save to database
							thumb_sizes.forEach( function( s ){
								var w = '', h = '';
								
								switch( typeof s ){
									case 'string':
										w = parseInt( s.split( 'x' )[0] );
										h = parseInt( s.split( 'x' )[1] );
										break;
									case 'object':
										w = parseInt( s.width );
										h = parseInt( s.height );
										break;
								}

								thumb_name = [ w ? ( 'w' + w ) : '' , h ? ( 'h' + h ) : '' ].join( '' );
								thumb_path = path.resolve( thumb_folder , thumb_name + ext );

								// calculate size
								if( !w ) w = parseInt( h/size.height*size.width );
								if( !h ) h = parseInt( w/size.width*size.height );

								temp.resize( w , h , '!' );

								temp.write( thumb_path, function( thumb_path , thumb_name , w , h , err ){
									if( err ) throw err;
									var image = new Image( {
										src        : _src( thumb_name ),
										width      : w,
										height     : h,
										path       : thumb_path,
										md5        : md5( fs.readFileSync( thumb_path ) ),
										created_at : new Date(),
										user_id    : self.user.id,
										parent_id  : img.id
									});
									image.$save( SAVE_COLUMNS , function( err , thumb ){
										if( err ) return failed( err );

										thumb = thumb[0];
										delete thumb.path;
										img.thumbs.push( thumb );

										if( !--c ){
											fs.unlinkSync( _path );
											success( img );
										}
									});
								}.bind( temp , thumb_path , file_name + '_thumbs/' + thumb_name + ext , w , h ));

							});
						});
					});
				});
			});
		}

		function success(data){
			switch(req.wants()){
				case 'json':
					return res.json(data);
				case 'html':
					return res.end('<script type="text/javascript">window.parent.CKEDITOR.tools.callFunction('+func_num+',"'+data.src+'", "");</script>');
			}
		}

		function failed(err){
			switch(req.wants()){
				case 'json':
					return res.json({success:0,error:err});
				case 'html':
					return res.end('<script>throw '+json.stringify(err)+'</script>');
			}
		}
	},
},{
	'upload':[auth]
});
