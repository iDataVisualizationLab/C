const wt_master_slider = document.getElementById("wt_master_slider");
const wt_master_slider_value = document.getElementById("wt_master_slider_value");

const s1_master_slider = document.getElementById("s1_master_slider");
const s1_master_slider_value = document.getElementById("s1_master_slider_value");

const pairwise_master_slider = document.getElementById("pairwise_master_slider");
const pairwise_master_slider_value = document.getElementById("pairwise_master_slider_value");

let my_stats_table;

let dataTable = document.getElementById('ipdatacsvTbl');
let statsTable = document.getElementById('statsTable');
let comparison_radio = $(document.getElementsByName("comparison"));

let margin = {top: 15, right: 0, bottom: 20, left: 25};
let w = $("#unemploymentCharts").width() * 0.99 - margin.left - margin.right;
let h = 200 - margin.bottom - margin.top;
let svgHeight = h + margin.top + margin.bottom;
let svgWidth = w + margin.left + margin.right;

let xScale = d3.scale.linear().range([0, w]);
let yScale = d3.scale.linear().domain([0, 1]).range([h, 0]);

// todo: auto update num ticks when having a few datum.
let xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(6).tickFormat((_, i) => {
    console.log("==============here inside xAxis");
    return display_df.select("atID").toArray().flat()[i];
});

let yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);