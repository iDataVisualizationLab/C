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
                .filter(row => row.get(base_col) < (row.get(col) - parseInt(wt_master_slider.value)/100 ));
        } else {  // condition == false, less
            df = df
                .filter(row => row.get(base_col) - parseInt(wt_master_slider.value)/100 > row.get(col));
        }
    }
    return df.dim()[0];
}

function calc_all_stats_normal_mode(df, cols, base_col){
    let compare_conditions_list = permutator(cols.length);
    let results=[];
    for (let i = 0, n = compare_conditions_list.length; i < n; i++) {
        let compare_conditions = compare_conditions_list[i]
        results.push(calc_stat_for_1_normal_mode(df, cols, base_col, compare_conditions) );

    }
    console.log(results);
    return results;

}

// test
// calc_stat_for_1_normal_mode(_df, wt_cols.slice(1), wt_cols[0], [1,1,1,1,1])

// calc_all_stats_normal_mode(_df, wt_cols.slice(1), wt_cols[0])
