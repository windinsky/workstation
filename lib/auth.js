var Session = require('../models/session');
var EventEmitter = require('events').EventEmitter;
var User = require('../models/user');

module.exports = function(req,res){
	var self = this, e = new EventEmitter();
	var token = req.cookie[SESSION_NAME];

	if(!token) {
        switch( req.wants() ){
            case 'json' : 
                res.json({ failed : 1 , msg : '没登录' });
                break;
            case 'html' :
                res.redirect('/session/new?callback='+encodeURIComponent(req.url));
                break;
            default:
                break;
                
        }
		return false;
	};

	query = Session.$find({token: token},'user_id',{
		$with:'user'
	});

	query.once('end',function(info){

		if(info.length && info[0].user){

			self.user = new User(info[0].user);

		}else{

            switch( req.wants() ){

                case 'json' : 
                    res.json({ failed : 1 , msg : '没登录' });
                    break;
                case 'html' :
                    res.redirect('/session/new?callback='+encodeURIComponent(req.url));
                    break;
                default:
                    break;
                    
            }
			return false;
		}
		e.emit('end');
	});

	query.once('error', function(err){
		e.emit('end');
	});
	return e;
}
