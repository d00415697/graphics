class Rectangle{
    constructor(){ // make the rectangles inside these World Coordinates
        this.color = [0,0,1, 1]
        this.size = 1.0;
        this.x = 0;
        this.y = 0;
        this.degrees = Math.random()*90;
    }
    update(DT){
        const degreesPerSecond = 45;
        this.degrees += degreesPerSecond*DT;
    }
    draw(gl, shaderProgram){
        drawRectangle(gl, shaderProgram, this.color, this.degrees, this.x, this.y, this.size);
    }
}

function drawRectangle(gl, shaderProgram, color, degrees, x, y, size){
    //
    // Create the vertexBufferObject
    //
    const vertices = [-1,1, -1,-1, +1,+1, +1,-1];

	const vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	//
	// Set Vertex Attributes
	//
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

	//
	// Set Uniform uColor
	//
	const colorUniformLocation = gl.getUniformLocation(shaderProgram, "uColor");
	gl.uniform4fv(colorUniformLocation, color);

	//
	// Set Uniform uModelViewMatrix
	//
    const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [x, y, 0]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [size, size, 1]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, (degrees* Math.PI / 180), [0, 0, 1]);
    gl.uniformMatrix4fv( modelViewMatrixUniformLocation, false, modelViewMatrix);	  	

    //
    // Starts the Shader Program, which draws the current object to the screen.
    //
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

export { Rectangle, drawRectangle };