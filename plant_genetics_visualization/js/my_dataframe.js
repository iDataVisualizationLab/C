const cell_colors = {
    "greater": "rgb(145, 207, 96)",
    "less": "rgb(252, 141, 89)",
    "no_color": "rgb(231, 231, 231)",
}


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

                cell.innerHTML = text;
            });
        });
    }
}

function updateTableWithColor(tbl, rows, pairwise = false) {
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


                /// Color:
                if (!pairwise) {  // normal mode
                    if (wt_cols.slice(1).includes(hd)) {
                        let index_of_cur_hd = color_arr.indexOf(hd);
                        let adjacent_hd = wt_cols[index_of_cur_hd + 1];
                        if (rowDt[adjacent_hd] > text) {
                            cell.style.color = cell_colors["greater"];
                        } else if (rowDt[adjacent_hd] < text) {
                            cell.style.color = cell_colors["less"];
                        }
                    }
                }
                else {   // pairwise
                //     let index_of_cur_hd = color_arr.indexOf(hd);
                //     let adjacent_hd = wt_cols[index_of_cur_hd + 1];
                //     if (rowDt[adjacent_hd] > text) {
                //         cell.style.color = cell_colors["greater"];
                //     } else if (rowDt[adjacent_hd] < text) {
                //         cell.style.color = cell_colors["less"];
                //     }
                //
                // }
                // if (hd === COL_DEVICE_ACTION) {
                //     cell.style.color = deviceActionColors[text];
                // } else if (hd === COL_SOURCE_ADDRESS || hd === COL_DESTINATION_ADDRESS) {
                //     cell.style.color = nodeColor({id: text});
                // } else if (hd === COL_END_TIME) {
                //     text = d3.timeFormat("%b %d %Y %H:%M:%S")(text);
                // }
                cell.innerHTML = text;
            });
        });
    }
}

