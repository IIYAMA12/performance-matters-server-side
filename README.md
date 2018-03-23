# performance-matters-server-side

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
const router = express.Router(); // Make router with express.

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
4. Calcutate the offset, which will give you 2 extra positions. If you do that for both points, you will have 4 points, which can be seen as a boundingbox.
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
<summary>Background map</summery>
<img src="https://raw.githubusercontent.com/IIYAMA12/performance-matters-server-side/master/readme-content/map.png">
</details>




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




```JS
polylineCoord = polylineCoord.trim();

coord = coord.slice(1, -1);
```
Remove the separators on the start and the end for both strings.



```JS
return {
    areaElement: "<area shape=\"poly\" coords=\"" + coord + "\" alt=\"" + streetName.value + "\" href=\"" +  "/api/street-info/" + ( uri != undefined ? encodeURIComponent(uri.value) : "") + "\">", 
    svgElement: "<polygon fill=\"white\" stroke=\"white\" points=\"" + polylineCoord + "\"/>"};
```       
Put everything together. Save the URI encoded in the URL.



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
