function Beelzebub_chart(a_data) {
    var t_start = new Date();
    console.log(a_data);
    var brand_names = Object.keys(a_data);
    var time_month_interval = Object.keys(a_data[brand_names[0]]["aggs_by_months"]);

    var facet_2_TW_dict = new fields_house()[$(".field_choice_u_want_this").attr("id")]["facets"];
    facet_2_TW_dict["volume"] = "總聲量數";
    facet_2_TW_dict["p_n_ratio"] = "正/負 比率";

    var user_choose_perspective = $("#for_perspective_choice input:checked").map(function() {
        return $(this).parents('li').attr("class").split(' ')[0].split("_")[0] + "_semantic_score";
    }).get().filter(function(p_n) {
        return p_n != "multiselect-item_semantic_score"
    });


    var user_choose_p_for_r_and_m = user_choose_perspective.map(p => p);
    user_choose_perspective.push("volume", "p_n_ratio");

    // Main function.
    draw_radar_plot();
    draw_multi_bar_plot();
    // 2 還要修正Q
    // draw_multi_bar_plot2();

    $('.topic_content[show_chart_QQ="Beelzebub_gluttony_chart"]').one("click", function() {
        if ($("#Beelzebub_2axis_plot").length == 0) {
            $("#Beelzebub_pk_arena").html("<button id='Beelzebub_close_me_if_u_wanna' style='position:relative;z-index:20;'>點我關閉教學</button><img src='brands_girl/img/tutorial_Bee.gif' style='width:100%;height:495px;margin-top:-35px;'>");
            $("#Beelzebub_close_me_if_u_wanna").one("click", function() {
                prepare_layout();
            })
        } else {
            prepare_layout();
        }
    })

    function month_aggs(t_interval, interval_time) {
        var aggs_dict = {};
        t_interval.map((month, index) => {
            var aggs_month = t_interval[Math.floor(index / interval_time) * interval_time];
            if (aggs_month in aggs_dict) {
                aggs_dict[aggs_month].push(month);
            } else {
                aggs_dict[aggs_month] = [month];
            }
        })
        return aggs_dict;
    }

    function prepare_layout() {
        $("#Beelzebub_pk_arena").html('<div id = "Beelzebub_pk_title">關鍵論戰</div>' +
            '<div id = "Beelzebub_2axis_plot" ></div>' +
            '<div id = "Beelzebub_pk_axsis_X"></div>' +
            '<div id = "Beelzebub_pk_axsis_Y"></div>');
        $("#Beelzebub_pk_axsis_X").html("X 軸 : <select>" +
            '<option value="">請選擇維度</option>' +
            "</select>");
        $("#Beelzebub_pk_axsis_Y").html("Y 軸 : <select>" +
            '<option value="">請選擇維度</option>' +
            "</select>");
        // Append input checkbox for X,Y axis.

        user_choose_perspective.map(function(axis_name) {
            $("#Beelzebub_pk_axsis_X select").append("<option name='pk_arena_chosen_X' value='" + axis_name + "'>" + facet_2_TW_dict[axis_name] + "</option>");
            $("#Beelzebub_pk_axsis_Y select").append("<option name='pk_arena_chosen_Y' value='" + axis_name + "'>" + facet_2_TW_dict[axis_name] + "</option>");
        })

        $("#Beelzebub_pk_axsis_X select , #Beelzebub_pk_axsis_Y select").change(function() {
            var $pk_ele_x = $("#Beelzebub_pk_axsis_X select").val();
            var $pk_ele_y = $("#Beelzebub_pk_axsis_Y select").val();
            if ($pk_ele_x.length > 0 && $pk_ele_y.length > 0) {
                draw_2axis_time_plot($pk_ele_x, $pk_ele_y);
            }
        });

    }

    // 2axis_Chart
    function draw_2axis_time_plot(x_type, y_type) {

        var axis_time_Chart = echarts.getInstanceByDom(document.getElementById("Beelzebub_2axis_plot"));
        if (!axis_time_Chart) {
            axis_time_Chart = echarts.init(document.getElementById("Beelzebub_2axis_plot"))
        }

        // Time Aggs
        // <1y , 以 1M  為單位
        // >1y , 以 .5y 為單位做 aggregations
        var time_aggs_check = time_month_interval.length > 12 ? true : false;

        if (time_aggs_check) {
            // Aggs Ver.
            var month_mapping_dict = month_aggs(time_month_interval, 6);
            time_month_interval = Object.keys(month_mapping_dict);
            var use_dataQQ = time_month_interval.map(month => ({
                series: brand_names.map(b_n => ({
                    data: [
                        [calculate_data_aggs_month(x_type, b_n, month), calculate_data_aggs_month(y_type, b_n, month)]
                    ]
                }))
            }))
        } else {
            // Normal Ver.
            var use_dataQQ = time_month_interval.map(month => ({
                series: brand_names.map(b_n => ({
                    data: [
                        [calculate_data(x_type, b_n, month), calculate_data(y_type, b_n, month)]
                    ]
                }))
            }))
        }

        axis_time_Chart.setOption(option = {
            baseOption: {
                color: color_theme,
                timeline: {
                    axisType: 'category',
                    bottom: 20,
                    autoPlay: false,
                    playInterval: 2500,
                    data: time_month_interval,
                    label: {
                        formatter: function(s) {
                            return s
                        }
                    }
                },
                tooltip: {},
                legend: {
                    x: 'right',
                    data: brand_names,
                    top: 40
                },
                calculable: true,
                grid: {
                    top: 80,
                    bottom: 100
                },
                xAxis: [{
                    type: 'value',
                    scale: true,
                    nameTextStyle: {
                        fontSize: 15,
                        fontFamily: "NotoSansCJKtc-Medium"
                    },
                    axisLabel: {
                        formatter: '{value}'
                    },
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    }
                }],
                yAxis: [{
                    type: 'value',
                    scale: true,
                    nameTextStyle: {
                        fontSize: 15,
                        fontFamily: "NotoSansCJKtc-Medium"
                    },
                    axisLabel: {
                        formatter: '{value}'
                    },
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    }
                }],
                series: brand_names.map(b_n => ({
                    name: b_n,
                    type: "scatter",
                    symbolSize: 25

                }))
            },
            options: use_dataQQ
        });

        $('.topic_content[show_chart_QQ="Beelzebub_gluttony_chart"]').one("click", function() {
            setTimeout(function() {
                axis_time_Chart.resize();
            }, 1);
        });

        $(window).resize(function() {
            axis_time_Chart.resize();
        });


        function calculate_data(pers, brand, time) {
            var out_data;
            if (pers == "volume") {
                out_data = a_data[brand]["aggs_by_months"][time]["post_vol_counting"];
            } else if (pers == "p_n_ratio") {
                // var pos = a_data[brand]["aggs_by_months"][time]["post_semantic_counting"]["pos"] + a_data[brand]["aggs_by_months"][time]["resp_semantic_counting"]["pos"] ,
                // neg = a_data[brand]["aggs_by_months"][time]["post_semantic_counting"]["neg"] + a_data[brand]["aggs_by_months"][time]["resp_semantic_counting"]["neg"] ;
                var pos = a_data[brand]["aggs_by_months"][time]["post_semantic_counting"]["pos"],
                    neg = a_data[brand]["aggs_by_months"][time]["post_semantic_counting"]["neg"];

                out_data = ((pos + 1) / (neg + 1)).toFixed(3);
            } else {
                out_data = (a_data[brand]["aggs_by_months"][time]["path_to_perspectives"][pers]["pers_score_avg"]).toFixed(3)
            }
            return out_data;
        }

        // for month >12.
        function calculate_data_aggs_month(pers, brand, a_time) {
            var out_data;
            if (pers == "volume") {
                out_data = month_mapping_dict[a_time].map(sub_month => a_data[brand]["aggs_by_months"][sub_month]["post_vol_counting"])
                    .reduce((a, b) => a + b);
            } else if (pers == "p_n_ratio") {
                var pos = month_mapping_dict[a_time].map(sub_month => a_data[brand]["aggs_by_months"][sub_month]["post_semantic_counting"]["pos"])
                    .reduce((a, b) => a + b);
                var neg = month_mapping_dict[a_time].map(sub_month => a_data[brand]["aggs_by_months"][sub_month]["post_semantic_counting"]["neg"])
                    .reduce((a, b) => a + b);
                // var pos = month_mapping_dict[a_time].map(sub_month=>a_data[brand]["aggs_by_months"][sub_month]["post_semantic_counting"]["pos"]+a_data[brand]["aggs_by_months"][sub_month]["resp_semantic_counting"]["pos"])
                // .reduce((a,b)=> a+b);
                // var neg = month_mapping_dict[a_time].map(sub_month=>a_data[brand]["aggs_by_months"][sub_month]["post_semantic_counting"]["neg"]+a_data[brand]["aggs_by_months"][sub_month]["resp_semantic_counting"]["neg"])
                // .reduce((a,b)=> a+b);
                out_data = ((pos + 1) / (neg + 1)).toFixed(3);

            } else {
                var pers_num = month_mapping_dict[a_time].map(sub_month => a_data[brand]["aggs_by_months"][sub_month]["path_to_perspectives"][pers]["pers_docs_num"])
                    .reduce((a, b) => a + b);
                var pers_sum = month_mapping_dict[a_time].map(sub_month => a_data[brand]["aggs_by_months"][sub_month]["path_to_perspectives"][pers]["pers_score_sum"])
                    .reduce((a, b) => a + b);
                out_data = pers_num == 0 ? 0 : (pers_sum / pers_num).toFixed(3);
            }

            return out_data;
        }
    }

    // Radar_Chart
    function draw_radar_plot() {
        var radar_Chart = echarts.getInstanceByDom(document.getElementById("Beelzebub_radar_plot"));

        radar_Chart.setOption(option = {
            color: color_theme,
            title: {
                text: '品牌雷達',
                left: 'center',
                textStyle: {
                    fontSize: 24,
                    fontWeight: 500,
                    fontFamily: "NotoSansCJKtc-Medium"
                },
                top: -5
            },
            tooltip: {
                formatter: function(params) {
                    var content = params["name"] + "<br>";
                    user_choose_p_for_r_and_m.map(field => {
                        content += facet_2_TW_dict[field] + " : " + a_data[params["name"]]["aggs_total"]["path_to_perspectives"][field]["pers_score_avg"].toFixed(3) + "<br>";
                    })
                    return content
                }
            },
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
                    // magicType: {
                    //     title: {
                    //         line: "切換折線圖",
                    //         bar: "切換柱狀圖",
                    //         stack: "切換堆疊圖",
                    //         tiled: "切換平鋪圖",
                    //     },
                    //     type: ['line', 'bar', 'stack', 'tiled']
                    // },
                },
            },
            legend: {
                data: brand_names,
                textStyle: {
                    fontFamily: "NotoSansCJKtc-Medium"
                },
                top: 45
            },
            // grid : {
            // top : 300,
            // left:50
            // },
            radar: {
                center: ["50%", "60%"],
                radius: user_choose_p_for_r_and_m.length == 4 ? "65%" : "67%",
                name: {
                    textStyle: {
                        color: "#333"
                    }
                },
                indicator: user_choose_p_for_r_and_m.map(field => ({
                    name: facet_2_TW_dict[field],
                    max: $(".field_choice_u_want_this").attr("id") == "drama"? 4.5 : 1, // 先寫後重構= =
                    min: 0
                }))
            },
            series: [{
                name: '蛤~~~~~',
                type: 'radar',
                data: brand_names.map(b_n => ({
                    name: b_n,
                    value: user_choose_p_for_r_and_m.map(field =>
                        (a_data[b_n]["aggs_total"]["path_to_perspectives"][field]["pers_score_avg"] < 0 ? 0 : a_data[b_n]["aggs_total"]["path_to_perspectives"][field]["pers_score_avg"]).toFixed(3)
                    )
                }))
            }]
        });

        $('.topic_content[show_chart_QQ="Beelzebub_gluttony_chart"]').one("click", function() {
            setTimeout(function() {
                radar_Chart.resize();
            }, 1);
        });
        $(window).resize(function() {
            radar_Chart.resize();
        });

    }

    // 變成 100 %
    // 效果好?
    // Multi_bar_Chart
    function draw_multi_bar_plot() {

        var mb_Chart = echarts.getInstanceByDom(document.getElementById("Beelzebub_multi_bar_plot"));
        mb_Chart.clear();

        var use_multi_data = multi_bar_etl();

        mb_Chart.setOption(option = {
            // color: color_theme,
            title: {
                text: '品牌總評圖',
                left: 'center',
                textStyle: {
                    fontSize: 24,
                    fontWeight: 500,
                    fontFamily: "NotoSansCJKtc-Medium"
                },
                top: -5
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                // formatter:function(param){
                // 	console.log(param);
                // 	return "QQ"
                // }
            },

			// toolbox: {
			// 	top: "top",
			// 	right: "6%",
			// 	feature: {
			// 		// 圖片儲存模組
			// 		saveAsImage: {
			// 			type: 'png',
			// 			backgroundColor: '#fff',
			// 			excludeComponents: ['toolbox'],
			// 			show: true,
			// 			title: '儲存圖片',
			// 			// 儲存已開較高畫質
			// 			pixelRatio: 2,
			// 		},
			// 		// 任何變更重新整理
			// 		// restore: {
			// 		//  show: true,
			// 		//  title: '重新整理',
			// 		// },
			// 		// 畫面選取縮放功能
			// 		// dataZoom: {
			// 		//  show: true,
			// 		//  title: {
			// 		//      zoom: '區域縮放',
			// 		//      back: '縮放還原',
			// 		//  },
			// 		// },
			// 		// 更換樣式依序為線柱推疊平鋪
			// 		magicType: {
			// 			title: {
			// 				line: "切換折線圖",
			// 				bar: "切換柱狀圖",
			// 				stack: "切換堆疊圖",
			// 				tiled: "切換平鋪圖",
			// 			},
			// 			type: ['stack', 'tiled']
			// 		},
			// 	},
			// },
            legend: {
                data: user_choose_p_for_r_and_m.map(pers => facet_2_TW_dict[pers]),
                textStyle: {
                    fontFamily: "NotoSansCJKtc-Medium"
                },
                top: 35
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: 80,
                containLabel: true
            },
            xAxis: {
                type: 'value',
                max: "dataMax",
            },
            yAxis: {
                type: 'category',
                nameTextStyle: {
                    fontFamily: "NotoSansCJKtc-Medium"
                },
                data: brand_names
            },
            series: use_multi_data
        });
        $('.topic_content[show_chart_QQ="Beelzebub_gluttony_chart"]').one("click", function() {
            setTimeout(function() {
                mb_Chart.resize();
            }, 1);
        });
        $(window).resize(function() {
            mb_Chart.resize();
        });

        function multi_bar_etl() {
            // var brand_pers_sum = {};
            // brand_names.map(b_n=>{
            // 	brand_pers_sum[b_n] = user_choose_p_for_r_and_m.map(p_field=>a_data[b_n]["aggs_total"]["path_to_perspectives"][p_field]["pers_docs_num"])
            // 												   .reduce((a,b)=>a+b);
            // });
            return user_choose_p_for_r_and_m.map(p_field => ({
                name: facet_2_TW_dict[p_field],
                type: "bar",
                stack: "總量",
                label: {
                    normal: {
                        show: true,
                        position: "insideRight"
                    }
                },
                //    data : brand_names.map(b_n=> (a_data[b_n]["aggs_total"]["path_to_perspectives"][p_field]["pers_docs_num"]/brand_pers_sum[b_n]).toFixed(3))
                data: brand_names.map(b_n => a_data[b_n]["aggs_total"]["path_to_perspectives"][p_field]["pers_docs_num"])
            }));

        }
    }


    function draw_multi_bar_plot2() {

        var mb_Chart2 = echarts.getInstanceByDom(document.getElementById("Beelzebub_multi_bar_plot2"));
        mb_Chart2.clear();

        var use_multi_data = multi_bar_etl2();

        mb_Chart2.setOption(option = {
                // color: color_theme,
                title: {
                    text: '品牌總評圖-2',
                    left: 'center',
                    textStyle: {
                        fontSize: 24,
                        fontWeight: 500,
                        fontFamily: "NotoSansCJKtc-Medium"
                    },
                    top: -5
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
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
                                stack: "切換堆疊圖",
                                tiled: "切換平鋪圖",
                            },
                            type: ['stack', 'tiled']
                        },
                    },
                },
                legend: {
                    data: user_choose_p_for_r_and_m.map(pers => facet_2_TW_dict[pers]),
                    textStyle: {
                        fontFamily: "NotoSansCJKtc-Medium"
                    },
                    top: 35
                },
                grid: {
                    left: '2%',
                    right: '4%',
                    bottom: '3%',
                    top: 80,
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    max: "dataMax",
                },
                yAxis: {
                    type: 'category',
                    nameTextStyle: {
                        fontFamily: "NotoSansCJKtc-Medium"
                    },
                    data: brand_names
                },
                series: use_multi_data
            });
        $('.topic_content[show_chart_QQ="Beelzebub_gluttony_chart"]').one("click", function() {
            setTimeout(function() {
                mb_Chart2.resize();
            }, 1);
        });
        $(window).resize(function() {
            mb_Chart2.resize();
        });

        function multi_bar_etl2() {
            var brand_pers_sum = {};
            brand_names.map(b_n => {
                brand_pers_sum[b_n] = user_choose_p_for_r_and_m.map(p_field => a_data[b_n]["aggs_total"]["path_to_perspectives"][p_field]["pers_docs_num"])
                    .reduce((a, b) => a + b);
            });
            return user_choose_p_for_r_and_m.map(p_field => ({
                name: facet_2_TW_dict[p_field],
                type: "bar",
                stack: "總量",
                label: {
                    normal: {
                        show: true,
                        position: "insideRight"
                    }
                },
                data: brand_names.map(b_n => (a_data[b_n]["aggs_total"]["path_to_perspectives"][p_field]["pers_docs_num"] / brand_pers_sum[b_n]).toFixed(3))
                    // data: brand_names.map(b_n => a_data[b_n]["aggs_total"]["path_to_perspectives"][p_field]["pers_docs_num"])
            }));

        }
    }

    console.log(((new Date) - t_start) / 1000);
}
