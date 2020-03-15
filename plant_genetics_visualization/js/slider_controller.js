const wt_master_slider = document.getElementById("wt_master_slider");
const wt_master_slider_value = document.getElementById("wt_master_slider_value");

const s1_master_slider = document.getElementById("s1_master_slider");
const s1_master_slider_value = document.getElementById("s1_master_slider_value");

const pairwise_master_slider = document.getElementById("pairwise_master_slider");
const pairwise_master_slider_value = document.getElementById("pairwise_master_slider_value");

function change_all_slider_values_to_the_master(master_val, cols, pairwise) {
    if (!pairwise){

        cols.forEach((col) => {
            let col_slider_value;
            col_slider_value = document.getElementById(col + "_slider_value");

            col_slider_value.innerHTML = master_val / 100;
            $("#" + col + "_slider").val(master_val);

        })
    }
    else{
        cols.forEach((col) => {
        let col_slider_value;
        col_slider_value = document.getElementById(col.replace("s1", "pairwise_") + "_slider_value");

        col_slider_value.innerHTML = master_val / 100;
        $("#" + col.replace("s1", "pairwise_") + "_slider").val(master_val);

    })

    }
}

function update_text_when_sliders_change(s1, filter_func, pairwise = false) {
    let s1_slider, s1_slider_value;
    if (!pairwise) {
        s1_slider = document.getElementById(s1 + "_slider");
        s1_slider_value = document.getElementById(s1 + "_slider_value");
    }
    else{
        s1_slider = document.getElementById(s1.replace("s1", "pairwise_") + "_slider");
        s1_slider_value = document.getElementById(s1.replace("s1", "pairwise_") + "_slider_value");
    }

    s1_slider_value.innerHTML = s1_slider.value;
    s1_slider.oninput = function () {
        s1_slider_value.innerHTML = this.value / 100;
        filter_func();
    }
}


wt_cols.slice(1).forEach(wt => update_text_when_sliders_change(wt, wt_filter));
s1_cols.slice(1).forEach(s1 => update_text_when_sliders_change(s1, s1_filter));
s1_cols.forEach(s1 => update_text_when_sliders_change(s1, pairwise_filter, true));


wt_master_slider_value.innerHTML = wt_master_slider.value;
wt_master_slider.oninput = function () {
    let master_val = this.value;
    wt_master_slider_value.innerHTML = master_val / 100;


    change_all_slider_values_to_the_master(master_val, wt_cols.slice(1));
    wt_filter();
    document.getElementById("printStats").innerHTML = `Summary for threshold = ${master_val / 100}`;
    calc_and_show_stats_table();
}


s1_master_slider_value.innerHTML = s1_master_slider.value;
s1_master_slider.oninput = function () {
    let master_val = this.value;
    s1_master_slider_value.innerHTML = master_val / 100;


    change_all_slider_values_to_the_master(master_val, s1_cols.slice(1));
    s1_filter();
    document.getElementById("printStats").innerHTML = `Summary for threshold = ${master_val / 100}`;
    calc_and_show_stats_table();
}


pairwise_master_slider_value.innerHTML = pairwise_master_slider.value;
pairwise_master_slider.oninput = function () {
    let master_val = this.value;
    pairwise_master_slider_value.innerHTML = master_val / 100;


    change_all_slider_values_to_the_master(master_val, s1_cols, true);
    pairwise_filter();
    document.getElementById("printStats").innerHTML = `Summary for threshold = ${master_val / 100}`;
    calc_and_show_stats_table();
}



