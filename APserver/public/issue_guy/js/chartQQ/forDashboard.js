function show_dashboard_chart_KK(aggrs_data) {

    // 最後時間 End date
    getcha();

    // 總文章量
    allPost(aggrs_data);

    // 關注度
    focus_level(aggrs_data);

    // 作者數量
    allAuthor(aggrs_data);

    // KOL
    kol_chartKK(aggrs_data);

    // 互動度
    interactive_level(aggrs_data);

    // 社群影響
    social_affect_chart(aggrs_data);

    // 關聯話題
    relation_issue_chart(aggrs_data);

    // 好感度
    goodFeel_level_chartKK(aggrs_data);

    // 發燒頻道
    hot_channel_chart(aggrs_data);

    // 熱門度
    hot_chartKK(aggrs_data);

    // 監測燈號
    warning_light(aggrs_data);

    // 擴散度
    spread_level_chart(aggrs_data);


}

// 最後時間 End date
function getcha() {
    var selected_end_time = $("#end_timeQQ input")["0"]["value"];
    $("#endmonth").text(selected_end_time);
};

// 總文章量
function allPost(data1) {
    var total_post_num = numeral(data1["aggs"]["aggs_total_post_counting"]).format('0,0');
    $("#post_vol_KK").text(total_post_num);
}

// 關注度
function focus_level(data1_2) {
    var total_pageView = numeral(data1_2["aggs"]["aggs_total_pageview"]).format('0,0');
    $("#focus_level").text(total_pageView);
}

// 作者數量
function allAuthor(data1_3) {
    var total_author_num = numeral(data1_3["aggs"]["aggs_total_author_counting"]).format('0,0');
    $("#author_num_QK").text(total_author_num);
}

// 意見領袖 KOL
function kol_chartKK(data2) {

    var author_name = data2["aggs"]["aggs_total_author"].map(function(authorKK) {
        if (authorKK["author"].length > 10) {
            return authorKK["author"].slice(0, 11) + "...";
        };
        return authorKK["author"];
    });
    var author_post_nbr = data2["aggs"]["aggs_total_author"].map(function(authorKK) {
        return authorKK["doc_num_counting"];
    });


    var myChart = echarts.getInstanceByDom(document.getElementById("kol_chart"));
    if (!myChart) {
        myChart = echarts.init(document.getElementById("kol_chart"));
    }

    myChart.setOption(option={
        color:color_theme,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            width: '100%',
            top: '1%',
            left: '1%',
            right: '1%',
            bottom: '1%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                show: false
            },
            splitLine: {
                show: false
            },
            boundaryGap: [0, 0.01]
        },
        yAxis: {
            type: 'category',
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            data: author_name.reverse()
        },
        series: [{
            name: '文章數',
            type: 'bar',
            barWidth: 20,
            barMaxWidth: 30,
            label: {
                normal: {
                    show: true,
                    position: 'insideRight'
                }
            },
            data: author_post_nbr.reverse()
        }]
    });
}

// 互動度
function interactive_level(data3) {
    var allLikes = data3["aggs"]["aggs_total_likes"];
    var allShares = data3["aggs"]["aggs_total_shares"];
    var allRsp = data3["aggs"]["aggs_total_respnum"]
    var total_PageView = data3["aggs"]["aggs_total_pageview"];
    var interactive_LV_data = Number((((allLikes + allShares + allRsp) / total_PageView) * 100).toFixed(1)) == "Infinity" ? "無資料" : Number((((allLikes + allShares + allRsp) / total_PageView) * 100).toFixed(1));

    var myChart = echarts.init(document.getElementById("interactive_chart"));
    if (!myChart) {
        myChart = echarts.init(document.getElementById("interactive_chart"));
    }

    myChart.setOption(option={
        color:color_theme,
        tooltip: {
            formatter: "{b} : {c}%"
        },
        series: [{
            name: '互動度',
            type: 'gauge',
            radius: "120%",
            center: ["50%", "85%"],
            startAngle: 180,
            endAngle: 0,
            title: {
                show: false
            },
            detail: {
                formatter: typeof(interactive_LV_data) == "string" ? String(interactive_LV_data) : '{value}%',
                offsetCenter: [0, "-25%"]
            },
            data: [{ value: interactive_LV_data, name: "互動度" }]
        }]
    });
}

// 監測燈號
function warning_light(data4) {

    var posVol = [{
            "avg": Number(data4["aggs"]["aggs_stats_months"]["pos_counting"]["avg"].toFixed(1)),
            "std": Number(data4["aggs"]["aggs_stats_months"]["pos_counting"]["std_deviation"].toFixed(1)),
            "sample": data4["aggs"]["aggs_by_days"][Object.keys(data4["aggs"]["aggs_by_days"]).slice(-2, -1)[0]] ? data4["aggs"]["aggs_by_days"][Object.keys(data4["aggs"]["aggs_by_days"]).slice(-2, -1)[0]]["post_semantic_counting"]["pos"] : 0
        }],
        negVol = [{
            "avg": Number(data4["aggs"]["aggs_stats_months"]["neg_counting"]["avg"].toFixed(1)),
            "std": Number(data4["aggs"]["aggs_stats_months"]["neg_counting"]["std_deviation"].toFixed(1)),
            "sample": data4["aggs"]["aggs_by_days"][Object.keys(data4["aggs"]["aggs_by_days"]).slice(-2, -1)[0]] ? data4["aggs"]["aggs_by_days"][Object.keys(data4["aggs"]["aggs_by_days"]).slice(-2, -1)[0]]["post_semantic_counting"]["neg"] : 0
        }],
        avgVol = [{
            "avg": Number(data4["aggs"]["aggs_stats_months"]["allvol_counting"]["avg"].toFixed(1)),
            "std": Number(data4["aggs"]["aggs_stats_months"]["allvol_counting"]["std_deviation"].toFixed(1)),
            "sample": data4["aggs"]["aggs_by_days"][Object.keys(data4["aggs"]["aggs_by_days"]).slice(-2, -1)[0]] ? data4["aggs"]["aggs_by_days"][Object.keys(data4["aggs"]["aggs_by_days"]).slice(-2, -1)[0]]["post_allvol_counting"]["value"] : 0
        }];

    var myChart = echarts.init(document.getElementById("warningLight_chart"));
    if (!myChart) {
        myChart = echarts.init(document.getElementById("warningLight_chart"));
    }

    myChart.setOption(option={
        color:color_theme,
        tooltip: {
            formatter: "{a} <br/>{c} {b}"
        },
        series: [{
            name: '總聲量',
            type: 'gauge',
            z: 3,
            min: 0,
            max: (avgVol[0]["std"] * 3),
            splitNumber: 3,
            radius: '90%',
            center: ['51%', '60%'],
            axisLine: {
                lineStyle: {
                    color: [
                        [(avgVol[0]["std"] / (avgVol[0]["std"] * 3)), '#91c7ae'],
                        [(avgVol[0]["std"] * 2 / (avgVol[0]["std"] * 3)), '#63869e'],
                        [1, '#c23531']
                    ],
                    width: 10
                }
            },
            axisTick: {
                length: 15,
                lineStyle: {
                    color: 'auto'
                }
            },
            splitLine: {
                length: 20,
                lineStyle: {
                    color: 'auto'
                }
            },
            title: {
                offsetCenter: [0, '-112%'],
                textStyle: {
                    // fontWeight: 'bolder',
                    fontSize: 18,
                }
            },
            detail: {
                offsetCenter: [0, "66%"],
                textStyle: {
                    fontWeight: 'bolder'
                }
            },
            data: [{ value: Number(avgVol[0]["sample"].toFixed(0)), name: '總聲量' }]
        }, {
            name: '負聲量',
            type: 'gauge',
            center: ['20%', '65%'],
            radius: '60%',
            min: 0,
            max: (negVol[0]["std"] * 3),
            endAngle: 50,
            splitNumber: 3,
            axisLine: {
                lineStyle: {
                    color: [
                        [(negVol[0]["std"] / (negVol[0]["std"] * 3)), '#91c7ae'],
                        [(negVol[0]["std"] * 2 / (negVol[0]["std"] * 3)), '#63869e'],
                        [1, '#c23531']
                    ],
                    width: 8
                }
            },
            axisTick: {
                length: 12,
                lineStyle: {
                    color: 'auto'
                }
            },
            splitLine: {
                length: 20,
                lineStyle: {
                    color: 'auto'
                }
            },
            pointer: {
                width: 5
            },
            title: {
                offsetCenter: [0, '-115%']
            },
            detail: {
                offsetCenter: ["20%", "60%"],
                textStyle: {
                    fontWeight: 'bolder'
                }
            },
            data: [{ value: Number(negVol[0]["sample"].toFixed(0)), name: '負聲量' }]
        }, {
            name: '正聲量',
            type: 'gauge',
            center: ['80%', '65%'],
            radius: '60%',
            min: 0,
            max: (posVol[0]["std"] * 3),
            startAngle: 120,
            endAngle: -420,
            splitNumber: 3,
            axisLine: {
                lineStyle: {
                    color: [
                        [(posVol[0]["std"] / (posVol[0]["std"] * 3)), '#91c7ae'],
                        [(posVol[0]["std"] * 2 / (posVol[0]["std"] * 3)), '#63869e'],
                        [1, '#c23531']
                    ],
                    width: 8
                }
            },
            axisTick: {
                length: 12,
                lineStyle: {
                    color: 'auto'
                }
            },
            splitLine: {
                length: 20,
                lineStyle: {
                    color: 'auto'
                }
            },
            pointer: {
                width: 5
            },
            title: {
                offsetCenter: [0, '-115%']
            },
            detail: {
                offsetCenter: ["-20%", "60%"],
                textStyle: {
                    fontWeight: 'bolder'
                }
            },
            data: [{ value: Number(posVol[0]["sample"].toFixed(0)), name: '正聲量' }]
        }]
    });
}

// 熱門度
function hot_chartKK(data5) {

    var hot_volumn = ["4_weeks_ago","3_weeks_ago","2_weeks_ago","1_weeks_ago"].map(week=> data5["aggs"]["aggs_by_weeks"][week] ?Number(((data5["aggs"]["aggs_by_weeks"][week]["post_vol_counting"]+data5["aggs"]["aggs_by_weeks"][week]["post_num_counting"]).toFixed(0))): 0) ;

    // 熱門成長率小功能
    if (hot_volumn.slice(-2).length == 2) {

        var growth_rate = Number((((hot_volumn.slice(-2)[1] - hot_volumn.slice(-2)[0]) / hot_volumn.slice(-2)[0]) * 100).toFixed(1)) || "兩周皆無資料";
        if (growth_rate > 0) {
            if (growth_rate != "Infinity") {
                $("#hot_growth_rate").css({
                    "fontStyle": "italic",
                    "color": "red",
                    "font-size": "18px",
                    "margin-right": "10px",
                });
                $("#hot_growth_rate").text("+" + String(growth_rate) + " %");
            } else {
                $("#hot_growth_rate").text("上一週無資料");
            }

        } else {
            if (growth_rate != "Infinity") {
                $("#hot_growth_rate").css({
                    "fontStyle": "italic",
                    "color": "green",
                    "font-size": "18px",
                    "margin-right": "10px",
                });
                $("#hot_growth_rate").text(typeof growth_rate == "string" ? growth_rate : (growth_rate + " %"));
            } else {
                $("#hot_growth_rate").text("本週無資料");
            }
        }
    }

    var myChart = echarts.getInstanceByDom(document.getElementById("hot_level_chart"));
    if (!myChart) {
        myChart = echarts.init(document.getElementById("hot_level_chart"));
    }


    myChart.setOption(option={
        color:color_theme,
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            top: 50,
            bottom: 40,
            left: 40,
            right: 20,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['三週前', '二週前', '一週前', '本週']
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false
            }
        },
        series: [{
            name: '網路聲量',
            type: 'line',
            data: hot_volumn,
            // data:[11, 11, 15, 13],
            markPoint: {
                label : {
                    normal : {
                        formatter : function(params){
                            return numeral(params.value).format("0,0");
                        }
                    }
                },
                data: [
                    { type: 'max', name: '最大值' },
                    { type: 'min', name: '最小值' }
                ]
            },
            markLine: {
                label: {
                    normal: {
                        position: "middle",
                        formatter : function(params){
                            return numeral(params.value).format("0,0");
                        }
                    }
                },
                data: [
                    { type: 'average', name: '平均值' },
                ]
            }
        }]
    });

    myChart.resize();
}

// 好感度
function goodFeel_level_chartKK(data6) {
    var post_nbr_count = [];
    var pn_ratio = [];


    ["4_weeks_ago","3_weeks_ago","2_weeks_ago","1_weeks_ago"].map(week=>{
      if(data6["aggs"]["aggs_by_weeks"][week]){
        post_nbr_count.push(data6["aggs"]["aggs_by_weeks"][week]["post_num_counting"]);
        pn_ratio.push(Number(((data6["aggs"]["aggs_by_weeks"][week]["post_semantic_counting"]["pos"] + 1) / (data6["aggs"]["aggs_by_weeks"][week]["post_semantic_counting"]["neg"] + 1)).toFixed(2)));
      }else{
        post_nbr_count.push(0); pn_ratio.push(0);
      }
    })

    // 好感成長率小功能
    if (pn_ratio.slice(-2).length == 2) {
        var lastQQ_postKK = pn_ratio.slice(-2)[0];
        var thisQQ_postKK = pn_ratio.slice(-2)[1];
        var pn_rate = Number((((thisQQ_postKK - lastQQ_postKK) / lastQQ_postKK) * 100).toFixed(1)) || "兩周皆無資料";
        if (pn_rate > 0) {
            if (pn_rate != "Infinity") {
                $("#goodFeel_growth_rate").css({
                    "color": "red",
                    "fontStyle": "italic",
                    "font-size": "18px",
                    "margin-right": "10px",
                });
                $("#goodFeel_growth_rate").text("+" + String(pn_rate) + " %");
            } else {
                $("#goodFeel_growth_rate").text("上一週無資料");
            }
        } else {
            if (pn_rate != "Infinity") {
                $("#goodFeel_growth_rate").css({
                    "color": "green",
                    "fontStyle": "italic",
                    "font-size": "18px",
                    "margin-right": "10px",
                });
                $("#goodFeel_growth_rate").text(typeof pn_rate == "string" ? pn_rate : (pn_rate + " %"));
            } else {
                $("#goodFeel_growth_rate").text("本週無資料");
            }

        }
    }

    var min_pn_ratio = Math.min.apply(null, pn_ratio);
    var max_pn_ratio = Math.max.apply(null, pn_ratio);
    var min_post_nbr_count = Math.min.apply(null, post_nbr_count);
    var max_post_nbr_count = Math.max.apply(null, post_nbr_count);

    var myChart = echarts.getInstanceByDom(document.getElementById("goodFeel_level_chart"));
    if (!myChart) {
        myChart = echarts.init(document.getElementById("goodFeel_level_chart"));
    }

    myChart.setOption(option={
        color:color_theme,
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            width: '100%',
            left: '1%',
            right: '1%',
            top: 45,
            bottom: 20
        },
        legend: {
            selectedMode: false,
            data: ['文章數', 'P/N比']
        },
        xAxis: [{
            type: 'category',
            data: ['三週前', '二週前', '一週前', '本週']
        }],
        yAxis: [{
            type: 'value',
            min: min_post_nbr_count == 0 ? 0 : min_post_nbr_count - 1,
            max: max_post_nbr_count + 1,
            interval: Number(((max_post_nbr_count - min_post_nbr_count) / 4).toFixed(0)),
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                show: false
            },
            splitLine: {
                show: false
            }
        }, {
            type: 'value',
            min: min_pn_ratio,
            max: max_pn_ratio,
            interval: (max_pn_ratio - min_pn_ratio) / 4,
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                show: false
            },
            splitLine: {
                show: false
            }
        }],
        series: [{
            name: '文章數',
            type: 'bar',
            barWidth: '20px',
            barMaxWidth: '30px',
            barMinWidth: '10px',
            label: {
                normal: {
                    show: true,
                    formatter : function(params){
                        return numeral(params.data).format('0,0');
                    },
                    position: "top"
                }
            },
            data: post_nbr_count
        }, {
            name: 'P/N比',
            type: 'line',
            yAxisIndex: 1,
            label: {
                normal: {
                    show: true,
                    position: [20, -15]
                }
            },
            data: pn_ratio
        }]
    });
}


// 社群影響
function social_affect_chart(data7) {

    var news_vol = [],
        social_vol = [];
    var time_term_ary = Object.keys(data7["aggs"]["aggs_by_days"]);
    Object.keys(data7["aggs"]["aggs_by_days"]).map(function(daily) {

        if (Object.keys(data7["aggs"]["aggs_by_days"][daily]["path_to_field"]).includes("news")) {
            news_vol.push(
                Number((data7["aggs"]["aggs_by_days"][daily]["path_to_field"]["news"]["post_num_counting"]).toFixed(0))
            );
        } else {
            news_vol.push(0);
        }
        if (Object.keys(data7["aggs"]["aggs_by_days"][daily]["path_to_field"]).includes("social_media")) {
            social_vol.push(
                Number((data7["aggs"]["aggs_by_days"][daily]["path_to_field"]["social_media"]["post_num_counting"]).toFixed(0))
            );
        } else {
            social_vol.push(0);
        }
    });

    // Map 方式
    // var news_vol = Object.keys(data7["aggs"]["aggs_by_days"]).map(function(day){
    //  return data7["aggs"]["aggs_by_days"][day]["path_to_field"]["forum"]["post_vol_counting"];
    // });

    // ECMA Script 6
    // var news_vol = Object.keys(data7["aggs"]["aggs_by_days"]).map(day => data7["aggs"]["aggs_by_days"][day]["path_to_field"]["forum"]["post_vol_counting"] );


    var myChart = echarts.getInstanceByDom(document.getElementById("social_affect_chart"));
    if (!myChart) {
        myChart = echarts.init(document.getElementById("social_affect_chart"));
    }

    myChart.setOption(option={
        color:color_theme,
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            top: 20,
            bottom: 20,
            left: 40,
            right: 14,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: time_term_ary
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false
            }
        },
        series: [{
            name: 'News',
            type: 'line',
            smooth: true,
            symbol: 'none',
            sampling: 'average',
            itemStyle: {
                normal: {
                    color: 'rgb(70, 255, 131)'
                }
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgb(215, 128, 58)'
                    }, {
                        offset: 1,
                        color: 'rgb(70, 255, 131)'
                    }])
                }
            },
            data: news_vol
        }, {
            name: 'Facebook',
            type: 'line',
            smooth: true,
            symbol: 'none',
            sampling: 'average',
            itemStyle: {
                normal: {
                    color: 'rgb(255, 70, 131)'
                }
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgb(255, 158, 68)'
                    }, {
                        offset: 1,
                        color: 'rgb(255, 70, 131)'
                    }])
                }
            },
            data: social_vol
        }]
    });
}

// 擴散度
function spread_level_chart(data8) {

    var view_num = [], rsp_num = [];
    ["4_weeks_ago","3_weeks_ago","2_weeks_ago","1_weeks_ago"].map(week=>{
        view_num.push(data8["aggs"]["aggs_by_weeks"][week] ? data8["aggs"]["aggs_by_weeks"][week]["aggs_pageview"] : 0);
        rsp_num.push(data8["aggs"]["aggs_by_weeks"][week] ? data8["aggs"]["aggs_by_weeks"][week]["resp_num_counting"] : 0);
    })

    viewChart(view_num);
    rspChart(rsp_num);

    // 瀏覽人數echart
    function viewChart(view_data) {

        var myChart1 = echarts.getInstanceByDom(document.getElementById("spread_level_chart1"));
        if (!myChart1) {
            myChart1 = echarts.init(document.getElementById("spread_level_chart1"));
        }

        myChart1.setOption(option={
            color:color_theme,
            title: {
                text: '瀏覽人數',
                top: 15,
                x: "center",
            },
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                top: '25%',
                left: '3%',
                right: '3%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['三週前', '二週前', '一週前', '本週']
            },
            yAxis: {
                type: 'value',
                nameGap: 10,
                splitLine: {
                    show: false
                }
            },
            series: [{
                name: '瀏覽人數',
                type: 'line',
                label: {
                    normal: {
                        show: true,
                        formatter : function(params){
                            return numeral(params["data"]).format('0,0');
                        }
                    }
                },
                step: 'start',
                data: view_data
            }]
        });
    }

    // 回應人數echart
    function rspChart(rsp_data) {
        var myChart2 = echarts.getInstanceByDom(document.getElementById("spread_level_chart2"));
        if (!myChart2) {
            myChart2 = echarts.init(document.getElementById("spread_level_chart2"));
        }

        myChart2.setOption(option={
            color:color_theme,
            title: {
                text: '回應人數',
                top: 15,
                x: "center",
            },
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                top: '25%',
                left: '3%',
                right: '3%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['三週前', '二週前', '一週前', '本週']
            },
            yAxis: {
                type: 'value',
                nameGap: 10,
                splitLine: {
                    show: false
                }
            },
            series: [{
                name: '回應人數',
                type: 'line',
                label: {
                    normal: {
                        show: true,
                        formatter : function(params){
                            return numeral(params["data"]).format('0,0');
                        }
                    }
                },
                step: 'start',
                data: rsp_num
            }]
        });
    }
}


// 發燒頻道
function hot_channel_chart(data9) {

    var last_hotChannel = [],
        this_hotChannel = [],
        webs_ary = ["others"];
    if (data9["aggs"]["aggs_by_weeks"]["2_weeks_ago"]) {
        Object.keys(data9["aggs"]["aggs_by_weeks"]["2_weeks_ago"]["path_to_website"]).map(last_webs =>{
            if (!(webs_ary.includes(last_webs))) {
                webs_ary.push(last_webs);
            }
            last_hotChannel.push({
                "name": last_webs,
                "value": Number((data9["aggs"]["aggs_by_weeks"]["2_weeks_ago"]["path_to_website"][last_webs]["post_num_counting"] +
                    data9["aggs"]["aggs_by_weeks"]["2_weeks_ago"]["path_to_website"][last_webs]["post_vol_counting"]).toFixed(0))
            });
        });
    } else {
        last_hotChannel.push({ "name": "無資料", "value": 0 });
    }

    if (data9["aggs"]["aggs_by_weeks"]["1_weeks_ago"]) {
        Object.keys(data9["aggs"]["aggs_by_weeks"]["1_weeks_ago"]["path_to_website"]).map(this_webs => {
            if (!(webs_ary.includes(this_webs))) {
                webs_ary.push(this_webs);
            }
            this_hotChannel.push({
                "name": this_webs,
                "value": Number((data9["aggs"]["aggs_by_weeks"]["1_weeks_ago"]["path_to_website"][this_webs]["post_num_counting"] +
                    data9["aggs"]["aggs_by_weeks"]["1_weeks_ago"]["path_to_website"][this_webs]["post_vol_counting"]).toFixed(0))
            });
        });
    } else {
        this_hotChannel.push({ "name": "無資料", "value": 0 })
    }

    sortVal(last_hotChannel);
    sortVal(this_hotChannel);

    if (last_hotChannel.length > 3) {
        last_hotChannel = othersFun(last_hotChannel);
    }
    if (this_hotChannel.length > 3) {
        this_hotChannel = othersFun(this_hotChannel);
    }

    var myChart = echarts.getInstanceByDom(document.getElementById("hot_channel_chart"));
    if (!myChart) {
        myChart = echarts.init(document.getElementById("hot_channel_chart"));
    }

    myChart.clear();
    myChart.setOption(option={
        color:color_theme,
        tooltip: {
            trigger: 'item',
            // formatter: "{a} <br/>{b} : {c} ({d}%)"
            formatter : function(params){
                return params["seriesName"] + "</br>" +
                params["name"] + " : " + numeral(params["value"]).format('0,0') + " (" + (params["percent"]).toFixed(1) + "%" + ")";
            }
        },
        legend: {
            x: 'center',
            y: 'center',
            orient: "vertical",
            selectedMode: false,
            data: webs_ary
        },
        calculable: true,
        series: [{
            name: '上一週',
            type: 'pie',
            radius: [35, 55],
            center: ['17%', '50%'],
            avoidLabelOverlap: false,
            hoverAnimation: false,
            label: {
                normal: {
                    show: true,
                    position : "center",
                    formatter : function(params){
                        return params.dataIndex == 0 ?  params.name : "";
                    }
                }
            },
            data: last_hotChannel
        }, {
            name: '本週',
            type: 'pie',
            radius: [35, 55],
            center: ['83%', '50%'],
            avoidLabelOverlap: false,
            label: {
                normal: {
                    show: true,
                    position: "center",
                    formatter : function(params){
                        return params.dataIndex == 0 ?  params.name : "";
                    }
                }
            },
            data: this_hotChannel
        }]
    });

    // 排序
    function sortVal(arr_channel) {
        arr_channel.sort((a,b)=>parseFloat(b.value) - parseFloat(a.value));
    }

    // others 加工
    function othersFun(hotChannel) {
        var weeks_others = [];
        var LW_other_vals = 0;
        for (var i = 0; i < hotChannel.slice(3).length; i++) {
            LW_other_vals += hotChannel.slice(3)[i]["value"];
        }
        weeks_others.push({ "name": "others", "value": LW_other_vals });
        hotChannel.splice(3);
        var resoult_hotChannel = hotChannel.concat(weeks_others);
        return resoult_hotChannel;
    }
}


// 關聯話題
function relation_issue_chart(data10) {

    // Main Function
    var FP_HW = RI_middle_chart(data10);
    for (var i = 0; i < 2; i++) {
        show_RI_chart(FP_HW[0][i], FP_HW[1][i], FP_HW[2][i]);
    }

    function RI_middle_chart(raw_data10) {

        var data_set = [];
        var dom_ary = ["relation_issue_chart1", "relation_issue_chart2"];
        var title_ary = ["關聯詞", "熱門詞"];

        if (raw_data10["relation_issue_chart"]["fptree"]["FPtree"]) {
            raw_data10["relation_issue_chart"]["fptree"]["FPtree"].sort((a, b)=> parseFloat(b.weight) - parseFloat(a.weight));
            data_set.push(raw_data10["relation_issue_chart"]["fptree"]["FPtree"].length > 10 ? raw_data10["relation_issue_chart"]["fptree"]["FPtree"].slice(0,10) : raw_data10["relation_issue_chart"]["fptree"]["FPtree"], raw_data10["relation_issue_chart"]["hotword"]);
        } else {
            data_set.push([{"Level1" : "查無資料", "weight" : 0.9}], raw_data10["relation_issue_chart"]["hotword"]);
        }

        return [deal_data10(data_set), dom_ary, title_ary];

        function deal_data10(raw_data_set) {

            var FP_ary = raw_data_set[0].map(fp_ele=>({
                "name": fp_ele["Level1"],
                "value": Number((fp_ele["weight"]).toFixed(3))
            }))

            var hotword_ary = raw_data_set[1].map(hw_ele=>({
                "name": hw_ele["word"],
                "value": hw_ele["count"]
            }))
            return [FP_ary, hotword_ary];
        }
    }

    function show_RI_chart(final_dataKK, dom_tag, title) {
        var myChart = echarts.getInstanceByDom(document.getElementById(dom_tag));
        if (!myChart) {
            myChart = echarts.init(document.getElementById(dom_tag));
        }

        function getLevelOption() {
            return [{
                itemStyle: {
                    normal: {
                        borderWidth: 0,
                        gapWidth: 5
                    }
                }
            }, {
                itemStyle: {
                    normal: {
                        gapWidth: 1
                    }
                }
            }, {
                colorSaturation: [0.35, 0.5],
                itemStyle: {
                    normal: {
                        gapWidth: 1,
                        borderColorSaturation: 0.6
                    }
                }
            }];
        }

        myChart.setOption(option={
            color:color_theme,
            title: {
                text: title,
                left: 'center'
            },
            tooltip: {
                show: true,
                formatter: function(param) {
                    if (param.value >= 1) {
                        return "熱詞 ： " + param.name + "</br>" +
                            "頻率 ： " + numeral(param.value).format("0,0") + " 次";
                        } else {
                            return param.name == "查無資料" ? "查無資料" : "關聯詞 ： " + param.name + "</br>" + "相關度 ： " + param.value;
                    }
                }
            },
            series: [{
                name: title,
                type: 'treemap',
                left: "5%",
                right: "1%",
                top: "18%",
                bottom: '1%',
                width: '90%',
                height: '80%',
                roam: false,
                nodeClick: false,
                itemStyle: {
                    normal: {
                        borderColor: '#fff'
                    }
                },
                breadcrumb: {
                    show: false
                },
                levels: getLevelOption(),
                data: final_dataKK
            }]
        });
    }
}

function clear_all_chart(){
    ["kol_chart","interactive_chart","warningLight_chart","hot_level_chart",
     "goodFeel_level_chart","social_affect_chart","spread_level_chart1","spread_level_chart2",
     "hot_channel_chart","relation_issue_chart1","relation_issue_chart2"].map(ele_id=>{
         var chartQQ = echarts.getInstanceByDom(document.getElementById(ele_id));
         if (chartQQ) { chartQQ.clear();}
    });
     ["#focus_level","#post_vol_KK","#author_num_QK","#hot_growth_rate","#goodFeel_growth_rate"].map(ele_id=>{
         $(ele_id).text("");
     });
}
