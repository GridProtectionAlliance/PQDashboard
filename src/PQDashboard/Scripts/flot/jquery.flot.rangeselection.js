/*
 * Flot plugin for selecting a range in a graph by moving/resizing a selection area on a second graph
 *
 * Version 1.3
 *
 * Released under the MIT license by Troels Bang Jensen, August 2012
 * @author Andreas Goetz <cpuidle@gmx.de>
 *
 * Version history:
 *
 * 1.0 Initial version
 * 1.1 Fixed some cursor issues on leaving the graph and selecting handles at the ends of the graph.
 * 1.2 Limit cursor style to canvas element to avoid hanging cursor style in the rest of the document.
 * 1.3 Added:
 *   - selection configuration options
 *   - setSelection API function
 *   - code cleanup
 */

(function ($) {

    function init(plot) {

        // Internal variables
        var rangeselection = {
            start: null,
            end: null,
            active: false,
            moveStart: 0,
            movex: 0,
            handle: "",
            color: "#fbb",
            borderWidth: 3,
            borderRadius: 3,
            fixedWidth: false,
            noOffset: false

        };

        var savedhandlers = {},
            mouseUpHandler = null,
            mouseFuzz = 5;

        function onMouseMove(e) {
            var o = plot.getOptions();
            if (!o.rangeselection.enabled) {
                plot.getPlaceholder().css('cursor', 'auto');
                return true;
            }

            var offset = plot.getPlaceholder().offset(),
                plotOffset = plot.getPlotOffset(),
                realX = e.pageX - offset.left - plotOffset.left,
                realY = e.pageY - offset.top - plotOffset.top;

            if (realX < 0 || realY < 0) {
                plot.getPlaceholder().css('cursor', 'auto');
                return false;
            }

            var x = clamp(0, realX, plot.width());

            if (!rangeselection.active) {
                var xaxis = plot.getAxes().xaxis,
                    f = xaxis.p2c(rangeselection.start),
                    s = xaxis.p2c(rangeselection.end),
                    tolerance = mouseFuzz;

                if (Math.abs(f - x) < tolerance && f >= 0 && !o.rangeselection.fixedWidth) {
                    plot.getPlaceholder().css('cursor', 'w-resize');
                } else if (Math.abs(s - x) < tolerance && s <= plot.width()) {
                    plot.getPlaceholder().css('cursor', 'e-resize' && !o.rangeselection.fixedWidth);
                } else if (x > f && x < s) {
                    plot.getPlaceholder().css('cursor', 'move');
                } else {
                    plot.getPlaceholder().css('cursor', 'auto');
                }

                return false;
            }

            rangeselection.movex = x;
            plot.triggerRedrawOverlay();

            return false;
        }

        function onMouseDown(e) {
            var o = plot.getOptions();
            if (!o.rangeselection.enabled)
                return;
            if (e.which != 1) // Only accept left-clicks
                return;

            // Cancel out any text selections
            document.body.focus();

            // prevent text selection and drag in old-school browsers
            if (document.onselectstart !== undefined && savedhandlers.onselectstart == null) {
                savedhandlers.onselectstart = document.onselectstart;
                document.onselectstart = function () {
                    return false;
                };
            }
            if (document.ondrag !== undefined && savedhandlers.ondrag == null) {
                savedhandlers.ondrag = document.ondrag;
                document.ondrag = function () {
                    return false;
                };
            }

            var offset = plot.getPlaceholder().offset(),
                plotOffset = plot.getPlotOffset(),
                x = clamp(0, e.pageX - offset.left - plotOffset.left, plot.width()),
                xaxis = plot.getAxes().xaxis,
                f = xaxis.p2c(rangeselection.start),
                s = xaxis.p2c(rangeselection.end),
                tolerance = mouseFuzz;

            if (Math.abs(f - x) <= tolerance && !o.rangeselection.fixedWidth) {
                plot.getPlaceholder().css('cursor', 'w-resize');
                rangeselection.handle = "start";
                rangeselection.active = true;
            }
            else if (Math.abs(s - x) <= tolerance && !o.rangeselection.fixedWidth) {
                plot.getPlaceholder().css('cursor', 'e-resize');
                rangeselection.handle = "end";
                rangeselection.active = true;
            }
            else { // if(x > f && x < s)
                plot.getPlaceholder().css('cursor', 'move');
                rangeselection.handle = "move";
                if (o.rangeselection.noOffset)
                    rangeselection.moveStart = f;
                else
                    rangeselection.moveStart = s - (s - f) / 2;
                rangeselection.active = true;
            }

            mouseUpHandler = onMouseUp;
            $(document).one("mouseup", mouseUpHandler);
        }

        function onMouseUp(e) {
            var o = plot.getOptions();
            if (!o.rangeselection.enabled)
                return true;

            mouseUpHandler = null;
            plot.getPlaceholder().css('cursor', 'auto');
            rangeselection.active = false;

            var offset = plot.getPlaceholder().offset(),
                plotOffset = plot.getPlotOffset(),
                x = clamp(0, e.pageX - offset.left - plotOffset.left, plot.width()),
                xaxis = plot.getAxes().xaxis,
                f = xaxis.p2c(rangeselection.start),
                s = xaxis.p2c(rangeselection.end);

            switch (rangeselection.handle) {
                case "start":
                    f = clamp(0, x, s - 10);
                    break;
                case "end":
                    s = clamp(f + 10, x, plot.width());
                    break;
                case "move":
                    var dx = x - rangeselection.moveStart;
                    if (f + dx < 0) {
                        s -= f;
                        f = 0;
                    } else if (s + dx > plot.width()) {
                        f = plot.width() - (s - f);
                        s = plot.width();
                    } else {
                        s += dx;
                        f += dx;
                    }
                    break;
            }

            rangeselection.start = xaxis.c2p(f);
            rangeselection.end = xaxis.c2p(s);
            plot.triggerRedrawOverlay();

            if (o.rangeselection.callback && typeof (o.rangeselection.callback) === "function") {
                o.rangeselection.callback({
                    start: rangeselection.start,
                    end: rangeselection.end
                });
            }

            return false;
        }

        function clamp(min, value, max) {
            return value < min ? min : (value > max ? max : value);
        }

        function roundedRect(ctx, x, y, w, h, radius, fill, stroke) {
            ctx.save(); // save the context so we don't mess up others

            var r = x + w,
                b = y + h;

            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(r - radius, y);
            ctx.quadraticCurveTo(r, y, r, y + radius);
            ctx.lineTo(r, y + h - radius);
            ctx.quadraticCurveTo(r, b, r - radius, b);
            ctx.lineTo(x + radius, b);
            ctx.quadraticCurveTo(x, b, x, b - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.stroke();

            if (fill) {
                ctx.fill();
            }
            if (stroke) {
                ctx.stroke();
            }

            ctx.restore(); // restore context to what it was on entry
        }

        function drawSelection(plot, ctx, start, end) {
            var o = plot.getOptions(),
                plotOffset = plot.getPlotOffset();

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            var c = $.color.parse(o.rangeselection.color);
            ctx.strokeStyle = c.scale('a', 0.9).toString();
            ctx.fillStyle = c.scale('a', 0.4).toString();
            ctx.lineWidth = o.rangeselection.borderWidth;

            var xaxis = plot.getAxes().xaxis,
                f = xaxis.p2c(start),
                s = xaxis.p2c(end),
                x = f,
                y = 0,
                w = s - f,
                h = plot.height();

            if (o.rangeselection.borderRadius) {
                ctx.lineJoin = "round";
                roundedRect(ctx, x, y, w, h, o.rangeselection.borderRadius, true, true);
            }
            else {
                ctx.fillRect(x, y, w, h);
            }

            ctx.restore();
        }

        // allow to set selection when detail chart zoom changes
        function setSelection(from, to) {
            rangeselection.start = from;
            rangeselection.end = to;

            // and plot
            plot.triggerRedrawOverlay();
        }

        plot.hooks.bindEvents.push(function (plot, eventHolder) {
            var o = plot.getOptions();
            eventHolder.mousemove(onMouseMove);
            eventHolder.mousedown(onMouseDown);
        });

        plot.hooks.draw.push(function (plot, ctx) {
            plot.triggerRedrawOverlay();
        });

        plot.hooks.drawOverlay.push(function (plot, ctx) {
            var o = plot.getOptions();
            if (!o.rangeselection.enabled)
                return;

            if (rangeselection.active) {
                var xaxis = plot.getAxes().xaxis;

                var x = rangeselection.movex;
                var f = xaxis.p2c(rangeselection.start);
                var s = xaxis.p2c(rangeselection.end);

                switch (rangeselection.handle) {
                    case "start":
                        f = x;
                        if (x < 0)
                            f = 0;
                        if (x > s - 10)
                            f = s - 10; // Minimum size of selection
                        break;
                    case "end":
                        s = x;
                        if (x > plot.width())
                            s = plot.width();
                        if (x < f + 10)
                            s = f + 10; // Minimum size of selection
                        break;
                    case "move":
                        var dx = x - rangeselection.moveStart;
                        if (f + dx < 0) {
                            s -= f;
                            f = 0;
                        } else if (s + dx > plot.width()) {
                            f = plot.width() - (s - f);
                            s = plot.width();
                        } else {
                            s += dx;
                            f += dx;
                        }
                        break;
                }
                ctx.clearRect(0, 0, plot.width(), plot.height());
                drawSelection(plot, ctx, xaxis.c2p(f), xaxis.c2p(s));
                return;
            }

            var series, data;

            if (rangeselection.end === null) {
                if (o.rangeselection.end === null) {
                    series = plot.getData();
                    data = series[0].data;
                    rangeselection.end = (data.length) ? data[data.length - 1][0] : 0;
                } else {
                    rangeselection.end = o.rangeselection.end;
                }
            }

            if (rangeselection.start === null) {
                if (o.rangeselection.start === null) {
                    series = plot.getData();
                    data = series[0].data;
                    var date = new Date(rangeselection.end);
                    if (date.getMonth() > 0) {
                        date.setMonth(date.getMonth() - 1);
                    } else {
                        date.setYear(date.getYear() - 1);
                        date.setMonth(11);
                    }
                    if (data.length && (data[0][0] > date.valueOf())) {
                        rangeselection.start = data[0][0];
                    } else {
                        rangeselection.start = date.valueOf();
                    }
                } else {
                    rangeselection.start = o.rangeselection.start;
                }
            }

            drawSelection(plot, ctx, rangeselection.start, rangeselection.end);
        });

        plot.hooks.shutdown.push(function (plot, eventHolder) {
            eventHolder.unbind("mousemove", onMouseMove);
            eventHolder.unbind("mousedown", onMouseDown);
            if (mouseUpHandler) {
                $(document).unbind("mouseup", mouseUpHandler);
            }
        });

        // register functions
        plot.setSelection = setSelection;
    }

    $.plot.plugins.push({
        init: init,
        options: {
            rangeselection: {
                color: "#f88",
                start: null,
                enabled: false,
                end: null,
                callback: null
            }
        },
        name: 'rangeselector',
        version: '1.3'
    });

})(jQuery);