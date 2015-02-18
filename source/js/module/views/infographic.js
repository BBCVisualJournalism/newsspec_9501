define(['lib/news_special/bootstrap', 'module/model/info_model'],  function (news, InfoModel) {
    var $ = news.$,
        d3 = news.d3,
        trustsWithNoData = [];
    
    var InfographicViewRenderer = function () {
        //
    };
    
    function getFigure(num) {
        var numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
            isDecimal = (Math.floor(num) !== num);
        
        if (num > 9 || isDecimal) {
            return (isDecimal) ? Math.round(num * 10) / 10: num;
        }

        return numbers[num];
    }
    
    function getDifference(dataList) {
        var data = dataList.slice(-2);
        return data[1] - data[0];
    }
    
    function weekOnWeekPerformance(dataArray) {
        var difference = getDifference(dataArray),
            differenceDisplay = getFigure(Math.abs(difference));

        if (difference > 0) {
            return 'Up by ' + differenceDisplay;
        } else if (difference < 0) {
            return 'Down by ' + differenceDisplay;
        } else {
            return 'Remains the same';
        }
    }
    
    function arrowDirection(data) {
        var difference = getDifference(data);
        
        if (difference > 0) {
            return 'nhswinter_tracker_comparison_arrow_up';
        } else if (difference < 0) {
            return 'nhswinter_tracker_comparison_arrow_down';
        } else {
            return 'nhswinter_tracker_comparison_arrow_no_change';
        }
    }
    
    function updateParentClassName(node, values) {
        node.parent().attr('class', arrowDirection(values));
    }
    
    function addCommas(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    function populate(hospitalData, code) {
        if (trustsWithNoData.join('').indexOf(code) < 0) {
            news.$('.nhswinter_tracker_list').show();
            var weekIndex = hospitalData['beds_blocked'].length - 1,
                //dataSourceText = () ? : ,
                selectors = {
                    'nhswinter_tracker_result_header_name': hospitalData.organisationName,
                    'nhswinter_tracker_result_header_source': 'Data for ' + hospitalData.name,
                    'nhswinter_tracker_chart_label__name': hospitalData.organisationName,
                    'nhswinter_tracker_result_summary_large': hospitalData.patients_seen_in_four_hours[weekIndex] + '%',
                    'nhswinter_tracker_chart_label__value': hospitalData.patients_seen_in_four_hours[weekIndex] + '%',
                    // @TODO - attendances_at_ane requires addComma()
                    'nhswinter_tracker_attendances_at_ane': addCommas(hospitalData.attendances_at_ane[weekIndex]),
                    'nhswinter_tracker_attendances_at_ane_comparison_text': weekOnWeekPerformance(hospitalData.attendances_at_ane),
                    'nhswinter_tracker_emergency_admissions': addCommas(hospitalData.emergency_admissions[weekIndex]),
                    'nhswinter_tracker_emergency_admissions_comparison_text': weekOnWeekPerformance(hospitalData.emergency_admissions),
                };
            
            for (var selectorName in selectors) {
                var node = $('.' + selectorName);
                node.html(selectors[selectorName]);
                if (selectorName === 'nhswinter_tracker_attendances_at_ane_comparison_text') {
                    updateParentClassName(node, hospitalData.attendances_at_ane);
                } else if (selectorName === 'nhswinter_tracker_emergency_admissions_comparison_text') {
                    updateParentClassName(node, hospitalData.emergency_admissions);
                }
            }
            news.pubsub.emit('ns:share:message',
                ['My nearest major A&E is seeing ' + hospitalData.patients_seen_in_four_hours[weekIndex] + '% of patients in 4hrs, up on last week. Check yours with our']);
        } else {
            news.$('.nhswinter_tracker_result_header_name').html(hospitalData.organisationName);
            news.$('.nhswinter_tracker_result_header_source').html('There is no data available for ' + hospitalData.name + ' for the week 12-18 January');
            news.$('.nhswinter_tracker_list').hide();
        }
    }

    function interpolate(str, o) {
        return str.replace(/{([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    }

    function comparedViewPopulate(selectorName, hospitalData, averageData) {
        var parentElement = $('.' + selectorName + '_wrapper'),
            weekIndex = hospitalData.length - 1;
        
        var viewTemplate = ' <div class="nhswinter_tracker_comparison_text nhswinter_tracker_comparison_left"> ' +
                                '<div class="{hospitalComparisonArrow}">Your hospital</div>' +
                                '{hospitalValue}' +
                                '<div class="{hospitalComparisonArrow}"><div class="nhswinter_tracker_comparison_arrow_img"></div>{hospitalWeekonweek}</div>' +
                            '</div>' +
                            '<div class="nhswinter_tracker_comparison_text nhswinter_tracker_comparison_right">' +
                                '<div class="{hospitalComparisonArrow}">England average</div>' +
                                '{averageValue}' +
                                '<div class="{averageComparisonArrow}"><div class="nhswinter_tracker_comparison_arrow_img"></div>{averageWeekonweek}</div>' +
                            '</div>',
            barchartParams = {
                hospitalValue: hospitalData[weekIndex],
                hospitalWeekonweek: weekOnWeekPerformance(hospitalData),
                hospitalComparisonArrow: arrowDirection(hospitalData),
                averageValue: (function () { var avg = averageData[weekIndex]; return (Math.floor(avg) !== avg) ? Math.round(avg * 10) / 10: avg; })(),
                averageWeekonweek: weekOnWeekPerformance(averageData),
                averageComparisonArrow: arrowDirection(averageData)
            };
            
        parentElement.html(interpolate(viewTemplate, barchartParams));
    }

    return {
        populate: populate,
        comparedViewPopulate: comparedViewPopulate
    };

});