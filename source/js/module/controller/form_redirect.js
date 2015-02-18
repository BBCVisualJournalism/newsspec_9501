define(['lib/news_special/bootstrap'], function (news) {

	var FormRedirect = function () {

		/**
		* TO be called on page load.
		* Checks URL and parses parameters, populating a couple of DOM elements which
		* are later checked for values, automatically starting the form submission process.
		*/
		this.checkParameters = function () {
			var url = window.location.href;
			var postcode = getParameterValue('postcode', url);
			if (postcode) {
				news.$('#nhswinter_tracker_postcode_value').html(postcode);
			}
		};

		/**
		* To be called when user completes the "small module" form.
		* Appends form values to URL and redirects.
		*/
		this.redirect = function () {
			var baseUrl = news.$('.nhswinter_tracker_form').attr('action');
			var parameter = news.$('.nhswinter_tracker_form_input_postcode').val();
			parameter = encodeURIComponent(parameter);

			// TODO - hospital support
			window.location.href = baseUrl + '#postcode=' + parameter;
		};

		// regex get postcode
		var getParameterValue = function (parameter, string) {
			var match = false;
			var matches = string.match(new RegExp(parameter + '=([^&]*)', 'i'));
			if (matches) {
				match = decodeURIComponent(matches[1]);
				// removes addition sign added in IE, i.e. W1A+1AA => W1A1AA
				match = match.replace(/\+/g, '');
			}
			return match;
		};

	};

	return new FormRedirect();

});