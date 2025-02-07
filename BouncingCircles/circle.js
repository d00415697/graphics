import { collideParticles } from "./collisions.js";

class Circle{
    constructor(xlow, xhigh, ylow, yhigh){ // make the rectangles inside these World Coordinates
        this.xlow = xlow;
        this.xhigh = xhigh;
        this.ylow = ylow;
        this.yhigh = yhigh;
        this.color = [Math.random(), Math.random(), Math.random(), 1]
        this.size = 1.0 + Math.random(); // half edge between 1.0 and 2.0
        const minx = xlow+this.size;
        const maxx = xhigh-this.size;
        this.x = minx + Math.random()*(maxx-minx);
        const miny = ylow+this.size;
        const maxy = yhigh-this.size;
        this.y = miny + Math.random()*(maxy-miny);
        this.airfriction = 0.99;
        this.degrees = Math.random()*90;
        this.dx = Math.random()*2+2; // 2 to 4
        if (Math.random()>.5)
            this.dx = -this.dx;
        this.dy = Math.random()*2+2;
        if (Math.random()>.5)
            this.dy = - this.dy;
    }

    //function declarations for update 0 - 2
    update0(gravity){
        // Ball Wall Collison
        // this.dy -= 0.25; //scrape code, but save just in cass
        this.dx += gravity[0] * 0.5; // 31 - 32 is new code added to modify the way gravity works
        this.dy += gravity[1] * 0.5;
        this.dy *= this.airfriction;
        this.dx *= this.airfriction;
        
    }
    //
    update01(DT, circleList, i, gravity){
        // Gravity

        //Air friction

        
        //Ball/Wall collisons
        if(this.x+this.dx*DT +this.size > this.xhigh){
            this.dx = -Math.abs(this.dx);
        }
        if(this.x+this.dx*DT -this.size < this.xlow){
            this.dx = Math.abs(this.dx);
        }
        if(this.y+this.dy*DT +this.size > this.yhigh){
            this.dy = -Math.abs(this.dy);
        }
        if(this.y+this.dy*DT -this.size < this.ylow){
            this.dy = Math.abs(this.dy);
        }

        //Ball Ball Collisons
        for(let j = i+1; j < circleList.length; j++){
            const myR = this.size;
            const myX = this.x;
            const myY = this.y;
            const myDX = this.dx;
            const myDY = this.dy;
            const myNextX = myX + myDX*DT;
            const myNextY = myY + myDY*DT;

            const OtherR = circleList[j].size;
            const OtherX = circleList[j].x;
            const OtherY = circleList[j].y;
            const OtherDX = circleList[j].dx;
            const OtherDY = circleList[j].dy;
            const OtherNextX = OtherX + OtherDX*DT;
            const OtherNextY = OtherY + OtherDY*DT;

            const distance = Math.sqrt( (myNextX - OtherNextX) ** 2 + (myNextY - OtherNextY) ** 2);
            if(distance < myR + OtherR){
                collideParticles(this, circleList[j], DT, 0.95);
            }
        }
    }
    update02(DT, i, gravity){
        // Update Position
        this.dx += gravity[0] * DT; // lines 84 - 85 apply the gravity again 
        this.dy += gravity[1] * DT;
        this.x += this.dx*DT;
        this.y += this.dy*DT;
    }
    draw(gl, shaderProgram){
        drawCircle(gl, shaderProgram, this.color, this.degrees, this.x, this.y, this.size);
    }
}

function CreateCircleVertices(sides){
    const positions = [];
    positions.push(0,0);
    for(let i = 0; i <= sides; i++){
        const radians = (i / sides) * 2 * Math.PI;
        const x = Math.cos(radians);
        const y = Math.sin(radians);
        positions.push(x,y);
    }
    return positions
}

function drawCircle(gl, shaderProgram, color, degrees, x, y, size) {
    const sides = 64; // Adjust for smoothness
    const vertices = CreateCircleVertices(sides);

    const vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
    gl.vertexAttribPointer(
        positionAttribLocation, // Attribute location
        2, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    const colorUniformLocation = gl.getUniformLocation(shaderProgram, "uColor");
    gl.uniform4fv(colorUniformLocation, color);

    const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [x, y, 0]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [size, size, 1]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, (degrees * Math.PI) / 180, [0, 0, 1]);
    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, sides + 2); // Use TRIANGLE_FAN for circle
}


export { Circle, drawCircle };