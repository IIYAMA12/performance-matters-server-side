// Request modules
const path = require("path"),
    express = require("express"),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    mapManagement = require("./scripts/mapManagement")
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
    const streetsData = mapManagement.map.render(mapManagement.map.data);
	res.render("index", {streetsData: streetsData});
});

// Define bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('public'));


// Routers
const routers = {
    path: "./routers",
    allData: [
        {
            path: "/api",
            fileName: "street-info"
        }
    ]
};


(function(){
    const path = routers.path;
    const allData = routers.allData;
    for (var i = 0; i < allData.length; i++) {
        const data = allData[i];
        var module = require(path + data.path + "/" + data.fileName);
        console.log(data.path, module);
        app.use(data.path, module);
       
        // app.use(app.router);
        // routes.initialize(app);
    }
})();


// Start server
app.listen(3000, function() {
    console.log("App listening at http://localhost:3000/");
});

