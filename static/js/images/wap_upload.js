windinsky.define('images/wap_upload',['jquery'],function(require,exports,module){
	var $ = require('zepto');
	var cb = function(){};
    var loading = null;
	exports.setup_upload = function( ele , callback ){
        if( !loading ){
            $(document.body).append('<div id="upload_img_loading" style="width:2rem;height:2rem;background:rgba(0,0,0,.8);display:none;border-radius:.08rem;position:absolute;left:50%;margin-left:-1rem;top:2rem;">'+
                '<svg width="100%" height="100%">'+
                    '<path stroke="white" stroke-width="2" fill="none"/>'+
                    '<text x="50%" y="50%" text-anchor="middle" style="font-size:12px;fill:white;">UPLOADING</text>'
                +'</svg>'
            +'</div>');
            loading = $('#upload_img_loading');
        }
        $(ele).each( function(){
            var btn = $('<div style="position:absolute;z-index:100;overflow:hidden;opacity:0"><input style="font-size:10000px" type="file"/></div>')
                , self = $(this)
            btn.css({
                width: self.width() + 'px'
                , height: self.height() + 'px'
                , top: '0'
                , left: '0'
            });
            self.css('position','relative').append(btn);
            var upload_file = function( event ){
                var self = this;
                var files = event.target.files, c = files.length;
                if(c > 10){
                    return alert('you can only upload 10 photos once');
                }
                $('#file').unbind('change');
                //var progress = $('#progress').show().find('tbody').empty();
                //$('#masker').show()
                //function progressing(e){
                //	if(e.lengthComputable){
                //		var max = e.total;
                //		var current = e.loaded;

                //		var Percentage = (current * 100)/max;
                //		$(this).width(Percentage+'%');
                //	}  
                //}
                $.each(files, function(key,value){

                    var data = new FormData();
                    data.append('upload',value);
                    function progressing(e){
                        console.log(e);
                        if(e.lengthComputable){
                            var max = e.total;
                            var current = e.loaded;

                            var Percentage = current/max;
                            var w = loading.width();
                            var angle = Percentage*2*Math.PI;
                            var r = w/3;
                            loading.find('path')
                                   .attr('d' , [ 'M' 
                                                 , w/2 
                                                 , w/6
                                                 , 'A' 
                                                 , w/3 
                                                 , w/3 
                                                 , 0 
                                                 , angle > Math.PI ? 1 : 0 
                                                 , 1 
                                                 , r*Math.sin( Math.PI - angle ) + w/2 
                                                 , r*Math.cos( Math.PI - angle ) + w/2 
                                               ].join(' ') );
                        }  
                    }
                    loading.show();
                    $.ajax({
                        url:'/image/upload',
                        data:data,
                        type:'POST',
                        dataType:'json',
                        processData: false,
                        contentType: false,
                        //xhr: function() {
                        //	var myXhr = $.ajaxSettings.xhr();
                        //	if(myXhr.upload){
                        //		myXhr.upload.addEventListener('progress',progressing.bind(bar), false);
                        //	}
                        //	return myXhr;
                        //},
                        success: function( data ){
                            if( !data.failed ) return cb.call( self , data );

                            else alert( data.msg );
                        }
                        , xhr: function() {
                            var myXhr = $.ajaxSettings.xhr();
                            if( myXhr.upload ){
                                myXhr.upload.addEventListener('progress' , progressing.bind(loading) , false);
                            }
                            return myXhr;
                        }
                        , complete: function(data){
                            c--;
                            if(!c) {
                                $('#file').val('');
                                $('#file').bind('change',upload_file);
                            }
                            loading.hide();
                        }
                    });
                });
            }

            btn.find('input').change(upload_file.bind(self));
            cb = callback;
        
        });
	};

});
