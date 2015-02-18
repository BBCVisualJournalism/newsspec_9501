define(["lib/news_special/bootstrap"],  function (news) {
    var $ = news.$,
        chart,
        canvas = ".nhswinter_tracker_chart_graph",
        canvasWidth,
        canvasHeight,
        heightScale,
        chartLabelsWidth = 50,
        chartBarWidth,
        leftMostBarOffsetLeft,
        trustsWithNoData = [];
    
    function init(dataSet, nhsTrustCode) {
        if (trustsWithNoData.join('').indexOf(nhsTrustCode) >= 0) { return; }
        
        if (!news.svgSupport) {
            $(canvas).css("display", "none").siblings().css("display", "none");
            return;
        }

        var  weekPerformanceData = dataSet['week_performance_chart'];

        require(["lib/vendors/d3"], function (d3) {
            var dataMin = weekPerformanceData[0][1],
                dataMax = weekPerformanceData[weekPerformanceData.length - 1][1],
                belowTargetCount = 0;

            canvasWidth = $(canvas).width();
            canvasHeight = $(canvas).height();
            heightScale = d3.scale.linear().domain([dataMin - 2, dataMax]).range([0, canvasHeight]);
            chartBarWidth = (canvasWidth - chartLabelsWidth) / weekPerformanceData.length;

            if ($(canvas).find("svg")) {
                $(canvas).find("svg").remove();
            }
            
            chart = d3.select(canvas).append("svg").attr({height: canvasHeight, width: canvasWidth}).append("g");

            chart.selectAll("rect").data(weekPerformanceData).enter().append("rect")
                .attr({
                    x: function (d, i) { return chartBarWidth * i; }, 
                    y: function (d) { if (d[1] < 95) { belowTargetCount++; } return canvasHeight - heightScale(d[1]); }, 
                    width: chartBarWidth, 
                    height: function (d, i) { return heightScale(d[1]); },
                    "class": function (d) { 
                        var performance = (d[1] < 95) ? "below_target ": "above_target ";
                        return "performance_bar " + performance + d[0]; 
                    }
                }).on("mouseover", function (d, i) {
                    var trustData = dataSet[d[0]];
                    var toolTipHtml = "<p class=\"nhswinter_tracker__tooltip_info\">" + trustData.name + "</p>" +
                                    "<p class=\"nhswinter_tracker__tooltip_info nhswinter_tracker__tooltip_info--figures\">Patients seen in 4 hours: <span>" + d[1] + "%</span></p>";

                    tooltip = news.$(".nhswinter_tracker__tooltip").removeClass("nhswinter_tracker__tooltip--hidden").addClass("nhswinter_tracker__tooltip--visible").html(toolTipHtml);
                    
                    d3.select(this).classed("nhswinter_tracker_chart--active_bar", true);
                })
                .on("mousemove", function (d, i) {
                    tooltipMousemove(this, i);
                })
                .on("mouseout", function () {
                    d3.select(this).classed("nhswinter_tracker_chart--active_bar", false);
                    news.$(".nhswinter_tracker__tooltip").removeClass("nhswinter_tracker__tooltip--visible").addClass("nhswinter_tracker__tooltip--hidden");
                });
                
            chart.append("text").text(dataMax + "%").attr({x: canvasWidth - chartLabelsWidth + getYLabelOffset(dataMax), y: 12, "class": "y-axis-label"});
            chart.append("text").text((dataMin) + "%").attr({x: canvasWidth - chartLabelsWidth + getYLabelOffset(dataMin), y: heightScale(100) - 12, "class": "y-axis-label"});
            
            leftMostBarOffsetLeft = $(canvas + " ." + weekPerformanceData[0][0]).position().left;
            $(".nhswinter_tracker_chart_key_below_target strong").text(belowTargetCount);
            $(".nhswinter_tracker_chart_key_above_target strong").text(weekPerformanceData.length - belowTargetCount);
            setActive(nhsTrustCode, d3);
        });
    }
    
    function tooltipMousemove(activeElement, barIndex) {
        var tooltip = news.$(".nhswinter_tracker__tooltip"),
            ypos = d3.mouse(activeElement)[1] - tooltip.height() + 36,
            xpos = d3.mouse(activeElement)[0],
            horizontalPosition,
            tooltipWidth = tooltip.outerWidth() + 12;
        
        if (xpos + tooltipWidth > canvasWidth) {
            horizontalPosition = "right: 0px;";
            horizontalPosition = "left: " + (xpos - tooltipWidth) + "px;";
        } else {
            horizontalPosition = "left: " + (xpos + 12) + "px;";
        }
        
        tooltip.attr("style", horizontalPosition + " top:" + ypos + "px");
    }


    function getYLabelOffset(val) {
        return (val.toString().length < 3) ? 5 : 2;
    }
    
    function setActive(name, d3) {
        d3.selectAll(".performance_bar").attr("style", "");
        d3.select("." + name).attr("style", "fill: #ea8a42; opacity: 0.7; filter: alpha(opacity=70)");
        
        var pointer = $(".nhswinter_tracker_chart_label__pointer"),
            chartLabel = $(".nhswinter_tracker_chart_label div"),
            activeBarLeftOffset = $(canvas +  " ." + name).addClass("active_target").position().left - leftMostBarOffsetLeft,
            chartLabelWidth = chartLabel.width();

        pointer.css("left", function () {
            var leftOffset = activeBarLeftOffset - halfOf(pointer.width()) + halfOf(chartBarWidth);
            
            if (leftOffset < 0) {
                leftOffset = halfOf(pointer.width());
            }
            return (16 + leftOffset) + "px";
        });
        
        chartLabel.css("left", function () {
            var leftOffset;
            
            if ((activeBarLeftOffset + chartLabelWidth) > canvasWidth) {
                leftOffset = canvasWidth - chartLabelWidth;
            } else if ((activeBarLeftOffset - halfOf(chartLabelWidth)) < 0) {
                leftOffset = 0;
            } else {
                leftOffset = activeBarLeftOffset - halfOf(chartLabelWidth) + halfOf(chartBarWidth);
            }
            return (16 + Math.floor(leftOffset)) + "px";
        });
    }
    
    function halfOf(value) {
        return value / 2;
    }
    
    return {
        init: init
    };
    
});