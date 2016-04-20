var auth = require('../lib/auth');
var Note = require('../models/note');
var Helper = require('../helper');

module.exports = new Controller({
    // actions
	'index' : function( req , res ){

        
        var interfaces = {
            'note' : 'windinsky::/notes/delete'
        }

        this.send( interfaces , function( err , data ){
            if( ! err ) return res.json( data.note );
            else return res.json( err );
        });
	
	},
    'new' : function( req ,res ){

        // return this.ajax('windinsky::/meitu/index');
    
        res.render( 'meitu/new.html' , {
            __css: ['meitu/new']
        });

    },
    'show' : function( req , res ){
        res.render( 'meitu/show.html' , {
            __css: ['meitu/show'],
            data : {
                user: {
                    avatar : 'http://up.qqjia.com/z/14/tu17250_8.jpg'
                    , nick_name : '樱桃小丸子'
                }
                , sdks:[
                    {
                        pic:'http://up.qqjia.com/z/18/tu20455_7.jpg'
                        , name: '北京水光针嫩肤'
                        , description : '韩国水光设备，立享2.3折让美肌深层补水'
                        , doctor : '周医生'
                        , hospital : '北医三院'
                        , price : 3000
                        , ori_price : 3999
                        , sale : 137
                    }
                    , {
                        pic:'http://up.qqjia.com/z/18/tu20455_7.jpg'
                        , name: '北京水光针嫩肤'
                        , description : '韩国水光设备，立享2.3折让美肌深层补水'
                        , doctor : '周医生'
                        , hospital : '北医三院'
                        , price : 3000
                        , ori_price : 3999
                        , sale : 137
                    }
                ]
                , comment : '整理一个svg绘制环形进度条的demo，需要的同学拿去用即可定义svg绘图'
                , before : 'http://chongqing.sinaimg.cn/2013/0117/U7780P1197DT20130117151119.jpg'
                , after : 'http://www.86kx.com/uploads/allimg/140414/2292_140414174143_2.jpg'
                , rates : '3,4,4'
            }
        });
    },
    'list' : function( req , res ){
        res.render( 'meitu/list.html' , {
            __css : ['meitu/list']
            , data : {
                "user": {
                    "avatar": "http://up.qqjia.com/z/14/tu17250_8.jpg",
                    "nick_name": "樱桃小丸子"
                },
                "caselist": [
                    {
                        "case_id": 1,
                        "comment": "整理一个svg绘制环形进度条的demo，需要的同学拿去用即可定义svg绘图",
                        "pic_before": [
                            "http://chongqing.sinaimg.cn/2013/0117/U7780P1197DT20130117151119.jpg"
                        ],
                        "pic_after": [
                            "http://www.86kx.com/uploads/allimg/140414/2292_140414174143_2.jpg"
                        ],
                        "share_info": "分享好友给100元",
                        "share_num": 10,
                        "cart_num": 10,
                        "scores": 1000
                    },
                    {
                        "case_id": 2,
                        "comment": "整理一个svg绘制环形进度条的demo，需要的同学拿去用即可定义svg绘图",
                        "pic_before": [
                            "http://chongqing.sinaimg.cn/2013/0117/U7780P1197DT20130117151119.jpg"
                        ],
                        "pic_after": [
                            "http://www.86kx.com/uploads/allimg/140414/2292_140414174143_2.jpg"
                        ],
                        "share_info": "分享好友给100元",
                        "share_num": 1,
                        "cart_num": 1,
                        "scores": 100
                    }
                ],
                "orderlist": [
                    {
                        "order_id": 116,
                        "order_status": 1,
                        "pic": "http://up.qqjia.com/z/18/tu20455_7.jpg",
                        "name": "北京测试勿下单测试不退款",
                        "description": "双眼深邃性感，名医主刀，细致雕琢 细心呵护 自然靓丽",
                        "doctor": "隋立强",
                        "hospital": "北医三院",
                        "price": 1000,
                        "buy_num": 2,
                        "total_price": 2000,
                        "share_info": "分享好友给100元",
                        "makecase_button_title": "制作案例"
                    }
                ]
            }
        });
    }
},{
// filters
},{
// methods restrict
	'list':['get'],
	'save':['post'],
	'delete':['delete']
});
