define(["lib/news_special/bootstrap"], function (news) {
    var $ = news.$,
        // d3 = news.d3,
        greyClass = "nhswinter_tracker_attendance_dotted_view_circle";

    var DotView = function (container) {
        this.container = container;
        // 82 is a random factor such that 976 wide canvas will have a line height of ~12
        this.lineHeight = this.getContainerWidth(container) / 82;
        // random optimum 
        this.dotRadius = this.canvasWidth / 325;
    };

    DotView.prototype.draw = function (totalArr) {

        if (!news.svgSupport) {
            $(this.container).css("display", "none");
            return;
        }
        var self = this;

        require(["lib/vendors/d3"], function (d3) {
            var total = totalArr[totalArr.length - 1], 
                positionIndex,
                lineIndex,
                countIndex = 0,
                lines = Math.ceil(total);
            
            if ($(self.container).find("svg")) {
                $(self.container).find("svg").remove();
            }
            
            self.chart = d3.select(self.container).append("svg").attr({ width: self.getContainerWidth(), height: Math.ceil(total / 100) * self.lineHeight });

            while (countIndex < total) {
                lineIndex = Math.floor(countIndex / 100);
                positionIndex = countIndex % 100;
                self.renderCircle(self.chart, lineIndex, positionIndex);
                countIndex++;
            }

            
            news.pubsub.on("nhswinter_tracker:scroll:itemActivated", function () {
                self.colorCirclesCheck(this.container);
            });
        });
    };

    DotView.prototype.renderCircle = function (chart, lineIndex, positionIndex) {
        var cx = (positionIndex * (this.getContainerWidth() / 100)) + this.dotRadius,
            cy = (lineIndex * this.lineHeight) + this.dotRadius;

        chart.append("circle").attr({
            //class: greyClass, #################################### @TODO: need this for animation
            cx: cx,
            cy: cy,
            r: this.dotRadius
        });
    };

    DotView.prototype.colorCirclesCheck = function () {
        /*
        var self = this;
        var listElement = news.$(container).parent().parent().parent();
        if (listElement.hasClass("nhswinter_tracker_results_active")) {
            self.colorCircles(container);
        }
        */
    };

    DotView.prototype.colorCircles = function () {
        var self = this;
        var circles = news.$(this.container).find("circle." + greyClass);
        if (circles.length > 0) {
            circles.first().attr("class", "");
            setTimeout(self.colorCircles(this.container), 10);
        }
    };
    
    DotView.prototype.getContainerWidth = function (container) {
        if (!arguments.length) {
            return this.canvasWidth;
        }
        this.canvasWidth = $(container).width();
        return this.canvasWidth;
    };

    return DotView;

});