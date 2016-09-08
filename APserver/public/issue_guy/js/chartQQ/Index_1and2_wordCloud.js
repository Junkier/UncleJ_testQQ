function index_1and2_wordCloud(w_data){

	// Index1 : WordCloud.
	var cloud_data = w_data.map(w_ele=>({
		text   : w_ele.word  ,
		weight : w_ele.count ,
		link   : '/soap?LeoKing=' + w_ele.word
	})).sort((a,b)=>b.weight-a.weight);

	// watch out Index11 , Index12
	genChart_index1_cloud(cloud_data);

	// Index2 : Top 20 bar.
	var bar_data = w_data.map(w_ele=>([w_ele.word ,w_ele.count])).sort((a,b)=>b[1]-a[1]);
	bar_data.length = 20;
	genChart_index2_topbar(bar_data);
}


function genChart_index1_cloud(data){

	// Initialize

	// $('#jqcloudContent').empty();
	$('#jqcloudContent').jQCloud('destroy');

	setTimeout(function(){
		 $('#jqcloudContent').empty().jQCloud(data, {
            steps:6,
            classPattern: 'w{n}',
            // colors: ['#F00000', '#A830FF', '#00C200', '#1212FF', '#fa2', '#B0B0B0'],
			colors:color_theme,
            fontSize: {from: 0.1, to: 0.025},
            delay: 10    //文字雲中文字出現時間
		}) ;
		 $('#jqcloudContent').jQCloud('update', data);
	 },10);
}


function genChart_index2_topbar(data){
	$('#topWord').highcharts({
		chart: {
			backgroundColor: '#FFF',
			type: 'column'
		},
		title: {
			text: 'Top 20 字詞排行',
			style : {
				fontSize : "24",
				fontFamily : 'NotoSansCJKtc-Medium'
			}
		},
		xAxis: {
			type: 'category',
			labels: {
				rotation: -45,
				style: {
					fontSize: '16px',
					fontFamily : 'NotoSansCJKtc-Medium'
				}
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: '頻率',
				rotation: 0,
				style:{
					fontSize: '16px',
					fontFamily : 'NotoSansCJKtc-Medium'
				}
			}
		},
		legend: {
			enabled: false
		},
		tooltip: {
			style: {
				 font: '20px NotoSansCJKtc-Medium',
				 fontSize: "14px",
			},
			pointFormat: '頻率 ： <b>{point.y:.0f} 次</b>'
		},
		exporting : {
			type: 'image/png',
			sourceWidth: 1000,
            sourceHeight: 500,
		},
		colors:color_theme,
		plotOptions:{
			series:{
				cursor : 'pointer' ,
				point : {
					events : {
						click : function(e){
							var query_p = gen_query_post();
							query_p["focus_word"] = e.point.name;
							go_ajax({
					            url : '/soap/give_me_articles',
					            q_data : query_p,
					            time_limit : 60000
					        }).done(function(result){
								genTable_Castle_in_the_sky(result,query_p["keyword"],query_p["focus_word"]);
							}).fail(function(err){
								alert("文章不科學，按其他關鍵字吧");
							})
						}
					}
				}
			}
		},
		series: [{
			name: 'Population',
			data: data,
			dataLabels: {
				enabled: true,
				rotation: 0,
				color: '#FFFFFF',
				align: 'right',
				format: '{point.y:.0f}', // one decimal // #'{point.y:.1f}'小數點後第1位
				y: 10, // 10 pixels down from the top
				style: {
					fontSize: '13px',
					fontFamily : 'NotoSansCJKtc-Medium'
				}
			}
		}]
	});
}


function genTable_Castle_in_the_sky(table_data,user_word,care_word){

	// user : Index2 , Index10
	// Initialize
	$('#Apple_Leaf').remove();

	var detail = make_content("time");

	$('body').append("<div id='Apple_Leaf' >" +
						"<div id='Apple_Leaf_for_sort'></div>" +
						"<div id='Apple_Leaf_for_articles'></div>" +
					 "</div>");

	$("#Apple_Leaf_for_sort").append( "<div class='sort_field sort_u_got_this' valueQQ='time' style='left:10px;'><img src='issue_guy/img/icons/hourglass.svg'> 時間排序</div>"+
								      "<div class='sort_field' valueQQ='volume' style='left:20px;'><img src='issue_guy/img/icons/speaker_w.svg'> 人氣排序</div>"+
									  "<div class='sort_field' valueQQ='content_semantic_score' style='left:30px;border-right:0px solid #fff;'><img src='issue_guy/img/icons/neutral_emotion.svg'> 情緒排序</div>"+
									  "<span class='close_arti' ><img src='issue_guy/img/close.svg'></span>"+
									  "<div style='clear:both;'></div>");

	$("#Apple_Leaf_for_articles").html(detail);

	$('#Apple_Leaf').addClass('castle_in_the_sky')
					.css({'top' : $('.Index2_Chart').css("display") == "block" ? $('.Index2_Chart').offset().top : $('.Index10_Chart').offset().top +40})
					.show('slow');

	// After function.
	$(".sort_field").click(function(){
		var change_detail = make_content($(this).attr("valueQQ"));
		$(this).addClass("sort_u_got_this")
			   .siblings(".sort_field").removeClass("sort_u_got_this");
		$('#Apple_Leaf_for_articles').html(change_detail);
	})

	$(".close_arti> img").click(function(){
		$(this).unbind();
		$('#Apple_Leaf').hide('slow',function(){
			$('#Apple_Leaf').remove()
		});
	})

	function make_content(p_f){
		// Sorting.
		if(p_f=="time"){
			table_data.sort((a,b)=> new Date(b["time"]) - new Date(a["time"]));
		} else {
			table_data.sort((a,b)=>b[p_f] - a[p_f]);
		}

		var content = "<div id='got_u_title'>關注字 : " +user_word+" - "+ care_word + "</div>" +
					   "<table>"+
						"<tr class='thead'>"+
							"<th class='thcell'>排 名</th>"+
							"<th class='thcell'>時 間</th>"+
							"<th class='thcell'>標 題</th>"+
							"<th class='thcell'>作 者</th>"+
							"<th class='thcell'>陣 地</th>"+
							"<th class='thcell'>來 源</th>"+
							"<th class='thcell'>人 氣</th>"+
							"<th class='thcell'>情緒分數</th>"+
						"</tr>";

		table_data.map((ele,i)=>{
			var e_content = "<td class='tdcell'>", s_level = ele["content_semantic_grade"];
			e_content += ele["content_semantic_tag"] == "neu" ? "<img src='issue_guy/img/icons/neutral_emotion.svg'>" :
                            (ele["content_semantic_tag"] == "pos" ?
                                "<img src='issue_guy/img/icons/happy.svg'><img class='emotiom_light' src='issue_guy/img/icons/pos/pos"+ (s_level) +".svg' >" :
                                "<img src='issue_guy/img/icons/sad.svg'><img class='emotiom_light' src='issue_guy/img/icons/neg/neg"+ (s_level) +".svg' >"
                            )
            e_content += "</td>";

			var title_detail = (ele["title"].length <= 30 ) ? ele["title"] : ele["title"].substring(0,30) + '...';
			var author_detail = (ele["author"].length <= 10 ) ? ele["author"] : ele["author"].substring(0,10) + '...';
				content += 		"<td class='tdcell'>No." + (i+1) +"</td>"+
								"<td class='tdcell'>"+ ele["time"].split(' ')[0] +"</td>"+
								"<td class='tdcell'><a href='"+ ele["url"] +"' target='_blank' style='color:steelblue;'>"+ title_detail +"</a></td>"+
								"<td class='tdcell'>"+ author_detail +"</td>"+
								"<td class='tdcell'>"+  mapping_dict.en_2_zh_dict[ele["field"]] +"</td>"+
								"<td class='tdcell'>"+  mapping_dict.en_2_zh_dict[ele["website"]]+"</td>"+
								"<td class='tdcell'>"+ ele["volume"].toFixed(0)+"</td>"+
								e_content +
							"</tr>";
		});

		content += "</table>" ;

		return content;

	 };
}
