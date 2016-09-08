function get_usage_dict() {

    var en_2_zh_dict = {
        "social_media": "社群",
        "forum": "論壇",
        "blog": "部落格",
        "news": "新聞",
        "Appledaily": "蘋果日報",
        "Ck101": "卡提諾論壇",
        "Dcard": "Dcard",
        "Ettoday": '東森新聞雲',
        "Eyny": "伊莉討論區",
        "Facebook": 'FACEBOOK',
        "Pixnet": '痞客幫',
        "Ptt": "PTT",
        "Setn": '三立新聞網',
        "Mobile01": "Mobile01",
        "Xuite": "隨意窩",
        "Total": "總和",
        "--": "--"
    };

    var zh_2_en_dict = {
        "社群": "social_media",
        "論壇": "forum",
        "部落格": "blog",
        "新聞": "news",
        "蘋果日報": "Appledaily",
        "卡提諾論壇": "Ck101",
        "Dcard": "Dcard",
        '東森新聞雲': "Ettoday",
        "伊莉討論區": "Eyny",
        'FACEBOOK': "Facebook",
        '痞客幫': "Pixnet",
        "PTT": "Ptt",
        '三立新聞網': "Setn",
        "Mobile01": "Mobile01",
        "隨意窩": "Xuite",
        "總和": "Total"
    };

    var sources_dict = {
        "社群": ["FACEBOOK"],
        "論壇": ["PTT", "Mobile01", "伊莉討論區", "Dcard", "卡提諾論壇"],
        "部落格": ["痞客幫", "隨意窩"],
        "新聞": ["蘋果日報", "東森新聞雲", "三立新聞網"]
    }

    this.sources_dict = sources_dict;
    this.en_2_zh_dict = en_2_zh_dict;
    this.zh_2_en_dict = zh_2_en_dict;

}


function gen_query_post() {

    // Basically Search.
    var input_time_format = "YYYY年MM月DD日",
        output_time_format = "YYYY-MM-DD";
    var user_choose_field = $("#navbarQQ input:checked").parents().siblings('select').map(function() {
        return $(this).attr('id').split("-")[0];
    }).get();
    var user_keyword = $("#navbarQQ input[name='keyword']").val().toLowerCase();
    var user_start_time = moment($("#navbarQQ input[name='start_time']").val(), input_time_format).format(output_time_format);
    var user_end_time = moment($("#navbarQQ input[name='end_time']").val(), input_time_format).format(output_time_format);

    // 網站版
    ////////////////////////////////////////////////////////////////////////////////////////////
    var user_choose_website = $("#navbarQQ input:checked").map(function() {
        return $(this).parents('li').attr("class").split(' ')[0].split("_")[0];
    }).get();

    user_choose_website = Array.from(new Set(user_choose_website)).filter(function(w_t) {
        return w_t != "multiselect-item" && w_t != "hidden";
    });
    ////////////////////////////////////////////////////////////////////////////////////////////

    // 判斷是否有進階搜尋，null , ad , ez 且 ad > ez.
    var ad_search_judge = ($(".advanced_bg").css("display") == "block" && "ad") || // ad -> ez
        (/\&|\||-/g.test(user_keyword) && "ez") || null; // ez -> ad

    ad_search_judge == "ez" && query_syntax_ez_2_ad();
    var ad_query = gen_ad_query_detail();
    ad_search_judge == "ad" && query_syntax_ad_2_ez();

    return {
        keyword: user_keyword,
        start_time: user_start_time,
        end_time: user_end_time,
        index_source: user_choose_field,
        type_source: user_choose_website,
        advanced_query: ad_query // 可做 user level 管理
    }


    function query_syntax_ez_2_ad() {

        $(".query_block").remove();
        var and_or_word = $("#navbarQQ input[name='keyword']").val().toLowerCase();

        // NOT .
        if (/-/g.test(user_keyword)) {
            var not_ele = user_keyword.split("-");
            and_or_word = not_ele.shift();
            not_ele.map(ele => {
                $(".not_region").append(gen_query_element("not",ele));
                $(".not_query button:last").click(delete_query_block);
            })
        };

        // AND / OR .
        var logic = /\&/g.test(and_or_word) ? "&" : "|";
        var logic_word = logic == "&" ? "and" : "or";

        and_or_word.split(logic).map((ele,index) => {
            if(index == 0 ){ user_keyword=ele; }
            else{
                $(".and_or_region").append(gen_query_element(logic_word,ele));
                $(".and_or_query button:last").click(delete_query_block);
            };
        })
    }

    function query_syntax_ad_2_ez() {
        user_keyword = $("#user_word_here_advanced").val();
        var query_syntax = $("#user_word_here_advanced").val();
        ["and", "or", "not"].map(logic => {
            ad_query[logic] && ad_query[logic].length > 0 && function() {
                var logic_sign = logic == "and" ? "&" : (logic == "or" ? "|" : "-");
                ad_query[logic].map(l_word => {
                    query_syntax += (logic_sign + l_word);
                })
            }();
        });
        $("#user_word_here").val(query_syntax);
    }

    function gen_ad_query_detail() {
        var ad_out = {};
        ad_out["domain"] = $(".advanced_choose_field input[name='domainQQ']:checked").map(function() {
            return $(this).val()
        }).get();
        if (ad_search_judge) {
            ad_out["and"] = $(".and_or_query input[name='and']").map(function() {
                return $(this).val().toLowerCase()
            }).get().filter(ele => ele.length > 0);
            ad_out["or"] = $(".and_or_query input[name='or']").map(function() {
                return $(this).val().toLowerCase()
            }).get().filter(ele => ele.length > 0);
            ad_out["not"] = $(".not_query input[name='not']").map(function() {
                return $(this).val().toLowerCase()
            }).get().filter(ele => ele.length > 0);
        } else {
            query_block_reset();
        }
        return ad_out;
    }


}

//////////////////////  Advanced Search //////////////////////
function query_block_reset(){
    $('input[name="and_or_switch"]').bootstrapSwitch('state' , true);
    $(".query_block").remove();
    $(".and_or_region").append(gen_query_element("and"));
    $(".not_region").append(gen_query_element("not"));
    $(".query_block button").click(delete_query_block);
}

function gen_query_element(l_w , text){
    return "<div class='query_block "+ ( l_w=="not" ? "not_query":"and_or_query" ) + " input-group'>" +
                "<input type='text' class='form-control' name='"+l_w+"' value='"+(text||"")+"' placeholder='搜尋關鍵字"+l_w.toUpperCase()+"...'>" +
                "<span class='input-group-btn'>" +
                    "<button type='button' class='btn btn-default'><i class='glyphicon glyphicon-remove'></i></button>" +
                "</span>" +
           "</div>"
};

function delete_query_block() {
    $(this).parents(".query_block").remove();
};
//////////////////////  Advanced Search //////////////////////

function fullpage_control() {
    $('#fullpage').fullpage({
        //Navigation
        menu: '#menu',
        lockAnchors: false,
        anchors: ['page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7', 'page8'],
        navigationPosition: 'right',
        navigationTooltips: ['預設畫面', '儀表板總覽', '文章總覽', '熱門文章', '陣地轉移', '正負評論', '聲量追蹤', '關聯議題'],
        showActiveTooltip: true,
        navigation: false,
        slidesNavigation: true,
        slidesNavPosition: 'bottom',
        bigSectionsDestination: 'top', // 回到畫面最上方
        //Scrolling
        css3: true,
        scrollingSpeed: 700,
        autoScrolling: true,
        fitToSection: true,
        fitToSectionDelay: 1000,
        scrollBar: false,
        easing: 'easeInOutCubic',
        easingcss3: 'ease',
        // normalScrollElements: '#Initial_search_analysis_all_articles,#Apple_Leaf,.castle_in_the_sky,div#chart_8_I_dont_know_why_always_table,.AuthorTop10,.Post_list',
        scrollOverflow: true,

        //Design
        controlArrows: true,
        verticalCentered: true,
        sectionsColor: ['#eee', '#fff'],
        paddingTop: '0px',
        paddingBottom: '0px',
        fixedElements: '#header, .footer',
        responsiveWidth: 0,
        responsiveHeight: 0,
    });

    $.fn.fullpage.setAllowScrolling(false);
}

function get_color_swatch() {

    var color_theme_list = {
        basic: ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
        dark: ['#dd6b66', '#759aa0', '#e69d87', '#8dc1a9', '#ea7e53', '#eedd78', '#73a373', '#73b9bc', '#7289ab', '#91ca8c', '#f49f42'],
        infographic: ['#C1232B', '#27727B', '#FCCE10', '#E87C25', '#B5C334', '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD'],
        macarons: ['#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80', '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa'],
        macarons2: ['#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050', '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'],
        vintage: ['#d87c7c', '#919e8b', '#d7ab82', '#6e7074', '#61a0a8', '#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'],
        shine: ['#c12e34', '#e6b600', '#0098d9', '#2b821d', '#005eaa', '#339ca8', '#cda819', '#32a487', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'],
        roma: ['#E01F54', '#001852', '#f5e8c8', '#b8d2c7', '#c6b38e', '#a4d8c2', '#f3d999', '#d3758f', '#dcc392', '#2e4783'],
        roma2: ['#82b6e9', '#ff6347', '#a092f1', '#0a915d', '#eaf889', '#6699FF', '#ff6666', '#3cb371', '#d5b158', '#38b6b6'],
        basic: ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
    };
    var theme = Object.keys(color_theme_list)[getRandomInt(0, 8)]
    return color_theme_list[theme]

    function getRandomInt(minM, maxM) {
        return Math.round(Math.random() * (maxM - minM)) + minM;
    };
}
