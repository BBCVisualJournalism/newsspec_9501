define(['lib/news_special/bootstrap', 'module/controller/form_redirect', 'module/controller/error'], function (news, FormRedirect) {

    /**
    * Defines the form behaviour and default values.
    *
    * @param shouldRedirectPage boolean true if we want to redirect, false if not.
    */
    var Form = function (shouldRedirectPage) {

        var defaultPostcodeVal = 'Enter your postcode';
        var postcodeInput = news.$('#nhswinter_tracker_form_input_postcode');
        var showResultsBy = null;

        /**
        * Checks if form has been submitted already, emitting an event if so.
        *
        * If postcode/hospital has a value on page load, user arrived via another
        * page and has already filled in the form, so we need to display the results.
        */
        var checkParameters = function () {

            if (!shouldRedirectPage) {
                FormRedirect.checkParameters();
            }

            news.$.fn.exists = function () {
                return this.length > 0;
            };

            // check we're on the main article
            if (
                news.$('#nhswinter_tracker_postcode_value').exists()
            ) {

                // load results if parameters have been set
                if (news.$('#nhswinter_tracker_postcode_value').html() !== '') {
                    postcodeInput.val(news.$('#nhswinter_tracker_postcode_value').html());
                    showResultsBy = 'postcode';
                    news.pubsub.emit('nhswinter_tracker:form:submitted', [showResultsBy]);
                }
            }
        };

        /**
        * Populates the input fields with default values if they're empty.
        */
        var populateWithJS = function () {
            if (postcodeInput.val() === '') {
                postcodeInput.val(defaultPostcodeVal);
            }
        };

        /**
        * Defines behaviour for when user clicks on/leaves the input fields.
        */
        var listenForClicks = function () {
            postcodeInput.on('focus', function () {
                emptyIfValueIsDefault(postcodeInput, defaultPostcodeVal);
            });
            postcodeInput.on('blur', function () {
                defaultIfValueIsEmpty(postcodeInput, defaultPostcodeVal);
            });
        };

        /**
        * Define behaviour for when dropdown menu option is changed.
        */
        var listenForChange = function () {
            news.$('#nhswinter_tracker_form_select_nearest_hospital').on('change', function () {
                var newHospital = news.$(this).val();
                if (newHospital !== 'default') {
                    showResultsBy = 'nearest_hospital';
                    news.pubsub.emit('nhswinter_tracker:form:submitted', [showResultsBy]);
                }
            });
        };

        /**
        * Defines behaviour for when the user clicks the submit button.
        */
        var listenForSubmit = function () {
            news.$('.nhswinter_tracker_form button').on('click', function (e) {
                e.preventDefault();
                
                if (inputIsValid()) {
                    // don't want to submit default values
                    emptyIfValueIsDefault(postcodeInput, defaultPostcodeVal);
                    // on the small form we provide for index pages, we want 
                    // the form to submit so that it takes users to the main article
                    if (shouldRedirectPage) {
                        FormRedirect.redirect();
                        //news.$('.nhswinter_tracker_form').submit();
                    } else {
                        // if we're already on the main article, we don't want a page refresh.
                        // ############################################################ TODO - add hospital support
                        showResultsBy = 'postcode';
                        news.$('#nhswinter_tracker_postcode_value').html(postcodeInput.val());
                        news.pubsub.emit('nhswinter_tracker:form:submitted', [showResultsBy]);

                        // now want to load in the default values again for the empty fields
                        defaultIfValueIsEmpty(postcodeInput, defaultPostcodeVal);
                    }
                }
            });
        };

        /**
        * Define behaviour for when form is reset.
        */
        var listenForReset = function () {
            news.pubsub.on('nhswinter_tracker:form:reset', function () {
                postcodeInput.val(defaultPostcodeVal);
            });
        };

        /**
        * Empty the input field value if it's value is currently the default value.
        */
        var emptyIfValueIsDefault = function (input, defaultValue) {
            if (input.val() === defaultValue) {
                input.val('');
            }
        };

        /**
        * Give the input field the default value if its value is currently empty.
        */
        var defaultIfValueIsEmpty = function (input, defaultValue) {
            if (input.val() === '') {
                input.val(defaultValue);
            } else {
                showResultsBy = input.attr('name');
            }
        };

        /**
        * Checks both input fields to see if they've been filled in with valid text.
        *
        * @return boolean false if both inputs are invalid, otherwise true.
        */
        var inputIsValid = function () {
            var validInput = true,
                errorMessage = 'Unknown error.';

            // removes addition sign added in IE, i.e. W1A+1AA => W1A1AA
            postcodeInput.val(postcodeInput.val().replace(/\+/g, ''));

            if (postcodeInput.val() === defaultPostcodeVal) {
                validInput = false;
                errorMessage = 'You must fill in a postcode!';
            } else if (postcodeInput.val() !== defaultPostcodeVal) {
                // user has filled in the postcode field, so we need to validate it
                if (!validatePostcode(postcodeInput.val())) {
                    validInput = false;
                    errorMessage = 'Enter a valid full postcode.';
                }
            }

            if (!validInput) {
                news.pubsub.emit('nhswinter_tracker:form:error', [errorMessage]);
            }
            return validInput;
        };

        /**
        * Returns true if postcode is valid.
        *
        * Regex taken from http://stackoverflow.com/a/7259020
        *
        * @param postcode string The postcode to validate.
        * @return boolean true if valid, false if not.
        */
        var validatePostcode = function (postcode) {
            return (/^(GIR ?0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]([0-9ABEHMNPRV-Y])?)|[0-9][A-HJKPS-UW]) ?[0-9][ABD-HJLNP-UW-Z]{2})$/i).exec(postcode);
        };
        

        /**
        * Module entry point.
        */
        this.init = function () {
            checkParameters();
            populateWithJS();
            listenForClicks();
            listenForChange();
            listenForSubmit();
            listenForReset();
            news.$('.get_involved_cta,.overview__nav').on('click', function(e){
                e.preventDefault();
                window.parent.document.location = news.$(this).attr('href');
            });

            // handle form submission
            var formel = news.$('#nhswinter_app').find('form')[0];
            news.$(formel).keypress(function(event){
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '13'){
                    event.preventDefault();
                    news.$('.nhswinter_tracker_form button').trigger('click');
                }
            });



        };
    };

    return Form;
});