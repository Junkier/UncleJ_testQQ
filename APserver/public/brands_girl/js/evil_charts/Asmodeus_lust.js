function Asmodeus_chart(a_data){
	var t_start = new Date();

	var brand_names = Object.keys(a_data);
	var user_choose_perspective = $("#for_perspective_choice input:checked").map(function(){
				return $(this).parents('li').attr("class").split(' ')[0].split("_")[0] + "_semantic_score";
		}).get().filter(function(p_n){ return p_n != "multiselect-item_semantic_score"});

	var kings = elect_king(user_choose_perspective);
	genHero_lust_rank(kings);


	function elect_king(pk_fields){

		var kingsman = {} ;

		pk_fields.map(pers=>{
			var rank_dict = {};
			var winner_rank = brand_names.map(b_n => ({
					name  : b_n ,
					value : a_data[b_n]["aggs_total"]["path_to_perspectives"][pers]["pers_score_avg"]
				})).sort((a,b) => b.value-a.value);
			winner_rank.map((ele,index) => rank_dict[ele["name"]] = (index+1));
			kingsman[pers] = {
				"winner" : winner_rank[0]["name"],
				"rank" : rank_dict
			};
		})

		// Calculate P , N , P/N ratio.
		var P_N_data = {};
		brand_names.map(b_n=>{
			var pos = a_data[b_n]["aggs_total"]["post_semantic_counting"]["pos"],
				neg = a_data[b_n]["aggs_total"]["post_semantic_counting"]["neg"],

			// var pos = a_data[b_n]["aggs_total"]["post_semantic_counting"]["pos"] + a_data[b_n]["aggs_total"]["resp_semantic_counting"]["pos"],
				// neg = a_data[b_n]["aggs_total"]["post_semantic_counting"]["neg"] + a_data[b_n]["aggs_total"]["resp_semantic_counting"]["neg"],
				pn_ratio = ((pos+1)/(neg+1)).toFixed(3);
				P_N_data[b_n]={
					"pos_vol"       :  pos ,
					"neg_vol"       :  neg ,
					"p_n_ratio" :  pn_ratio ,
					"volume"    :  a_data[b_n]["aggs_total"]["post_vol_counting"]
				}
		})

		Object.keys(P_N_data[brand_names[0]]).map(sem_tag=>{
			var rank_dict = {};
			var winner_rank = brand_names.map(b_n => ({
					name  : b_n ,
					value : P_N_data[b_n][sem_tag]
				})).sort((a,b) => b.value-a.value);
			winner_rank.map((ele,index) => rank_dict[ele["name"]] = (index+1));
			kingsman[sem_tag] = {
				"winner" : winner_rank[0]["name"],
				"rank" : rank_dict
			};
		})

		return kingsman ;

	}


	function genHero_lust_rank(kings_man){

		var facet_2_TW_dict =  new fields_house()[$(".field_choice_u_want_this").attr("id")]["facets"];
		facet_2_TW_dict["volume"] = "總聲量數";
		facet_2_TW_dict["pos_vol"] = "正評聲浪";
		facet_2_TW_dict["neg_vol"] = "負評聲浪";
		facet_2_TW_dict["p_n_ratio"] = "正/負 比率";

		var pk_fields = user_choose_perspective.map(p=>p);
		pk_fields.push("volume","pos_vol","neg_vol","p_n_ratio");

		var content = "<table>" +
						   "<tr class='thead brands_user_chosen'>"+
								"<th class='thcell'>決勝焦點</th>"+
						   "</tr>";
		pk_fields.map(pers=>{
				content += "<tr class = '" + pers + "_pk_field_name_QQ'>" +
								"<td>" + facet_2_TW_dict[pers] +"</td>"+
						   "</tr>";
		})
		content += "</table>";

		$('.Asmodeus_lust_chart').append("<div id='Yvonee_fun'></div>");
		$('#Yvonee_fun').html(content);

		brand_names.map(b_n=>{
			$(".brands_user_chosen").append("<th class='thcell'>"+ b_n +"</th>");
			pk_fields.map(p=>{
				$("tr." + p + "_pk_field_name_QQ").append("<td class='"+ b_n +"_pk_brand_name_KK'>" + kings_man[p]["rank"][b_n] + "</td>");
			})
		})

		pk_fields.map(p=>{
			$("tr." + p + "_pk_field_name_QQ ."+ kings_man[p]["winner"] +"_pk_brand_name_KK").css("transform","translateX(14px)")
																			 .append("<img src='brands_girl/img/king.svg'>");
		});

		$(".Asmodeus_lust_chart tr:not(.thead)").on({
			mouseover : function(){
				$(this).children().find("img").css("transform","rotate(40deg) translateY(-5px)");
			},
			mouseleave : function(){
				$(this).children().find("img").css("transform","rotate(0deg) translateY(-5px)");
			}
		});

		RWD_for_Asmodeus();

		function RWD_for_Asmodeus(){
			var b_number = brand_names.length ;
			$(".Asmodeus_lust_chart").css("height",((user_choose_perspective.length+5)*50+40)+"px");
			$(".Asmodeus_lust_chart td").css("font-size",(b_number>5?18:22)+"px");
			$(".Asmodeus_lust_chart img").css("height",(b_number>5?18:25)+"px");
		}

	}

	console.log(((new Date) - t_start)/1000);
}
