const wt_master_slider = document.getElementById("wt_master_slider");
const wt_master_slider_value = document.getElementById("wt_master_slider_value");

wt_cols.slice(1).forEach((wt) => {
    let wt_slider, wt_slider_value;
    wt_slider = document.getElementById(wt + "_slider");
    wt_slider_value = document.getElementById(wt + "_slider_value");

    wt_slider_value.innerHTML = wt_slider.value;
    wt_slider.oninput = function () {
        wt_slider_value.innerHTML = this.value / 100;
        wt_filter();
    }
})


function change_all_slider_values_to_the_master(master_val, cols){
    cols.forEach((col) => {
        let col_slider, col_slider_value;
        col_slider_value = document.getElementById(col + "_slider_value");

        col_slider_value.innerHTML = master_val/ 100;
        $("#"+col + "_slider").val(master_val);

    })
}

wt_master_slider_value.innerHTML = wt_master_slider.value;
wt_master_slider.oninput = function () {
    let master_val = this.value;
    wt_master_slider_value.innerHTML = master_val/ 100;


    change_all_slider_values_to_the_master(master_val, wt_cols.slice(1));
    wt_filter();
    calc_and_show_stats_table();
}


