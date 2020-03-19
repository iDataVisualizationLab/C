const wt_master_slider = document.getElementById("wt_master_slider");
const wt_master_slider_value = document.getElementById("wt_master_slider_value");

const s1_master_slider = document.getElementById("s1_master_slider");
const s1_master_slider_value = document.getElementById("s1_master_slider_value");

const pairwise_master_slider = document.getElementById("pairwise_master_slider");
const pairwise_master_slider_value = document.getElementById("pairwise_master_slider_value");


function change_all_slider_values_to_the_master(master_val, cols, pairwise) {
    let col_slider_value, col_slider, col_btn;

    if (!pairwise) {

        cols.forEach((col) => {
            col_slider_value = document.getElementById(col + "_slider_value");
            col_slider = document.getElementById(col + "_slider");
            col_btn = document.getElementById(col + "_btn");

            col_slider_value.innerHTML = master_val / 100;
            $("#" + col + "_slider").val(master_val);
            change_color_ctrl_slider_bar_auto_choose_color(col_btn, col_slider, master_val);


        })
    } else {
        cols.forEach((col) => {
            col_slider_value = document.getElementById(col.replace("s1", "pairwise_") + "_slider_value");
            col_slider = document.getElementById(col.replace("s1", "pairwise_") + "_slider");
            col_btn = document.getElementById(col.replace("s1", "pairwise_") + "_btn");

            col_slider_value.innerHTML = master_val / 100;
            $("#" + col.replace("s1", "pairwise_") + "_slider").val(master_val);
            change_color_ctrl_slider_bar_auto_choose_color(col_btn, col_slider, master_val);


        })

    }

}

function update_text_when_sliders_change(sl, filter_func, pairwise = false) {
    let slider, slider_value, col_btn;
    if (!pairwise) {
        slider = document.getElementById(sl + "_slider");
        slider_value = document.getElementById(sl + "_slider_value");
        col_btn = document.getElementById(sl + "_btn");

    } else {
        slider = document.getElementById(sl.replace("s1", "pairwise_") + "_slider");
        slider_value = document.getElementById(sl.replace("s1", "pairwise_") + "_slider_value");
        col_btn = document.getElementById(sl.replace("s1", "pairwise_") + "_btn");

    }


    slider_value.innerHTML = slider.value;
    slider.oninput = function () {
        slider_value.innerHTML = this.value / 100;
        filter_func();
        change_color_ctrl_slider_bar_auto_choose_color(col_btn, slider, slider.value);

    }
}


wt_cols.slice(1).forEach(wt => update_text_when_sliders_change(wt, auto_filter));
s1_cols.slice(1).forEach(s1 => update_text_when_sliders_change(s1, auto_filter));
s1_cols.forEach(s1 => update_text_when_sliders_change(s1, auto_filter, true));


wt_master_slider_value.innerHTML = wt_master_slider.value;
wt_master_slider.oninput = function () {
    let master_val = this.value;
    let _this = this;
    wt_master_slider_value.innerHTML = master_val / 100;


    change_color_slider_bar(_this, master_val, MY_COLORS.gray, MY_COLORS.slider_master);


    change_all_slider_values_to_the_master(master_val, wt_cols.slice(1));
    auto_filter();
    document.getElementById("printStats").innerHTML = `Summary for threshold = ${master_val / 100}`;
    calc_and_show_stats_table();


}


s1_master_slider_value.innerHTML = s1_master_slider.value;
s1_master_slider.oninput = function () {

    let master_val = this.value;


    s1_master_slider_value.innerHTML = master_val / 100;
    let _this = this;
    change_color_slider_bar(_this, master_val, MY_COLORS.gray, MY_COLORS.slider_master);


    change_all_slider_values_to_the_master(master_val, s1_cols.slice(1));
    s1_filter();
    document.getElementById("printStats").innerHTML = `Summary for threshold = ${master_val / 100}`;
    calc_and_show_stats_table();
}


pairwise_master_slider_value.innerHTML = pairwise_master_slider.value;
pairwise_master_slider.oninput = function () {
    let master_val = this.value;
    pairwise_master_slider_value.innerHTML = master_val / 100;
    let _this = this;
    change_color_slider_bar(_this, master_val, MY_COLORS.gray, MY_COLORS.slider_master);

    change_all_slider_values_to_the_master(master_val, s1_cols, true);
    auto_filter();
    document.getElementById("printStats").innerHTML = `Summary for threshold = ${master_val / 100}`;
    calc_and_show_stats_table();
}



