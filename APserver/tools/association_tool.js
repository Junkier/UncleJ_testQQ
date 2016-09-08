var PythonShell = require("python-shell");

function FptreeQQ_for_soap(raw_data,callback){

	// raw_data = {"fp_raw_data" : fptree_raw_data , "keyword" : req.body.keyword}
	// send data by stdin in json.
	var pyshell  = new PythonShell('/tools/FPTreeGuy_for_Soap_Py.py', {mode:"json" });
	pyshell.send(raw_data);

	var results ;

	// If we get data from .py stdin , then we print it.
	pyshell.on('message' , function(message){
		results = message ;
	});

	// If we get error from .py stderr , then we print it.
	pyshell.on('error' , function(err){
		console.log(err["traceback"]);
	})

	// Like Finally block in try-catch.
	pyshell.end(function(){
		callback(results);
	})
}
exports.FptreeQQ_for_soap = FptreeQQ_for_soap;

function FptreeQQ_for_brands(merged_data,callback){

	// merged_data = { "mergedQQ" : good_array , "brand": "台灣大哥大 台灣大 台哥大 台哥" }
	// send data by stdin in json.
	var pyshell  = new PythonShell('/tools/FPTreeGuy_for_Brands_Py.py', {mode:"json" });
	pyshell.send(merged_data);

	var results ;

	// If we get data from .py stdin , then we print it.
	pyshell.on('message' , function(message){
		results = message ;
	});

	// If we get error from .py stderr , then we print it.
	pyshell.on('error' , function(err){
		console.log(err["traceback"]);
	})

	// Like Finally block in try-catch.
	pyshell.end(function(){
		callback(results);
	})
}
exports.FptreeQQ_for_brands = FptreeQQ_for_brands;

function Pmi_corQQ_for_brands(merged_data,callback){

	// merged_data = { "merged_r_d" : good_array , "brands": chosen_brands }
	// send data by stdin in json.

	var pyshell  = new PythonShell('/tools/PMIGuy_for_Brands_Py.py', {mode:"json" });
	pyshell.send(merged_data);
	var results ;

	// If we get data from .py stdin , then we print it.
	pyshell.on('message' , function(message){
		results = message ;
	});

	// If we get error from .py stderr , then we print it.
	pyshell.on('error' , function(err){
		console.log(err["traceback"]);
	})

	// Like Finally block in try-catch.
	pyshell.end(function(){
		callback(results);
	})

}
exports.Pmi_corQQ_for_brands = Pmi_corQQ_for_brands;
