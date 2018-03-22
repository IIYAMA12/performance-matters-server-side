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
            const client = mapManagement.client = new mapBox("sk.eyJ1IjoiaWl5YW1hIiwiYSI6ImNqZXpyNWpzdjBjeGUycXQwN3VmMjFnczYifQ.Kj28oQdiRPO-YG0LpSsqOw");




            const initialMapPoint = [4.899431, 52.379189];
            this.load.data(initialMapPoint[0], initialMapPoint[1]);
        },
        streetIndex : 0,
        data: {

        },
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


                        FILTER (bif:st_may_intersect (?point, ?streetgeom, 0.01)) .



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

                // const httpRequest = new XMLHttpRequest();

                // httpRequest.open("GET", queryurl);

                // httpRequest.addEventListener("load", function (e) {
                //     // console.log("load", this);
                // });

                // httpRequest.send();

                /////////////////
                // using Fetch //

                fetchUrl(queryurl, function (error, meta, body) {
                    if (error == undefined) {
                        // console.log(body, body.toString();
                        // body = JSON.parse(body);
                        // console.log(body);
                        // mapManagement.map.render(JSON.parse(body.toString())); mapManagement.map.render();
                        mapManagement.map.data = JSON.parse(body.toString());
                    } else {
                        console.log("Error: fetchURL failed");
                    }
                });



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
        
        makeArea (points, streetName, uri) {
            // image size: 782 × 855
            const 
                imageX = 782,
                imageY = 855
            ;
            
            let coord = ",";
            let polylineCoord = " ";
            
            const coordBoundingMinX = 4.8826511004105555
            const coordBoundingMinY = 52.36798838874884

            const coordBoundingMaxX = 4.916210899614015
            const coordBoundingMaxY = 52.390386770851705 

            const coordBoundingSizeX = coordBoundingMaxX - coordBoundingMinX
            const coordBoundingSizeY = coordBoundingMaxY  - coordBoundingMinY
            // console.log(coordBoundingSizeX, coordBoundingSizeY);
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                const nextPoint = points[i + 1];
                if (nextPoint != undefined) {


                    const line = [
                        {x: point[0] - coordBoundingMinX, y: point[1] - coordBoundingMinY},
                        {x: nextPoint[0] - coordBoundingMinX, y: nextPoint[1] - coordBoundingMinY}
                    ];
                    
                    const rotation = mapManagement.utility.findRotation(line[0].x,line[0].y,line[1].x,line[1].y);
                    const rotation2 = rotation + 360;


                    for (let lineIndex = 0; lineIndex < line.length; lineIndex++) {
                        const 
                            x = line[lineIndex].x,
                            y = line[lineIndex].y
                        ;

                        for (let offsetIndex = 0; offsetIndex < 2; offsetIndex++) { 
                            const rotOffset =  (rotation + (offsetIndex === 0 ? 90 : -90) * 3.141592653 * 2)/360;
                            
                            const offset = 0.0001;

                            let 
                                linePointX = x + Math.cos(rotOffset) * offset, 
                                linePointY = y + Math.sin(rotOffset) * offset
                            ;


                            linePointX = imageX * (linePointX / coordBoundingSizeX);
                            linePointY = (imageY * ((coordBoundingSizeY - linePointY) / coordBoundingSizeY));


                            
                            if (offsetIndex === 0) {
                                coord = "," + linePointX + "," + linePointY + coord;
                                polylineCoord = " " + linePointX + "," + linePointY + polylineCoord;
                            } else {
                                coord = coord + linePointX + "," + linePointY + ","
                                polylineCoord = polylineCoord + linePointX + "," + linePointY + " "
                            }
                        }
                    }
                }

                polylineCoord = polylineCoord.trim();
                coord = coord.slice(1, -1);
                return {areaElement: "<area shape=\"poly\" coords=\"" + coord + "\" alt=\"" + streetName.value + "\" href=\"" +  "/api/street-info/" + ( uri != undefined ? encodeURIComponent(uri.value) : "") + "\">", svgElement: "<polyline fill=\"none\" stroke=\"white\" points=\"" + polylineCoord + "\"/>"};
            }

        },
        render (data) {

            const results = data.results;
            const bindings = results.bindings;




            const minSize = bindings.reduce(function (acc, cur, index) {
                return Math.min(cur.size.value, acc );
            }, Infinity);

            const maxSize = bindings.reduce(function (acc, cur, index) {
                return Math.max(cur.size.value, acc );
            }, -Infinity);

            const streetsData = [];

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
                            
                            const streetData = {};
                            streetsData[streetsData.length] = streetData;
                            
                            if (binding.street != undefined)  {
                                streetData.uri = binding.street;
                            }

                            streetData.streetName = binding.streetName;
                            streetData.area = this.makeArea(points, streetData.streetName, streetData.uri );
                            ////////////////
                            // apply data //
                            const layerId = "street:" + this.streetIndex;
                            // console.log(layerId);
                            streetData.id = layerId;
                            this.streetIndex++;

                            streetData.coordinates = points;
                            
                            // const factor = (size - minSize) / (maxSize - minSize);
                            // dynamicObjects.paint["line-color"] = app.utility.rgbToHex(Math.floor(factor * 200), Math.floor((1 - factor) * 200), 0);

                            

                            // console.log(binding.street);


                            if (binding.hasEarliestBeginTimeStamp != undefined)  {
                                streetData.hasEarliestBeginTimeStamp = binding.hasEarliestBeginTimeStamp; //
                            }
                            
                        } else {
                            console.error("Unknown geo data");
                        }
                    }
                }
            }
            return streetsData;
        }
    },
    utility: {
        componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        },
        rgbToHex(r, g, b) {
            return "#" + app.utility.componentToHex(r) + app.utility.componentToHex(g) + app.utility.componentToHex(b);
        },
        findRotation( x1, y1, x2, y2 ) {
            let rotation = -(Math.atan2( x2 - x1, y2 - y1 ) * (180 / Math.PI) )
            return rotation < 0 ? rotation + 360 : rotation
        }
    }
};



mapManagement.init();



module.exports = mapManagement;