var Test = require('../models/test');
module.exports = new Controller({
	'list' : function(req,res){
		var test = new Test({
			id:3,
			note_id:5,
			title:'hehe',
			content:'<p>haha</p>'
		});
		var note = Test.$find(3, ['id','updated_at'] ,function(err,data){
			console.log(arguments);
		})
	}
});
