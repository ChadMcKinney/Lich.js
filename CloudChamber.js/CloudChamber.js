/* 
    CloudChamber.js - JavaScript WebGL framework
    Copyright (C) 2012 Chad McKinney

	http://chadmckinneyaudio.com/
	seppukuzombie@gmail.com

	All rights reserved.
	
	This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301  USA
*/

////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////

var CloudChamber = {};

CloudChamber.ONE_SECOND_IN_MILLIS = 1000;
CloudChamber.PI = 3.141592654;
CloudChamber.POSITION_DATA_SIZE = 3;
CloudChamber.COLOR_DATA_SIZE = 4;
CloudChamber.pointers = new Array();
CloudChamber.update_queue = {};

////////////////////////////////////////
// Helper functions for loading files
////////////////////////////////////////

CloudChamber.loadFile = function(url, data, callback, errorCallback) 
{
    // Set up an asynchronous request
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    // Hook the event that gets called as the request progresses
    request.onreadystatechange = function () 
    {
        // If the request is "DONE" (completed or failed)
        if (request.readyState == 4) 
        {
            // If we got HTTP status 200 (OK)
            if (request.status == 200) 
            {
                callback(request.responseText, data)
            } 

            else // Failed 
            { 
                errorCallback(url);
            }
        }
    };

    request.send(null);    
}

CloudChamber.loadFiles = function(urls, callback, errorCallback) 
{
    var numUrls = urls.length;
    var numComplete = 0;
    var result = [];

    // Callback for a single file
    function partialCallback(text, urlIndex) 
    {
        result[urlIndex] = text;
        numComplete++;

        // When all files have downloaded
        if (numComplete == numUrls) 
        {
            callback(result);
        }
    }

    for (var i = 0; i < numUrls; i++) 
    {
        CloudChamber.loadFile(urls[i], i, partialCallback, errorCallback);
    }
}

CloudChamber.loadShaders = function(vertName, fragName)
{
	CloudChamber.loadFiles([vertName, fragName], CloudChamber.setShaders, 
		function(url)
		{
			alert('CLOUD CHAMBER: Failed to download "' + url + '"');
		}
	);
}

CloudChamber.setShaders = function(shaders) // An array of shader programs as a string array [0] vert [1] frag
{
	var vertexShader = CloudChamber.gl.createShader(CloudChamber.gl.VERTEX_SHADER);
	CloudChamber.gl.shaderSource(vertexShader, shaders[0]);
	CloudChamber.gl.compileShader(vertexShader);
	
	var compiled = CloudChamber.gl.getShaderParameter(vertexShader, CloudChamber.gl.COMPILE_STATUS);
	if(!compiled)
		CloudChamber.print("ERROR COMPILING VERTEX  SHADER");

	var fragmentShader = CloudChamber.gl.createShader(CloudChamber.gl.FRAGMENT_SHADER);
	CloudChamber.gl.shaderSource(fragmentShader, shaders[1]);
	CloudChamber.gl.compileShader(fragmentShader);

	compiled = CloudChamber.gl.getShaderParameter(fragmentShader, CloudChamber.gl.COMPILE_STATUS);
	if(!compiled)
		CloudChamber.print("ERROR COMPILING FRAGMENT  SHADER");

	var program = CloudChamber.gl.createProgram();
	CloudChamber.gl.attachShader(program, vertexShader);
	CloudChamber.gl.attachShader(program, fragmentShader);
	
	CloudChamber.gl.bindAttribLocation(program, 0, "position");
	CloudChamber.gl.bindAttribLocation(program, 1, "color");

	CloudChamber.gl.linkProgram(program);
	
	var linked = CloudChamber.gl.getProgramParameter(program, CloudChamber.gl.LINK_STATUS);
	if(!linked)
	{
		var lastError = CloudChamber.gl.getProgramInfoLog(program);
		CloudChamber.print("Error in program linking:" + lastError);
		CloudChamber.gl.deleteProgram(program);
		return;
	}

	CloudChamber.mvpMatrixHandle = CloudChamber.gl.getUniformLocation(program, "mvpMatrix");
	CloudChamber.positionHandle = CloudChamber.gl.getAttribLocation(program, "position");
	CloudChamber.colorHandle = CloudChamber.gl.getAttribLocation(program, "color");

	CloudChamber.gl.useProgram(program);
	CloudChamber.currentProgram = program;
}

CloudChamber.print = function(text)
{
	if(CloudChamber.printCallback != undefined)
		CloudChamber.printCallback(text)
	else
		console.log(text);
}

// Start animating
CloudChamber.start = function()
{
	var drawFunc = function() 
	{
		window.requestAnimFrame(CloudChamber.draw, CloudChamber.canvas);
	}

	if(CloudChamber.framerate <= 0 || CloudChamber.framerate == undefined)
		CloudChamber.print("CLOUD CHAMBER: FRAMERATE IS <= 0 OR UNDEFINED. NOT STARTING.");
	else
		CloudChamber.timer = setInterval(drawFunc, CloudChamber.ONE_SECOND_IN_MILLIS / CloudChamber.framerate);
		//CloudChamber.timer = setInterval(CloudChamber.draw, CloudChamber.ONE_SECOND_IN_MILLIS / CloudChamber.framerate);
}

// Stop animating
CloudChamber.stop = function()
{
	if(CloudChamber.timer)
		clearTimeout(CloudChamber.timer);
}

CloudChamber.checkGLError = function()
{
	var error = CloudChamber.gl.getError();
	
	if(error)
	{
		CloudChamber.print("error: " + error);
	}
}


CloudChamber.draw = function(time)
{		
		for(var i = 0; i < CloudChamber.pointers.length; ++i)
		{
			if(CloudChamber.pointers[i] != null)
			{
				if(CloudChamber.pointers[i].momentum_update)
				{
					var linear = CloudChamber.pointers[i].linear_momentum;
					var angular = CloudChamber.pointers[i].angular_momentum;
					CloudChamber.pointers[i].position.x += linear.x;
					CloudChamber.pointers[i].position.y += linear.y;
					CloudChamber.pointers[i].position.z += linear.z;
					
					CloudChamber.pointers[i].rotation.x += angular.x;
					CloudChamber.pointers[i].rotation.y += angular.y;
					CloudChamber.pointers[i].rotation.z += angular.z;
				}
			}
		}	

		CloudChamber.composer.render(CloudChamber.scene, CloudChamber.camera);
		
		/*
		var move = Math.sin(time * 0.0013);
		CloudChamber.camera.position.x = Math.sin(time * 0.0025) * 40;
		CloudChamber.camera.position.y = Math.sin(time * 0.002) * 30;
		CloudChamber.camera.position.z = 200 + (Math.sin(time * 0.0015) * 99);

		CloudChamber.testLight.position.x = move * 100;
		CloudChamber.testLight.position.y = move * 100;
		CloudChamber.testLight.position.y = move * -100;*/

		/*
		glMatrixMode(GL_PROJECTION);
		glLoadIdentity();
		gluPerspective(50.0, 1.0, 3.0, 7.0);
		glMatrixMode(GL_MODELVIEW);
		glLoadIdentity();

		CloudChamber.mvpMatrix = mat4.lookAt(CloudChamber.eye, CloudChamber.look, CloudChamber.up);

		CloudChamber.gl.bindFramebuffer(CloudChamber.gl.FRAMEBUFFER, null);		
    	CloudChamber.gl.viewport(0, 0, CloudChamber.gl.viewportWidth, CloudChamber.gl.viewportHeight);
    	CloudChamber.gl.clearColor(Math.random(), Math.random(), Math.random(), 1);
    	CloudChamber.gl.clear(CloudChamber.gl.COLOR_BUFFER_BIT);
		
    	//mat4.identity(CloudChamber.modelMatrix);

		CloudChamber.gl.enableVertexAttribArray(CloudChamber.positionHandle);
		CloudChamber.gl.bindBuffer(CloudChamber.gl.ARRAY_BUFFER, trianglePositionBufferObject);
		
		CloudChamber.gl.vertexAttribPointer(
			CloudChamber.positionHandle, 
			CloudChamber.POSITION_DATA_SIZE, 
			CloudChamber.gl.FLOAT, 
			false, 
			0, 
			0
		);

		CloudChamber.gl.enableVertexAttribArray(CloudChamber.colorHandle);
		CloudChamber.gl.bindBuffer(CloudChamber.gl.ARRAY_BUFFER, triangleColorBufferObject);
		
		CloudChamber.gl.vertexAttribPointer(
			CloudChamber.colorHandle, 
			CloudChamber.COLOR_DATA_SIZE, 
			CloudChamber.gl.FLOAT, 
			false, 
			0, 
			0
		);

		// mat4.multiply(CloudChamber.viewMatrix, CloudChamber.modelMatrix, CloudChamber.mvpMatrix);
		mat4.multiply(CloudChamber.projectionMatrix, CloudChamber.mvpMatrix, CloudChamber.mvpMatrix);
		
		CloudChamber.gl.uniformMatrix4fv(
			CloudChamber.mvpMatrixHandle, 
			false, 
			CloudChamber.mvpMatrix
		);
		
		CloudChamber.gl.drawArrays(CloudChamber.gl.TRIANGLES, 0, 3);

		CloudChamber.gl.flush();
		*/


		// CloudChamber.print("CloudChamber drawn: " + time);
		// window.requestAnimFrame(CloudChamber.draw, CloudChamber.canvas);

		//if(CloudChamber.drawCallback != undefined)
		//	CloudChamber.drawCallback(this);
}

/******************************************************************************************************************
*	CloudChamber - Basic graphics app class.
*	canvasElementName
*	framerate - Frames per second. ie. 30 will be 1000 / 30 = 33.333 ms between frames
*	drawCallback
*	printCallback
******************************************************************************************************************/
CloudChamber.setup = function(canvasElementName, framerate, drawCallback, printCallback)
{
	CloudChamber.canvas = document.getElementById(canvasElementName);
	/*
	CloudChamber.gl = WebGLUtils.setupWebGL(CloudChamber.canvas);
	CloudChamber.gl.viewport(0, 0, CloudChamber.canvas.clientWidth, CloudChamber.canvas.clientHeight);
	CloudChamber.projectionMatrix = mat4.create();
	CloudChamber.viewMatrix = mat4.create();
	CloudChamber.modelMatrix = mat4.create();
	CloudChamber.mvpMatrix = mat4.create();
	CloudChamber.mvpMatrixHandle = 0;
	CloudChamber.positionHandle = 0;
	CloudChamber.colorHandle = 0;*/
	
	CloudChamber.framerate = framerate;
	CloudChamber.drawCallback = drawCallback;
	CloudChamber.printCallback = printCallback
	CloudChamber.timer = 0;
	// CloudChamber.vert = "uniform mat4 mvpMatrix; attribute vec4 position; attribute vec4 color; varying vec4 vColor; void main() { vColor = color; gl_Position = position * mvpMatrix; }";
	// CloudChamber.frag = "varying vec4 vColor; void main() { gl_FragColor = vColor; }";
	CloudChamber.currentProgram = 0;

	// Setup view frustum and projection matrix
	var ratio = CloudChamber.canvas.clientWidth / CloudChamber.canvas.clientHeight;
	var left = -ratio;
	var right = ratio;
	var bottom = -1.0;
	var top = 1.0;
	var near = 1.0;
	var far = 10.0;
	mat4.frustum(left, right, bottom, top, near, far, CloudChamber.projectionMatrix);
	// CloudChamber.gl.clearColor(0, 0, 0, 1);

	CloudChamber.eye = vec3.create();
	CloudChamber.eye[0] = 25;
	CloudChamber.eye[1] = 25;
	CloudChamber.eye[2] = 25;

	CloudChamber.look = vec3.create();
	CloudChamber.look[0] = 0;
	CloudChamber.look[1] = 0;
	CloudChamber.look[2] = 0;

	CloudChamber.up = vec3.create();
	CloudChamber.up[0] = 0;
	CloudChamber.up[1] = 1;
	CloudChamber.up[2] = 0;

	/*
	CloudChamber.mvpMatrix = mat4.lookAt(CloudChamber.eye, CloudChamber.look, CloudChamber.up);

	CloudChamber.loadShaders(
		"http://chadmckinneyaudio.com/Lich.js/CloudChamber.js/Cloud.vert",
		"http://chadmckinneyaudio.com/Lich.js/CloudChamber.js/Cloud.frag"
	);

	// Define points for equilateral triangles.
	trianglePositions = new Float32Array([
	        // X, Y, Z,
	        -0.5, -0.25, 0.0,
	        0.5, -0.25, 0.0,
	        0.0, 0.559016994, 0.0]);
	 
	// This triangle is red, green, and blue.
	triangleColors = new Float32Array([
	        // R, G, B, A
	        1.0, 0.0, 0.0, 1.0,
	        0.0, 0.0, 1.0, 1.0,
	        0.0, 1.0, 0.0, 1.0]);

	trianglePositionBufferObject = CloudChamber.gl.createBuffer();
	CloudChamber.checkGLError();
	CloudChamber.gl.bindBuffer(CloudChamber.gl.ARRAY_BUFFER, trianglePositionBufferObject);
	CloudChamber.checkGLError();
	CloudChamber.gl.bufferData(CloudChamber.gl.ARRAY_BUFFER, trianglePositions, CloudChamber.gl.STATIC_DRAW);
	CloudChamber.checkGLError();

	triangleColorBufferObject = CloudChamber.gl.createBuffer();
	CloudChamber.checkGLError();
	CloudChamber.gl.bindBuffer(CloudChamber.gl.ARRAY_BUFFER, triangleColorBufferObject);
	CloudChamber.checkGLError();
	CloudChamber.gl.bufferData(CloudChamber.gl.ARRAY_BUFFER, triangleColors, CloudChamber.gl.STATIC_DRAW);
	CloudChamber.checkGLError();*/

	//window.requestAnimFrame(CloudChamber.draw, CloudChamber.canvas);

	var cameraViewAngle = 45, near = 0.1, far = 10000;
	
	CloudChamber.renderer = new THREE.WebGLRenderer({antialias: true});


	CloudChamber.camera = new THREE.PerspectiveCamera(
		cameraViewAngle,
		ratio,
		near,
		far
	);

	CloudChamber.scene = new THREE.Scene();
	CloudChamber.scene.add(CloudChamber.camera);
	CloudChamber.camera.position.z = 300;
	CloudChamber.renderer.setSize(CloudChamber.canvas.clientWidth, CloudChamber.canvas.clientHeight);
	CloudChamber.canvas.parentNode.replaceChild(CloudChamber.renderer.domElement, CloudChamber.canvas);
	CloudChamber.print("CloudChamber created.");

	/*
	var sphereMaterial = new THREE.MeshLambertMaterial(
		{
			color: 0xCC0000
		}
	);

	CloudChamber.testSphere = new THREE.Mesh(
		new THREE.SphereGeometry(
			50,
			64,
			64
		),
		sphereMaterial
	);

	CloudChamber.scene.add(CloudChamber.testSphere);*/

	CloudChamber.testLight = new THREE.PointLight(0xFFFFFF);

	CloudChamber.testLight.position.x = 10;
	CloudChamber.testLight.position.y = 50;
	CloudChamber.testLight.position.z = 130;	

	CloudChamber.scene.add(CloudChamber.testLight);
	CloudChamber.renderer.setClearColorHex(0x000000, 1);

	// postprocessing
	CloudChamber.composer = new THREE.EffectComposer(CloudChamber.renderer);
	CloudChamber.composer.addPass( new THREE.RenderPass(CloudChamber.scene, CloudChamber.camera));

/*
	var dotScreenEffect = new THREE.ShaderPass(THREE.DotScreenShader);
	dotScreenEffect.uniforms['scale'].value = 4;
	CloudChamber.composer.addPass(dotScreenEffect);*/

	var rgbEffect = new THREE.ShaderPass(THREE.RGBShiftShader);
	rgbEffect.uniforms['amount'].value = 0.0015;
	rgbEffect.renderToScreen = true;
	CloudChamber.composer.addPass(rgbEffect);

	// shim layer with setTimeout fallback
	window.requestAnimFrame = (function(){
	  return  window.requestAnimationFrame       ||
	          window.webkitRequestAnimationFrame ||
	          window.mozRequestAnimationFrame    ||
	          function( callback ){
	            window.setTimeout(callback, 33);
	          };
	})();


	// usage:
	// instead of setInterval(render, 16) ....

	(function animloop(time){
	  requestAnimFrame(animloop);
	  CloudChamber.draw(time);
	})();
	// place the rAF *before* the render() to assure as close to
	// 60fps with the setTimeout fallback.
}

CloudChamber.addPointer = function(object)
{
	CloudChamber.pointers.push(object);
	return CloudChamber.pointers.length - 1;
}

CloudChamber.removePointer = function(pointer)
{
	CloudChamber.pointers[pointer] = null;
}

CloudChamber.sphere = function(sPosition, sRadius, sColor)
{
	var sphereMaterial = new THREE.MeshLambertMaterial(
		{
			color: sColor
		}
	);

	var sphere = new THREE.Mesh(
		new THREE.SphereGeometry(
			sRadius, 64, 64
		),
		sphereMaterial
	);

	sphere.position = sPosition;
	sphere.linear_momentum = { x:0, y:0, z:0 };
	sphere.angular_momentum = { x:0, y:0, z:0 };
	sphere.momentum_update = false;
	CloudChamber.scene.add(sphere);
	CloudChamber.print("Sphere: " + sPosition);
	return CloudChamber.addPointer(sphere);
}

CloudChamber.cube = function(cPosition, cSize, cRotation, cColor)
{
	var cubeMaterial = new THREE.MeshLambertMaterial(
		{
			color: cColor
		}
	);

	var cube = new THREE.Mesh(
		new THREE.CubeGeometry(
			cSize.x,
			cSize.y,
			cSize.z
		),
		cubeMaterial
	);

	cube.position = cPosition;
	cube.rotation = cRotation;
	cube.linear_momentum = { x:0, y:0, z:0 };
	cube.angular_momentum = { x:0, y:0, z:0 };
	cube.momentum_update = false;
	CloudChamber.scene.add(cube);
	CloudChamber.print("Cube: " + cPosition);
	return CloudChamber.addPointer(cube);
}

CloudChamber.all = function(func)
{
	for(var i = 0; i < CloudChamber.pointers.length; ++i)
	{
		if(CloudChamber.pointers[i] != null)
		{
			func(i);
		}
	}	
}

CloudChamber.allArg = function(func, arg)
{
	for(var i = 0; i < CloudChamber.pointers.length; ++i)
	{
		if(CloudChamber.pointers[i] != null)
		{
			func(i, arg);
		}
	}	
}

CloudChamber.delete = function(pointer)
{
	if(pointer < CloudChamber.pointers.length)
	{
		CloudChamber.scene.remove(CloudChamber.pointers[pointer]);
		CloudChamber.removePointer(pointer);
	}
}

CloudChamber.deleteAll = function()
{
	CloudChamber.all(CloudChamber.delete);
}

CloudChamber.wireframe = function(pointer, active)
{
	CloudChamber.pointers[pointer].material.wireframe = active;
}

CloudChamber.wireframeAll = function(active)
{
	CloudChamber.allArg(CloudChamber.wireframe, active);
}

CloudChamber.move = function(pointer, relPosition)
{
	var object = CloudChamber.pointers[pointer];
	var position = object.position;
	position.x += relPosition.x;
	position.y += relPosition.y;
	position.z += relPosition.z;
	CloudChamber.pointers[pointer].position = position;
}

CloudChamber.moveAll = function(relPosition)
{
	CloudChamber.allArg(CloudChamber.move, relPosition);
}

CloudChamber.colorize = function(pointer, color)
{
	CloudChamber.pointers[pointer].material.color = color;
}

CloudChamber.colorizeAll = function(color)
{
	CloudChamber.allArg(CloudChamber.colorize, color);
}

CloudChamber.rotate = function(pointer, relRotation)
{
	var object = CloudChamber.pointers[pointer];
	var rotation = object.rotation;
	rotation.x += relRotation.x;
	rotation.y += relRotation.y;
	rotation.z += relRotation.z;
	CloudChamber.pointers[pointer].rotation = rotation;	
}

CloudChamber.rotateAll = function(relRotation)
{
	CloudChamber.allArg(CloudChamber.rotate, relRotation);
}

CloudChamber.linear = function(pointer, linear_momentum)
{
	CloudChamber.pointers[pointer].linear_momentum = linear_momentum;
	CloudChamber.pointers[pointer].momentum_update = true;
}

CloudChamber.linearAll = function(linear_momentum)
{
	CloudChamber.allArg(CloudChamber.linear, linear_momentum);
}

CloudChamber.angular = function(pointer, angular_momentum)
{
	CloudChamber.pointers[pointer].angular_momentum = angular_momentum;
	CloudChamber.pointers[pointer].momentum_update = true;
}

CloudChamber.angularAll = function(angular_momentum)
{
	CloudChamber.allArg(CloudChamber.angular, angular_momentum);
}

CloudChamber.position = function(pointer, position)
{
	CloudChamber.pointers[pointer].position = position;
}

CloudChamber.positionAll = function(position)
{
	CloudChamber.allArg(CloudChamber.position, position);
}

CloudChamber.scale = function(pointer, scale)
{
	CloudChamber.pointers[pointer].scale = { x: scale, y: scale, z: scale };
}

CloudChamber.scaleAll = function(scale)
{
	CloudChamber.allArg(CloudChamber.scale, scale);
}

CloudChamber.pointCloud = function(numTriangles)
{
	var triangles = new Array();

	for(var i = 0; i < numTriangles; ++i)
	{
		var triangle = new Array();
		triangle.push(new THREE.Vector3(Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100));
		triangle.push(new THREE.Vector3(Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100));
		triangle.push(new THREE.Vector3(Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100));
		triangles.push(triangle);
	}

	return triangles;
}

CloudChamber.nrand = function() {
	var x1, x2, rad, y1;
	do {
		x1 = 2 * Math.random() - 1;
		x2 = 2 * Math.random() - 1;
		rad = x1 * x1 + x2 * x2;
	} while(rad >= 1 || rad == 0);
	var c = Math.sqrt(-2 * Math.log(rad) / rad);
	return x1 * c;
}

CloudChamber.gaussianCloud = function(numTriangles)
{
	var triangles = new Array();

	for(var i = 0; i < numTriangles; ++i)
	{
		var triangle = new Array();
		triangle.push(new THREE.Vector3(CloudChamber.nrand() * 50, CloudChamber.nrand() * 50, CloudChamber.nrand() * 50));
		triangle.push(new THREE.Vector3(CloudChamber.nrand() * 50, CloudChamber.nrand() * 50, CloudChamber.nrand() * 50));
		triangle.push(new THREE.Vector3(CloudChamber.nrand() * 50, CloudChamber.nrand() * 50, CloudChamber.nrand() * 50));
		triangles.push(triangle);
	}

	return triangles;
}

CloudChamber.sine = function(numTriangles)
{
	var triangles = new Array();
	var freq1 = CloudChamber.nrand() * 0.1;
	var freq2 = CloudChamber.nrand() * 0.1;
	var freq3 = CloudChamber.nrand() * 0.1;
	var freq4 = Math.random() * 0.1;

	for(var i = 0; i < numTriangles; ++i)
	{
		var triangle = new Array();
		var sine = Math.sin(i * freq4) * 0.1 + 0.9;
		triangle.push(new THREE.Vector3(Math.sin(i * freq1) * 100 * sine, Math.sin(i * freq2) * 100 * sine, Math.sin(i * freq3) * 100 * sine));
		triangle.push(new THREE.Vector3(Math.sin(i * freq3) * 100 * sine, Math.sin(i * freq1) * 100 * sine, Math.sin(i * freq2) * 100 * sine));
		triangle.push(new THREE.Vector3(Math.sin(i * freq2) * 100 * sine, Math.sin(i * freq3) * 100 * sine, Math.sin(i * freq1) * 100 * sine));
		triangles.push(triangle);
	}

	return triangles;
}

CloudChamber.heightMap = function(mapFunction, width, depth)
{
	var map = mapFunction(width, depth);
	var triangles = new Array();
	var x = 0;
	var y = 0;
	var even = true;
	var doneIterating = false;

	// Iterate over the height map and create a triangle mesh using correct winding
	while(!doneIterating)
	{
		var triangle = new Array();

		if(even)
		{	
			x += 1;
			triangle.push(new THREE.Vector3(x, 0, y));
			x -= 1;
			triangle.push(new THREE.Vector3(x, 0, y));
			y += 1;
			triangle.push(new THREE.Vector3(x, 0, y));
			even = false;
			triangles.push(triangle);
		}

		else
		{
			triangle.push(new THREE.Vector3(x, 0, y));
			x += 1;
			triangle.push(new THREE.Vector3(x, 0, y));
			y -= 1;
			triangle.push(new THREE.Vector3(x, 0, y));
			triangles.push(triangle);
			even = true;

			// Check to see that we're done by testing x/y against width/depth
			if((x == width - 1) && (y == depth - 1))
			{
				doneIterating = true;
			}

			else if(x == width - 1)
			{
				// New row
				x = 0;
				y += 1;
			}
		}
	}

	return triangles;
}

CloudChamber.sineMap = function(width, depth)
{
	var map = new Array();
	for(var x = 0; x < width; ++x)
	{
		map.push(new Array());
	}


	for(var x = 0; x < width; ++x)
	{
		var freq = Math.random();
		for(var y = 0; y < depth; ++y)
		{
			map[x][y] = Math.sin(y * freq);
		}
	}

	return map;
}

CloudChamber.calculateNormal = function(p1, p2, p3)
{
	/*
	Set Vector U to (Triangle.p2 minus Triangle.p1)
    Set Vector V to (Triangle.p3 minus Triangle.p1)
 
    Set Normal.x to (multiply U.y by V.z) minus (multiply U.z by V.y)
    Set Normal.y to (multiply U.z by V.x) minus (multiply U.x by V.z)
    Set Normal.z to (multiply U.x by V.y) minus (multiply U.y by V.x)
 
    Returning Normal
	*/

	var u = p2.sub(p1);
	var v = p3.sub(p1);
	
	return new THREE.Vector3(
		(u.y * v.z) - (u.z * v.y),
		(u.z * v.x) - (u.x * v.z),
		(u.x * v.y) - (u.y * v.x)
	);
}

CloudChamber.mesh = function(mGeometry, mColor)
{
	var material = new THREE.MeshLambertMaterial(
		{
			color: mColor
		}
	);

	var geometry = new THREE.Geometry();

	for(var i = 0; i < mGeometry.length; ++i)
	{
		var p1 = mGeometry[i][0];
		var p2 = mGeometry[i][1];
		var p3 = mGeometry[i][2];
		geometry.vertices.push(p1);
		geometry.vertices.push(p2);
		geometry.vertices.push(p3);
		geometry.faces.push(new THREE.Face3(i * 3, (i * 3) + 1, (i * 3) + 2, CloudChamber.calculateNormal(p1, p2, p3), mColor));
	}

	geometry.computeBoundingSphere();

	var mesh = new THREE.Mesh(
		geometry,
		material
	);

	// mesh.position = mPosition;
	// mesh.rotation = mRotation;
	mesh.linear_momentum = { x:0, y:0, z:0 };
	mesh.angular_momentum = { x:0, y:0, z:0 };
	mesh.momentum_update = false;
	CloudChamber.scene.add(mesh);
	CloudChamber.print("Mesh");
	return CloudChamber.addPointer(mesh);
}