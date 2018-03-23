# performance-matters-server-side



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

