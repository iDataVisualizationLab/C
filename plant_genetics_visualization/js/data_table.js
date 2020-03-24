
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

                if (hd != "atID") {
                    cell.innerHTML = parseFloat(text).toFixed(2);

                } else {
                    cell.innerHTML = text;
                }
            });
        });
    }
}


function updateTAbleWithColor(tbl = dataTable, rows = display_df.toCollection()) {



    console.log("inside updateTableWithColor...");
    console.log("curr_class", _cur_class);
    let tick = new Date;

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
                        responding_base = get_responding_wt_from_s1(hd)
                    } else {
                        responding_base = _cur_base;
                    }
                    if (text > rowDt[responding_base]) {
                        cell.style.color = cell_colors["greater"];
                    } else if (text < rowDt[responding_base]) {
                        cell.style.color = cell_colors["less"];
                    }
                }

                if (hd != "atID") {
                    cell.innerHTML = parseFloat(text).toFixed(2);

                } else {
                    cell.innerHTML = text;
                }

            });
        });
    }
    console.log(`.....---- FINISH drawing table in ${(new Date - tick) / 1000}s`);

}



function updateTableAndVenn(tbl = dataTable, rows = display_df.toCollection()) {
    if (typeof _set_data_venn != "undefined"){
        update_data_for_venn();
        let sets_venn = create_sets_obj_for_venn();
        draw_venn(sets_venn);
    }

    updateTAbleWithColor(tbl, rows);

    $(document).ready(function () {
            let my_data_table = $(dataTable).DataTable({
                // Todo: show the sorting arrows

                ordering: false,

                destroy: true,
                paging: false,
                bInfo: false,
            });
            $("#ipdatacsvTbl tbody").on('mouseenter', 'tr', function () {
                let row_data = my_data_table.row(this).data();
                let atID_list = display_df.select("atID").toArray().flat();
                let index = atID_list.indexOf(row_data[0]);
                show_circle_when_mouseenter_the_dataTable(index, row_data);
            });

        }
    )
}

