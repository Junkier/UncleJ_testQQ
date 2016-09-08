function get_usage_dict() {

    var sources_dict = {
        "社群": ["FACEBOOK"],
        "論壇": ["PTT", "Mobile01", "伊莉討論區", "Dcard", "卡提諾論壇"],
        "部落格": ["痞客幫", "隨意窩"],
        "新聞": ["蘋果日報", "東森新聞雲", "三立新聞網"]
    }

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
        "total_vol_count": "總和",
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


    this.sources_dict = sources_dict;
    this.en_2_zh_dict = en_2_zh_dict;
    this.zh_2_en_dict = zh_2_en_dict;

}

function fields_house() {

    // By industry tag

    function get_field_obj(en_name, zh_name, brands, facets) {
        this.en_name = en_name;
        this.zh_name = zh_name;
        this.brands = brands;
        this.facets = facets;
    }


    var telecom = new get_field_obj("telecom", "電信", {
            telecom_中華電信: "中華電信 中華電 中華 種花",
            telecom_台灣大哥大: "台灣大哥大 台灣大 台哥大 台哥",
            telecom_遠傳電信: "遠傳電信 遠傳",
            telecom_亞太電信: "亞太電信 亞太",
            telecom_台灣之星: "台灣之星 臺灣之星",
        },
        // {
        //     中華電信_telecom : "中華電信 中華電 中華 種花",
        //     台灣大哥大_telecom : "台灣大哥大 台灣大 台哥大 台哥",
        //     遠傳電信_telecom : "遠傳電信 遠傳",
        //     亞太電信_telecom : "亞太電信 亞太" ,
        //     台灣之星_telecom: "台灣之星 臺灣之星",
        // },
        {
            tariff_semantic_score: '資費方案',
            network_semantic_score: '網路通訊',
            mobile_semantic_score: '手機配件',
            cuservice_semantic_score: '客戶服務',
            addservice_semantic_score: '加值服務',
            internal_semantic_score: '企業形象',
        });

    var drama = new get_field_obj("drama", "台劇", {
            drama_滾石20個愛情故事: "滾石20個愛情故事 滾石愛情故事 滾石20",
            drama_1989一念間: "1989一念間 一念間 1989",
            drama_遺憾拼圖: "遺憾拼圖",
            drama_紫色大稻埕: "紫色大稻埕 大稻埕",
            drama_我和我的十七歲: "我和我的十七歲 我的十七歲",
            drama_聶小倩: "聶小倩",
            drama_後菜鳥的燦爛時代: "後菜鳥的燦爛時代 後菜鳥 燦爛時代",
            drama_阿不拉的三個女人: "阿不拉的三個女人 阿不拉",
            drama_大人情歌: "大人情歌",
            drama_原來1家人: "原來1家人 1家人",
            drama_甘味人生: "甘味人生",
            drama_一把青: "一把青"
        },
        // {
        //     drama_滾石20個愛情故事:"滾石20個愛情故事 滾石愛情故事 滾石20",
        //     a1989一念間_drama:"1989一念間 一念間 1989",
        //     遺憾拼圖_drama:"遺憾拼圖",
        //     紫色大稻埕_drama:"紫色大稻埕 大稻埕",
        //     我和我的十七歲_drama:"我和我的十七歲 我的十七歲",
        //     聶小倩_drama:"聶小倩",
        //     後菜鳥的燦爛時代_drama:"後菜鳥的燦爛時代 後菜鳥 燦爛時代",
        //     阿不拉的三個女人_drama:"阿不拉的三個女人 阿不拉",
        //     大人情歌_drama:"大人情歌",
        //     原來1家人_drama:"原來1家人 1家人",
        //     甘味人生_drama:"甘味人生",
        //     一把青_drama:"一把青"
        // },
        {
            story_semantic_score: "啟發回味",
            enter_semantic_score: "娛樂效果",
            emotion_semantic_score: "深度情感",
            actor_semantic_score: "演員角色",
            suit_semantic_score: "服裝造型",
            director_semantic_score: "導演後製",
            times_semantic_score: "撥出時間",
            script_semantic_score: "腳本特色",
            music_semantic_score: "配樂效果"
        });

    var phone = new get_field_obj("phone", "手機", {
            phone_HTC: "HTC 宏達電",
            phone_SAMSUNG: "SAMSUNG 三星",
            phone_SONY: "SONY 索尼",
            phone_ASUS: "ASUS 華碩",
            phone_華為: "華為 HUAWEI 华为",
            phone_IPhone: "IPhone APPLE 蘋果",
            phone_小米: "小米 Xiaomi",
        },
        // {
        //     HTC_phone : "HTC 宏達電",
        //     SAMSUNG_phone : "SAMSUNG 三星",
        //     SONY_phone : "SONY 索尼",
        //     ASUS_phone : "ASUS 華碩" ,
        //     華為_phone : "華為 HUAWEI 华为",
        //     IPhone_phone : "IPhone APPLE 蘋果",
        //     小米_phone : "小米 Xiaomi",
        // },
        {
            design_semantic_score: '外觀設計',
            electric_semantic_score: '電池續航',
            function_semantic_score: '使用功能',
            image_semantic_score: '品牌形象',
            photo_semantic_score: '相機規格',
            voice_semantic_score: '聲音效果',
            price_semantic_score: '價格評比',
            afterservice_semantic_score: '售後服務',
        });


    var mapping_table = {
        "telecom": telecom,
        "drama": drama,
        "phone": phone
    }


    return mapping_table;

}


function gen_query_post() {
    var input_time_format = "YYYY年MM月DD日",
        output_time_format = "YYYY-MM-DD";

    var user_c_industry = $(".field_choice_u_want_this").attr("id");
    var chosen_brands = $("#" + user_c_industry + "_block .b_list_content li.selected").map(function() {
            return $(this).attr("id")
        }).get()
        .filter(function(b_n) {
            return b_n != "selectall"
        })
        .map(function(b_id) {
            return FH[user_c_industry]["brands"][b_id]
        });
    var user_start_time = moment($("input[name='start_time']").val(), input_time_format).format(output_time_format);
    var user_end_time = moment($("input[name='end_time']").val(), input_time_format).format(output_time_format);

    var user_choose_field = new Set(),
        user_choose_website = new Set();

    $("#for_channel_choice input:checked").map(function() {
        var web = $(this).parents('li').attr("class").split(' ')[0].split("_")[0];
        if (["multiselect-item", "hidden"].indexOf(web) == -1) {
            var field = $(this).parents().siblings('select').attr('id').split("-")[0]
            user_choose_field.add(field);
            user_choose_website.add(web);
        }
    })

    user_choose_field = Array.from(user_choose_field);
    user_choose_website = Array.from(user_choose_website);

    var user_choose_perspective = $("#for_perspective_choice input:checked").map(function() {
        return $(this).parents('li').attr("class").split(' ')[0].split("_")[0] + "_semantic_score";
    }).get().filter(function(p_n) {
        return p_n != "multiselect-item_semantic_score"
    });

    // 構面改成 user 選啥送啥就好，不用全送!!!
    var industry_facets_list = Object.keys(FH[user_c_industry]["facets"]);

    return {
        brands_what_I_want: chosen_brands,
        start_time: user_start_time,
        end_time: user_end_time,
        index_source: user_choose_field,
        type_source: user_choose_website,
        industry: FH[user_c_industry]["zh_name"],
        pers_list: industry_facets_list
    };
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
