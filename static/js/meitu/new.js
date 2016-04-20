windinsky.define('meitu/new' , ['images/wap_upload','zepto'] , function( require ){
    var $ = require('zepto');
    $('.stars').on( 'touchstart' , function(){
        var self = $(this);
        self.parent().find('.stars').removeClass('active');
        while( self.hasClass('stars') ){
            self.addClass('active');
            self = self.prev();
        }
    });
    var upload = require('images/wap_upload');
    upload.setup_upload('.photo',function( data ){
        var w = data.width , h = data.height , _w = this.width() - 2 , _h = this.height() - 2 , p = 0;
        if( w/h > _w/_h ) {
            h = h*_w/w;
            w = _w;
            p = ( _h - h )/2;
            _w = _w - p*2;
        }else{
            w = w*_h/h;
            h = _h;
        }
        this.css({ padding : p + 'px 0' })
            .find('img,span').remove()
        this.append('<img style="width:'+w+'px;height:'+h+'px" src="'+data.src+'"/>');
    });
    $('[name="photo"]').change( function(){
        var before = $('#before');
        if($('#before_and_after')[0].checked){
            before.add(before.attr('target')).show();
        }else{
            before.add(before.attr('target')).hide();
        }
    });
    $('#submit').on('touchend' , function(){
        var data = {}
            , before = $('#before img').attr('src')
            , checked = $('#before_and_after')[0].checked
            , after = $('#after img').attr('src');

        if(checked && !before){
            return alert('请上传术前照片');
        }
        if( checked ) before = '';
        if(!after){
            return alert('请上传术后照片');
        }

        var rates = [];

        var rates = $('.rate').map( function(){
            return $(this).find('.stars.active').length;
        }).toArray().join(',');

        var comment = $('#comment').val();

        if(!comment) return alert('请填写评论');
        
        $.ajax({
            url : '/solution/create'
            , data : {
                before: before
                , after : after
                , rates : rates
                , comment : comment
            }
            , type : 'post'
            , success : function( data ){
                location.href = "/solution/list"
            }
        });

    });
});
