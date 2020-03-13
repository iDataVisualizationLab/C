
const ENCODE_COLOR = {
    1: MY_COLORS.green,
    2: MY_COLORS.orange,
    3: MY_COLORS.gray,
}

function calc_stat_for_1_normal_mode(df, cols, base_col, compare_conditions) {
    for (let i = 0, n = cols.length; i < n; i++) {
        let condition = compare_conditions[i];
        let col = cols[i];


        if (condition == 1) {  //greater
            df = df
                .filter(row => row.get(base_col) < (row.get(col) - parseInt(wt_master_slider.value) / 100));
        } else if (condition == 2) {  //less
            df = df
                .filter(row => row.get(base_col) - parseInt(wt_master_slider.value)/ 100 > (row.get(col)  ));
        }
        else if (condition == 3){  // does NOT change
            df = df
                .filter(row => Math.abs(row.get(base_col) - row.get(col)) <= parseInt(wt_master_slider.value) / 100);
        }
    }
    return df.dim()[0];
}

function calc_all_stats_normal_mode(df, cols, base_col) {
    let compare_conditions_list = [];
    permutator_base_3([], compare_conditions_list, cols.length);
    let results = [];
    for (let i = 0, n = compare_conditions_list.length; i < n; i++) {
        let compare_conditions = compare_conditions_list[i]
        results.push(calc_stat_for_1_normal_mode(df, cols, base_col, compare_conditions));

    }
    let stats_results = zip([compare_conditions_list, results]).map((x) => x.flat());
    console.log(stats_results);

    return stats_results;

}

function create_stats_table(tbl, rows) {

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

                if (hd != "#genes"){
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
                }
                else { //last column => show #genes
                    cell.innerHTML = text;
                }
            });
        });
    }
}


function click_row_callback(row_data){

    let color_list = row_data.map(x => ENCODE_COLOR[x]);

    // change all the sliders' values to the  master slider: Done
    let master_val = parseInt(wt_master_slider.value); //hardcode first to test;
    wt_master_slider_value.innerHTML = master_val/ 100;
    change_all_slider_values_to_the_master(master_val, wt_cols.slice(1));

    // Change color of buttons, do NOT trigger the event button click
    let button_list = document.getElementsByClassName("wt_filter_btn");
    button_list.forEach( (btn, i) => change_color_when_click_btn(btn, color_list[i]));


    //  call update wt_btn function => filter all the btn at once
    wt_filter();

}

function calc_and_show_stats_table() {
    let stats_results = calc_all_stats_normal_mode(_df, wt_cols.slice(1), wt_cols[0]);
    const df = new DataFrame(stats_results, [...wt_cols.slice(1), "#genes"]);
    df.show();

    create_stats_table(statsTable, df.toCollection());

    $(document).ready(function () {
            let my_table = $(statsTable).DataTable({

                // Todo: show the sorting arrows


                // 'rowCallback': function (row, data, index) {
                //     data.forEach((d, index_) => {
                //         let cell = $(row).find(`td:eq(${index_})`);
                //
                //         if (d.toString() == "true") {
                //
                //             cell.css('background', MY_COLORS.green);
                //             cell.text("");
                //
                //         } else if (d.toString() == "false") {
                //             cell.css('background', MY_COLORS.orange);
                //             cell.text("");
                //
                //         }
                //     });
                //
                // },

                order: [[df.dim()[1] - 1, 'des']],


                destroy: true,
                // scrollY:        '200px',
                // scrollCollapse: true,
                paging: false,
                searching: false,
                bInfo: false,

            });


            $("#statsTable tbody").on('click', 'tr', function () {
                let row_data = my_table.row(this).data();
                click_row_callback(row_data.slice(0,row_data.length-1));
            });


        }
    )
}

// function show_stats_table(tbl, df.toCollection()) {
// test
// calc_stat_for_1_normal_mode(_df, wt_cols.slice(1), wt_cols[0], [1,1,1,1,1])

// calc_all_stats_normal_mode(_df, wt_cols.slice(1), wt_cols[0])
