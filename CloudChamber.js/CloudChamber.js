/* 
    CloudChamber : THREE., - JavaScript WebGL framework
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
CloudChamber.meshes = new Array();

////////////////////////////////////////
// Helper functions for loading files
////////////////////////////////////////

CloudChamber.loadFile = function(url, data, callback, errorCallback) 
{
    // Set up an asynchronous request
    var request = new XMLHttpRequest();
    request.open("GET", url, true);

    // Hook the event that gets called as the request progresses
    request.onreadystatechange = function () 
    {
        // If the request is "DONE" (completed or failed)
        if(request.readyState == 4) 
        {
            // If we got HTTP status 200 (OK)
            if(request.status == 200) 
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
			alert("CLOUD CHAMBER: Failed to download" + url);
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
	/*
	var drawFunc = function() 
	{
		window.requestAnimFrame(CloudChamber.draw, CloudChamber.canvas);
	}

	if(CloudChamber.framerate <= 0 || CloudChamber.framerate == undefined)
		CloudChamber.print("CLOUD CHAMBER: FRAMERATE IS <= 0 OR UNDEFINED. NOT STARTING.");
	else
		CloudChamber.timer = setInterval(drawFunc, CloudChamber.ONE_SECOND_IN_MILLIS / CloudChamber.framerate);
		//CloudChamber.timer = setInterval(CloudChamber.draw, CloudChamber.ONE_SECOND_IN_MILLIS / CloudChamber.framerate);
	*/
}

// Stop animating
CloudChamber.stop = function()
{
	// if(CloudChamber.timer)
	//	clearTimeout(CloudChamber.timer);
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
	for(var i = 0; i < CloudChamber.meshes.length; ++i)
	{
		var mesh = CloudChamber.meshes[i];
		var linear = mesh.linear_momentum;
		var angular = mesh.angular_momentum;
		mesh.position.x += linear[0];
		mesh.position.y += linear[1]
		mesh.position.z += linear[2];
				
		mesh.rotation.x += angular[0];
		mesh.rotation.y += angular[1];
		mesh.rotation.z += angular[2];
	}	

	CloudChamber.composer.render(CloudChamber.scene, CloudChamber.camera);
}

/******************************************************************************************************************
*	CloudChamber - Basic graphics app class.
*	canvasElementName
*	framerate - Frames per second. ie. 30 will be 1000 / 30 = 33.333 ms between frames
*	drawCallback
*	printCallback
******************************************************************************************************************/
CloudChamber.setup = function(canvas, framerate, drawCallback, printCallback)
{
	// CloudChamber.canvas = document.getElementById(canvasElementName);
	CloudChamber.canvas = canvas;
	CloudChamber.framerate = framerate;
	CloudChamber.frametime = 1000 / framerate;
	CloudChamber.drawCallback = drawCallback;
	CloudChamber.printCallback = printCallback
	CloudChamber.timer = 0;
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

	CloudChamber.testLight = new THREE.PointLight(0xFFFFFF);

	CloudChamber.testLight.position.x = 10;
	CloudChamber.testLight.position.y = 50;
	CloudChamber.testLight.position.z = 130;	

	CloudChamber.scene.add(CloudChamber.testLight);
	CloudChamber.renderer.setClearColorHex(0x141414, 1);

	// postprocessing
	CloudChamber.composer = new THREE.EffectComposer(CloudChamber.renderer);
	CloudChamber.composer.addPass( new THREE.RenderPass(CloudChamber.scene, CloudChamber.camera));

	/*

	var dotScreenEffect = new THREE.ShaderPass(THREE.DotScreenShader);
	dotScreenEffect.uniforms["scale"].value = 4;
	CloudChamber.composer.addPass(dotScreenEffect);*/

	
	var rgbEffect = new THREE.ShaderPass(THREE.RGBShiftShader);
	rgbEffect.uniforms["amount"].value = 0.0;
	rgbEffect.renderToScreen = true;
	CloudChamber.composer.addPass(rgbEffect);

	CloudChamber.numShaders = 1;
	
	CloudChamber.shadersMap = {
		"BasicShader" : THREE.BasicShader,
		"BleachBypassShader" : THREE.BleachBypassShader,
		"BlendShader" : THREE.BlendShader,
		"BokehShader" : THREE.BokehShader,
		"BrightnessContrastShader" : THREE.BrightnessContrastShader,
		"ColorCorrectionShader" : THREE.ColorCorrectionShader,
		"ColorifyShader" : THREE.ColorifyShader,
		"ConvolutionShader" : THREE.ConvolutionShader,
		"CopyShader" : THREE.CopyShader,
		"DOFMipMapShader" : THREE.DOFMipMapShader,
		"DotScreenShader" : THREE.DotScreenShader,
		"EdgeShader" : THREE.EdgeShader,
		"EdgeShader2" : THREE.EdgeShader2,
		"FilmShader" : THREE.FilmShader,
		"FocusShader" : THREE.FocusShader,
		"FresnelShader" : THREE.FresnelShader,
		"FXAAShader" : THREE.FXAAShader,
		"HorizontalBlurShader" : THREE.HorizontalBlurShader,
		"HorizontalTiltShiftShader" : THREE.HorizontalTiltShiftShader,
		"HueSaturationShader" : THREE.HueSaturationShader,
		"KaleidoShader" : THREE.KaleidoShader,
		"LuminosityShader" : THREE.LuminosityShader,
		"MirrorShader" : THREE.MirrorShader,
		"NormalMapShader" : THREE.NormalMapShader,
		"RGBShiftShader" : THREE.RGBShiftShader,
		"SepiaShader" : THREE.SepiaShader,
		"SSAOShader" : THREE.SSAOShader,
		"TriangleBlurShader" : THREE.TriangleBlurShader,
		"UnpackDepthRGBAShader" : THREE.UnpackDepthRGBAShader,
		"VerticalBlurShader" : THREE.VerticalBlurShader,
		"VerticalTiltShiftShader" : THREE.VerticalTiltShiftShader,
		"VignetteShader" : THREE.VignetteShader 
	}

	CloudChamber.shaderArray = new Array(
		"BasicShader",
		"BleachBypassShader",
		"BlendShader",
		"BokehShader",
		"BrightnessContrastShader",
		"ColorCorrectionShader",
		"ColorifyShader",
		"ConvolutionShader",
		"CopyShader",
		"DOFMipMapShader",
		"DotScreenShader",
		"EdgeShader",
		"EdgeShader2",
		"FilmShader",
		"FocusShader",
		"FresnelShader",
		"FXAAShader",
		"HorizontalBlurShader",
		"HorizontalTiltShiftShader",
		"HueSaturationShader",
		"KaleidoShader",
		"LuminosityShader",
		"MirrorShader",
		"NormalMapShader",
		"RGBShiftShader",
		"SepiaShader",
		"SSAOShader",
		"TriangleBlurShader",
		"UnpackDepthRGBAShader",
		"VerticalBlurShader",
		"VerticalTiltShiftShader",
		"VignetteShader"
	);

	shaders = CloudChamber.shaderArray;

	// shim layer with setTimeout fallback
	window.requestAnimFrame = (function()
	{
		return  window.requestAnimationFrame       || 
        		window.webkitRequestAnimationFrame || 
        		window.mozRequestAnimationFrame    || 
        		window.oRequestAnimationFrame      || 
        		window.msRequestAnimationFrame     || 
        
        function(/* function */ callback)
        {
            window.setTimeout(callback, 33);
        }
	})();

	CloudChamber.print("Graphics initialized.");
	// usage:
	// instead of setInterval(render, 16) ....

	/* 
	!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	!! UNCOMMENT THIS TO GET GRAPHICS BACK!!!
	!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	(function animloop(time){
		requestAnimFrame(animloop);
		CloudChamber.draw(time);
	})();
	*/

	// place the rAF *before* the render() to assure as close to
	// 60fps with the setTimeout fallback.
}

CloudChamber.addShader = function(shader, amount)
{
	var pass = new THREE.ShaderPass(CloudChamber.shadersMap[shader]);
	// pass.uniforms["amount"].value = amount;
	pass.renderToScreen = true;
	CloudChamber.composer.addPass(pass);
	CloudChamber.numShaders += 1;
}

function setShader(shader)
{
	var pass = new THREE.ShaderPass(CloudChamber.shadersMap[shader]);
	// pass.uniforms["amount"].value = amount;
	pass.renderToScreen = true;
	
	for(var i = 0; i < CloudChamber.numShaders; ++i)
	{
		CloudChamber.composer.passes.pop();
	}

	CloudChamber.numShaders = 1;
	CloudChamber.composer.addPass(pass);
	return Lich.VM.Void;
}

_createPrimitive("setShader", setShader);

function setNativeShader(shader)
{
	var pass = new THREE.ShaderPass(shader);
	// pass.uniforms["amount"].value = amount;
	pass.renderToScreen = true;
	
	for(var i = 0; i < CloudChamber.numShaders; ++i)
	{
		CloudChamber.composer.passes.pop();
	}

	CloudChamber.numShaders = 1;
	CloudChamber.composer.addPass(pass);
	return Lich.VM.Void;
}

_createPrimitive("setNativeShader", setNativeShader);

function clearShaders()
{	
	for(var i = 0; i < CloudChamber.numShaders; ++i)
	{
		CloudChamber.composer.passes.pop();
	}

	CloudChamber.numShaders = 1;
	var rgbEffect = new THREE.ShaderPass(THREE.RGBShiftShader);
	rgbEffect.uniforms["amount"].value = 0.0;
	rgbEffect.renderToScreen = true;
	CloudChamber.composer.addPass(rgbEffect);
	return Lich.VM.Void;
}

_createPrimitive("clearShaders", clearShaders);

function setShaders(shaders)
{
	for(var i = 0; i < shaders.length; ++i)
	{
		if(i == 0)
		{
			for(var j = 0; j < CloudChamber.numShaders; ++j)
			{
				CloudChamber.composer.passes.pop();
			}

			CloudChamber.numShaders = 0;
		}

		var pass = new THREE.ShaderPass(CloudChamber.shadersMap[shaders[i]]);
		
		if(i == (shaders.length - 1))
			pass.renderToScreen = true;

		CloudChamber.composer.addPass(pass);
		CloudChamber.numShaders += 1;
	}

	return Lich.VM.Void;
}

_createPrimitive("setShaders", setShaders);

CloudChamber.addPointer = function(object)
{
	CloudChamber.pointers.push(object);
	return CloudChamber.pointers.length - 1;
}

CloudChamber.removePointer = function(pointer)
{
	CloudChamber.pointers[pointer] = null;
}

function sphere(sPosition, sRadius, sColor)
{
	var sphereMaterial = new THREE.MeshLambertMaterial(
		{
			color: CloudChamber.packRGB(sColor[0],sColor[1],sColor[2])
		}
	);

	var sphere = new THREE.Mesh(
		new THREE.SphereGeometry(
			sRadius, 64, 64
		),
		sphereMaterial
	);

	sphere.position = { x:sPosition[0], y:sPosition[1], z:sPosition[2] };
	sphere.linear_momentum = [0, 0, 0];
	sphere.angular_momentum = [0, 0, 0];
	sphere.momentum_update = false;
	CloudChamber.scene.add(sphere);
	CloudChamber.print("Sphere: " + sPosition);
	CloudChamber.meshes.push(sphere);
	return sphere;
}

_createPrimitive("sphere", sphere);

function cube(cPosition, cSize, cRotation, cColor)
{
	var cubeMaterial = new THREE.MeshLambertMaterial(
		{
			color: CloudChamber.packRGB(cColor[0],cColor[1],cColor[2])
		}
	);

	var cube = new THREE.Mesh(
		new THREE.CubeGeometry(
			cSize[0],
			cSize[1],
			cSize[2]
		),
		cubeMaterial
	);

	cube.position = { x:cPosition[0], y:cPosition[1], z:cPosition[2] };
	cube.rotation = new THREE.Euler(cRotation[0], cRotation[1], cRotation[2], 'XYZ');
	cube.linear_momentum = [0, 0, 0];
	cube.angular_momentum = [0, 0, 0];
	cube.momentum_update = false;
	CloudChamber.scene.add(cube);
	CloudChamber.print("Cube: " + cPosition);
	CloudChamber.meshes.push(cube);
	return cube;
}

_createPrimitive("cube", cube);

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

function deleteMesh(mesh)
{
	var index = CloudChamber.meshes.indexOf(mesh);
	
	if(index > 0)
	{
		CloudChamber.meshes.splice(index, 1);
	}

	CloudChamber.scene.remove(mesh);
	return Lich.VM.Void;
}

_createPrimitive("deleteMesh", deleteMesh);

function deleteScene()
{
	for(var i = 0; i < CloudChamber.meshes.length; ++i)
	{
		CloudChamber.scene.remove(CloudChamber.meshes[i]);
	}

	CloudChamber.meshes = new Array();
	//CloudChamber.all(CloudChamber.delete);
	return Lich.VM.Void;
}

_createPrimitive("deleteScene", deleteScene);

function wireframe(active, mesh)
{
	mesh.material.wireframe = active;
	return mesh;
}

_createPrimitive("wireframe", wireframe);

function wireframeAll(active)
{
	for(var i = 0; i < CloudChamber.meshes.length; ++i)
	{
		wireframe(active, CloudChamber.meshes[i]);
	}

	return Lich.VM.Void;
}

_createPrimitive("wireframeAll", wireframeAll);

function move(relPosition, object)
{
	var position = object.position;
	position.x += relPosition[0];
	position.y += relPosition[1];
	position.z += relPosition[2];
	object.position = position;
	return object;
}

_createPrimitive("move", move);

function moveAll(relPosition)
{
	for(var i = 0; i < CloudChamber.meshes.length; ++i)
	{
		move(relPosition, CloudChamber.meshes[i]);
	}

	return Lich.VM.Void;
}

_createPrimitive("moveAll", moveAll);

function setColor(color, mesh)
{
	mesh.material.color = new THREE.Color(CloudChamber.packRGB(color[0], color[1], color[2]));
	return mesh;
}

_createPrimitive("setColor", setColor);

function setColorAll(color)
{
	for(var i = 0; i < CloudChamber.meshes.length; ++i)
	{
		setColor(color, CloudChamber.meshes[i]);
	}

	return Lich.VM.Void;
}

_createPrimitive("setColorAll", setColorAll);

function rotate(relRotation, object)
{
	var rotation = object.rotation;
	rotation.x += relRotation[0];
	rotation.y += relRotation[0];
	rotation.z += relRotation[0];
	object.rotation = rotation;	
	return object;
}

_createPrimitive("rotate", rotate);

function rotateAll(relRotation)
{
	for(var i = 0; i < CloudChamber.meshes.length; ++i)
	{
		rotate(relRotation, CloudChamber.meshes[i]);
	}

	return Lich.VM.Void;
}

_createPrimitive("rotateAll", rotateAll);

function linear(linear_momentum, object)
{
	object.linear_momentum = linear_momentum;
	object.momentum_update = true;
	return object;
}

_createPrimitive("linear", linear);

function linearAll(linear_momentum)
{
	for(var i = 0; i < CloudChamber.meshes.length; ++i)
	{
		linear(linear_momentum, CloudChamber.meshes[i]);
	}

	return Lich.VM.Void;
}

_createPrimitive("linearAll", linearAll);

function angular(angular_momentum, object)
{
	object.angular_momentum = angular_momentum;
	object.momentum_update = true;
	return object;
}

_createPrimitive("angular", angular);

function angularAll(angular_momentum)
{
	for(var i = 0; i < CloudChamber.meshes.length; ++i)
	{
		angular(angular_momentum, CloudChamber.meshes[i]);
	}

	return Lich.VM.Void;
}

_createPrimitive("angularAll", angularAll);

function setPosition(position, object)
{
	object.position = {x:position[0],y:position[1],z:position[2] };
	return object;
}

_createPrimitive("setPosition", setPosition);

function setX(xposition, object)
{
	object.position = { x:xposition, y:object.position.y, z:object.position.z };
	return object;
}

_createPrimitive("setX", setX);

function setY(yposition, object)
{
	object.position = { x:object.position.x, y:yposition, z:object.position.z };
	return object;
}

_createPrimitive("setY", setY);

function setZ(zposition, object)
{
	object.position = { x:object.position.x, y:object.position.y, z:zposition };
	return object;
}

_createPrimitive("setZ", setZ);

function setPositionAll(position)
{
	for(var i = 0; i < CloudChamber.meshes.length; ++i)
	{
		setPosition(position, CloudChamber.meshes[i]);
	}

	return Lich.VM.Void;
}

_createPrimitive("setPositionAll", setPositionAll);

function scale(scaleVec, object)
{
	object.scale = { x: scaleVec[0], y: scaleVec[1], z: scaleVec[2] };
	return object;
}

_createPrimitive("scale", scale);

function scaleAll(scaleVec)
{
	for(var i = 0; i < CloudChamber.meshes.length; ++i)
	{
		scale(scaleVec, CloudChamber.meshes[i]);
	}

	return Lich.VM.Void;
}

_createPrimitive("scaleAll", scaleAll);

function cloudMesh(numTriangles, color)
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

	return CloudChamber.mesh(
			triangles, // mesh
			new THREE.Color(CloudChamber.packRGB(color[0], color[1], color[2])) // color
	);
}

_createPrimitive("cloudMesh", cloudMesh);

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

function gaussianMesh(numTriangles,color)
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

	return CloudChamber.mesh(
			triangles, // mesh
			new THREE.Color(CloudChamber.packRGB(color[0], color[1], color[2])) // color
	);
}

_createPrimitive("gaussianMesh", gaussianMesh);

function sinMesh(numTriangles, color)
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

	return CloudChamber.mesh(
			triangles, // mesh
			new THREE.Color(CloudChamber.packRGB(color[0], color[1], color[2])) // color
	);
}

_createPrimitive("sinMesh", sinMesh);

CloudChamber.heightMap = function(mapFunction, width, depth)
{
	var map = mapFunction(width, depth);
	var triangles = new Array();
	var x = 0;
	var y = 0;
	var even = true;
	var doneIterating = false;
	var offset = new THREE.Vector3((width / 2) * -1, 0, (depth / 2) * -1);

	// Iterate over the height map and create a triangle mesh using correct winding
	while(!doneIterating)
	{
		var triangle = new Array();

		if(even)
		{	
			x += 1;
			triangle.push(new THREE.Vector3(x, map[x + (y * width)], y).add(offset));
			x -= 1;
			triangle.push(new THREE.Vector3(x, map[x + (y * width)], y).add(offset));
			y += 1;
			triangle.push(new THREE.Vector3(x, map[x + (y * width)], y).add(offset));
			even = false;
			triangles.push(triangle);
		}

		else
		{
			triangle.push(new THREE.Vector3(x, map[x + (y * width)], y).add(offset));
			x += 1;
			triangle.push(new THREE.Vector3(x, map[x + (y * width)], y).add(offset));
			y -= 1;
			triangle.push(new THREE.Vector3(x, map[x + (y * width)], y).add(offset));
			triangles.push(triangle);
			even = true;

			// Check to see that we"re done by testing x/y against width/depth
			if((x == width) && (y == depth - 1))
			{
				doneIterating = true;
			}

			else if(x == width)
			{
				// New row
				x = 0;
				y += 1;
			}
		}
	}

	return triangles;
}

CloudChamber.newMap = function(width, depth)
{
	var map = new Array();

	for(var i = 0; i < (width * depth); ++i)
	{
		map.push(0)
	}

	return map;
}

CloudChamber.sineMap = function(width, depth)
{
	var map = CloudChamber.newMap(width, depth);
	var freq = Math.random() * width;
	var freq2 = Math.round(Math.random() * 20) / 10;
	for(var x = 0; x < width; ++x)
	{
		for(var y = 0; y < depth; ++y)
		{
			map[x + (y * width)] = Math.sin(x * freq) * Math.sin(y * freq2) * (width / 2);
		}
	}

	return map;
}

function sinMapMesh(width, depth, color)
{
	var triangles = CloudChamber.heightMap(CloudChamber.sineMap, width, depth);

	return CloudChamber.mesh(
			triangles, // mesh
			new THREE.Color(CloudChamber.packRGB(color[0], color[1], color[2])) // color
	);
}

_createPrimitive("sinMapMesh", sinMapMesh);

CloudChamber.noiseMap = function(width, depth)
{
	var map = CloudChamber.newMap(width, depth);
	var amp = Math.random() * width;
	for(var i = 0; i < (width * depth); ++i)
	{
		map[i] = ((Math.random() * 2) - 1) * amp;
	}

	return map;	
}

function noiseMapMesh(width, depth, color)
{
	var triangles = CloudChamber.heightMap(CloudChamber.noiseMap, width, depth);

	return CloudChamber.mesh(
			triangles, // mesh
			new THREE.Color(CloudChamber.packRGB(color[0], color[1], color[2])) // color
	);
}

_createPrimitive("noiseMapMesh", noiseMapMesh);

CloudChamber.gaussianMap = function(width, depth)
{
	var map = CloudChamber.newMap(width, depth);
	var amp = Math.random() * width;
	for(var i = 0; i < (width * depth); ++i)
	{
		map[i] = CloudChamber.nrand() * amp;
	}

	return map; 
}

function gaussianMapMesh(width, depth, color)
{
	var triangles = CloudChamber.heightMap(CloudChamber.gaussianMap, width, depth);

	return CloudChamber.mesh(
			triangles, // mesh
			new THREE.Color(CloudChamber.packRGB(color[0], color[1], color[2])) // color
	);
}

_createPrimitive("gaussianMapMesh", gaussianMapMesh);

CloudChamber.square = function(i, freq)
{
	if((i % freq) < (freq / 2))
		return -1;
	else
		return 1;
}

CloudChamber.squareMap = function(width, depth)
{
	var map = CloudChamber.newMap(width, depth);
	var freq = Math.random();
	var freq2 = Math.round(Math.random() * 20) / 10;
	for(var x = 0; x < width; ++x)
	{
		for(var y = 0; y < depth; ++y)
		{
			map[x + (y * width)] = CloudChamber.square(x, freq) * CloudChamber.square(y, freq2)  * (width / 2);
		}
	}

	return map;
}

function squareMapMesh(width, depth, color)
{
	var triangles = CloudChamber.heightMap(CloudChamber.squareMap, width, depth);

	return CloudChamber.mesh(
			triangles, // mesh
			new THREE.Color(CloudChamber.packRGB(color[0], color[1], color[2])) // color
	);
}

_createPrimitive("squareMapMesh", squareMapMesh);

CloudChamber.saw = function(i, freq)
{
	return ((i % freq) / freq) * 2 - 1;
}

CloudChamber.sawMap = function(width, depth)
{
	var map = CloudChamber.newMap(width, depth);
	var freq = Math.random();
	var freq2 = Math.round(Math.random() * 20) / 10;
	for(var x = 0; x < width; ++x)
	{
		for(var y = 0; y < depth; ++y)
		{
			map[x + (y * width)] = CloudChamber.saw(x, freq) * CloudChamber.saw(y, freq2)  * (width / 2);
		}
	}

	return map;
}

function sawMapMesh(width, depth, color)
{
	var triangles = CloudChamber.heightMap(CloudChamber.sawMap, width, depth);

	return CloudChamber.mesh(
			triangles, // mesh
			new THREE.Color(CloudChamber.packRGB(color[0], color[1], color[2])) // color
	);
}

_createPrimitive("sawMapMesh", sawMapMesh);

CloudChamber.tri = function(i, freq)
{
	return freq / 2 - Math.abs(i % (2*freq) - freq);
}

CloudChamber.triMap = function(width, depth)
{
	var map = CloudChamber.newMap(width, depth);
	var freq = Math.random();
	var freq2 = Math.round(Math.random() * 20) / 10;
	for(var x = 0; x < width; ++x)
	{
		for(var y = 0; y < depth; ++y)
		{
			map[x + (y * width)] = CloudChamber.tri(x, freq) * CloudChamber.tri(y, freq2)  * width;
		}
	}

	return map;
}

function triMapMesh(width, depth, color)
{
	var triangles = CloudChamber.heightMap(CloudChamber.triMap, width, depth);

	return CloudChamber.mesh(
			triangles, // mesh
			new THREE.Color(CloudChamber.packRGB(color[0], color[1], color[2])) // color
	);
}

_createPrimitive("triMapMesh", triMapMesh);

function flatMapMesh(width, depth, color)
{
	var triangles = CloudChamber.heightMap(CloudChamber.newMap, width, depth);

	return CloudChamber.mesh(
			triangles, // mesh
			new THREE.Color(CloudChamber.packRGB(color[0], color[1], color[2])) // color
	);
}

_createPrimitive("flatMapMesh", flatMapMesh);

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
	
	var normal = new THREE.Vector3(
		(u.y * v.z) - (u.z * v.y),
		(u.z * v.x) - (u.x * v.z),
		(u.x * v.y) - (u.y * v.x)
	);

	return normal.normalize();
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
		geometry.faces.push(new THREE.Face3(i * 3, (i * 3) + 1, (i * 3) + 2));
	}

	geometry.computeFaceNormals();
	geometry.computeCentroids();
	geometry.computeBoundingSphere();

	var mesh = new THREE.Mesh(
		geometry,
		material
	);

	// mesh.position = mPosition;
	// mesh.rotation = mRotation;
	mesh.doubleSided = true;
	mesh.overdraw = true;
	mesh.linear_momentum = [0,0,0];
	mesh.angular_momentum = [0,0,0];
	mesh.momentum_update = false;
	CloudChamber.meshes.push(mesh);
	CloudChamber.scene.add(mesh);
	//CloudChamber.print("Mesh");
	return mesh;
}

function marchingCubes(mColor)
{
	var map = MarchingCubes.march();

	var material = new THREE.MeshLambertMaterial(
		{
			color: new THREE.Color(CloudChamber.packRGB(mColor[0], mColor[1], mColor[2]))
		}
	);

	var geometry = new THREE.Geometry();

	for(var i = 0; i < map.length; ++i)
	{
		geometry.vertices.push(map[i]);
		CloudChamber.print("(" + map[i].x + ", " + map[i].y + ", " + map[i].z + ")");

		if(i % 3 == 2)
			geometry.faces.push(new THREE.Face3(i - 2, i - 1, i));
	}

	CloudChamber.print("March faces: " + geometry.faces.length);

	geometry.computeFaceNormals();
	geometry.computeCentroids();
	geometry.computeBoundingSphere();

	var mesh = new THREE.Mesh(
		geometry,
		material
	);

	mesh.doubleSided = true;
	mesh.overdraw = true;
	mesh.linear_momentum = { x:0, y:0, z:0 };
	mesh.angular_momentum = { x:0, y:0, z:0 };
	mesh.momentum_update = false;
	CloudChamber.scene.add(mesh);
	CloudChamber.print("March");
	return CloudChamber.addPointer(mesh);
}

_createPrimitive("marchingCubes", marchingCubes);

///////////////////////////////////////////////////////////////////////////////////////
// splice language
///////////////////////////////////////////////////////////////////////////////////////

/*
Generate a shader using the sub-language splice
splice is a deterministic, non-turing complete graph description using characters:

The first half of the string is the vertext shader, the second half is the fragment

examples: 

spliceShader "<vVvVvvv<>>>>>>><<<>><^><^^^^^^<^<>>vvvvvvv<v<v>666<<..>>>£%3kqkdwKW:DK"
spliceShader ")(R£)FPIEWF}{P}{poef{pwfowefpowefw3290£)(R()IfifpECV<V<>V<££^94@@{}{}"

characters are translated to WebGL function calls via a simple switch

*/

CloudChamber.parseSpliceChar = function(character, input)
{
	var spliceFunc;
	var frag = input == "fragColor";
	var assignVar = "a_variable";

	if(frag)
		assignVar = "frag_variable";

	switch(character)
	{
	case '!': 
		if(frag)
			spliceFunc = "pow(gl_FragCoord, "+input+" * vec4(2, 2, 2, 2));";
		else
			spliceFunc = "pow("+assignVar+", "+input+" * vec4(2, 2, 2, 2));";
		break;

	case '£': 
		if(frag)
			spliceFunc = "sqrt(gl_FragCoord + "+input+" * vec4(10, 10, 10, 10));";
		else
			spliceFunc = "sqrt("+input+" + "+assignVar+" * vec4(10, 10, 10, 10));";
		break;

	case '=': 
		if(frag)
			spliceFunc = "fract(gl_FragCoord + "+input+" * vec4(10, 10, 10, 10));";
		else
			spliceFunc = "fract("+input+" + "+assignVar+" * vec4(10, 10, 10, 10));";
		break;

	case '`': 
		if(frag)
			spliceFunc = "inversesqrt(gl_FragCoord + "+input+");";
		else
			spliceFunc = "inversesqrt("+input+" + "+assignVar+");";
		break;

	case '~': 
		if(frag)
			spliceFunc = "inversesqrt(gl_FragCoord - "+input+");";
		else
			spliceFunc = "inversesqrt("+input+" - "+assignVar+");";
		break;

	case '#': 
		if(frag)
			spliceFunc = "reflect(gl_FragCoord, "+input+");";
		else
			spliceFunc = "reflect("+input+", "+assignVar+");";
		break;

	case ':':
		if(frag)
			spliceFunc = "refract(gl_FragCoord, "+input+", dot("+input+", "+assignVar+"));";
		else
			spliceFunc = "refract("+input+", "+assignVar+", dot("+input+", "+assignVar+"));";
		break;

	case ';': 
			spliceFunc = "reflect("+assignVar+", reflect("+assignVar+", "+input+"));";
		break;

	case '?': 
		if(frag)
			spliceFunc = "clamp(gl_FragCoord, "+input+", "+assignVar+");";
		else
			spliceFunc = "clamp("+assignVar+", "+input+", "+input+");";
		break;

	case '\\': 
		if(frag)
			spliceFunc = "vec4(cross(gl_FragCoord.xyz, "+input+".xyz), 1);";
		else
			spliceFunc = "vec4(cross("+assignVar+".xyz, "+input+".xyz), 1);";
		break;	

	case ' ':
		if(frag)
			spliceFunc = "mix(gl_FragCoord, "+input+", abs("+assignVar+"));";
		else
			spliceFunc = "mix("+assignVar+", "+input+", abs("+assignVar+"));";
		break;

	case '_': // length
		spliceFunc = "vec4(length("+input+"), length("+input+"), length("+input+"), length("+input+"));";
		break;
	
	case '[': // fold add, add all components of vector returning a vector of the result
		spliceFunc = input+"; "+assignVar+" = "+assignVar+" * ("+input+".x + "+input+".y + "+input+".z + "+input+".w);";
		break;

	case ']': // fold subtract, sub all components of vector returning a vector of the result
		spliceFunc = input+"; "+assignVar+" = "+assignVar+" * ("+input+".x - "+input+".y - "+input+".z - "+input+".w);";
		break;
	
	case '{':
		spliceFunc = "vec4("+input+".w, "+input+".z, "+input+".y, "+input+".x);";
		break;
	
	case '}':
		if(frag)
			spliceFunc = "reflect(gl_FragCoord, "+input+");";
		else
			spliceFunc = "vec4("+input+".z, "+input+".w, "+input+".x, "+input+".w);";
		break;
	
	case '.': // dot() function
		if(frag)
			spliceFunc = input+" * dot(gl_FragCoord, "+input+");";
		else
			spliceFunc = input+" * dot("+input+", "+assignVar+");";
		break;
	
	case '+': // add with next number
			spliceFunc = input + " + "+assignVar+";";
		break;
	
	case '-': // subtract next number from this
			spliceFunc = input + " + "+assignVar+";";
		break;
	
	case '*': // multiply by next number
			spliceFunc = input + " * "+assignVar+";";
		break;
	
	case '/': // divide by next number
		spliceFunc = input + " / "+assignVar+";";
		break;
	
	case '&': // bit and with next number
			spliceFunc = input + " + "+assignVar+";";
		break;
	
	case '|': // bit or with next number
			spliceFunc = input + " - "+assignVar+";";
		break;
	
	case '%': // modulus with next number
			spliceFunc = "mod("+input+", "+assignVar+");";
		break;
	
	case '<': // decrement
		spliceFunc = "--"+input+";";
		break;

	case '^': // exponent
		spliceFunc = "exp("+input+");";
		break;

	case '>': // increment
		spliceFunc = "++"+input+";";
		break;

	case '(': // sin
		spliceFunc = "sin("+input+");";
		break;
	
	case ')': // cosin
		spliceFunc = "cos("+input+");";
		break;

	case '@': // ascos
		spliceFunc = "acos("+input+");";
		break;

	case '$': // ascos
		spliceFunc = "asin("+input+");";
		break;

	case 'a': // scamble
		spliceFunc = "vec4("+input+".y, "+input+".z, "+input+".x, "+input+".w);";		
		break;

	case 'A': // absolute value
		spliceFunc = "abs("+input+");";
		break;

	case 'b': // less than
		spliceFunc = "sign("+assignVar+" * vec4(0.2, 0.2, 0.2, 0.2) - vec4(0.1, 0.1, 0.1, 0.1) + "+input+" - "+assignVar+");";
		break;

	case 'B': // less than equal
		if(frag)
			spliceFunc = "sign("+assignVar+" * "+input+" - gl_FragCoord);";
		else	
			spliceFunc = "sign("+assignVar+" * "+input+");";
		break;

	case 'c': // ceil
		spliceFunc = "ceil("+input+");";
		break;

	case 'C': // ceil
		spliceFunc = "ceil("+input+" * "+assignVar+");";
		break;

	case 'd': // distance
		spliceFunc = "vec4(distance("+assignVar+".x, "+input+".x), distance("+assignVar+".y, "+input+".y), distance("+assignVar+".z, "+input+".z), distance("+assignVar+".w, "+input+".w)) * vec4(-0.01, -0.1, -0.01, -0.01) + "+input+";";
		break;
	
	case 'D': // distance
		spliceFunc = input+";\n    "+assignVar+" = vec4(distance("+assignVar+".x, "+input+".x), distance("+assignVar+".y, "+input+".y), distance("+assignVar+".z, "+input+".z), distance("+assignVar+".w, "+input+".w)) * vec4(0.1, 0.1, 0.1, 0.1);";
		break;

	case 'e': // equal
		spliceFunc = "radians("+input+" * "+assignVar+");";
		break;

	case 'E': // equal
		spliceFunc = "radians("+input+" * ceil("+input+"));";
		break;

	case 'f': // floor
		spliceFunc = "floor(vec4(4, 4, 4, 4) * "+input+");";
		break;
	
	case 'F': // fract
		spliceFunc = "fract("+input+");";
		break;

	case 'g': // return input, assign "+assignVar+"
		spliceFunc = input+";\n    "+assignVar+" = floor(vec4(4, 4, 4, 4) * "+input+");";
		break;

	case 'G': // return input, assign "+assignVar+"
		spliceFunc = input+";\n    "+assignVar+" = fract("+input+");";
		break;

	case 'h': // return input, assign "+assignVar+"
		spliceFunc = input+";\n    "+assignVar+" = sin("+input+");";
		break;

	case 'H': // return input, assign "+assignVar+"
		spliceFunc = input+";\n    "+assignVar+" = cos("+input+");";
		break;

	case 'i': // inverse sqrt
		spliceFunc = input+" / inversesqrt("+input+") - "+assignVar+";";
		break;
	
	case 'I': // invsqrt(1 / exp2)
		spliceFunc = input+" / inversesqrt(vec4(1, 1, 1, 1) / exp2("+input+")) - "+assignVar+";";
		break;

	case 'j': // return input, assign "+assignVar+"
		spliceFunc = input+";\n    "+assignVar+" = vec4(cross("+input+".xyz, "+assignVar+".xyz), "+assignVar+".w);";
		break;

	case 'J': // return input, assign "+assignVar+"
		spliceFunc = input+";\n    "+assignVar+" = "+assignVar+" * dot("+input+", "+assignVar+");";
		break;

	case 'k': // clamp
		spliceFunc = "clamp("+input+", floor(vec4(4, 4, 4, 4) * "+assignVar+"), "+assignVar+");";
		break;

	case 'K': // clamp
		spliceFunc = "clamp("+input+" * vec4(2, 2, 2, 2), "+assignVar+", ceil("+assignVar+"));";
		break;

	case 'l': // log2
		spliceFunc = input+" + log2("+input+");";
		break;
	
	case 'L': // log2(1 / log2)
		spliceFunc = "log2(vec4(1, 1, 1, 1) + log2("+input+"));";
		break;

	case 'm': // min
		spliceFunc = "min("+input+", "+assignVar+");";
		break;
	
	case 'M': // max
		spliceFunc = "max("+input+", "+assignVar+");";
		break;

	case 'n': // normalize
		spliceFunc = "normalize("+input+" * vec4(6, 0.6, 6, 0.6));";
		break;

	case 'N': // normalize
		spliceFunc = "normalize("+input+" / "+assignVar+");";
		break;

	case 'o': // min
		if(frag)
			spliceFunc = "min("+input+", vec4(1, 1, 1, 1) / gl_FragCoord);";
		else
			spliceFunc = "min("+input+", vec4(1, 1, 1, 1) / "+assignVar+");";
		break;

	case 'O': // max
		if(frag)
			spliceFunc = "max("+input+", vec4(1, 1, 1, 1) / gl_FragCoord);";
		else
			spliceFunc = "max("+input+", vec4(1, 1, 1, 1) / "+assignVar+");";
		break;

	case 'p': // pow
		spliceFunc = "pow("+assignVar+", "+input+");";
		break;

	case 'P': // pow pow
		spliceFunc = "pow("+assignVar+", pow("+assignVar+", "+input+"));";
		break

	case 'q': // sign value
		spliceFunc = "sign("+input+");";
		break;	

	case 'Q': // sign value
		spliceFunc = "sign("+input+" * "+assignVar+");";
		break;

	case 'r': // reflect
		spliceFunc = "reflect("+assignVar+", "+input+");";
		break;

	case 'R': // Refract
		spliceFunc = "refract("+assignVar+", "+input+", dot("+input+", "+assignVar+"));";
		break;	

	case 's': // step
		spliceFunc = "abs("+assignVar+" - reflect("+input+", "+assignVar+")) / "+input+";";
		break;
	
	case 'S': // smooth step
		spliceFunc = "faceforward("+input+", "+assignVar+", "+input+") + "+input+";";
		break;

	case 't': // cross
		spliceFunc = "vec4(cross("+input+".xyz, "+assignVar+".xyz), 1);";
		break;
	
	case 'T': // tangent
		spliceFunc = "tan("+input+");";
		break;	
	
	case 'u': // 
		spliceFunc = input+";\n    "+assignVar+" = tan("+input+");";
		break;

	case 'U': // 
		spliceFunc = input+";\n    "+assignVar+" = normalize("+input+");";
		break;

	case 'v': // sqrt
		spliceFunc = "sqrt("+input+");";
		break;

	case 'V': // var sqrt
		spliceFunc = input+"; "+assignVar+" = sqrt("+input+");";
		break;

	case 'w': // FaceForward
		spliceFunc = input+" - faceforward("+input+", "+assignVar+", "+input+");";
		break;

	case 'W': // FaceForward
		spliceFunc = input+" - faceforward("+input+", "+assignVar+", "+assignVar+");";
		break;

	case 'x': // mix
		spliceFunc = "mix("+input+", "+assignVar+", normalize("+assignVar+"));";
		break;
	
	case 'X': // mix
		spliceFunc = "mix("+input+", vec4(1, 1, 1, 1) / "+assignVar+", normalize("+assignVar+"));";
		break;

	case 'y': // mul
		spliceFunc = input + " * 1.111;";
		break;

	case 'Y': // mul
		spliceFunc = input + " * 0.666;";
		break;

	case 'z': // mul
		spliceFunc = input + " * vec4(-1, -1, -1, -1);";
		break;

	case 'Z': // mul
		spliceFunc = input+";\n    "+assignVar+" = "+input+" * vec4(-1, -1, -1, -1);";
		break;

	default:
		// spliceFunc = "atan("+input+", "+(character.charCodeAt(0) / 127)+");";
		spliceFunc = input+" + "+ (character.charCodeAt(0) / 127 * 0.2 - 0.1)+";";
		break;
	}

	// return "    "+input+" = "+spliceFunc+"\n     "+input+" = mod("+input+", vec4(1, 1, 1, 1));";
	return "    "+input+" = "+spliceFunc;
}

CloudChamber.shaderTemplate = function(vert, frag)
{
	return {
		uniforms: { 
			"tDiffuse": { type: "t", value: null }
		},

		vertexShader: [
			"varying vec4 a_variable;",
			"varying vec2 vUv;",
			"vec4 newPosition;",
			"void main()",
			"{",
			"    vUv = uv;",
			"    a_variable = vec4(position, 1);",
			"    newPosition = vec4(position, 1);",
			// vert,
			"    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);",
			"    // gl_PointSize = min(dot(newPosition.xyz, position), 1);",
			"}"
		].join("\n"),

		fragmentShader: [
			"uniform sampler2D tDiffuse;",
			"varying vec2 vUv;",
			"varying vec4 a_variable;",
			"vec4 frag_variable;",
			"vec4 fragColor;",
			"void main()",
			"{",
			"    frag_variable = a_variable;",
			"    fragColor = texture2D(tDiffuse, vUv);",
			frag,
			"    gl_FragColor = vec4(1, 1, 1, 1) - mod(fragColor + texture2DProj(tDiffuse, normalize(fragColor) - (vec4(vUv, vUv))) - (gl_FragColor), gl_FragColor);",
			"    // gl_FragColor = max(gl_FragColor, gl_FragCoord * 0.0001);",
			"}"
		].join("\n")
	};
}

CloudChamber.parsesplice = function(lang)
{
	var numFuncsPerShader = Math.floor(lang.length / 2);
	var vertArray = new Array(numFuncsPerShader);
	var fragArray = new Array(numFuncsPerShader);
	var vertVariable = "newPosition";
	var fragVariable = "fragColor";

	for(var i = 0; i < numFuncsPerShader; ++i)
	{
		vertArray.push(CloudChamber.parseSpliceChar(lang[i], vertVariable));
	}

	for(var i = 0; i < numFuncsPerShader; ++i)
	{
		fragArray.push(CloudChamber.parseSpliceChar(lang[i + numFuncsPerShader], fragVariable));
	}

	return CloudChamber.shaderTemplate(vertArray.join("\n"), fragArray.join("\n"));
}

function spliceShader(lang)
{
	var shader = CloudChamber.parsesplice(lang);
	CloudChamber.print(shader.vertexShader);
	CloudChamber.print("\n\n\n"+shader.fragmentShader);

	var pass = new THREE.ShaderPass(shader);
	pass.renderToScreen = true;
	
	for(var i = 0; i < CloudChamber.numShaders; ++i)
	{
		CloudChamber.composer.passes.pop();
	}

	CloudChamber.numShaders = 1;
	CloudChamber.composer.addPass(pass);
	return Lich.VM.Void;
}

_createPrimitive("spliceShader", spliceShader);

function randomString(length) // length
{
	var randString = new Array("");

	for(var i = 0; i < length; ++i)
	{
		randString.push(String.fromCharCode(Math.random() * 127));
	}

	return randString.join("");
}

_createPrimitive("randomString", randomString);

// NOTE: CACHE SHADERS UP TO 20 OF THEM, THEN START POPPING 

CloudChamber.decimalToHexString = function(number)
{
    if (number < 0)
    {
    	number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
}

CloudChamber.packRGB = function(r, g, b)
{
	return ((1 << 24) + (Math.floor(r) << 16) + (Math.floor(g) << 8) + Math.floor(b));
}

CloudChamber.rgbToHex = function(r, g, b) {
    return "0x" + CloudChamber.packRGB(r, g, b).toString(16).slice(1);
}

CloudChamber.arrayToVector = function(array)
{
	return {
		x: array[0],
		y: array[1],
		z: array[2]	
	}
}

CloudChamber.arrayToColor = function(array)
{
	return CloudChamber.packRGB(array[0], array[1], array[2]);
}

function setBackground(r, g, b)
{
	CloudChamber.renderer.setClearColorHex(CloudChamber.packRGB(r,g,b), 1);
	return CloudChamber.packRGB(r,g,b);
}

_createPrimitive("setBackground", setBackground);
