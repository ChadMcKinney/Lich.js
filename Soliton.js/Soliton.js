/* 
    Soliton.js - JavaScript audio framework
    Copyright (C) 2012 Chad McKinney

	http://chadmckinneyaudio.com/
	seppukuzombie@gmail.com

	All rights reserved.
	
	Licensed under the Modified BSD License

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:
	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.
	    * Neither the name of the <organization> nor the
	      names of its contributors may be used to endorse or promote products
	      derived from this software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
	DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var Soliton = {}; // Soliton namespace
Soliton.context = 0;
Soliton.buffers = {}; // Soliton.buffers namespace

window.addEventListener('load', init, false);

function init()
{
	try
	{
		Soliton.context = new webkitAudioContext(); // create the webkit audio context!
	}

	catch(e)
	{
		alert('Web Audio API is not supported in this browser');
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Soliton Functions
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Soliton.print = function(text) // You should probably redefine Soliton.print somewhere in your code!!!!
{
	console.log(text);
}

Soliton.printError = function(text) // You should probably redefine Soliton.print somewhere in your code!!!!
{
	console.error(text);
}


// Play a buffer into the destination
Soliton.playBuffer = function(buffer, destination)
{
	var source = Soliton.context.createBufferSource();
	source.buffer = buffer;

	if(destination == undefined)
		destination = Soliton.context.destination;

	source.connect(destination);
	source.noteOn(0);
	return source;
}

// Buffer a url with an optional name for storage, callback on finish, and optional destination (for callback function)
Soliton.bufferURL = function(url, name, callback, callbackDestination)
{
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

	// Decode asychronously
	request.onload = function()
	{
		Soliton.context.decodeAudioData(
			request.response, 
			
			function(buffer)
			{
				if(name != undefined)
					Soliton.buffers[name] = buffer;

				if(callback != undefined)
					callback(buffer, callbackDestination);
			}, 

			function()
			{
				var errorString = "Unable to load URL: ";
				errorString = errorString.concat(url);
				Soliton.printError(errorString);
			}
		);
	}

	request.send();
}

Soliton.bufferGarbage = function(size, name, callback, callbackDestination)
{
	var buffer;

	try
	{
		var NUM_CHANNELS = 1;
		var NUM_SAMPLES = size * Soliton.context.sampleRate;
		var reader = new FileReader();
		// Create buffer here!
		buffer = Soliton.context.createBuffer(NUM_CHANNELS, NUM_SAMPLES, Soliton.context.sampleRate);

		var audioChunk = new Int16Array(NUM_SAMPLES);
		var data = new Array(NUM_SAMPLES);
		
		for(var i = 0; i < NUM_SAMPLES; ++i)
		{

			data[i] = i % 800 - 10 * 0.1;
		}

		audioChunk.set(data, 0);

		buffer.getChannelData(0).set(audioChunk);

		/*
		var bufferView = new Uint16Array(buffer);

		for(var i = 0; i < bufferView.size(); ++i)
		{
			var printString = "Garbage[";
			printString = printString.concat(i).concat("]: ").concat(bufferView[i]);
			Soliton.print(printString);
		}

		delete bufferView;*/

		if(name != undefined)
			Soliton.buffers[name] = buffer;

		if(callback != undefined)
			callback(buffer, callbackDestination);
	}

	catch(e)
	{
		Soliton.printError(e);
	}
}

// Play a url with an optional name for the buffer that will be created to store the audio and optional destination
Soliton.playURL = function(url, name, destination)
{
	if(name == undefined)
		name = url;

	if(destination == undefined)
		destination = Soliton.context.destination;

	Soliton.bufferURL(url, name, Soliton.playBuffer, destination);
}

// Play a buffer fille with garbage with an optional name for the buffer that will be created to store the audio and optional destination
Soliton.playGarbage = function(size, name, destination)
{
	if(name == undefined)
		name = size;

	if(destination == undefined)
		destination = Soliton.context.destination;

	Soliton.bufferGarbage(size, name, Soliton.playBuffer, destination);
}