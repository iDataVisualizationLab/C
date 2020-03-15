const ENCODE_COLOR = {
    1: MY_COLORS.green,
    2: MY_COLORS.orange,
    3: MY_COLORS.gray,
}
let my_stats_table;
function calc_stat_for_1_combination(df, cols, base_col, compare_conditions, master_slider, pairwise) {
    for (let i = 0, n = cols.length; i < n; i++) {
        let condition = compare_conditions[i];
        let col = cols[i];

        if (pairwise) {
            base_col = col.replace("s1", "wt");
        }

        if (condition == 1) {  //greater
            df = df
                .filter(row => row.get(base_col) < (row.get(col) - parseInt(master_slider.value) / 100));
        } else if (condition == 2) {  //less
            df = df
                .filter(row => row.get(base_col) - parseInt(master_slider.value) / 100 > (row.get(col)));
        } else if (condition == 3) {  // does NOT change
            df = df
                .filter(row => Math.abs(row.get(base_col) - row.get(col)) <= parseInt(master_slider.value) / 100);
        }
    }
    return df.dim()[0];
}

function calc_all_stats(df, cols, base_col, master_slider, pairwise) {
    let compare_conditions_list = [];
    permutator_base_3([], compare_conditions_list, cols.length);

    let results = [];
    for (let i = 0, n = compare_conditions_list.length; i < n; i++) {
        let compare_conditions = compare_conditions_list[i]

        results.push(calc_stat_for_1_combination(df, cols, base_col, compare_conditions, master_slider, pairwise));


    }
    let stats_results = zip([compare_conditions_list, results]).map((x) => x.flat());
    // console.log(stats_results);

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

    let _cols, master_slider, base, stats_col_names;
    let pairwise = false;
    console.log("cur_active_tab", cur_active_tab);
    if (cur_active_tab == tab_names["wt"]) {
        _cols = wt_cols.slice(1);
        stats_col_names = _cols;
        base = wt_cols[0];
        master_slider = wt_master_slider;
    } else if (cur_active_tab == tab_names["s1"]) {
        _cols = s1_cols.slice(1);
        base = s1_cols[0];
        stats_col_names = _cols;
        master_slider = s1_master_slider;

    } else if (cur_active_tab == tab_names["pairwise"]) {
        _cols = s1_cols;
        master_slider = pairwise_master_slider;
        pairwise = true;
        stats_col_names = _cols.map(x => x.replace('s1', ""));
        // No need to set "base" for pairwise
    }


    console.log("starting calc... It takes too long => need a server to handle the computation");
    let tick = new Date;
    let stats_results = calc_all_stats(_df, _cols, base, master_slider, pairwise);
    console.log(`thank goodness, finally its done, running time = ${ (tick - new Date) / 1000}s`);

    let new_header = [...stats_col_names, "#genes"];
    const df = new DataFrame(stats_results, new_header);


    if( my_stats_table){
        my_stats_table.destroy();
        $(statsTable).empty();
    }



    create_stats_table(statsTable, df.toCollection());

    df.show();
    // console.log("new_header", new_header);
    // for (let i=0; i < new_header.length; i++){
    //     let head_item = my_stats_table.columns(i).header();
    //     $(head_item ).text(new_header[i]);
    // }


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

// function show_stats_table(tbl, df.toCollection()) {
// test
// calc_stat_for_1_normal_mode(_df, wt_cols.slice(1), wt_cols[0], [1,1,1,1,1])

// calc_all_stats_normal_mode(_df, wt_cols.slice(1), wt_cols[0])
