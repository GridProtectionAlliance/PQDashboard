//******************************************************************************************************
//  HighchartsYAxisZeroAlign.js - Gbtc
//
//==================================================================
//  Copyright © 2014 Electric Power Research Institute, Inc. 
//  The embodiments of this Program and supporting materials may be ordered from:
//                Electric Power Software Center (EPSC)
//                9625 Research Drive
//                Charlotte, NC 28262 USA
//                Phone: 1-800-313-3774
//                Email: askepri@epri.com
//  THIS NOTICE MAY NOT BE REMOVED FROM THE PROGRAM BY ANY USER THEREOF.
//==================================================================
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  11/14/2014 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************

$(function () {
    (function (H) {
        var each = H.each;
        H.wrap(H.Chart.prototype, 'adjustTickAmounts', function (proceed) {
            var ticksBelowThreshold = 0,
                ticksAboveThreshold = 0;
            if (this.options.chart.alignThresholds) {
                each(this.yAxis, function (axis) {
                    var threshold = axis.series[0] && axis.series[0].options.threshold || 0,
                        index = axis.tickPositions && axis.tickPositions.indexOf(threshold);

                    if (index !== undefined && index !== -1) {
                        axis.ticksBelowThreshold = index;
                        axis.ticksAboveThreshold = axis.tickPositions.length - index;
                        ticksBelowThreshold = Math.max(ticksBelowThreshold, index);
                        ticksAboveThreshold = Math.max(ticksAboveThreshold, axis.ticksAboveThreshold);
                    }
                });

                each(this.yAxis, function (axis) {

                    var tickPositions = axis.tickPositions;

                    if (tickPositions) {

                        if (axis.ticksAboveThreshold < ticksAboveThreshold) {
                            while (axis.ticksAboveThreshold < ticksAboveThreshold) {
                                tickPositions.push(
                                    tickPositions[tickPositions.length - 1] + axis.tickInterval
                                );
                                axis.ticksAboveThreshold++;
                            }
                        }

                        if (axis.ticksBelowThreshold < ticksBelowThreshold) {
                            while (axis.ticksBelowThreshold < ticksBelowThreshold) {
                                tickPositions.unshift(
                                    tickPositions[0] - axis.tickInterval
                                );
                                axis.ticksBelowThreshold++;
                            }

                        }
                        //axis.transA *= (calculatedTickAmount - 1) / (tickAmount - 1);
                        axis.min = tickPositions[0];
                        axis.max = tickPositions[tickPositions.length - 1];
                    }
                });
            } else {
                proceed.call(this);
            }

        })
    }(Highcharts));

});