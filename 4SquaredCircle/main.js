const vertexShaderText = `
	precision mediump float;

	attribute vec2 vertPosition;
	uniform mat4 uProjectionMatrix;

	void main()
	{
		gl_Position = uProjectionMatrix * vec4(vertPosition, 0.0, 1.0);
	}
`;

const fragmentShaderText = `
	precision mediump float;
	uniform vec4 uColor;
	void main()
	{
		gl_FragColor = uColor;
	}
`;

main();
async function main() {
	console.log('This is working');

	//
	// Init gl
	// 
	const canvas = document.getElementById('glcanvas');
	const gl = canvas.getContext('webgl');

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//
	// Create shaders
	// 
	let shaderProgram = initShaderProgram(gl, vertexShaderText, fragmentShaderText);

	//
	// Create buffer
	//
	function CreateCircleVertices(sides) {
		const positions = [];
		positions.push(0);
		positions.push(0);
		for (let i = 0; i < sides + 1; i++) {
		  const radians = i / sides * 2 * Math.PI;
		  const x = Math.cos(radians);
		  const y = Math.sin(radians);
		  positions.push(x);
		  positions.push(y);
		}
		return positions;
	}

	const sides = 64;
	const circleVertices = CreateCircleVertices(sides);

	const circleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);

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
	// Set Uniforms
	//
	const colorUniformLocation = gl.getUniformLocation(shaderProgram, "uColor");
	const theColor = [0, 0, 1, 1];
	gl.uniform4fv(
		colorUniformLocation,
		theColor
	  );

		const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
		const aspect = canvas.clientWidth / canvas.clientHeight;
		const projectionMatrix = mat4.create();
		const yhigh = 10;
		const ylow = -yhigh;
		const xlow = ylow * aspect;
		const xhigh = yhigh * aspect;
		mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
	
		gl.uniformMatrix4fv(
			projectionMatrixUniformLocation,
			false,
			projectionMatrix
		);
		  
	//
	// Main render loop
	//

	// Starts the Shader Program, which draws one frame to the screen.
	gl.drawArrays(gl.TRIANGLE_FAN, 0, sides+2);
};

//
// Initialize a Shader Program, which consists of a Vertex Shader and a Fragment Shader, compiled and linked.
//
function initShaderProgram(gl, vsSource, fsSource) {
    // Create and compile the two shaders.
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
    // Combine the two shaders into a shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
          shaderProgram
        )}`
      );
      return null;
    }

    gl.validateProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
      console.error('ERROR validating program!', gl.getProgramInfoLog(shaderProgram));
      return;
    }

	gl.useProgram(shaderProgram);
  
    return shaderProgram;
  }
  
  //
  // creates a shader of the given type with the given source code, and compiles it.
  //
  function loadShader(gl, type, source) {
    // Make an empty shader
    const shader = gl.createShader(type);
  
    // Send the source to the shader object
    gl.shaderSource(shader, source);
  
    // Compile the shader program
    gl.compileShader(shader);
  
    // If compiling the shader failed, alert
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(
        `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
      );
      gl.deleteShader(shader);
      return null;
    }
  
    return shader;
  }
  