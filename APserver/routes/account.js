var mongoose = require("mongoose");

var user_schema= new mongoose.Schema({
		username : String,
		password : String,
		userlevel : String,
        expiry_date : Date
	},
	{collection : "eyesocial"} // We must add this for stupid mongoose
);

module.exports =  mongoose.model("user_schema",user_schema);


