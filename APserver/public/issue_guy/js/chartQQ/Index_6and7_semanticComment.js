function index_6and7_semanticComment(a_data){

	// Config.
	var good = '#E54A4A' , bad  = "#4CC381" , stupid_guy = "steelblue";

	// Initialize Index_7_chart
	var cap_Chart = echarts.getInstanceByDom(document.getElementById("chart_7_CaptainAmerican"));
	if(cap_Chart){cap_Chart.clear()};
	$("#chart7_postQQ").remove();
	$("#chart7_responseQQ").remove();

	var webs_arr = Object.keys(a_data["aggs_by_websites"]);
	var index6_use_data = {} , semantic_arr=["pos","neg","neu"];
	semantic_arr.map(semantic_tag=>{
		index6_use_data[semantic_tag] = webs_arr.map( website=> a_data["aggs_by_websites"][website]["post_semantic_counting"][semantic_tag]*(semantic_tag=="neg"? -1:1 ));
		// Add total number.
		index6_use_data[semantic_tag].push(a_data["aggs_total"]["post_semantic_counting"][semantic_tag]*(semantic_tag=="neg"? -1:1) );
	})


	// R.W.D for Index6_chart height.
	var web_chart_len = (webs_arr.length * 80 < 560 ? 560 : webs_arr.length * 80 ) + "px" ;
	$("#emo_count").css( "height", web_chart_len );
	$(".Index6_Chart").css( "height",  (webs_arr.length <= 4 ? webs_arr.length * 80 + 100  : (webs_arr.length <=7 ? webs_arr.length * 80 + 30 : webs_arr.length * 85 +20) ) + "px" );

	genChart_index6(index6_use_data);

	function genChart_index6(use_obj){
		var gun_Chart  = echarts.getInstanceByDom(document.getElementById("emo_count"));
		if(!gun_Chart){ gun_Chart = echarts.init(document.getElementById("emo_count"));}

        var index6_webs_arr = Object.keys(a_data["aggs_by_websites"]); index6_webs_arr.push("Total");
        gun_Chart.setOption(option={
				title: {
					text: '情緒感受',
					textStyle : {
						fontSize : 24,
						fontWeight : 500,
						fontFamily : "NotoSansCJKtc-Medium"
					},
					left: 'center',
					top:20,
					backgroundColor: '#fff'
				},
				tooltip : {
					trigger: 'axis',
					axisPointer : {
						type : 'shadow'
					},
					formatter : function(param){
						if(param.length == 1){
							return param[0]["name"] + "<br>" + param[0]["seriesName"] + " : " + param[0]["data"]["value"];
						} else if (param.length == 2 && param.map(function(ele){ return ele["seriesName"]}).indexOf("中立") != -1 ){
							return param[0]["name"] + "<br>" +
								   param[0]["seriesName"] + " : " + param[0]["data"]["value"] + "<br>" +
								   param[1]["seriesName"] + " : " + param[1]["data"]["value"] ;
						} else {
							var posQQ = param[0]['data']["value"];
							var negQQ = param[1]['data']["value"] * -1;
							if(negQQ == 0){
								return  param[0]["name"] + " <br>" + 'P/N ratio : infinity' ;
							}
							return param[0]["name"] + " <br>" +'正/負比 : ' + ((posQQ/negQQ)).toFixed(1) + "倍"
						}
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
								bar: "切換柱狀圖"
							},
							type: ['line', 'bar']
						},
					},
				},
				legend: {
					x:20,
                	y:40,
					data:[
					{	name : "正面" ,
						textStyle : {
							color : good,
							fontFamily : "NotoSansCJKtc-Medium"
						}
					},
					{	name : "負面" ,
						textStyle : {
							color : bad,
							fontFamily : "NotoSansCJKtc-Medium"
						}
					},{	name : "中立" ,
						textStyle : {
							color : stupid_guy,
							fontFamily : "NotoSansCJKtc-Medium"
						}
					}],
					itemGap : 30,
				},
				grid: {
					top : webs_arr.length <= 7 ? "15%" : "10%",
					left: '3%',
					right: '4%',
					bottom: '3%',
					height: webs_arr.length * 60 + "px",
					containLabel: true
				},
				xAxis : [
					{
						type : 'value'
					}
				],
				yAxis : [
					{
						type : 'category',
						axisTick : {show: false},
						data :index6_webs_arr.map(web_name=>(
										{
											value : mapping_dict.en_2_zh_dict[web_name],
											textStyle : {
												fontFamily : "NotoSansCJKtc-Medium"
											}
										}
									)),
						axisLabel : {
							textStyle : {
								fontSize : '15'
							}
						}
					}
				],
				series : [
					{
						name:'正面',
						type:'bar',
						barMaxWidth: 30,
						label: {
							normal: {
								show: true,
								position: ['105%', -5],
								textStyle: {
									color : '#F29999' ,
									fontSize : '18',
									fontWeight: 'bold'
								}
							}
						},
						itemStyle : {
							normal : {
								color : good
							}
						} ,
						data : use_obj["pos"].map(ele=>({value:ele}))
					},
					{
						name:'負面',
						type:'bar',
						barMaxWidth: 30,
						stack: '總量',
						label: {
							normal: {
								show: true,
								position: [-25, -5],
								textStyle : {
									color : "#6CE3A1" ,
									fontSize : '18',
									fontWeight: 'bold'
								}
							}
						},
						itemStyle : {
							normal : {
								color : bad
							}
						} ,
						data : use_obj["neg"].map(ele=>({
							value : ele ,
							label : {
									normal : {
										show : true ,
										position : ( Math.abs(ele) >=80 ? [-50, -2] : (Math.abs(ele) < 10 ? [-20, -2] : [-30, -2] ) )
									}
							}
						}))
					},
					{
						name:'中立',
						type:'bar',
						barMaxWidth: 30,
						stack: '總量',
						label: {
							normal: {
								show: true,
								position: ['102%', -5],
								textStyle : {
									color : "#56A2D4",
									fontSize : '18',
									fontWeight : 'bold'
								}
							}
						},
						itemStyle : {
							normal : {
								color : stupid_guy
							}
						} ,
						data :use_obj["neu"].map(ele=>({value:ele}))
					}
				]
        });

		gun_Chart.off("click");
		gun_Chart.on('click',function(param){
				genChart_index7(mapping_dict.zh_2_en_dict[ param["name"] ]);
				$("#issuecontrol5 .fp-scroller").css("transform","translate(0px, -781px)");
		});
	}


	function genChart_index7(web_name){

		if(!cap_Chart){ cap_Chart = echarts.init(document.getElementById("chart_7_CaptainAmerican"));}

		var text_style = {
							"textStyle" : {
								"fontSize" : '18',
								"fontFamily" : "NotoSansCJKtc-Medium"
							}
						 };
		var	label_size = { "normal" : text_style , "emphasis" : text_style };

		cap_Chart.setOption(option={
			backgroundColor: '#fff',
			title : {
				text: '正負感受 - ' + mapping_dict.en_2_zh_dict[web_name],
				textStyle : {
						fontSize : 24,
						fontWeight : 500,
						fontFamily : "NotoSansCJKtc-Medium"
				},
				padding : [20,0,0,0],
				x:'center',
				top: 40
			},
			tooltip : {
				trigger: 'item',
				formatter: function(param){
					return param["seriesName"] + "<br>" + param["name"] + " : "  + param["data"]["value"].toString().split(/(?=(?:\d{3})+(?:\.|$))/g).join(',') + " ("+ param["percent"].toFixed(1) +"%)";
				}
			},
			legend: {
				left:40,
				y : 'top',
			    data:[
					{
						name : "正面" ,
						textStyle : {
							color : good,
							fontFamily : "NotoSansCJKtc-Medium"
						}
					},
					{	name : "負面" ,
						textStyle : {
							color : bad,
							fontFamily : "NotoSansCJKtc-Medium"
						}
					},{	name : "中立" ,
						textStyle : {
							color : stupid_guy,
							fontFamily : "NotoSansCJKtc-Medium"
						}
					}]
				},
				toolbox: {
					show : true,
					feature : {
						mark : {show: false},
						dataView : {show: false, readOnly: false},
						magicType : {
							show: false,
							type: ['pie', 'funnel']
						},
						restore : {show: false},
						saveAsImage : {show: true , title : '保存圖片' }
					},
					right : "5.5%",
					y: 'top'
				},
				calculable : true,
				series : [
					{
						name:'正文',
						type:'pie',
						radius : [100, 175],
						center : ['25%', '40%'],
						roseType : 'radius',
						label: {
							normal: {
								show: true
							},
							emphasis: {
								show: true
							}
						},
						labelLine: {
							normal: {
								show: true
							},
							emphasis: {
								show: true
							}
						},
						data:semantic_arr.map(se_tag=>({
							value : web_name=="Total"? a_data["aggs_total"]["post_semantic_counting"][se_tag]: a_data["aggs_by_websites"][web_name]["post_semantic_counting"][se_tag],
							name  : se_tag=='pos'?'正面':(se_tag=='neg'?"負面":"中立") ,
							label : label_size ,
							itemStyle : {
								normal : {
									color : se_tag=='pos'?good:(se_tag=='neg'?bad:stupid_guy)
								}
							}
						}))
					},
					{
						name:'回文',
						type:'pie',
						radius :[100, 175],
						center :  ['75%', '40%'],
						roseType : 'radius',
						data:semantic_arr.map(se_tag=>({
							value : web_name=="Total"? a_data["aggs_total"]["resp_semantic_counting"][se_tag]: a_data["aggs_by_websites"][web_name]["resp_semantic_counting"][se_tag],
							name  : se_tag=='pos'?'正面':(se_tag=='neg'?"負面":"中立") ,
							label : label_size ,
							itemStyle : {
								normal : {
									color : se_tag=='pos'?good:(se_tag=='neg'?bad:stupid_guy)
								}
							}
						}))
					}
				]
		});

		cap_Chart.off("click");
		cap_Chart.on('click',function(param){
			(param.seriesName == '正文') && function(){
				var query_p = gen_query_post();
				if(web_name!="Total"){query_p["type_source"] = [web_name] };
				query_p["use_chart"] = "chart7";
				go_ajax({
					url : '/soap/give_me_articles',
					q_data : query_p,
					time_limit : 60000
				}).done(function(result){
					genTable_Index7(result);
				}).fail(function(err){
					alert("連線中斷，請稍後再試");
				});
			}()
		});

		// Add Post & Resposne logo
		if($("#chart7_postQQ").length==0){
			$('#chart_7_CaptainAmerican canvas').before('<span id="chart7_postQQ" style="font:bold 24px NotoSansCJKtc-Medium;position:relative;top:260px;">正文</span>');
			$('#chart_7_CaptainAmerican canvas').before('<span id="chart7_responseQQ" style="font:bold 24px NotoSansCJKtc-Medium;position:relative;top:260px;">回文</span>');
		}

		// Post , Response logo  R . W . D
		Index7_RWD_guy();

		$(window).resize(function(){
			cap_Chart.resize();
			Index7_RWD_guy();
		});


	}

}

function genTable_Index7(result){

	// Initialize
	$('#Jeff_sheng').remove();
	$(".container-fluid").unbind("click");

	// main function block.
	var detail = make_content("content_semantic_score" , "pos");

	$('body').append("<div id='Jeff_sheng' data-scroll-scope='force'>" +
						"<div id='Jeff_sheng_for_sort'></div>" +
						"<div id='Jeff_sheng_for_articles'></div>" +
					 "</div>");

	$("#Jeff_sheng_for_sort").append( "<div class='sort_field' valueQQ='time' style='left:10px;'><img src='issue_guy/img/icons/hourglass.svg'> 時間排序</div>"+
								      "<div class='sort_field' valueQQ='volume' style='left:20px;'><img src='issue_guy/img/icons/speaker_w.svg'> 人氣排序</div>"+
								      "<div class='sort_field sort_u_got_this' valueQQ='content_semantic_score' style='left:30px;border-right:3px solid #666;'><img src='issue_guy/img/icons/neutral_emotion.svg'> 情緒排序</div>"+
									  "<div class='sort_field_gosh_emo  sort_u_r_angry' valueQQ='pos' style='left:40px;'><img src='issue_guy/img/icons/happy.svg'> 正面列表</div>"+
									  "<div class='sort_field_gosh_emo' valueQQ='neg' style='left:50px;border-right:0px solid #fff;'><img src='issue_guy/img/icons/sad.svg'> 負面列表</div>"+
									  "<span class='close_arti' ><img src='issue_guy/img/close.svg'></span>"+
									  "<div style='clear:both;'></div>"
									  );

	$("#Jeff_sheng_for_articles").html(detail);

	$('#Jeff_sheng').addClass('castle_in_the_sky')
					.css({'top' : $('.Index7_Chart').offset().top })
					.show('slow');


	// After function.
	$(".sort_field").click(function(){
		var change_detail = make_content($(this).attr("valueQQ") , $(".sort_u_r_angry").attr("valueQQ"));
		$(this).addClass("sort_u_got_this")
			   .siblings(".sort_field").removeClass("sort_u_got_this");
		$('#Jeff_sheng_for_articles').html(change_detail);
	})

	$(".sort_field_gosh_emo").click(function(){
		var change_detail = make_content( $(".sort_u_got_this").attr("valueQQ") , $(this).attr("valueQQ") );
		$(this).addClass("sort_u_r_angry")
			   .siblings(".sort_field_gosh_emo").removeClass("sort_u_r_angry");
		$('#Jeff_sheng_for_articles').html(change_detail);
	})

	// echarts is too fast , so we have to wait for 1 ms .
	// throw the event to event engine.

	setTimeout(function(){
		$(".close_arti> img").click(function(){
			$(this).unbind();
			$('#Jeff_sheng').hide('slow',function(){
				$('#Jeff_sheng').remove()
			});
		})
	},1);

	// Prepare function.
	function make_content(p_f , e_c){

		// choose data by emotion
		var use_data =result[e_c];

		// Sorting.
		if(p_f=="time"){
			use_data = use_data.sort((a,b)=> new Date(b["time"]) - new Date(a["time"]) );
		} else if (p_f == "volume"){
			use_data = use_data.sort((a,b)=> b[p_f] - a[p_f]);
		} else {
			use_data = e_c == "pos" ? use_data.sort((a,b)=>b[p_f] - a[p_f] ) : use_data.sort((a,b)=>a[p_f] - b[p_f]);
		}

		var content = "<div style='font-size:30px;text-align:center;color:"+ (e_c == 'pos' ? "#fcc800" : "#e60012" )+";'>"+(e_c == 'pos' ? "正" : "負" )+"面文章</div>" +
						 "<table>"+
							"<tr class='thead'>"+
								"<th class='thcell'>排名</th>"+
								"<th class='thcell'>時  間</th>"+
								"<th class='thcell'>標  題</th>"+
								"<th class='thcell'>作  者</th>"+
								"<th class='thcell'>陣  地</th>"+
								"<th class='thcell'>來  源</th>"+
								"<th class='thcell'>人  氣</th>"+
								"<th class='thcell'>"+ (e_c == 'pos' ? "正" : "負" ) +"面等級</th>"+
							"</tr>";


		use_data.map((ele,i)=>{
			var e_content = "<td class='tdcell'>", s_level = ele["content_semantic_grade"];
            e_content += "<img src='issue_guy/img/icons/"+(e_c== "pos" ? "happy" : "sad") +".svg'><img class='emotiom_light' src='issue_guy/img/icons/"+e_c+"/"+e_c+ (s_level) +".svg' >";
            e_content += "</td>";

			var title_detail = (ele["title"].length <= 35 ) ? ele["title"] : ele["title"].substring(0,35) + '...';
			var author_detail =  (ele["author"].length <= 10 ) ? ele["author"] : ele["author"].substring(0,10) + '...';

			content += 	"<tr class='pos_emotionQQ'>" +
							"<td class='tdcell' style='width:95px;'>No." + (i+1) +"</td>"+
							"<td class='tdcell'>"+ ele["time"].split(' ')[0] +"</td>"  +
							"<td class='tdcell' style='width:500px;'><a href='"+ ele["url"] +"' target='_blank'>"+ title_detail +"</a></td>"+
							"<td class='tdcell' style='width:280px;'>"+ author_detail +"</td>" +
							"<td class='tdcell'>"+ mapping_dict.en_2_zh_dict[ele["field"]] +"</td>"  +
							"<td class='tdcell'>"+ mapping_dict.en_2_zh_dict[ele["website"]] +"</td>"  +
							"<td class='tdcell'>"+ ele["volume"].toFixed(0) +"</td>"+
							e_content+
						"</tr>";
		})
		content += "</table>" ;
		return content
	}
}

function Index7_RWD_guy(){

	var size = $('#chart_7_CaptainAmerican canvas').width() ;

	if( size >= 1000 ) {
		$('#chart7_postQQ').css('left','23%');
		$('#chart7_responseQQ').css('left','69.3%');
	} else if ( size >= 900 && size < 1000) {
		$('#chart7_postQQ').css('left','22.2%');
		$('#chart7_responseQQ').css('left','67.5%');
	} else if ( size >= 800 && size < 900) {
		$('#chart7_postQQ').css('left','22.2%');
		$('#chart7_responseQQ').css('left','66.6%');
	} else if ( size >= 700 && size < 800) {
		$('#chart7_postQQ').css('left','22.2%');
		$('#chart7_responseQQ').css('left','66%');
	}  else if ( size >= 600 && size < 700) {
		$('#chart7_postQQ').css('left','21.5%');
		$('#chart7_responseQQ').css('left','64%' );
	} else if ( size >= 480 && size < 600) {
		$('#chart7_postQQ').css('left','20%');
		$('#chart7_responseQQ').css('left','62%' );
	} else {
		$('#chart7_postQQ').css('left','19.5%');
		$('#chart7_responseQQ').css('left','58%' );
	}
}
