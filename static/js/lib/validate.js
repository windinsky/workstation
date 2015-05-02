/*
	validate module
	Example:
		HTML CODE:
		<form>
			<input type="text" name="account" data-rule="account" data-min="6" data-reg="^[\w]+$" data-max="24"/>
			<input type="password" name="password" data-rule="password" data-min="6" data-max="36"/>
		</form>
*/

windinsky.define('lib/validate',['jquery','ui/tipsy'],function(require,exports,module){
	var $ = require('jquery'),
	//build-in function to display & hide messages
	tipsyError = function(input,error){
		input.attr('title',error).tipsy({
			trigger:'manual',
			gravity:input.data('tipsy-gravity') || 's',
			fade: Number(input.data('tipsy-fade')) && true
		}).tipsy('show');
		if(!input.data('not-fade')){
			setTimeout(function(){
				input.tipsy('hide');
			},3000);
		}
	},
	tipsyCorrect = function(input){
		input.tipsy('hide');
	};
	// common unit validate function
	var cb = function(opt,e){
		/* 
		 * mapping all validate rules to functions and variables
		*/
		var self = $(this),
		//default message display method is tooltip, you can set up your 
		//own method to overwrite it
			showErrorFunc 	= opt.error || tipsyError,
			showSuccessFunc = opt.success || tipsyCorrect,

			// those rules bellow can be described with element's data attributes
			reg 			= opt.reg || self.attr('data-reg'),
			max 			= opt.max || Number(self.attr('data-max')),
			min 			= opt.max || Number(self.attr('data-min')),
			required		= opt.required || self.attr('data-required'),
            sameas          = $(self.attr('data-same-as')) || $(opt.sameas),
            
			// ajax validate callback, as it usually have logic, so you must set 
			// it up with 'config' method
			ajax = opt.ajax,
			ajaxSuccess = (opt.ajax && opt.ajax.success) || EMPTY_FUNC,  // executed only if ajax successed, if valid, return true, otherwise return false.
			ajaxError = (opt.ajax && opt.ajax.error) || EMPTY_FUNC,  // executed only if ajax failed 

			// executed after ajax request responesed, no matter success or not, 
			// if result suggest the value is valid, return true,otherwise return false
			ajaxCb = (opt.ajax && opt.ajax.cb) || EMPTY_FUNC,

			// method to format ajax data
			// such as <input type="text" name="account" value="peter"/>, 
			// default data will be { "account":"peter" }
			ajaxData = function(val){
				var key = self.attr('name');
                var obj = {};
                obj[key] = val;
                if(ajax && ajax.data){
                    for(i in ajax.data){
                        obj[i] = ajax.data[i];
                    }
                }
				return obj; 
			},
			
			// error message wording, you can put those in element's data 
			// attributes
			maxError		= self.attr('data-max-error') || opt.maxError || 'max length error',
			minError		= self.attr('data-min-error') || opt.minError || 'min length error',
			regError		= self.attr('data-reg-error') || opt.regError || 'format error',
			requireError	= self.attr('data-empty-error') || opt.requireError || 'this information is required',
            sameAsError     = self.attr('data-same-as-error') || opt.sameAsError || 'this information must be same as the other on',

			val 			= $.trim(self.val()),
			_e				= showErrorFunc,

			form = self[0].form ? $(self[0].form) : null,
			// most validation is bind with forms, if user click submit button, 
			// then after every ajax validation the form should check if all
			// form elements has been validated
			checkForm = form ? function(){
				var form = $(self[0].form);

				// if the form has been set as validation-needed and has triggered 'submit' event,
				// everytime a ajax validation completed we should check if the form is safe 
				// to be submited
				if(form.attr('data-validate-registered') && form.attr('data-submit')){
					form.trigger('check_validate');
				}
			} : EMPTY_FUNC,
			// stop the form to wait more ajax validation
			stopForm = form ? function(){
				var form = $(self[0].form);
				if(form.length && form.attr('data-validate-registered') && form.attr('data-submit')){
					form.trigger('error');
				}
			} : EMPTY_FUNC,
            msg = '';
		// required check
		if (required && !val) {
            msg = requireError;
		};
		// max length check
		if (max && val.length > max) {
            msg = maxError;
		};
		// min length check
		if (min && val.length < min) {
            msg = minError;
			return _e(self,minError);
		};
		// format check
		if (reg && !val.match(reg)) {
            msg = regError;
		};
        // input twice confirm check
        if(sameas.length && sameas.val() != val){
            msg = sameAsError;
        }
        if(msg){
            form && form.trigger('error');
            return _e(self,msg);
        }
		// ajax check
		if (ajax) {
			$.ajax({
				url : ajax.url,
				data : ajaxData(val),
				dataType : ajax.dataType || 'json',
				type : ajax.method || 'get',
				success : function(data){
					ajaxSuccess(data) ? checkForm() : stopForm();
				},
				error : function(){
					ajaxError();
					stopForm();
				}, 
				complete : function(data){
					ajaxCb(data) ? checkForm() : stopForm();
				}
			});
		}else{
			this.attr('data-valid','1');
			checkForm();
		}
	};
	module.exports = {
		// set up config for each and every element need to be validated
		config: function(options){
			for (var i = 0; i < options.length; i++) {
				var opt = options[i],
				input = $(opt.input),
				trigger = opt.trigger,
				_cb = cb.bind(input,opt);

				// you can bind the validate func to any events you want, such as:
				//
				// windinsky.define('/example/test',['jquery','lib/validate'],function(require){
				//	 var $ = require('jquery'), V = require('lib/validate');
				//	 V.config([
				//		 {input:$('#account'),trigger:[
				//			 {ele:$('#button'),event:'click'}
				//		 ]}
				//	 ]);
				// });
				//
				// then when you click the element whose id equals 'account', the validate will start
				$(trigger).each(function(index, item){
					item.ele.on(item.event,_cb);
				});
				
				if(!opt.ignoreChange){
					input.on("change",_cb);
				}

				input.on('validate',_cb).attr('data-validate','1');
			};
		},
		validate: function(form,onSuccess){
			form = $(form).attr('data-validate-registered','1');
			form.on('check_validate',function(){
				var self = $(this);

				if (self.attr('data-submit') !== '1') return;
				// if all input has been validated, submit
				// NOTE: if your form is never intend to be submited, you can always bind 
				// another function to the submit event and return false to prevent it 
				if (self.find(['data-valid','0']).length === 0) {
					self.trigger('submit',{validated:true});
                    self.removeAttr('data-submit');
				};
			});
			form.on('error',function(){
				$(this).removeAttr('data-submit');
			});
			form.on('submit',function(e,data){
				if (data && data.validated) return true;

				var self = $(this);
				// prevent multiple submit
				if(self.attr('data-submit') == '1') return ;
				// set as ready to submit
				self.attr('data-submit',"1")
					// set all inputs as invalid
					.find('[data-validate=1]').attr('data-valid','0')
					.trigger('validate');

				return false;
			});
		}
	}
});
