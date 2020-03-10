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

wt_master_slider_value.innerHTML = wt_master_slider.value;
wt_master_slider.oninput = function () {
    let master_val = this.value;
    wt_master_slider_value.innerHTML = master_val/ 100;

    wt_cols.slice(1).forEach((wt) => {
        let wt_slider, wt_slider_value;
        wt_slider_value = document.getElementById(wt + "_slider_value");

        wt_slider_value.innerHTML = master_val/ 100;
        $("#"+wt + "_slider").val(master_val);



    })

    wt_filter();
    calc_all_stats_normal_mode(_df, wt_cols.slice(1), wt_cols[0]);
}


