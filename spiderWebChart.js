/*jslint browser*/

var SpiderWebChart = (function (a) {
    "use strict";
    var svgNS = "http://www.w3.org/2000/svg";
    var svg;
    var options = {};
    var my = {};

    function updateOffset(offset, index, oldRadius, newRadius) {
        var newOffset = {
            x: offset.x + 140,
            y: index * 3.2 * newRadius + 3.4 * oldRadius
        };
        return newOffset;
    }

    function drawCircle(cx, cy, r) {
        var circle = a.createElementNS(svgNS, "circle");
        circle.style.stroke = options.circles.style.stroke;
        circle.style.fill = options.circles.style.fill;
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);
        svg.appendChild(circle);
    }

    function drawScale(x, y, r, i, fontSize, vOffset) {
        var tn = a.createTextNode(i * 100 / options.circles.number);
        var text = a.createElementNS(svgNS, "text");
        text.appendChild(tn);
        text.style.fontSize = fontSize;
        text.style.fill = options.circles.style.color;
        text.setAttribute("x", x + 2);
        text.setAttribute("y", y - r + vOffset);
        svg.appendChild(text);
    }

    function drawTitle(title, offset) {
        var txt = a.createElementNS(svgNS, "text");
        var tn = a.createTextNode(title);
        txt.appendChild(tn);
        txt.setAttribute("x", offset.x);
        txt.setAttribute("y", offset.y);
        txt.setAttribute("class", "title");
        txt.style.fontSize = options.title.style.fontSize;
        txt.style.fill = options.title.style.color;
        svg.appendChild(txt);
    }

    function drawAnnotation(text) {
        var annotation = a.createElementNS(svgNS, "text");
        var tn = a.createTextNode(text);
        annotation.appendChild(tn);
        annotation.style.fill = options.annotations.style.color;
        return annotation;
    }

    function drawPolygon(points, style) {
        var polygon = a.createElementNS(svgNS, "polygon");
        polygon.style.fill = style.fill;
        polygon.style.stroke = style.stroke;
        polygon.setAttribute("points", points);
        svg.appendChild(polygon);
    }

    function drawLine(x1, y1, x2, y2) {
        var line = a.createElementNS(svgNS, "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.style.stroke = options.lines.color;
        svg.appendChild(line);
    }

    function drawSquare(x, y, l) {
        var square = a.createElementNS(svgNS, "rect");
        square.setAttribute("x", x);
        square.setAttribute("y", y);
        square.setAttribute("width", l);
        square.setAttribute("height", l);
        square.style.stroke = options.circles.style.stroke;
        square.style.fill = options.circles.style.fill;
        svg.appendChild(square);
    }

    function drawColumn(x, y, w, h, style) {
        var column = a.createElementNS(svgNS, "rect");
        column.setAttribute("x", x);
        column.setAttribute("y", y);
        column.setAttribute("width", w);
        column.setAttribute("height", h);
        column.style.fill = style.fill;
        column.style.stroke = style.stroke;
        svg.appendChild(column);
    }

    my.makeColumnChart = function (data, offset, r, title) {
        var x = 0.5 * r + offset.x;
        var y = 0.25 * r + offset.y;
        var i = options.circles.number;
        var leftScaleOffset = x + r / 8;
        var topScaleOffset = y + 0.9 * 2 * r;
        var scaleVector = 0.8 * 2 * r / options.circles.number;

        drawTitle(title, offset);
        drawSquare(x, y, 2 * r);

        while (i >= 0) {
            drawScale(leftScaleOffset, topScaleOffset, i * scaleVector, i, (r / 10) + "px", r / 30);
            i -= 1;
        }

        data.studentResults.forEach(function (element, index) {
            var subcategoryResults = element.UnderKategoriBesvarelser;
            var avgElement = data.averageResults[index];
            var annotation = drawAnnotation(element.Titel);
            var textHeight = parseInt(options.annotations.style.fontSize, 10);
            var maxHeight = 0.8 * 2 * r;
            var annotationOffset = {
                x: x + (index + 1) * 2 * r / (data.studentResults.length + 1),
                y: y + 2 * r
            };

            annotation.setAttribute("x", annotationOffset.x);
            annotation.setAttribute("y", annotationOffset.y - 0.1 * r);
            annotation.setAttribute("transform", "translate(-" + textHeight + ") rotate(45 " + annotationOffset.x + " " + annotationOffset.y + ")");

            svg.appendChild(annotation);

            var columnWidth = r / 4;
            var columnLength = element.ProcentKorrekt * maxHeight / 100;
            var avgColumnLength = avgElement.Procentkorrekt * maxHeight / 100;
            var chartBottom = annotationOffset.y - 0.1 * 2 * r;

            drawColumn(annotationOffset.x - columnWidth - r / 36, chartBottom - columnLength, columnWidth, columnLength, options.series[0].style);
            drawColumn(annotationOffset.x + r / 36, chartBottom - avgColumnLength, columnWidth, avgColumnLength, options.series[1].style);

            if (subcategoryResults !== undefined && subcategoryResults.length !== 0) {
                var newRadius = 2 * r / 3;
                var newOffset = updateOffset(offset, index, r, newRadius);
                var innerData = {
                    studentResults: subcategoryResults,
                    averageResults: avgElement.SummeretUnderkategoriBesvarelser
                };
                if (subcategoryResults.length < 3) {
                    my.makeColumnChart(innerData, newOffset, newRadius, element.Titel);
                } else {
                    my.makeSpiderweb(innerData, newOffset, newRadius, element.Titel);
                }
            }

        });
    };

    my.makeSpiderweb = function (data, offset, r, title) {
        var cx = 1.5 * r + offset.x;
        var cy = 1.5 * r + offset.y;
        var i = options.circles.number;
        while (i !== 0) {
            drawCircle(cx, cy, i * r / options.circles.number);
            drawScale(cx, cy, i * r / options.circles.number, i, (r / 10) + "px", r / 30);
            i -= 1;
        }

        drawTitle(title, offset);
        var points = [];
        var avgPoints = [];

        data.studentResults.forEach(function (element, index) {
            var subcategoryResults = element.UnderKategoriBesvarelser;
            var avgElement = data.averageResults[index];
            var rad = index * 2 * Math.PI / data.studentResults.length - Math.PI / 2;
            var annotation = drawAnnotation(element.Titel);

            svg.appendChild(annotation);

            var textLength = annotation.getComputedTextLength();
            var textHeight = parseInt(options.annotations.style.fontSize, 10);
            var annotationDist = r + textLength / 2 + options.annotations.style.padding;
            var annotationOffset = {
                x: cx + annotationDist * Math.cos(rad) - textLength / 2,
                y: cy + annotationDist * Math.sin(rad) + textHeight / 4
            };

            annotation.setAttribute("x", annotationOffset.x);
            annotation.setAttribute("y", annotationOffset.y);

            drawLine(cx, cy, cx + r * Math.cos(rad), cy + r * Math.sin(rad));

            var resultDist = r * element.ProcentKorrekt / 100;
            var averageDist = r * avgElement.Procentkorrekt / 100;

            points.push([cx + resultDist * Math.cos(rad), cy + resultDist * Math.sin(rad)]);
            avgPoints.push([cx + averageDist * Math.cos(rad), cy + averageDist * Math.sin(rad)]);

            if (subcategoryResults !== undefined && subcategoryResults.length !== 0) {
                var newRadius = 2 * r / 3;
                var newOffset = updateOffset(offset, index, r, newRadius);
                var innerData = {
                    studentResults: subcategoryResults,
                    averageResults: avgElement.SummeretUnderkategoriBesvarelser
                };
                if (subcategoryResults.length < 3) {
                    my.makeColumnChart(innerData, newOffset, newRadius, element.Titel);
                } else {
                    my.makeSpiderweb(innerData, newOffset, newRadius, element.Titel);
                }
            }
        });
        drawPolygon(points, options.series[0].style);
        drawPolygon(avgPoints, options.series[1].style);
    };

    function empty(svg) {
        while (svg.lastChild) {
            svg.removeChild(svg.lastChild);
        }
    }

    function drawColorBox(x, y, style) {
        var rectBackground = a.createElementNS(svgNS, "rect");
        var rectColor = a.createElementNS(svgNS, "rect");
        rectBackground.setAttribute("x", x);
        rectBackground.setAttribute("y", y);
        rectBackground.setAttribute("width", 50);
        rectBackground.setAttribute("height", 25);
        rectBackground.style.fill = "white";
        rectColor.setAttribute("x", x);
        rectColor.setAttribute("y", y);
        rectColor.setAttribute("width", 50);
        rectColor.setAttribute("height", 25);
        rectColor.style.stroke = style.stroke;
        rectColor.style.fill = style.fill;
        svg.appendChild(rectBackground);
        svg.appendChild(rectColor);
    }

    function drawLegendText(text, x, y, style) {
        var legendText = a.createElementNS(svgNS, "text");
        var tn = a.createTextNode(text);
        legendText.setAttribute("x", x);
        legendText.setAttribute("y", y);
        legendText.style.fill = style.color;
        legendText.appendChild(tn);
        svg.appendChild(legendText);
    }

    function drawLegend() {
        var top = options.baseOffset.y;
        var left = options.baseOffset.x + 3 * options.baseDiagram.r;
        options.series.forEach(function (element, index) {
            drawColorBox(left, top + index * 40, element.style);
            drawLegendText(element.title, left + 60, top + 20 + index * 40, options.legend.style);
        });
    }

    my.draw = function (data, opts) {
        svg = a.getElementById("spiderWebChart");
        empty(svg);
        options = opts;
        drawLegend();
        if (data.studentResults.length < 3) {
            my.makeColumnChart(data, options.baseOffset, options.baseDiagram.r, options.title.text);
        } else {
            my.makeSpiderweb(data, options.baseOffset, options.baseDiagram.r, options.title.text);
        }

        var bBox = svg.getBBox();
        svg.style.height = (bBox.height + 50) + "px"; // 50px extra padding, da Mozilla Firefox ikke viser den nederste tekst.
        svg.style.width = "100%";
    };

    return {
        draw: my.draw
    };
}(document));
