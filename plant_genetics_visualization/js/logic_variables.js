const MY_COLORS = {
    "green": "rgb(145, 207, 96)",
    "orange": "rgb(252, 141, 89)",
    "gray": "rgb(232, 232, 232)",
    "default": "rgb(231, 231, 231)",
    "gradient": "linear-gradient(to right, rgb(145, 207, 96), rgb(252, 141, 89)",
    "slider_default": 'black',
    "slider_master":  "black",//"mediumvioletred",
    "blue": "lightblue",
    "lightbluesky": "#BCD4EC"
}

const ENCODE_COLOR = {
    1: MY_COLORS.green,
    2: MY_COLORS.orange,
    3: MY_COLORS.gray,
}

const cell_colors = {
    "greater": MY_COLORS.green,
    "less": MY_COLORS.orange,
    "no_color": MY_COLORS.gray,
    "gradient": MY_COLORS.gradient,
    "blue": MY_COLORS.blue

}

const tab_names = {
    "normal_class": "normal_comparison",
    "mutant_class": "mutant_comparison",
    "pairwise_class": 'pairwise_comparison',
    "custom": "custom_mode"
};


const DataFrame = dfjs.DataFrame;
let normal_cols = ['wthp6', 'wtlp6', 'wthp5', 'wtlp5', 'wtal', 'wtfe'];
let mutant_cols = ['s1hp6', 's1lp6', 's1hp5', 's1lp5', 's1al', 's1fe'];
let all_cols = ['wthp6', 'wtlp6', 'wthp5', 'wtlp5', 'wtal', 'wtfe', 's1hp6', 's1lp6', 's1hp5', 's1lp5', 's1al', 's1fe'];

let base_col_of_normal = normal_cols[0];
let base_col_of_mutant = mutant_cols[0];
let normal_condition_cols = normal_cols.slice(1);
let mutant_condition_cols = mutant_cols.slice(1);
let pairwise_condition_cols = mutant_cols;

let _cur_base, _cur_condition_cols, _cur_class;
let _cur_master_slider, _cur_master_slider_value;
let _pairwise = false;

let _cur_state = "normal";
let svgCharts;
let _cur_index;
let display_index;
let display_df;
let color_arr = [MY_COLORS.default, MY_COLORS.green, MY_COLORS.orange, MY_COLORS.gray];
let _total_df;
let _cur_df;
let _total_df_RAW, display_df_RAW;
let cur_active_tab = tab_names["normal_class"];
let MAXIMUM_DISPLAY = 500;
let normal_class = "wt";
let mutant_class = "s1";
let pairwise_class = "pairwise";


let _set_data_venn;
let _upload_file = false;
let _just_upload_file = {"statsTable":false, "dataTable":false}

let STOP1 = "AT1G34370";
let S1_TEXT = " (STOP1)";

let show_raw_data=false;

let id_set_data;
let _atID;

let MAP_CLASS = {
    "normal": "wt",
    "mutant":"s1"
}

