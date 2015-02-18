define(['lib/news_special/bootstrap'], function (news) {

	var InfoModel = function (content) {
		this.toString = function () {
			return ' <div class="nhswinter_tracker_info_container">' +
				'   <a class="nhswinter_tracker_info_link" href=""></a>' +
				'   <span class="nhswinter_tracker_info_content">' +
				'		<p>' + content + '<a class="nhswinter_tracker_info_close" href="#"></a></p>' +
				'	</span>' +
				'</div>';
		};
	};

	return InfoModel;
});