

function openTab(evt, scenarioName) {
    cur_active_tab = scenarioName;

    let i, tabcontent, tablinks, btns_list = [];;
    updateData(_df);
    num_obser = _df.dim()[0];

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(scenarioName).style.display = "block";

    if (scenarioName == tab_names["wt"]) {
        my_stats_table.destroy();

        wt_ctrl_btn();
        $('.statsTable_and_print').show();



    } else if (scenarioName == tab_names["s1"]) {
        my_stats_table.destroy();

        s1_ctrl_btn();
        $('.statsTable_and_print').show();

    } else if (scenarioName ==  tab_names["pairwise"]) {
        my_stats_table.destroy();

        pairwise_ctrl_btn();
        $('.statsTable_and_print').show();


    } else if (scenarioName ==  tab_names["custom"]) {

        custom_ctrl_btn();
        $('.statsTable_and_print').hide();


    }

    btns1 = d3.selectAll('.wt_filter_btn')[0];
    btns2 = d3.selectAll('.s1_filter_btn')[0];
    btns3= d3.selectAll('.pairwise_filter_btn')[0];
    btns_list.push(btns1);
    btns_list.push(btns2);
    btns_list.push(btns3);

    btns_list.forEach(reset_color);

    evt.currentTarget.className += " active";
};