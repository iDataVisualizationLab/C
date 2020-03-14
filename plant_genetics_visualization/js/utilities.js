const MY_COLORS  = {
    "green": "rgb(145, 207, 96)",
    "orange": "rgb(252, 141, 89)",
    "gray": "rgb(232, 232, 232)",
    "default": "rgb(231, 231, 231)",


}

// function sleep(time) {
//     return new Promise((resolve) => setTimeout(resolve, time));
// }

zip= rows=>rows[0].map((_,c)=>rows.map(row=>row[c])) //zip([[1,2,3], [11,12,13]])


function removeWhitespace(str) {
    return str.replace(/\s+/g, '');
}

function reset_color(button_list) {
    button_list.forEach(button =>
    {
        d3.select(button).style("background-color", color_arr[0]);
        d3.select(button).style("background-image", "linear-gradient(to right, rgb(145, 207, 96), rgb(252, 141, 89)");

    }
    )

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

function permutator(n){
    var result = [];
    for(let y_=0; y_<Math.pow(2,n); y_++){
        var combo = [];
        for(let x_=0; x_<n; x_++){
            //shift bit and and it with 1
            if((y_ >> x_) & 1)
                combo.push(true);
            else
                combo.push(false);
        }
        result.push(combo);
    }
    return result;
}



function permutator_base_3(res, results, n){
    if (res.length == n){
        results.push(res);
    }
    else{
        permutator_base_3([...res, 1], results, n);
        permutator_base_3([...res, 2], results, n);
        permutator_base_3([...res, 3], results, n);
    }
}
