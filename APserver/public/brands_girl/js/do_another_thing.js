$(function(){

    // Global Variable
    FH = new fields_house();
    mapping_dict = new get_usage_dict();

	// Add Event.
	$("#brands_searchQQ").click(function(){
		Search_new_brands();
	});

	// get ES doc count.
	(function(){
		$.ajax({
			url : "/brands/give_me_doc_count" ,
			type : "GET" ,
			dataType : "json" ,
			success : function(data){
				gen_channel_list(data);
			} ,
			timeout : 10000 ,
			error : function(err){} ,
			complete : function(){
			}
		})
	})();

	// Tool func.
		control_chart_showQQ();
		control_brand_block();
		Time_picker();
		echart_init_dom();
});

function Search_new_brands(){

    // Code Review.

    // Change color.
    color_theme = get_color_swatch();

	// Initialize.
	$(".search_keyword_goshbutton").unbind();
	$(".search_keyword_goshword").unbind();
    // $(".Lucifer_pride_chart").css("display","none");
	d3.selectAll("#Mammon_sorting_block svg").remove();
	d3.selectAll(".M_tooltip").remove();

    $('#gosh_chart_and_waiting_circle').css('margin-left','0%').show();

	var query_data = gen_query_post();

	var user_choose_perspective = $("#for_perspective_choice input:checked").map(function(){
				return $(this).parents('li').attr("class").split(' ')[0].split("_")[0] + "_semantic_score";
		}).get().filter(function(p_n){ return p_n != "multiselect-item_semantic_score"});

	// check condition
	if(query_data.brands_what_I_want.length <2 ){
		$("#gosh_chart_and_waiting_circle").html("請至少選兩種品牌~");
		return;
	} else if (query_data.brands_what_I_want.length >10){
        $("#gosh_chart_and_waiting_circle").html("品牌最多選十種喔~");
		return;
    } else if (user_choose_perspective.length < 3){
		$("#gosh_chart_and_waiting_circle").html("維度設定請至少選三~");
		return;
	}


	$('#gosh_chart_and_waiting_circle').html("<img src='issue_guy/img/ring.svg'/>");
	$('#gosh_chart_and_waiting_circle').css('margin-left','40%');

    // Main control.
	wanna_get_es_dataQQ();
	wanna_get_fptree_dataQQ();
	wanna_get_Lucifer_dataQQ();


	$(".search_keyword_goshbutton").click(function(){
		wanna_get_issue_data($(this));
	})

	$(".search_keyword_goshword").keydown(function(e){
		e.which == 13 && wanna_get_issue_data($(this).siblings());
	})

	var time_s = new Date();

	// Get ES data.
	function wanna_get_es_dataQQ(){
		// 作 industry filter;
		$.ajax({
			url : "/brands/es_give_me_dataQQ" ,
			data : query_data ,
			type : "POST" ,
			dataType : "json" ,
			success : function(aggs_data){
                console.log("Data coming : " +((new Date) - time_s)/1000);

			    // OK!!!
				Leviathan_chart( aggs_data );   // V
                Samael_chart( aggs_data );      // V
				Belphegor_chart( aggs_data );   // V
                Beelzebub_chart( aggs_data );   // V
				Asmodeus_chart( aggs_data );    // V
			} ,
			timeout : 30000 ,
			error : function(err){
                console.log(err);
				console.log("Time Out!!!!");
			} ,
			complete : function(){
                $(".evils_chart").css("display",'none');
				$(".topic_content").removeClass('you_got_this');
    			$(".Leviathan_envy_chart ").css("display","block");
    			$(".topic_content[show_Chart_QQ='Leviathan_envy_chart']").addClass('you_got_this');
				console.log(((new Date) - time_s)/1000);
				$('#gosh_chart_and_waiting_circle').hide();
				$(".search_keyword_goshword").val("");
			}
		})

	}

	// Get FP tree data.
	function wanna_get_fptree_dataQQ(){
		$.ajax({
			url : "/brands/give_me_fptree_data" ,
			data : query_data ,
			type : "POST" ,
			dataType : "json" ,
			success : function(data){
				Mammon_chart(data);
			} ,
			timeout : 300000 ,
			error : function(err){
				console.log("Time Out!!!!");
			} ,
			complete : function(){
				console.log( "FP tree time : " + ((new Date) - time_s)/1000);
			}
		})
	}

    // Get Lucifer chart data.
    function wanna_get_Lucifer_dataQQ(){
        $.ajax({
			url : "/brands/give_me_Lucifer_data" ,
			data : query_data ,
			type : "POST" ,
			dataType : "json" ,
			success : function(data){
                // $(".Lucifer_pride_chart").css("display","block");
				Lucifer_chart(data);
			} ,
			timeout : 300000 ,
			error : function(err){
				console.log("Time Out!!!!");
			} ,
			complete : function(){
				console.log( "PMI data time : " + ((new Date) - time_s)/1000);
			}
		})
    }

    // Get issue data.
	function wanna_get_issue_data($ele){
		var evil_name = $ele.parent().parent().attr("class").split(" ")[0];

		// Add waiting circle.
		$("." + evil_name).append("<div id='I_am_evil_waiting_circle_QQ'><img src='issue_guy/img/ring.svg' style='margin-left:420px;margin-top:100px;'></div>");
		$("#I_am_evil_waiting_circle_QQ").css({
			"width" : "100%",
			"height" : "100%",
			"background-color" : "#000",
			"opacity" : "0.6",
			"position" : "relative",
			"top" : "-" + ( evil_name == "Samael_wrath_chart" ? $("." + evil_name).height() : $("." + evil_name).height() +40) + "px" ,
			"z-index" : 10
		})

		var query_2nd_data = gen_query_post();
		delete query_2nd_data["pers_list"];
		query_2nd_data["pers_list[]"] = "electric_semantic_score"; // 弄個假的給它算
		query_2nd_data["issue_guy"] = $ele.siblings().val();

		$.ajax({
			url : "/brands/es_give_me_dataQQ" ,
			data : query_2nd_data ,
			type : "POST" ,
			dataType : "json" ,
			success : function(data){
				if (evil_name == "Samael_wrath_chart"){
					Samael_chart( data );
				} else {
					Belphegor_chart(data);
				}
			} ,
			timeout : 30000 ,
			error : function(err){} ,
			complete : function(){
				$("#I_am_evil_waiting_circle_QQ").remove();
			}
		})

	}
}

function ajax_article_list(query_data){

	// Samael : 限定某一天的文章 V
	// Belphegor : 該品牌 top 30 的文章 V，利用 scroll + from & size 達到分頁效果
	// Mammon : 該字詞 + 該品牌的文章列表　(精準為第一優先)
	return $.ajax({
		url : "/brands/give_me_articleList_data" ,
		data : query_data ,
		type : "POST" ,
		dataType : "json" ,
		timeout : 5000 ,
	})
}



function gen_channel_list(raw_data) {

	// gen website choose block.
	// field - website - category
	var doc_count_data = raw_data["field_count"]["buckets"].map(function(field_ele){

		var content = '' ;
		var	w_number = 1 ;

		var field_n = field_ele["key"] ,
			all_f_doc_c = field_ele["doc_count"];

			field_ele["website_count"]["buckets"].map(function(web_ele){
				var web_n = web_ele["key"] ,
					all_w_doc_n = web_ele["doc_count"],
					c_number = 1;

					if (["news","blog"].indexOf(field_n) > -1){
						content += '<option value="'+w_number+'" class = "'+web_n+'">'+mapping_dict.en_2_zh_dict[web_n] +' <span class="countnum">[' + all_w_doc_n + ']</span></option>'	;
					} else {
						content += '<optgroup label="'+ mapping_dict.en_2_zh_dict[web_n] +" [" + all_w_doc_n + "]" +'" class="group-'+ w_number +'">';

							web_ele["category_count"]["buckets"].map(function(cat_ele){
								var cat_n = cat_ele["key"] == "NoCategory" ? mapping_dict.en_2_zh_dict[web_n] : cat_ele["key"],
								all_c_doc_n = cat_ele["doc_count"];
								content += '<option value="'+w_number+'-' + c_number + '" class="'+web_n+"_"+cat_n+'">'+cat_n+' <span class="countnum">[' + all_c_doc_n + ']</span></option>';
								c_number++;
							})

						content += '</optgroup>' ;
					}
					w_number++ ;
				})

        $("#for_channel_choice").append(
                '<div class="btn-group">'+
                '<select id="'+field_n+'-nonSelectedText" multiple="multiple" style="display: none;" ></select>'+
                '</div>');

		$("select#"+ field_n +"-nonSelectedText").html(content)
												 .multiselect({
													 selectAllText : mapping_dict.en_2_zh_dict[field_n] + "全選",
													 nonSelectedText :  mapping_dict.en_2_zh_dict[field_n] + '[' + 0 + '] ',
													 nSelectedText :   mapping_dict.en_2_zh_dict[field_n] + '[' + all_f_doc_c + '] ', // 修正這個
													 allSelectedText :  mapping_dict.en_2_zh_dict[field_n] + '[' + all_f_doc_c + '] ' ,
													 enableClickableOptGroups : true ,
													 enableCollapsibleOptGroups : true,
                                                     includeSelectAllOption: true,
                                                     selectAllJustVisible: false,
                                                     selectAllValue: field_n + "_fieldall"
												 });

	});

    // Initially choosed all fields & websites
    // And hidden the dropmenu sub-elements.

    $('#social_media-nonSelectedText,#forum-nonSelectedText').multiselect('selectAll', false)
        .multiselect('updateButtonText');

    $(".multiselect-container li.active:not(:first-child)").addClass("multiselect-collapsible-hidden").css("display", "none");

    $('#news-nonSelectedText,#blog-nonSelectedText').multiselect('selectAll', false)
        .multiselect('updateButtonText');
	$('#selectAll-all').parent().addClass("isopen");


	// select all event.
	$('#selectAll-all').on('click', function() {
        var open = ($('#selectAll-all').parent().attr("class"));
        if (open == "btn-group") {
            $('#social_media-nonSelectedText,#forum-nonSelectedText,\
                        #news-nonSelectedText,#blog-nonSelectedText').multiselect('selectAll', false).multiselect('updateButtonText');
            $('#selectAll-all').parent().addClass("isopen");
            $(this).text('取消全選');
        } else {
            $('#social_media-nonSelectedText,#forum-nonSelectedText,\
                                #news-nonSelectedText,#blog-nonSelectedText').multiselect('deselectAll', false).multiselect('updateButtonText');
            $('#selectAll-all').parent().removeClass("isopen");
            $(this).text('陣地全選');
        }
    });

}


function control_brand_block() {

    // Main Control block.
	make_brand_list();
    move_choice_block();

	// gen brand list
	function make_brand_list(){

        var industry = FH ;
		var brandname = "" ;

		for (var b in industry) {
			brandname += '<li class="field_choice_button" id="' + b + '">' + industry[b]["zh_name"];
		};

		$("#brand").append(brandname);

		for(var b in industry){
			$("#b_list").append("<div id ='"+ b +"_block' >" +
                                    "<span id='b_list_close'><img src='brands_girl/img/close.svg'></span>"+
									"<h3 class= 'b_list_title'>" + industry[b]["zh_name"] + "</h3>" +
									"<ul class= 'b_list_content'></ul>" +
								"</div>");

			Object.keys(industry[b]["brands"]).map(function(b_name){
				$("#" + b + "_block .b_list_content").append('<li id="'+b_name+'">' + (industry[b]["brands"][b_name].split(" ")[0]) + '</li>');
			})

			$("#" + b + "_block .b_list_content").prepend('<li id="selectall">全選</li>');
			$("#" + b + "_block").css("display","none");
		}

		$(".b_list_content li").click(function() {
            if ($(this).attr('class') != "selected") {
                $(this).addClass("selected");
            } else {
                $(this).removeClass("selected");
            };
        });

        $("li#selectall").click(function() {
            var selectall = $(this).attr('class');
            if (selectall == "selected") {
                $(this).addClass("selected")
					   .siblings().addClass("selected");
                $(this).text("清除");
            } else {
                $(this).removeClass("selected")
					   .siblings().removeClass("selected");
                $(this).text("全選");
            };
        });

		$("#brand li").click(function(){
			$("#" + $(this).attr("id") + "_block").css("display","block").siblings().not("span")
												  .css("display","none");
		})
	}

	// move func.
	function move_choice_block() {

        $('li.field_choice_button').click(function() {
            $('#bg').css({
                'display': 'block',
                'z-index': '1030',
            });
        });
        $('span#b_list_close,#bg').click(function() {
            $('#bg').css({
                'display': 'none',
                'z-index': '0',
            });
            $("#b_list").animate({
                left: '-' + w + 'px'

            }, 300, 'swing');
        });


        // brand choices.
        var w = $("#b_list").width();

        $("#brand li").click(function() {

            if (parseInt($("#b_list").css('left')) < 0) {
                $("#b_list").animate({
                    left: '0px'
                // }, 1000, 'swing', go_back_b_list);
                }, 500, 'swing');
            }
        });

	}

    function make_facet_list(user_field){

        // Check perspective block exist or not.
        if($("."+user_field+"_pers").length >0 ){return;};
        var facet_obj = FH[user_field];

        perspective_content = '';
        count = 1;
        $("#for_perspective_choice").html("").append(
                    '<h4>維度設定</h4>'+
                    '<div class="btn-group '+user_field+'_pers">'+
                        '<select id="sixdimensions-nonSelectedText" multiple="multiple" style="display: none;">'+
                        '</select>'+
                    '</div>')
        Object.keys(facet_obj["facets"]).map(function(f){
            perspective_content += '<option value="'+count+'" class = "'+f+'">'+facet_obj["facets"][f]+'</option>';
            count++;
        });

        $("select#sixdimensions-nonSelectedText").html(perspective_content);

        $('#sixdimensions-nonSelectedText').multiselect({
            dropUp: true,
            buttonText: function(options, select) {
                return '維度構面';
            },
            selectAllText: '維度全選'
        });

        facet_obj = null , perspective_content = null;
    }

    $(".field_choice_button").click(function(){
        make_facet_list($(this).attr("id"));
        $(".field_choice_button").removeClass("field_choice_u_want_this");
        $(this).addClass("field_choice_u_want_this");
    });

};

function control_chart_showQQ(){
	// to limit scroll scope.
	$(document).scrollScope();

	// Switch Charts show or hide .
	$('.topic_content').click(function(){
		$('.topic_content').removeClass('you_got_this');
		$(this).addClass('you_got_this');
		$(".evils_chart").css("display","none");
		$("." + $(this).attr("show_Chart_QQ")).css("display","block");
		$(window).scrollTop(0);
	});

}

function Time_picker(){

	$("#end_timeQQ input[name='end_time']").val(moment(new Date("2016-07-15")).format("YYYY年M月D日"));
	// $("#end_timeQQ input[name='end_time']").val();
	// $("#start_timeQQ input[name='start_time']").val(moment(new Date()).subtract(6,"months").format("YYYY年M月D日"));
	// $("#start_timeQQ input[name='start_time']").val(moment(new Date()).subtract(5,"years").format("YYYY年M月D日"));
	$("#start_timeQQ input[name='start_time']").val(moment(new Date("2015-09-01")).format("YYYY年M月D日"));

	$('#start_timeQQ').datetimepicker({
		format : 'LL' ,
		// minDate : new Date('2015-08-31')
	});

    $('#end_timeQQ').datetimepicker({
		format : 'LL',
		useCurrent: false
    });

	// Fix half year
    $("#start_timeQQ").on("dp.change", function (e) {
        $('#end_timeQQ').data("DateTimePicker").minDate(e.date);
        // $('#end_timeQQ').data("DateTimePicker").maxDate(moment(e.date["_d"]).add(6,"months").subtract(1,"days"));
    });

	$("#end_timeQQ").on("dp.change", function (e) {
		// $('#start_timeQQ').data("DateTimePicker").minDate(moment(e.date["_d"]).subtract(6,"months"));
		$('#start_timeQQ').data("DateTimePicker").maxDate(e.date);
	});
}


function echart_init_dom(){

    // resize 要重新檢視，好像重覆掛event了
	echarts.init(document.getElementById("Leviathan_straight_plot"));
	echarts.init(document.getElementById('Belphegor_Captain_American_plot'));
	echarts.init(document.getElementById("Beelzebub_radar_plot"));
	echarts.init(document.getElementById("Beelzebub_multi_bar_plot"));
    echarts.init(document.getElementById("Beelzebub_multi_bar_plot2"));

	var Samael_Chart = echarts.init(document.getElementById("Samael_line_plot"));
	var Belphegor_I_Chart = echarts.init(document.getElementById('Belphegor_Iron_Man_plot'));

    // $('.topic_content[show_chart_QQ="Leviathan_envy_chart"]').click(function(){
	// 		setTimeout(function(){ Samael_Chart.resize();},1);
	// });

	$('.topic_content[show_chart_QQ="Samael_wrath_chart"]').click(function(){
			setTimeout(function(){ Samael_Chart.resize();},1);
	});

	$('.topic_content[show_chart_QQ="Belphegor_sloth_chart"]').click(function(){
			setTimeout(function(){ Belphegor_I_Chart.resize();},1);
	});

	$(window).resize(function(){
		Samael_Chart.resize();
		Belphegor_I_Chart.resize();
	});

}
