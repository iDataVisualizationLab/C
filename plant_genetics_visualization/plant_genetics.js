const DataFrame = dfjs.DataFrame;


const wt_cols = ['wthp6_average', 'wtlp6_average', 'wthp5_average', 'wtlp5_average', 'wtal_average', 'wtfe_average'];
const all_cols = ['wthp6_average', 'wtlp6_average', 'wthp5_average', 'wtlp5_average', 'wtal_average', 'wtfe_average', 'stop1hp6_average', 'stop1lp6_average', 'stop1hp5_average', 'stop1lp5_average', 'stop1al_average', 's1fe_average'];
let num_obser = 896;
const names = {
    "atID": "month",
    "index": "year",
    "value": "unemployment",
    "gene": "state"
};

// let stateChartData;
async function filter() {
    const df = await DataFrame.fromCSV("data_SAMPLE_ori.csv").then(df => df);
    let button_list = d3.selectAll('.filter_button')[0];

    let cur_base_conditon = document.getElementById("stateComparisonOptions").value;
    let filteredDf = df;
    for (var i = 0, n = button_list.length; i < n; i++) {
        let bt = d3.select(button_list[i]);
        let col = wt_cols[i + 1];
        if (bt.style("background-color").toString() == color_arr[0]) {
            filteredDf = filteredDf;
        } else if (bt.style("background-color").toString() == color_arr[1]) {
            console.log("here");
            filteredDf = filteredDf
                .filter(row => row.get(cur_base_conditon) <= row.get(col));
            console.log("filteredDf", filteredDf.dim());
        } else {
            filteredDf = filteredDf
                .filter(row => row.get(cur_base_conditon) >= row.get(col));
        }
    }


    let my_all_data = {};
    all_cols.forEach((gene_name) => {
        let _df = filteredDf.select('atID', gene_name);
        _df = _df.rename("atID", names["atID"]).rename(gene_name, names["value"]);
        _df = _df.withColumn(names['index'], (row, i) => i + 1)
            .withColumn(names['gene'], () => gene_name);
        my_all_data[gene_name] = _df.toCollection();

    })


    let stateChartData = [];
    for (let state in my_all_data) {
        let d = {};
        d.state = state;
        d.series = my_all_data;
        stateChartData.push(d);
    }
    d3.select("#unemploymentCharts").selectAll("svg").data(stateChartData);
    num_obser = filteredDf.dim()[0];
    updateCharts(1, num_obser);
};


let color_arr = ["rgb(231, 231, 231)", "rgb(145, 207, 96)", "rgb(252, 141, 89)"]; // gray, blue, orange
$('.filter_button').click(function () {
    let cur_color = $(this).css("background-color").toString();
    let cur_index = color_arr.indexOf(cur_color);
    let nex_index = cur_index < color_arr.length - 1 ? cur_index + 1 : 0;
    $(this).css('background-color', color_arr[nex_index]);
    filter();
});


// Set up selection controls.
$(document.getElementsByName("comparison")).on("click", function () {
    var _this = this;
    if (_this.value == "state") {
        $("#stateComparisonOptions").attr("disabled", false);
        $(".yearComparisonOptions").attr("disabled", true);
        $(".timePeriodSelector").attr("disabled", false);
    } else if (_this.value == "years") {
        $("#stateComparisonOptions").attr("disabled", true);
        $(".yearComparisonOptions").attr("disabled", false);
        $(".timePeriodSelector").attr("disabled", true);
    } else {
        $("#stateComparisonOptions").attr("disabled", true);
        $(".yearComparisonOptions").attr("disabled", true);
        $(".timePeriodSelector").attr("disabled", false);
    }
});

function selectAll(_this) {
    checkboxes = document.getElementsByName(_this.name);
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].checked != _this.checked) {
            changeChartDisplay(checkboxes[i].id);
        }
    }
}


var fromYearSelection = d3.select("#fromYear");
var toYearSelection = d3.select("#toYear");
for (var i = 1; i <= num_obser; ++i) {
    fromYearSelection.append("option")
        .attr("value", i)
        .text(i);
    toYearSelection.append("option")
        .attr("value", i)
        .text(i);
}
var yearSelection1 = d3.select("#year1");
var yearSelection2 = d3.select("#year2");
for (var i = 1; i <= num_obser; ++i) {
    yearSelection1.append("option")
        .attr("value", i)
        .text(i);
    yearSelection2.append("option")
        .attr("value", i)
        .text(i);
}

// document.getElementById("toYear").value = num_obser;

//Width and height
var margin = {top: 15, right: 0, bottom: 20, left: 25};
var w = $("#unemploymentCharts").width() * 0.99 - margin.left - margin.right;
var h = 250 - margin.bottom - margin.top;
var svgHeight = h + margin.top + margin.bottom;
var svgWidth = w + margin.left + margin.right;


// Set up scales.
var x = d3.scale.linear().range([0, w]);
// var y = d3.scale.linear().range([h, 0]);
var y = d3.scale.linear().domain([0, 1]).range([h, 0]);

// Define the axes.
var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(7);
var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);


// Define the line.
var valueLine = d3.svg.line()
    .x(function (d) {
        return x(d.year);
    })
    .y(function (d) {
        return y(d.unemployment);
    });

var zeroLine = d3.svg.line()
    .x(function (d) {
        // console.log('yyy',x(d.year));
        return x(d.year);
    })
    .y(y(0));

// Define the area.
var valueArea = d3.svg.area()
    .x(function (d) {
        return x(d.year);
    })
    .y1(function (d) {
        return y(d.unemployment);
    });

var zeroArea = d3.svg.area()
    .x(function (d) {
        return x(d.year);
    })
    .y0(y(0))
    .y1(y(0));

var bisect = d3.bisector(function (d) {
    return d.year;
}).left;

DataFrame.fromCSV("data_SAMPLE_ori.csv").then(data => {
    let my_all_data = {};
    all_cols.forEach((gene_name) => {
        let df = data.select('atID', gene_name);
        df = df.rename("atID", names["atID"]).rename(gene_name, names["value"]);
        df = df.withColumn(names['index'], (row, i) => i + 1)
            .withColumn(names['gene'], () => gene_name);
        my_all_data[gene_name] = df.toCollection();

    });

    console.log(data);


    let stateChartData = [];
    for (let state in my_all_data) {
        let d = {};

        d.state = state;
        d.series = my_all_data;
        stateChartData.push(d);
    }

    var stateOptions = d3.select("#stateOptions");
    var stateComparisons = d3.select("#stateComparisonOptions");

    stateChartData.forEach(function (d) {
        var option = stateOptions
            .append("label")
            .datum(d.state);
        option.append("input")
            .attr("type", "checkbox")
            .property("checked", function (d) {
                return (d == "wthp6_average")
            })
            .attr("name", "stateSelection")
            .attr("id", removeWhitespace)
            .on("click", changeChartDisplay);
        option.append("text")
            .text(d.state);
        option.append("br");

        var comparison = stateComparisons.append("option")
            .datum(d.state)
            .attr("value", d.state)
            .text(d.state);

    });


    // re-Scale the range of the data
    x.domain(d3.extent([1, num_obser]));

    // y.domain([0, d3.max(data, function(d) { return d.unemployment; })]);


    // Create the svgs for the charts.
    let svgCharts = d3.select("#unemploymentCharts").selectAll("svg")
        .data(stateChartData)
        .enter()
        .append("svg")
        .style("display", "block")
        .attr("id", function (d) {
            return removeWhitespace(d.state);
        })
        .classed("chartActive", function (d) {
            return d.state == "wthp6_average";
        })
        .attr("width", svgWidth)
        .attr("height", function (d) {
            if (d.state == "wthp6_average") {
                return svgHeight;
            } else {
                return 0;
            }
        })
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var defs = svgCharts.append("defs");

    // Add background.
    svgCharts.append("rect")
        .attr("transform", "translate(0,-" + margin.top + ")")
        .attr("width", w)
        .attr("height", h + margin.top + margin.bottom)
        .attr("fill", "white");

    // Side clip-path.
    defs.append("clipPath")
        .attr("id", "sideClip")
        .append("rect")
        .attr("transform", "translate(0,-" + margin.top + ")")
        .attr("width", w)
        .attr("height", h + margin.top);

    // Add the baseline.
    svgCharts.append("path")
        .attr("clip-path", "url(#sideClip)")
        .attr("class", "baseline")
        .attr("d", (d) => {
            return zeroLine(d.series[d.state]);
        });

    // Add the areas.
    svgCharts.append("path")
        .attr("clip-path", "url(#sideClip)")
        .attr("class", "area below")
        .attr("fill", "steelblue")
        .attr("d", function (d) {
            return zeroArea(d.series[d.state]);
        });

    svgCharts.append("path")
        .attr("clip-path", "url(#sideClip)")
        .attr("class", "area above")
        .attr("d",
            d => {
                // console.log(d);
                zeroArea(d.series[d.state]);
            }
        );

// Area gets drawn in updateCharts()

// Draw the axes.
    svgCharts.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")

// text label for the x axis
    svgCharts.append("text")
        .attr("transform",
            "translate(" + (w) + " ," +
            (h + margin.top) + ")")
        .style("text-anchor", "end")
        .text("Gene");


    svgCharts.append("g")
        .attr("class", "y axis");

// Add y-axis label.
    svgCharts.append("text")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Value (norm)");


// Add focus circle and value.
    var focus = svgCharts.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 3.5);

    focus.append("text")
        .attr("x", 9)
        .attr("y", -5)
        .attr("dy", ".35em");

    svgCharts.append("text")
        .datum(function (d) {
            return d.state;
        })
        .attr("x", w)
        .attr("y", 0)
        .attr("text-anchor", "end")
        .style("font", "20px Arial")
        .attr("fill", "#888")
        .text(function (d) {
            return d;
        });

// Register mouse handlers.
    svgCharts.on("mouseover", function (d) {
        // d3.select("#usMap").select("#" + removeWhitespace(d.state))
        //   .classed("chartHover", true);
        var focus = d3.select(this).select(".focus");
        focus.style("display", null);
    })
        .on("mouseout", function (d) {
            // d3.select("#usMap").select("#" + removeWhitespace(d.state))
            //   .classed("chartHover", false);
            var focus = d3.select(this).select(".focus");
            focus.style("display", "none");
        })
        .on("mousemove", mousemove)
        .on("dblclick", function (d) {
            changeChartDisplay(d.state);
        });

    function mousemove(d) {
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = bisect(d.series[d.state], x0, 1);
        var d0 = d.series[d.state][i - 1];
        var d1 = d.series[d.state][i];

        var d_new = x0 - d0.year > d1.year - x0 ? d1 : d0;
        var lineElement = d3.select(this).select(".baseline").node();
        var BBox = lineElement.getBBox();
        var pathLength = lineElement.getTotalLength();
        var scale = pathLength / BBox.width;
        var mouse = d3.mouse(this);
        var beginning = 0, end = lineElement.getTotalLength(), target = null;
        while (true) {
            target = Math.floor((beginning + end) / 2);
            pos = lineElement.getPointAtLength(target);
            if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                break;
            }
            if (pos.x > mouse[0]) end = target;
            else if (pos.x < mouse[0]) beginning = target;
            else break; //position found
        }

        var focus = d3.select(this).select(".focus");
        if (x0 > w / 2) {
            focus.select("text").attr("x", -0);
            focus.select("text").attr("text-anchor", "end");
        } else {
            focus.select("text").attr("x", 0);
            focus.select("text").attr("text-anchor", "start");
        }
        focus.attr("transform", "translate(" + pos.x + "," + pos.y + ")");
        focus.select("text").text((d_new.month + ": " + d_new.unemployment));

    }

    updateCharts();
    //
    // d3.select("#updateCharts")
    //     .on("click", function (d) {
    //         updateCharts(1, num_obser)
    //     });


});



d3.select("#stateComparisonOptions").on("change", () =>
    updateCharts(1, num_obser));

d3.select("#comparisonOptions").on("change", () =>
    updateCharts(1, num_obser));


function removeWhitespace(str) {
    return str.replace(/\s+/g, '');
}

function changeChartDisplay(d) {
    var id = d.replace(/\s+/g, '');
    var stateChart = d3.select("#unemploymentCharts")
        .select("#" + id);

    var stateCheckBox = d3.select("#stateOptions").select("#" + id);
    var active = stateChart.classed("chartActive");

    console.log("changeChartDisplay.......");
    if (!active) {
        stateCheckBox.property("checked", true);
        stateChart.transition().duration(400)
            .attr("height", svgHeight)
            .attr("opacity", 1);

    } else {
        stateCheckBox.property("checked", false);
        stateChart.transition().duration(400)
            .attr("height", 0)
            .attr("opacity", 0);
    }
    stateChart.classed("chartActive", !active);
    // stateMap.classed("active", !active);
    // stateMap.classed("inactive", active);
}

function updateChartNoComparison(d, fromYear, toYear) {
    this.select(".area.below")
        .attr("fill", "steelblue")
        .attr("d", function (d) {
            return valueArea.y0(y(0))(d.series[d.state]);
        });

    this.select(".area.above")
        .attr("d", function (d) {
            return zeroArea.y0(y(0))(d.series[d.state]);
        });

    this.select(".baseline")
        .attr("d", function (d) {
            return valueLine(d.series[d.state]);
        });

    // console.log("d.series[d.state]", d.series[d.state])

    this.select(".x.axis")
        .call(xAxis);

    this.select(".y.axis")
        .call(yAxis);
}

function updateChartStateComparison(d, fromYear, toYear) {
    var comparedState = document.getElementById("stateComparisonOptions").value;

    // Update areas.
    this.select(".area.below")
        .attr("fill", "rgb(145,207,96)")
        .attr("d", function (d) {
            var y0 = function (a, i) {
                return y(d3.min([d.series[comparedState][i].unemployment, d.series[d.state][i].unemployment]));
            };
            return valueArea.y0(y0)(d.series[d.state]);
        });
    this.select(".area.above")
        .attr("d", function (d) {
            var y0 = function (a, i) {
                return y(d3.max([d.series[comparedState][i].unemployment, d.series[d.state][i].unemployment]));
                //return y(d.series[comparedState][i].unemployment);
            };
            return valueArea.y0(y0)(d.series[d.state]);
        });

    this.select(".baseline")
        .attr("d", function (d) {
            return valueLine(d.series[d.state]);
        });

    this.select(".x.axis")
        .call(xAxis);

    this.select(".y.axis")
        .call(yAxis);
}

function updateCharts(fromYear = 1, toYear = 896) {

    x.domain([fromYear, toYear]);

    // Update the charts.
    var activeCharts = d3.select("#unemploymentCharts").selectAll(".chartActive");
    var allCharts = d3.select("#unemploymentCharts").selectAll("svg");
    var inactiveCharts = allCharts.filter(function (obj) {
        return !activeCharts[0].some(function (obj2) {
            return removeWhitespace(obj.state) == obj2.id;
        });
    });


    if (document.getElementById("noComparison").checked) {
        // No comparison selected.
        activeCharts[0].forEach(function (d, i, array) {
            // If the chart is active, transition.  Otherwise, don't.
            if (array[i].id == array[array.length - 1].id) {
                d3.select(d)
                    .transition().duration(400)
                    .call(updateChartNoComparison, fromYear, toYear)
                    .each("end", function (a) {
                        inactiveCharts[0].forEach(function (d) {
                            d = d3.select(d);
                            d.call(updateChartNoComparison, fromYear, toYear);
                        });
                    });

            } else {
                d3.select(d)
                    .transition().duration(400)
                    .call(updateChartNoComparison, fromYear, toYear);
            }
        });
    } else if (document.getElementById("stateComparison").checked) {
        // State comparisons selected.
        activeCharts[0].forEach(function (d, i, array) {
            // If the chart is active, transition.  Otherwise, don't.
            if (array[i].id == array[array.length - 1].id) {
                d3.select(d)
                    .transition().duration(400)
                    .call(updateChartStateComparison, fromYear, toYear)
                    .each("end", function (a) {
                        inactiveCharts[0].forEach(function (d) {
                            d = d3.select(d);
                            d.call(updateChartStateComparison, fromYear, toYear);
                        });
                    });

            } else {
                d3.select(d)
                    .transition().duration(400)
                    .call(updateChartStateComparison, fromYear, toYear);
            }
        });
    } else {
        // Year comparisons selected.
        activeCharts[0].forEach(function (d, i, array) {
            // If the chart is active, transition.  Otherwise, don't.
            if (array[i].id == array[array.length - 1].id) {
                d3.select(d)
                    .transition().duration(400)
                    .call(updateChartYearComparison, fromYear, toYear)
                    .each("end", function (a) {
                        inactiveCharts[0].forEach(function (d) {
                            d = d3.select(d);
                            d.call(updateChartYearComparison, fromYear, toYear);
                        });
                    });

            } else {
                d3.select(d)
                    .transition().duration(400)
                    .call(updateChartYearComparison, fromYear, toYear);
            }
        });
    }
}