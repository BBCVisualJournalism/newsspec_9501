define(['lib/news_special/bootstrap'], function (news) {

    // set dev to true to see istats output in console
    var dev = false;

    news.pubsub.on('nhswinter_tracker:results:updated', function (hospital) {
        news.pubsub.emit('istats', ['Form', 'newsspec-interaction', 'User loaded results for ' + hospital]);
    });

    news.pubsub.on('nhswinter_tracker:scroll:scrolledToBottom', function () {
        news.pubsub.emit('istats', ['Scroll', 'newsspec-interaction', 'User scrolled to end of document.']);
    });

    news.pubsub.on('nhswinter_tracker:info:clicked', function () {
        news.pubsub.emit('istats', ['Info Buttons', 'newsspec-interaction', 'User clicked on a button for more information.']);
    });

    news.pubsub.on('nhswinter_tracker:form:reset', function () {
        news.pubsub.emit('istats', ['Form Reset', 'newsspec-interaction', 'User reset the form to landing page view.']);
    });

    if (dev) {
        news.istats.log = function (type, name, options) {
            console.log('iStats triggered. Product: ' + name + ', Heading: "' + type + '", Description: "' + options.view + '"');
        };
    }

});