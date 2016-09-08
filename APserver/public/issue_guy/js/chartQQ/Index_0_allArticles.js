function index_0_allArticles(a_data) {

	genChart_index0_pie(a_data["aggs"]);
	genList_index0_article(a_data["normal_d"] , "time");

	$(".sorting_by_which_index0").click(function(){
		$(this).addClass("I_was_been_clicked")
			   .siblings(".I_was_been_clicked").removeClass("I_was_been_clicked");
		genList_index0_article(a_data["normal_d"] , $(this).attr('value'));
	});

	// scroll 作分頁效果
	// 但瑞凡，好像回不去?!
	// 操作不直覺，進階 排序分頁(不急)
	// $(".Index0_Chart .getting_next_page").unbind("click");
	// $(".Index0_Chart .getting_next_page").click(function(){
	// 	wanna_get_ajax_article_list({scroll_id_QQ : a_data["scroll_id"]})
	// 		.done(function(result){
	// 			result.scroll_data.length>0 && function(){
	// 				genList_index0_article(result.scroll_data,$(".sorting_by_which_index0.I_was_been_clicked").attr('value'));
	// 			}();
	// 		});
	// });

	function genChart_index0_pie(use_obj){
		var init_pie_Chart = echarts.getInstanceByDom(document.getElementById("Initial_search_analysis_pie"));
		if(!init_pie_Chart){ init_pie_Chart = echarts.init(document.getElementById("Initial_search_analysis_pie"));}
		var textStyle = {
							"textStyle" : {
								fontSize : '18',
								fontFamily : "NotoSansCJKtc-Medium"
							}
						};

		var label_size = { "normal" : textStyle , "emphasis" : textStyle };

		init_pie_Chart.setOption(option={
				color:color_theme,
				title : {
					text: '來源分析',
					x:'center',
					y:'5%',
					padding : [3,0,0,0],
					textStyle : {
						fontSize : '25'
					}
				},
				tooltip : {
					trigger: 'item',
	                formatter: function(params) {
	                    var content = params.name + '<br>';
	                    content += '文章數 : ' + numeral(params.value).format("0,0") + ' (' + (params.percent).toFixed(2) + '' + '%)' + '<br>';
	                    content += '回應數 : ' + numeral(params.data.resp).format("0,0");
	                    return content;
	                }
				},
				legend: {
					orient: 'horizontal',
					textStyle : {
						fontSize : '16',
						fontFamily : "NotoSansCJKtc-Medium"
					},
					bottom : "10",
					data : Object.keys(use_obj).map(w_name=>mapping_dict.en_2_zh_dict[w_name])
				},
				series : [
					{
						name: '資料來源',
						type: 'pie',
						radius : '50%',
						center:  ['50%', '45%'],
						data : Object.keys(use_obj).map(w_name=>({
							"name"  : mapping_dict.en_2_zh_dict[w_name],
							"label" : label_size ,
							"value" : use_obj[w_name]["post_num_counting"],
							"resp": use_obj[w_name]["resp_num_counting"],
						})),
						itemStyle: {
							emphasis: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						}
					}
				]
		});
	}

	function genList_index0_article(use_data,type){

		use_data = type == 'time' ? use_data.sort((a,b)=> new Date(b.time) - new Date(a.time) ): use_data.sort((a,b)=>b[type] - a[type] );
		var content = '' ;

		use_data.map((post_ele,p_index)=>{
			var article_id = "article_" + (p_index+1) + "_index0QQ_" + 'Initial_search_analysis_all_articles';
			var content_detail = ( post_ele["content"].length <= 120 ) ? post_ele["content"] : post_ele["content"].substring(0,120) + '...';
			var title_detail = ( post_ele["title"].length <= 30 ) ? post_ele["title"] : post_ele["title"].substring(0,30) + '...';
			var author_detail = ( post_ele["author"].length <= 10 ) ? post_ele["author"] : post_ele["author"].substring(0,10) + '...';

			var s_level = post_ele["content_semantic_grade"];
			content += "<div id = '"+ article_id + "' class ='articles_top_cell_index0' >";
			content +=      "<div class = 'articleQQ' >" +
								"<span class = 'articleQQ_title_index0 ' ><img src='issue_guy/img/icons/fountain-pen.svg'> <a href='" + post_ele["url"] + "' target='_blank'> "+ title_detail +"</a></span>"+
							"</div>"+
							"<div class = 'article_content_index0' style='margin-left:3px;'>"+ content_detail + "</div>" +
							"<div class = 'articleQQ'>"+
								"<span class = 'articleQQ_time_index0 ' ><img src='issue_guy/img/icons/hourglass.svg'> "+ post_ele["time"].split(' ')[0] +"</span>"+
								"<span class = 'articleQQ_volume_index0 articleQQ_element' ><img src='issue_guy/img/icons/speaker_b.svg'> "+ post_ele["volume"].toFixed(0) +"</span>"+
								"<span class = 'articleQQ_emotion_score_index0 articleQQ_element' ><img src='issue_guy/img/icons/"+ ( (post_ele["content_semantic_tag"]== "neu" ) ? "neutral_emotion.svg'></span>"  :
								(post_ele["content_semantic_tag"]== "pos" ? "happy.svg'><img class='emotiom_light' src='issue_guy/img/icons/pos/pos"+ (s_level) +".svg' ></span>" : "sad.svg'><img class='emotiom_light' src='issue_guy/img/icons/neg/neg"+ (s_level) +".svg'></span>")  )+
								"<span class = 'articleQQ_author_index0 articleQQ_element' ><img src='issue_guy/img/icons/manager.svg'> "+ author_detail +"</span>"+
								"<span class = 'articleQQ_website_index0 articleQQ_element' ><img src='issue_guy/img/icons/rss.svg'> "+ mapping_dict.en_2_zh_dict[post_ele["website"]] +"</span>"+
							"</div>"+
						"</div><hr style='height:1px;background-color:#bbb;width:95%;'>";
		});

		$("#Initial_search_analysis_all_articles").html(content);

		$(".articleQQ_"+ type +"_index0").css("color","#FF3333");
		content = null ;
	}
}
