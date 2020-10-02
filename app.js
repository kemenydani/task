
(function(global, $) {

    var FormManager = function( $form, config ) {

        var self = this;

        self.$form = $form;
        self.config = config.rules || {};
        self.autocomplete = config.autocomplete || {};

        self.$form.on( 'submit', this.submit.bind(this) );

        self.$form.find('.input-field').on('change',function(event){
            this.validateFormField(event.target);
        }
        .bind(this));

        self.$form.find('.autocomplete-field').on('input', this.predictValue.bind(this) );
        self.$form.delegate('.autocomplete-row', 'click', {}, this.pickPredicion.bind(this));
    };

    FormManager.prototype = {

        pickPredicion : function(){

            var $row = $(event.target);
            var $rows = $row.parent();

            $rows.parent().find('.autocomplete-field').val($row.text());
            $rows.hide();

        },

        predictValue : function( event ){

            var predicted = this.autocomplete[event.target.name].filter(function(entry){
                if(!entry) return false;
                return entry.toString().search(event.target.value) >= 0;
            });

            if(predicted.length === 0) return;

            var $list = $(event.target).next('.autocomplete-rows');

            $list.empty().show();

            predicted.forEach(function(value){
                $list.append($('<div class="autocomplete-row">').text(value))
            }
            .bind(this));
        },

        getFieldRules : function( field ){
            return this.config[field];
        },

        getFieldInputValue : function( el ){

            if (el.type === 'checkbox') return el.checked;
            if (el.type === 'radio' && el.checked) return el.value;

            return el.value;
        },

        validateForm : function(){
            this.$form.find('.input-field').toArray().forEach(function(el){
                var valid = this.validateFormField( el );
            }
            .bind(this));
        },

        validateFormField : function( el ){

            var value = this.getFieldInputValue( el );
            var rules = this.getFieldRules(el.name);
            var valid = true;

            this.validator.validate( el.name, value, rules, function( report ){
                if(!report.valid) valid = false;
            });

            if( valid ) {
                $(el).closest('.field').addClass('field-valid').removeClass('field-invalid');
            } else {
                $(el).closest('.field').removeClass('field-valid').addClass('field-invalid');
            }

            return valid;
        },

        submit : function( event ){

            event.preventDefault();

            this.validateForm();
        },

        validator : {

            validate : function( name, value, ruleString, callback ){

                var report = { valid : true };
                var rules = this.parseRules( ruleString );

                rules.forEach(function( rule ){

                    var valid = this[rule.name].call(this, name, value, rule.value);

                    if(!valid) report.valid = false;
                }
                .bind(this));

                callback( report );
            },

            parseRules : function ( string ){

                var parsed = [];

                if(!string) return parsed;

                var rules = string.split('|') || [];

                rules.forEach(function(rule) {

                    rule = rule.split(':');
                    parsed.push({ name : rule[0], value : rule[1] || rule[0] });

                });

                return parsed;
            },

            required : function( field, value ){
                return !!value;
            },

            min : function( field, value, limit ){
                return value.length >= parseInt(limit);
            },

            max : function( field, value, limit ){
                return value.length <= parseInt(limit);
            },
        }
    };

    global.FormManager = FormManager;

}( window, window.jQuery ));
