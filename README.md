# performance-matters-server-side

This is a website which uses a click able map to show street images.

[Service-worker](AUDIT.md)

## Routers
```JS
// Routers
const routers = {
    path: "./routers", // Where are the routers located?
    allData: [ // List of routers.
        {
            path: "/api", // Sub paths?
            fileName: "street-info"
        }
    ]
};


(function(){
    const path = routers.path;
    const allData = routers.allData;
    for (var i = 0; i < allData.length; i++) {
        const data = allData[i];
        var module = require(path + data.path + "/" + data.fileName); // Import the module
        app.use(data.path, module); // Give it to the app created by express.
    }
})();
```
Prepare and add the routers.


```JS
const express = require('express'); // Get express.
const router = express.Router(); // Make a router with express.

module.exports = router; // Turn it in to a module.
```
Turn `street-info.js` in to a router.




## Street selection boundingbox calculations
![Boundingbox calculation](readme-content/boundingboxCalc.png)

The street geo has multiple points. But to keep it simple, I will explain how it works with 2 points.

1. Start and end point.
2. Calculate the rotation between the points.
```JS
function findRotation( x1, y1, x2, y2 ) {
    let rotation = -(Math.atan2( x2 - x1, y2 - y1 ) * (180 / Math.PI) )
    return rotation < 0 ? rotation + 360 : rotation
}
```
[Lua find rotation function](https://wiki.multitheftauto.com/wiki/FindRotation)

3. Add and subtract 90 degrees.
4. Calcutate the offset, which will give you 2 extra positions. If you do that for both points, you will have 4 positions, which can be seen as a boundingbox.
```JS
const rotOffset =  (rotation + (offsetIndex === 0 ? 90 : -90) * 3.141592653 * 2)/360;

const offset = 0.0001;

let 
    linePointX = x + Math.cos(rotOffset) * offset, 
    linePointY = y + Math.sin(rotOffset) * offset
;
```

## Render the streets

<details>
<summary>Background map</summary>
<img src="https://raw.githubusercontent.com/IIYAMA12/performance-matters-server-side/master/readme-content/map.png">
</details>



### Points to string
```JS
// ... 

            linePointX = imageX * (linePointX / coordBoundingSizeX);
            linePointY = (imageY * ((coordBoundingSizeY - linePointY) / coordBoundingSizeY));

            // Make the point strings            
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
```
Generate the the coordination/position strings for SVG polygon element and area element. The offsetIndex is used to indicate to which direction it should extend.


### Start and end separators
```JS
polylineCoord = polylineCoord.trim();

coord = coord.slice(1, -1);
```
Remove the separators on the start and the end for both strings.


### To HTML
```JS
return {
    areaElement: "<area shape=\"poly\" coords=\"" + coord + "\" alt=\"" + streetName.value + "\" href=\"" +  "/api/street-info/" + ( uri != undefined ? encodeURIComponent(uri.value) : "") + "\">", 
    svgElement: "<polygon fill=\"white\" stroke=\"white\" points=\"" + polylineCoord + "\"/>"};
```       
Put everything together. Save the URI encoded in the URL.

### Output:
```HTML
<area shape="poly" coords="256.52595317319435,410.99348318696764,256.52595317319435,410.99348318696764,256.52595317319435,418.627963178187,256.52595317319435,418.627963178187" alt="Hooiwagens steeg" href="/api/street-info/https%3A%2F%2Fadamlink.nl%2Fgeo%2Fstreet%2Fhooiwagens-steeg%2F5454">
```

```HTML
<polyline fill="none" stroke="white" points="256.52595317319435,410.99348318696764 256.52595317319435,410.99348318696764 256.52595317319435,418.627963178187 256.52595317319435,418.627963178187"></polyline>
```




## Browserify

### Command to bundle the js:
```shell
browserify clientside_scripts/main.js -o public/scripts/bundle.js
```


### Modules that are required
```JS
const imageLoader = require("./image-loading-feedback");
const zeroState = require("./zero-state");
```

* `image-loading-feedback.js` is used to show a spinner when the image is loading.
* `zero-state.js` is used to show an extra zero state. (In progress)


## Audit
<details>
<summary>Audit focus on clientside</summary>
<img src="https://raw.githubusercontent.com/IIYAMA12/performance-matters-server-side/master/readme-content/performanceAfter.png">
</details>

<details>
<summary>Audit focus on serverside (no optimisations)</summary>
<img src="https://raw.githubusercontent.com/IIYAMA12/performance-matters-server-side/master/readme-content/audit1_1.png">
<img src="https://raw.githubusercontent.com/IIYAMA12/performance-matters-server-side/master/readme-content/audit1_2.png">
<img src="https://raw.githubusercontent.com/IIYAMA12/performance-matters-server-side/master/readme-content/audit1_3.png">
</details>