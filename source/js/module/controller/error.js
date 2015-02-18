define(['lib/news_special/bootstrap'], function (news) {

	var Error = function () {

		var errorMessage,
			errorContainer = news.$('.nhswinter_tracker_form_error');

		var triggerError = function (error) {
			errorMessage = error;
			displayError();
		};

		var displayError = function () {
			errorContainer.show().html(errorMessage);
		};

		var hideError = function () {
			errorContainer.hide();
		};

		/**
		* Module entry point.
		*/
		var init = function () {
			news.pubsub.on('nhswinter_tracker:form:error', triggerError);
			news.pubsub.on('nhswinter_tracker:form:submitted', hideError);
		};

		init();
	};

	return new Error();
});