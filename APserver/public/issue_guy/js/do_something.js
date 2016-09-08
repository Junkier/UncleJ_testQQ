$(function() {

    fullpage_control();
    Time_picker();

    // Initial Start Position.
    // work?
    $.fn.fullpage.moveTo(1);

    // get ES doc count.
    (function() {
        $.ajax({
            url: "/soap/give_me_doc_count",
            type: "GET",
            dataType: "json",
            timeout: 6000
        }).done(function(data) {
            List_All_and_gen_Gosh_chart(data["field_count"]);
            advanced_search(data["domain_counting"]);
        }).always(function(){
            Iam_Ajax_not_Francis();
        });
    })();

    // Get Global variables.
    color_theme = get_color_swatch();
    mapping_dict = new get_usage_dict();

    // Export Dashboard Chart Function KKK
    $("#exportDashbordChart_btn").on("click", function(){

        $(this).prop('disabled', true);
        $.fn.fullpage.destroy('all');
        exportChart();
        fullpage_control();

        setTimeout(function(){
            $("#exportDashbordChart_btn").prop('disabled', false);
        }, 2500);
    });

});


function Iam_Ajax_not_Francis() {

    // user click by mouse.
    $('#submitQQ,#ad_submitQQ').click(Search_baby);

    // user click by keyboard.
    $("#user_word_here,#user_word_here_advanced").keydown(function(event) {
        event.which == 13 && Search_baby();
    });

    // Auto search or not.
    if (parseInt($("#The_Judge").val())) {
        Search_baby();
    }

    // Auto search or not.
    if (parseInt($("#The_Judge").val())) {
        Search_baby();
        $.fn.fullpage.moveTo('page1');
    }
}

function Search_baby() {

    // document.onkeydown = function() {
    //     switch (event.keyCode) {
    //         case 116: //F5 button
    //             $.fn.fullpage.moveTo('page1');
    //
    //         case 82: //R button
    //             if (event.metaKey) {
    //                 $.fn.fullpage.moveTo('page1');
    //             }
    //     }
    // }
    // Check ad query block.
    if(/\&|\||-/g.test($("#user_word_here_advanced").val())){
        alert("進階搜尋請勿用特殊字元。");
        return;
    };

    // Check ez query block.
    if(/\&/g.test($("#user_word_here").val()) && /\|/g.test($("#user_word_here").val())){
        alert("AND 和 OR 查詢請擇一使用。");
        return;
    }


    // Gen Query post.
    var query_data = gen_query_post();

    // Check keyword & Website.
    if (query_data.keyword.length == 0) {
        alert("請輸入搜尋議題!!!");
        return;
    } else if (query_data.type_source.length == 0) {
        alert("請選擇關注網站!!!");
        return;
    }

    // Waiting Circle.
    $("body").append("<div class='bg'><img src='issue_guy/img/ring.svg' style='width:250px;position: relative;left: 45%;top: 23%;'/></div>");

    var time_s = new Date();

    // Run what you want.
    var wanna = new wanna_data();
    wanna.get_es_data();
    wanna.get_fptree_data();
    wanna.get_all_articles();    // O.K , 想想怎麼回到上一頁
    wanna.get_dashboard_data();

    // Export Raw Data Function KKK
    $("#exportRawData_btn").unbind().on("click", function(){
        wanna.get_dump_data();
    });

    function wanna_data(){
        return {
            get_es_data : function(){   // For ES data.
                go_ajax({
                    url : '/soap/give_me_chartQQ',
                    q_data : query_data,
                    time_limit : 60000
                }).done(function(aggs_data){
                    index_1and2_wordCloud(aggs_data["aggs_wordcount"]);
                    index_3_authorArticles(aggs_data)
                    index_4and5_fieldTransfer(aggs_data);
                    index_6and7_semanticComment(aggs_data);
                    index_8_volTracking(aggs_data);
                }).fail(function(err){
                    alert("連線失敗，請檢查網路");
                }).always(function(){
                    console.log("Query data time : " + ((new Date) - time_s) / 1000);
                })
            },
            get_fptree_data : function(){
                go_ajax({
                    url : '/soap/give_me_fptree',
                    q_data : query_data,
                    time_limit : 120000
                }).done(function(data){
                    index10_relationIssue(data);
                }).fail(function(){
                    console.log("ErrorQQ , 搜尋關鍵字的raw_data 太少哩~~~");
                    d3.selectAll('.Index10_Chart svg').selectAll('*').remove();
                    $('.Index10_Chart .vz-weighted_tree-viz').remove();
                    $('#viz_container10').html('此關鍵字無關聯詞，請重新搜尋。');
                }).always(function(){
                    console.log("FPtree time : " + ((new Date) - time_s) / 1000);
                });
            },
            get_dump_data : function(){
                var dump_query = {};
                Object.keys(query_data).map(q_key=>{ dump_query[q_key] = query_data[q_key] });
                dump_query["use_chart"] = "dump_data";
                dump_query["user_level"] = $("#Level_checkQQ").val();
                go_ajax({
                    url : '/soap/give_me_articles',
                    q_data : dump_query,
                    time_limit : 60000
                }).done(function(result){
                    $(this).prop('disabled', true);
                    if(result == ""){ return; }
                    exportRawData(result, true);
                    setTimeout(function(){
                        $("#exportRawData_btn").prop('disabled', false);
                    }, 1000);

                }).fail(function(err){
                    console.log("error!!!");
                    console.log(err.responseText);
                    alert("下載資料失敗，請稍後再試。");
                });
            },
            get_all_articles : function(){  // Scroll & Size 搞分頁跳轉!!
                query_data["use_chart"] = "chart0";
                go_ajax({
                    url : '/soap/give_me_articles',
                    q_data : query_data,
                    time_limit : 60000
                }).done(function(result){
                    index_0_allArticles(result);
                });
            },
            get_dashboard_data : function(){
                go_ajax({
                    url : '/soap/give_me_dashboard',
                    q_data : query_data,
                    time_limit : 90000
                }).done(function(data){
                    show_dashboard_chart_KK(data);
                }).fail(function(){
                    clear_all_chart();
                    alert("一個月內無資料，請重新搜尋");
                }).always(function(){
                    $(".bg").remove(); $(".advanced_bg").hide();
                    $("#user_word_here_advanced").val(query_data["keyword"]);
                    console.log("Dashboard data time : " + ((new Date()) - time_s) / 1000);
                });
            },
        }
    }
}

function go_ajax(query_obj){
    return $.ajax({
        url: query_obj.url,
        data: query_obj.q_data,
        type: "POST",
        dataType: "json",
        timeout: query_obj.time_limit,
    });
}

function Time_picker() {

    // Catch current time.
    $("#end_timeQQ input[name='end_time']").val(moment(new Date("2016-07-21")).format("YYYY年M月D日"));
    $("#start_timeQQ input[name='start_time']").val(moment(new Date()).subtract(6, "months").format("YYYY年M月D日"));

    $('#start_timeQQ').datetimepicker({
        format: 'LL', // time Format based on what u want.
        // minDate : new Date('2015-08-31')
    });

    $('#end_timeQQ').datetimepicker({
        format: 'LL',
        useCurrent: false //Important! See issue #1075
    });

    $("#start_timeQQ").on("dp.change", function(e) {
        $('#end_timeQQ').data("DateTimePicker").minDate(e.date);
        // $('#end_timeQQ').data("DateTimePicker").maxDate(moment(e.date["_d"]).add(6,"months").subtract(1,"days"));
    });
    $("#end_timeQQ").on("dp.change", function(e) {
        // $('#start_timeQQ').data("DateTimePicker").minDate(moment(e.date["_d"]).subtract(6,"months"));
        $('#start_timeQQ').data("DateTimePicker").maxDate(e.date);
    });


}


function List_All_and_gen_Gosh_chart(raw_data) {

    // prepare data.
    var mapping_dict = new get_usage_dict();
    var websites = {},bad_c_data = [];
    var text_style = {
        "textStyle": {
            "fontSize": '18'
        }
    };

    var label_size = { "normal": text_style, "emphasis": text_style };

    // gen website choose block.
    // field - website - category
    var doc_count_data = raw_data["buckets"].map(function(field_ele) {

        var content = '';
        var w_number = 1;

        var field_n = field_ele["key"],
            all_f_doc_c = field_ele["doc_count"];

        field_ele["website_count"]["buckets"].map(function(web_ele) {
            var web_n = web_ele["key"],
                all_w_doc_n = web_ele["doc_count"],
                c_number = 1;
            websites[mapping_dict.en_2_zh_dict[web_n]] = true;
            bad_c_data.push({
                value: all_w_doc_n,
                name: mapping_dict.en_2_zh_dict[web_n],
                label: label_size
            });

            if (["news", "blog"].indexOf(field_n) > -1) {
                content += '<option value="' + w_number + '" class = "' + web_n + '">' + mapping_dict.en_2_zh_dict[web_n] + ' <span class="countnum">[' + all_w_doc_n + ']</span></option>';
            } else {
                content += '<optgroup label="' + mapping_dict.en_2_zh_dict[web_n] + " [" + all_w_doc_n + "]" + '" class="group-' + w_number + '">';

                web_ele["category_count"]["buckets"].map(function(cat_ele) {
                    var cat_n = cat_ele["key"] == "NoCategory" ? mapping_dict.en_2_zh_dict[web_n] : cat_ele["key"],
                        all_c_doc_n = cat_ele["doc_count"];
                    content += '<option value="' + w_number + '-' + c_number + '" class="' + web_n + "_" + cat_n + '">' + cat_n + ' <span class="countnum">[' + all_c_doc_n + ']</span></option>';
                    c_number++;
                })

                content += '</optgroup>';
            }
            w_number++;

        })

        $("#navbarQQ").append('<div class="btn-group">' +
            '<select id="' + field_n + '-nonSelectedText" multiple="multiple" style="display: none;" >' +
            '</select>' +
            '</div>');

        $("select#" + field_n + "-nonSelectedText").html(content)
            .multiselect({
                selectAllText: mapping_dict.en_2_zh_dict[field_n] + "全選",
                nonSelectedText: mapping_dict.en_2_zh_dict[field_n] + '[' + 0 + '] ',
                nSelectedText: mapping_dict.en_2_zh_dict[field_n] + '[' + all_f_doc_c + '] ', // 修正這個
                allSelectedText: mapping_dict.en_2_zh_dict[field_n] + '[' + all_f_doc_c + '] ',
                enableClickableOptGroups: true,
                enableCollapsibleOptGroups: true,
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
    // $('#selectAll-all').parent().addClass("isopen");

    $("#navbarQQ").append('<div class="btn-group">' +
        '<button type="button" class="btn btn-default" id="gen_source_pie"><span>資料總覽</span>' +
        '</button>' +
        '</div>');

    $("#gen_source_pie").click(function() {
        gen_data_source_pie();
    })

    $('#selectAll-all').on('click', function() {
        var open = ($('#selectAll-all').parent().attr("class"));
        if (open == "btn-group") {
            $('#social_media-nonSelectedText,#forum-nonSelectedText,\
               #news-nonSelectedText,#blog-nonSelectedText').multiselect('selectAll', false)
                .multiselect('updateButtonText');
            $('#selectAll-all').parent().addClass("isopen");
            $(this).text('取消全選');
            // for (var name in bad_option["legend"]["selected"]) {
            //     bad_option["legend"]["selected"][name] = true;
            // }
        } else {
            $('#social_media-nonSelectedText,#forum-nonSelectedText,\
               #news-nonSelectedText,#blog-nonSelectedText').multiselect('deselectAll', false)
                .multiselect('updateButtonText');
            $('#selectAll-all').parent().removeClass("isopen");
            $(this).text('全選');
            // for (var name in bad_option["legend"]["selected"]) {
            //     bad_option["legend"]["selected"][name] = false;
            // }
        }

        // BadChart.setOption(bad_option);
    });


    function gen_data_source_pie() {
        $("body").append("<div class='bg' style='opacity:1;background-color:rgba(0,0,0,0.3)'>" +
            "<div id = 'gosh_chart_and_waiting_circle' ></div>" +
            "<span class='close_bg_gosh_chart' ><img src='issue_guy/img/close.svg'></span>" +
            "</div>");

        var BadChart = echarts.init(document.getElementById("gosh_chart_and_waiting_circle"));

        var bad_option = {
            color: color_theme,
            title: {
                text: '輿論來源',
                x: 'center',
                y: "25px",
                // padding: [50, 0, 0, 0],
                textStyle: {
                    fontSize: '30',
                    fontWeight: 500,
                    fontFamily: "NotoSansCJKtc-Medium"
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: function(param) {
                    return param["name"]+"<br>" + "文章數 : " + numeral(param["data"]["value"]).format("0,0") + " (" + param["percent"].toFixed(1) + "%)";
                }
            },
            legend: {
                orient: 'horizontal',
                textStyle: {
                    fontSize: '16',
                    fontFamily: "NotoSansCJKtc-Medium"
                },
                // selectedMode: false ,
                selected: websites,
                bottom: "25px",
                data: Object.keys(websites)
            },
            series: [{
                name: '資料來源',
                type: 'pie',
                radius: '50%',
                center: ['50%', '55%'],
                data: bad_c_data,
                label: {
                    normal: {
                        textStyle: {
                            fontFamily: "NotoSansCJKtc-Medium"
                        }
                    }
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };

        BadChart.setOption(bad_option);
        $(".close_bg_gosh_chart> img").click(function() {
            $(this).unbind();
            $(".bg").remove();
        })
        $(window).resize(function(){ BadChart.resize()});
    }
}

function advanced_search(domain_d) {

    // Add AND / OR element.
    $("button.add_and_or").click(function() {
        var logic_word = $('input[name="and_or_switch"]').bootstrapSwitch('state') ? "and" : "or";
        $(".and_or_region").append(gen_query_element(logic_word));
        $(".and_or_query button:last").click(delete_query_block);
        $(".and_or_query input:last").focus();
    })

    // Add NOT element.
    $("button.add_not").click(function() {
        $(".not_region").append(gen_query_element("not"));
        $(".not_query button:last").click(delete_query_block);
        $(".not_query input:last").focus();
    })

    // Add Event : delete query block.(In something_helper.)
    $(".query_block button").click(delete_query_block);

    // Reset All config. (In something_helper.)
    $(".advanced_search_setting button.clear_all").click(query_block_reset);

    // Synchronizing with normal query.
    // $('#user_word_here').keyup(function() {
    //     $("#user_word_here_advanced").val($(this).val());
    // });
    $('#user_word_here_advanced').keyup(function(event) {
        event.which != 13 && $("#user_word_here").val($(this).val());
    });

    // Build AND / OR switch.
    $("input[name='and_or_switch']").bootstrapSwitch({
        onText: "AND",
        offText: "OR",
        onColor: "success",
        offColor: "warning",
    });

    // Switch AND / OR.
    $('input[name="and_or_switch"]').on('switchChange.bootstrapSwitch', function(event, state) {
        var logic = state ? "and" : "or";
        $(".and_or_query input").attr("placeholder","搜尋關鍵字"+logic.toUpperCase()+"...")
                                .attr("name",logic);
    });

    // Choose domain by ES domain tag
    domain_d["buckets"].map(domain_ele => {
        $(".advanced_choose_field div").append("<input type='checkbox' name='domainQQ' value='"+domain_ele["key"]+"' checked>" + domain_ele["key"]+" ");
    })

    // Choose all domain.
    $(".advanced_choose_field button").click(function(){
        if($(this).hasClass("u_choose_all_domain")){
            $(this).removeClass("u_choose_all_domain");$(this).text("全選");
            $(".advanced_choose_field input[name='domainQQ']").prop("checked",false);
        }
        else {
            $(this).addClass("u_choose_all_domain");$(this).text("取消全選");
            $(".advanced_choose_field input[name='domainQQ']").prop("checked",true);
        }
    })

    // Show & Hide bg.
    $("#advanced_coming").click(function() {
        $(".advanced_bg").show();
    })

    // close 改成 close_advanced 小心QQ
    $(".advanced_bg .close_advanced> img").click(function() {
        $(".advanced_bg").hide();
    });

    // click Esc can leave advanced_search bg. (for DeVops.)
    $(document).keyup(function(e) {
        e.which == 27 && $(".advanced_bg").hide();
    })
}

// 之後重構!!!

// Download Dashboard Chart
function exportChart(){
    var targetDOM = $("#dashboard_area_leoKK");

    html2canvas(targetDOM, {
        background : "rgb(238,238,238)",
        height: 1300,
        onrendered : function(canvas){
            var imgData = canvas.toDataURL("image/png");
            var newData = imgData.replace(/^data:image\/png/, "data:application/octet-strem");
            var chart_link = document.createElement("a");
            chart_link.href = newData;
            chart_link.download = "eyeSocial_dashboard.png";

            document.body.appendChild(chart_link);
            chart_link.click();
            document.body.removeChild(chart_link);
        }
    });
}


// Download Dashboard Chart
function exportRawData(JSONData, ShowLabel){
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    var CSV = '';
    var colume_name;

    if (ShowLabel) {
        var row = "";
        Object.keys(arrData[0]).map(function(col){
            row += col + ",";
        });
        row = row.slice(0, -1);
        CSV += row + '\n';
        colume_name = Object.keys(arrData[0]);
    }


    arrData.map(function(ele,index){
        var row = "";
        colume_name.map(function(colName){
            var cell_data = String(ele[colName])
                            // .replace(/[+/?%#&]/g,"")
                            .replace(/,/g, '，')
                            .replace(/["']/g,'')
                            // .replace("↵","")
                            .replace(/(?:\\[rn]|[\r\n]+)+/g, "");
                row += '"' + cell_data + '",';
        })
        CSV += row + '\n';
    });

    if (CSV == '') {
        alert("Invalid data");
        return;
    }

    var uri = 'data:text/csv;charset=UTF-8,' + encodeURIComponent(CSV);
    download(uri, "download_data.csv", "text/csv");

}
