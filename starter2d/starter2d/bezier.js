import { drawCircle, drawLineStrip } from "./shapes2d.js";

class Point2{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

// Function to generate a random neon color
function getNeonColor() {
    const neonColors = [
        [1, 0, 0, 1],   // Red
        [1, 0.08, 0.58, 1], // Neon Pink
        [0, 1, 0, 1],   // Green
        [0.08, 1, 1, 1], // Cyan
        [1, 1, 0, 1],   // Yellow
        [0.58, 0.08, 1, 1], // Neon Purple
        [0, 0, 1, 1]    // Blue
    ];
    return neonColors[Math.floor(Math.random() * neonColors.length)];
}



class Bezier{
    constructor(p0, p1, p2, p3){
        this.points = [p0, p1, p2, p3];
        this.color = getNeonColor();
    }
    evaluate(t) {
        const {points} = this;
        const x = points[0].x * (1 - t) ** 3 + 3 * points[1].x * (1 - t) ** 2 * t + 3 * points[2].x * (1 - t) * t ** 2 + points[3].x * t ** 3;
        const y = points[0].y * (1 - t) ** 3 + 3 * points[1].y * (1 - t) ** 2 * t + 3 * points[2].y * (1 - t) * t ** 2 + points[3].y * t ** 3;
        return new Point2(x, y);
    }
    drawCurve(gl, shaderProgram) {
        let curve_points = [];
        for(let i = 0; i <= 20; i++){
            let t = i / 20;
            let point = this.evaluate(t);
            curve_points.push(point.x, point.y);
        }
        drawLineStrip(gl, shaderProgram, curve_points, this.color);
    }
    drawControlPoints(gl, shaderProgram){
        for(let p of this.points){
            drawCircle(gl, shaderProgram, p.x, p.y, 0.2, this.color);
        }
    }
    //
    // Control points
    //

    isPicked(x, y){
        for(let i = 0; i < this.points.length; i++){
            let dx = this.points[i].x - x;
            let dy = this.points[i].y - y;
            if(Math.sqrt(dx * dx + dy * dy) < 0.3){ //thereshold radius
                return i;
            }
        }
        return -1;
    }

    //
    // Setting centarl point positions
    //

    setPoint(i, x, y){
        if(i >= 0 && i < this.points.length){
            this.points[i].x = x;
            this.points[i].y = y;
        }
    }
}

export{ Bezier, Point2};