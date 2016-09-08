function Lucifer_chart(raw_d) {
    var t_start = new Date();
    var pmi_data = raw_d["pmi_d"];
    var vol_data = raw_d["vol_d"];

    // 時間調整
    // >1y , by half year
    // <=1y , by month

    // Initialize
    var e_c_color = color_theme;


    var u_c_industry = $(".field_choice_u_want_this").attr("id");
    var brands = $("#" + u_c_industry + "_block .b_list_content li.selected").map(function() {
        return $(this).text() }).get().filter(function(b_n) {
        return b_n != "清除" });

    $("#Lucifer_pk_arena").html(
        '<div id="bench_warmer">' +
        '<br><br>' +
        '<div style="text-align:center;font-size:20px;margin-bottom:10px;margin-left:-20px;">品牌列表</div>' +
        '<div id="main_character"></div>' +
        '<span style="margin-left:19%;font-size: 20px;">品牌標的</span>' +
        '</div>');


    brands.map(function(b_name, index) {
        $("#main_character").before(
            '<div class="come_back_place"><div class="drag_and_drop_QQ" style="border-color:' + e_c_color[index] +
            ';background-color:' + e_c_color[index] + '" drag_ele="' + b_name + '"></div></div>' +
            '<div class="come_back_place_word_description" >' + b_name + '</div><div style="clear:both;"></div>'
        );
    });

    $("#Lucifer_cross_plot").html('');
    $("#Lucifer_cross_plot,#Lucifer_pride_little_icons").remove();

    genChart_pride_plots(pmi_data, vol_data, t_start);

    Lucifer_RWD_guy();

}


function genChart_pride_plots(p_data, v_data, test_t) {

    // Prepare Data .
    var brands = Object.keys(v_data);
    var time_month_interval = Object.keys(v_data[brands[0]]);


    // Median func.
    var get_median_value = function(num_list) {
        num_list.sort(function(a, b) {
            return b - a });
        var list_len = num_list.length;
        var half = Math.floor(list_len / 2);
        return list_len % 2 ? num_list[(list_len - 1) / 2] : (num_list[half - 1] + num_list[half]) / 2.0;
    }

    // Prepare Function .
    var gen_cross_plot = function(user_care_brand) {
        var cross_time_Chart = echarts.init(document.getElementById("Lucifer_cross_plot"));

        if (brands.indexOf(user_care_brand) < 0) {
            $("#Lucifer_cross_plot").html("沒有選擇這個品牌喔~~~~");
            return;
        }

        var use_brand_dataQQ = Object.keys(p_data).map(function(month) {
            // Calculate user_care_brand's median.
            // deal with only one brand ?
            var user_care_brand_median = get_median_value(brands.filter(b_n => b_n != user_care_brand).map(ele_n => p_data[month][user_care_brand][ele_n]["correl"]));
            return {
                title: {
                    text: "競合地圖",
                    textStyle: {
                        fontSize: 24,
                        fontWeight: 500,
                        fontFamily: "NotoSansCJKtc-Medium"
                    },
                    left: "41%",
                    top: "0"
                },
                series: brands.map(function(brand_name) {
                    // Add line for center point.
                    // Radius by post.
                    // data : [judge_volume (<2?) , correl , real_volume , user_care_brand_median ]
                    if (brand_name == user_care_brand) {
                        return {
                            symbolSize: 30,
                            data: [
                                [(1).toFixed(2), (user_care_brand_median).toFixed(3), 1, user_care_brand_median]
                            ],
                            markLine: {
                                data: [
                                    [{ coord: [0, user_care_brand_median] }, { coord: [2, user_care_brand_median] }],
                                    [{ coord: [1, 0] }, { coord: [1, 1] }]
                                ]
                            }
                        }
                    } else {
                        if (v_data[user_care_brand][month] == 0) { v_data[user_care_brand][month] = 1 };
                        var enemy_value = (v_data[brand_name][month] / v_data[user_care_brand][month]) >= 2 ? 2 : (v_data[brand_name][month] / v_data[user_care_brand][month]).toFixed(2);
                        return { symbolSize: 30, data: [
                                [enemy_value, (p_data[month][brand_name][user_care_brand]["correl"]).toFixed(3), (v_data[brand_name][month] / v_data[user_care_brand][month]).toFixed(2), user_care_brand_median]
                            ] }
                    }
                })
            }
        })

        var use_time_data = time_month_interval.map(function(month) {
            return {
                value: month,
                tooltip: {
                    formatter: month
                }
            }
        })

        var time_cross_option = {
            baseOption: {
                timeline: {
                    axisType: 'category',
                    autoPlay: false,
                    playInterval: 2500,
                    data: use_time_data,
                    label: {
                        formatter: function(s) {
                            return s
                        }
                    }
                },
                tooltip: {
                    formatter: function(param) {
                        if (param["componentType"] == "markLine") {
                            return param["data"]["coord"][0] > 0 ? "聲量分界 : 1" : "關聯度分界 : " + param["data"]["coord"][1].toFixed(3);
                        };
                        return '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + param["color"] + '"></span>' +
                            param["seriesName"] + "<br>" +
                            "聲量 : " + param["data"][2] + "倍<br>" +
                            "關聯度 : " + (param["data"][1] > param["data"][3] ? "強" : "弱");
                    }
                },
                legend: {
                    x: 'right',
                    top: "45",
                    textStyle: {
                        fontFamily: "NotoSansCJKtc-Medium"
                    },
                    data: brands,
                },
                calculable: true,
                grid: {
                    left: "5%",
                    right: "12%",
                    top: 80,
                    bottom: 100
                },
                xAxis: [{
                    type: 'value',
                    name: "聲量倍數",
                    nameTextStyle: {
                        fontSize: 18,
                        fontFamily: "NotoSansCJKtc-Medium"
                    },
                    // silent:false,
                    // min : 0 ,
                    // max : "dataMax" ,
                    max: 2,
                    splitLine: {
                        show: false,
                        lineStyle: {
                            type: 'dashed'
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: false,
                        formatter: '{value}'
                    }
                }],
                yAxis: [{
                    type: 'value',
                    name: "關聯強度",
                    nameTextStyle: {
                        fontSize: 18,
                        fontFamily: "NotoSansCJKtc-Medium"
                    },
                    // boundaryGap:["20%","20%"],
                    min: 0,
                    max: 1,
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: false,
                        formatter: '{value}'
                    },
                    splitLine: {
                        show: false,
                        lineStyle: {
                            type: 'dashed'
                        }
                    }
                }],
                series: brands.map(function(brand_name) {
                    return {
                        name: brand_name,
                        type: "scatter",
                        // symbolSize : 25
                    }
                })
            },
            options: use_brand_dataQQ
        };

        cross_time_Chart.setOption(time_cross_option);

        use_brand_dataQQ = null;

        $('.topic_content[show_chart_QQ="Lucifer_pride_chart"]').click(function() {
            setTimeout(function() { cross_time_Chart.resize(); }, 1);
        });
        $(window).resize(function() { cross_time_Chart.resize();
            Lucifer_RWD_guy(); });


        // R.W.D !?

        $(".Lucifer_pride_chart").append("<div id='Lucifer_pride_little_icons'>" +
            "<div class='L_Enemy'><img src='brands_girl/img/enemy.png'><span>弱聲量+高度品牌關聯性</span></div>" +
            "<div class='L_Ally' ><img src='brands_girl/img/ally.png'><span>強聲量+低度品牌關聯性</span></div>" +
            "<div class='L_King' ><img src='brands_girl/img/king.png'><span>強聲量+高度品牌關聯性</span></div>" +
            "<div class='L_Loser'><img src='brands_girl/img/loser.png'><span>弱聲量+低度品牌關聯性</span></div>" +
            "<span style='top:-420px;left:-63%;opacity:1;'>高</span>" +
            "<span style='top:-130px;left:-64.3%;opacity:1;'>低</span>" +
            "<span style='top:-95px;left:-1%;opacity:1;'>強</span>" +
            "<span style='top:-95px;left:-64%;opacity:1;'>弱</span>" +
            "</div>");

        // Css - Sprite .
        // It can be reduced to one img.
        // $(".Lucifer_pride_chart").append("<div id='Lucifer_pride_little_icons'>"+
        // "<div class='L_testQQ'><img src='brands_girl/img/testQQ_c.png' style='position: relative;top: -400px;left: 356px;opacity: 1;'><span></span></div>"+
        // "</div>");

    }


    var DD_rag_and_rop = function() {

        $(".drag_and_drop_QQ").draggable({
            containment: ".Lucifer_pride_chart",
            snap: "#main_character,.come_back_place",
            snapMode: "inner",
            snapTolerance: 20,
            opacity: 0.4,
            revert: "invalid"
        });

        $("#main_character").droppable({
            tolerance: "fit",
            drop: function(e, ui) {

                // Limit only this ui can be droppable.
                $(this).droppable("option", "accept", ui.draggable);
                $(".Lucifer_pride_chart").append("<div id = 'Lucifer_cross_plot'></div>");
                gen_cross_plot(ui.draggable.attr("drag_ele"));
            },
            over: function(e, ui) {
                $(this).css("background-color", "#000");
            },
            out: function(e, ui) {

                // Clean this limit.
                $(this).css("background-color", "#fff");
                $(this).droppable("option", "accept", ".drag_and_drop_QQ");
                $("#Lucifer_cross_plot,#Lucifer_pride_little_icons").remove();
            }
        });

        $(".come_back_place").droppable({
            tolerance: "fit"
        });

    }

    // Let's start .
    DD_rag_and_rop();
    console.log("Lucifer done : " + (((new Date) - test_t) / 1000));
}

function Lucifer_RWD_guy() {

    var size = $(window).width();

    if (size >= 1100) {
        $('.come_back_place , .drag_and_drop_QQ , #main_character').css({
            width: "30px",
            height: "30px"
        });
        $(".come_back_place_word_description").css("font-size", "16px");
    } else if (size >= 700 && size < 1100) {
        $('.come_back_place , .drag_and_drop_QQ , #main_character').css({
            width: "25px",
            height: "25px"
        });
        $(".come_back_place_word_description").css("font-size", "16px");
    };

}
