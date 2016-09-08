function Mammon_chart(association_data){

	// Initialize
	d3.selectAll("#Mammon_sorting_block svg").remove();
	d3.selectAll(".M_tooltip").remove();
	$(".Mammon_greed_chart input").click(function(){
		gen_greed_circles_chart(association_data[$(this).val()]);
	});

	// 可能需要減少字的數量
}

function gen_greed_circles_chart(data_QQ){
	// Initialize
	d3.selectAll("#Mammon_sorting_block svg").remove();
	d3.selectAll(".M_tooltip").remove();
	$(window).unbind();

	// Prepare D3 Layout
	var w =  $(".Mammon_greed_chart").width(),
		h =  $(".Mammon_greed_chart").height(),
		r = 720,
		x = d3.scale.linear().range([0, r]),
		y = d3.scale.linear().range([0, r]),
		// node,
		root;

	var pack = d3.layout.pack()
		.size([r, r])
		.value(function(d) { return d.size; })

	var tip = d3.select(".Mammon_greed_chart")
	            .append("div")
				.attr("class","M_tooltip")
				.style("opacity",0);

	var vis = d3.select("#Mammon_sorting_block")
	    .insert("svg:svg", "h2")
		.attr("width", w)
		.attr("height", 710)
	    .append("svg:g")
		.attr("transform", "translate(" + (w - r) / 2 + "," + ( (h - r) / 2 - 40 )+ ")");

	// Prepare function.
	var zoom = function (d) {
		var k = r / d.r / 2;
		// console.log(k);
		// k == 1 is root.

		x.domain([d.x - d.r, d.x + d.r]);
		y.domain([d.y - d.r, d.y + d.r]);

		var t = vis.transition()
				 .duration(d3.event.altKey ? 7500 : 850);

		t.selectAll("circle")
			.attr("cx", function(d) { return x(d.x); })
			.attr("cy", function(d) { return y(d.y); })
			.attr("r", function(d) { return k * d.r; });

		t.selectAll("text")
			.attr("x", function(d) { return x(d.x); })
			.attr("y", function(d) { return y(d.y); })
			// .style("opacity", function(d) { return k * d.r > 20 ? 1 : 0; })
			.style("font-size" , function(d) { return k < 1.1 ? "12px" : "20px";});
	  // node = d;
		d3.event.stopPropagation();
	}

	function gen_circle_and_text(data){
		// node = root = data;
		var root = data;
		var nodes = pack.nodes(root);

		// circle first , then text.
		vis.selectAll("circle")
			.data(nodes)
			.enter().append("svg:circle")
			.attr("class", function(d) { return d.children ? "parent" : "child"; })
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
			.attr("r", function(d) { return d.r; })
			.on("click", function(d) { return zoom(d); });

		vis.selectAll("text")
			  .data(nodes)
			  .enter().append("svg:text")
			  .attr("class", function(d) { return d.children ? "parent" : "child"; })
			  .attr("x", function(d) { return d.x; })
			  .attr("y", function(d) { return d.y; })
			  .attr("dy", ".35em")
			  .attr("text-anchor", "middle")
			  // .style("opacity", function(d) { return d.r > 20 ? 1 : 0; })
			  .text(function(d) { return d.name; })

		vis.selectAll("text.child")
		   .on("mouseover" , function(d){
				d3.select(this).style("fill","#fa2");

				// make tooltip.
				tip.transition()
				   .duration(200)
				   .style("opacity" , .7);
				tip.html(function(){
						var d_type = d.parent.parent.name;
						if (d_type == 'all_fptree'){
							return "<strong>" + d.name + "<br>關聯度 : </strong><span style='#f00'>" + d.size.toFixed(3) + "</span>";
						} else {
							return "<strong>" + d.name +"<br>詞頻 : </strong><span style='#f00'>" + d.size + "</span>";
						}
					})
					.style("left" , (d3.event.pageX-200) + 'px')
					.style("top" , (d3.event.pageY-200) + 'px');
		   })
		   .on("mouseout" , function(d){
			   d3.select(this).style("fill","#000");
			   tip.transition()
			      .duration(500)
				  .style("opacity",0);
		   })
		   .on("click" , function(d){
				var query_data = gen_query_post() ;
				var user_c_industry = $(".field_choice_u_want_this").attr("id");
				query_data["chart_mode"] = "Mammon";
				query_data["focus"] = d.name;
				query_data["brands_what_I_want"] = [ FH[ user_c_industry ]["brands"][user_c_industry + "_" + d.parent.name] ];
				ajax_article_list(query_data).done(function(result){
					gen_article_list_Mammon(result,d.name);
				});
		   })

		d3.select(window).on("click",function(){
			$(".Mammon_greed_chart").css("display") == "block" && zoom(root);
		})

		// Remove the 1st text & Biggest circle.
		vis.select("circle").remove();
		vis.select("text").remove();

	};

	gen_circle_and_text(data_QQ);

}


function gen_article_list_Mammon(raw_data,user_care_word){

	// Initialize
	$('#Fracius_fortune_teller').remove();

	var detail = make_content_for_table("time");

	$('body').append("<div id='Fracius_fortune_teller' data-scroll-scope='force'>" +
						"<div id='Fracius_for_sort'></div>" +
						"<div id='Fracius_for_articles'></div>" +
					 "</div>");

	$("#Fracius_for_sort").append( "<div class='sort_field sort_u_got_this' valueQQ='time' style='left:10px;'><img src='brands_girl/img/hourglass.svg'> 時間排序</div>"+
									  "<div class='sort_field' valueQQ='volume' style='left:20px;'><img src='brands_girl/img/speaker_w.svg'> 人氣排序</div>"+
									  "<div class='sort_field' valueQQ='content_semantic_score' style='left:30px;border-right:0px solid #fff;'><img src='brands_girl/img/neutral_emotion.svg'> 情緒排序</div>"+
 								  	  "<span class='close_arti' ><img src='issue_guy/img/close.svg'></span>"+
									  "<div style='clear:both;'></div>");

	$("#Fracius_for_articles").html(detail);

	$('#Fracius_fortune_teller').addClass('castle_in_the_sky')
					.css({
						'top' : $('.Mammon_greed_chart').offset().top ,
						'position' : 'fixed'
					})
					.show('slow');

	// After function.
	$(".sort_field").click(function(){
		var change_detail = make_content_for_table($(this).attr("valueQQ"));
		$(this).addClass("sort_u_got_this")
			   .siblings(".sort_field").removeClass("sort_u_got_this");
		$('#Fracius_for_articles').html(change_detail);
	})
	$(".close_arti> img").click(function(){
		$(this).unbind();
		$('#Fracius_fortune_teller').hide('slow',function(){
			$('#Fracius_fortune_teller').remove()
		});
	})

	// Prepare function.
	function make_content_for_table(p_f){

		var brand_name = Object.keys(raw_data)[0];
		var use_data = raw_data[brand_name];
		var use_data_len = use_data.length;

		// Sorting.
		if(p_f=="time"){
			use_data.sort(function(a,b){return  new Date(b["time"]) - new Date(a["time"]) });
		} else {
			use_data.sort(function(a,b){return b[p_f] - a[p_f]});
		}

		var content = "<div id='got_u_title'>"+ brand_name + " - 關注字 : " + user_care_word+ "</div>" +
						 "<table>"+
								"<tr class='thead'>"+
								"<th class='thcell'>排名</th>"+
								"<th class='thcell'>時 間</th>"+
								"<th class='thcell'>標 題</th>"+
								"<th class='thcell'>作 者</th>"+
								"<th class='thcell'>陣 地</th>"+
								"<th class='thcell'>來 源</th>"+
								"<th class='thcell'>人 氣</th>"+
								"<th class='thcell'>情緒分數</th>"+
							"</tr>";

		use_data.map((post_ele,i)=>{
			var e_content = "<td class='tdcell'>";
			var s_level   =  post_ele["content_semantic_grade"];
				e_content += post_ele["content_semantic_tag"] == "neu" ? "<img src='brands_girl/img/neutral_emotion.svg' style='width: 20px;'>" :
							(post_ele["content_semantic_tag"] == "pos" ?
								"<img style='width: 20px;' src='brands_girl/img/happy.svg'><img class='emotiom_light' src='brands_girl/img/pos/pos"+ (s_level) +".svg' >":
								"<img style='width: 20px;' src='brands_girl/img/sad.svg'><img class='emotiom_light' src='brands_girl/img/neg/neg"+ (s_level) +".svg' >"
							)

			e_content += "</td>";

			var title_detail = (post_ele["title"].length <= 35 ) ? post_ele["title"] : post_ele["title"].substring(0,35) + '...';
			var author_detail = (post_ele["author"].length <= 10 ) ? post_ele["author"] : post_ele["author"].substring(0,10) + '...';

			content += 	"<tr>"+
							"<td class='tdcell'>No." + (i+1) +"</td>"+
							"<td class='tdcell'>"+ post_ele["time"].split(' ')[0] +"</td>"+
							"<td class='tdcell'><a href='"+ post_ele["url"] +"' target='_blank' style='color:steelblue;'>"+ title_detail+"</a></td>"+
							"<td class='tdcell'>"+ author_detail +"</td>"+
							"<td class='tdcell'>"+ mapping_dict.en_2_zh_dict[post_ele["field"]] +"</td>"+
							"<td class='tdcell'>"+ mapping_dict.en_2_zh_dict[post_ele["website"]] +"</td>"+
							"<td class='tdcell'>"+ post_ele["volume"].toFixed(0)+"</td>"+
							e_content +
						"</tr>";
		})

		content += "</table>" ;

		return content;
	}
}
