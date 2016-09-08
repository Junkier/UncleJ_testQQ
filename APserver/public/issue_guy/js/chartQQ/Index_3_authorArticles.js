function index_3_authorArticles(a_data){

	// Initialize.
	$('.AuthorTop10 .author_lists_span').unbind("click");

	genList_timelist(a_data["aggs_by_days"]);
	genList_author(a_data["aggs_by_authors"]);
	genChart_index3(a_data["aggs_by_days"]);

	$('.AuthorTop10 .author_lists_span').click(gen_hight_light_list);

	function genChart_index3(use_obj){
		var days = Object.keys(use_obj);
		var post_Chart  = echarts.getInstanceByDom(document.getElementById("chart_postNumbers"));
		if(!post_Chart){ post_Chart = echarts.init(document.getElementById("chart_postNumbers"));}

		// Freeman 的 config.
		post_Chart.setOption(option={
			color:color_theme,
			grid: {
				// top: "10%",
				right: "6%",
				left: "6%",
			},
			itemStyle: {
				normal: {
					borderWidth: 30,
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
					// 	show: true,
					// 	title: '重新整理',
					// },
					// 畫面選取縮放功能
					// dataZoom: {
					// 	show: true,
					// 	title: {
					// 		zoom: '區域縮放',
					// 		back: '縮放還原',
					// 	},
					// },
					// 更換樣式依序為線柱推疊平鋪
					magicType: {
						title:{
							line:"切換折線圖",
							bar:"切換柱狀圖"
						},
						type: ['line', 'bar']
					},
				},
			},
			tooltip: {},
			xAxis: {
				type: "category",
				name: '日期',
				data: days,
				// silent: false,
				splitLine: {
					show: false
				}
			},
			yAxis: {
				type : "value",
				name: '文章數',
				max: 'dataMax',
			},
			series: [{
				name: '文章數',
				type: 'bar',
				data: days.map(day=>use_obj[day]["post_num_counting"]),
				animationDelay: function (idx) {
					return idx * 10;
				}
			}],
			animationEasing: 'elasticOut',
			animationDelayUpdate: function (idx) {
				return idx * 5;
			}
		})
		// $('.topic_content[show_chart_QQ*="Index3"]').click(function(){
		// 	setTimeout(function(){ post_Chart.resize(); },1)	;
		// })

		post_Chart.off("click");
		post_Chart.on("click",function(params){
			catch_me_if_you_can(params.name);
		});
	}

	function genList_timelist(use_obj){

		$('.Post_list').html('');
		var color ='linear-gradient(-90deg, #ccc, #eee);',color2 ='#f0f0f0';
		var content = '' ;

		Object.keys(use_obj).map(day=>{

			content += '<div class = "' + day +'" style="background:' + color + ';">' + day + '</div>';

			use_obj[day]["post_element"].map(p_ele=>{

				var title_detail = p_ele["title"].length <= 20 ? p_ele["title"] : p_ele["title"].substring(0,20) + '...';
				var	url   = p_ele["url"] ,
					author_class = p_ele["author"].split(" ").join("_") + "_post";
					author_class = author_class.replace(/[)(><~!@#$%^&*.,]/gi,"_");
					content += '<div style="background:' + color + ';">&nbsp&nbsp&nbsp&nbsp&nbsp<a href = "'+ url + '" target = "_blank" class = "' + author_class + '">' + title_detail + '</a></div>';
			})

		});
		$('.Post_list').html(content);
		content = null  ;
	}

	function genList_author(author_arr){
		$('.AuthorTop10').html('');
		var heroes = '' ;
		author_arr.map(author_ele=>{
			heroes += '<div style="cursor : pointer;"><div class="author_lists_span">' + author_ele["author"] + ' , ' + author_ele["doc_count"]+ '</div></div>';
		})
		$('.AuthorTop10').html(heroes);
		heroes = null ;
	}

	// If hero is clicked , then we collect and highlight his articles
	function gen_hight_light_list(){

		var author_text =  $(this).text().split(',')[0].trim().split(" ").join("_") + '_post';
		var author_Q = author_text.replace(/[)(><~!@#$%^&*.,]/gi,"_") + 'we_need_to_fix_by_QQQQ';
		var author_class = '.' +  author_text.replace(/[)(><~!@#$%^&*.,]/gi,"_");

		if( $("#" + author_Q ).length == 0 ){
			$(this).parent().append('<div class = "Author_list" id = "' + author_Q  + '"></div>');
			$('.Post_list a' + author_class).each(function(){
				var title_detail = $(this).text().trim().length <= 35 ?  $(this).text().trim() : $(this).text().trim().substring(0,35) + '...';
				$("#" + author_Q ).append('<a href="'+ $(this).attr('href')+'" target="_blank">' + title_detail + '</a>');
			});
			$("#" + author_Q ).css("display","none");
		}

		$("#" + author_Q ).toggle("blind");

		$('.Post_list a').removeClass('showWebaby');
		$('.author_lists_span').removeClass('showWebaby');
		$(author_class).addClass('showWebaby');
		$(this).addClass('showWebaby');
	}


	// If bar is clicked , then the list scroll to that day
	function catch_me_if_you_can(ele){
		var day_position = $('.' + ele).position()["top"];
		var total = day_position + $('.Post_list').scrollTop();
		var expect_value = $(".Post_list").position()["top"] + 5 ;
		var bar_position = total - expect_value ;
		$(".Post_list").scrollTop(bar_position);
	}
}
