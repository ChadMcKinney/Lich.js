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
        loadFile(urls[i], i, partialCallback, errorCallback);
    }
}

CloudChamber.loadShaders = function(vertName, fragName)
{
	loadFiles([vertName, fragName], CloudChamber.setShaders, 
		function(url)
		{
			alert('CLOUD CHAMBER: Failed to download "' + url + '"');
		}
	);
}

CloudChamber.setShaders = function(shaders) // An array of shader programs as a string array [0] vert [1] frag
{
	var vertexShader = CloudChamber.gl.createShader(CloudChamber.gl.VERTEX_SHADER);
	CloudChamber.gl.shaderSource(vertexShader, document.getElementById("vertex_shader").text);
	CloudChamber.gl.compileShader(vertexShader);
	
	var compiled = CloudChamber.gl.getShaderParameter(vertexShader, CloudChamber.gl.COMPILE_STATUS);
	if(!compiled)
		CloudChamber.print("ERROR COMPILING VERTEX  SHADER");

	var fragmentShader = CloudChamber.gl.createShader(CloudChamber.gl.FRAGMENT_SHADER);
	CloudChamber.gl.shaderSource(fragmentShader, document.getElementById("fragment_shader").text);
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
	if(CloudChamber.framerate <= 0 || CloudChamber.framerate == undefined)
		CloudChamber.print("CLOUD CHAMBER: FRAMERATE IS <= 0 OR UNDEFINED. NOT STARTING.");
	else
		CloudChamber.timer = setTimeout(CloudChamber.draw, CloudChamber.ONE_SECOND_IN_MILLIS / CloudChamber.framerate);
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
		CloudChamber.gl.bindFramebuffer(CloudChamber.gl.FRAMEBUFFER, null);		
    	CloudChamber.gl.viewport(0, 0, CloudChamber.gl.viewportWidth, CloudChamber.gl.viewportHeight);
    	CloudChamber.gl.clear(CloudChamber.gl.COLOR_BUFFER_BIT);
		
		mat4.identity(CloudChamber.modelMatrix);
		
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

		mat4.multiply(CloudChamber.viewMatrix, CloudChamber.modelMatrix, CloudChamber.mvpMatrix);
		mat4.multiply(CloudChamber.projectionMatrix, CloudChamber.mvpMatrix, CloudChamber.mvpMatrix);
		CloudChamber.gl.uniformMatrix4fv(CloudChamber.mvpMatrixHandle, false, CloudChamber.mvpMatrix);
		CloudChamber.gl.drawArrays(CloudChamber.gl.TRIANGLES, 0, 3);

		CloudChamber.gl.flush();
		window.requestAnimFrame(CloudChamber.draw, CloudChamber.canvas);

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
	CloudChamber.gl = WebGLUtils.setupWebGL(CloudChamber.canvas);
	CloudChamber.gl.viewport(0, 0, CloudChamber.canvas.clientWidth, CloudChamber.canvas.clientHeight);
	CloudChamber.projectionMatrix = mat4.create();
	CloudChamber.viewMatrix = mat4.create();
	CloudChamber.modelMatrix = mat4.create();
	CloudChamber.mvpMatrix = mat4.create();
	CloudChamber.mvpMatrixHandle = 0;
	CloudChamber.positionHandle = 0;
	CloudChamber.colorHandle = 0;
	
	CloudChamber.framerate = framerate;
	CloudChamber.drawCallback = drawCallback;
	CloudChamber.printCallback = printCallback
	CloudChamber.timer = 0;
	CloudChamber.vert = "uniform mat4 mvpMatrix; attribute vec4 position; attribute vec4 color; varying vec4 vColor; void main() { vColor = color; gl_Position = position * mvpMatrix; }";
	CloudChamber.frag = "varying vec4 vColor; void main() { gl_FragColor = vColor; }";
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
	CloudChamber.gl.clearColor(0.9, 0.9, 0.9, 1);

	var eye = vec3.create();
	eye[0] = 0;
	eye[1] = 0;
	eye[2] = 1.5;

	var look = vec3.create();
	look[0] = 0;
	look[1] = 0;
	look[2] = -5;

	var up = vec3.create();
	up[0] = 0;
	up[1] = 1;
	up[2] = 0;

	mat4.lookAt(eye, look, up, CloudChamber.viewMatrix);
	CloudChamber.setShaders([CloudChamber.vert, CloudChamber.frag]);

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
	CloudChamber.checkGLError();

	window.requestAnimFrame(CloudChamber.draw, CloudChamber.canvas);
	CloudChamber.print("CloudChamber created.");
}

/******************************************************************************************************************
*	VboMesh - GL style mesh with support for drawing and materials
*
******************************************************************************************************************/

CloudChamber.VboMesh = function(numVertices, numIndices, glPrimitiveType)
{
	CloudChamber.numVertices = numVertices;
	CloudChamber.numIndices = numIndices;
	CloudChamber.glPrimitiveType = glPrimitiveType;
}