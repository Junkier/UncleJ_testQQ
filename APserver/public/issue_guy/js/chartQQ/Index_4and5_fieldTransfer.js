function index_4and5_fieldTransfer(a_data){

	var days = Object.keys(a_data["aggs_by_days"]);
	var webs_arr = Object.keys(a_data["aggs_by_websites"]);
	var rank_number =3;
	var index5_obj = prepare_index5_data(rank_number);

	var index5_use_data = webs_arr.map(website=>(
		{
				name: mapping_dict.en_2_zh_dict[website],
				type: 'scatter',
				symbol : 'pin',
				symbolSize: function (val) {
					// 第一版 , 待確認Q
					// var chart_val = val[3]*0.08;
					// 第二版 , 待確認Q
					var chart_val = val[3]<=500 ? val[3]*0.1 : (val[3]<=1000 ? val[3]*0.05:val[3]*0.05);
					return chart_val>=160 ? 160 : chart_val;
				},
				symbolRotate : -30,
				data: index5_obj[website] ,
				itemStyle : {
					normal : {
						color : function(params) {
		                        return color_theme[params.seriesIndex]
		                    }
					}
				}

		}
	));

    var index4_use_data = webs_arr.map(website => ({
            name: mapping_dict.en_2_zh_dict[website],
            type: 'line',
            smooth: true,
            symbol: 'none',
            sampling: 'average',
            areaStyle: {
                normal: {
                    color: color_theme[website],
                }
            },
            data: days.map(day =>
                a_data["aggs_by_days"][day]["path_to_website"][website] ?
                (a_data["aggs_by_days"][day]["path_to_website"][website]["post_num_counting"] + a_data["aggs_by_days"][day]["path_to_website"][website]["post_vol_counting"]).toFixed(0) : 0
            )
        }

    ));
    // Jver.
	// var index4_use_data = webs_arr.map(website=>(
	// 	{
	// 		name: mapping_dict.en_2_zh_dict[website],
	// 		type:'line',
	// 		smooth:true,
	// 		symbol: 'none',
	// 		sampling: 'average',
	// 		// areaStyle 配色QQ
	// 		// areaStyle: {
	// 		// 	normal: {
	// 		// 		color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
	// 		// 			offset: 0,
	// 		// 			color: website == "Ptt" ? 'rgb(0, 255, 68)':'rgb(255, 158, 68)'
	// 		// 		}, {
	// 		// 			offset: 1,
	// 		// 			color: website == "Ptt" ? 'rgb(123, 255, 222)':'rgb(255, 70, 131)'
	// 		// 		}])
	// 		// 	}
	// 		// },
	// 		data: days.map(day=>
	// 				a_data["aggs_by_days"][day]["path_to_website"][website] ?
	// 				(a_data["aggs_by_days"][day]["path_to_website"][website]["post_num_counting"] + a_data["aggs_by_days"][day]["path_to_website"][website]["post_vol_counting"]).toFixed(0) : 0
	// 			)
	// 	}
    //
	// ));


	genChart_index4(index4_use_data);
	genChart_index5(index5_use_data);

	function genChart_index4(use_data){

		var stacked_Chart  = echarts.getInstanceByDom(document.getElementById("chart_index4_source"));
		if(!stacked_Chart){ stacked_Chart = echarts.init(document.getElementById("chart_index4_source"));}
		stacked_Chart.clear();
		stacked_Chart.setOption(option={
			color: color_theme,
			tooltip: {
				trigger: 'axis',
				position: function (pt) {
					return [pt[0], '10%'];
				}
			},
			legend: {
                top: 'top',
                left: "3%",
                data: webs_arr.map(web_name => mapping_dict.en_2_zh_dict[web_name])
			},
			// toolbox 設定
            toolbox: {
                top: "top",
                right: "3%",
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
                    dataZoom: {
						title:{
							zoom:"區域縮放",
							back:"縮放還原"
						},
						yAxisIndex: 'none'
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
                        type: ['line', 'bar', 'stack', 'tiled']
                    },
                },
            },
            areaStyle: {
                normal: {
                    opacity: 0.3,

                }
            },
            lineStyle: {
                normal: {
                    opacity: 0.1,
                }
            },
            grid: {
                left: '6%',
                right: '4%',
            },
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: days
			},
			yAxis: {
				type: 'value',
				max : 'dataMax',
				boundaryGap: [0, '100%']
			},
			series: use_data
		});

		// $('.topic_content[show_chart_QQ*="Index4"]').click(function(){
		// 	setTimeout(function(){ stacked_Chart.resize(); },1)	;
		// })
	}

	function genChart_index5(use_data){
		var HailChart = echarts.getInstanceByDom(document.getElementById("chart_index5_gosh"));
		if(!HailChart){ HailChart = echarts.init(document.getElementById("chart_index5_gosh"));}
		HailChart.clear();
		HailChart.setOption(option={
			color: color_theme,
			title: {
				text : '陣地輪播',
				textStyle : {
					fontSize : '24'
				},
				x : 'center',
			},
			legend : {
				show : true ,
				top : 40,
				textStyle : {
					fontFamily : "NotoSansCJKtc-Medium"
				},
				x:"center",
				data : webs_arr.map(web_name=>mapping_dict.en_2_zh_dict[web_name])
			},
			tooltip: {
				position : 'bottom',
				formatter : function (params) {
					var content =  "網站 : " + mapping_dict.en_2_zh_dict[webs_arr[params.value[2]]] + '<br>';
						content += "時間 : " + days[params.value[0]] + '<br>';
						content += "聲量 : " + params.value[3].toFixed(0);
					return content;
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
                    restore : {
                        show : false
                    },
                    dataView : {
                        show : false
                    },
                    dataZoom : {
                        show : false
                    },
                    magicType : {
                        show : false
                    }
                },
            },
            areaStyle: {
                normal: {
                    opacity: 0.3,
                }
            },
            lineStyle: {
                normal: {
                    opacity: 0.1,
                }
            },
            itemStyle: {
                normal: {
                     opacity: 0.3,
                },
            },
            grid: {
                top: 180,
                left: '3%',
                bottom: 10,
                right: '4%',
                height: 300,
                containLabel: true
            },
			dataZoom : {
				type : 'slider',
				xAxisIndex : 0 ,
				fillerColor : 'rgba(122,122,122,0.4)',
				handleColor : 'rgba(47,69,184,0.65)',
				realtime : false,
				showDetail : false,
				showDataShadow : false,
			},
			xAxis: {
				type: 'category',
				data: days,
				boundaryGap: false,
				splitLine: {
					show: true,
					lineStyle: {
						color: '#ddd',
						type: 'dashed'
					}
				},
				axisLine: {
					show: false
				}
			},
			yAxis: {
				type: 'category',
				data: Array.from(new Array(rank_number),(x,i)=>"Rank"+(rank_number-i)),
				axisLine: {
					show: false
				}
			},
			series : use_data
		});

		$('.topic_content[show_chart_QQ*="Index5"]').click(function(){
			setTimeout(function(){ HailChart.resize(); },1);
		});

		$(window).resize(function(){ HailChart.resize(); });

	}

	function prepare_index5_data(num){
		var out_data = {} , web_len = webs_arr.length , zero_num = web_len-(num-1);
		webs_arr.map((website,w_index)=>{
			out_data[website]=[];
		})
		// Calculate total volume for every website per day.
		// And get the vol rank.
		days.map((day,d_index)=>{
			webs_arr.map((website,w_index)=>{
				var vol = a_data["aggs_by_days"][day]["path_to_website"][website] ?
						  (a_data["aggs_by_days"][day]["path_to_website"][website]["post_num_counting"] + a_data["aggs_by_days"][day]["path_to_website"][website]["post_vol_counting"])
						  : 0
				return {"website":website , "vol":vol}
			})
			.sort((a,b)=>a.vol-b.vol)
			.map((web_ele,rank_index)=>{
				// [ day , rank  , website ,vol ]
				out_data[web_ele.website].push([d_index , (rank_index<=zero_num? (rank_index==zero_num? 1:0):rank_index-zero_num+1) ,webs_arr.indexOf(web_ele.website) , web_ele.vol]);
			})

		})

		return out_data
	}
}
