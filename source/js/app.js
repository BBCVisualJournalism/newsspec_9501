define(['lib/news_special/bootstrap', 'module/controller/controller', 'lib/news_special/share_tools/controller'], function (news, controller, shareTools) {

    return {
        init: function () {

            news.pubsub.emit('istats', ['app-initiated', 'newsspec-interaction', true]);
            
            // setTimeout(function () {
            //     news.pubsub.emit('istats', ['panel-clicked', 'newsspec-interaction', 3]);
            // }, 500);
            // setTimeout(function () {
            //     news.pubsub.emit('istats', ['quiz-end', 'newsspec-interaction', true]);
            // }, 2000);

            shareTools.init('.tempShareToolsHolder', {
                storyPageUrl: 'http://bbc.co.uk/nhswinter',
                header:       'Share this',
                message:      'How well does YOUR hospital perform? Enter your postcode to see',
                hashtag:      'nhswinter',
                image:        'http://news.bbcimg.co.uk/news/special/2014/newsspec_9501/content/english/img/nhs_winter.png',
                template:     'default'
            });
            //shareTools template key value can be 'default' or 'dropdown'

            // news.setStaticIframeHeight(2000);

            // news.hostPageSetup(function () {
            //     window.alert('sending instructions to the host page');
            //     document.body.style.background = 'red';
            // });
            controller.init();

            news.sendMessageToremoveLoadingImage();
        }
    };

});
