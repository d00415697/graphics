import { initShaderProgram } from "./shader.js";
import { drawCircle, drawRectangle, drawTriangle, drawLineStrip } from "./shapes2d.js";
import { randomDouble } from "./random.js";

main();
async function main() {
	console.log('This is working');

	//
	// start gl
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
	const vertexShaderText = await(await fetch("simple.vs")).text();
	const fragmentShaderText = await(await fetch("simple.fs")).text();
	const shaderProgram = initShaderProgram(gl, vertexShaderText, fragmentShaderText);

	//
	// load a projection matrix onto the shader
	// 
	const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
	const projectionMatrix = mat4.create();
	let ylow = -1.5;
	let yhigh = 1.5;
	let xlow = -2.5;
	let xhigh = .5;
	mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
	gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);


	//
	// Create content to display
	//

	//
	// Zoom Handles
	//
	let zoom = 1.0;
	let offsetX = 0.0;
	let offsetY = 0.0;


	//
	// Register Listeners
	//
	addEventListener("click", click);
	function click(event) {
		console.log("click");
		const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
		const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
		// Do whatever you want here, in World Coordinates.
	}

	addEventListener("mousewheel", mousewheel);
	function mousewheel(event) {
		console.log("click");
		const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
		const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
		// Do whatever you want here, in World Coordinates.
	}

	canvas.addEventListener("wheel", function(event){
		const zoom_Factor = 1.1;
		if(event.deltaY < 0){
			zoom /= zoom_Factor;
		} else{
			zoom*= zoom_Factor;
		}
		event.preventDefault();
	});

	//
	// Main render loop
	//
	let previousTime = 0;
	function redraw(currentTime){
		currentTime *= .001; // milliseconds to seconds
		let DT = currentTime - previousTime;
		if(DT > .1)
			DT = .1;
		previousTime = currentTime;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, "uResolution");
		gl.uniform2(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
		
		const zoomUniformLocation = gl.getUniformLocation(shaderProgram, "uZoom");
		gl.uniform1f(zoomUniformLocation, zoom);

		const offsetXniformLocation = gl.getUniformLocation(shaderProgram, "uOffsetX");
		gl.uniform1f(offsetXniformLocation, offsetX);

		const offsetYniformLocation = gl.getUniformLocation(shaderProgram, "uOffssetY");
		gl.uniform1f(offsetYniformLocation, offsetY);
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		requestAnimationFrame(redraw);
	}
	requestAnimationFrame(redraw);
};

