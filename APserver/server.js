const express = require('express');
const app = express();

// Import Modules
const hbs = require("hbs");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const redisStore = require("connect-redis")(session);

// Setting Routers
const router = require("./routes/index");
const users = require("./routes/users_check");
const soap = require("./routes/soap");
const brands = require("./routes/brands_girl");


// New Template Engine
app.engine('html',hbs.__express);

// Setting static files root dir.

app.use(express.static(path.join(__dirname , '/public')));

// Setting View engine & View dir
app.set("views" , path.join(__dirname , "views"));
app.set("view engine" , "html");

// Setting Middleware
// set limit:"50mb" to control req.body object size.
// set parameterLimit : "10000" to control req.body object term number.
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( {
		extended : false ,
		limit : "20mb",
		parameterLimit : '10000'
} ) );

// Use Cookie Parser
// Add secret for signed-cookie

app.use(cookieParser("Hail HydraQQQQ"));

// Use Session
app.use(session({
    store : new redisStore({
		host:"R_Server",
		port:6379
	}) ,
    secret : "Hail HydraQQQQ" ,
    resave : true,
    saveUninitialized : false,
    name:"_eye_s_id",
}))

// Use Routers
app.use('/' , router);
app.use('/soap' , soap);
app.use('/brands' , brands);
app.use('/users',users);

app.listen(32767,function(){
	console.log("Server is running at : localhost:32767");

});
