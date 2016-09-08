function Belphegor_chart( a_data ){
	var t_start = new Date();

	// 正 情緒 : post_num
	// 負 情緒 : post_num
	// 中 情緒 : post_num

	// Initailize
	var Captain_Chart = echarts.getInstanceByDom(document.getElementById('Belphegor_Captain_American_plot'));
	Captain_Chart.clear();
	$("#chart7_postQQ,#chart7_responseQQ").remove();

	genChart_Iron_Man();

	function genChart_Iron_Man(){
		// Config.
		var good = '#E54A4A' , bad  = "#4CC381" , stupid_guy = "#4682B4";

		var brand_names = Object.keys(a_data);
		var pos = brand_names.map(b_n=>a_data[b_n]["aggs_total"]["post_semantic_counting"]["pos"]),
			neu = brand_names.map(b_n=>a_data[b_n]["aggs_total"]["post_semantic_counting"]["neu"]),
			neg = brand_names.map(b_n=> -a_data[b_n]["aggs_total"]["post_semantic_counting"]["neg"]);

		var Iron_Chart = echarts.getInstanceByDom(document.getElementById("Belphegor_Iron_Man_plot"));

		// R.W.D for Belphegor_Iron_Man_plot height.
		var brand_chart_len = (brand_names.length <=4 ?  brand_names.length*60 + 75 : (brand_names.length <=7 ) ?  brand_names.length*60  :brand_names.length*55 ) + "px" ;
		$("#Belphegor_Iron_Man_plot").css( "height", brand_chart_len );
		$(".Belphegor_sloth_chart").css( "height", ( $("#Belphegor_Captain_American_plot").height() + $("#Belphegor_Iron_Man_plot").height() -50 ) + "px" ) ;

        Iron_Chart.setOption(option={
				title  : {
					text : "品牌感受度",
					textStyle : {
						fontSize : 24,
						fontWeight : 500,
						fontFamily : "NotoSansCJKtc-Medium"
					},
					left : "center" ,
					top  : "-10"
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
							return param[0]["name"] + " <br>" + '正/負比 : ' + ((posQQ/negQQ)).toFixed(1) + "倍"
						}
					}
				},
				legend: {
					top : '28',
					data:["正面","負面","中立"].map(n=>({
						name : n ,
						textStyle : {
							color : n == "正面" ? good : (n=="負面" ? bad :stupid_guy),
							fontFamily : "NotoSansCJKtc-Medium"
						}
					})),
					itemGap : 30,
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					height: (brand_names.length <=4 ? brand_names.length*60 : brand_names.length * 45 )+ "px",
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
						data : brand_names.map(b_n=>({
							value : b_n ,
							textStyle : {
								fontFamily : "NotoSansCJKtc-Medium"
							}
						})) ,
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
						label: {
							normal: {
								show: true,
								position: ['101%', -2],
								textStyle: {
									color : '#F29999' ,
									fontSize : '16',
									fontWeight: 'bold'
								}
							}
						},
						itemStyle : {
							normal : {
								color : good
							}
						} ,
						data:pos.map(ele=>({ value : ele }))
					},
					{
						name:'負面',
						type:'bar',
						stack: '總量',
						label: {
							normal: {
								show: true,
								textStyle : {
									color : "#6CE3A1" ,
									fontSize : '16',
									fontWeight: 'bold'
								}
							}
						},
						itemStyle : {
							normal : {
								color : bad
							}
						} ,
						data:neg.map(ele=>({　
							value : ele ,
							label : {
								normal : {
									show : true ,
									position : ( Math.abs(ele) >=100 ? [-50, -2] : (Math.abs(ele) <=10 ? [-30, -2] : [-40, -2] ) )
								}
							}
						}))
					},
					{
						name:'中立',
						type:'bar',
						stack: '總量',
						label: {
							normal: {
								show: true,
								position :['101%', -2],
								textStyle : {
									color : "#56A2D4",
									fontSize : '16',
									fontWeight : 'bold'
								}
							}
						},
						itemStyle : {
							normal : {
								color : stupid_guy
							}
						} ,
						data:neu.map(ele=>({ value : ele }))
					}
				]
        });

		Iron_Chart.off("click");

		Iron_Chart.on('click',function(param){
			genChart_Captain(param["name"]);
			$('body').animate({
				scrollTop : ($('#Belphegor_Captain_American_plot').offset().top - 40)
			},1000);
		});
	}

	function genChart_Captain(user_care_brand){

		Captain_Chart.resize();

		var good = '#E54A4A' , bad  = "#4CB381" , stupid_guy = "steelblue",
			text_style = {
							"textStyle" : {
								"fontSize" : '18',
								"fontFamily" : "NotoSansCJKtc-Medium"
							}
						},
			label_size = { "normal" : text_style , "emphasis" : text_style };

        Captain_Chart.setOption(option={
            title : {
                text: '正負感受 - ' + user_care_brand,
				textStyle : {
						fontSize : 24,
						fontWeight : 500,
						fontFamily : "NotoSansCJKtc-Medium"
				},
				padding : [20,0,0,0],
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: function(param){
					return param["seriesName"] + "<br>" + param["name"] + " : "  + param["data"]["value"].toString().split(/(?=(?:\d{3})+(?:\.|$))/g).join(',') + " ("+ param["percent"].toFixed(1) +"%)";
				}
            },
            legend: {
                x : 'center',
				top:'14.5%',
                data:["正面","負面","中立"].map(n=>({
					name : n ,
					textStyle : {
						color : n == "正面" ? good : (n=="負面" ? bad :stupid_guy),
						fontFamily : "NotoSansCJKtc-Medium"
					}
			    }))
            },
            toolbox: {
                show : false
			},
            calculable : true,
            series : [
                {
                    name:'正文',
                    type:'pie',
                    radius : [40, 110],
                    center : ['25%', 200],
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
                    data: Object.keys(a_data[user_care_brand]["aggs_total"]["post_semantic_counting"]).map(semantic_tag=>({
						value : a_data[user_care_brand]["aggs_total"]["post_semantic_counting"][semantic_tag] ,
						name  : semantic_tag == "pos" ? '正面' : (semantic_tag== "neg" ? '負面' : '中立') ,
						label : label_size ,
						itemStyle : {
							normal : {
								color : semantic_tag == "pos" ? good : (semantic_tag== "neg" ? bad : stupid_guy)
							}
						}
					}))
                },
                {
                    name:'回文',
                    type:'pie',
                    radius : [40, 110],
                    center : ['75%', 200],
                    roseType : 'radius',
					data: Object.keys(a_data[user_care_brand]["aggs_total"]["resp_semantic_counting"]).map(semantic_tag=>({
						value : a_data[user_care_brand]["aggs_total"]["resp_semantic_counting"][semantic_tag],
						name  : semantic_tag == "pos" ? '正面' : (semantic_tag== "neg" ? '負面' : '中立') ,
						label : label_size ,
						itemStyle : {
							normal : {
								color : semantic_tag == "pos" ? good : (semantic_tag== "neg" ? bad : stupid_guy)
							}
						}
					}))
                }
            ]
        });

		Captain_Chart.off("click");

		// 文章列表 !!!
		Captain_Chart.on('click',function(param){
			param.seriesName == '正文' && function(){
				var brand_dict = FH[$(".field_choice_u_want_this").attr("id")]["brands"];
				Object.keys(brand_dict).map(b_n=>{
					if( brand_dict[b_n].indexOf(user_care_brand) != -1 ){
						var query_data = gen_query_post() ;
						var issue_word = $(".Belphegor_sloth_search_word input").val();
						if (issue_word.length>0){ query_data["focus"] = issue_word };
						query_data["chart_mode"] = "Belphegor";
						query_data["brands_what_I_want"] = [brand_dict[b_n]];
						ajax_article_list(query_data).done(function(result){
							gen_article_list_Belphegor(result);
						}).fail(function(err){
							alert("沒有情緒文章喔!!!");
						});
					};
					return;
				})
			}();
		});


		// Add Post & Resposne logo
		if($("#chart7_postQQ").length==0){
			$('#Belphegor_Captain_American_plot canvas').before('<span id="chart7_postQQ" style="font:bold 24px NotoSansCJKtc-Medium;position:relative;top:182px;">正文</span>');
			$('#Belphegor_Captain_American_plot canvas').before('<span id="chart7_responseQQ" style="font:bold 24px NotoSansCJKtc-Medium;position:relative;top:182px;">回文</span>');
		}

		// Post , Response logo  R . W . D
		Captain_chart_RWD_guy();

	}

	console.log(((new Date) - t_start)/1000);
}

function gen_article_list_Belphegor(raw_data){

	// Initialize
	$('#Jeff_sheng').remove();

	var detail = make_content("content_semantic_score" , "pos");

	$('body').append("<div id='Jeff_sheng' data-scroll-scope='force'>" +
						"<div id='Jeff_sheng_for_sort'></div>" +
						"<div id='Jeff_sheng_for_articles'></div>" +
					 "</div>");

	$("#Jeff_sheng_for_sort").append( "<div class='sort_field' valueQQ='time' style='left:10px;'><img src='issue_guy/img/icons/hourglass.svg'> 時間排序</div>"+
									  "<div class='sort_field' valueQQ='volume' style='left:20px;'><img src='issue_guy/img/icons/speaker_w.svg'> 人氣排序</div>"+
									  "<div class='sort_field sort_u_got_this' valueQQ='content_semantic_score' style='left:30px;border-right:3px solid #666;'><img src='issue_guy/img/icons/neutral_emotion.svg'> 情緒排序</div>"+
									  "<div class='sort_field_gosh_emo  sort_u_r_angry' valueQQ='pos' style='left:40px;'><img src='issue_guy/img/icons/happy.svg'> 正評列表</div>"+
									  "<div class='sort_field_gosh_emo' valueQQ='neg' style='left:50px;border-right:0px solid #fff;'><img src='issue_guy/img/icons/sad.svg'> 負評列表</div>"+
									  "<span class='close_arti' ><img src='issue_guy/img/close.svg'></span>"+
									  "<div style='clear:both;'></div>"
									  );

	$("#Jeff_sheng_for_articles").html(detail);

	$('#Jeff_sheng').addClass('castle_in_the_sky')
					.css({'top' : $('#Belphegor_Captain_American_plot').offset().top })
					.show('slow');

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

	function make_content(p_f, e_c){
		var brand_name = Object.keys(raw_data)[0];
		var use_data = raw_data[brand_name][e_c];
		var use_data_len = use_data.length;

		// Sorting.
		if(p_f=="time"){
			use_data.sort(function(a,b){ return  new Date(b["time"]) - new Date(a["time"]) });
		} else if (p_f == "volume"){
			use_data.sort(function(a,b){ return  b[p_f] - a[p_f]});
		}
		else {
			e_c == "pos" ? use_data.sort(function(a,b){return -(a[p_f] - b[p_f] )}) : use_data.sort(function(a,b){return a[p_f] - b[p_f]});
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

		for (var i = 0 ; i < use_data_len ; i ++){
				var e_content = "<td class='tdcell'>";
				var s_level =  use_data[i]["content_semantic_grade"];
				e_content += "<img src='brands_girl/img/"+(e_c== "pos" ? "happy" : "sad") +".svg'><img class='emotiom_light' src='brands_girl/img/"+e_c+"/"+e_c+ (s_level) +".svg' >"
				e_content += "</td>";

				var title_detail = (use_data[i]["title"].length <= 30 ) ? use_data[i]["title"] : use_data[i]["title"].substring(0,30) + '...';
				var author_detail=  (use_data[i]["author"].length <= 10 ) ? use_data[i]["author"] : use_data[i]["author"].substring(0,10) + '...';

				content += 	"<tr class='pos_emotionQQ'>" +
								"<td class='tdcell' style='width:95px;'>No." + (i+1) +"</td>"+
								"<td class='tdcell'>"+ use_data[i]["time"].split(' ')[0] +"</td>"  +
								"<td class='tdcell' style='width:500px;'><a href='"+ use_data[i]["url"] +"' target='_blank'>"+ title_detail +"</a></td>"+
								"<td class='tdcell' style='width:280px;'>"+ author_detail +"</td>" +
								"<td class='tdcell'>"+ mapping_dict.en_2_zh_dict[use_data[i]["field"]] +"</td>"  +
								"<td class='tdcell'>"+ mapping_dict.en_2_zh_dict[use_data[i]["website"]] +"</td>"  +
								"<td class='tdcell'>"+ use_data[i]["volume"].toFixed(0)+"</td>"+
								e_content+
							"</tr>";
		}

		content += "</table>" ;
		return content
	}
}


function Captain_chart_RWD_guy(){

	var size = $('#Belphegor_Captain_American_plot canvas').width() ;

	if( size >= 1000 ) {
		$('#chart7_postQQ').css('left','22.7%');
		$('#chart7_responseQQ').css('left','68.5%');
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
