const express = require("express");
const elastic = require("../tools/elastic_tool");
const association = require("../tools/association_tool");
const moment = require("moment");
const GoalKeeper = require("./goal_keeper");
const fs = require("fs");

var soap = express.Router();
var dump_data_num = { "test": 0 ,"low" : 200 ,"high" : 1000 ,"God" : 2000 };

// Check , check and check.
soap.use("/",function(req,res,next){
// Login check.
    if (GoalKeeper.logined_check(req)) { next();}
    else { res.redirect("/users/login_err/not_login"); }
} , function(req,res,next){
// Expiry date check.
    if (GoalKeeper.e_time_check(req.session.expiry_date)) { next(); }
    else {
        req.session.destroy();
        res.clearCookie("user_name");
        res.redirect("/users/login_err/time_out");
    }
});

// Enter Soap Main page.
soap.get("/", function(req, res, next) {
    res.render("SoapQQ", {
        "wordQQ" : req.query.LeoKing || "",
        "automatic_or_not" : typeof req.query.LeoKing == "undefined" ? 0:1,
        "user_account_level" : req.session.userlevel
    });
});

// ES_doc_count
soap.get("/give_me_doc_count", function(req, res, next) {
    elastic.search_get_doc_count().then(function(result) {
        res.json(result["aggregations"]);
    }).catch(function(err){
        console.log(err);
        res.status(500).send("連線有誤");
    });
})


// ES_search
soap.post("/give_me_chartQQ",function(req, res, next) {
    // 預設 domain 全選QQ

    // fix time.
    req.body.end_time = moment(req.body.end_time).add(1, "days").format("YYYY-MM-DD");
    var t_start = new Date();
    log_2_file(req);
    console.log(req.body);

    elastic.search_for_soap(req.body).then(function(result) {
        console.log("query time : " + (new Date() - t_start) / 1000);
        res.json(aggs_soap_etl(result["aggregations"], result["hits"]["total"]));
    }).catch(function(err) {
        console.log(err);
    });

    function log_2_file(res_ele) {
        // 要紀錄 Advanced_query !!!
        var ip = (res_ele.headers["X-Forwarded-For"] || res_ele.headers["x-forwarded-for"] || '').split(",")[0] || res_ele.connection.remoteAddress;
        var client = {
            "user": res_ele.cookies.user_name,
            "_ip": ip,
            "search_time": moment().format("YYYY-MM-DD HH:mm:ss ddd"),
            "care_word": res_ele.body.keyword
        };
        console.log(client);
        console.log('======================================================================');
        var q_info = client.user + "," + client._ip + "," + client.search_time + "," + client.care_word + "|";
        fs.appendFile("log/Issue_log.txt", q_info);
    }

    function aggs_soap_etl(aggs_data, hit_num) {

        var aggs = {
            // "aggs_by_years" :{},
            // "aggs_by_months" :{},
            "aggs_by_days": {},
            "aggs_by_authors": [],
            "aggs_by_websites": {},
            "aggs_total": {},
            "aggs_wordcount": []
        };

        // Time
        // --- years
        // aggs["aggs_by_years"]  = timing_etl_tool(aggs_data["aggs_by_years"]["buckets"],"years");
        // --- months
        // aggs["aggs_by_months"] = timing_etl_tool(aggs_data["aggs_by_months"]["buckets"],"months");
        // --- days
        aggs["aggs_by_days"] = timing_etl_tool(aggs_data["aggs_by_days"]["buckets"], "days");


        // Field
        // --- website
        aggs_data["aggs_by_websites"]["buckets"].map(field_ele => {
            aggs["aggs_by_websites"][field_ele["key"]] = post_resp_ele_merge(field_ele);
        })

        // Author
        aggs["aggs_by_authors"] = aggs_data["aggs_by_authors"]["buckets"].map(author_ele => ({
            "author": author_ele["key"],
            "doc_count": author_ele["doc_count"]
        }));

        // WordCount
        aggs["aggs_wordcount"] = aggs_data["wordcount_fire"]["in_word"]["buckets"].map(word_ele => ({
            "word": word_ele["key"],
            "count": word_ele["in_sum"]["value"]
        }));

        // Total
        aggs["aggs_total"]["post_semantic_counting"] = semantic_merge(aggs_data["post_semantic_counting_total"]["buckets"]);
        aggs["aggs_total"]["resp_semantic_counting"] = semantic_merge(aggs_data["resp_semantic_counting_total"]["in_semantic"]["buckets"]);
        aggs["aggs_total"]["post_vol_counting"] = aggs_data["post_vol_counting_total"]["value"];
        aggs["aggs_total"]["post_num_counting"] = hit_num;

        return aggs

        function timing_etl_tool(time_buckets, time_mode) {
            var time_aggs_obj = {};
            if (time_mode == "days") {
                time_buckets.map(time_ele => {
                    var day = time_ele["key_as_string"];
                    time_aggs_obj[day] = post_resp_ele_merge(time_ele);
                    time_aggs_obj[day]["post_element"] = time_ele["post_element"]["hits"]["hits"].map(ele => ele["_source"]);
                    time_aggs_obj[day]["path_to_website"] = {};
                    time_ele["path_to_website"]["buckets"].map(w_ele => {
                        time_aggs_obj[day]["path_to_website"][w_ele["key"]] = post_resp_ele_merge(w_ele)
                    })
                })
                return time_aggs_obj;
            }
            time_buckets.map(time_ele => {
                time_aggs_obj[time_ele["key_as_string"]] = post_resp_ele_merge(time_ele);
            });
            return time_aggs_obj;
        }

        function post_resp_ele_merge(init_ele) {
            var out_obj = {};
            out_obj["post_num_counting"] = init_ele["doc_count"] || 0;
            if (init_ele["post_vol_counting"]) {
                out_obj["post_vol_counting"] = init_ele["post_vol_counting"]["value"]
            };
            if (init_ele["post_semantic_counting"]) {
                out_obj["post_semantic_counting"] = semantic_merge(init_ele["post_semantic_counting"]["buckets"])
            };
            if (init_ele["resp_semantic_counting"]) {
                out_obj["resp_semantic_counting"] = semantic_merge(init_ele["resp_semantic_counting"]["in_semantic"]["buckets"])
            };
            return out_obj;
        }

        function semantic_merge(sem_buckets) {
            var sem_obj = {
                "neg": 0,
                "neu": 0,
                "pos": 0
            };
            sem_buckets.map(se_ele => {
                sem_obj[se_ele["key"]] = se_ele["doc_count"]
            });
            return sem_obj;
        }
    }

});

// ES_for_articles_total_show & articles list
soap.post("/give_me_articles" , function(req,res,next){
// check user level for dumping data.
//     // 和前端比較，發現竄改直接擋回!!!
//     // 其實好像可以不用做Q
    if(req.body.user_level && (req.session.userlevel != req.body.user_level)){
        res.status(500).send("身份資格不符，下載資料失敗。");
    }else {
        next();
    }
} , function(req, res, next) {

    // scroll search only for Index0 .
    if (req.body.scroll_id_QQ) {
        elastic.search_scroll({
            "scrollId": req.body.scroll_id_QQ,
            "scroll": "15m"
        }).then(function(result) {
            res.json({
                "scroll_data": result["hits"]["hits"].map(ele => ele["_source"])
            });
        }).catch(function(err) {
            console.log(err);
            res.status(500).json({
                "err": err
            });
        })
    } else {
        // fix time.
        req.body.end_time = moment(req.body.end_time).add(1, "days").format("YYYY-MM-DD");
        elastic.search_for_soap_with_articles(req.body,dump_data_num[req.session.userlevel]).then(function(result) {
            if (req.body.use_chart == "chart7") {
                res.json(aggs_Bel_data(result["aggregations"]["emotion_terms"]["buckets"]));
            } else if (req.body.use_chart == "chart0") {
                res.json({
                    "normal_d": result["hits"]["hits"].map(ele => ele["_source"]),
                    "aggs": aggs_allArticles_data(result["aggregations"]["aggs_by_websites"]["buckets"]),
                    "scroll_id": result["_scroll_id"]
                })
            } else {
                res.json(result["hits"]["hits"].map(ele => ele["_source"]))
            };
        }).catch(function(err) {
            console.log(err);
            res.status(500).json({
                error: "error"
            });
        });
    }

    function aggs_Bel_data(aggs_bucket) {
        var aggs = {};
        aggs_bucket.map(sem_ele => {
            aggs[sem_ele["key"]] = sem_ele["post_ele"]["hits"]["hits"].map(post_ele => post_ele["_source"]);
        })
        return aggs;
    }

    function aggs_allArticles_data(aggs_bucket) {
        var aggs = {};
        aggs_bucket.map(web_ele => {
            aggs[web_ele["key"]] = {
                "post_num_counting": web_ele["doc_count"],
                "resp_num_counting": web_ele["resp_num_counting"]["value"]
            }
        })
        return aggs;
    }
});

// FP tree data
// 有進搜的關聯議題 要 特別處理QQ
soap.post("/give_me_fptree", function(req, res, next) {

    // fix time.
    req.body.end_time = moment(req.body.end_time).add(1, "days").format("YYYY-MM-DD");

    elastic.search_for_soap_fptree(req.body).then(function(result) {
        var fptree_raw_d = result["hits"]["hits"].map(ele => ele["_source"]["content_keywords"]||"");
        var time_s = new Date();
        association.FptreeQQ_for_soap({
            "fp_raw_data": fptree_raw_d,
            "keyword": req.body.keyword
        }, function(f_data) {
            console.log("-------------- FPtree Done , use time : " + (((new Date) - time_s) / 1000) + "--------------");
            res.json(f_data);
        });
    })

})


// DashBoard data
soap.post("/give_me_dashboard", function(req, res, next) {

    // fix time.
    // Interval : 1 month.
    req.body.start_time = moment(req.body.end_time).subtract(1, "months").format("YYYY-MM-DD");
    req.body.end_time = moment(req.body.end_time).add(1, "days").format("YYYY-MM-DD");
    
    elastic.search_for_soap_dashboard(req.body).then(function(result) {
        var promise_all_list = [];

        // for relation_issue_chart

        promise_all_list.push(new Promise(function(resolve, reject) {
            var time_s = new Date();
            // Hotword.

            var hotword_list = result["aggregations"]["wordcount_fire"]["in_word"]["buckets"].map(word_ele => ({
                "word": word_ele["key"],
                "count": word_ele["in_sum"]["value"]
            }));

            // Fptree.
            var fptree_raw_d = result["hits"]["hits"].map(ele => ele["_source"]["content_keywords"] || "");
            association.FptreeQQ_for_soap({
                "fp_raw_data": fptree_raw_d,
                "keyword": req.body.keyword
            }, function(fp_data) {
                console.log("-------------- Dashboard FPtree Done , use time : " + (((new Date) - time_s) / 1000) + "--------------");
                resolve({
                    "fptree": fp_data["FPtree"] ? {
                        "FPtree": fp_data["FPtree"].filter(ele => ele["Level2"].length == 0)
                    } : fp_data,
                    "hotword": hotword_list
                });
            });
        }));

        // for other charts
        promise_all_list.push(new Promise(function(resolve, reject) {
            resolve(aggs_dashb_etl(result["aggregations"], result["hits"]["total"]));
            reject("error");
        }));

        Promise.all(promise_all_list).then(function(final_d) {
            res.json({
                "relation_issue_chart": final_d[0],
                "aggs": final_d[1]
            })
        }).catch(function(err) {
            console.log(err);
            res.status(500).json({
                error: "error"
            });
        })

    }).catch(function(es_err) {
        console.log(es_err);
    });


    function aggs_dashb_etl(aggs_data, hits_num) {
        var aggs = {
            "aggs_by_days": {},
            "aggs_by_weeks": {},
            "aggs_total_author": [],
            "aggs_stats_months": {}
        };

        // Total
        // author
        aggs["aggs_total_author"] = aggs_data["aggs_total_author"]["buckets"].map(a_ele => ({
            "author": a_ele["key"],
            "doc_num_counting": a_ele["doc_count"]
        }))
        aggs["aggs_total_pageview"] = aggs_data["aggs_total_pageview_counting"]["value"];
        aggs["aggs_total_shares"] = 0; // aggs["aggs_total_shares"] = aggs_data["???"]["value"];
        aggs["aggs_total_likes"] = aggs_data["aggs_total_like_counting"]["value"];
        aggs["aggs_total_respnum"] = aggs_data["aggs_total_respnum_counting"]["value"];
        aggs["aggs_total_post_counting"] = hits_num;
        aggs["aggs_total_author_counting"] = aggs_data["aggs_total_author_counting"]["value"];

        // time
        // --- weeks
        var weeks_buckets_len = aggs_data["aggs_by_weeks"]["buckets"].length;
        aggs_data["aggs_by_weeks"]["buckets"].slice(weeks_buckets_len - 4, weeks_buckets_len).map((time_ele, index) => {
                var week = time_ele["key_as_string"];

                var website_obj = {};
                time_ele["path_to_website"]["buckets"].map(w_ele => {
                    website_obj[w_ele["key"]] = {
                        "post_num_counting": w_ele["doc_count"],
                        "post_vol_counting": w_ele["in_vol"]["value"]
                    }
                })

                aggs["aggs_by_weeks"][(4 - index) + "_weeks_ago"] = {
                    "week_time": week,
                    "path_to_website": website_obj,
                    "post_num_counting": time_ele["doc_count"],
                    "post_vol_counting": time_ele["post_vol_counting"]["value"],
                    "post_semantic_counting": semantic_merge(time_ele["post_semantic_counting"]["buckets"]),
                    "resp_num_counting": time_ele["resp_semantic_counting"]["doc_count"],
                    "resp_semantic_counting": semantic_merge(time_ele["resp_semantic_counting"]["in_semantic"]["buckets"]),
                    "aggs_pageview": time_ele["pageview_counting"]["value"]
                }

            })
            // --- days
        aggs_data["aggs_by_days"]["buckets"].map(time_ele => {
            var day = time_ele["key_as_string"];
            aggs["aggs_by_days"][day] = {
                "path_to_field": {},
                "post_allvol_counting": time_ele["post_allvol_counting"], // all_vol = post_number + volumes
                "post_semantic_counting": semantic_merge(time_ele["post_semantic_counting"]["buckets"])
            };
            time_ele["path_to_field"]["buckets"].map(field_ele => {
                aggs["aggs_by_days"][day]["path_to_field"][field_ele["key"]] = {
                    "post_num_counting": field_ele["doc_count"],
                    "post_vol_counting": field_ele["in_vol"]["value"]
                }
            })
        })

        // Statistics value
        aggs["aggs_stats_months"]["allvol_counting"] = {
            "avg": aggs_data["aggs_stats_months"]["avg"],
            "std_deviation": aggs_data["aggs_stats_months"]["std_deviation"]
        }
        aggs["aggs_stats_months"]["pos_counting"] = stats_calculate(aggs["aggs_by_days"], "pos");
        aggs["aggs_stats_months"]["neg_counting"] = stats_calculate(aggs["aggs_by_days"], "neg");
        return aggs;
    }


    function semantic_merge(sem_buckets) {
        var sem_obj = {
            "neg": 0,
            "neu": 0,
            "pos": 0
        };
        sem_buckets.map(se_ele => {
            sem_obj[se_ele["key"]] = se_ele["doc_count"]
        });
        return sem_obj;
    }

    function stats_calculate(aggs_day_obj, sem_tag) {
        var days = Object.keys(aggs_day_obj),
            days_len = days.length;
        var sem_vol = days.map(d => aggs_day_obj[d]["post_semantic_counting"][sem_tag]);
        var sem_avg = sem_vol.reduce((a, b) => a + b) / days_len,
            sem_square_sum = sem_vol.map(v => v * v).reduce((a, b) => a + b);
        return {
            "avg": sem_avg,
            "std_deviation": Math.sqrt((sem_square_sum / days_len) - (sem_avg) * (sem_avg))

        }
    }

})

module.exports = soap;
