var Helper = require('../helper');

module.exports = {
	users: [
		{
			name      : 'id',
			validates : {
				type     : 'number',
				readonly : true
			}
		},
		{
			name      : 'account',
			validates : {
				type     : 'string',
				not_null  : true
			}
		},
		{
			name      : 'password',
			validates : {
				type      : 'string',
				not_null  : true
			},
			filters   : {
				before_save: Helper.hash_password
			}
		},
		{
			name      : 'created_at',
			validates : {
				type     : 'date',
				not_null : true
			}
		},
		{
			name      : 'updated_at',
			validates : {
				type     : 'date',
				not_null : true
			}
		}
	],
	sessions: [
		{
			name      : 'id',
			validates : {
				type     : 'number',
				readonly : true
			}
		},
		{
			name      : 'user_id',
			validates : {
				type     : 'number',
				not_null  : true
			}
		},
		{
			name      : 'token',
			validates : {
				type      : 'string',
				not_null  : true
			},
			filters   : {
				before_save: Helper.generate_session_token
			}
		},
		{
			name      : 'created_at',
			validates : {
				type     : 'date',
				not_null : true
			}
		},
		{
			name      : 'updated_at',
			validates : {
				type     : 'date',
				not_null : true
			}
		}
	],
	notes: [
		{
			name      : 'id',
			validates : {
				type     : 'number',
				readonly : true
			}
		},
		{
			name      : 'user_id',
			validates : {
				type     : 'number',
			}
		},
		{
			name      : 'title',
			validates : {
				type      : 'string',
				not_null  : true,
				maxLength : 255
			},
			filters   : {
				before_save: function(val){
					return val.replace(/\</g,'&lt;');
				}
			}
		},
		{
			name      : 'content',
			validates : {
				type     : 'string',
				not_null : true
			},
			filters   : {
				before_save: function(val){
					return Helper.xss(val);
				}
			}
		},
		{
			name      : 'created_at',
			validates : {
				type     : 'date',
				not_null : true
			}
		},
		{
			name      : 'updated_at',
			validates : {
				type     : 'date',
				not_null : true
			}
		}
	],
	articles: [
		{
			name      : 'id',
			validates : {
				type     : 'number',
				readonly : true
			}
		},
		{
			name      : 'user_id',
			validates : {
				type     : 'number',
				not_null : true
			}
		},
		{
			name      : 'title',
			validates : {
				type      : 'string',
				not_null  : true,
				maxLength : 255
			}
		},
		{
			name      : 'content',
			validates : {
				type     : 'string',
				not_null : true
			}
		},
		{
			name      : 'created_at',
			validates : {
				type     : 'date',
				not_null : true
			}
		},
		{
			name      : 'updated_at',
			validates : {
				type     : 'date',
				not_null : true
			}
		}
	],
	tags: [
		{
			name      : 'id',
			validates : {
				type     : 'number',
				readonly : true
			}
		},
		{
			name      : 'type',
			validates : {
				type      : 'string',
				not_null  : true
			}
		},
		{
			name      : 'name',
			validates : {
				type     : 'string',
				not_null : true
			}
		},
		{
			name      : 'user_id',
			validates : {
				type     : 'number',
				not_null : true
			}
		},
		{
			name      : 'created_at',
			validates : {
				type     : 'date',
				not_null : true
			}
		},
		{
			name      : 'updated_at',
			validates : {
				type     : 'date',
				not_null : true
			}
		}
	],
	tag_resources: [
		{
			name      : 'id',
			validates : {
				type     : 'number',
				readonly : true
			}
		},
		{
			name      : 'tag_id',
			validates : {
				type     : 'number',
				not_null : true
			}
		},
		{
			name      : 'type',
			validates : {
				type     : 'string',
				not_null : true
			}
		},
		{
			name      : 'resource_id',
			validates : {
				type     : 'number',
				not_null : true
			}
		},
		{
			name      : 'created_at',
			validates : {
				type     : 'date'
			}
		},
	],
	images: [
		{
			name      : 'id',
			validates : {
				type     : 'number',
				readonly : true
			}
		},
		{
			name      : 'user_id',
			validates : {
				type     : 'number',
				not_null : true
			}
		},
		{
			name      : 'parent_id',
			validates : {
				type     : 'number'
			}
		},
		{
			name      : 'width',
			validates : {
				type     : 'number'
			}
		},
		{
			name      : 'height',
			validates : {
				type     : 'number'
			}
		},
		{
			name      : 'src',
			validates : {
				type     : 'string',
				not_null : true
			}
		},
		{
			name      : 'path',
			validates : {
				type     : 'string',
				not_null : true
			}
		},
		{
			name      : 'md5',
			validates : {
				type     : 'string',
				not_null : true
			}
		},
		{
			name      : 'created_at',
			validates : {
				type     : 'date'
			}
		},
		{
			name      : 'updated_at',
			validates : {
				type     : 'data'
			}
		}
	],
	'templates': [
		{
			name: 'id',
			validates:{
				type:'number'
			}
		},
		{
			name:'html',
			validates:{
				type:'string'
			}
		},
		{
			name: 'created_at',
			validates:{
				type:'date'
			}
		},
		{
			name:'updated_at',
			validates:{
				type:'date'
			}
		}
	]
}
