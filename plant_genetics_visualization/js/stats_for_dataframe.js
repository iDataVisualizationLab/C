const ENCODE_COLOR = {
    1: MY_COLORS.green,
    2: MY_COLORS.orange,
    3: MY_COLORS.gray,
}
let my_stats_table;
let my_stats_data;
let _row;


function row_to_cluster(row, condition_cols, base_col, thres, pairwise, all_cluster) {
    let cluster = [];

    for (let i = 0; i < condition_cols.length; i++) {
        if (pairwise) {
            base_col = condition_cols[i].replace("s1", "wt"); // Todo add variable
        }

        if (parseFloat(row.get(condition_cols[i])) - parseFloat(row.get(base_col)) > parseFloat(thres)) {
            cluster.push(1);
        } else if (parseFloat(row.get(base_col)) - parseFloat(row.get(condition_cols[i])) > parseFloat(thres)) {
            cluster.push(2);
        } else if (Math.abs(parseFloat(row.get(base_col)) - parseFloat(row.get(condition_cols[i]))) <= parseFloat(thres)) {
            cluster.push(3);
        }
    }
    all_cluster[cluster] += 1;

}

function calc_stat_for_1_combination(df, condition_cols, base_col, master_slider, pairwise, all_cluster) {
    let thres = master_slider.value / 100;
    df.map((row) => row_to_cluster(row, condition_cols, base_col, thres, pairwise, all_cluster));

    return all_cluster;
}


function calc_all_stats(df, condition_cols, base_col, master_slider, pairwise) {
    let compare_conditions_list = [];
    let all_cluster = {};
    permutator_base_3([], compare_conditions_list, condition_cols.length);

    compare_conditions_list.forEach(cluster => all_cluster[cluster] = 0);

    let stats_results = [];
    all_cluster = calc_stat_for_1_combination(df, condition_cols, base_col, master_slider, pairwise, all_cluster);
    stats_results = Object.entries(all_cluster).map(x => [...x[0].split(","), x[1]]);

    return stats_results;
}

function create_stats_table(tbl, rows) {
    $(statsTable).empty();


    tbl.innerHTML = '';
    if (rows && rows.length > 0) {
        let headers = Object.keys(rows[0]);

        let header = tbl.createTHead();
        let body = tbl.createTBody();
        let hRow = header.insertRow();
        headers.forEach(hd => {
            let hCell = hRow.insertCell();
            hCell.innerText = hd;
        });

        rows.forEach(rowDt => {
            let row = body.insertRow();
            headers.forEach(hd => {
                let cell = row.insertCell();
                let text = rowDt[hd];

                if (hd != "#genes") {
                    if (text == 1) { //up
                        cell.style.background = MY_COLORS.green;
                        cell.innerHTML = text;
                        cell.style.color = cell.style.background;
                    } else if (text == 2) { // down
                        cell.style.background = MY_COLORS.orange;
                        cell.innerHTML = text;
                        cell.style.color = cell.style.background;
                    } else if (text == 3) { // does NOT change
                        cell.style.background = MY_COLORS.gray;
                        cell.innerHTML = text;
                        cell.style.color = cell.style.background;
                    }
                } else { //last column => show #genes
                    cell.innerHTML = text;
                }
            });
        });
    }
}


function click_row_callback(row_data) {

    let filter_func, button_list;
    //check cur active tab:
    if (cur_active_tab == tab_names["wt"]) {
        let master_val = parseInt(wt_master_slider.value);
        wt_master_slider_value.innerHTML = master_val / 100;
        change_all_slider_values_to_the_master(master_val, wt_cols.slice(1));
        button_list = document.getElementsByClassName("wt_filter_btn");

        filter_func = wt_filter;
    } else if (cur_active_tab == tab_names["s1"]) {
        let master_val = parseInt(s1_master_slider.value);
        s1_master_slider_value.innerHTML = master_val / 100;
        change_all_slider_values_to_the_master(master_val, s1_cols.slice(1));
        button_list = document.getElementsByClassName("s1_filter_btn");

        filter_func = s1_filter;
    } else if (cur_active_tab == tab_names["pairwise"]) {
        let master_val = parseInt(pairwise_master_slider.value);
        pairwise_master_slider_value.innerHTML = master_val / 100;
        change_all_slider_values_to_the_master(master_val, s1_cols, true);
        button_list = document.getElementsByClassName("pairwise_filter_btn");

        filter_func = pairwise_filter;
    }

    let color_list = row_data.map(x => ENCODE_COLOR[x]);

    // Change color of buttons, do NOT trigger the event button click
    button_list.forEach((btn, i) => change_color_when_click_btn(btn, color_list[i]));


    //  call update all btns function => filter all the btn at once
    filter_func();
}

function calc_and_show_stats_table() {
    let condition_cols, master_slider, base, stats_col_names, df;
    let pairwise = false;

    if (cur_active_tab == tab_names["wt"]) {
        condition_cols = wt_cols.slice(1);
        stats_col_names = condition_cols;
        base = wt_cols[0];
        master_slider = wt_master_slider;
    } else if (cur_active_tab == tab_names["s1"]) {
        condition_cols = s1_cols.slice(1);
        base = s1_cols[0];
        stats_col_names = condition_cols;
        master_slider = s1_master_slider;

    } else if (cur_active_tab == tab_names["pairwise"]) {
        condition_cols = s1_cols;
        master_slider = pairwise_master_slider;
        pairwise = true;
        stats_col_names = condition_cols.map(x => x.replace('s1', ""));
        // No need to set "base" for pairwise
    }


    console.log("Calculating the summary table...");
    let tick = new Date;
    let stats_results = calc_all_stats(_total_df, condition_cols, base, master_slider, pairwise);
    console.log(`Done the computation, running time = ${(new Date - tick) / 1000}s`);


    let new_header = [...stats_col_names, "#genes"];
    df = new DataFrame(stats_results, new_header);


    if (my_stats_table) {
        my_stats_table.destroy();
        $(statsTable).empty();
    }

    create_stats_table(statsTable, df.toCollection());


    $(document).ready(function () {
            my_stats_table = $(statsTable).DataTable({
                // Todo: show the sorting arrows
                order: [[df.dim()[1] - 1, 'des']],

                destroy: true,
                // scrollY:        '200px',
                // scrollCollapse: true,
                paging: false,
                searching: false,
                bInfo: false,

            });
            $("#statsTable tbody").on('click', 'tr', function () {
                let row_data = my_stats_table.row(this).data();
                click_row_callback(row_data.slice(0, row_data.length - 1));
            });
        }
    )


}
