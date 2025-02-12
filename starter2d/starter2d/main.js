import { initShaderProgram } from "./shader.js";
import { drawCircle,drawLineStrip } from "./shapes2d.js";
import { randomDouble } from "./random.js";
import {Bezier, Point2} from "./bezier.js";

//
//State variables
//

let bezierlist = [];
let selectedCurve = -1;
let selectedPoint = -1;

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
	const aspect = canvas.clientWidth / canvas.clientHeight;
	const projectionMatrix = mat4.create();
	let yhigh = 10;
	let ylow = -yhigh;
	let xlow = ylow;
	let xhigh = yhigh;
	if(aspect>=1){
		xlow *= aspect;
		xhigh *= aspect;
	}
	else{
		ylow /= aspect;
		yhigh /= aspect;
	}
	mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
	gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

	//
	// load a modelview matrix onto the shader
	// 
	const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
	const modelViewMatrix = mat4.create();
    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

	//
	// Create content to display
	//
	bezierlist.push(new Bezier(
		new Point2(-3, -3), new Point2(1, 5), new Point2(3, 5), new Point2(5, -3)
	));

	//
	// Bezier Curve button 
	//

	document.getElementById("addBezier").addEventListener("click",function(){
		let rX = Math.random() * 6 - 3;
		let rY = Math.random() * 6 - 3;
		bezierlist.push(new Bezier(
			new Point2(rX, rY), new Point2(rX + 1, rY + 3), new Point2(rX + 3, rY + 3), new Point2(rX + 5, rY)
		));
	});

	//
	// Mouse event Handlers
	//

	canvas.addEventListener("mousedown", mousedown);
	canvas.addEventListener("mouseup", mouseup);
	canvas.addEventListener("mousemove", mousemove);
	function mousedown(event){
		const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
		const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
		selectedCurve = -1;
		selectedPoint = -1;
		for(let i = 0; bezierlist.length; i++){
			let pointIndex = bezierlist[i].isPicked(xWorld, yWorld);
			if(pointIndex !== -1){
				selectedCurve = i;
				selectedPoint =  pointIndex;
				break;
			}
		}
	}
	function mouseup(event){
		selectedCurve = -1;
		selectedPoint = -1;
	}
	function mousemove(event){
		if(selectedPoint !== -1  && selectedPoint !== -1){
			const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
			const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
			bezierlist[selectedCurve].setPoint(selectedPoint, xWorld, yWorld);
		}
	}


	//
	// Register Listeners
	// //
	// canvas.addEventListener("click", click);
	// function click(event) {
	// 	console.log("click");
	// 	const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
	// 	const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
	// 	// Do whatever you want here, in World Coordinates.
	// }

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

		// drawCircle(gl, shaderProgram, 5,5,1);
		// drawRectangle(gl, shaderProgram, 0,0,2,1, [1,0,0,1]); // override the default color with red.
		// drawTriangle(gl, shaderProgram, -1,0, -1,2, -2,3);
		// drawLineStrip(gl, shaderProgram, [0,0,-1,-1,-2,-1])
		for(let bezier of bezierlist){
			bezier.drawCurve(gl, shaderProgram);
			bezier.drawControlPoints(gl, shaderProgram);
		}
		
		requestAnimationFrame(redraw);
	}
	requestAnimationFrame(redraw);
};

