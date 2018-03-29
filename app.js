// Request modules
const path = require("path"),
    express = require("express"),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    mapManagement = require("./scripts/mapManagement"),
    streetManagement = require("./scripts/streetManagement")
;

const fetch = require("fetch");
const fetchUrl = fetch.fetchUrl;

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
    // var hours = 3;
    // req.session.cookie.expires = new Date(Date.now() + (3600000 * hours));
    // req.session.cookie.maxAge = hours;

    // res.locals.lastURLTimeChange = new Date();

    next();
});


// Define bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));



app.post("/log", function (req, res, next) {
    console.log("req.body", req.body);
    next();
});

app.get("/", function (req, res, next) {

    console.log("??");
    
    
    const uri = req.query.uri;//req.params.uri;
    console.log("URI",uri);
    
    if (uri != undefined) {
        const sparqlquery = `
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>

            SELECT ?item ?img ?creator ?subject ?startYear WHERE {
                ?item dct:spatial <` + decodeURIComponent(uri) + `>  .
                ?item foaf:depiction ?img .
                optional {
                    ?item <http://purl.org/dc/elements/1.1/creator> ?creator .
                }
                optional {
                    ?item <http://purl.org/dc/elements/1.1/description> ?description .
                }
                optional {
                    ?item <http://purl.org/dc/elements/1.1/subject> ?subject .
                }
                optional {
                    ?item <http://semanticweb.cs.vu.nl/2009/11/sem/hasBeginTimeStamp> ?startYear .
                }
            }
            ORDER BY DESC(?startYear)
            LIMIT 100
        `;



        const encodedquery = encodeURIComponent(sparqlquery);

        const queryurl = 'https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=' + encodedquery + '&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on';


        fetchUrl(queryurl, function (error, meta, body) {
            if (error == undefined) {
                const photosData = body.toString();
                req.session.photosData = photosData;
            }
            const streetsData = mapManagement.map.render(mapManagement.map.data, req);
            res.render("index", {
                pageData:{ 
                    streetsData: streetsData!= undefined ? streetsData : [],
                    photoData: streetManagement.render(req.session.photosData)
                },
            });
        });
    } else {
        console.log("render this");
        
        const streetsData = mapManagement.map.render(mapManagement.map.data, req);
        res.render("index", {
                pageData:{ 
                    streetsData: streetsData != undefined ? streetsData : [],
                    photoData: streetManagement.render(req.session.photosData)
                },
            }
        );
    }
});




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

