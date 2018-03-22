
const express = require('express');
const router = express.Router();
const fetch = require("fetch");
const fetchUrl = fetch.fetchUrl;
const mapManagement = require("../../scripts/mapManagement");
const session = require("express-session");


router.get("/street-info/:uri", function(req, res, next) {
    
    const uri = req.params.uri;
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

        const streetsData = mapManagement.map.render(mapManagement.map.data);

        fetchUrl(queryurl, function (error, meta, body) {
            
            if (error == undefined) {
                const photosData = body.toString();
                req.session.cookie.photosData = photosData;
            }
            res.redirect("../../");
        });
    }
});

module.exports = router;