define(['lib/news_special/bootstrap', 'data/id_mapping', 'module/controller/error'], function (news, idMap) {
    var $ = news.$,
        hospitalsWithoutAandEDepartment = ['RWH20', 'RYJ03', 'RJD01', 'RV831', 'RVLC7', 'NLL21', 'NVT01', 'RGCKH', 'RM401', 'RP601', 'RYW21', 'RXH07', 'RW3DH', 'RLNGM', 'RYJ07', 'RK953', 'RA708', 'RW3TR'],
        nearestHospitalObj = {};
    
    function locationDetail(postcode, hospital, criteria) {
        var selectInnerHtml = '<option value="default">Select another hospital near you</option>',
            nearestHospitalIdentified;


        if (criteria === 'postcode') {
            news.$.ajax({
                type: 'GET',
                url: 'http://open.live.bbc.co.uk/locator/locations/' + postcode + '/details/ns-aande?vv=2&rs=5&format=jsonp&jsonp=news',
                async: false,
                jsonpCallback: 'news',
                contentType: 'application/json',
                dataType: 'jsonp',
                success: function (data) {

                    if (data.response.type === 'details' && data.response.metadata.location.admin1.name === 'England') {

                        for (var i = 0; i < data.response.content.details.details.length; i++) {


                            if (hospitalHasAandE(data.response.content.details.details[i].externalId)) {
                                var nearestHospital = data.response.content.details.details[i],
                                    hospitalId = nearestHospital.externalId;

                                selectInnerHtml += '<option value="' + hospitalId + '">' + idMap[hospitalId].name + '</option>';
                                if (!nearestHospitalIdentified) {
                                    // news.pubsub.emit('nhswinter_tracker:locationResolution:success', [{nhsTrustCode: idMap[hospitalId].trust, organisationName: idMap[hospitalId].name}]);
                                    news.pubsub.emit('nhswinter_tracker:locationResolution:success', [{nhsTrustCode: idMap[hospitalId].trust, organisationName: idMap[hospitalId].name}]);
                                    nearestHospitalIdentified = true;
                                }
                                
                                // nearestHospitalObj[idMap[hospitalId].trust] = idMap[hospitalId].name;
                                nearestHospitalObj[hospitalId] = {name: idMap[hospitalId].name, trust: idMap[hospitalId].trust};
                            }
                        }
                        
                        news.$('#nhswinter_tracker_form_select_nearest_hospital').html(selectInnerHtml).parent().removeClass('nhswinter_tracker_form_select_nearest_hospital_hide');
                        
                    } else {
                        var nations = {
                            'Wales': 'http://www.bbc.co.uk/news/health-30414705',
                            'Scotland': 'http://www.bbc.co.uk/news/health-30414699',
                            'NorthernIreland': 'http://www.bbc.co.uk/news/health-30415390'
                        }
                        var country = data.response.metadata.location.admin1.name || null;
                        top.location.href = nations[country.split(' ').join('')];

                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                },
                timeout: 3000
            });
                
        } else if (criteria === 'nearest_hospital') {
            var hospitalId = $('#nhswinter_tracker_form_select_nearest_hospital').val();
            news.pubsub.emit('nhswinter_tracker:locationResolution:success', [{nhsTrustCode: nearestHospitalObj[hospitalId].trust, organisationName: nearestHospitalObj[hospitalId].name}]);
        }
        
    }
    
    function hospitalHasAandE(hospitalCode) {
        return (hospitalsWithoutAandEDepartment.join('_').indexOf(hospitalCode) === -1) ? true: false;
    }
    
    return {
        getLocationDetail: locationDetail
    };
    
});