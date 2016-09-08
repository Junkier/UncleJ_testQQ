const express = require("express");
var users = express.Router();

// require mongoose , passport , crypto to check member identity
const crypto = require("crypto");
const mongoose = require("mongoose");
const GoalKeeper = require("./goal_keeper");
const User_account = require("./account");
const Passport = require("passport");
const LocalStrategy = require("passport-local").Strategy ;

////////////////////////  Passport + Mongoose /////////////////////////////

mongoose.set('debug', true);
mongoose.connect('mongodb://192.168.142.66/member_control');
var db_m = mongoose.connection;

db_m.once('open',function(){
	console.log("member_DB connection succeed.");
})


var localStrategy = new LocalStrategy({
		usernameField : "username" ,  // depend on HTML input name.
		passwordField : "password" ,
		passReqToCallback : true
	},
	function (req , username , password , done){
		User_account.find({"username" : username}, function(err,docs){
			var user = docs[0];
			 /* use sha1 to do hash , then get hex code. */
			var password_sha = crypto.createHash("sha1")
									 .update(password)
									 .digest("hex");
			if ( user == null ){
				console.log("no this user.");
				return done(null , false ,{ message : "Invalid username." }) ;
			}

			if ( user["password"] !== password_sha){
				console.log("keyword is wrong.");
				return done(null , false , { message : "Invalid password."});
			}

			return done(null , user);
			})
	}
)

////////////////////////  Passport + Mongoose  ////////////////////////

////////////////////////   local version   ////////////////////////
// var local_user_count = {
//     "testQQ" : {
//         "userlevel" : "high" ,
//         "username" : "testQQ" ,
//         "password" : crypto.createHash("sha1")
// 									 .update("testQQ")
// 									 .digest("hex"),
//         "expiry_date" : new Date("2066-06-28 21:51")
//     },
//     "jeff" : {
//         "userlevel" : "high" ,
//         "username" : "0516QQ" ,
//         "password" : crypto.createHash("sha1")
// 									 .update("0516QQ")
// 									 .digest("hex"),
//         "expiry_date" : new Date("2066-06-28 21:51")
//     }
// };
//
//
// var localStrategy = new LocalStrategy({
// 		usernameField : "username" ,
// 		passwordField : "password" ,
// 		passReqToCallback : true
// 	},
// 	function (req , username , password , done){
//
// 			var user = local_user_count[username];
//
// 			var password_sha = crypto.createHash("sha1")
// 									 .update(password)
// 									 .digest("hex");
// 			if ( user == null ){
// 				console.log("no this user.");
// 				return done(null , false ,{ message : "Invalid username." }) ;
// 			}
//
// 			if ( user["password"] !== password_sha){
// 				console.log("keyword is wrong.");
// 				return done(null , false , { message : "Invalid password."});
// 			}
//
// 			return done(null , user);
//
// 	}
// )
////////////////////////   local version   ////////////////////////

// Add this strategy into Passport.
Passport.use( "local" , localStrategy);
users.use( Passport.initialize() ) ;

////////////////////////   Express-Session version.   ////////////////////////

users.get("/" , function(req,res,next){
    if( GoalKeeper.logined_check(req) ) {
		res.render("Soap_entrance" , {
            "user_name_QQ" : req.session.user_name ? req.session.user_name.split("@")[0] : "訪客"
        });
	} else {
        res.render("Soap_entrance");
	}
})

users.post("/login_check"
	// , Passport.authenticate("local" ,{ successRedirect: '/users/login_success',
                                       // failureRedirect: '/users/login_err' } )
	, Passport.authenticate("local" ,{session : false , failureRedirect: '/users/login_err/user_err' } )
	, function(req,res){
        // 使用權限時間check，之後寫在 passport 裡
        if( !GoalKeeper.e_time_check(req.user.expiry_date)){
            res.redirect("/users/login_err/time_out");
        } else{
            var l_time = req.body.username == "guest" ? 1*24*60*60*1000 : 30*24*60*60*1000;
            req.session.isLogined = 1;
            req.session.user_name = req.body.username ;
            req.session.userlevel = req.user.userlevel;
            req.session.expiry_date = req.user.expiry_date;
            req.session.cookie.maxAge = l_time;
            res.cookie("user_name" , req.body.username , {maxAge :  l_time });
            res.redirect("/users");
        }

});

// Error Handler.
users.get("/login_err/:error_type" , function(req,res){
    var e_type = req.params.error_type;
    var e_message;
    if( e_type == "user_err"){
        e_message = "登入錯誤，請重新嘗試。";
    } else if (e_type == "not_login"){
        e_message = "請登入後操作。";
    } else if (e_type == "time_out"){
        e_message = "您的帳號已到期。";
    } else if (e_type == "level_down"){
        e_message = "抱歉，您的權限不足。";
    }

    res.render("errorQQ" , { "err_message" : e_message });

})

// Logout and remove cookie.
users.get("/logout" , function(req,res){
    req.session.destroy();
    // res.clearCookie("_eye_s_id");
    // res.clearCookie("isLogined");
	res.clearCookie("user_name");
	res.render("logoutQQ");
})

////////////////////////   Express-Session version.  ////////////////////////


////////////////////////   Signed-Cookie version.    ////////////////////////

/*

// check user is logined or not
// req.cookies : normal cookie.
// req.signedCookies : signed cookie.
users.get("/" , function(req,res,next){
	if (req.signedCookies.isLogined){
		res.render("Soap_entrance" , {  "user_name_QQ" : req.cookies.user_name ? req.cookies.user_name.split("@")[0] : "訪客"});
	} else {
		next();
	}
})

users.get("/" , function(req,res,next){
	 res.render("User_Login");
})

users.post("/login_check"
	// , Passport.authenticate("local" , { session : false } )
	// , Passport.authenticate("local" ,{ successRedirect: '/users/login_success',
                                       // failureRedirect: '/users/login_err' } )
	, Passport.authenticate("local" ,{session : false , failureRedirect: '/users/login_err' } )
	, function(req,res){
		var l_time = req.body.username == "guest" ? 2*60*60*1000 : 30*24*60*60*1000;
			res.cookie("isLogined" , 1 , {maxAge :  l_time ,signed:true});
			res.cookie("user_name" , req.body.username , {maxAge :  l_time });
			res.cookie("userlevel" , req.user.userlevel , {maxAge : l_time , signed : true});
		res.redirect("/users");
});


users.get("/login_err" , function(req,res){
	res.send("登入錯誤，請重新嘗試");
})

// Logout and remove cookie.
users.get("/logout" , function(req,res){
	res.clearCookie("isLogined");
	res.clearCookie("user_name");
	res.clearCookie("userlevel");
	res.render("LogoutQQ");
})

*/

////////////////////////   Signed-Cookie version.   ////////////////////////

module.exports = users ;
