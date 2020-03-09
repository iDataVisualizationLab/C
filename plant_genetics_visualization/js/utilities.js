const MY_COLORS  = {
    "green": "rgb(145, 207, 96)",
    "orange": "rgb(252, 141, 89)",
    "gray": "rgb(231, 231, 231)"
}

// function sleep(time) {
//     return new Promise((resolve) => setTimeout(resolve, time));
// }

function removeWhitespace(str) {
    return str.replace(/\s+/g, '');
}

function reset_color(button_list) {
    button_list.forEach(button =>
        d3.select(button).style("background-color", color_arr[0]))
}

function get_responding_wt_from_s1(wt_name) {
    return wt_name.replace("s1", "wt");
}


function selectAllCheckboxes() {
    let checkboxes = document.getElementsByName("stateSelection");
    let _this = document.getElementById("all");

    for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].checked != _this.checked) {
            changeChartDisplay(checkboxes[i].id);
        }
    }
}