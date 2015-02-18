define(['lib/news_special/bootstrap', 'module/model/sharetools_model', 'module/views/sharetools_view'], function (news, NSShareModel, NSShareView) {
    
    var shareDiv = '#nhswinter_tracker_share_module',
        model,
        view,
        config;

    var _callFaceBook = function () {
        news.pubsub.emit('ns:request:launchshare', [model.fbShareTarget()]);
    };

    var _callTwitter = function () {
        news.pubsub.emit('ns:request:launchshare', [model.twitterShareTarget()]);
    };

    var _callEmail = function () {
        news.pubsub.emit('ns:request:launchshare', [model.emailShareTarget()]);
    };

    var _updateMessage = function (text) {
        model.setShareMessage(text);
    };

    var _initialiseModule = function () {
        news.pubsub.on('ns:share:call:facebook', _callFaceBook);
        news.pubsub.on('ns:share:call:twitter', _callTwitter);
        news.pubsub.on('ns:share:call:email', _callEmail);
    };

    return {
        init: function () {

            var hashtag, header, desc, message;

            hashtag = document.getElementById('nhswinter_tracker_share_module_hashtag').innerHTML;    // hashtag
            header = document.getElementById('nhswinter_tracker_share_module_cta').innerHTML;         // cta on page itself
            desc = document.getElementById('nhswinter_tracker_share_module_title').innerHTML;         // email subject, fb title
            message = document.getElementById('nhswinter_tracker_share_module_message').innerHTML;    // tweet, fb status, email body

            config = {
                //hashtag: [hashtag],
                header: header,
                desc: desc,
                message: message
            };

            model = new NSShareModel(config);
            view = new NSShareView(shareDiv);

            // start listening for share events
            news.pubsub.on('ns:module:ready', _initialiseModule);
            // build the share module
            news.pubsub.emit('ns:request:personalshare', [model]);

            // personalise share message
            news.pubsub.on('nhswinter_tracker:results:updated', function (hospital) {
                var percentage, difference;
                difference = news.$('.nhswinter_tracker_attendances_at_ane_comparison_text').html().toLowerCase();
                difference = difference.split(' ')[0];
                percentage = news.$('.nhswinter_tracker_list .nhswinter_tracker_result .nhswinter_tracker_result_summary h1.nhswinter_tracker_result_summary_large').first().html();
                _updateMessage('My nearest major A&E is seeing ' + percentage + ' of patients in 4hrs, ' + difference + ' on last week. Check yours with our #' + hashtag + ' tracker');
            });
        }
    };
});