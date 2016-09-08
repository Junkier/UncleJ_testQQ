function Leviathan_chart( a_data ){
	var t_start = new Date();

	// Initialize
	var straight_Chart   = echarts.getInstanceByDom(document.getElementById("Leviathan_straight_plot"));
	var horizontal_Chart = echarts.getInstanceByDom(document.getElementById("Leviathan_horizontal_plot"));
	var circle_Chart = echarts.getInstanceByDom(document.getElementById("Leviathan_circle_plot"));
	if(horizontal_Chart){ horizontal_Chart.clear(); };
	if(straight_Chart){ straight_Chart.clear(); };

	// Prepare Data.
	var brands_name = Object.keys(a_data);
	var fields_name = Object.keys(a_data[brands_name[0]]["aggs_by_fields"]).map(field => mapping_dict.en_2_zh_dict[field] );

	// Choose one brand for starting.
	make_straight_plot();
	make_circle_plot(brands_name[0]);

	// straight_Chart
	///////////////////////////////////////////////////////////////////////////////////////

	function make_straight_plot(){

		var brands_data = brands_name.map(b_n=>({
				name : b_n   ,
				type : "bar" ,
				data : Object.keys(a_data[b_n]["aggs_by_fields"]).map(field => parseInt(a_data[b_n]["aggs_by_fields"][field]["post_vol_counting"].toFixed(0)))

		}))

		var straight_option = {
				color: color_theme,
				title: {
					text: '陣地表現',
					textStyle : {
						fontSize : 24,
						fontWeight : 500,
						fontFamily : "NotoSansCJKtc-Medium"
					},
					left: "center",
					top : "-10"
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
	                            tiled: "切換平鋪圖",
	                            stack: "切換堆疊圖",
	                        },
	                        type: ['tiled', 'stack']
	                            // type: ['line', 'bar', 'stack', 'tiled']
	                    },
	                },
	            },
				tooltip : {
					trigger: 'axis',
					axisPointer : {
						type : 'shadow'
					}
				},
				legend: {
					top : '28',
					textStyle : {
						fontFamily: "NotoSansCJKtc-Medium"
					},
					data : brands_name
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					containLabel: true
				},
				xAxis : [
					{
						type : 'category',
						data : fields_name
					}
				],
				yAxis : [
					{
						type : 'value'
					}
				],
				series : brands_data

		};

		straight_Chart.setOption(straight_option);

		setTimeout(function(){straight_Chart.resize();},1);

		$('.topic_content[show_chart_QQ="Leviathan_envy_chart"]').click(function(){
			setTimeout(function(){straight_Chart.resize();},1);
		});

		$(window).resize(function(){  straight_Chart.resize(); });

		// Add select list.
		$("#Leviathan_brands_select").html("").append('<select>'+
														'<option value="">請選擇品牌</option>'+
													  '</select>');
		brands_name.map( brand =>{
			$("#Leviathan_brands_select select").append("<option value = '"+ brand +"'>" + brand + "</option>");
		})


		$("#Leviathan_brands_select select").change(function(){
			$(this).val().length > 0 && make_circle_plot($(this).val()) ;
		})

		straight_Chart.off("click");

		straight_Chart.on("click",function(param){
			 make_horizontal_plot(mapping_dict.zh_2_en_dict[ param["name"] ]) ;
			 $('body').animate({
				scrollTop : ($('#Leviathan_horizontal_plot').offset().top - 40)
			 },900);
		})

	}

	///////////////////////////////////////////////////////////////////////////////////////

	// horizontal_Chart
	///////////////////////////////////////////////////////////////////////////////////////
	function make_horizontal_plot(user_focus_field){
		if(!horizontal_Chart){ horizontal_Chart = echarts.init(document.getElementById("Leviathan_horizontal_plot")); };

		var webs_name=[];
		brands_name.map(b_n=>{
			var web_arr = Object.keys(a_data[b_n]["aggs_by_fields"][user_focus_field]["path_to_website"]).map(web_name=> mapping_dict.en_2_zh_dict[web_name] );
			if (web_arr.length > webs_name.length){webs_name=web_arr};
		})
		var webs_data = brands_name.map(b_n=>(
			{
				name : b_n ,
				type : 'bar' ,
				data : Object.keys(a_data[b_n]["aggs_by_fields"][user_focus_field]["path_to_website"]).map(website =>
					parseInt(a_data[b_n]["aggs_by_fields"][user_focus_field]["path_to_website"][website]["post_vol_counting"] )
				)
			}
		));

		webs_name.push("總和");
		webs_data.map(ele=>{
			ele["data"].push(a_data[ele["name"]]["aggs_by_fields"][user_focus_field]["post_vol_counting"].toFixed(0))
		});

		var horizontal_option = {
				color: color_theme,
				title: {
					text : '陣地下探 - ' + mapping_dict.en_2_zh_dict[user_focus_field] ,
					textStyle : {
						fontSize : 24,
						fontWeight : 500,
						fontFamily : "NotoSansCJKtc-Medium"
					},
					left: "center",
					top : "-10"
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
	                            tiled: "切換平鋪圖",
	                            stack: "切換堆疊圖",
	                        },
	                        type: ['tiled', 'stack']
	                            // type: ['line', 'bar', 'stack', 'tiled']
	                    },
	                },
	            },
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'shadow'
					}
				},
				legend: {
					top : '28',
					textStyle : {
						fontFamily : "NotoSansCJKtc-Medium"
					},
					data: brands_name
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					containLabel: true
				},
				xAxis: {
					type: 'value',
					boundaryGap: [0, 0.01]
				},
				yAxis: {
					type: 'category',
					data : webs_name.map(function(w_n){
						return {
							value : w_n ,
							textStyle : {
								fontFamily : "NotoSansCJKtc-Medium"
							}
						}
					})
				},
				series : webs_data
		};

		horizontal_Chart.setOption(horizontal_option);

		$('.topic_content[show_chart_QQ="Leviathan_envy_chart"]').click(function(){
			setTimeout(function(){horizontal_Chart.resize();},1);
		});

		$(window).resize(function(){  horizontal_Chart.resize(); });
	}
	///////////////////////////////////////////////////////////////////////////////////////



	// circle_Chart
	///////////////////////////////////////////////////////////////////////////////////////
	function make_circle_plot(user_focus_brand){
		if(!circle_Chart){ circle_Chart = echarts.init(document.getElementById("Leviathan_circle_plot")); };

		$("#Leviathan_brands_select").prev().length>0 && $("#Leviathan_brands_select").prev().remove();
		$("#Leviathan_brands_select").before("<div class='evil_chart_name'>"+user_focus_brand+" - 輿情組成</div>");

		var care_data = a_data[user_focus_brand]["aggs_by_fields"];
		var web_data = [] ;
		var legend_field_data = [];
		var legend_website_data = [];

		Object.keys(care_data).map(field =>{
			legend_field_data.push({
				name : mapping_dict.en_2_zh_dict[field] ,
				textStyle : {
					fontSize : 18,
					fontFamily : "NotoSansCJKtc-Medium"
				}
			});
			Object.keys(care_data[field]["path_to_website"]).map(website =>{
					legend_website_data.push({
						name : mapping_dict.en_2_zh_dict[website] ,
						textStyle : {
							fontSize : 18,
							fontFamily : "NotoSansCJKtc-Medium"
						}
					});
					web_data.push({
						name : mapping_dict.en_2_zh_dict[website] ,
						value : parseInt( care_data[field]["path_to_website"][website]["post_num_counting"] )
					})
			})
		})

		var use_data = [
			{
				name : "來自陣地" ,
				type : "pie" ,
				radius : ["0%" , "30%"] ,
				center : ["65%" , "45%"],
				data : Object.keys(care_data).map(field =>(
					{
						name  : mapping_dict.en_2_zh_dict[field] ,
						value : parseInt( care_data[field]["post_num_counting"] )
					}
				))
			},
			{
				name : "網站分析齁" ,
				type : "pie" ,
				radius : ["50%" , "70%"] ,
				center : ["65%" , "45%"],
				data : web_data
			}
		]


		var circle_option = {
				color: color_theme,
				tooltip: {
					trigger: 'item',
					formatter : function(param){
						return param["name"] + " : <br> 文章數 : " + param["data"]["value"].toString().split(/(?=(?:\d{3})+(?:\.|$))/g).join(',') + " ("+ param["percent"].toFixed(1) +"%)";
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
	                    //  title:{
	                    //      line:"切換折線圖",
	                    //      bar:"切換柱狀圖",
	                    //      stack:"切換堆疊圖",
	                    //      tiled:"切換平鋪圖",
	                    //  },
	                    //  type: ['line', 'bar', 'stack', 'tiled']
	                    // },
	                },
	            },
				legend: [{
					top : "8%",
					itemWidth : 30 ,
					itemHeight : 20,
					orient: 'vertical',
					// padding : 0,
					left: '5%',
					data : legend_field_data
				},
				{
					top : "8%",
					itemWidth : 30 ,
					itemHeight : 20,
					orient: 'vertical',
					left: '17%',
					data : legend_website_data
				}
				],
				series: use_data ,
				color : ['#c23531',"#FF8800",'#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3']
		};

		circle_Chart.setOption(circle_option);
		setTimeout(function(){ circle_Chart.resize();},1);

		$('.topic_content[show_chart_QQ="Leviathan_envy_chart"]').click(function(){
			setTimeout(function(){ circle_Chart.resize();},1);
		});

		$(window).resize(function(){  circle_Chart.resize(); });

		// make field & website connected.
		// 沒反應!?
		circle_Chart.on("legendselectchanged",function(param){
			if (param["name"] in mapping_dict.sources_dict){
				var switchQQ = param["selected"][param["name"]] ;
				mapping_dict.sources_dict[param["name"]].map(function(ele){
					if(param["selected"][ele] != switchQQ){
						circle_Chart.dispatchAction({
							type : 'legendToggleSelect' ,
							name : ele
						})
					}
				});
			}
		})
	}

	///////////////////////////////////////////////////////////////////////////////////////
	console.log(((new Date) - t_start)/1000);
}
