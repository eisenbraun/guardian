/*!
 * jQuery Guardian
 * @author: Michael Eisenbraun
 * @version: 2.0.0
 * Further changes, comments: Michael Eisenbraun
 * Licensed under the MIT license
 */


;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var guardian = 'guardian',
        defaults = {
            /*regular expressions*/ 
            /*Input types*/ 
            /*CSS Classes*/
            /*Other options: Native browser validation, etc*/ 
        };

    // The actual plugin constructor
    function Guardian( element, options ) {
        this.element = element;

        // jQuery has an extend method that merges the 
        // contents of two or more objects, storing the 
        // result in the first object. The first object 
        // is generally empty because we don't want to alter 
        // the default options for future instances of the plugin
        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = guardian;
        
        this.init();
    }

    Guardian.prototype.init = function () {
        // Place initialization logic here
        // You already have access to the DOM element and
        // the options via the instance, e.g. this.element 
        // and this.options

        /* 
         * Pull the entire form from the DOM and detach it.
         * Store this data as a jQuery object.
         * 
         * Can I pull the entire form and rebuild it to include all the 
         * input, group, counter, and regular expression information, 
         * and write it all back to the DOM in one instance?
         * 
         * Advantages: 
         * Speed - only write to the DOM once
         * Alternative form creation - the ability to create the form
         *  dynamically from a json object. 
         *
         * Disadvantages: 
         * Potential issues with forms that add dynamic inputs 
         */ 

        /* 
         * Create an object of all the input (inputs) from the form object, storing 
         * them as jQuery objects.  
         *
         * Gather group information
         * Create a object of all groups (groups)
         *
         * Gather Counter Information
         *
         * Gather Regular Expression Information
         */

         /* 
          * Create Event Listeners: 
          * Blur and Change Events
          * Keyup (counter) Events
          * Submit Event
          * 
          * Can I create my own event, like a validating event? 
          *
          */

          /*
           * Add hooks, extend and override functions
           *
           */

         
    };

    /*
    ## Input Types: 
    - Text
    - Hidden
    - Phone
    - Number
    - Email
    - File
    - Radio
    - Checkbox
    - Select
    - Textarea

    ## Validation Types:
    - alpha
    - alnum
    - number
    - currency
    - zip
    - year
    - phone
    - email
    - url
    - date

    ## API 
    - addPattern
    - addInputType
    - addGroup
    - getInvalid
    - getValid
    - getInputs


    ## Can I build the form from a JSON string 
    [
      {
        "name"
        "type"
        "value"
        "required"
        
      }  
    ]
    
    */


    // A really lightweight plugin wrapper around the constructor, 
    // preventing against multiple instantiations
    $.fn[guardian] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + guardian)) {
                $.data(this, 'plugin_' + guardian, 
                new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );