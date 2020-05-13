function updateTable(tbl, rows) {
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

                if (hd != _atID) {
                    cell.innerHTML = parseFloat(text).toFixed(2);

                } else {
                    if (hd != STOP1) {
                        cell.innerHTML = text;
                    } else {
                        cell.innerHTML = text + S1_TEXT;
                    }
                }
            });
        });
    }
}


function updateTAbleWithColor() {
    if (my_data_table && _just_upload_file["dataTable"]) {
        my_data_table.destroy();
        $(dataTable).empty();
        _just_upload_file["dataTable"] = false;
    }

    let tbl = dataTable;
    let rows;
    let tick = new Date;

    console.log("show_raw_data = ", show_raw_data);
    if (show_raw_data) {
        let all_id_list = display_df.select(_atID).toArray().flat();
        display_df_RAW = _total_df_RAW.filter(row => all_id_list.includes(row.get(_atID)));

        /////// sort display raw according to display norm, but it's too slow.
        // display_df_RAW = display_df_RAW.join(display_df.select(_atID, wt_base).rename(wt_base, wt_base + "_norm"), _atID, "inner").sortBy(wt_base + "_norm");
        // display_df_RAW = display_df_RAW.drop(wt_base + "_norm")
        rows = display_df_RAW.toCollection();
    } else {
        rows = display_df.toCollection();
    }
    console.log(`.....---- FINISH  filter ${(new Date - tick) / 1000}s`);


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
                let responding_base;

                /// Color:
                if (_cur_condition_cols.includes(hd)) {
                    if (_pairwise) {
                        responding_base = get_responding_normal_from_mutant(hd)
                    } else {
                        responding_base = _cur_base;
                    }
                    if (parseFloat(text) > parseFloat(rowDt[responding_base]) ) {
                        cell.style.color = cell_colors["greater"];
                    } else if (parseFloat(text) < parseFloat(rowDt[responding_base]) ) {
                        cell.style.color = cell_colors["less"];
                    }
                }

                if (hd != _atID) {
                    cell.innerHTML = parseFloat(text).toFixed(2);

                } else {
                    if (text != STOP1) {
                        cell.innerHTML = text;
                    } else {
                        cell.innerHTML = text + S1_TEXT;
                    }
                }

            });
        });
    }

}

function updateTableAndVenn(tbl = dataTable, rows = display_df.toCollection(), update_venn = true) {
    if (update_venn) {
        if (typeof _set_data_venn != "undefined") {
            update_data_for_venn();
            let sets_venn = create_sets_obj_for_venn();
            draw_venn(sets_venn);

        }
    }

    //// circel stop1 gene
    if (plot_stop1) {
        let stop1_row = display_df.find(row => row.get(_atID).replace(S1_TEXT, "") == STOP1);
        let tmp = _focus_s1[0].filter(g => _cur_condition_cols.includes(g.__data__.gene));

        if (typeof stop1_row != "undefined") {

            let all_data = display_df.select(_atID).toArray().flat();
            let index = all_data.indexOf(STOP1);
            let data_and_columnNames = zip([display_df.listColumns(), stop1_row.toArray()]);//can use toDict()-> easier+faster
            tmp.forEach(g => {
                    let focus = d3.select(g);
                    let data = data_and_columnNames.filter((col) => col[0] == g.__data__.gene);
                    data = data[0];
                    focus.style("display", null);
                    focus.attr("transform", "translate(" + xScale(index) + "," + yScale(data[1]) + ")");
                }
            )
        } else {
            tmp.forEach(g => {
                    let focus = d3.select(g);
                    focus.style("display", "none");
                }
            )

        }
    }


    updateTAbleWithColor();
    add_events_for_dataTable();


}

function add_events_for_dataTable() {
    $(document).ready(function () {
            my_data_table = $(dataTable).DataTable({
                ordering: false,
                searching: false,

                destroy: true,
                paging: false,
                bInfo: false,
            });
            // todo: the cirlce from table to the chart is not exactly point at the right position.
            $("#ipdatacsvTbl tbody").on('mouseover', 'tr', function () {
                let row_data;
                let headers = display_df.listColumns();
                let data_and_columnNames;

                row_data = my_data_table.row(this).data();

                if (show_raw_data) {
                    row_data = display_df.find(row => row.get(_atID).replace(S1_TEXT, "") == row_data[0]).toArray().flat();
                }


                data_and_columnNames = zip([headers, row_data])

                let atID_list = display_df.select(_atID).toArray().flat();
                let index = atID_list.indexOf(row_data[0].replace(S1_TEXT, ""));
                show_circle_when_mouseenter_the_dataTable(index, data_and_columnNames);

                this.style.backgroundColor = MY_COLORS["lightbluesky"];
                this.style.fontWeight = "bold";
            });


            $("#ipdatacsvTbl tbody").on('mouseout', 'tr', function () {
                this.style.fontWeight = "normal";
                let row_data = my_data_table.row(this).data();
                let atID_list = display_df.select(_atID).toArray().flat();
                let index = atID_list.indexOf(row_data[0]);
                this.style.backgroundColor = (index + 1) % 2 == 0 ? '#ececec' : '#ffffff';


            });


            $("#ipdatacsvTbl tbody").on('mouseout', function () {
                _focus.style("display", "none");
            })


        }
    )
}

