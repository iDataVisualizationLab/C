// loading bar
document.getElementById("loader").style.display = "block";


// draw filter btns and their sliders


// Define the line.
var valueLine = d3.svg.line()
    .x(function (d) {
        return xScale(d.index);
    })
    .y(function (d) {
        return yScale(d.gene_value);
    });

var zeroLine = d3.svg.line()
    .x(function (d) {
        // console.log('yyy',x(d.index));
        return xScale(d.index);
    })
    .y(yScale(0));

// Define the area.
var valueArea = d3.svg.area()
    .x(function (d) {
        return xScale(d.index);
    })
    .y1(function (d) {
        return yScale(d.gene_value);
    });

var zeroArea = d3.svg.area()
    .x(function (d) {
        return xScale(d.index);
    })
    .y0(yScale(0))
    .y1(yScale(0));

var bisect = d3.bisector(function (d) {
    return d.index;
}).left;

function change_btn_color_when_click(_this, color) {
    let nex_index;
    let cur_color = d3.select(_this).style("background-color").toString();
    let cur_index = color_arr.indexOf(cur_color);
    if (typeof color == 'undefined') {
        nex_index = cur_index < color_arr.length - 1 ? cur_index + 1 : 0;
        color = color_arr[nex_index];
    } else {
        $(_this).css('background-color', color);
    }

    $(_this).css('background-color', color);

    if (color == MY_COLORS.default) {
        d3.select(_this).style("background-image", MY_COLORS.gradient);
    } else {
        d3.select(_this).style("background-image", "none");
    }

}

function auto_filter() {

    $("#geneComparisonListdown").val(_cur_base);
    let button_list = d3.selectAll(`.${_cur_state}_filter_btn`)[0];
    filter(button_list, _pairwise, `.${_cur_state}_slider`).then(df => {
        updateTableAndVenn(dataTable, df.toCollection());
    });


}


function filter_btn_click_func() {
    let _this = this;
    change_btn_color_when_click(_this);
    auto_filter();

    let slider = document.getElementById(_this.id.replace("btn", "slider"));
    change_color_ctrl_slider_bar_auto_choose_color(_this, slider, slider.value);

}


comparison_radio.on("click", function () {
    let _this = this;

    if (_this.value == "gene") {
        $("#geneComparisonListdown").attr("disabled", false);
    } else {
        $("#geneComparisonListdown").attr("disabled", true);
    }
});

$("#all").on("click", selectAllCheckboxes);

$("#option_form").on("change", () => {
    updateCharts();
});

function read_plant_data() {
    DataFrame.fromCSV("data/" + "data_ALL_norm.csv").then(data => {

        normal_condition_cols.forEach(wt => {
            create_filter_btn_and_slider(wt, "normal", base_col_of_normal, false);
        });

        mutant_condition_cols.forEach(s1 => {
            create_filter_btn_and_slider(s1, "mutant", base_col_of_mutant, false);
        });
        pairwise_condition_cols.forEach(p => {
            create_filter_btn_and_slider(p, "pairwise", "", true, "mutant", "normal");
        });

        $('.normal_filter_btn').click(filter_btn_click_func);
        $('.mutant_filter_btn').click(filter_btn_click_func);
        $('.pairwise_filter_btn').click(filter_btn_click_func);


        normal_condition_cols.forEach(wt => update_text_when_sliders_change(wt, false));
        mutant_condition_cols.forEach(s1 => update_text_when_sliders_change(s1, false));
        pairwise_condition_cols.forEach(pairwise_col => update_text_when_sliders_change(pairwise_col, true));


        normal_master_slider.oninput = master_slider_oninput;
        mutant_master_slider.oninput = master_slider_oninput;
        pairwise_master_slider.oninput = master_slider_oninput;

        plot_stop1 = true;


        _atID = data.listColumns()[0];
        DataFrame.fromCSV("data/data_ALL_raw_sorted_by_wthp6Norm.csv").then(df => {
            _total_df_RAW = df;
        })
        data = data.sortBy(base_col_of_normal);
        set_global_varibles_by_CurActiveTab();
        console.log("here, DataFrame.fromCSV");

        _total_df = data;
        _cur_df = _total_df;

        if (_total_df.count() > MAXIMUM_DISPLAY) {
            display_index = MAXIMUM_DISPLAY;
        } else {
            display_index = _total_df.count();
        }

        _cur_index = display_index;
        document.getElementById("next_page_sms").innerText = `${display_index}/ ${_cur_df.count()} genes, page ${Math.ceil(_cur_index / MAXIMUM_DISPLAY)}/${Math.ceil(_cur_df.count() / MAXIMUM_DISPLAY)}`;

        display_df = _total_df.slice(0, display_index);


        read_data_for_venn().then(set_data_venn => {
            _set_data_venn = set_data_venn;
            let sets_venn = create_sets_obj_for_venn();
            draw_venn(sets_venn);
        }).then((x) => document.getElementById("loader").style.display = "none");


        let my_all_data = {};
        all_cols.forEach((gene_name) => {
            let df = display_df.select(_atID, gene_name);
            df = df.rename(gene_name, "gene_value");
            df = df.withColumn('index', (row, i) => i)
                .withColumn('gene', () => gene_name);
            my_all_data[gene_name] = df.toCollection();

        });


        let geneChartData = [];
        for (let gene in my_all_data) {
            let d = {};
            d.gene = gene;
            d.series = my_all_data;
            geneChartData.push(d);
        }

        var geneOptions = d3.select("#geneOptions");
        var geneComparisons = d3.select("#geneComparisonListdown");


        let tick_ = new Date;
        geneChartData.forEach(function (d) {

            //option checkbox
            var option = geneOptions
                .append("label")
                .datum(d.gene);


            //check for base col
            option.append("input")
                .attr("type", "checkbox")
                .property("checked", function (d) {
                    return (d == base_col_of_normal)
                })
                .attr("name", "geneSelection")
                .attr("id", removeWhitespace)
                .on("click", changeChartDisplay);

            option.append("text")
                .text(d.gene);

            option.append("br");

            //dropdown boxes
            var comparison = geneComparisons.append("option")
                .datum(d.gene)
                .attr("value", d.gene)
                .text(d.gene);

        });

        // re-Scale the range of the data
        xScale.domain([0, display_index - 1]);
        // y.domain([0, d3.max(data, function(d) { return d.gene_value; })]);

        // Create the svgs for the charts.
        svgCharts = d3.select("#unemploymentCharts").selectAll("svg")
            .data(geneChartData, d => d.gene)
            .enter()
            .append("svg")
            .style("display", "block")
            .attr("id", function (d) {
                return removeWhitespace(d.gene);
            })
            .classed("chartActive", function (d) {
                return d.gene == base_col_of_normal;
            })
            .attr("width", svgWidth)
            .attr("height", function (d) {
                if (d.gene == base_col_of_normal) {
                    return svgHeight;
                } else {
                    return 0;
                }
            })
            .append("g")
            .attr("transform", "translate(" + padding.left + "," + padding.top + ")");


        // Add background.
        svgCharts.append("rect")
            .classed("rect_class", true)
            .attr("transform", "translate(0,-" + padding.top + ")")
            .attr("width", w)
            .attr("height", h + padding.top + padding.bottom)
            .attr("fill", "white");



        svgCharts.append("clipPath")
            .attr("id", "clip-below")
            .append("path")
            .attr("d",
                valueArea.y0(h)
            );

        svgCharts.append("clipPath")
            .attr("id", "clip-above")
            .append("path")
            .attr("d",
                valueArea.y0(0)
            );

        svgCharts.append("clipPath")
            .attr("id", d=>`clip-above-${d.gene}`)
            .append('path')
            .attr("d", function (d) {
                var y1 = function (a, i) {
                    return yScale(d.series[d.gene][i].gene_value);
                };
                return valueArea.y0(yScale.range()[0]).y1(y1)(d.series[d.gene]);
            }).attr('fill','black');

        svgCharts.append("clipPath")
            .attr("id", d=>`clip-below-${d.gene}`)
            .append('path')
            .attr("d", function (d) {
                var y1 = function (a, i) {
                    return yScale(d.series[d.gene][i].gene_value);
                };
                return valueArea.y0(yScale.range()[1]).y1(y1)(d.series[d.gene]);
            }).attr('fill','black');

        // Add the baseline.
        svgCharts.append("path")
            // .attr("clip-path", "url(#sideClip)")
            .attr("class", "baseline")
            .attr("d", (d) => {
                return zeroLine(d.series[d.gene]);
            });

        // Add the areas.
        svgCharts.append("path")
            // .attr("clip-path", "url(#sideClip)")
            .attr("clip-path",d=> `url(#clip-below-${d.gene})`)
            .attr("class", "area below")
            .attr("fill", "steelblue")
            .attr("d", function (d) {
                return zeroArea(d.series[d.gene]);
            });

        svgCharts.append("path")
            // .attr("clip-path", "url(#sideClip)")
            .attr("clip-path",d=> `url(#clip-above-${d.gene})`)
            .attr("class", "area above")
            .attr("d",
                d => {
                    // console.log(d);
                    zeroArea(d.series[d.gene]);
                }
            );

// Area gets drawn in updateCharts()
// Draw the axes.
        svgCharts.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")


// text label for the x axis
        svgCharts.append("text")
            .classed("y_label", true)
            .attr("transform",
                "translate(" + (w) + " ," +
                (h) + ")")
            .style("text-anchor", "end")
            .text("Gene Name");


        svgCharts.append("g")
            .attr("class", "y axis");

// Add y-axis label.
        svgCharts.append("text")
            .attr("text-anchor", "end")
            .attr("y", 6)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Expressed (norm)");

        // todo: change name of the chart
        svgCharts.append("text")
            .classed("chart_name_on_the_right", true)
            .datum(function (d) {
                return d.gene;
            })
            .attr("x", w)
            .attr("y", 0)
            .attr("text-anchor", "end")
            .style("font", "15px Arial")
            .attr("fill", "#888")
            .text(function (d) {
                return d;
            });

        _focus_s1 = svgCharts.append("g")
            .attr("class", "s1_focus")
            .style("display", "none");

        _focus_s1.append("circle")
            .classed("s1_cirle", true)
            .attr("r", 4);

        // focus - circle when point on the chart
        _focus = svgCharts.append("g")
            .attr("class", "focus")
            .style("display", "none");

        _focus.append("circle")
            .attr("r", 4);

        _focus.append("rect")
            .attr("class", "tooltip")
            .attr("width", 78)
            .attr("height", 35)
            .attr("x", 10)
            .attr("y", -22)
            .attr("rx", 4)
            .attr("ry", 4);

        _focus.append("text")
            .attr("class", "tooltip-atID")
            .attr("x", 18)
            .attr("y", -12);

        _focus.append("text")
            .attr("class", "tooltip-value")
            .attr("x", 18)
            .attr("y", 4);

        let new_height_for_dataTable = this.innerHeight - parseFloat(d3.select("#options").style("height")) -
            parseFloat(d3.select("#export").style("height"))
            - parseFloat(d3.select("#next_btn_and_raw_checkbox").style("height")) - 40;

        d3.select("#ipdatacsvDiv")
            .style("height", new_height_for_dataTable);

        console.log(`..... END of read+svg ${(new Date - tick_) / 100}s`);


// Register mouse handlers.
        d3.select("#unemploymentCharts").selectAll("svg")
            .on("mouseover", function (d) {
                _focus.style("display", null);

            })
            .on("mouseout", function (d) {
                let rows = document.querySelectorAll("#ipdatacsvTbl tr");
                Array.from(rows).forEach((d, i) => {
                    d.style.fontWeight = "normal";
                    d.style.backgroundColor = i % 2 == 0 ? '#ececec' : '#ffffff'
                });

                _focus.style("display", "none");
            })
            .on("mousemove", function (d) {


                let _this = this;
                mousemove_chart(d, _this)
            })
            .on("dblclick", function (d) {
                changeChartDisplay(d.gene);
            });


        normal_ctrl_btn();

    });
}

function start() {
    let dataName = "";
    try {
        dataName = window.location.search.substring(1).split("data=")[1].split('&')[0].replace(/%20/g, ' '); // get data name after app
    } catch (e) {
    }



    if (dataName.includes("mice"))
    {
        processFile("", true);
    }
    else{
        read_plant_data();
    }


}
start();
function show_circle_when_mouseenter_the_dataTable(index, data_and_columnNames) {
    let tmp = _focus[0].filter(g => _cur_condition_cols.includes(g.__data__.gene));

    tmp.forEach(g => {

            let focus = d3.select(g);
            let data = data_and_columnNames.filter((col) => col[0] == g.__data__.gene);
            data = data[0];
            focus.style("display", null);

            focus.attr("transform", "translate(" + xScale(index) + "," + yScale(data[1]) + ")");
            adjust_tooltip_hover_chart(focus, index, data[1], false);
            focus.select(".tooltip-atID").text(data_and_columnNames[0][1].replace(S1_TEXT, ""));
            focus.select(".tooltip-value").text(g.__data__.gene + ": " + parseFloat(data[1]).toFixed(2));
        }
    )
}

function show_circle_when_mouseover_chart(_this, d) {
    let focus = d3.select(_this).select(".focus");
    let x0 = xScale.invert(d3.mouse(_this)[0] - padding.left + 1);
    let i = bisect(d.series[d.gene], x0, 1);
    let d0 = d.series[d.gene][i - 1];
    let d1 = d.series[d.gene][i];

    if ((typeof d1 == 'undefined') || (typeof d0 == 'undefined')) {
        return;
    }
    let d_new = x0 - d0.index > d1.index - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + xScale(d_new.index) + "," + yScale(d_new.gene_value) + ")");

    adjust_tooltip_hover_chart(focus, d_new.index, d_new.gene_value);

    focus.select(".tooltip-atID").text(d_new[_atID].replace(S1_TEXT, ""));
    focus.select(".tooltip-value").text(d_new.gene + ": " + parseFloat(d_new.gene_value).toFixed(2));
    return d_new;
}

function mousemove_chart(d, _this) {

    let d_new = show_circle_when_mouseover_chart(_this, d);

    if (typeof d_new == "undefined") {
        return;
    }

    let tmp = _focus[0].filter(g => _cur_condition_cols.includes(g.__data__.gene) && g.__data__.gene != _this.__data__.gene);

    tmp.forEach(g => {

            let focus = d3.select(g);
            let data = d.series[g.__data__.gene][d_new.index];

            focus.attr("transform", "translate(" + xScale(data.index) + "," + yScale(data.gene_value) + ")");
            adjust_tooltip_hover_chart(focus, data.index, data.gene_value, true);
            focus.select(".tooltip-atID").text("");
            focus.select(".tooltip-value").text(g.__data__.gene + ": " + parseFloat(data.gene_value).toFixed(2));
        }
    )


    // change the view of the data table
    let rows = document.querySelectorAll("#ipdatacsvTbl tr");
    let cur_row = Array.from(rows).find((d, i) => {
        return d.firstChild.textContent.replace(S1_TEXT, "") == d_new[_atID];
    });

    Array.from(rows).forEach((d, i) => {
        d.style.fontWeight = "normal";
        d.style.backgroundColor = i % 2 == 0 ? '#ececec' : '#ffffff'
    });
    cur_row.style.backgroundColor = MY_COLORS.lightbluesky;
    cur_row.style.fontWeight = "bold";
    cur_row.scrollIntoView({
        behavior: 'instant',
        block: 'center'
    });
}

d3.select("#geneComparisonListdown").on("change", () => {
    updateCharts();

});

function normal_ctrl_btn(update_venn = true) {
    calc_and_show_stats_table();

    // Tick all normal_cols, except the first one\
    let checkboxes = document.getElementsByName("geneSelection");
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].id == "all") {
            document.getElementById("all").checked = false;
            // console.log("Skip");
        } else {
            if (normal_cols.slice(1).includes(checkboxes[i].id)) {
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
    updateTableAndVenn(dataTable, display_df.toCollection(), update_venn);

    // mark comparison
    comparison_radio.prop("checked", true).trigger("click");
    $("#geneComparisonListdown").attr("disabled", false);
    $("#geneComparisonListdown").val(_cur_base);
    updateCharts();

}

function mutant_ctrl_btn(update_venn = true, ) {

    calc_and_show_stats_table();

    // Tick all mutant_cols, except the first one\
    let checkboxes = document.getElementsByName("geneSelection");
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].id == "all") {
            document.getElementById("all").checked = false;
        } else {
            if (mutant_cols.slice(1).includes(checkboxes[i].id)) {
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

    updateTableAndVenn(dataTable, display_df.toCollection(), update_venn);
    // mark comparison
    comparison_radio.prop("checked", true).trigger("click");
    $("#geneComparisonListdown").attr("disabled", false);
    $("#geneComparisonListdown").val(_cur_base);
    updateCharts();
}

function pairwise_ctrl_btn(update_venn = true) {
    calc_and_show_stats_table();

    // Tick all normal_cols, except the first one
    let checkboxes = document.getElementsByName("geneSelection");
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].id == "all") {
            document.getElementById("all").checked = false;
            // console.log("Skip");
        } else {
            if (mutant_cols.includes(checkboxes[i].id)) {
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

    updateTableAndVenn(dataTable, display_df.toCollection(), update_venn);
    // mark comparison for s1
    comparison_radio.prop("checked", true);
    $("#geneComparisonListdown").attr("disabled", true);
    updateCharts(); //todo check here
}

function custom_ctrl_btn() {

    // untick all, except the first one\
    let checkboxes = document.getElementsByName("geneSelection");
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].id == "all") {
            document.getElementById("all").checked = false;
            // console.log("Skip");
        } else if (checkboxes[i].id == "wthp6") {
            if (!checkboxes[i].checked) {
                changeChartDisplay(checkboxes[i].id);
            }
        } else {
            if (checkboxes[i].checked) {
                changeChartDisplay(checkboxes[i].id);
            }
        }
    }

    updateDataForSVGCharts();
    updateTable(dataTable, display_df.toCollection());

    $("#geneComparisonListdown").attr("disabled", false);
    $("#geneComparisonListdown").val("wthp6");
    $('#noComparison').prop('checked', true)
    comparison_radio.trigger("change");
}

function changeChartDisplay(d) {
    var id = d.replace(/\s+/g, '');
    var geneChart = d3.select("#unemploymentCharts")
        .select("#" + id);


    console.log("geneChart", geneChart);
    console.log("id", id);

    var geneCheckBox = d3.select("#geneOptions").select("#" + id);
    var active = geneChart.classed("chartActive");

    if (!active) {
        // console.log("changeChartDisplay: inactive -> active");
        geneCheckBox.property("checked", true);
        geneChart
            .attr("height", svgHeight)
            .attr("opacity", 1);

    } else {
        // console.log("changeChartDisplay:  active -> inactive");

        geneCheckBox.property("checked", false);
        geneChart
            .attr("height", 0)
            .attr("opacity", 0);
    }
    geneChart.classed("chartActive", !active);
}

function updateChartNoComparison() {
    this.select(".area.below")
        .attr("clip-path", "url(#sideClip)")
        // .attr("clip-path",d=> `url(#clip-above-${d.gene})`)
        // .attr("fill", "white")
        .attr("opacity", 0)
        .attr("d", function (d) {
            return valueArea.y0(yScale(0))(d.series[d.gene]);
        });

    this.select(".area.above")
        .attr("clip-path", "url(#sideClip)")
        // .attr("clip-path",d=> `url(#clip-above-${d.gene})`)
        .attr("d", function (d) {
            return zeroArea.y0(yScale(0))(d.series[d.gene]);
        });

    this.select(".baseline")
        .attr("d", function (d) {
            return valueLine(d.series[d.gene]);
        });

    this.select(".x.axis")
        .call(xAxis)
        .selectAll(`text`)
        .style(`text-anchor`, `middle`);

    this.select(".y.axis")
        .call(yAxis);
}

function updateChartgeneComparison(d, pairwise) {
    let comparedgene;
    //Todo: need a better way to get the data
    if (pairwise) {
        comparedgene = get_responding_normal_from_mutant(d["0"]["0"].__data__.gene)
    } else {
        comparedgene = _cur_base;
    }

    let data = d.datum();
    // Update areas.
    this.select(`#clip-below-${data.gene} path`)
        .attr("d", function (d) {
            var y1 = function (a, i) {
                return yScale(d.series[d.gene][i].gene_value);
            };
            return valueArea.y0(yScale.range()[0]).y1(y1)(d.series[d.gene]);
        });
    this.select(`#clip-above-${data.gene} path`)
        .attr("d", function (d) {
            var y1 = function (a, i) {
                return yScale(d.series[d.gene][i].gene_value);
            };
            return valueArea.y0(yScale.range()[1]).y1(y1)(d.series[d.gene]);
        });
    this.select(".area.below")
        // .attr("clip-path", "url(#sideClip)")
        .attr("clip-path",d=> `url(#clip-below-${d.gene})`)
        .attr("fill", MY_COLORS.green)
        .attr("opacity", null)
        .attr("d", function (d) {
            var y0 = function (a, i) {
                return yScale(d.series[comparedgene][i].gene_value);
            };
            var y1 = function (a, i) {
                return yScale(d.series[d.gene][i].gene_value);
            };

            return valueArea.y0(y0).y1(y1)(d.series[d.gene]);
        });

    this.select(".area.above")
        // .attr("clip-path", "url(#sideClip)")
        .attr("clip-path",d=> `url(#clip-above-${d.gene})`)
        .attr("d", function (d) {
            var y0 = function (a, i) {
                return yScale(d.series[comparedgene][i].gene_value);
                //return y(d.series[comparedgene][i].gene_value);
            };

            var y1 = function (a, i) {
                return yScale(d.series[d.gene][i].gene_value);
            };
            return valueArea.y0(y0).y1(y1)(d.series[d.gene]);
        });

    this.select(".baseline")
        .attr("d", function (d) {
            return valueLine(d.series[d.gene]);
        });


    this.select(".x.axis")
        .call(xAxis)
        .selectAll(`text`)
        .style(`text-anchor`, `middle`);
    // console.log("xAxis", xAxis);

    this.select(".y.axis")
        .call(yAxis);
}

function updateCharts(pairwise = _pairwise) {

    xScale.domain([0, display_index - 1]);
    if (display_index < num_ticks) {
        xAxis.tickValues([...Array(display_index).keys()]
        ).tickFormat((i) => {
            return display_df.select(_atID).toArray().flat()[i];
        });
    } else {
        xAxis.ticks(num_ticks).tickValues(null);

    }

    // Update the charts.
    var activeCharts = d3.select("#unemploymentCharts").selectAll(".chartActive");
    var allCharts = d3.select("#unemploymentCharts").selectAll("svg");

    // console.log("activeCharts", activeCharts);
    var inactiveCharts = allCharts.filter(function (obj) {
        return !activeCharts[0].some(function (obj2) {
            return removeWhitespace(obj.gene) == obj2.id;
        });
    });

    if (document.getElementById("noComparison").checked) {
        // No comparison selected.
        activeCharts[0].forEach(function (d, i, array) {
            // If the chart is active, transition.  Otherwise, don't.
            if (array[i].id == array[array.length - 1].id) {
                d3.select(d)
                    .call(updateChartNoComparison)
                    .transition().duration(1)
                    .each("end", function (a) {
                        inactiveCharts[0].forEach(function (d) {
                            d3.select(d).call(updateChartNoComparison);
                        });
                    });

            } else {
                d3.select(d)
                    .call(updateChartNoComparison);
            }
        });
    } else if (document.getElementById("geneComparison").checked) {
        // gene comparisons selected.
        activeCharts[0].forEach(function (d, i, array) {
            // If the chart is active, transition.  Otherwise, don't.
            if (array[i].id == array[array.length - 1].id) {
                d3.select(d)
                    .call(updateChartgeneComparison, pairwise)
                    .transition().duration(1)
                    .each("end", function (a) {
                        inactiveCharts[0].forEach(function (d) {
                            d = d3.select(d);
                            d.call(updateChartgeneComparison, pairwise);
                        });
                    });

            } else {
                d3.select(d)
                    .call(updateChartgeneComparison, pairwise);
            }
        });
    }

}

function updateDataForSVGCharts() {
    let my_all_data = {};

    all_cols.forEach((gene_name) => {
        let tmp_df = display_df.select(_atID, gene_name);
        tmp_df = tmp_df.rename(gene_name, "gene_value");
        tmp_df = tmp_df.withColumn('index', (row, i) => i)
            .withColumn('gene', () => gene_name);
        my_all_data[gene_name] = tmp_df.toCollection();
    })


    let geneChartData = [];
    for (let gene in my_all_data) {
        let d = {};
        d.gene = gene;
        d.series = my_all_data;
        geneChartData.push(d);
    }
    d3.select("#unemploymentCharts").selectAll("svg").data(geneChartData, d => d.gene);
}


function reset_DisplayIndex_and_DisplayDF(df = _cur_df) {
    // check the number of rows currently
    if (df.count() < MAXIMUM_DISPLAY) {
        display_index = df.count()
    } else {
        display_index = MAXIMUM_DISPLAY;
    }

    _cur_index = display_index;
    display_df = _cur_df.slice(0, display_index);

}

async function filter(button_list, pairwise = false, slider_class) {
    // reset_sort_smses();
    let filteredDf = filter_data(button_list, pairwise, _total_df, slider_class);
    _cur_df = filteredDf;

    reset_DisplayIndex_and_DisplayDF();
    updateDataForSVGCharts();

    print_paging_sms_for_chart();

    updateCharts();


    return display_df;
};


function filter_data(button_list, pairwise, df, slider_class) {
    let slider_ctrl_list = d3.selectAll(slider_class)[0];

    let filteredDf = df;
    let cur_base_condition;
    if (!pairwise) {
        cur_base_condition = document.getElementById("geneComparisonListdown").value;
        for (let i = 0, n = button_list.length; i < n; i++) {
            let bt = d3.select(button_list[i]);
            let col = bt.text().split(" ")[0];
            let slider = slider_ctrl_list.find((slider => slider.id.split("_")[0] == col));


            if (bt.style("background-color").toString() == color_arr[0]) {
                filteredDf = filteredDf
                    .filter(row => Math.abs(row.get(cur_base_condition) - row.get(col)) >= parseInt(slider.value) / 100);
            } else if (bt.style("background-color").toString() == color_arr[1]) {
                filteredDf = filteredDf
                    .filter(row => row.get(cur_base_condition) < (row.get(col) - parseInt(slider.value) / 100));

            } else if (bt.style("background-color").toString() == color_arr[2]) {
                filteredDf = filteredDf
                    .filter(row => row.get(cur_base_condition) - parseInt(slider.value) / 100 > row.get(col));
            } else if (bt.style("background-color").toString() == color_arr[3]) {
                filteredDf = filteredDf
                    .filter(row => Math.abs(row.get(cur_base_condition) - row.get(col)) <= parseInt(slider.value) / 100);
            }
        }
    } else {
        for (let i = 0, n = button_list.length; i < n; i++) {

            let bt = d3.select(button_list[i]);
            let col = bt.text().split(" ")[0];
            cur_base_condition = get_responding_normal_from_mutant(col);
            let slider = slider_ctrl_list.find((slider => (slider.id.split("_")[1] == col.replace(mutant_class, "")
                || (slider.id.split("pairwise")[0] == col.replace(mutant_class, "")))));


            if (bt.style("background-color").toString() == color_arr[0]) {
                filteredDf = filteredDf
                    .filter(row => Math.abs(row.get(cur_base_condition) - row.get(col)) >= parseInt(slider.value) / 100);
            } else if (bt.style("background-color").toString() == color_arr[1]) {
                filteredDf = filteredDf
                    .filter(row => row.get(cur_base_condition) < (row.get(col) - parseInt(slider.value) / 100));

            } else if (bt.style("background-color").toString() == color_arr[2]) {
                filteredDf = filteredDf
                    .filter(row => row.get(cur_base_condition) - parseInt(slider.value) / 100 > row.get(col));
            } else if (bt.style("background-color").toString() == color_arr[3]) {
                filteredDf = filteredDf
                    .filter(row => Math.abs(row.get(cur_base_condition) - row.get(col)) <= parseInt(slider.value) / 100);
            }
        }
    }
    return filteredDf;
}


$(document.getElementById("next_page")).on("click", () => {
    let pairwise = false;

    if (_cur_df.count() > _cur_index) {
        if (_cur_index + MAXIMUM_DISPLAY > _cur_df.count()) {
            display_df = _cur_df.slice(_cur_index, _cur_df.count());
            console.log(display_df.dim());

            display_index = _cur_df.count() - _cur_index;
            _cur_index = _cur_df.count();
        } else {
            display_df = _cur_df.slice(_cur_index, _cur_index + MAXIMUM_DISPLAY);
            _cur_index += MAXIMUM_DISPLAY;
            display_index = MAXIMUM_DISPLAY;
        }
    } else {
        console.log("return");
        return;
    }

    updateDataForSVGCharts();
    updateCharts();
    updateTableAndVenn(dataTable, display_df.toCollection(), false); //todo: dont need to change venn
    print_paging_sms_for_chart();


});

$(document.getElementById("previous_page")).on("click", () => {
    let pairwise = false;
    if (_cur_index <= MAXIMUM_DISPLAY) {
        console.log("return");
        return;
    }

    if (_cur_index % MAXIMUM_DISPLAY == 0) {
        display_df = _cur_df.slice(_cur_index - 2 * MAXIMUM_DISPLAY, _cur_index - MAXIMUM_DISPLAY);

        _cur_index = _cur_index - MAXIMUM_DISPLAY;
        display_index = MAXIMUM_DISPLAY;
    } else {
        display_df = _cur_df.slice(_cur_index - _cur_index % MAXIMUM_DISPLAY - MAXIMUM_DISPLAY, _cur_index - _cur_index % MAXIMUM_DISPLAY);

        console.log("cur_index - cur_index % MAXIMUM_DISPLAY - MAXIMUM_DISPLAY", _cur_index - _cur_index % MAXIMUM_DISPLAY - MAXIMUM_DISPLAY);
        console.log("cur_index - cur_index % MAXIMUM_DISPLAY", _cur_index - _cur_index % MAXIMUM_DISPLAY);
        display_index = MAXIMUM_DISPLAY;
        _cur_index = _cur_index - _cur_index % MAXIMUM_DISPLAY;
        console.log("-=-=-= cur_index", _cur_index);
    }

    updateDataForSVGCharts();
    updateCharts();

    updateTableAndVenn();

    print_paging_sms_for_chart();
});

function print_paging_sms_for_chart() {
    document.getElementById("next_page_sms").innerText = `${display_index}/ ${_cur_df.count()} genes, page ${Math.ceil(_cur_index / MAXIMUM_DISPLAY)}/${Math.ceil(_cur_df.count() / MAXIMUM_DISPLAY)}`;
}

function exportTableToCSV(df, filename) {
    let csv = df.toCSV();

    // Data URI
    var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

    // For IE (tested 10+)
    if (window.navigator.msSaveOrOpenBlob) {
        var blob = new Blob([decodeURIComponent(encodeURI(csv))], {
            type: "text/csv;charset=utf-8;"
        });
        navigator.msSaveBlob(blob, filename);
    } else {
        $(this)
            .attr({
                'download': filename
                , 'href': csvData
                //,'target' : '_blank' //if you want it to open in a new window
            });
    }
}

$("#export").click(function (event) {
    // var outputFile = 'export'
    var outputFile = window.prompt("File name: ") || 'export';
    outputFile = outputFile.replace('.csv', '') + '.csv'

    // CSV
    exportTableToCSV.apply(this, [_cur_df, outputFile]);
    //
    if ($("#raw_data").is(':checked')) {
        if (_cur_df.count() == display_index) {
            exportTableToCSV.apply(this, [display_df_RAW, outputFile]);
        } else {
            let all_id_list = _cur_df.select(_atID).toArray().flat();
            let cur_df_raw = _total_df_RAW.filter(row => all_id_list.includes(row.get(_atID)));
            exportTableToCSV.apply(this, [cur_df_raw, outputFile]);

        }
    } else {
        exportTableToCSV.apply(this, [_cur_df, outputFile]);
    }


    // IF CSV, don't do event.preventDefault() or return false
    // We actually need this to be a typical hyperlink
});


$("#raw_data_form :checkbox").change(() => {

    if ($("#raw_data").is(':checked')) {
        show_raw_data = true;
    } else {
        show_raw_data = false;
    }
    updateTAbleWithColor();
    add_events_for_dataTable();
})

function set_global_varibles_by_CurActiveTab() {
    console.log("cur_active_tab ====", cur_active_tab);
    if (cur_active_tab == tab_names["normal_class"]) {
        _pairwise = false;
        _cur_base = base_col_of_normal;
        _cur_condition_cols = normal_condition_cols;
        _cur_class = normal_class;

        _cur_master_slider = normal_master_slider;
        _cur_master_slider_value = normal_master_slider_value;

        _cur_venn_chart = venn_chart_normal;
        _cur_venn_div = venn_div_normal;

        _cur_statsTable = normal_statsTable;

        _cur_state = "normal"

        // _cur_filter_set = normal_filter_set;

    } else if (cur_active_tab == tab_names["mutant_class"]) {
        _pairwise = false;
        _cur_base = base_col_of_mutant;
        _cur_condition_cols = mutant_condition_cols;
        _cur_class = mutant_class;

        _cur_master_slider = mutant_master_slider;
        _cur_master_slider_value = mutant_master_slider_value;

        _cur_venn_chart = venn_chart_mutant;
        _cur_venn_div = venn_div_mutant;

        _cur_statsTable = mutant_statsTable;
        // _cur_filter_set = mutant_filter_set;

        _cur_state = "mutant";


    } else if (cur_active_tab == tab_names["pairwise_class"]) {
        _pairwise = true;
        _cur_base = "NO";
        _cur_condition_cols = pairwise_condition_cols;
        _cur_class = pairwise_class;

        _cur_master_slider = pairwise_master_slider;
        _cur_master_slider_value = pairwise_master_slider_value;

        _cur_venn_chart = venn_chart_pairwise;
        _cur_venn_div = venn_div_pairwise;

        _cur_statsTable = pairwise_statsTable;
        // _cur_filter_set = pairwise_filter_set;

        _cur_state = "pairwise";
    }
}


function resize() {
    console.log("resize...");
    w = parseFloat(d3.select("#unemploymentCharts").style("width")) * 0.99 - padding.left - padding.right;

    // Update the range of the scale with new width/height
    xScale.range([0, w]);

    // Update the axis and text with the new scale
    svgCharts.selectAll('.x.axis')
        .call(xAxis)
        .selectAll(`text`)
        .style(`text-anchor`, `middle`);


    svgCharts.selectAll(".rect_class")
        .attr("transform", "translate(0,-" + padding.top + ")")
        .attr("width", w)
        .attr("height", h + padding.top + padding.bottom)
        .attr("fill", "white");


    svgCharts.select("defs").selectAll("rect")
        .attr("transform", "translate(0,-" + padding.top + ")")
        .attr("width", w)
        .attr("height", h + padding.top);


    // Force D3 to recalculate and update the line
    updateCharts();

    // // Update the tick marks


    svgCharts.selectAll(".y_label")
        .attr("transform",
            "translate(" + (w) + " ," +
            (h) + ")")


    svgCharts.selectAll(".chart_name_on_the_right")
        .attr("x", w)
        .attr("y", 0)

    svgWidth = w + padding.left + padding.right;

    d3.select("#unemploymentCharts").selectAll("svg")
        .attr("width", svgWidth);


    let new_height_for_dataTable = this.innerHeight - parseFloat(d3.select("#options").style("height")) -
        parseFloat(d3.select("#export").style("height"))
        - parseFloat(d3.select("#next_btn_and_raw_checkbox").style("height")) - 40;

    d3.select("#ipdatacsvDiv")
        .style("height", new_height_for_dataTable);
};

// Call the resize function whenever a resize event occurs
d3.select(window).on('resize', resize);


$(document.getElementById("file-input")).on("change", function f(ent) {
    document.getElementById("loader").style.display = "block";

    loadFileAsText();
});

function loadFileAsText(evt) {
    var textFile;
    if (!window.FileReader) {
        alert('Your browser is not supported');
        return false;
    }
    var input = $(document.getElementById("file-input")).get(0);

    // Create a reader object
    var reader = new FileReader();
    if (input.files.length) {
        textFile = input.files[0];
        // Read the file
        reader.readAsText(textFile);
        // When it's loaded, process it
        $(reader).on('load', processFile);
    } else {
        // alert('Please upload a file before continuing')
    }

    var a = document.getElementById('file-input');
    if (a.value == "") {
        fileLabel.innerHTML = "Choose file";
    } else {
        var theSplit = a.value.split('\\');
        fileLabel.innerHTML = theSplit[theSplit.length - 1];
    }
}


async function processFile(e, mice_data = false) {

    plot_stop1 = false;

    let low_cpm, low_log2fold;
    if (!mice_data) {
        let file = e.target.result, lines;
        _just_upload_file["statsTable"] = true;
        _just_upload_file["dataTable"] = true;

        lines = file.trim().split("\n");
        lines = lines.map(line => line.split(","));
        let header = lines[0];
        header = header.map(x => x.replace(/_/g, '')).map(x => x.replace(/\./g, ''));

        _atID = header[0];
        if (_atID == "gene") {
            _atID = "geneID";
            header[0] = "geneID";
        }

        let sort_by_col = header[1] + "_norm";
        let raw_and_norm_data = lines.slice(1).map(norm_row);
        let raw_and_norm_df = new DataFrame(raw_and_norm_data, [...header, ...header.slice(1).map(col => col + "_norm")]);
        raw_and_norm_df = raw_and_norm_df.sortBy(sort_by_col);


        _total_df_RAW = raw_and_norm_df.select(...header);
        let columns = _total_df_RAW.listColumns();


        _total_df = raw_and_norm_df.select(_atID, ...header.slice(1).map(col => col + "_norm")).renameAll(columns);
        _cur_df = _total_df;


        normal_cols = columns.slice(1, Math.floor(columns.length / 2) + 1);
        mutant_cols = columns.slice(Math.floor(columns.length / 2) + 1);
        all_cols = columns.slice(1);


        low_cpm = lines.slice(1).map(get_row_low_cpm).filter(function (n) {
            return n;
        });
        low_log2fold = lines.slice(1).map(row => get_row_low_log2fold(row.slice(0, normal_cols.length + 1))).filter(function (n) {
            return n;
        });


    } else {
        document.getElementById("fileLabel").innerText = "DATA AND FINAL ANALYSIS RKO PKO RPKO.csv";

        $("#document").attr("href", "https://www.notion.so/Mice-Genetics-Visualization-1fd994fcb10344028ae55a119b460414")

        await DataFrame.fromCSV("data/" + "mice_pseudocounts_cpm_raw.csv").then(df => _total_df_RAW = df).then(() =>
             DataFrame.fromCSV("data/" + "mice_pseudocounts_cpm_norm.csv").then(data => {
                 _total_df = data;

                 _cur_df = _total_df;
                 _atID = data.listColumns()[0];
                 let columns = data.listColumns();

                 normal_cols = columns.slice(1, Math.floor(columns.length / 2) + 1);
                 mutant_cols = columns.slice(Math.floor(columns.length / 2) + 1);
                 all_cols = columns.slice(1);
             }
         )).then( () =>  DataFrame.fromCSV("data/" + "mice_pseudocounts_LOW.csv").then(data => {
            low_cpm = data.filter(row => row.get("low_cpm") == 1).select(_atID).toArray().flat();
            low_log2fold = data.filter(row => row.get("low_log2fold") == 1).select(_atID).toArray().flat();
        }) );

    }
    d3.select("#geneOptions").selectAll("label").remove();
    d3.select("#unemploymentCharts").selectAll("svg").remove();
    d3.select("#geneComparisonListdown").selectAll("option").remove();

    d3.select("#mutant_comparison").selectAll(".btn-group").selectAll("*").remove();
    d3.select("#normal_comparison").selectAll(".btn-group").selectAll("*").remove();
    d3.select("#pairwise_comparison").selectAll(".btn-group").selectAll("*").remove();


    _set_data_venn = read_data_for_venn_with_upload_file(low_cpm, low_log2fold);
    let sets_venn = create_sets_obj_for_venn();
    draw_venn(sets_venn);

    base_col_of_normal = normal_cols[0];
    base_col_of_mutant = mutant_cols[0];
    normal_condition_cols = normal_cols.slice(1);
    mutant_condition_cols = mutant_cols.slice(1);

    pairwise_condition_cols = mutant_cols;


    normal_class = get_class_type(normal_cols);
    mutant_class = get_class_type(mutant_cols);

    if (normal_class == "" && mutant_class == "") {
        let common_name = get_class_type([normal_cols[0], mutant_cols[0]]);
        normal_class = normal_cols[0].replace(common_name, "")
        mutant_class = mutant_cols[0].replace(common_name, "");
        console.log("common_name", common_name);
    }
    MAP_CLASS["normal"] = normal_class;
    MAP_CLASS["mutant"] = mutant_class;


    pairwise_class = "pairwise";

    reset_DisplayIndex_and_DisplayDF();


    document.getElementById("p_normal_intro").innerHTML = `Compare each <b>${normal_class}</b> conditioned test with <b>${base_col_of_normal}</b>`;
    document.getElementById("p_mutant_intro").innerHTML = `Compare each <b>${mutant_class}</b> conditioned test with <b>${base_col_of_mutant}</b>`;
    document.getElementById("p_pairwise_intro").innerHTML = `Pairwise comparison: <b>${mutant_class}</b> vs. <b>${normal_class}</b>`;


    document.getElementById("normal_tab").innerHTML = `${normal_class.toUpperCase()}(s) Comparison`;
    document.getElementById("mutant_tab").innerHTML = `${mutant_class.toUpperCase()}(s) Comparison`;
    document.getElementById("pairwise_tab").innerHTML = `${pairwise_class.toUpperCase()} Comparison`;

    my_all_data = {};
    all_cols.forEach((gene_name) => {
        let df = display_df.select(_atID, gene_name);
        df = df.rename(gene_name, "gene_value");
        df = df.withColumn('index', (row, i) => i)
            .withColumn('gene', () => gene_name);
        my_all_data[gene_name] = df.toCollection();

    });
    let geneChartData = [];
    for (let gene in my_all_data) {
        let d = {};
        d.gene = gene;
        d.series = my_all_data;
        geneChartData.push(d);
    }

    var geneOptions = d3.select("#geneOptions");
    var geneComparisons = d3.select("#geneComparisonListdown");


    geneChartData.forEach(function (d) {

        //option checkbox
        var option = geneOptions
            .append("label")
            .datum(d.gene);


        //check for base col
        option.append("input")
            .attr("type", "checkbox")
            .property("checked", function (d) {
                return (d == base_col_of_normal)
            })
            .attr("name", "geneSelection")
            .attr("id", removeWhitespace)
            .on("click", changeChartDisplay);

        option.append("text")
            .text(d.gene);

        option.append("br");

        //dropdown boxes
        var comparison = geneComparisons.append("option")
            .datum(d.gene)
            .attr("value", d.gene)
            .text(d.gene);

    });

    svgCharts = d3.select("#unemploymentCharts").selectAll("svg")
        .data(geneChartData, d => d.gene)
        .enter()
        .append("svg")
        .style("display", "block")
        .attr("id", function (d) {
            return removeWhitespace(d.gene);
        })
        .classed("chartActive", function (d) {
            return d.gene == base_col_of_normal;
        })
        .attr("width", svgWidth)
        .attr("height", function (d) {
            if (d.gene == base_col_of_normal) {
                return svgHeight;
            } else {
                return 0;
            }
        })
        .append("g")
        .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

    var defs = svgCharts.append("defs");

    // Add background.
    svgCharts.append("rect")
        .classed("rect_class", true)
        .attr("transform", "translate(0,-" + padding.top + ")")
        .attr("width", w)
        .attr("height", h + padding.top + padding.bottom)
        .attr("fill", "white");

    // Side clip-path.
    defs.append("clipPath")
        .attr("id", "sideClip")
        .append("rect")
        .attr("transform", "translate(0,-" + padding.top + ")")
        .attr("width", w)
        .attr("height", h + padding.top);

    // area clip-path
    svgCharts.append("clipPath")
        .attr("id", d=>`clip-above-${d.gene}`)
        .append('path')
        .attr("d", function (d) {
            var y1 = function (a, i) {
                return yScale(d.series[d.gene][i].gene_value);
            };
            return valueArea.y0(yScale.range()[0]).y1(y1)(d.series[d.gene]);
        }).attr('fill','black');
    svgCharts.append("clipPath")
        .attr("id", d=>`clip-below-${d.gene}`)
        .append('path')
        .attr("d", function (d) {
            var y1 = function (a, i) {
                return yScale(d.series[d.gene][i].gene_value);
            };
            return valueArea.y0(yScale.range()[1]).y1(y1)(d.series[d.gene]);
        }).attr('fill','black');

    // Add the baseline.
    svgCharts.append("path")
        .attr("clip-path", "url(#sideClip)")
        .attr("class", "baseline")
        .attr("d", (d) => {
            return zeroLine(d.series[d.gene]);
        });

    // Add the areas.
    svgCharts.append("path")
        // .attr("clip-path", "url(#sideClip)")
        .attr("clip-path",d=> `url(#clip-below-${d.gene})`)
        .attr("class", "area below")
        .attr("fill", "steelblue")
        .attr("d", function (d) {
            return zeroArea(d.series[d.gene]);
        });

    svgCharts.append("path")
        // .attr("clip-path", "url(#sideClip)")
        .attr("clip-path", d=> `url(#clip-above-${d.gene})`)
        .attr("class", "area above")
        .attr("d",
            d => {
                // console.log(d);
                zeroArea(d.series[d.gene]);
            }
        );

// Area gets drawn in updateCharts()
// Draw the axes.
    svgCharts.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")


// text label for the x axis
    svgCharts.append("text")
        .classed("y_label", true)
        .attr("transform",
            "translate(" + (w) + " ," +
            (h) + ")")
        .style("text-anchor", "end")
        .text("Gene Name");


    svgCharts.append("g")
        .attr("class", "y axis");

// Add y-axis label.
    svgCharts.append("text")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Expressed (norm)");


    svgCharts.append("text")
        .classed("chart_name_on_the_right", true)
        .datum(function (d) {
            return d.gene;
        })
        .attr("x", w)
        .attr("y", 0)
        .attr("text-anchor", "end")
        .style("font", "15px Arial")
        .attr("fill", "#888")
        .text(function (d) {
            return d;
        });


    // focus - circle when point on the chart
    _focus = svgCharts.append("g")
        .attr("class", "focus")
        .style("display", "None");

    _focus.append("circle")
        .attr("r", 4);

    _focus.append("rect")
        .attr("class", "tooltip")
        .attr("width", 78)
        .attr("height", 35)
        .attr("x", 10)
        .attr("y", -22)
        .attr("rx", 4)
        .attr("ry", 4);

    _focus.append("text")
        .attr("class", "tooltip-atID")
        .attr("x", 18)
        .attr("y", -12);

    _focus.append("text")
        .attr("class", "tooltip-value")
        .attr("x", 18)
        .attr("y", 4);


// Register mouse handlers.
    d3.select("#unemploymentCharts").selectAll("svg")
        .on("mouseover", function (d) {
            _focus.style("display", null);

        })
        .on("mouseout", function (d) {
            let rows = document.querySelectorAll("#ipdatacsvTbl tr");
            Array.from(rows).forEach((d, i) => {
                d.style.fontWeight = "normal";
                d.style.backgroundColor = i % 2 == 0 ? '#ececec' : '#ffffff'
            });

            _focus.style("display", "none");
        })
        .on("mousemove", function (d) {

            let _this = this;
            mousemove_chart(d, _this)
        })
        .on("dblclick", function (d) {
            changeChartDisplay(d.gene);
        });


    normal_condition_cols.forEach(wt => {
        create_filter_btn_and_slider(wt, "normal", base_col_of_normal, false);
    });

    mutant_condition_cols.forEach(s1 => {
        create_filter_btn_and_slider(s1, "mutant", base_col_of_mutant, false);
    });
    pairwise_condition_cols.forEach(p => {
        create_filter_btn_and_slider(p, "pairwise", "", true, "mutant", "normal");
    });


    $('.normal_filter_btn').click(filter_btn_click_func);
    $('.mutant_filter_btn').click(filter_btn_click_func);
    $('.pairwise_filter_btn').click(filter_btn_click_func);
    comparison_radio.on("click", function () {
        let _this = this;

        if (_this.value == "gene") {
            $("#geneComparisonListdown").attr("disabled", false);
        } else {
            $("#geneComparisonListdown").attr("disabled", true);
        }
    });

    $("#all").on("click", selectAllCheckboxes);

    $("#option_form").on("change", () => {
        updateCharts();
    });


    normal_condition_cols.forEach(wt => update_text_when_sliders_change(wt, false));
    mutant_condition_cols.forEach(s1 => update_text_when_sliders_change(s1, false));
    pairwise_condition_cols.forEach(pairwise_col => update_text_when_sliders_change(pairwise_col, true));

    normal_master_slider.onchange = master_slider_oninput;
    mutant_master_slider.onchange = master_slider_oninput;
    pairwise_master_slider.onchange = master_slider_oninput;


    set_global_varibles_by_CurActiveTab();
    print_paging_sms_for_chart();


    change_color_slider_bar(_cur_master_slider, 0, MY_COLORS.gray, MY_COLORS.slider_master);
    _cur_master_slider.value = 0;
    change_all_slider_values_to_the_master(0, _cur_condition_cols);
    _cur_master_slider_value.innerHTML = 0;


    if (cur_active_tab == tab_names["normal_class"]) {
        normal_ctrl_btn(true);

    } else if (cur_active_tab == tab_names["mutant_class"]) {
        mutant_ctrl_btn(true);


    } else if (cur_active_tab == tab_names["pairwise_class"]) {
        pairwise_ctrl_btn(true);

    }
    document.getElementById("loader").style.display = "none";

}

function get_class_type(arr) {
    let len_arr = arr.map(x => x.length);
    let min_len = Math.min(...len_arr);
    for (let i = min_len - 1; i >= 0; i--) {
        let sub_arr = arr.map(x => x.slice(0, i));
        let unique_sub_arr = sub_arr.filter((v, i, a) => a.indexOf(v) === i);
        if (unique_sub_arr.length == 1) {
            return unique_sub_arr[0];
        }
    }
    return "";
}


