const DataFrame = dfjs.DataFrame;

let ipdatacsvTbl = document.getElementById('ipdatacsvTbl');
let curRowTb = document.getElementById('curRowTable');
let comparison_radio = $(document.getElementsByName("comparison"));
let svgCharts;
const wt_cols = ['wthp6', 'wtlp6', 'wthp5', 'wtlp5', 'wtal', 'wtfe'];
const s1_cols = ['s1hp6', 's1lp6', 's1hp5', 's1lp5', 's1al', 's1fe'];
const all_cols = ['wthp6', 'wtlp6', 'wthp5', 'wtlp5', 'wtal', 'wtfe', 's1hp6', 's1lp6', 's1hp5', 's1lp5', 's1al', 's1fe'];
let num_obser = 896;

let _df;
const names = {
    "atID": "month",
    "index": "year",
    "value": "unemployment",
    "gene": "state"
};

function selectAllCheckboxes() {
    let checkboxes = document.getElementsByName("stateSelection");
    let _this = document.getElementById("all");

    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].checked != _this.checked) {
            changeChartDisplay(checkboxes[i].id);
        }
    }
}


// let stateChartData;
async function filter() {
    const df = _df;
    let button_list = d3.selectAll('.wt_filter_btn')[0];

    let cur_base_conditon = document.getElementById("stateComparisonListdown").value;
    let filteredDf = df;
    for (var i = 0, n = button_list.length; i < n; i++) {
        let bt = d3.select(button_list[i]);
        let col = wt_cols[i + 1];
        if (bt.style("background-color").toString() == color_arr[0]) {
            filteredDf = filteredDf;
        } else if (bt.style("background-color").toString() == color_arr[1]) {
            filteredDf = filteredDf
                .filter(row => row.get(cur_base_conditon) <= row.get(col));
            console.log("cur_base_conditon = ", cur_base_conditon);
            console.log("col = ", col);
        } else {
            filteredDf = filteredDf
                .filter(row => row.get(cur_base_conditon) >= row.get(col));
        }
    }


    let my_all_data = {};
    all_cols.forEach((gene_name) => {
        let tmp_df = filteredDf.select('atID', gene_name);
        tmp_df = tmp_df.rename("atID", names["atID"]).rename(gene_name, names["value"]);
        tmp_df = tmp_df.withColumn(names['index'], (row, i) => i + 1)
            .withColumn(names['gene'], () => gene_name);
        my_all_data[gene_name] = tmp_df.toCollection();
    })


    let stateChartData = [];
    for (let state in my_all_data) {
        let d = {};
        d.state = state;
        d.series = my_all_data;
        stateChartData.push(d);
    }
    let tempSvg = d3.select("#unemploymentCharts").selectAll("svg").data(stateChartData, d => d.state);


    num_obser = filteredDf.dim()[0];
    updateCharts(1, num_obser);
    return filteredDf;
};


let color_arr = ["rgb(231, 231, 231)", "rgb(145, 207, 96)", "rgb(252, 141, 89)"]; // gray, blue, orange
$('.wt_filter_btn').click(function () {
    let cur_color = $(this).css("background-color").toString();
    let cur_index = color_arr.indexOf(cur_color);
    let nex_index = cur_index < color_arr.length - 1 ? cur_index + 1 : 0;
    $(this).css('background-color', color_arr[nex_index]);
    let filteredDf = filter().then(df => {
        updateTable(ipdatacsvTbl, df.toCollection());
        console.log(`df.shape = ${df.dim()}`);
    });
});

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

// Set up selection controls.
comparison_radio.on("click", function () {
    let _this = this;

    if (_this.value == "state") {
        $("#stateComparisonListdown").attr("disabled", false);
    } else {
        $("#stateComparisonListdown").attr("disabled", true);
    }
});

$("#all").on("click", selectAllCheckboxes);

$("#wt_ctrl_btn_id").on("click", (d) => {

    // Tick all wt_cols, except the first one\
    let checkboxes = document.getElementsByName("stateSelection");
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].id == "all") {
            document.getElementById("all").checked = false;
            console.log("Skip");
        } else {
            if (wt_cols.slice(1).includes(checkboxes[i].id)) {
                if (!checkboxes[i].checked) {
                    changeChartDisplay(checkboxes[i].id);
                }
            } else {
                if (checkboxes[i].checked) {
                    changeChartDisplay(checkboxes[i].id);
                }
            }
        }

    }

    // mark comparison
    sleep(700).then(() => {
        // $("#option_form").trigger("change");
        console.log("after .7 second");
        comparison_radio.prop("checked", true).trigger("click");
        $("#stateComparisonListdown").val("wthp6");
        updateCharts(1, num_obser);

    });
});

function get_responding_s1_from_wt(wt_name){
    return wt_name.replace("wt", "s1");
}

function get_responding_wt_from_s1(wt_name){
    return wt_name.replace("s1", "wt");
}


$("#s1_ctrl_btn_id").on("click", (d) => {
    // Tick all wt_cols, except the first one
    let checkboxes = document.getElementsByName("stateSelection");
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].id == "all") {
            document.getElementById("all").checked = false;
            console.log("Skip");
        } else {
            if (s1_cols.includes(checkboxes[i].id)) {
                if (!checkboxes[i].checked) {
                    changeChartDisplay(checkboxes[i].id);
                }
            } else {
                if (checkboxes[i].checked) {
                    changeChartDisplay(checkboxes[i].id);
                }
            }
        }
    }

    // mark comparison for s1
    sleep(700).then(() => {
        // $("#option_form").trigger("change");
        console.log("after .7 second");
        comparison_radio.prop("checked", true).trigger("click");
        $("#stateComparisonListdown").val("wthp6");
        updateCharts(1, num_obser, true);

    });
});

//Width and height
var margin = {top: 15, right: 0, bottom: 20, left: 25};
let w = $("#unemploymentCharts").width() * 0.99 - margin.left - margin.right;
let h = 200 - margin.bottom - margin.top;
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

DataFrame.fromCSV("data_SAMPLE_round.csv").then(data => {
    _df = data;
    let my_all_data = {};
    all_cols.forEach((gene_name) => {
        let df = data.select('atID', gene_name);
        df = df.rename("atID", names["atID"]).rename(gene_name, names["value"]);
        df = df.withColumn(names['index'], (row, i) => i + 1)
            .withColumn(names['gene'], () => gene_name);
        my_all_data[gene_name] = df.toCollection();

    });

    let stateChartData = [];
    for (let state in my_all_data) {
        let d = {};
        d.state = state;
        d.series = my_all_data;
        stateChartData.push(d);
    }

    var stateOptions = d3.select("#stateOptions");
    var stateComparisons = d3.select("#stateComparisonListdown");

    stateChartData.forEach(function (d) {
        var option = stateOptions
            .append("label")
            .datum(d.state);
        option.append("input")
            .attr("type", "checkbox")
            .property("checked", function (d) {
                return (d == "wthp6")
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
    svgCharts = d3.select("#unemploymentCharts").selectAll("svg")
        .data(stateChartData, d => d.state)
        .enter()
        .append("svg")
        .style("display", "block")
        .attr("id", function (d) {
            return removeWhitespace(d.state);
        })
        .classed("chartActive", function (d) {
            return d.state == "wthp6";
        })
        .attr("width", svgWidth)
        .attr("height", function (d) {
            if (d.state == "wthp6") {
                return svgHeight;
            } else {
                return 0;
            }
        })
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var defs = svgCharts.append("defs");
    console.log("defs is ", defs);

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
            "translate(" + (w - 20) + " ," +
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
    d3.select("#unemploymentCharts").selectAll("svg")
        .on("mouseover", function (d) {
            // console.log("mouseOver");
            var focus = d3.select(this).select(".focus");
            focus.style("display", null);
        })
        .on("mouseout", function (d) {
            var focus = d3.select(this).select(".focus");
            focus.style("display", "none");
        })
        .on("mousemove", mousemove)
        .on("dblclick", function (d) {
            changeChartDisplay(d.state);
        });

    function mousemove(d) {

        // console.log("mousemove");
        // console.log(d);

        var x0 = x.invert(d3.mouse(this)[0]);
        var i = bisect(d.series[d.state], x0, 1);
        var d0 = d.series[d.state][i - 1];
        var d1 = d.series[d.state][i];

        if ((typeof d1 == 'undefined') || (typeof d0 == 'undefined')) {
            return;
        }

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


        let rows = document.querySelectorAll("#ipdatacsvTbl tr");// ## $( "#ipdatacsvTbl tr" )[0].scrollIntoView();
        let cur_row = Array.from(rows).find((d, i) => {
            return d.firstChild.textContent == d_new.month;
        });

        Array.from(rows).forEach((d, i) => d.style.backgroundColor = i % 2 == 0 ? '#ececec' : '#ffffff');
        cur_row.style.backgroundColor = '#BCD4EC';

        cur_row.scrollIntoView({
            behavior: 'instant',
            block: 'center'
        });

    }

    updateCharts();
    updateTable(ipdatacsvTbl, _df.toCollection());

});

d3.select("#stateComparisonListdown").on("change", () => {
    updateCharts(1, num_obser);

});


$("#option_form").on("change", () => {
    updateCharts(1, num_obser);
});


function removeWhitespace(str) {
    return str.replace(/\s+/g, '');
}

function changeChartDisplay(d) {
    var id = d.replace(/\s+/g, '');
    var stateChart = d3.select("#unemploymentCharts")
        .select("#" + id);


    var stateCheckBox = d3.select("#stateOptions").select("#" + id);
    var active = stateChart.classed("chartActive");

    if (!active) {
        // console.log("changeChartDisplay: inactive -> active");
        stateCheckBox.property("checked", true);
        stateChart.transition().duration(400)
            .attr("height", svgHeight)
            .attr("opacity", 1);

    } else {
        // console.log("changeChartDisplay:  active -> inactive");

        stateCheckBox.property("checked", false);
        stateChart.transition().duration(400)
            .attr("height", 0)
            .attr("opacity", 0);
    }
    stateChart.classed("chartActive", !active);
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

function updateChartStateComparison(d, fromYear, toYear, pairwise) {
    let comparedState;
    //Todo: need a better way to get the data
    if (pairwise){
        comparedState = get_responding_wt_from_s1(d["0"]["0"].__data__.state)//document.getElementById("stateComparisonListdown").value;
        console.log(`PAIRWISE: compare ${d["0"]["0"].__data__.state} to ${comparedState}`);
    }
    else{
        comparedState  = document.getElementById("stateComparisonListdown").value;
        console.log(`NORMAL MODE: compare ${d["0"]["0"].__data__.state} to ${comparedState}`);
    }

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

function updateCharts(fromYear = 1, toYear = num_obser, pairwise = false) {

    x.domain([fromYear, toYear]);

    // Update the charts.
    var activeCharts = d3.select("#unemploymentCharts").selectAll(".chartActive");
    var allCharts = d3.select("#unemploymentCharts").selectAll("svg");

    console.log("activeCharts", activeCharts);
    var inactiveCharts = allCharts.filter(function (obj) {
        return !activeCharts[0].some(function (obj2) {
            return removeWhitespace(obj.state) == obj2.id;
        });
    });

    // console.log("document.getElementById(\"noComparison\").checked", document.getElementById("noComparison").checked);
    // console.log("document.getElementById(\"stateComparison\").checked", document.getElementById("stateComparison").checked);

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
                    .call(updateChartStateComparison, fromYear, toYear, pairwise)
                    .each("end", function (a) {
                        inactiveCharts[0].forEach(function (d) {
                            d = d3.select(d);
                            d.call(updateChartStateComparison, fromYear, toYear, pairwise);
                        });
                    });

            } else {
                d3.select(d)
                    .transition().duration(400)
                    .call(updateChartStateComparison, fromYear, toYear, pairwise);
            }
        });
    }

}
























