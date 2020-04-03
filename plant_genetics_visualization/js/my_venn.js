async function read_data_for_venn() {

    let tick = new Date;

    let set_data = {};
    id_set_data = 0;

    set_data[id_set_data] = {};
    set_data[id_set_data]["data"] = [STOP1, STOP1, STOP1, STOP1, STOP1];
    set_data[id_set_data]["name"] = "STOP1";
    id_set_data++;


    await DataFrame.fromCSV("data/Targets_differentially_expressed.csv").then(data => {
        let up = data.select("up").toArray().flat().filter(x => x != "");
        let down = data.select("down").toArray().flat().filter(x => x != "");
        let up_and_down = data.select("up_and_down").toArray().flat().filter(x => x != "");

        set_data[id_set_data] = {};
        set_data[id_set_data]["data"] = [...up, ...down, ...up_and_down];
        set_data[id_set_data]["name"] = "UpDown";
        id_set_data++;
    });


    await DataFrame.fromCSV("data/STOP1_targets_EckerLab_filter.csv").then(data => {
        set_data[id_set_data] = {};
        set_data[id_set_data]["data"] = data.select("atID").toArray().flat().filter(x => x != "");
        set_data[id_set_data]["name"] = "Ecker";
        id_set_data++;
    });

    await DataFrame.fromCSV("data/Transcription_factors.csv").then(data => {
        set_data[id_set_data] = {};
        set_data[id_set_data]["data"] = data.select("TF_EXP").toArray().flat().filter(x => x != "");
        set_data[id_set_data]["name"] = "EXP";
        id_set_data++;

        set_data[id_set_data] = {};
        set_data[id_set_data]["data"] = data.select("TF_DE").toArray().flat().filter(x => x != "");
        set_data[id_set_data]["name"] = "DE";
        id_set_data++;
    });

    await DataFrame.fromCSV("data/filter_nonexpressed.csv").then(data => {
        let filter_low_cpm = data.filter(row => row.get("filter_low_cpm") == 0).select("atID").toArray().flat();
        set_data[id_set_data] = {};
        set_data[id_set_data]["data"] = filter_low_cpm;
        set_data[id_set_data]["name"] = "LowCPM";
        id_set_data++;


        wt_low_log2fold_set = data.filter(row => row.get("wt_low_log2fold") == 1).select("atID").toArray().flat();
        // s1_filter_set = data.filter(row => row.get("s1_filter") == 1).select("atID").toArray().flat();
        // pairwise_filter_set = data.filter(row => row.get("pairwise_filter") == 1).select("atID").toArray().flat();
        _cur_low_log2fold_set = wt_low_log2fold_set;

        set_data[id_set_data] = {};
        set_data[id_set_data]["data"] = _cur_low_log2fold_set;
        set_data[id_set_data]["name"] = "LowLog2Fold";
        id_set_data++; // id -1; dont move this line  above. stay here.


    });


    set_data[id_set_data] = {};
    set_data[id_set_data]["data"] = _cur_df.select("atID").toArray().flat();
    set_data[id_set_data]["name"] = _cur_df.count().toString() + " genes";//"Data";


    console.log("time running = ", (new Date - tick) / 1000);
    return set_data;

}

function update_data_for_venn() {


    if (_upload) {
        _set_data_venn = [];
        id_set_data = 0;
        _set_data_venn[id_set_data] = {};
    }

    if (typeof _set_data_venn != 'undefined') {
        _set_data_venn[id_set_data]["data"] = _cur_df.distinct("atID").toArray().flat();
        _set_data_venn[id_set_data]["name"] = _cur_df.count().toString() + " genes";

        // _set_data_venn[id_set_data - 1]["data"] = _cur_filter_set;
    }
};


function calc_overlapping_number_for_venn(set_venn, sub_set_id, set_data) {
    let res = {}, tmp;

    res["sets"] = sub_set_id;

    if (sub_set_id.length == 1) {
        res["label"] = _set_data_venn[sub_set_id[0]]["name"];
        res["size"] = _set_data_venn[sub_set_id[0]]["data"].length;
        res["data_list"] = _set_data_venn[sub_set_id[0]]["data"];
        return res;
    } else {
        if (_cur_df.count() == _total_df.count() && sub_set_id.includes(id_set_data)) {
            tmp = calc_overlapping_number_for_venn(set_venn, sub_set_id.filter(x => x != id_set_data), set_data);
            res["size"] = tmp["size"];
            res["data_list"] = tmp["data_list"];
        }
            // else if (sub_set_id.includes(id_set_data-1) && sub_set_id.includes(id_set_data-2)){
            //     tmp = calc_overlapping_number_for_venn(set_venn, sub_set_id.filter(x => x!= id_set_data-1), set_data);
            //     res["size"] = tmp["size"];
            //     res["data_list"] = tmp["data_list"];
        // }
        else {
            let intersection = set_data[sub_set_id[sub_set_id.length - 1]]["data"];
            let previous_res = set_venn.find(set => JSON.stringify(set["sets"]) == JSON.stringify(sub_set_id.slice(0, sub_set_id.length - 1)));
            intersection = intersection.filter(x => previous_res["data_list"].includes(x));
            res["size"] = intersection.length;
            res["data_list"] = intersection;

        }


        return res;


    }

}

function create_sets_obj_for_venn() {

    let sets_venn = [];
    let all_set_ids = get_all_subsets_id(Object.keys(_set_data_venn).length);
    let tick = new Date;

    let time = 0;
    for (let i = 0; i < all_set_ids.length; i++) {

        let tmp = calc_overlapping_number_for_venn(sets_venn, all_set_ids[i], _set_data_venn);
        sets_venn.push(tmp);
    }
    time += new Date - tick;


    console.log("running time of creating set obj === --- ", (time) / 1000);
    return sets_venn;
}

function draw_venn(sets_venn) {

    console.log("sets_venn is", sets_venn);

    let tmp = d3.select("#venn_" + _cur_class);
    if (typeof tmp != "undefined") {
        d3.select("#venn_" + _cur_class).selectAll("*").remove();
        console.log("removed!");

    }

    _cur_venn_div.datum(sets_venn).call(_cur_venn_chart);


    var tooltip = d3.select("body").append("div")
        .attr("class", "venntooltip");

    _cur_venn_div.selectAll("path")
        .style("stroke-opacity", 0)
        // .style("stroke", "#fff")
        .style("stroke", "lightblue")
        .style("stroke-width", 3)


    _cur_venn_div.selectAll("g")
        .on("mouseover", function (d, i) {
            // sort all the areas relative to the current item
            venn.sortAreas(_cur_venn_div, d);

            // Display a tooltip with the current size
            tooltip.transition().duration(1).style("opacity", .9);


            if (d.label == _cur_df.count().toString() + " genes") {
                tooltip.text(d.size + ` from ${_total_df.count()} genes`);
            } else if (d.sets.includes(0)) { //include s1's set
                tooltip.text("STOP1");
            } else {
                tooltip.text(d.size + " genes");
            }

            // highlight the current path
            var selection = d3.select(this).transition("tooltip").duration(1);
            selection.select("path")
                .style("fill-opacity", d.sets.length == 1 ? .4 : .1)
                // .style("fill-opacity", d.sets.includes(0) ? 1 : .1)
                .style("stroke-opacity", 1);
        })

        .on("mousemove", function () {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })

        .on("mouseout", function (d, i) {
            tooltip.transition().duration(1).style("opacity", 0);
            var selection = d3.select(this).transition("tooltip").duration(1);
            selection.select("path")
                .style("fill-opacity", d.sets.length == 1 ? .25 : .0)
                // .style("fill-opacity", d.sets.includes(0) ? 1 : .0)
                .style("stroke-opacity", 0);
        })
        .on("click", (d) => {
            console.log(d);

            // trivial code.
            if (d.label == _cur_df.count().toString() + " genes" && d.size == _cur_df.count()) {
                console.log("it's the current Data => return, nothing change!")
                return;

            }
            let data = _total_df.filter(row => d.data_list.includes(row.get("atID")));
            _cur_df = data;

            reset_DisplayIndex_and_DisplayDF();
            updateDataForSVGCharts();
            print_paging_sms_for_chart();
            updateCharts();

            updateTAbleWithColor();


        });


}

