function index_8_volTracking(a_data){

	var good = '#E54A4A' , bad  = "#4CD381" , gush_total = "#4682D4";
	var days = Object.keys(a_data["aggs_by_days"]);

	$('#chart_8_volume').highcharts({
		chart : {
			backgroundColor: '#fff',
            type: 'line',
            zoomType: 'x',
            height:650,
            style: {
                fontSize: "16px"
            }
		},
        title: {
            text: '聲量追蹤',
            x: -20 ,
			style : {
				fontSize : "24px",
				fontFamily : 'NotoSansCJKtc-Medium'
			}
		},
        xAxis: {
			type : "category",
            categories : days,
			labels : {
				rotation : -45,
				step :days.length-1,
				style : {
					"fontWeight":"bold"
				}
			},
			tickColor : "#FFF"
		},
        yAxis: {
            title: {
                text: '聲量' ,
				style : {
					fontSize : "24px",
					fontFamily : 'NotoSansCJKtc-Medium'
				}
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
			shared : true,
			split: true,
            style: {
				 font: '20px NotoSansCJKtc-Medium',
				 fontSize: "14px"
			}
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0 ,
			itemStyle: {
                 font: '20px NotoSansCJKtc-Medium'
             },
        },
		exporting : {
			sourceWidth: 1200,
            sourceHeight: 600,
		},
		plotOptions:{
			series:{
				cursor : "pointer" ,
				events : {
					click : function(e){
						var query_p = gen_query_post();
						query_p["start_time"] = e.point.category;
						query_p["end_time"] = e.point.category;
						go_ajax({
							url : '/soap/give_me_articles',
							q_data : query_p,
							time_limit : 60000
						}).done(function(result){
							genTable_Index8(result);
						}).fail(function(err){
							alert("連線中斷，請稍後再試");
						});
					}
				}
			}
		},
        series: [{
            name: '正評聲量',
            data: days.map(day=>a_data["aggs_by_days"][day]["post_semantic_counting"]["pos"]) ,
			color : good
        }, {
            name: '負評聲量',
            data: days.map(day=>a_data["aggs_by_days"][day]["post_semantic_counting"]["neg"]) ,
			color : bad
        }, {
            name: ' 總 聲量',
            data: days.map(day=> parseInt(a_data["aggs_by_days"][day]["post_num_counting"]+a_data["aggs_by_days"][day]["post_vol_counting"])) ,
			color : gush_total
        }]
    });
}

function genTable_Index8(result){

	var detail = make_content("volume");

	$('#chart_8_I_dont_know_why_always_table').html(detail);

	$(".chart_8_sort_field").show();

	$(".chart_8_sort_field").click(function(){
		var change_detail = make_content($(this).attr("valueQQ"));
		$(this).addClass("chart_8_sort_u_got_this")
			   .siblings(".chart_8_sort_field").removeClass("chart_8_sort_u_got_this");
		$('#chart_8_I_dont_know_why_always_table').html(change_detail);
	})

	// Prepare function.
	function make_content(p_f){

		// Sorting.
		result.sort((a,b)=> b[p_f] - a[p_f]);

		var content = "<table>"+
						"<tr class='thead' >"+
							"<th class='thcell'>時  間</th>"+
							"<th class='thcell'>標  題</th>"+
							"<th class='thcell'>作  者</th>"+
							"<th class='thcell'>陣  地</th>"+
							"<th class='thcell'>來  源</th>"+
							"<th class='thcell'>人  氣</th>"+
							"<th class='thcell'>情緒分數</th>"+
						"</tr>";
		result.map(ele=>{
			var e_content = "<td class='tdcell'>";
            var e_tag =  ele["content_semantic_tag"] , s_level = ele["content_semantic_grade"];

            e_content += e_tag == "neu" ? "<img style='width:20px;' src='issue_guy/img/icons/neutral_emotion.svg'>" :
                            (e_tag == "pos" ?
                                "<img style='width:20px;' src='issue_guy/img/icons/happy.svg'><img class='emotiom_light' src='issue_guy/img/icons/pos/pos"+ (s_level) +".svg' >" :
                                "<img style='width:20px;' src='issue_guy/img/icons/sad.svg'><img class='emotiom_light' src='issue_guy/img/icons/neg/neg"+ (s_level) +".svg' >"
                            )
            e_content += "</td>";
			var title_detail = ele["title"].length <= 30  ? ele["title"] : ele["title"].substring(0,30) + '...';
			var author_detail = ele["author"].length <= 15  ? ele["author"] : ele["author"].substring(0,15) + '...';
			content += 	"<tr>" +
							"<td class='tdcell'>"+ ele["time"].split(' ')[0] +"</td>"  +
							"<td class='tdcell'><a href='"+ ele["url"] +"' target='_blank' style='color:steelblue;'>"+ title_detail +"</a></td>"+
							"<td class='tdcell'>"+ author_detail +"</td>"+
							"<td class='tdcell'>"+ mapping_dict.en_2_zh_dict[ele["field"]] +"</td>"+
							"<td class='tdcell'>"+ mapping_dict.en_2_zh_dict[ele["website"]] +"</td>"+
							"<td class='tdcell'>"+ ele["volume"].toFixed(0) +"</td>"+
							e_content+
						"</tr>";
		})
		content += "</table>" ;
		return content;
	 };
}
