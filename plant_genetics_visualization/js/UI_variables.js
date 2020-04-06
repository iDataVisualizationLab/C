function create_master_slider(cur_state) {
    let master_slider_div_id, master_input_class, master_slider_id, master_slider_value, master_slider_div_class,
        parent_element;
    master_slider_div_class = "master_slider_div";
    master_slider_div_id = cur_state + "_master_slider_div";
    master_input_class = cur_state + "_master_slider";
    master_slider_id = cur_state + "_master_slider";
    master_slider_value = cur_state + "_master_slider_value";
    parent_element = "#" + cur_state + "_comparison";

    let slider_master = d3.select(parent_element)
        .select("." + master_slider_div_class)
        .attr("id", master_slider_div_id);


    slider_master.append("p")
        .text("Master slider: ")
        .append("span")
        .attr("id", master_slider_value)
        .text("0");
    slider_master.append("br")

    slider_master.append("input")
        .attr("id", master_slider_id)
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", 100)
        .attr("value", 0)
        .classed("slider", true)
        .classed("master_slider", true)
        .classed(master_input_class, true)

}


function create_statTable_obj(cur_state) {
    parent_element = "#" + cur_state + "_comparison";

    let table = d3.select(parent_element).select(".statsTable_and_masterSlider");

    table.append('div')
        .attr("class", "statsTableClass")
        .attr("id", cur_state + "_statsTableDiv")
        .append("table")
        .attr("id", cur_state + "_statsTable");
}

create_master_slider("normal");
create_master_slider("mutant");
create_master_slider("pairwise");

create_statTable_obj("normal");
create_statTable_obj("mutant");
create_statTable_obj("pairwise");


const normal_master_slider = document.getElementById("normal_master_slider");
const normal_master_slider_value = document.getElementById("normal_master_slider_value");

const mutant_master_slider = document.getElementById("mutant_master_slider");
const mutant_master_slider_value = document.getElementById("mutant_master_slider_value");

const pairwise_master_slider = document.getElementById("pairwise_master_slider");
const pairwise_master_slider_value = document.getElementById("pairwise_master_slider_value");

let dataTable = document.getElementById('ipdatacsvTbl');
let normal_statsTable = document.getElementById('normal_statsTable');
let mutant_statsTable = document.getElementById('mutant_statsTable');
let pairwise_statsTable = document.getElementById('pairwise_statsTable');

let _cur_statsTable = normal_statsTable;
let comparison_radio = $(document.getElementsByName("comparison"));

let padding = {top: 15, right: 0, bottom: 20, left: 25};
let w = $("#unemploymentCharts").width() * 0.99 - padding.left - padding.right;
let h = 160 - padding.bottom - padding.top;
let svgHeight = h + padding.top + padding.bottom;
let svgWidth = w + padding.left + padding.right;

let xScale = d3.scale.linear().range([0, w]);
let yScale = d3.scale.linear().domain([0, 1]).range([h, 0]);

// todo: auto update num ticks when having a few datum.
let xAxis = d3.svg.axis().scale(xScale).orient("bottom")
    .ticks(10).tickFormat((_, i) => {
    return display_df.select(_atID).toArray().flat()[i];
});

let yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);



let venn_w = 300;
let venn_h = 300;

let venn_div_normal = d3.select("#venn_normal");
let venn_chart_normal = venn.VennDiagram()
    .width(venn_w)
    .height(venn_h);

let venn_div_mutant = d3.select("#venn_mutant");
let venn_chart_mutant = venn.VennDiagram()
    .width(venn_w)
    .height(venn_h);

let venn_div_pairwise = d3.select("#venn_pairwise");
let venn_chart_pairwise = venn.VennDiagram()
    .width(venn_w)
    .height(venn_h);



let _cur_venn_chart, _cur_venn_div;
let _focus, _focus_s1;

let _cur_low_log2fold_set;
let my_data_table, my_stats_table;