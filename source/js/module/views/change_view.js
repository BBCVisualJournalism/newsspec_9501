define(['lib/news_special/bootstrap'], function (news) {
    
    var applicationView = function () {
        news.$('.nhswinter_tracker_branding').hide();
        news.$('.nhswinter_tracker_overview').hide();
        news.$('.nhswinter_tracker_text_intro').hide();
        news.$('.nhswinter_tracker_text_article').hide();
        news.$('.nhswinter_tracker_cta').show();

    };

    var landingView = function () {
        news.$('.nhswinter_tracker_branding').show();
        news.$('.nhswinter_tracker_overview').show();
        news.$('.nhswinter_tracker_text_intro').show();
        news.$('.nhswinter_tracker_text_article').show();
        news.$('.nhswinter_tracker_cta').hide();
        news.$('.nhswinter_tracker_results').hide();
        news.$('.nhswinter_tracker_form fieldset').addClass('nhswinter_tracker_form_select_nearest_hospital_hide');
        // window.scrollTo(0, news.$('#nhswinter_app').offset().top);
    };

    var listenForEvents = function () {
        applicationView();
        news.pubsub.on('nhswinter_tracker:form:submitted', applicationView);

        // news.pubsub.on('nhswinter_tracker:form:reset', landingView);
        // news.$('.nhswinter__reset--btn').on('click', function (e) {
        //     e.preventDefault();
        //     news.pubsub.emit('nhswinter_tracker:form:reset');
        //     return false;
        // });
    };

    return { init: listenForEvents };
});