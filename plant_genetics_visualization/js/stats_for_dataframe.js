function calc_stat_for_1_normal_mode(df, cols, base_col, compare_conditions) {
    for (let i = 0, n = cols.length; i < n; i++) {
        let condition = compare_conditions[i];
        let col = cols[i];

        // if (condition == 1){  //greater
        //     filteredDf = filteredDf
        //         .filter(row => row.get(base_col) < (row.get(col) - parseInt(slider.value) / 100));
        // }
        // else{  // condition == -1, less
        //     filteredDf = filteredDf
        //         .filter(row => row.get(base_col) - parseInt(slider.value) / 100 > row.get(col));
        // }

        if (condition == true) {  //greater
            df = df
                .filter(row => row.get(base_col) < (row.get(col) - parseInt(wt_master_slider.value) / 100));
        } else {  // condition == false, less
            df = df
                .filter(row => row.get(base_col) - parseInt(wt_master_slider.value) / 100 > row.get(col));
        }
    }
    return df.dim()[0];
}

function calc_all_stats_normal_mode(df, cols, base_col) {
    let compare_conditions_list = permutator(cols.length);
    let results = [];
    for (let i = 0, n = compare_conditions_list.length; i < n; i++) {
        let compare_conditions = compare_conditions_list[i]
        results.push(calc_stat_for_1_normal_mode(df, cols, base_col, compare_conditions));

    }
    let stats_results = zip([compare_conditions_list, results]).map((x) => x.flat());
    console.log(stats_results);

    return stats_results;

}

function show_stats_table(tbl, rows) {
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
                cell.innerHTML = parseFloat(text).toFixed(2);
                cell.innerHTML = text;
            });
        });
    }
}

function f() {
    let stats_results = calc_all_stats_normal_mode(_df, wt_cols.slice(1), wt_cols[0]);
    const df = new DataFrame(stats_results, [...wt_cols.slice(1), "#genes"]);
    df.show();

    show_stats_table(statsTable, df.toCollection());

    $(document).ready(function () {
            $(statsTable).DataTable({

                'rowCallback': function (row, data, index) {
                    data.forEach((d, index_) => {
                        let cell = $(row).find(`td:eq(${index_})`);

                        if (d.toString() == "true") {

                            cell.css('background', MY_COLORS.green);
                            cell.text("");

                        } else if (d.toString() == "false"){
                            cell.css('background', MY_COLORS.orange);
                            cell.text("");

                        }
                    });

                },

                order: [[df.dim()[1]-1, 'des']],


                destroy: true,
                // scrollY:        '200px',
                // scrollCollapse: true,
                paging: false,
                searching: false,
                bInfo: false,

            });
        }
    )
}

// function show_stats_table(tbl, df.toCollection()) {
// test
// calc_stat_for_1_normal_mode(_df, wt_cols.slice(1), wt_cols[0], [1,1,1,1,1])

// calc_all_stats_normal_mode(_df, wt_cols.slice(1), wt_cols[0])
