define(['lib/news_special/bootstrap', 'module/model/info_model'], function (news, InfoModel) {

	var InfoController = function () {
		
		var convertElements = function () {
			news.$('.nhswinter_tracker_info').each(function () {
				var contents = news.$(this).html();
				news.$(this).html((new InfoModel(contents)).toString());
			});
		};

		/**
		* Defines the click behaviour.
		*/
		var listenForClicks = function () {
			news.$('.nhswinter_tracker_info_link').on('click', function (e) {
				e.preventDefault();
				var addClass, parent;
				addClass = true;
				parent = news.$(this).parent().find('.nhswinter_tracker_info_content');
				addClass = !(parent.hasClass('nhswinter_tracker_info_content_active'));
				closeBoxes();
				if (addClass) {
					parent.addClass('nhswinter_tracker_info_content_active');
				}
				news.pubsub.emit('nhswinter_tracker:info:clicked');
				return false;
			});

			news.$('.nhswinter_tracker_info_close').on('click', function (e) {
				e.preventDefault();
				closeBoxes();
				return false;
			});
		};

		var closeBoxes = function () {
			news.$('.nhswinter_tracker_info_content').removeClass('nhswinter_tracker_info_content_active');
		};

		/**
		* Module entry point.
		*/
		this.init = function () {
			convertElements();
			listenForClicks();
		};
	};

	return InfoController;
});