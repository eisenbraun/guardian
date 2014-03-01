/* Copyright (c) 2014 Michael Eisenbraun (http://jquery.michaeleisenbraun.com)
 * Licensed under the MIT License.
 *
 * Version: 1.0.0
 *
 * Requires: jQuery 1.7.2+
 */
 
/**** 
TO DO LIST: 

Allow for callback function, when field is invalid.

***/ 
 
if(!window.console) { var console = { log: function() { } } };   

(function($) {
	$.fn.guardian = function(option) {
		return this.each(function() { 
			var $el = $(this); 
						
			var data = $el.data('guardian'); 
			
			if(!data) { 
				$el.data('guardian', (data = new Guardian(this, option))); 
			}
			
			return data;
		}).data('guardian');		
	}
	
	var Guardian = function(element, options) { 
		this.$el = $(element); 
		
		if(options) { $.extend( this, options ); }
		
		return this.init();
	}
	
	Guardian.prototype = { 
		$patterns:{ 
			alpha: /^[a-z_'&]+$/i, 
			alnum: /^[\w'&]+$/,
			number: /^(-?)((\d+)|(\d+).(\d*))$/,
			currency: /^(-)?(\$)?(\d+)+(,?\d{3})*(\.\d{2})?$/,
			zip: /(^\d{5,9}$)|(^\d{5}-\d{4}$)/,
			year: /(^(19|20)\d{2})$/,
			phone: /^\(?(\d{3})\)?[-. ]?(\d{3})[-. ]?(\d{4})$/,
			email: /^[\w&]([\w\-\.'&]*)@([\w\-\.]*)(\.[a-z]{2,6}(\.[a-z]{2}){0,2})$/i,
			url: /^(([http|https]+):)(\/{2})([0-9.\-A-Za-z]+)\.([0-9.\-A-Za-z]+)\.([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/, 
			date: /^(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December|(0?\d{1})|(10|11|12))(-|\s|\/|\.)(0?[1-9]|(1|2)[0-9]|3(0|1))(-|\s|\/|\.|,\s)(19|20)?\d\d$/i, 
		}, 
		$status: { 
			changed:false, 
			submitted:false
		}, 
		$inputs:null, 
		$groups:null,
		$textInputs:['text','password', 'currency'],
		$matchInputs:['match'],
		$hiddenInputs:['hidden', 'submit', 'button'],
		$phoneInputs:['tel', 'phone'],
		$numberInputs:['number', 'num'],
		$emailInputs:['email'],
		$fileInputs:['file'],
		$radioInputs:['radio'],
		$checkboxInputs:['checkbox'],
		$customInputs:null,
		init: function() {	
			var $this = this;  
			var form = this.$el; 
										
			/*** Creating objects ***/
			$this.$inputs = {}; 
			$this.$groups = {}; 
			$this.customInputs = []; 							
										
			/*** Retrieving Group information ***/ 
			var groups = $('*[data-group-name]', form);
			var groupsLength = groups.length;  
			
			for(var i = 0; i < groupsLength; i++) { 
				this.addGroup(groups.eq(i)); 
			}; 		

			//disabiling browsers validation
			form.attr('novalidate', 'novalidate');
			  						
			//validating inputs on change and blur
			form.on('blur', ':input', this, $this.onBlur); 
						
			//adding counter to inputs with a data-counter attribute 
			//requires a maxlength attribute
			var counters = $('[data-counter]', form); 
			
			counters.each(function() { 
				var el = $(this); 
				var name = el.attr('name');
				var id = form.attr('id'); 
				
				if(el.attr('maxlength')) { 
					var val = el.val(); 
					var limit = parseInt(el.attr('maxlength'), 10);
					var remaining = limit - val.length;
					var width = el.width(); 
					el.addClass('ui-counter');
					el.after('<div class="ui-counters" style="width:'+width+'px"><span id="counter-'+id+'-'+name+'">'+remaining+'</span> Characters left</div>'); 
				} else { 
					//no maxlength attribute was found, removing data-counter attribute
					el.removeAttr('data-counter'); 
				}
			}); 
			
			form.on('keyup', ':input[data-counter]', function() { 
				var el = $(this), 
				val = el.val(), 
				id = form.attr('id'), 
				name = el.attr('name'),
				limit = parseInt(el.attr('maxlength'), 10),
				remaining = limit - val.length;
				
				$('#counter-'+id+'-'+name).html(remaining);
				
			}); 
			
			/*** Binding Submit Event ***/
			form.on('submit', function(event) { 
				//event.preventDefault();
				var form = $(this); 	
				var $inputs = form.find(':input'); 
				var length = $inputs.length; 
				$this.$event = event; 
				
				//updating form status
				$this.$status.submitted = true; 
				
				//calling the before function
				if($this.before) { 
					$this.before(); 
				}
				  	
				if(!$this.validateAll()) { 
					//updating form status
					$this.$status.submitted = false;
					
					//calling on the form failing to validate 
					if($this.failure) { 
						$this.failure(); 
					}
					return false; 
				} else { 
					//invokes the success function instead of submitting the form. 
					if($this.success) { 
						return $this.success(); 
					} else { 
						return true;	
					}
					
				}
			});
			
			if($this.extend) { 
				$this.extend();
			}
		
			return $this;	
		},
		addGroup:function(el) { 
			var name = el.data('group-name'); 
			el.addClass('group');
			this.$groups[name] = {min: (el.data('group-min')) ? el.data('group-min'):0, max: (el.data('group-max')) ? el.data('group-max') : Infinity, count: 0, members: (el.data('group-members')) ? el.data('group-members').split(" ") : null}; 

			if(this.$groups[name].members) {
				var length = this.$groups[name].members.length; 
				for(var i = 0; i < length; i++) { 
					$('*[name="'+this.$groups[name].members[i]+'"]').attr('data-group', name); 
				}
			}
		}, 
		addInputTypes:function(obj) {
			var $this = this; 
			
			$.each(obj, function(index, value) {
				switch(index) {
					case 'text':
						$this.$textInputs.push(value);
						break;

					case 'match':
						$this.$matchInputs.push(value);
						break;

					case 'hidden':
						$this.$hiddenInputs.push(value);
						break;

					case 'phone':
						$this.$phoneInputs.push(value);
						break;

					case 'number':
						$this.$numberInputs.push(value);
						break;

					case 'email':
						$this.$emailInputs.push(value);
						break;

					case 'radio':
						$this.$radioInputs.push(value);
						break;

					case 'checkbox':
						$this.$checkboxInputs.push(value);
						break;

					case 'custom': 
						$this.$customInputs.push(value);
						break;
				}
			});
		},
		addPattern:function(obj) {
			if(obj) {$.extend( this.$patterns, obj );} 
		}, 
		createErrorMessage:function(el) { 
			var name = el.attr('name'),
			val = el.val(),
			form = this.$el.attr('id'),
			errorMessage = el.data('error-message'),
			emptyMessage = el.data('empty-message');   
				
			//error message is only created once
			//error message is only created if a error message is available 
			if(!$('#error-message-'+form+'-'+name).length) {
				if(errorMessage || emptyMessage) { 
					el.after('<span class="ui-error-message" id="error-message-'+form+'-'+name+'"></span>'); 
				}
			}

			if(!val.length && emptyMessage) {
				$('#error-message-'+form+'-'+name).html(emptyMessage);
			} else {
				$('#error-message-'+form+'-'+name).html(errorMessage);
			}
		},
		addCommas:function(num) {
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(num)) {
				num = num.replace(rgx, '$1' + ',' + '$2');
			}	
			return num; 
		},
		formatPhone:function(str) {
			return str.replace(this.$patterns['phone'], "($1) $2-$3");
		},
		formatCurrency:function(str) {
			var $this = this; 
			
			return str.replace($this.$patterns['currency'], function() {
				arguments[3] = (arguments[3].length > 3) ? $this.addCommas(arguments[3]) : arguments[3]; 
				var str = arguments[3];
				if(arguments[2]) { str = arguments[2]+arguments[3]; } else {str = '$'+arguments[3]; }
				if(arguments[1]) { str = arguments[1]+str; }
				if(arguments[4]) { str += arguments[4]; }
				if(arguments[5]) { str += arguments[5]; } else { str += '.00'; }
				
				return str;
			});
		},
 		getInvalid:function() {
			var invalid = []; 
			var length = this.$inputs.length; 
			
			for(el in this.$inputs) { 
				if(!this.$inputs[el]) {
					invalid.push(el);
				}
			}
			
			return invalid;
		},
		isIE:function() {
			if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){
				return true; 
			} 	
		},
		isFF3:function() { 
			if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
 				var ffversion=new Number(RegExp.$1) 
 				//checking for all FF below 4
 				if (ffversion<=4) {
 					return true;
 				}
			}
		},
		onBlur:function(event) { 
			var $this = event.data; 
			var el = $(this); 
			var name = el.attr('name');  
			var parent = el.parent(); 
			
			$this.$event = event;
			$this.validateElement(el);
						
			//if event "change", updateing form status
			if(event.type === 'change') {
				$this.$status.changed = true; 
			}
			
			//remove highlighting from input on blur
			parent.removeClass($this.highlight); 
		}, 
		onFocus:function(event) { 
			//placeholder function
		}, 
		validationHandler:function(el) { 
			var tag = el[0].tagName,
			type = el[0].type,
			name = el.attr('name'), 
			response = {parent:el.parent()},
			group_name = el.data('group'),
			group = this.$groups[group_name], 
			form = this.$el.attr('id'); 
			
			response.valid = this.$inputs[name];
			
			/* getting and setting group information */
			if(group) { 
				var members = group.members, 
				length = members.length;
				response.parent = $('#'+group_name);
				
				if(type === 'checkbox') { 
					if (el.is(':checked')) {
						group.count++;
					} else {
						if(this.$event.type !== 'submit') {
							if(group.count > 0) { 
								group.count--;
							}
						}
					}
					
					if(group.count < group.min || group.count > group.max) { 
						response.valid = false;
						this.$inputs[group_name] = false;
					} else {
						response.valid = true;
						this.$inputs[group_name] = true;
					}
					
				} else { 
					for(var i = 0; i < length; i++) { 
						if(!this.$inputs[members[i]]) { 
							response.valid = false; 
						}
					}	
				}
				
			}
			
			if($.inArray(type, this.$hiddenInputs) === -1) {
				if(response.valid) { 
					response.parent.addClass(this.valid).removeClass(this.invalid);
					$('#error-message-'+form+'-'+name).hide();
				} else { 
					response.parent.addClass(this.invalid).removeClass(this.valid);
					this.createErrorMessage(el);
					$('#error-message-'+form+'-'+name).fadeIn();
				}
			}
		},
		validateAll:function() { 
			var $this = this; 
			var $inputs = $this.$el.find(':input');
			$this.$event = {type:null};  
		
			$.each($this.$groups, function(key, group) {
				group.count = 0;
			});
				
			$.each($inputs, function() {
				$this.validateElement($(this));
			}); 
			
			if($this.getInvalid().length) { 
				return false; 
			} else { 
				return true; 
			} 				
		},
		validateCustom:function(el) {
			console.log(el);
		}, 
		validateHidden:function(el) {
			var name = el.attr('name');
			val = el.val();
			this.$inputs[name] = true;
			return this.$inputs[name];
		},
		validatePhone:function(el) {
			var name = el.attr('name'),
			val = el.val();
			this.$inputs[name] = true;
						
			if(el.attr('required') || val.length) {
				if(this.$patterns['phone'].test(val)) {
					this.$inputs[name] = true;
					el.val(this.formatPhone(val));
				} else {
					this.$inputs[name] = false;
				}
			}
			
			this.validationHandler(el);
			
			return this.$inputs[name];
		},
		validateNumber:function(el) {
			var name = el.attr('name'),
			val = parseFloat(el.val()),
			min = el.attr('min') ? Number(el.attr('min')) : -Infinity,
			max = el.attr('max') ? Number(el.attr('max')) : Infinity;
			this.$inputs[name] = true;
			
			if(el.attr('required') || val.length) {
				if(isNaN(val) === true) {
					this.$inputs[name] = false;
				}
				
				if(val < min || val > max) {
					this.$inputs[name] = false;
				} 
				
				if(typeof pattern != 'undefined') {
					if(!this.$patterns[pattern].test(val)) {
						this.$inputs[name] = false;
					} 
				}
			}
			
			if(this.$inputs[name] && !isNaN(val)) {el.val(val);}
			
			this.validationHandler(el);
			
			return this.$inputs[name];
		},
		validateEmail:function(el) {
			var name = el.attr('name'),
			val = el.val();
			this.$inputs[name] = true;
						
			if(el.attr('required') || val.length) {
				if(this.$patterns['email'].test(val)) {
					this.$inputs[name] = true;
				} else { 
					this.$inputs[name] = false;
				}
			}
			
			this.validationHandler(el);
			
			return this.$inputs[name];
		}, 
		validateText:function(el) {
			var name = el.attr('name'),
			val = el.val(),
			pattern = el.data('pattern');
			this.$inputs[name] = true;
			
			
			if(el.attr('required') || val.length) {
				if(typeof pattern != 'undefined') {				
					if(!this.$patterns[pattern].test(val)) {
						this.$inputs[name] = false;
					}
				} else {
					if(!this.$patterns['alnum'].test(val)) {
						this.$inputs[name] = false;
					}
				}
			}
			
			if(pattern == 'currency' && this.$inputs[name]) { 
				el.val(this.formatCurrency(val));
			}
			
			this.validationHandler(el);

			return this.$inputs[name];
		},
		validateFile:function(el) {
			var name = el.attr('name'),
			val = el.val();
			
			this.$inputs[name] = false;
			
			if(val) {
				this.$inputs[name] = true;
			}
			
			this.validationHandler(el);

			return this.$inputs[name];
		},
		validateRadio:function(el) {
			var name = el.attr('name');
			this.$inputs[name] = true;

			if(el.attr('required')) {
				this.$inputs[name] = false;

				$('input[name="'+name+'"]').each(function() {
					if($(this).is(':checked')) {
						this.$inputs[name] = true;
					}
				});
			}
			
			this.validationHandler(el);

			return this.$inputs[name];
		},
		validateCheckbox:function(el) {
			var name = el.attr('name');
			this.$inputs[name] = true;

			if(el.attr('required') && !el.is(':checked')) {
				this.$inputs[name] = false;
			}
			
			this.validationHandler(el);

			return this.$inputs[name];
		},
		validateSelect:function(el) {
			var name = el.attr('name')
			val = el.val();
			this.$inputs[name] = true;
			
			if(el.attr('required') && (val === '' || !val)) {
				this.$inputs[name] = false;
			}
			
			this.validationHandler(el);
			
			return this.$inputs[name];
		}, 
		validateTextarea:function(el) {
			var name = el.attr('name'),
			val = el.val(),
			pattern = el.data('pattern');
			this.$inputs[name] = true;
			
			if(el.attr('required') || val.length) {
				if(typeof pattern != 'undefined') {
					if(!this.$patterns[pattern].test(val)) {
						this.$inputs[name] = false;
					} 
				} else { 
					if(!this.$patterns['alnum'].test(val)) {
						this.$inputs[name] = false;
					} 
				}
			} 
			
			this.validationHandler(el);
			
			return this.$inputs[name]; 
		}, 
		validateMatch:function(el) {
			var name = el.attr('name'), 
			val = el.val(),
			match = $('#'+el.data('match-input'));
			this.$inputs[name] = true;
			
			if(el.attr('required') || val.length) {
				if(match.data('pattern') == 'phone' || match.attr('type') == 'tel') {
					el.val(this.formatPhone(val));
				}

				if(val != match.val()) { 
					this.$inputs[name] = false;
				} 
			} 
			
			this.validationHandler(el);

			return this.$inputs[name];
		},
		validateElement:function(el) {
			var tag = el[0].tagName,
			type = el[0].type,
			name = el.attr('name'),
			pattern = el.data('pattern');
			
			/* getting input type */
			switch(tag) { 
				case 'INPUT':
					if($.inArray(type, this.$customInputs) != -1 || $.inArray(pattern, this.$customInputs) != -1) {
						return this.validateCustom(el); 
					} else if($.inArray(type, this.$matchInputs) != -1 || $.inArray(pattern, this.$matchInputs) != -1) {
						return this.validateMatch(el); 
					} else if($.inArray(type, this.$hiddenInputs) != -1 || $.inArray(pattern, this.$hiddenInputs) != -1) {
						return this.validateHidden(el); 
					} else if($.inArray(type, this.$phoneInputs) != -1 || $.inArray(pattern, this.$phoneInputs) != -1) {
						return this.validatePhone(el); 
					} else if($.inArray(type, this.$numberInputs) != -1 || $.inArray(pattern, this.$numberInputs) != -1) {
						return this.validateNumber(el); 
					} else if($.inArray(type, this.$emailInputs) != -1 || $.inArray(pattern, this.$emailInputs) != -1) {
						return this.validateEmail(el); 
					} else if($.inArray(type, this.$textInputs) != -1 || $.inArray(pattern, this.$textInputs) != -1) {
						return this.validateText(el);
					} else if($.inArray(type, this.$fileInputs) != -1 || $.inArray(pattern, this.$fileInputs) != -1) {
						return this.validateFile(el);
					} else if($.inArray(type, this.$radioInputs) != -1) {
						return this.validateRadio(el);
					} else if($.inArray(type, this.$checkboxInputs) != -1) {
						return this.validateCheckbox(el);
					}
						
					break; 
				case 'BUTTON':
					return this.validateHidden(el); 
					break; 
				case 'SELECT':
					return this.validateSelect(el); 
					break; 
				case 'TEXTAREA': 
					return this.validateTextarea(el); 
					break; 
				default: 
					$.error('Element type or data pattern could not be found.'); 
					return false; 
			}
		}, 
		valid:'ui-state-valid', 
		invalid:'ui-state-invalid',
		highlight:'ui-state-highlight',  
		before:null, 
		success:null, 
		failure:null, 
		extend:null
	}
	
})(jQuery);