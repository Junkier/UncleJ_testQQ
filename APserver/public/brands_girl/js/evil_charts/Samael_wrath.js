function Samael_chart(a_data) {
    var t_start = new Date();

    // 清除前者選擇清單上所選的品牌
    $("#telcom_selected option:first").siblings().remove();
    // Hide brand-list bar
    $("#telcom_selected").hide();

    // Initialize.
    $('#Samael_table_list_fuck_QQQQ').html('');
    $("#Samael_table_list .Samael_table_list_sorting").css("display", "none")
    var line_Chart = echarts.getInstanceByDom(document.getElementById("Samael_line_plot"));
    if(line_Chart){ line_Chart.clear()};

    // Show total vol chart initially.
    genChart_wrath_plot("total");

    $(".Samael_wrath_vol_chosen_icons span").css("color", "#bbb");
    $(".Samael_wrath_vol_chosen_icons span").eq(0).css("color", "#000");
    $(".Samael_wrath_chart input:image").unbind().click(function() {
        $(this).siblings("span").css("color", "#bbb");
        $(this).next().css("color", "#000");
        genChart_wrath_plot($(this).val());
    })

    function genChart_wrath_plot(user_focus_vol) {
        var brand_names = Object.keys(a_data);

        var day_flies = [];
        brand_names.map(b_n => {
            var days_list = Object.keys(a_data[b_n]["aggs_by_days"]);
            if (days_list.length > day_flies.length) {
                day_flies = days_list
            };
        })

        // 總 聲 : volume 欄位
        // 正 聲 : post_num
        // 負 聲 : post_num
        // PN : (正+1)/(負+1)
        var use_data = brand_names.map(b_n => ({
            name: b_n,
            type: "line",
            symbolSize: 10,
            data: day_flies.map(day => {
                // try - catch err without that day.
                try {
                    if (user_focus_vol == "pnQQ") {
                        var pos = a_data[b_n]["aggs_by_days"][day]["post_semantic_counting"]["pos"],
                            neg = a_data[b_n]["aggs_by_days"][day]["post_semantic_counting"]["neg"];

                        // var pos = a_data[b_n]["aggs_by_days"][day]["post_semantic_counting"]["pos"]+a_data[b_n]["aggs_by_days"][day]["resp_semantic_counting"]["pos"],
                        // neg = a_data[b_n]["aggs_by_days"][day]["post_semantic_counting"]["neg"]+a_data[b_n]["aggs_by_days"][day]["resp_semantic_counting"]["neg"];
                        return ((pos + 1) / (neg + 1)).toFixed(1);
                    } else if (user_focus_vol == "total") {
                        return a_data[b_n]["aggs_by_days"][day]["post_vol_counting"].toFixed(0);
                    } else {
                        return (a_data[b_n]["aggs_by_days"][day]["post_semantic_counting"][user_focus_vol]);
                        // return (a_data[b_n]["aggs_by_days"][day]["post_semantic_counting"][user_focus_vol]+a_data[b_n]["aggs_by_days"][day]["resp_semantic_counting"][user_focus_vol]) ;
                    }
                } catch (e) {
                    return user_focus_vol == "pnQQ" ? 1 : 0;
                }

            })
        }));

        line_Chart.setOption(option = {
            color: color_theme,
            toolbox: {
                top: "top",
                right: "6%",
                feature: {
                    // 圖片儲存模組
                    saveAsImage: {
                        type: 'png',
                        backgroundColor: '#fff',
                        excludeComponents: ['toolbox'],
                        show: true,
                        title: '儲存圖片',
                        // 儲存已開較高畫質
                        pixelRatio: 2,
                    },
                    // 任何變更重新整理
                    // restore: {
                    //  show: true,
                    //  title: '重新整理',
                    // },
                    // 畫面選取縮放功能
                    // dataZoom: {
                    //  show: true,
                    //  title: {
                    //      zoom: '區域縮放',
                    //      back: '縮放還原',
                    //  },
                    // },
                    // 更換樣式依序為線柱推疊平鋪
                    magicType: {
                        title: {
                            line: "切換折線圖",
                            bar: "切換柱狀圖",
                            tiled: "切換平鋪圖",
                            stack: "切換堆疊圖",
                        },

                        type: ['line', 'bar', 'tiled', 'stack']
                    },
                },
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: brand_names,
                textStyle: {
                    fontFamily: "NotoSansCJKtc-Medium"
                },
                x: "right",
                top: "20"
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: day_flies
            }],
            yAxis: [{
                type: 'value'
            }],
            dataZoom: {
                type: 'slider',
                show: true,
                xAxisIndex: 0,
                showDetail: false,
                showDataShadow: false,
                // start:80,
                // end:100
            },
            series: use_data,

        });

        line_Chart.off("click");

        line_Chart.on("click", function(param) {
            var query_data = gen_query_post(),
                day = param["name"];
            query_data["start_time"] = day;
            query_data["end_time"] = day;
            query_data["chart_mode"] = "Samael";
            var issue_word = $(".Samael_wrath_search_word input").val();
            if (issue_word.length > 0) { query_data["focus"] = issue_word };
            ajax_article_list(query_data).done(function(result) {
                gen_article_list_Samael(result, day);
                gen_brands_selected_list(result);

                // Default first option selected & Show brand-list bar
                $("#telcom_selected").val($("#telcom_selected option:first").val());
                $("#telcom_selected").show();

            });

        });
        use_data = null;
    }
    console.log(((new Date) - t_start) / 1000);
}

function gen_article_list_Samael(raw_data, user_care_day) {

    table_comes("volume", "全選");

    $("#Samael_table_list .Samael_table_list_sorting").unbind().css("display", "block").click(function() {
        $(this).addClass("Samael_I_was_been_clicked")
            .siblings(".Samael_table_list_sorting").removeClass("Samael_I_was_been_clicked");
        table_comes($(this).attr("value"), $("#telcom_selected").val());
    });

    $("#telcom_selected").unbind().on("change", function(){
        var telecom_brand_KK = $("#telcom_selected").val();
        table_comes($("#Samael_table_list").find(".Samael_I_was_been_clicked").attr("value"), telecom_brand_KK);
    });

    function table_comes(user_chosen_sorting, teleBrand) {

        var final_data = [],
            judge_list = [];

        Object.keys(raw_data).map(b_n=>{
            var user_choose_brand = teleBrand=="全選"? b_n :teleBrand;
            raw_data[user_choose_brand].map(ele=>{
                if(judge_list.indexOf(ele["_id"]) == -1){
                    ele["brand"] = user_choose_brand;
                    final_data.push(ele);
                    judge_list.push(ele["_id"]);
                }
            })
        });

        final_data.sort((a, b) => b["_source"][user_chosen_sorting] - a["_source"][user_chosen_sorting]);

        var content = "<table>" +
            "<tr class='thead'>" +
            "<th class='thcell'>時 間</th>" +
            "<th class='thcell'>標 題</th>" +
            "<th class='thcell'>作 者</th>" +
            "<th class='thcell'>品 牌</th>" +
            "<th class='thcell'>陣 地</th>" +
            "<th class='thcell'>來 源</th>" +
            "<th class='thcell'>人 氣</th>" +
            "<th class='thcell'>情緒分數</th>" +
            "</tr>";

        final_data.map((post_ele, i) => {
            var e_content = "<td class='tdcell'>";
            var e_tag = post_ele["_source"]["content_semantic_tag"],
                s_level = post_ele["_source"]["content_semantic_grade"];
            e_content += e_tag == "neu" ? "<img style='width:20px;' src='issue_guy/img/icons/neutral_emotion.svg'>" :
                (e_tag == "pos" ?
                    "<img style='width:20px;' src='brands_girl/img/happy.svg'><img class='emotiom_light' src='brands_girl/img/pos/pos" + (s_level) + ".svg' >" :
                    "<img style='width:20px;' src='brands_girl/img/sad.svg'><img class='emotiom_light' src='brands_girl/img/neg/neg" + (s_level) + ".svg' >"
                )

            e_content += "</td>";

            var title_detail = (post_ele["_source"]["title"].length <= 25) ? post_ele["_source"]["title"] : post_ele["_source"]["title"].substring(0, 25) + '...';
            var author_detail = (post_ele["_source"]["author"].length <= 10) ? post_ele["_source"]["author"] : post_ele["_source"]["author"].substring(0, 10) + '...';
            content += "<tr>" +
                "<td class='tdcell'>" + user_care_day + "</td>" +
                "<td class='tdcell'><a href='" + post_ele["_source"]["url"] + "' target='_blank' style='color:steelblue;'>" + title_detail + "</a></td>" +
                "<td class='tdcell'>" + author_detail + "</td>" +
                "<td class='tdcell'>" + post_ele["brand"] + "</td>" +
                "<td class='tdcell'>" + mapping_dict.en_2_zh_dict[post_ele["_source"]["field"]] + "</td>" +
                "<td class='tdcell'>" + mapping_dict.en_2_zh_dict[post_ele["_source"]["website"]] + "</td>" +
                "<td class='tdcell'>" + post_ele["_source"]["volume"].toFixed(0) + "</td>" +
                e_content +
                "</tr>";
        })

        content += "</table>";
        $('#Samael_table_list_fuck_QQQQ').html(content);

        final_data = null, content = null, judge_list = null;
    }
}

// Generate select list
function gen_brands_selected_list(telecom_filter_data){

    if($("#telcom_selected option:first").siblings().length > 1){
        $("#telcom_selected option:first").siblings().remove();
    };
    Object.keys(telecom_filter_data).map(bns_list => {
        $("#telcom_selected").append("<option>"+ bns_list + "</option>");
    });
}
