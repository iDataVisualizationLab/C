const cell_colors = {
    "greater": MY_COLORS.green,
    "less": MY_COLORS.orange,
    "no_color": MY_COLORS.gray
}

function updateTable(tbl, rows) {
    // document.getElementById("printNumGenes").innerHTML = "Number of genes:" + rows.length;
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

                if (hd != "atID"){
                    cell.innerHTML = parseFloat(text).toFixed(2);

                }
                else{
                    cell.innerHTML = text;
                }
            });
        });
    }
}

function updateTableWithColor(tbl=dataTable, rows = display_df.toCollection(), pairwise = false, is_wt=true) {
    console.log("inside updateTableWithColor...");
    let tick = new Date;

    // document.getElementById("printNumGenes").innerHTML = "Number of genes:" + rows.length + "/"+ "";
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
                    if (is_wt){ //color for wt comparison
                        if (wt_cols.slice(1).includes(hd)) {
                            if (text > rowDt[wt_cols[0]]) {
                                cell.style.color = cell_colors["greater"];
                            } else if (text < rowDt[wt_cols[0]]) {
                                cell.style.color = cell_colors["less"];
                            }
                        }
                    }
                    else{ //color for s1 cols
                        if (s1_cols.slice(1).includes(hd)) {
                            if (text > rowDt[s1_cols[0]]) {
                                cell.style.color = cell_colors["greater"];
                            } else if (text < rowDt[s1_cols[0]]) {
                                cell.style.color = cell_colors["less"];
                            }
                        }
                    }
                }
                else {   // pairwise
                    if (s1_cols.includes(hd)) {
                        let responding_wt = get_responding_wt_from_s1(hd);
                        if ( text > rowDt[responding_wt]) {
                            cell.style.color = cell_colors["greater"];
                        } else if ( text < rowDt[responding_wt]) {
                            cell.style.color = cell_colors["less"];
                        }
                    }
                }
                if (hd != "atID"){
                    cell.innerHTML = parseFloat(text).toFixed(2);

                }
                else{
                    cell.innerHTML = text;
                }

            });
        });
    }
    console.log(`.....---- FINISH drawing table in ${(new Date - tick)/1000}s`);

}

