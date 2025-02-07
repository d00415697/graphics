import { Circle } from "./circle.js";
import { initShaderProgram } from "./shader.js";

main();
async function main() {
	console.log('This is working');

	//
	// Accelerometer
	//

	let gravity = [0, 0];
	if(!(window.DeviceOrientationEvent == undefined)){
		window.addEventListener("deviceorientation", handleOrientation);
	}

	function handleOrientation(event){
		let x = event.beta;
		let y = event.gamma;
		if(x == null || y == null){
			gravity[0] = 0;
			gravity[1] = -1;
		}
		else{
			if(x > 90) x = 90;
			if(x < -90) x = -90;
			gravity[0] = y / 90;
			gravity[1] = -x / 90;
	}
	console.log(`Updated Gravity: gravity[0]=${gravity[0]}, gravity[1]=${gravity[1]}`);
}

	//
	// Init gl
	// 
	const canvas = document.getElementById('glcanvas');
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	const gl = canvas.getContext('webgl');

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0, 0, 0, 1.0); //Background Color
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//
	// Create shaderProgram
	// 
	const vertexShaderText = await (await fetch("simple.vs")).text();
    const fragmentShaderText = await (await fetch("simple.fs")).text();
	let shaderProgram = initShaderProgram(gl, vertexShaderText, fragmentShaderText);
	gl.useProgram(shaderProgram);


	//
	// Set Uniform uProjectionMatrix
	//	
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
// Create the objects in the scene:
//
const NUM_CIRCLES = 10;
const tempList = [];

for (let i = 0; i < NUM_CIRCLES; i++) {
    let valid = false; 
    let r;
    while (!valid) {
        r = new Circle(xlow, xhigh, ylow, yhigh);
        valid = true;
        for (let j = 0; j < tempList.length; j++) {
            const existingCircle = tempList[j];
            const distance = Math.sqrt(
                (r.x - existingCircle.x) ** 2 + (r.y - existingCircle.y) ** 2
            );
            if (distance < r.size + existingCircle.size) {
                valid = false;
                break;
            }
        }
    }
    tempList.push(r);
}


	//
	//loop for overlap
	//
	//
	for(let i = 0; i < tempList.length; i++){
		for(let j = i +1; j < tempList.length; j++){
			const mX = tempList[i].x;
			const mY = tempList[i].y;
			const mR = tempList[i].r;

			const nX = tempList[j].x;
			const nR = tempList[j].r;
			const nY = tempList[j].y;

			const dsquared = (mX - nX) ** 2 + (mY - nY) ** 2;
			if((mR + nR)**2 > (dsquared)){
				tempList.splice(j, 1);
			}

		}
	}

	const circleList = tempList;
	console.log('hi you have this many circle: ', circleList.length, tempList.length);

	// Main render loop
	//
	let previousTime = 0;
	function redraw(currentTime) {
		currentTime*= .001; // milliseconds to seconds
		let DT = currentTime - previousTime;
		previousTime = currentTime;
		if(DT > .1){
			DT = .1;
		}
	
		// Clear the canvas before we start drawing on it.
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		for (let i = 0; i < circleList.length; i++) {
			circleList[i].update0(gravity);
		}

		for(let reps = 0; reps < circleList.length; reps++){
			for(let i = 0; i < circleList.length; i++){
				circleList[i].update01(DT, circleList, i, gravity);
			}
		}

		for(let i = 0; i < circleList.length; i++){
			circleList[i].update02(DT,i, gravity);
		}

		// Draw the scene
		for (let i = 0; i < circleList.length; i++) {
			circleList[i].draw(gl, shaderProgram);
		}
	  
	
		requestAnimationFrame(redraw);
	  }	
	  requestAnimationFrame(redraw);
};

