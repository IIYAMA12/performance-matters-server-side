module.exports = (function () {
    const fetch = require("fetch");
    const mapBox = require('mapbox');
    const fetchUrl = fetch.fetchUrl;

    const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

    const mapManagement = {
        init() {
            this.map.init();
        },
        map: {
            init () {
                mapManagement.mapBox = mapBox;
                mapManagement.client = new mapManagement.mapBox("pk.eyJ1IjoiaWl5YW1hIiwiYSI6ImNqZWZxM3AwOTFoMTgycXBrZWo5NGF6eWoifQ.8bABDvjASinWudt00f0Oxg");
                console.log(mapManagement.client);

                mapManagement.client.geocodeForward('Chester, NJ')
                // mapManagement.client.geocodeForward('Chester, NJ')
                // .then(function(res) {
                //     // res is the http response, including: status, headers and entity properties
                //     var data = res.entity; // data is the geocoding result as parsed JSON
                //     this.load.map();
                //     console.log("geocodeForward", res);
                    
                // })
                // .catch(function(err) {
                //     // handle errors
                // });

                

                const initialMapPoint = [4.899431, 52.379189];
                this.load.data(initialMapPoint[0], initialMapPoint[1]);
            },
    
            layers: [],
            streetIndex : 0,
    
            load: {
                data (lng, lat) {
    
                    ////////////////////////////
                    // sprankelende query !!! //
    
                    const sparqlquery = `
                        PREFIX hg: <http://rdf.histograph.io/>
                        PREFIX geo: <http://www.opengis.net/ont/geosparql#>
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    
                        SELECT DISTINCT ?street ?size ?streetgeom ?streetName ?hasEarliestBeginTimeStamp  WHERE {
                            ?street rdf:type hg:Street .
                            ?street geo:hasGeometry/geo:asWKT ?wkt .
                            ?street <http://www.w3.org/2000/01/rdf-schema#label> ?streetName .
                            BIND (bif:st_geomfromtext(?wkt) as ?streetgeom) .
                            BIND (bif:st_geomfromtext("POINT(` + lng + ` ` + lat + `)") as ?point) .
    
                            FILTER (!REGEX(?wkt, 'Array')) .
    
                            BIND(bif:st_get_bounding_box(?streetgeom) as ?boundingBox ) .
                            BIND(((bif:ST_XMax (?boundingBox) - bif:ST_XMin(?boundingBox)) + (bif:ST_YMax (?boundingBox) - bif:ST_YMin(?boundingBox)))  as ?size) .
    
                            OPTIONAL {
                                ?street <http://semanticweb.cs.vu.nl/2009/11/sem/hasEarliestBeginTimeStamp> ?hasEarliestBeginTimeStamp .
                            } .
    
    
                            FILTER (bif:st_may_intersect (?point, ?streetgeom, 0.006)) .
    
    
    
                        }
                        ORDER BY (?size)
                        LIMIT 500
                    `;
    
                    // FILTER(?size < "0.001"^^xsd:double) .
                    // FILTER(?size > "0.0003"^^xsd:double)
                    // BIND(bif:GeometryType(?streetgeom) as ?streetDatatype) .
    
    
                    // console.log(sparqlquery);
    
                    ///////////////////////////////////////
                    // encode to uri and prepare the url //
                    const encodedquery = encodeURIComponent(sparqlquery);
    
                    const queryurl = 'https://api.data.adamlink.nl/datasets/AdamNet/all/services/hva2018/sparql?default-graph-uri=&query=' + encodedquery + '&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on';
                    
                    ////////////////////////////////////////////////////////////////////////////////////////////////
                    //updated version: https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql
    

    
                    
                    
                    //////////////////////////
                    // using XMLHttpRequest //

                    const httpRequest = new XMLHttpRequest();

                    httpRequest.open("GET", queryurl);

                    httpRequest.addEventListener("load", function (e) {
                        // console.log("load", this);
                    });

                    httpRequest.send();

                    /////////////////
                    // using Fetch //

                    // fetchUrl(queryurl, function (error, meta, body) {
                    //     if (error == undefined) {
                    //         console.log(body, body.toString(), "???");
                    //         // body = JSON.parse(body);
                    //         // console.log(body);
                    //     } else {
                    //         console.log("Error: fetchURL failed");
                    //     }
                    // });

                    // .then((resp) => resp.json()) // transform the data into json
                    // .then(function(data) {
                    //     app.map.render(app.map.filter(data));
                    // })
                    // .catch(function(error) {
                    //     // if there is any error you will catch them here
                    //     console.error(error);
                    // });


                },
                map () {
                    // this.mapBox.accessToken = "pk.eyJ1IjoiaWl5YW1hIiwiYSI6ImNqZWZxM3AwOTFoMTgycXBrZWo5NGF6eWoifQ.8bABDvjASinWudt00f0Oxg";
                    // console.log("make map melement", this);
                    // this.map.element = new this.mapBox({
                    //     container: 'map',
                    //     // style: 'mapbox://styles/mapbox/dark-v9',
                    //     style: "mapbox://styles/iiyama/cjehnbdnk33n52rqwj0q1xtkj",
                    //     center: [4.899431, 52.379189],
                    //     zoom: 14
                    // });
                    // this.map.element.addControl(new MapboxGeocoder({
                    //     accessToken: this.mapBox.accessToken
                    // }));
                }
            },
    
            filter (data) {
                const results = data.results;
                let bindings = results.bindings;
    
                bindings = bindings.filter(function (d) {
                    if (d != undefined && d.size != undefined && d.size.value != undefined) {
                        return true;
                    }
                    return false;
                });
    
                bindings = bindings.filter(function (d) {
                    return d.size.value < 0.006;
                });
    
                results.bindings = bindings;
                return data;
            },
    
            render (data) {
                if (true) {
                    return false;
                }
                const results = data.results;
                const bindings = results.bindings;
    
    
    
    
                const minSize = bindings.reduce(function (acc, cur, index) {
                    return Math.min(cur.size.value, acc );
                }, Infinity);
    
                const maxSize = bindings.reduce(function (acc, cur, index) {
                    return Math.max(cur.size.value, acc );
                }, -Infinity);
    
    
    
    
                ////////////////////////
                // Re-use-able object //
                //* Which will increase the load speed
    
                const reUseAbleLayerData = {
                    "id": null,
                    "type": "line",
                    "interactive": true,
                    "source": {
                        "type": "geojson",
                        "data": {
                            "type": "Feature",
                            "properties": {
                                "customStreet": true
                            },
                            "geometry": {
                                "type": "LineString",
                                "coordinates": null
                            }
                        }
                    },
                    "layout": {
                        "line-join": "round",
                        "line-cap": "round"
                    },
                    "paint": {
                        "line-color": "white",
                        "line-width": 5, // 5
                        "line-color-transition": {
                          "duration": 700,
                          "delay": 0
                        }
                    }
                };
    
                // dynamic components //
                const dynamicObjects = {
                    geometry: reUseAbleLayerData.source.data.geometry,
                    paint: reUseAbleLayerData.paint,
                    properties: reUseAbleLayerData.source.data.properties
                };
    
    
                ///////////////////////
                // clean up old data //
                if (app.map.element != undefined) {
                    // console.log(app.map.element);
    
    
                    const layers =  app.map.layers;
                    // console.log(layers);
                    for (var i = 0; i < layers.length; i++) {
                        app.map.element.removeLayer(layers[i].id);
                    }
                    app.map.layers = [];
                }
    
                for (let i = 0; i < bindings.length; i++) {
                    const binding = bindings[i];
                    if (binding.streetgeom != undefined) {
    
                        const size = binding.size.value;
                        let street = binding.streetgeom.value;
                        if (street != undefined) {
    
                            if (street.includes("MULTILINESTRING((") || street.includes("LINESTRING(")) {
    
                                /////////////////////////
                                // prepare for GEOJSON //
    
                                street = street.replace("MULTILINESTRING((", "");
                                street = street.replace("LINESTRING(", "");
                                street = street.replace(")", "");
                                const pointsAsString  = street.split(",");
    
    
                                let points = pointsAsString.map(function (d) {
                                    const point = d.split(" ");
                                    point[0] = parseFloat(point[0]);
                                    point[1] = parseFloat(point[1]);
                                    return point;
                                });
    
                                // check for corrupted points
                                points = points.filter(function (d) {
                                    return typeof(d[0]) == "number" && !isNaN(d[0]) && typeof(d[1]) == "number" && !isNaN(d[1]);
                                });
    
    
                                ////////////////
                                // apply data //
                                const layerId = "street:" + this.streetIndex;
                                // console.log(layerId);
                                reUseAbleLayerData.id = layerId;
                                this.streetIndex++;
    
                                dynamicObjects.geometry.coordinates = points;
    
                                // const factor = (size - minSize) / (maxSize - minSize);
                                // dynamicObjects.paint["line-color"] = app.utility.rgbToHex(Math.floor(factor * 200), Math.floor((1 - factor) * 200), 0);
    
                                dynamicObjects.properties.streetName = binding.streetName;
    
                                // console.log(binding.street);
                                if (binding.street != undefined)  { // && typeof(binding.street) == "string")
                                    console.log("uri", typeof(binding.street));
                                    dynamicObjects.properties.uri = binding.street; //
                                }
    
                                if (binding.hasEarliestBeginTimeStamp != undefined)  {
    
                                    dynamicObjects.properties.hasEarliestBeginTimeStamp = binding.hasEarliestBeginTimeStamp; //
                                }
    
    
    
    
                                ///////////////
                                // add layer //
    
                                app.map.element.addLayer(reUseAbleLayerData);
    
                                const layers =  app.map.layers;
                                layers[layers.length] = {id: layerId};
    
                            } else {
                                console.error("Unknown geo data");
                            }
                        }
                    }
                }
            }
        },
        utility: {
            componentToHex(c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            },
            rgbToHex(r, g, b) {
                return "#" + app.utility.componentToHex(r) + app.utility.componentToHex(g) + app.utility.componentToHex(b);
            }
        }
    };


    
    mapManagement.init();

    console.log(mapManagement.client);
    
    console.log("this script also started");
    
    return mapManagement;
})();