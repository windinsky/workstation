var Test = require('../models/test');
module.exports = new Controller({
	'list' : function(req,res){
		var test = new Test({
			id:2,
			title:'hehe2',
			content:'<p>haha</p>'
		});
		Test.$delete({__:'id>0'},function(){
			console.log(arguments);
		})
	}
});
