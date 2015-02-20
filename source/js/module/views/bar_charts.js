define(["lib/news_special/bootstrap"],  function (news) {
    var $ = news.$,
        chart,
        weeklyData,
        englandData,
        ccgData,
        numberOfWeeks,
        chartWidth = 624,
        chartHeight,
        labelXDepth = 60,
        labelYWidth = 70,
        titleDepth = 20,
        graphWidth,
        graphHeight,
        that,
        WINTER_PRESSURES_START_DATE = "(3-9 Nov)",
        AEWEEKLY_SITREPS_START_DATE = "(3-9 Nov)",
        WINTER_PRESSURES_END_DATE = "(9-15 Feb)",
        AEWEEKLY_SITREPS_END_DATE = "(9-15 Feb)";

    var BarChart = function () {
        that = this;
        if (chartWidth > $("#nhswinter_app").width()) {
            chartWidth = $("#nhswinter_app").width();
        }

        chartHeight = chartWidth / 1.8;
        graphWidth = chartWidth - labelYWidth;
        graphHeight = chartHeight - (labelXDepth + titleDepth);
    };

    BarChart.prototype.setData = function (data, dataKey) {
        this.ccgData = data.ccg;
        this.englandData = data.england;
        this.numberOfWeeks = this.ccgData.length;
    };

    BarChart.prototype.renderChart = function () {
        if (!news.svgSupport) {
            return;
        }
        // require(["lib/vendors/d3"], function (d3) {
        this.xScale = d3.scale.ordinal().domain(this.ccgData.map(function (d, i) { return i; })).rangeRoundBands([0, graphWidth], 0.1);
        this.yScale = d3.scale.linear().domain([0, d3.max(this.englandData.concat(this.ccgData))]).range([graphHeight, 0]);

        this.xAxis = d3.svg.axis().scale(this.xScale).orient("bottom").tickFormat(function (d) { return d + 1; });
        this.yAxis = d3.svg.axis().scale(this.yScale).ticks(5).orient("left");

        if ($(this.container).find("svg")) {
            $(this.container).find("svg").remove();
        }

        this.chart = d3.select(this.container).append("svg").attr({width: chartWidth, height: chartHeight, "class": "nhswinter_tracker_comparison-charts"});

        this.ccgBars = this.chart.selectAll(".bar1").data(this.ccgData).enter();

        this.englandBars = this.chart.selectAll(".bar2").data(this.englandData).enter();

        this.ccgBars.append("rect").attr({
            "class": function (d, i) { return (i < that.numberOfWeeks - 1) ? "nhswinter_tracker_bar_your-hospital nhswinter_tracker_bar_faded": "nhswinter_tracker_bar_your-hospital"; },
            "x": function (d, i) { return that.xScale(i) + labelYWidth; },
            "y": function (d) { return chartHeight - labelXDepth; },
            "width": this.xScale.rangeBand() / 2,
            "height": function (d) { return graphHeight - that.yScale(d); },
            "transform": function (d) { return "translate(0,-" + (graphHeight - that.yScale(d)) + ")"; }
        });

        this.englandBars.append("rect").attr({
            "class": function (d, i) { return (i < that.numberOfWeeks - 1) ? "nhswinter_tracker_bar_national-average nhswinter_tracker_bar_faded": "nhswinter_tracker_bar_national-average"; },
            "x": function (d, i) { return labelYWidth + that.xScale(i) + that.xScale.rangeBand() / 2; },
            "y": function (d) { return chartHeight - labelXDepth; },
            "width": that.xScale.rangeBand() / 2,
            "height": function (d) { return graphHeight - that.yScale(d); },
            "transform": function (d) { return "translate(0,-" + (graphHeight - that.yScale(d)) + ")"; }
        });

        this.chart.append("g").attr({"transform": "translate(" + labelYWidth + "," + (chartHeight - labelXDepth) + ")", "class": "axis x-axis"}).call(this.xAxis);

        this.chart.append("g").attr({transform: "translate(" + labelYWidth + "," + titleDepth + ")", "y": 6, "dy": "-2em", "class": "axis y-axis"}).style("text-anchor", "end").call(this.yAxis);

        this.chart.append("text").text("Week").attr({x: function () { return ((graphWidth / 2) - (this.getComputedTextLength() / 2)) + labelYWidth; }, y: chartHeight - 1});
        this.chart.append("text").text(function () {
            //dates dont change
            return ("trolley_wait_4_to_12hrs_patients_waiting_over_4hrs_tobe_admitted".indexOf(that.container.substring(1)) >= 0) ? AEWEEKLY_SITREPS_START_DATE: WINTER_PRESSURES_START_DATE;
        }).attr({x: function () { return (that.xScale.rangeBand() / 2) + labelYWidth + that.xScale(0) - (this.getComputedTextLength() / 2); }, y: chartHeight - 22});

        this.chart.append("text").text(function () {
            return ("trolley_wait_4_to_12hrs_patients_waiting_over_4hrs_tobe_admitted".indexOf(that.container.substring(1)) >= 0) ? AEWEEKLY_SITREPS_END_DATE: WINTER_PRESSURES_END_DATE;
        }).attr({x: function () { return chartWidth - this.getComputedTextLength(); }, y: chartHeight - 22});
        
    };

    BarChart.prototype.draw = function (data, dataKey) {
        if (!news.svgSupport) {
            $("." + dataKey).css("display", "none").siblings().css("display", "none");
            return;
        }

        require(["lib/vendors/d3"], function (d3) {
            that.container = "." + dataKey;
            that.setData(data, dataKey);
            that.renderChart(that.container);
        });
    };

    return BarChart;
});