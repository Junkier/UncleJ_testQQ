const express = require("express");
const elastic = require("../tools/elastic_tool");
const association = require("../tools/association_tool");
const moment = require("moment");
const GoalKeeper = require("./goal_keeper");
const fs = require("fs");

var brands = express.Router();

// Code Review.

// Check , check and check.
// soap.use("/",function(req,res,next){
// // Login check.
//     if (GoalKeeper.logined_check(req)) { next();}
//     else { res.redirect("/users/login_err/not_login"); }
// } , function(req,res,next){
// // Expiry date check.
//     if (GoalKeeper.e_time_check(req.session.expiry_date)) { next(); }
//     else {
//         req.session.destroy();
//         res.clearCookie("user_name");
//         res.redirect("/users/login_err/time_out");
//     }
// });


brands.use("/" , function(req,res,next){
// Login check.
    if( GoalKeeper.logined_check(req) ) { next();}
    else { res.redirect("/users/login_err/not_login"); }
} , function(req,res,next){
// User level check.
    if( GoalKeeper.level_check(req) ){ next();}
    else { res.redirect("/users/login_err/level_down"); }
} ,function(req,res,next){
// Expiry date check.
    if( GoalKeeper.e_time_check(req.session.expiry_date)){ next();}
    else {
        req.session.destroy();
        res.clearCookie("user_name");
        res.redirect("/users/login_err/time_out");
    }
});

// User level check.
// brands.use("/" ,  function(req,res,next){
//     if( GoalKeeper.level_check(req) ){
//         next();
//     } else {
//         res.redirect("/users/login_err/level_down");
//     }
// })

// Expiry date check.
// brands.use("/" , function(req,res,next){
//     if( GoalKeeper.e_time_check(req.session.expiry_date)){
//         next();
//     } else {
//         req.session.destroy();
//         res.clearCookie("user_name");
//         res.redirect("/users/login_err/time_out");
//     }
// })


// Enter Brands main page.
brands.get("/" ,  function(req,res,next){
	res.render("BrandQQ");
})

// ES_doc_count
brands.get("/give_me_doc_count" , function(req,res,next){
	elastic.search_get_doc_count().then(function(result){
		res.json(result["aggregations"]);
	})
})


// 1st ES_search + Samael , Belphegor issue chart.
brands.post("/es_give_me_dataQQ" , function(req , res , next){

	req.body["brands_what_I_want[]"]  = (typeof req.body["brands_what_I_want[]"] == "string") ? [req.body["brands_what_I_want[]"]] : req.body["brands_what_I_want[]"];
    log_2_file(req);
    console.log(req.body);

	// fix time.
	req.body.end_time = moment(req.body.end_time).add(1,"days").format("YYYY-MM-DD");

	var query_list = req.body["brands_what_I_want[]"].map(brand=>({
			"brand"           : brand ,
			"start_time"      : req.body.start_time ,
			"end_time"        : req.body.end_time,
			"index_source[]"  : req.body["index_source[]"],
			"type_source[]"   : req.body["type_source[]"],
            "industry"        : req.body["industry"],
			"pers_list"       : req.body["pers_list[]"]
	}))

	// Check issue_guy exists or not
	if (req.body.issue_guy){
		req.body["pers_list[]"] = [req.body["pers_list[]"]];
		query_list.map(q=>{
			q["issue_guy"] = req.body.issue_guy ;
			q["pers_list"] = [q["pers_list"]]
		})
	}

	// aggs 化完成，可優化

	var final_data = {};

    var time_s = new Date();

	var promise_all_brands = query_list.map(query=>{
		return new Promise(function(resolve, reject){
            var b_n = query["brand"].split(" ")[0];
            elastic.search_for_brands(query).then(function(result){
                console.log(b_n + " is done , use time : " + (((new Date) - time_s)/1000));
				final_data[b_n] = aggs_brand_etl(result["aggregations"],result["hits"]["total"]);
                resolve("123");
            }).catch(function(err){
                console.log(err);
                reject(b_n+ " is err.");
            })
        })
	})

    Promise.all(promise_all_brands).then(function(f_d){
        console.log("all brands done , use time : " +(((new Date) - time_s)/1000));
        res.json(final_data);
    }).catch(function(err){
        console.log(err);
		res.status(500).json({error:"error"});
    })

    function log_2_file(res_ele){
        var ip = (res_ele.headers["X-Forwarded-For"] || res_ele.headers["x-forwarded-for"] || '').split(",")[0] || res_ele.connection.remoteAddress;
        var client = {
            "user" : res_ele.cookies.user_name,
            "_ip" :  ip,
            "search_time" : moment().format("YYYY-MM-DD HH:mm:ss ddd")
        }
        res_ele.body.issue_guy && (function(){ client["issue_word"] = res_ele.body.issue_guy ;})();
        console.log(client);
        var q_info = client.user+","+client._ip+","+client.search_time+"," +(res_ele.body.issue_guy || "") + "|";
        console.log('======================================================================');
        fs.appendFile("log/Branding_log.txt",q_info);
    }

	function aggs_brand_etl(aggs_data,total_num){

		var aggs = {
			"aggs_by_years" :{},
			"aggs_by_months" :{},
			"aggs_by_days" :{},
			"aggs_by_fields" :{},
			"aggs_total":{
				"path_to_perspectives":{}
			},
		};

		// Time
        // --- years
			aggs["aggs_by_years"]  = timing_etl_tool(aggs_data["aggs_by_years"]["buckets"],"years");
        // --- months
			aggs["aggs_by_months"] = timing_etl_tool(aggs_data["aggs_by_months"]["buckets"],"months");
		// --- days
			aggs["aggs_by_days"]   = timing_etl_tool(aggs_data["aggs_by_days"]["buckets"],"days");


		// Field
		// --- website
			aggs_data["aggs_by_fields"]["buckets"].map(field_ele=>{
				var field = field_ele["key"];
				aggs["aggs_by_fields"][field]={
					"path_to_website":{}
				};
				aggs["aggs_by_fields"][field]["post_vol_counting"] = field_ele["post_vol_counting"]["value"];
				aggs["aggs_by_fields"][field]["post_num_counting"] = field_ele["doc_count"];
				field_ele["path_to_website"]["buckets"].map(w_ele=>{
					aggs["aggs_by_fields"][field]["path_to_website"][w_ele["key"]] = {
						"post_vol_counting" : w_ele["post_vol_counting"]["value"],
						"post_num_counting" : w_ele["doc_count"]
					}
				})
			})

	    // Total
		// --- perspectives aggs.
			req.body["pers_list[]"].map(pers=>{
				var pers_name = pers.split("_score")[0];
				aggs["aggs_total"]["path_to_perspectives"][pers]={
					"pers_docs_num"  : aggs_data[pers_name+"_num"]["buckets"]["non_zero"]["doc_count"],
					"pers_score_sum" : aggs_data[pers_name+"_s_sum"]["value"] ,
					"pers_score_avg" : aggs_data[pers_name+"_num"]["buckets"]["non_zero"]["doc_count"]==0 ? 0 :
							(aggs_data[pers_name+"_s_sum"]["value"] / aggs_data[pers_name+"_num"]["buckets"]["non_zero"]["doc_count"])
				}
			})
		// --- others .
			aggs["aggs_total"]["post_semantic_counting"] = semantic_merge(aggs_data["post_semantic_counting_total"]["buckets"]);
			aggs["aggs_total"]["resp_semantic_counting"] = semantic_merge(aggs_data["resp_semantic_counting_total"]["in_semantic"]["buckets"]);
			aggs["aggs_total"]["post_vol_counting"] = aggs_data["post_vol_counting_total"]["value"];
            aggs["aggs_total"]["post_num_counting"] = total_num;

		return aggs

		function timing_etl_tool(time_buckets,time_mode){
			var time_aggs_obj = {}
			time_buckets.map(time_ele=>{
				var time = time_ele["key_as_string"];
				time_aggs_obj[time]={};

				// For months -> perspectives aggs.
				time_mode == "months" && (function(){
					time_aggs_obj[time]["path_to_perspectives"]={};
					req.body["pers_list[]"].map(pers=>{
						var pers_name = pers.split("_score")[0];
						time_aggs_obj[time]["path_to_perspectives"][pers]={
							"pers_docs_num"  : time_ele[pers_name+"_num"]["buckets"]["non_zero"]["doc_count"] || 0,
							"pers_score_sum" : time_ele[pers_name+"_s_sum"]["value"] ,
							"pers_score_avg" : time_ele[pers_name+"_num"]["buckets"]["non_zero"]["doc_count"]==0 ? 0 :
							(time_ele[pers_name+"_s_sum"]["value"] / time_ele[pers_name+"_num"]["buckets"]["non_zero"]["doc_count"])
						}
					})
				})();

				time_aggs_obj[time]["resp_semantic_counting"] = semantic_merge(time_ele["resp_semantic_counting"]["in_semantic"]["buckets"]);
				time_aggs_obj[time]["post_semantic_counting"] = semantic_merge(time_ele["post_semantic_counting"]["buckets"]);
				time_aggs_obj[time]["post_vol_counting"] = time_ele["post_vol_counting"]["value"];
				time_aggs_obj[time]["post_num_counting"] = time_ele["doc_count"];
			})

			return time_aggs_obj;
		}

		function semantic_merge(sem_buckets){
			var sem_obj = { "neg":0, "neu":0, "pos":0 };
			sem_buckets.map(se_ele=>{ sem_obj[se_ele["key"]]=se_ele["doc_count"] });
			return sem_obj;
		}
	}

})

// Catch Article List Data
brands.post("/give_me_articleList_data" , function(req,res,next){

	var time_s = new Date();

	req.body["brands_what_I_want[]"]  = (typeof req.body["brands_what_I_want[]"] == "string") ? [req.body["brands_what_I_want[]"]] : req.body["brands_what_I_want[]"];

	// fix time.
	req.body.end_time = moment(req.body.end_time).add(1,"days").format("YYYY-MM-DD");

	var query_list = req.body["brands_what_I_want[]"].map(brand=>({
			"brand"           : brand ,
			"start_time"      : req.body.start_time ,
			"end_time"        : req.body.end_time,
			"index_source[]"  : req.body["index_source[]"],
			"type_source[]"   : req.body["type_source[]"],
            "industry"        : req.body["industry"],
			"chart_mode"      : req.body["chart_mode"]
	}))

	// Mammon chart always.
	// For Issue_guy in Belphegor , Samael chart.
	if (req.body.focus){
		query_list.map(q=>{ q["focus"] = req.body.focus });
	}

	var final_data = {};

	var promise_all_brands = query_list.map(query=>{
		return new Promise(function(resolve, reject){
            var b_n = query["brand"].split(" ")[0];
            elastic.search_for_brands_with_articles(query).then(function(result){
				if (query.chart_mode == "Belphegor"){
					final_data[b_n] = aggs_Bel_data(result["aggregations"]["emotion_terms"]["buckets"]);
				} else if(query.chart_mode == "Samael"){
					final_data[b_n] = result["hits"]["hits"];
				} else {
					final_data[b_n] = result["hits"]["hits"].map(ele=>ele["_source"]);
				}
                resolve("123");
            }).catch(function(err){
                console.log(err);
                reject(b_n+ " is err.");
            })
        })
	})

    Promise.all(promise_all_brands).then(function(f_d){
        console.log("article_list done , use time : " +(((new Date) - time_s)/1000));
        res.json(final_data);
    }).catch(function(err){
        console.log(err);
		res.status(500).json({error:"error"});
    })


	function aggs_Bel_data(aggs_bucket){
		var aggs = {};
		aggs_bucket.map(sem_ele=>{
			aggs[sem_ele["key"]] = sem_ele["post_ele"]["hits"]["hits"].map(post_ele=>post_ele["_source"]);
		})
		return aggs;
	}
})


// Catch FPtree Data for Mammon chart.
brands.post("/give_me_fptree_data" , function(req,res,next){

    // Code Review.

	req.body["brands_what_I_want[]"]  = (typeof req.body["brands_what_I_want[]"] == "string") ? [req.body["brands_what_I_want[]"]] : req.body["brands_what_I_want[]"];

	// fix time.
	req.body.end_time = moment(req.body.end_time).add(1,"days").format("YYYY-MM-DD");

    var b_n_list = [];

    req.body["brands_what_I_want[]"].map(function(b_all_n){
        b_all_n.split(" ").map(function(b_n){
            b_n_list.push(b_n);
        })
    })

	var query_list = req.body["brands_what_I_want[]"].map(function(ele){
		return {
			"brand" : ele ,
			"start_time" : req.body.start_time ,
			"end_time" : req.body.end_time,
			"index_source[]" : req.body["index_source[]"],
			"type_source[]" :  req.body["type_source[]"],
            "industry" : req.body["industry"]
		}
	});

	var final_tfidf_data = {
		name : "all_tfidf",
		children : []
	} ;

	var final_fp_data = {
		name : "all_fptree",
		children : []
	} ;

	var undefined_count = 0;
	var time_s = new Date();

    // 放到 Promise.all([]).then(...).catch(..) 裡?
    // content_wordcount 可用 aggs 來處理!!
	for(var index in query_list){

		(function(query , num){
			elastic.search_for_brands_with_fptree(query).then(function(result){
                
				var gogo_data = result["hits"]["hits"].map(function(ele){return ele["_source"]["content_keywords"]});
				var t_d = {};

				result["hits"]["hits"].map(function(post){

					  post["_source"]["content_wordcount"]&& post["_source"]["content_wordcount"].map(function(ele){
						 b_n_list.indexOf(ele["word"]) == -1 && (function(){
							  if( ele["word"] in t_d ) { t_d[ele["word"]] += ele["count"]} else { t_d[ele["word"]]=ele["count"] };
						 })();
					 })
				})


				association.FptreeQQ_for_brands({ "brand" : query.brand , "mergedQQ" :  gogo_data} , function(f_d){
					if(typeof f_d != "undefined" && typeof t_d != "undefined"){
						var use_data = genSorting_block(f_d[query.brand] , t_d ,query.brand.split(" ")[0],10);
                        if (use_data["t_d"]["children"].length>0){
                            final_tfidf_data["children"].push(use_data["t_d"]);
                        }
                        if (use_data["f_d"]["children"].length>0){
                            final_fp_data["children"].push(use_data["f_d"]);
                        }

					} else {
						undefined_count++;
					}

					// Check you are final or not.
					if(final_tfidf_data["children"].length == (query_list.length - undefined_count)){
                        console.log("------- FPtree data done , use time : "+(((new Date) - time_s)/1000)+" ------------");
                        // console.log("----------------------  FPtree data done. ----------------------");
						res.json({
							"fptree" : final_fp_data ,
							"tfidf"  : final_tfidf_data
						})
					}

				});

			}).catch(function(err){
                console.log("FPtree err.");
                console.log(err);
                res.status(500).json({error:"error"});
            });
		})(query_list[index] , index);

	}

	function genSorting_block(fp_data , tfidf_data , brand , num){

		// tfidf data calculate.
		var tfidf_ele = {
			name : brand ,
			children : []
		};

		// Fix Tfidf data :
		// word count for tfidf
		var t_list_data = [];
		Object.keys(tfidf_data).map(function(word){
			t_list_data.push({
				"name" : word ,
				"size" : tfidf_data[word]
			})
		})

		t_list_data.sort(function(a,b){
			return -(a.size - b.size) ;
		})

		t_list_data.length = t_list_data.length >= num ? num : t_list_data.length;
		tfidf_ele["children"] = t_list_data;

		// tfidf_ele
		// fp_data calculate.

		var fp_ele = {
			name : brand ,
			children : []
		};

		// Fix FPtree data :
		// Sorting.


		fp_data.map(function(ele){
			fp_ele["children"].push({
				"name" : ele["word"],
				"size" : ele["weight"]
			})
		})

		return {
			"f_d" : fp_ele ,
			"t_d" : tfidf_ele
		}

	}

});

// Catch PMI_correlation (Lucifer Chart) Data.
brands.post("/give_me_Lucifer_data" , function(req,res,next){

    // Code Review.

	if(typeof req.body["brands_what_I_want[]"] == "string"){
		req.body["brands_what_I_want[]"] = [req.body["brands_what_I_want[]"]];
	}

	// fix time.
	req.body.end_time = moment(req.body.end_time).add(1,"days").format("YYYY-MM-DD");

    var query_list = req.body["brands_what_I_want[]"].map(ele =>({
            "brand" : ele ,
			"start_time" : req.body.start_time ,
			"end_time" : req.body.end_time,
			"index_source[]" : req.body["index_source[]"],
			"type_source[]" :  req.body["type_source[]"],
            "industry" : req.body["industry"]
    }));

    var time_s = new Date();

    var promise_all_brands = [];

	for(var index in query_list){
		promise_all_brands.push(new Promise(function(resolve, reject){
            var query = query_list[index] ;
            var b_n = query["brand"].split(" ")[0];
            elastic.search_for_brands_with_Lucifer(query).then(function(result){

                resolve({ "b_name"  : query["brand"],
                          "element" : result["hits"]["hits"],
                          "vol_aggs": result["aggregations"]}
                );
            }).catch(function(err){
                reject(b_n+ " is err.");
            })
        }));
	}

    Promise.all(promise_all_brands).then(function(f_d){
        // [p1,p2,p3] => [{..},{..},{..}]
        console.log( "Ok , PMI_data is going , use time : " + (((new Date) - time_s)/1000));
        var time_paragon=[];
        f_d.map(b_ele=>{
            b_ele["vol_aggs"]["time_group"]["buckets"].length > time_paragon.length && function(){
                time_paragon = b_ele["vol_aggs"]["time_group"]["buckets"].map(t_ele=>t_ele["key_as_string"]);
            }();
        })

        var pmi_ready_data = dealdata_PMI(f_d,time_paragon);
        var vol_ready_data = dealdata_VOL(f_d,time_paragon);

        // <1y , 以 1M  為單位
        // >1y , 以 .5y 為單位做 aggregations
        if(time_paragon.length >12){
            vol_ready_data = Aggs_by_time_vol(vol_ready_data,time_paragon,6);
            pmi_ready_data["merged_r_d"] = Aggs_by_time_pmi(pmi_ready_data["merged_r_d"],time_paragon,6);
        }

        var go_pmi = new Date();

        association.Pmi_corQQ_for_brands( pmi_ready_data , function(p_data){

            // Fix time list order
            var p_f_data = {};
            Object.keys(p_data).sort((a,b)=> new Date(a)-new Date(b)).map(month=>{
                p_f_data[month] = p_data[month];
            })

            console.log("------- PMI data done , use time : "+(((new Date) - go_pmi)/1000)+" ------------");
			// fs.writeFile("QQ.json",JSON.stringify(p_f_data,null,4));
            res.json({"pmi_d": p_f_data, "vol_d":vol_ready_data });
        })
    }).catch(function(err){
        console.log(err);
    })


    function dealdata_VOL(raw_d,t_paragon){
        var t_g_d = {};
        raw_d.map(b_ele=>{
            var time_obj = {};
            // 缺項補 0 將欄位填滿
            t_paragon.map(month=>{
                time_obj[month] = 0;
            })
            var use_bucket = b_ele["vol_aggs"]["time_group"]["buckets"];
            use_bucket.map(t_ele=>{
                time_obj[t_ele["key_as_string"]] = t_ele["volume_sum"]["value"];
            })
            t_g_d[b_ele["b_name"].split(" ")[0]] = time_obj;
        });

        return t_g_d;
    }

    function dealdata_PMI(raw_d,t_paragon){
        var Merged_data = {
            "merged_r_d" : {},
            "brands" : []
        } ;

        // 缺項補 0 將欄位填滿
        t_paragon.map(month=>{
            Merged_data["merged_r_d"][month] = [];
        })

        raw_d.map(b_component => {
            Merged_data["brands"].push(b_component["b_name"]);
            b_component["element"].map(ele=>{
                var time = moment(new Date(ele["_source"]["time"].split(" ")[0])).format("YYYY-MM");
                Merged_data["merged_r_d"][time].push(ele["_source"]["newcontent_tag"]);
            })
        });

        t_paragon.map(month=>{
            var unique_post = new Set(Merged_data["merged_r_d"][month]);
            Merged_data["merged_r_d"][month] = Array.from(unique_post);
        })

        return Merged_data;
    }


    function Aggs_by_time_vol(init_vol_data,t_paragon,interval_time){
        var aggs_vol_data ={};
        Object.keys(init_vol_data).map(b_n=>{
            var time_aggs_obj = {};
            t_paragon.map((month,index)=>{
                var aggs_month = t_paragon[Math.floor(index/interval_time)*interval_time];
                if(aggs_month in time_aggs_obj){
                    time_aggs_obj[aggs_month] += init_vol_data[b_n][month];
                } else {
                    time_aggs_obj[aggs_month] = init_vol_data[b_n][month];
                }
            })
            aggs_vol_data[b_n]=time_aggs_obj;
        })
        return aggs_vol_data;
    }

    function Aggs_by_time_pmi(init_pmi_data,t_paragon,interval_time){
        var aggs_data ={};
        t_paragon.map((month,index)=>{
            var aggs_month = t_paragon[Math.floor(index/interval_time)*interval_time];
            if(aggs_month in aggs_data){
                aggs_data[aggs_month] = aggs_data[aggs_month].concat(init_pmi_data[month]);
            } else {
                aggs_data[aggs_month] = init_pmi_data[month];
            }
        })
        return aggs_data;
    }

});

module.exports = brands ;
