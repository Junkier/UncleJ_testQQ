const elasticsearch = require("elasticsearch");

const client = new elasticsearch.Client({
    // host: 'insighteye.gptt.com.tw:9528/', // Devops
    host: '192.168.142.106:9200/',
    // host: '192.168.142.68:9200/',
    // hosts: [
    // '192.168.142.79:9200/',
    // '192.168.142.114:9200/',
    // ] ,
    log: 'info',
    requestTimeout: Infinity
});

// Function Detail
//  All 　:
//     gen_query_post
//     ad_query (advanced_query)
//     search_get_doc_count
//     search_scroll

//  Soap　:
//     search_for_soap (charts)
//     search_for_soap_with_articles (index0 , article list)
//     search_for_soap_fptree (fptree data)
//     search_for_soap_dashboard (dashboard data)
//  Brands :
//     search_for_brands (charts)
//     search_for_brands_with_articles (article list)
//     search_for_brands_with_fptree (fptree data)
//     search_for_brands_with_Lucifer (PMI data)


///////////////////////////       All      ///////////////////////////
function for_search(query) {
    return client.search(query);
}

function gen_query_post(res_b, min_s, doc_num) {
    return {
        index: res_b["index_source[]"],
        type: res_b["type_source[]"],
        body: {
            "query": {
                "bool": {
                    "must": [{
                        "multi_match": {
                            "query": res_b.keyword || res_b.brand,
                            "type": "cross_fields",
                            "fields": [
                                "title",
                                "newcontent_tag"
                            ]
                        }
                    }],
                    "filter": [{
                        "range": {
                            "time": {
                                "from": res_b.start_time,
                                "to": res_b.end_time
                            }
                        }
                    }]
                }
            },
            "min_score": min_s,
            "size": doc_num
        }
    };
}

function ad_query(res_b, query_p) {
    ["and", "or", "not"].map(logic => {
        var ad_key = "advanced_query[" + logic + "][]";
        if (res_b[ad_key]) {
            res_b[ad_key] = typeof res_b[ad_key] == "string" ? [res_b[ad_key]] : res_b[ad_key]
            var es_q_word = logic == "and" ? "must" : (logic == "or" ? "should" : "must_not");
            if(logic == "or"){
                delete query_p["body"]["query"]["bool"]["must"];
                query_p["body"]["query"]["bool"]["minimum_should_match"] = 1;
                query_p["body"]["query"]["bool"][es_q_word] = [{
                    "multi_match": {
                        "query": res_b.keyword,
                        "type": "cross_fields",
                        "fields": [
                            "title",
                            "newcontent_tag"
                        ]
                    }
                }];
            };
            if (logic == "not") {
                query_p["body"]["query"]["bool"][es_q_word] = [];
            };
            res_b[ad_key].map(q_word => {
                query_p["body"]["query"]["bool"][es_q_word].push({
                    "multi_match": {
                        "query": q_word,
                        "type": "cross_fields",
                        "fields": [
                            "title",
                            "newcontent_tag"
                        ]
                    }
                })
            })
        };
    });

    if (res_b['advanced_query[domain][]']) {
        res_b["advanced_query[domain][]"] = typeof res_b["advanced_query[domain][]"] == "string" ? [res_b["advanced_query[domain][]"]] : res_b["advanced_query[domain][]"]
        var domain_obj = {
            "bool": {
                "should": []
            }
        };
        res_b["advanced_query[domain][]"].map(domain => {
            domain_obj["bool"]["should"].push({
                "term": {
                    "domain": domain
                }
            })
        })
        query_p["body"]["query"]["bool"]["filter"].push(domain_obj);
    }
    return query_p
}

function search_get_doc_count() {
    // Automatically get ES doc counts.
    // And domain terms;
    var query_post = {
        body: {
            "query": {
                "match_all": {}
            },
            "size": 0,
            "aggs": {
                "domain_counting": {
                    "terms": {
                        "field": "domain",
                        "size": 0
                    }
                },
                "field_count": {
                    "terms": {
                        "field": "_index",
                        "size": 0
                    },
                    "aggs": {
                        "website_count": {
                            "terms": {
                                "field": "_type",
                                "size": 0
                            },
                            "aggs": {
                                "category_count": {
                                    "terms": {
                                        "field": "category",
                                        "size": 0
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    return for_search(query_post);
}
exports.search_get_doc_count = search_get_doc_count;

function search_scroll(query) {
    return client.scroll(query);
}
exports.search_scroll = search_scroll;
///////////////////////////       All      ///////////////////////////


///////////////////////////       Soap      ///////////////////////////
var soap_size = 50000;
var soap_min_score = 0.1;

// Step 4 : 排序的 scroll 分頁顯示!!!
function search_for_soap(res_body) {

    var aggs_post_resp_ele = {
        "post_vol_counting": {
            "sum": {
                "field": "volume"
            }
        },
        "post_semantic_counting": {
            "terms": {
                "field": "content_semantic_tag"
            }
        },
        "resp_semantic_counting": {
            "nested": {
                "path": "resp_list"
            },
            "aggs": {
                "in_semantic": {
                    "terms": {
                        "field": "resp_list.semantic_tag"
                    }
                }
            }
        }
    };

    var query_post = gen_query_post(res_body, soap_min_score, 0);
    query_post["body"]["aggs"] = {
        "wordcount_fire": {
            "nested": {
                "path": "content_wordcount"
            },
            "aggs": {
                "in_word": {
                    "terms": {
                        "field": "content_wordcount.word",
                        "order": {
                            "in_sum": "desc"
                        },
                        "size": 50
                    },
                    "aggs": {
                        "in_sum": {
                            "sum": {
                                "field": "content_wordcount.count"
                            }
                        }
                    }
                }
            }
        },
        "post_semantic_counting_total": {
            "terms": {
                "field": "content_semantic_tag"
            }
        },
        "resp_semantic_counting_total": {
            "nested": {
                "path": "resp_list"
            },
            "aggs": {
                "in_semantic": {
                    "terms": {
                        "field": "resp_list.semantic_tag"
                    }
                }
            }
        },
        "post_vol_counting_total": {
            "sum": {
                "field": "volume"
            }
        },
        "aggs_by_authors": {
            "terms": {
                "field": "author"
            }
        },
        "aggs_by_websites": {
            "terms": {
                "field": "_type"
            },
            "aggs": aggs_post_resp_ele
        },
        "aggs_by_days": {
            "date_histogram": {
                "field": "time",
                "interval": "day",
                "format": "yyyy-MM-dd"
            },
            "aggs": {
                "post_element": {
                    "top_hits": {
                        "_source": ["title", "url", "author"],
                        "size": 100
                    }
                },
                "path_to_website": {
                    "terms": {
                        "field": "_type"
                    },
                    "aggs": {
                        "post_vol_counting": {
                            "sum": {
                                "field": "volume"
                            }
                        }
                    }
                },
                "post_vol_counting": {
                    "sum": {
                        "field": "volume"
                    }
                },
                "post_semantic_counting": {
                    "terms": {
                        "field": "content_semantic_tag"
                    }
                },
                "resp_semantic_counting": {
                    "nested": {
                        "path": "resp_list"
                    },
                    "aggs": {
                        "in_semantic": {
                            "terms": {
                                "field": "resp_list.semantic_tag"
                            }
                        }
                    }
                }
            }
        }
        /*"aggs_by_fields": {
        	"terms": {
        		"field": "_index"
        	},
        	"aggs": {
        		"path_to_website": {
        			"terms": {
        				"field": "_type"
        			},
        			"aggs": aggs_post_resp_ele
        		},
        		"post_vol_counting": {
        			"sum": {
        				"field": "volume"
        			}
        		}
        	}
        },
         "aggs_by_years": {
        	"date_histogram": {
        		"field": "time",
        		"interval": "year",
        		"format": "yyyy"
        	},
        	"aggs": aggs_post_resp_ele
        },
        "aggs_by_months": {
        	"date_histogram": {
        		"field": "time",
        		"interval": "month",
        		"format": "yyyy-MM"
        	},
        	"aggs": aggs_post_resp_ele
        }, */
    }
    query_post = ad_query(res_body, query_post);
    return for_search(query_post);
}
exports.search_for_soap = search_for_soap;

function search_for_soap_with_articles(res_body,dump_num) {
    var query_post = gen_query_post(res_body, soap_min_score, soap_size);
    query_post["body"]["_source"] = ["title", "author", "time", "website",
        "content", "url", "content_semantic_*", "volume", "field"
    ];

    // For focus_word (index 2 , 10)
    // 沒詞 or 不精確 請從字典開始改善
    if (res_body.focus_word) {
        res_body.focus_word.split(" ").map(word => {
            query_post["body"]["query"]["bool"]["must"].push({
                "multi_match": {
                    "query": word,
                    "type": "cross_fields",
                    "fields": [
                        "title",
                        "newcontent_tag"
                    ],
                }
            })
        })
        query_post["body"]["size"] = 50;
    }

    // code review
    // For 正負評論-文列 (index 7)
    if (res_body.use_chart == "chart7") {
        query_post["body"]["size"] = 0;
        query_post["body"]["aggs"] = {
            "emotion_terms": {
                "terms": {
                    "field": "content_semantic_tag",
                    "exclude": "neu"
                },
                "aggs": {
                    "post_ele": {
                        "top_hits": {
                            "_source": ["url", "title", "author", "field", "time",
                                "website", "volume", "content_semantic_*"
                            ],
                            "size": 50
                        }
                    }
                }
            }
        }
    }

    // For 總文列表 (index 0)
    if (res_body.use_chart == "chart0") {
        // 已用 scroll 作分頁Q
        //  Next step. 排序分頁!!
        query_post["scroll"] = "15m";
        query_post["body"]["size"] = 100;
        query_post["body"]["aggs"] = {
            "aggs_by_websites": {
                "terms": {
                    "field": "_type"
                },
                "aggs": {
                    "resp_num_counting": {
                        "sum": {
                            "field": "resp_num"
                        }
                    }
                }
            }
        };
    }

    // For Dump data
    if(res_body.use_chart == "dump_data"){
        query_post["body"]["size"] = dump_num;
    }

    query_post = ad_query(res_body, query_post);
    return for_search(query_post);
}
exports.search_for_soap_with_articles = search_for_soap_with_articles;

function search_for_soap_fptree(res_body) {
	var query_post = gen_query_post(res_body, 0.5, soap_size);
	query_post["body"]["_source"] = ["content_keywords"];
    query_post = ad_query(res_body, query_post);
    return for_search(query_post);
}
exports.search_for_soap_fptree = search_for_soap_fptree;

function search_for_soap_dashboard(res_body) {
	// time 已被偷換成 1 month
	var query_post = gen_query_post(res_body, soap_min_score, soap_size);
	query_post["body"]["_source"] = ["content_keywords", "content_wordcount"];
	query_post["body"]["aggs"] = {
        "wordcount_fire": {
            "nested": {
                "path": "content_wordcount"
            },
            "aggs": {
                "in_word": {
                    "terms": {
                        "field": "content_wordcount.word",
                        "order": {
                            "in_sum": "desc"
                        },
                        "size": 10
                    },
                    "aggs": {
                        "in_sum": {
                            "sum": {
                                "field": "content_wordcount.count"
                            }
                        }
                    }
                }
            }
        },
		"aggs_total_author": {
			"terms": {
				"field": "author",
				"size": 5
			}
		},
		"aggs_total_author_counting": {
			"cardinality": {
				"field": "author"
			}
		},
		"aggs_total_pageview_counting": {
			"sum": {
				"field": "pageview"
			}
		},
		"aggs_total_like_counting": {
			"sum": {
				"field": "click_resp_num"
			}
		},
		"aggs_total_respnum_counting": {
			"sum": {
				"field": "resp_num"
			}
		},
		"aggs_by_days": {
			"date_histogram": {
				"field": "time",
				"interval": "day",
				"format": "yyyy-MM-dd"
			},
			"aggs": {
				"post_allvol_counting": {
					"sum": {
						"field": "volume",
						"script": "_value+1"
					}
				},
				"post_semantic_counting": {
					"terms": {
						"field": "content_semantic_tag"
					}
				},
				"path_to_field": {
					"terms": {
						"field": "_index"
					},
					"aggs": {
						"in_vol": {
							"sum": {
								"field": "volume"
							}
						}
					}
				}
			}
		},
		"aggs_by_weeks": {
			"date_histogram": {
				"field": "time",
				"interval": "1w",
				"format": "yyyy-MM-dd"
			},
			"aggs": {
				"path_to_website": {
					"terms": {
						"field": "_type"
					},
					"aggs": {
						"in_vol": {
							"sum": {
								"field": "volume"
							}
						}
					}
				},
				"pageview_counting": {
					"sum": {
						"field": "pageview"
					}
				},
				"post_vol_counting": {
					"sum": {
						"field": "volume"
					}
				},
				"post_semantic_counting": {
					"terms": {
						"field": "content_semantic_tag"
					}
				},
				"resp_semantic_counting": {
					"nested": {
						"path": "resp_list"
					},
					"aggs": {
						"in_semantic": {
							"terms": {
								"field": "resp_list.semantic_tag"
							}
						}
					}
				}
			}
		},
		"aggs_stats_months": {
			"extended_stats_bucket": {
				"buckets_path": "aggs_by_days>post_allvol_counting"
			}
		}
	};

    query_post = ad_query(res_body, query_post);
    return for_search(query_post);
}
exports.search_for_soap_dashboard = search_for_soap_dashboard;
///////////////////////////       Soap      ///////////////////////////


///////////////////////////       Brand      ///////////////////////////
var brand_size = 50000;
var brand_min_score = 0;

function search_for_brands(res_body) {

    var aggs_post_resp_ele = {
        "post_vol_counting": {
            "sum": {
                "field": "volume"
            }
        },
        "post_semantic_counting": {
            "terms": {
                "field": "content_semantic_tag"
            }
        },
        "resp_semantic_counting": {
            "nested": {
                "path": "resp_list"
            },
            "aggs": {
                "in_semantic": {
                    "terms": {
                        "field": "resp_list.semantic_tag"
                    }
                }
            }
        }
    };

    var query_post = gen_query_post(res_body, brand_min_score, 0);
    query_post["body"]["query"]["bool"]["filter"].push({
        "term" : { "industry" : res_body.industry }
    });
    query_post["body"]["aggs"] = {
        "post_semantic_counting_total": {
            "terms": {
                "field": "content_semantic_tag"
            }
        },
        "resp_semantic_counting_total": {
            "nested": {
                "path": "resp_list"
            },
            "aggs": {
                "in_semantic": {
                    "terms": {
                        "field": "resp_list.semantic_tag"
                    }
                }
            }
        },
        "post_vol_counting_total": {
            "sum": {
                "field": "volume"
            }
        },
        "aggs_by_fields": {
            "terms": {
                "field": "_index"
            },
            "aggs": {
                "path_to_website": {
                    "terms": {
                        "field": "_type"
                    },
                    "aggs": {
                        "post_vol_counting": {
                            "sum": {
                                "field": "volume"
                            }
                        }
                    }
                },
                "post_vol_counting": {
                    "sum": {
                        "field": "volume"
                    }
                }
            }
        },
        "aggs_by_years": {
            "date_histogram": {
                "field": "time",
                "interval": "year",
                "format": "yyyy"
            },

            "aggs": aggs_post_resp_ele
        },
        "aggs_by_months": {
            "date_histogram": {
                "field": "time",
                "interval": "month",
                "format": "yyyy-MM"
            },
            "aggs": aggs_post_resp_ele
        },
        "aggs_by_days": {
            "date_histogram": {
                "field": "time",
                "interval": "day",
                "format": "yyyy-MM-dd"
            },
            "aggs": aggs_post_resp_ele
        }
    }

    // Perspectives aggs.
    // 再優化Q
    res_body.pers_list.map(pers => {
        var pers_name = pers.split("_score")[0];
        var term_obj = {};
        term_obj[pers] = "0";
        var pers_num_obj = {
            "filters": {
                "other_bucket_key": "non_zero",
                "filters": {
                    "zero": {
                        "term": term_obj
                    }
                }
            }
        };
        var pers_sum_obj = {
            "sum": {
                "field": pers
            }
        };
        // Total
        query_post["body"]["aggs"][pers_name + "_num"] = pers_num_obj;
        query_post["body"]["aggs"][pers_name + "_s_sum"] = pers_sum_obj;

        // By Month
        query_post["body"]["aggs"]["aggs_by_months"]["aggs"][pers_name + "_num"] = pers_num_obj;
        query_post["body"]["aggs"]["aggs_by_months"]["aggs"][pers_name + "_s_sum"] = pers_sum_obj;
    })

    // For issue_guy query
    if (res_body.issue_guy) {
        query_post["body"]["query"]["bool"]["must"].push({
            "multi_match": {
                "query": res_body.issue_guy,
                "type": "cross_fields",
                "fields": ["title", "newcontent_tag"],
            }
        });
    }

    return for_search(query_post);
}

exports.search_for_brands = search_for_brands;


function search_for_brands_with_articles(res_body) {

    var query_post = gen_query_post(res_body, brand_min_score, 20000);
    query_post["body"]["query"]["bool"]["filter"].push({
        "term" : { "industry" : res_body.industry }
    });
    query_post["body"]["_source"] = ["title", "author", "time", "website",
        "url", "content_semantic_*", "volume", "field"
    ];

    // For Mammon , Samael_chart , Belphegor_chart
    if (res_body.focus) {
        query_post["body"]["query"]["bool"]["must"].push({
            "multi_match": {
                "query": res_body.focus,
                "type": "cross_fields",
                "fields": ["title", "newcontent_tag"],
            }
        });
    }

    if (res_body.chart_mode == "Mammon") {
        query_post["body"]["size"] = 100;
    }

    if (res_body.chart_mode == "Belphegor") {
        query_post["body"]["size"] = 0;
        query_post["body"]["aggs"] = {
            "emotion_terms": {
                "terms": {
                    "field": "content_semantic_tag",
                    "exclude": "neu"
                },
                "aggs": {
                    "post_ele": {
                        "top_hits": {
                            "_source": ["url", "title", "author", "field", "time",
                                "website", "volume", "content_semantic_*"
                            ],
                            "size": 30
                        }
                    }
                }
            }
        }
    }

    return for_search(query_post);
}

exports.search_for_brands_with_articles = search_for_brands_with_articles;

function search_for_brands_with_fptree(res_body) {
    var query_post = gen_query_post(res_body, 0.7, brand_size);
    query_post["body"]["query"]["bool"]["filter"].push({
        "term" : { "industry" : res_body.industry }
    });
    query_post["body"]["_source"] = ["content_keywords", "content_wordcount"];
    return for_search(query_post);
}

exports.search_for_brands_with_fptree = search_for_brands_with_fptree;

function search_for_brands_with_Lucifer(res_body) {
    var query_post = gen_query_post(res_body, 0.7, brand_size);
    query_post["body"]["query"]["bool"]["filter"].push({
        "term" : { "industry" : res_body.industry }
    });
    query_post["body"]["_source"] =  ["time", "newcontent_tag"];
    query_post["body"]["aggs"] = {
        "time_group": {
            "date_histogram": {
                "field": "time",
                "interval": "month",
                "format": "YYYY-MM"
            },
            "aggs": {
                "volume_sum": {
                    "sum": {
                        "field": "volume"
                    }
                }
            }
        }
    };
    return for_search(query_post);
}

exports.search_for_brands_with_Lucifer = search_for_brands_with_Lucifer;

///////////////////////////       Brand      ///////////////////////////
