define([
    'lib/news_special/bootstrap',
    'module/model/form',
    'module/views/performance_comparison',
    'module/views/dotted_view',
    'module/views/bar_charts',
    'module/views/infographic',
    'module/model/location',
    'data/dataset',
    'module/controller/info_controller',
    'module/views/change_view',
    'module/model/istats'
], function (news, Form, performanceChart, DotView, BarChart, infographicView, LocationService, dataset, InfoController, ChangeView) {
// ], function (news, Form) {
    var Controller = function () {

        var latestHospital = false,
        changeViewInit = false;

        var showResults = function (searchby) {
            var hospitalCode,
                postcode = news.$('#nhswinter_tracker_postcode_value').html(),
                hospitalName = news.$('#nhswinter_tracker_hospital_value').html();

            LocationService.getLocationDetail(postcode, hospitalName, searchby);
        };

        var renderView = function (hospital) {
            if (!changeViewInit) {
                ChangeView.init();
                changeViewInit = true;
            }
            latestHospital = hospital;

            news.$('.nhswinter_tracker_results').show();
            dataset[hospital.nhsTrustCode]['organisationName'] = hospital.organisationName;

            renderDottedView(hospital.nhsTrustCode);
            renderInfographic(hospital.nhsTrustCode);
            performanceChart.init(dataset, hospital.nhsTrustCode);

            news.pubsub.emit('nhswinter_tracker:results:updated', [hospital.organisationName]);
        };

        var renderDottedView = function (nhsTrustCode) {
            var attendance = new DotView('.nhswinter_tracker_attendance_dotted_view'),
                admissions = new DotView('.nhswinter_tracker_admissions_dotted_view');

            attendance.draw(dataset[nhsTrustCode]['attendances_at_ane']);
            admissions.draw(dataset[nhsTrustCode]['emergency_admissions']);
        };

        var renderInfographic = function (ccgCode) {
            var chartList = [
                'patients_waiting_over_4hrs_tobe_admitted'
                ,'trolley_wait_4_to_12hrs'
                ,'ambulances_queuing'
                ,'planned_operations'
                ,'beds_blocked'
                ,'beds_closed_dueto_norovirus'
            ];

            infographicView.populate(dataset[ccgCode], ccgCode);

            for (var i = 0; i < chartList.length; i++) {
                var barChart = new BarChart(),
                    data = {'ccg': dataset[ccgCode][chartList[i]], 'england': dataset[chartList[i]]};

                infographicView.comparedViewPopulate(chartList[i], dataset[ccgCode][chartList[i]], dataset[chartList[i]]);
                barChart.draw(data, chartList[i]);
            }
        };

        var listenForEvents = function () {
            news.pubsub.on('nhswinter_tracker:form:submitted', showResults);
            news.pubsub.on('nhswinter_tracker:locationResolution:success', renderView);

            // code based on http://stackoverflow.com/questions/667426/javascript-resize-event-firing-multiple-times-while-dragging-the-resize-handle
            var TO = false;
            news.$(window).on('resize', function () {
                if (TO !== false) {
                    clearTimeout(TO);
                }
                TO = setTimeout(function () {
                    if (latestHospital) {
                        renderView(latestHospital);
                    }
                }, 200); //200 is time in miliseconds
            });
        };

        this.init = function () {
            news.$('#nhswinter_app').removeClass('ns__noJs').css('display', 'block');
            listenForEvents();
            var form = new Form(false);
            form.init();
            var info = new InfoController();
            info.init();
        };
    };

    return new Controller();
});