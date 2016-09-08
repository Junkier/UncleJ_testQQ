function index10_relationIssue(data){
	d3.selectAll('.Index10_Chart svg').selectAll('*').remove();

    $('.Index10_Chart .vz-weighted_tree-viz').remove();
	$('#viz_container10').html('');

	if(data["FPtreeErr"]){
		$('#viz_container10').html('此關鍵字無關聯詞，請重新搜尋。');
		return;
	}
	var FPdata = data["FPtree"];

	FP_data_funcQQ(FPdata , 'viz_container10');
}

var viz_container_10; // html element that holds the chart
var viz_10; // our weighted tree
var theme_10; // our theme
var data_10 = {}; // nested data
var valueField = "weight"; // stores the currently selected value field
var valueFields = ["weight"]; // var valueFields = ["Federal", "State", "Local"];

function FP_data_funcQQ(FP_data, _id) {
    var screenWidth;
    var screenHeight;
    var rect;

    if (self == top) {
        rect = document.body.getBoundingClientRect();
    } else {
        rect = document.body.getBoundingClientRect();
    }

    // Set display size based on window size.
    screenWidth = (rect.width < 960) ? Math.round(rect.width * .95) : Math.round((rect.width - 210) * .95);

    screenHeight = 550;

    d3.select("#currentDisplay")
        .attr("item_value", screenWidth + "," + screenHeight)
        .attr("class", "selected")
        .html("<a>" + screenWidth + "px - " + screenHeight + "px</a>");

    $("#cssmenu").menumaker({
        title: "VIZULY WEIGHTED TREE",
        format: "multitoggle"
    });


    // Set the size of our container element.
    viz_container_10 = d3.selectAll("#" + _id)
        .style("width", screenWidth + "px")
        .style("height", screenHeight + "px");

	// J.V
	// Set the size of our container element.
	// viz_container_10 = d3.selectAll("#" + _id)
	// 				 	 .style("width", screenWidth + "px")
    //                      .style("height", screenHeight + "px");

	loadData(FP_data , _id);

};

function loadData(F_data, _id) {
    data_10.values = prepData(F_data);
    initialize(_id);
}

function prepData(FP) {
    var values = [];

    //Clean federal budget data and remove all rows where all values are zero or no labels
    FP.forEach(function(d, i) {
        var t = 0;
        for (var i = 0; i < valueFields.length; i++) {
            t += Number(d[valueFields[i]]);
        }
        if (t > 0) {
            values.push(d);
        }
    })

	// get Level1 weight.
	var Level1_obj = {};
	FP.filter(function(ele){
		return ele["Level2"].length == 0;
	}).map(function(ele){
		Level1_obj[ele["Level1"]] = ele["weight"];
	})

    //Make our data into a nested tree.  If you already have a nested structure you don't need to do this.
    var nest = d3.nest()
        .key(function(d) {
            return d.Level1;
        })
        .key(function(d) {
            return d.Level2;
        })
        .entries(values);

    //This will be a viz.data function;
    vizuly.data.aggregateNest(nest, valueFields, function(a, b) {
        return Number(a) + Number(b);
    });


	// change agg_weight to Level1 weight.
	nest.map(function(ele){
		ele["agg_weight"] = Level1_obj[ele["key"]];
	});
	nest.sort(function(a,b){
		return -( a["agg_weight"] - b["agg_weight"]);
	})

    // Remove empty child nodes left at end of aggregation and add unqiue ids
    function removeEmptyNodes(node, parentId, childId) {
        if (!node) return;
        node.id = parentId + "_" + childId;
        if (node.values) {
            for (var i = node.values.length - 1; i >= 0; i--) {
                node.id = parentId + "_" + i;
                if (!node.values[i].key && !node.values[i].Level4) {
                    node.values.splice(i, 1);
                } else {
                    removeEmptyNodes(node.values[i], node.id, i)
                }
            }
        }
    }

    var node = {};
    node.values = nest;
    removeEmptyNodes(node,"0","0");

    return nest;
}

function initialize(_id) {

    viz_10 = vizuly.viz.weighted_tree(document.getElementById(_id));
    //Here we create three vizuly themes for each radial progress component.
    //A theme manages the look and feel of the component output.  You can only have
    //one component active per theme, so we bind each theme to the corresponding component.
    theme_10 = vizuly.theme.weighted_tree(viz_10).skin(vizuly.skin.WEIGHTED_TREE_AXIIS);

    //Like D3 and jQuery, vizuly uses a function chaining syntax to set component properties
    //Here we set some bases line properties for all three components.
    viz_10.data(data_10) // Expects hierarchical array of objects.
        .width(600) // Width of component
        .height(600) // Height of component
        .children(function(d) {
            return d.values }) // Denotes the property that holds child object array
        .key(function(d) {
            return d.id }) // Unique key
        .value(function(d) {
            var KKnum = Number(d["agg_" + valueField]);
            if (isNaN(KKnum)) {
                KKnum = 0
                return KKnum;
            }
            return KKnum;
        })
        .fixedSpan(-1) // fixedSpan > 0 will use this pixel value for horizontal spread versus auto size based on viz width
        .label(function(d) { // returns label for each node.
            return trimLabel(d.key || d['Level' + d.depth])
        })
        // .on("measure",onMeasure)                                        // Make any measurement changes
        .on("mouseover", onMouseOver) // mouseover callback - all viz components issue these events
        .on("mouseout", onMouseOut) // mouseout callback - all viz components issue these events
        .on("click", onClick); // mouseout callback - all viz components issue these events

    //We use this function to size the components based on the selected value from the RadiaLProgressTest.html page.
    // changeSize(d3.select("#currentDisplay").attr("item_value"));
    changeSize("1000, 600");


    // Open up some of the tree branches.

    if(data_10.values[1]){ viz_10.toggleNode(data_10.values[1])};

	// Add title text.
	d3.select('.Index10_Chart svg')
	  .append("text")
	  .attr({
		  "x" : d3.transform(d3.select(".vz-weighted_tree-plot").attr("transform")).translate[0] + d3.transform(d3.select(".vz-id-undefined").attr("transform")).translate[0]-55 ,
		  "y" : d3.transform(d3.select(".vz-weighted_tree-plot").attr("transform")).translate[1] + d3.transform(d3.select(".vz-id-undefined").attr("transform")).translate[1]+30
	  })
	  .text($("input[name='keyword']").val())
	  .attr("id", "Index10_jeff_Leo")
	  .attr("font-size" , "22px")
	  .attr("fill", "#000");

	// resize path ??
	// setTimeout(function(){
		// d3.selectAll(".vz-weighted_tree-link")
		  // .style("stroke-width",20);
	// },1000);

}

// This function uses the above html template to replace values and then creates a new <div> that it appends to the
// document.body.  This is just one way you could implement a data tip.

function createDataTip(x,y,h1,h2,h3) {

	var datatip='<div class="vz-weighted_tree-tip" style="width: 250px; background-opacity:.5">' +
		'<div class="header1">HEADER1</div>' +
		'<div class="header-rule"></div>' +
		'<div class="header2"> HEADER2 </div>' +
		'<div class="header-rule"></div>' +
		'<div class="header3"> HEADER3 </div>' +
		'</div>';

    var html = datatip.replace("HEADER1", h1)
					  .replace("HEADER2", h2)
					  .replace("HEADER3", h3 >=0.2 ? "強關聯" : (h3 <= 0.1 ? "弱關聯" : "次關聯"));

    d3.select("body")
        .append("div")
        .attr("class", "vz-weighted_tree-tip")
        .style("position", "fixed")
        .style("z-index", 100)
        // .style("top", y + "px")
        // .style("left", (x + 25) + "px")
		.style("top","170px")
        .style("left", "1100px")
        .style("opacity",0)
        .html(html)
        .transition().style("opacity", 1);

}

function onMouseOver(e, d, i) {
    if (d == data_10 || d.target) return;
    var rect = e.getBoundingClientRect();
    // if (d.target) d = d.target; //This if for link elements
    createDataTip(rect.left, rect.top, (d.key || d['Level' + d.depth]),"關聯度",formatCurrency(d["agg_" + valueField]));

}

function onMouseOut(e, d, i) {
    d3.selectAll(".vz-weighted_tree-tip").remove();
}

//We can capture click events and respond to them
function onClick(g, d, i) {

    viz_10.toggleNode(d);

	// reposition title text.
	setTimeout(function(){
		d3.select('#Index10_jeff_Leo')
		  .transition()
		  .attr({
			"x" : d3.transform(d3.select(".vz-weighted_tree-plot").attr("transform")).translate[0] + d3.transform(d3.select(".vz-id-undefined").attr("transform")).translate[0]-55 ,
			"y" : d3.transform(d3.select(".vz-weighted_tree-plot").attr("transform")).translate[1] + d3.transform(d3.select(".vz-id-undefined").attr("transform")).translate[1]+30
		  })
	},500);

	// use Index2 gen table function.
	// Only Level2 node can gen table.

	d.values == 0 && (function(){
		var focus_word ;
		// d.key - 按到的字
		// d.childProp_Level1 - Level 1 字
		// d.childProp_word   - Level 0 字
		if(d.childProp_Level2){
			focus_word=d.childProp_Level1 + " " + d.key;
		} else {
			focus_word=d.key;
		}

		var query_p = gen_query_post();
		query_p["focus_word"] =focus_word;
		go_ajax({
			url : '/soap/give_me_articles',
			q_data : query_p,
			time_limit : 60000
		}).done(function(result){
			genTable_Castle_in_the_sky(result,query_p["keyword"],query_p["focus_word"]);
		}).fail(function(err){
			alert("文章不科學，按其他關鍵字吧");
		})
	})();
}

//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
    // test = false;
    var s = String(val).split(",");
    viz_container_10.transition().duration(300).style('width', s[0] + 'px').style('height', s[1] + 'px');
    viz_10.width(s[0]).height(s[1] * .8).update();
}

// Tool function.
function formatCurrency(d) {
	if (isNaN(d)) d = 0; return d3.format(",.4f")(d) ;
};

function trimLabel(label) {
   return (String(label).length > 20) ? String(label).substr(0, 17) + "..." : label;

}
