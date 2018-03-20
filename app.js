// Request modules
const path = require("path"),
    express = require("express"),
    bodyParser = require("body-parser"),
    session = require("express-session")
;

var sess = {
    secret: "xljOI#YXl`zizxgvisaki4ezln bs`yzld",
    cookie: {},
    resave: true,
    saveUninitialized: true
}


const app = express();

app.use(session(sess));


// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("*", function(req, res, next)    {
    
    // https://www.npmjs.com/package/express-session-expire-timeout
    var hours = 3;
    req.session.cookie.expires = new Date(Date.now() + (3600000 * hours));
    req.session.cookie.maxAge = hours;

    res.locals.lastURLTimeChange = new Date();

    next();
});


app.get("/", function(req, res, next) {
	res.render("/index");
});

// Define bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('public'));


// Start server
app.listen(3000, function() {
    console.log("App listening at http://localhost:3000/");
});
