/* 
    Soliton.js - JavaScript audio framework
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Soliton Functions
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Adding inheritance
Function.prototype.inheritsFrom = function(parentClassOrObject)
{ 
	if(parentClassOrObject.constructor == Function) 
	{ 
		//Normal Inheritance 
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} 
	
	else 
	{ 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	} 
	
	return this;
} 

Soliton.print = function(text) // You should probably redefine Soliton.print somewhere in your code!!!!
{
	console.log(text);
}

Soliton.printError = function(text) // You should probably redefine Soliton.print somewhere in your code!!!!
{
	console.error(text);
}

Soliton.roundUp = function(inval, quant)
{
	return quant == 0.0 ? inval : Math.ceil(inval / quant) * quant;
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

// Buffer a url with an optional name for storage, callback on finish, 
// and optional destination (for callback function)
Soliton.bufferURL = function(url, name, callback, callbackDestination)
{
	if(!Soliton.buffers.hasOwnProperty(name))
	{
		Soliton.print("Downloading audio...");
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

	else
	{
		Soliton.print("Already Downloaded!");
		if(callback != undefined)
			callback(Soliton.buffers[name], callbackDestination);
	}
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

// Play a buffer fille with garbage with an optional name for the buffer that will be created to store the audio 
// and optional destination
Soliton.playGarbage = function(size, name, destination)
{
	if(name == undefined)
		name = size;

	if(destination == undefined)
		destination = Soliton.context.destination;

	Soliton.bufferGarbage(size, name, Soliton.playBuffer, destination);
}

/////////////////////////////////////////////////////////////////////////////////////////
// Soliton Classes
/////////////////////////////////////////////////////////////////////////////////////////

// Most of this code is translated from the SuperCollider class library. Many thanks to the devs.

//////////
// Object
//////////
Soliton.Object = function() // Abstract class for Soliton objects. Override these methods!
{
	this.yield = function()
	{

	}

	this.value = function()
	{
		return null;
	}

	// Stream support
	this.asStream = function()
	{
		return this;
	}

	this.next = function(inval)
	{
		return this;
	}

	this.reset = function()
	{
		return this;
	}

	this.first = function(inval)
	{
		this.reset();
		return this.next(inval);
	}

	this.stop = function()
	{
		return this;
	}

	this.removedFromScheduler = function()
	{
		return this;
	}

	this.isPlaying = function()
	{
		return false;
	}

	this.embedInStream = function()
	{
		return this;
	}

	this.eventAt = function(key)
	{
		return null;
	}

	this.do = function(func)
	{
		func(this, 0);
	}

	this.processRest = function(inval)
	{
		return this;
	}
}

/////////////////////
// Array (extension)
/////////////////////
Array.prototype.do = function(func)
{
	for(var i = 0; i < this.length; ++i)
	{
		func(this[i], i);
	}
}

/////////////
// TimeQueue
/////////////

Soliton.TimeQueue = function()
{
	var array = new Array();

	this.getArray = function()
	{
		return array;
	}

	this.timeSort = function(a, b) // Later times to earlier, descending
	{
		return b.time - a.time;
	}

	this.put = function(_time, _value)
	{
		array.push(
			{
				time: _time,
				value: _value
			}
		);

		array.sort(this.timeSort);
	}

	this.pop = function()
	{
		if(array.length > 0)
			return array.pop().value;
		else
			return null;
	}

	this.topPriority = function()
	{
		if(array.length > 0)
			return array[array.length - 1].time;
		else
			return null;

	}

	this.clear = function()
	{
		array = new Array();
	}

	this.isEmpty = function()
	{
		return array.length == 0;
	}

	this.notEmpty = function()
	{
		return array.length != 0;
	}

	this.removeValue = function(value)
	{
		var newObject = new Soliton.TimeQueue();
		var currentPriority, topObject;

		while(this.notEmpty())
		{
			currentPriority = this.topPriority();
			topObject = this.pop();

			if(topObject != value)
			{
				newObject.put(currentPriority, topObject);
			}
		}

		this.array = newObject.getArray();
	}

	this.do = function(func)
	{
		for(var i = 0; i < this.array.length; ++i)
		{
			func(this.array[i].time, this.array[i].value);
		}
	}
}

Soliton.TimeQueue.inheritsFrom(Soliton.Object);

/////////////////
// Dictionary
/////////////////

Soliton.Dictionary = function(n)
{
	this.n = typeof n !== 'undefined' ? n : 8;
	this.namespace = {};

	this.has = function(key)
	{
		return this.namespace.hasOwnProperty(key);
	}

	this.includesKey = function(key)
	{
		return this.has(key);
	}

	this.at = function(key)
	{
		if(this.has(key))
		{
			return this.namespace[key];
		}

		else
		{
			return null;
		}
		
	}

	this.put = function(key, value)
	{
		this.namespace[key] = value;
	}

	this.keys = function()
	{
		var keyArray = new Array();

		for(var i in this.namespace)
		{
			if(this.has(i))
			{
				keyArray.push(i);
			}
		}

		return keyArray;
	}

	this.values = function()
	{
		var valueArray = new Array();

		for(var i in this.namespace)
		{
			if(this.has(i))
			{
				valueArray.push(this.namespace[i]);
			}
		}

		return valueArray;
	}

	this.removeAt = function(key)
	{
		if(this.has(key))
			this.namespace[key] = null;
	}

	this.copy = function()
	{
		var dict = new Soliton.Dictionary();
		var newNamespace = {};

		for(var i in this.namespace)
		{
			if(this.has(i))
			{
				newNamespace[i] = this.namespace[i];
			}
		}

		dict.namespace = newNamespace;
		return dict;
	}

	/////////////////
	// Quant Support
	/////////////////

	this.nextTimeOnGrid = function(clock)
	{
		if(this.has('nextTimeOnGrid')) 
		{
			return this.at('nextTimeOnGrid').value(this, clock);
		} 

		else
		{
			var quant = this.at('quant') != null ? this.at('quant') : 1;
			var phase = this.at('phase') != null ? this.at('phase') : 0;
			var offset = this.at('offset') != null ? this.at('offset') : 0;

			return clock.nextTimeOnGrid(quant, phase - offset);
		}
	}
	
	this.asQuant = function()
	{
		return this.copy();
	}

	this.timingOffset = function()
	{
		return this.at('timingOffset'); 
	}		// for synchWithQuant()
}

Soliton.Dictionary.inheritsFrom(Soliton.Object);

///////////////
// Environment
///////////////

Soliton.Environment = function()
{
	this.make = function(func)
	{
		var saveEnvir = Soliton.Environment.currentEnvironment;
		Soliton.Environment.currentEnvironment = this;

		try
		{
			func(this);
		}

		catch(e)
		{
			Soliton.Environment.currentEnvironment = saveEnvir;
		}
	}

	this.use = function(func)
	{
		var result = null;
		var saveEnvir = Soliton.Environment.currentEnvironment;
		Soliton.Environment.currentEnvironment = this;

		try
		{
			result = func(this);
		}

		catch(e)
		{
			Soliton.Environment.currentEnvironment = saveEnvir;
		}

		return result;
	}

	this.eventAt = function(key)
	{
		return this.at(key);
	}

	this.pop = function()
	{
		Soliton.Environment.pop();
	}

	this.push = function()
	{
		Soliton.Environment.push(this);
	}
}

// Static vars
Soliton.Environment.currentEnvironment = new Soliton.Environment();
Soliton.Environment.stack = new Array();


// Static functions
Soliton.Environment.make = function(func)
{
	return new Soliton.Environment().make(func);
}

Soliton.Environment.use = function(func)
{
	return new Soliton.Environment().use(func);
}

Soliton.Environment.pop = function()
{
	if(Soliton.Environment.length > 0)
		Soliton.Environment.currentEnvironment = Soliton.Environment.stack.pop();
}

Soliton.Environment.push = function(envir)
{
	Soliton.Environment.stack.push(currentEnvironment);
	Soliton.Environment.currentEnvironment = envir;
}

Soliton.Environment.inheritsFrom(Soliton.Dictionary);

/////////////
// Event
/////////////
Soliton.Event = function(n, proto, parent, know)
{
	this.n = typeof n !== 'undefined' ? n : 8;
	this.proto = proto;
	this.parent = parent;
	this.know = typeof know !== 'undefined' ? know : true;
	
	this.namespace = {
		'type': 'note',
		'mtranspose': 0,
		'gtranspose': 0.0,
		'ctranspose': 0.0,

		'octave': 5.0,
		'root': 0.0,					// root of the scale
		'degree': 0,
		'scale': new Array(0, 2, 4, 5, 7, 9, 11), 	// diatonic major scale
		'stepsPerOctave': 12.0,
		'detune': 0.0,					// detune in Hertz
		'harmonic': 1.0,				// harmonic ratio
		'octaveRatio': 2.0,
		'freq': 440,
		'amp': 1,
		'pan': 0,
		'play': { value: function() { return null } }, // null play
		'tempo': null,
		'dur': 1.0,
		'stretch': 1.0,
		'legato': 0.8,
		'sustain': function(_self) 
		{ 
			return function() 
			{ 
				_self.at('dur') * _self.at('legato') * _self.at('stretch') 
			} 
		} (this),
		'lag': 0.0,
		'strum': 0.0,
	}

	

	this.delta = function() 
	{
		if(this.has('delta'))
		{
			return this.at('delta');
		}

		else
		{
			// Soliton.print("STEP 13: Event.delta");
			if(this.at('dur') == null)
				return null;
			else
				return this.at('dur') * this.at('stretch');
		}
	}
	
	this.play = function() 
	{
		if(this.parent == null) 
		{
			this.parent = Soliton.Event.defaultParentEvent;
		}

		this.at('play').value();

		/*
		this.use {
			this[\play].value;
		};*/
	}
	this.playAndDelta = function(cleanup, mute)
	{
		// Soliton.print("STEP 12: Event.playAndDelta");
		if(mute) { this.put('type', 'rest') };
		// cleanup.update(this);
		this.play();
		return this.delta();
	}

	// this[\isRest] may be nil
	this.isRest = function() 
	{
		if(this.has('isRest'))
		{
			return this.at('isRest');
		}

		else
		{
			if(this.has('type'))
			{
				return this.at('type') == 'rest';
			}

			else
			{
				if(this.parent == null)
					this.parent = Soliton.Event.defaultParentEvent;

				return this.parent.freq.value().isRest();
			}
		}
	}

	this.copy = function()
	{
		var event = new Soliton.Event();
		var newNamespace = {};

		for(var i in this.namespace)
		{
			if(this.has(i))
			{
				newNamespace[i] = this.namespace[i];
			}
		}

		event.namespace = newNamespace;
		return event;
	}
}

Soliton.Event.inheritsFrom(Soliton.Environment);

///////////
// Number
///////////
/*
Soliton.Number = function(number)
{
	this.number = number;

	this.value = function(inval)
	{
		return this.number;
	}

	this.next = function(inval)
	{
		return this;
	}
}*/

// Extend number to support streaming
Number.prototype.value = function(inval)
{
	return this;
}

Number.prototype.next = function(inval)
{
	return this;
}

Number.prototype.asStream = function()
{
	return this;
}

Number.prototype.embedInStream = function(inval)
{
	return this;
}

Number.prototype.do = function(func)
{
	for(var i = 0; i < this; ++i)
	{
		func(i, i);
	}
}

// Soliton.Number.inheritsFrom(Soliton.Object);
// Number.inheritsFrom(Soliton.Object);

/////////////
// Quant
/////////////
Soliton.Quant = function(quant, phase, timingOffset)
{
	this.quant = typeof quant !== 'undefined' ? quant : 0;
	this.phase = typeof phase !== 'undefined' ? phase : 0;
	this.timingOffset = typeof timingOffset !== 'undefined' ? timingOffset : 0;

	this.nextTimeOnGrid = function(clock)
	{
		// Soliton.print("Quant.nextTimeOnGrid: clock.nextTimeOnGrid");
		return new Soliton.Quant(clock.nextTimeOnGrid(this.quant, this.phase - this.timingOffset));;
	}

	this.value = function()
	{
		return this.quant;
	}

	this.copy = function()
	{
		return new Soliton.Quant(this.quant, this.phase, this.timingOffset);
	}

	this.asQuant = function()
	{
		return this.copy();
	}
}

/////////////
// Scheduler
/////////////
Soliton.Scheduler = function(clock, drift, recursive)
{
	var queue = new Soliton.TimeQueue();
	var expired = new Array();
	var scheduleID = 0;
	var startTime = 0;
	var lastElapsedTime = startTime;
	var drift = typeof drift !== 'undefined' ? drift : false;
	var recursive = typeof recursive !== 'undefined' ? recursive : false;
	this.beats = 0.0;
	this.seconds = 0.0;
	this.clock = clock;

	this.play = function(task, quant)
	{
		this.sched(task, 0);
	}

	this.sched = function(task, delta)
	{
		var fromTime;

		if(delta != null)
		{
			if(drift)
				fromTime = startTime; // Should be an equivalent to Main.ElapsedTime
			else
				fromTime = this.seconds;

			// Soliton.print("Scheduler.sched: fromTime = " + fromTime);
			// Soliton.print("Scheduler.sched: this.seconds = " + this.seconds);
			// Soliton.print("Scheduler.sched: fromTime + delta.value(): " + (fromTime + delta.value()));
			queue.put(fromTime + delta.value(), task);
		}
	}

	this.schedAbs = function(task, delta)
	{
		// Soliton.print("Scheduler.schedAbs.delta: " + delta.value());
		queue.put(delta.value(), task);
	}

	this.clear = function()
	{
		queue.do(function(delta, value)
		{
			value.removedFromScheduler();
		});

		queue.clear();
	}

	this.isEmpty = function()
	{
		return queue.isEmpty();
	}

	this.wakeup = function(task)
	{
		var delta;
		delta = task.awake(this.beats, this.seconds, this.clock);
		
		if(delta != null)
		{
			this.sched(task, delta);
		}
	}

	this.setSeconds = function(newSeconds)
	{
		if(recursive)
		{
			this.seconds = queue.topPriority();
			while(this.seconds != null && this.seconds <= newSeconds)
			{
				this.beats = this.clock.seconds2beats(seconds);
				this.wakeup(queue.pop());
				this.seconds = queue.topPriority();
			}
		}

		else
		{
			this.seconds = queue.topPriority();
			while(this.seconds != null && this.seconds <= newSeconds)
			{
				// Soliton.print("Scheduler.setSeconds: this.seconds = " + this.seconds);

				expired.push({
					time: this.seconds,
					value: queue.pop()
				});

				this.seconds = queue.topPriority();
			}

			for(var i = 0; i < expired.length; ++i)
			{
				this.seconds = expired[i].time;
				this.wakeup(expired[i].value);
			}

			expired = new Array();
		}

		this.seconds = newSeconds;
		// Soliton.print("Scheduler.setSeconds: this.seconds = " + this.seconds);
		this.beats = this.clock.seconds2beats(newSeconds);
	}

	this.advance = function(delta)
	{
		this.setSeconds(this.seconds + delta);
	}
}

/////////////
// Clock
/////////////
Soliton.Clock = function(tempo, beats, seconds, queueSize, sleepTime) // TempoClock
{
	this.sleepTime = sleepTime; // Millis to sleep between checking time.
	this.startTime = new Date().getTime();
	this.lastElapsedTime = 0;
	this.scheduler = new Soliton.Scheduler(this, false, false);
	this.ptr = null; // 1?!?!?
	this.tempo = tempo;
	this.beats = beats;
	this.seconds = seconds;
	this.queueSize = typeof queueSize !== 'undefined' ? queueSize : 256;
	this.beatsPerBar = 4.0;
	this.barsPerBeat = 0.25;
	this.baseBarBeat = 0.0;
	this.baseSeconds = 1.0;
	this.baseBar = 0.0;
	this.baseBeats = beats;
	this.baseSeconds = seconds;
	this.permanent = false;
	this.queue = new Array();

	this.play = function(task, quant)
	{
		quant = typeof quant !== 'undefined' ? quant : Soliton.Quant.default;
		this.schedAbs(task, quant.nextTimeOnGrid(this));
	}

	this.sched = function(task, quant)
	{
		this.scheduler.sched(task, quant);
	}

	this.schedAbs = function(task, quant)
	{
		this.scheduler.schedAbs(task, quant);
	}

	this.beats2seconds = function(beats)
	{
		return ((beats - this.baseBeats) * this.beatDur) + this.baseSeconds;
	}

	this.seconds2beats = function(seconds)
	{
		return ((seconds - this.baseSeconds) * this.tempo) + this.baseBeats;
	}

	this.nextTimeOnGrid = function(quant, phase)
	{
		quant = typeof quant !== 'undefined' ? quant : Soliton.Quant.default.value();
		phase = typeof phase !== 'undefined' ? phase : 0;

		if(quant == 0)
		{
			return this.seconds2beats(this.seconds) + phase;;
		}

		if(quant < 0)
		{
			quant = this.beatsPerBar * (quant * -1);
		}

		if(phase < 0)
		{
			phase = phase % quant;
		}

		return Soliton.roundUp(this.beats - this.baseBarBeat - (phase % quant), quant) + this.baseBarBeat + phase;
	}

	this.run = function()
	{
		var time = new Date().getTime() - this.startTime;
		this.scheduler.advance((time - this.lastElapsedTime) / 1000);
		this.lastElapsedTime = time;
		this.seconds = this.lastElapsedTime / 1000.0;
		this.beats = this.seconds2beats(this.seconds);

		// Soliton.print(time);
	}

	this.stop = function()
	{
		clearInterval(scheduleID);
	}

	this.start = function()
	{
		this.startTime = new Date().getTime();

		this.scheduleID = setInterval(
			(
				function(self) 
				{
    				return function() { self.run(); } 
    			}
    		)(this), 
    		this.sleepTime
    	);
	}

	this.setTempoAtBeat = function(tempo, beats)
	{
		this.tempo = tempo;
		Soliton.print("new Tempo: " + tempo);
	}

	this.setTempoAtTime = function(tempo, seconds)
	{
		this.tempo = tempo;
		Soliton.print("new tempo: " + tempo);
	}

	this.setAll = function(tempo, beats, seconds)
	{

	}

	this.setAll = function(tempo, beats, seconds)
	{

	}

	this.elapsedBeats = function()
	{
		return this.seconds2beats(this.seconds);
	}

	this.clear = function()
	{
		this.scheduler.clear();
	}

	this.getTempo = function()
	{
		return this.tempo;
	}

	this.getBeatDur = function()
	{
		return this.beatDur;
	}

	this.start(); // Automatically start on creation
}

///////////
// Stream
///////////
Soliton.Stream = function()
{
	this.reset = function()
	{

	}

	this.yield = function()
	{
		return null; // override this
	}

	this.next = function(inval)
	{
		return null; // override this
	}

	this.value = function(inval)
	{
		return this.next(inval);
	}

	this.embedInStream = function(inval)
	{
		var outval = this.value(inval);
		
		while(outval != null)
		{
			inval = outval.yield;
		}

		return inval;
	}

	this.asStream = function()
	{
		return this;
	}

	this.play = function(clock, quant)
	{
		Soliton.print("Soliton.Stream.play");
		clock = typeof clock !== 'undefined' ? clock : Soliton.Clock.default;
		quant = typeof quant !== 'undefined' ? new Soliton.Quant(quant) : Soliton.Quant.default;
		clock.play(this, quant.asQuant());
	}
}

Soliton.Stream.inheritsFrom(Soliton.Object);

///////////////
// FuncStream
///////////////

Soliton.FuncStream = function(nextFunc, resetFunc)
{
	this.nextFunc = typeof nextFunc !== 'undefined' ? nextFunc : null;
	this.resetFunc = typeof resetFunc !== 'undefined' ? resetFunc : null;
	this.envir = Soliton.Environment.currentEnvironment;

	this.next = function(inval)
	{
		return this.envir.use(function(self)
		{
			return function(envir)
			{
				// return self.nextFunc(inval).processRest(inval);
				return self.nextFunc(inval)
			}
		}(this));
	}

	this.reset = function()
	{
		return this.envir.use(function(self)
		{
			return function()
			{
				return self.resetFunc();
			}
		}(this));
	}
}

Soliton.FuncStream.inheritsFrom(Soliton.Stream);

//////////////
// Thread
//////////////
Soliton.Thread = function(func, stackSize)
{
	this.func = func;
	this.stackSize = typeof stackSize !== 'undefined' ? stackSize : 512;
	
	this.init = function()
	{
		this.state = 2; //Soliton.Thread.Init
		this.method = null;
		this.block = null;
		this.frame = null;
		this.ip = 0;
		this.sp = 0;
		this.numpop = 0;
		this.receiver = null;
		this.numArgsPushed = 0;
		this.parent = null;
		this.terminalValue= null;
		this.primitiveError = 0;
		this.primitiveIndex = 0;
		this.randData = 0;
		this.beats = 0.0;
		this.seconds = 0.0;
		// Currently there is no distinction between app and system clocks
		this.clock = null; 
		this.nextBeat = null;
		this.endBeat = null;
		this.endValue = null;
		this.environment = null;
		this.exceptionHandler= null;
		this.threadPlayer = null;
		this.executingPath = null;
		this.oldExecutingPath = null;
	}

	this.init();	

	this.copy = function()
	{
		return this;
	}

	this.setClock = function(inClock)
	{
		this.clock = inClock;
		this.beats = this.clock.seconds2beats(this.seconds);
	}

	this.setSeconds = function(inSeconds)
	{
		this.seconds = inSeconds;
		this.beats = this.clock.seconds2beats(this.seconds);
	}

	this.setBeats = function(inBeats)
	{
		this.beats = inBeats;
		this.seconds = this.clock.beats2seconds(this.beats);
	}

	this.isPlaying = function()
	{
		return this.state == 5; // Use enum?
	}

	this.threadPlayer = function()
	{
		var player = typeof this.threadPlayer !== 'undefined' ? this.threadPlayer : this.findThreadPlayer();
		return player;
	}

	this.findThreadPlayer = function()
	{
		var parent = this.parent;
		if(parent != null) // && !== thisProcess.mainThread
		{
			return parent.threadPlayer();
		}

		else
		{
			return this;
		}
	}

	this.handleError = function(error)
	{
		var handler = typeof this.exceptionHandler !== 'undefined' ? this.exceptionHandler : this.parent;
		
		if(handler != null)
			handler.handleError(error);
	}

	this.next = function()
	{
		return this;
	}

	this.value = function()
	{
		return this;
	}

	this.valueArray = function()
	{
		return this;
	}
}

// State Enum
Soliton.Thread.Suspended = 0;
Soliton.Thread.Done = 1;
Soliton.Thread.Init = 2;
Soliton.Thread.Running = 3;

Soliton.Thread.inheritsFrom(Soliton.Stream);


/////////////
// Routine
/////////////

Soliton.Routine = function(func, stackSize)
{
	this.func = func; // Must take an inval parameter
	this.stackSize = typeof stackSize !== 'undefined' ? stackSize : 512;

	this.yield = function()
	{
		this.state = Soliton.Thread.Suspended;
		return null;
	}

	this.resume = function(inval)
	{
		this.state = Soliton.Thread.Running;
		return this.func(inval);
	}

	this.next = function(inval)
	{
		return this.resume(inval);	
	}

	this.value = function(inval)
	{
		return this.resume(inval);
	}

	this.run = function(inval)
	{
		return this.resume(inval);
	}

	this.valueArray = function(inval)
	{
		return this.value(inval);
	}

	this.reset = function()
	{
		if(this.state == Soliton.Thread.Suspended ||
			this.state == Soliton.Thread.Done)
		{
			this.init();
		}
	}

	this.stop = function()
	{
		this.state = Soliton.Thread.Done;
	}

	// Private
	var awake = function(inBeats, inSeconds, inClock)
	{
		this.state = Soliton.Thread.Running;
		return this.next(inBeats);
	}

	this.prStart = function(inval)
	{
		this.func.value(inval);
		this.state = Soliton.Thread.Running;
		// nil.alwaysYield !?!? Not sure if this is right
		// this.parent.yield(); 
		// switchToThread(parent, tDone);
	}
}

// static functions
Soliton.Routine.run = function(func, stackSize, clock, quant)
{
	var routine = new Soliton.Routine(func, stackSize);
	return routine.play(clock, quant);
} 

Soliton.Routine.inheritsFrom(Soliton.Thread);

//////////////////////
// EventStreamPlayer
//////////////////////
Soliton.EventStreamPlayer = function(stream, event)
{
	this.event =  typeof event !== 'undefined' ? event : Soliton.Event.default;
	this.originalStream = typeof stream !== 'undefined' ? stream : new Soliton.Stream();
	this.stream = null;
	this.isWaiting = false;
	this.nextBeat = null;
	this.streamHasEnded = false;
	this.cleanup = null;
	this.muteCount = 0;
	this.routine = new Soliton.Routine(
		(
			function(_self)
			{
				return function(inTime) 
				{ 
					// loop { inTime = _self.next(inTime).yield } 
					this.inTime = _self.next(inTime);
					this.yield;
				}
			}
		)(this)
	);

	this.awake = function(beats, seconds, inClock)
	{
		this.stream.beats = beats;
		return this.next(beats);
	}

	this.reset = function()
	{
		this.routine.reset();
		// super.reset();
	}

	this.mute = function()
	{
		this.muteCount += 1;
	}

	this.unmute = function()
	{
		this.muteCount -= 1;
	}

	this.isPlaying = function()
	{
		return this.stream != null;
	}

	this.value = function(inval)
	{
		return this.next(inval);
	}

	this.do = function(func, inval)
	{
		var item = this.next(inval);
		var i = 0;

		while(item != null)
		{
			func(item, i);
			++i;
			item = this.next(inval);
		}
	}

	this.awake = function(beats, seconds, inClock)
	{
		// Soliton.print("STEP 9: EventStreamPlayer.awake");
		this.stream.beats = beats;
		return this.next(beats)
	}

	this.reset = function()
	{
		this.originalStream.reset();
	}

	this.refresh = function()
	{
		this.stream = this.originalStream;
	}

	this.stop = function()
	{
		this.stream = null;
		this.isWaiting = false;
	}

	this.start = function(clock, quant)
	{
		clock = typeof clock !== 'undefined' ? clock : Soliton.Clock.default;
		this.play(clock, true, new Soliton.Quant(quant));
	}

	this.resume = function(clock, quant)
	{
		clock = typeof clock !== 'undefined' ? clock : Soliton.Clock.default;
		this.play(clock, false, new Soliton.Quant(quant));
	}

	this.removedFromScheduler = function()
	{
		this.stop();
		this.nextBeat = null;
	}

	this.play = function(clock, doReset, quant)
	{
		// Soliton.print("STEP 7: EventStreamPlayer.play");
		doReset = typeof doReset !== 'undefined' ? doReset : false;
		quant = typeof quant !== 'undefined' ? new Soliton.Quant(quant) : Soliton.Quant.default;

		if(this.stream != null)
		{
			Soliton.print("EventStream Already playing.");
			return this;
		}

		if(doReset)
		{
			this.reset();
		}

		this.streamHasEnded = false;
		this.refresh();
		this.isWaiting = true;
		
		/*
		var task = function(clock) // Start our EventStream on a downbeat
		{
			if(this.isWaiting && (this.nextBeat == null))
			{
				clock.sched(this, 0);
				this.isWaiting = false;
			}
		}*/

		var clock = typeof clock !== 'undefined' ? clock : Soliton.Clock.default;

		// This is really crazy looking, yes? We're returning an anonymous function that resolves _self to this
		// instance of EventStreamPlayer. So that scheduler can call .awake we assign it in an associative array.
		var task = (
			function(_self) 
			{
				var taskFunc = function(beats, seconds, inClock) // Start our EventStream on a downbeat
				{
					// Soliton.print("STEP 8: EventStreamPlayer taskFunc");
					if(_self.isWaiting && (_self.nextBeat == null))
					{
						inClock.sched(_self, new Soliton.Quant(0));
						_self.isWaiting = false;
					}

					return null;
				}

    			return { awake: taskFunc };
    		}
    	)(this);

    	clock.play(task, quant.asQuant());
	}

	this.next = function(inval)
	{
		// Soliton.print("STEP 10: EventStreamPlayer.next");
		var nextTime = null;
		var outEvent = this.stream.next(this.event.copy());

		if(outEvent == null)
		{
			// Soliton.print("STEP 11A: outEvent == Null: GAMEOVER MAN");
			this.streamHasEnded = this.stream != null;
			// EventStreamClean?!?!?
			this.removedFromScheduler();
			return null;
		}

		else
		{
			// Soliton.print("STEP 11B: outEvent != Null");
			nextTime = outEvent.playAndDelta(this.cleanup, this.muteCount > 0);
			
			if(nextTime == null)
			{
				// Soliton.print("STEP 14A: nextTime == null EventStreamPlayer.removedFromScheduler");
				this.removedFromScheduler();
				return null;
			}

			// Soliton.print("STEP 14B: nextTime != null this.nextBeat = inval + nextTime");
			this.nextBeat = inval + nextTime; // inval is current logical beat
			// Soliton.print("EventStreamPlayer.inval: " + inval);
			return nextTime;
		}

		return null;	
	}

	this.put = function(item)
	{

	}

	this.asEventStreamPlayer = function()
	{ 
		return this 
	}
}

Soliton.EventStreamPlayer.inheritsFrom(Soliton.Stream);

/////////////
// Pattern
/////////////

Soliton.Pattern = function()
{
	this.play = function(clock, protoEvent, quant)
	{
		// Soliton.print("STEP 2: Play the Pbind");
		return this.asEventStreamPlayer(protoEvent).play(clock, false, quant);
	}

	// phase causes pattern to start somewhere in the current measure rather than on a downbeat
	// offset allows pattern to compute ahead a bit to allow negative lags for strummed chords
	// and to ensure one pattern computes ahead of another

	this.asStream = function()
	{
		// Soliton.print("STEP 4: this.asStream");
		// Create an anonymous function to transfer 'this' correctly, creating a routine to call embedInsStream
		return (
			function(self) 
			{
				// Soliton.print("STEP 5: new Soliton.Routine()");
				return new Soliton.Routine(function(inval) { return self.embedInStream(inval); }); 
			}
		)(this); 
	}

	this.iter = function()
	{
		return this.asStream();
	}

	this.asEventStreamPlayer = function(protoEvent)
	{
		// Soliton.print("STEP 3: this.asEventStreamPlayer");
		return new Soliton.EventStreamPlayer(this.asStream(), protoEvent);
	}
	
	this.embedInStream = function(inval) // Override this!
	{
		return this.asStream().embedInStream(inval);
	}

	this.do = function(func)
	{
		this.asStream().do(func);
	}
}

Soliton.Pattern.inheritsFrom(Soliton.Object);

//////////
// Pfunc
/////////

Soliton.Pfunc = function(nextFunc, resetFunc)
{
	this.nextFunc = typeof nextFunc !== 'undefined' ? nextFunc : null;
	this.resetFunc = typeof resetFunc !== 'undefined' ? resetFunc : null;

	this.asStream = function()
	{
		return new Soliton.FuncStream(this.nextFunc, this.resetFunc);
	}
}

Soliton.Pfunc.inheritsFrom(Soliton.Pattern);

//////////
// Pbind
//////////

Soliton.Pbind = function()
{
	// Soliton.print("STEP 1: Create the Pbind");
	this.patternpairs = {};

	if(arguments.length % 2 != 0)
	{
		Soliton.print("Pbind should have an even number of args");
	}

	else
	{
		this.patternpairs = arguments;
	}

	this.copyPairs = function()
	{
		var pairs = new Array();

		for(var i = 0; i < this.patternpairs.length; ++i)
		{
			pairs.push(this.patternpairs[i]);
		}

		return pairs;
	}

	this.embedInStream = function(inevent)
	{
		// Soliton.print("STEP 6: Pbind.embedInStream");
		var event;
		var sawNil = false;
		var streampairs = this.copyPairs();
		var endval = streampairs.length - 1;

		for(var i = 1; i <= endval; i += 2)
		{
			streampairs[i] = streampairs[i].asStream();
		}

		// Loop/coroutine-style yield support
		var index = 0;
	    var thisRef = this;

	    var nextFunc = function(inevent) 
		{
			// Soliton.print("Pbind::loop.next()");
			if(inevent == null)
			{
				return null;
			}

			event = inevent.copy();
			for(var i = 0; i < endval; i += 2)
			{
				var name = streampairs[i];
				var stream = streampairs[i + 1];
				var streamout = stream.next(event);

				if(stream == null)
				{
					Soliton.print("NULL!");
					return inevent;
				}

				if(typeof name !== 'string')
				{
					for(var i = 0; i < name.size; ++i)
					{
						event.put(name[i], streamout[i]);
					}
				}

				else
				{
					event.put(name, streamout);
				}
			}

			inevent = event;
			index++;
			// Soliton.print(event);
			return event;
		}

		var loop = {
			next: nextFunc,
			value: nextFunc,
			hasNext: function()
			{
				Soliton.print("Pbind::loop.hasNext()");
				return true;
			}
		}

		loop.asStream = loop;
		
		if(inevent == null)
			return null;
		else
			return loop.next(inevent);
	}
}

Soliton.Pbind.inheritsFrom(Soliton.Pattern);

//////////
// Pwhite
//////////
Soliton.Pwhite = function(lo, hi, length)
{
	this.lo = lo;
	this.hi = hi;
	this.length = typeof length !== 'undefined' ? length : Infinity; 

	this.embedInStream = function(inval)
	{
		// inval = new Soliton.Number((Math.random() * (this.hi - this.lo)) + this.lo);
		// inval = (Math.random() * (this.hi - this.lo)) + this.lo;
		// Soliton.print(inval.value());

		// Loop/coroutine-style yield support
		var index = 0;
	    var thisRef = this;
	    var loStr = thisRef.lo.asStream();
		var hiStr = thisRef.hi.asStream();
		var hiVal, loVal;

		var nextFunc = function() 
		{
			// Soliton.print("Pwhite::loop.next()");
			if(index < thisRef.length)
			{
				hiVal = hiStr.next(inval);
				loVal = loStr.next(inval);

				if(hiVal == null || loVal == null)
				{
					Soliton.print("hiVal == null || loVal == null");
					return inval;
				}

				inval = (Math.random() * (hiVal - loVal)) + loVal;

				index++;	
			}
			
			Soliton.print(inval.value());
			return inval;
		}


		var loop = {
			next: nextFunc,
			value: nextFunc,
			hasNext: function()
			{
				Soliton.print("Pwhite::loop.hasNext()");
				return index < thisRef.length;
			}
		}

		loop.asStream = loop;
		return loop.next();
	}
}

Soliton.Pwhite.inheritsFrom(Soliton.Pattern);

////////////////////
// ListPattern
////////////////////

Soliton.ListPattern = function() // list, repeats
{
	// this.list = list;
	// this.repeats = repeats;

	this.prConstructor = function()
	{
		if(this.list.length == 0)
		{
			Soliton.print("ListPattern requires a non empty collection");
			Soliton.print("Replacing with [0]");
			this.list = new Array(0);
		}

		this.repeats = typeof this.repeats !== 'undefined' ? this.repeats : 1;
	}

	this.copyList = function()
	{
		var newList = new Array();

		for(var i = 0; i < this.list.length; ++i)
		{
			newList.push(this.list[i]);
		}

		return newList;
	}

	this.copy = function()
	{
		return new Soliton.ListPattern(copyList(), this.repeats);
	}
}

Soliton.ListPattern.inheritsFrom(Soliton.Pattern);


////////////////////
// Pseq
////////////////////

Soliton.Pseq = function(list, repeats, offset)
{
	this.list = list;
	this.repeats = repeats;
	this.offset = typeof offset !== 'undefined' ? offset : 0;
	this.repeatNum = 0;
	this.listIndex = 0;

	this.embedInStream = function(inval)
	{
		var item, offsetValue;
		offsetValue = this.offset.value(inval);

		/* No reverse support current, maybe later
		if(inval.eventAt('reverse') == true)
		{
			this.repeats.value(inval).do(
				function()
				{
	
				}
			)
		}*/

		/* Original way with Coroutines, but we don't have generators yet
		// We'll have to settle fo coroutine emulation
		repeats.value(inval).do(
			function(j)
			{
				this.list.length.do(
					function(i)
					{
						item = this.list.
					}
				)
			}
		)*/

		if(this.repeatNum < this.repeats)
		{
			item = this.list[(this.listIndex + offsetValue) % this.list.length];
			inval = item.embedInStream(inval);
			++this.listIndex;
			
			if(this.listIndex >= this.list.length)
			{
				this.listIndex = 0;
				++this.repeatNum;
			}
		}

		else
		{
			return null;
		}

		Soliton.print(inval);
		return inval;
	}

	this.prConstructor();
}

Soliton.Pseq.inheritsFrom(Soliton.ListPattern);

////////////////////
// DEFAULTS
////////////////////

Soliton.Event.defaultParentEvent = null;
Soliton.Event.default = new Soliton.Event(8, null, Soliton.Event.defaultParentEvent, true);
Soliton.Quant.default = new Soliton.Quant(1, 0, 0);
// tempo (beats per second), current beats , current seconds, queueSize, sleepTime (millis)
Soliton.Clock.default = new Soliton.Clock(1, 0, 0, 256, 1); // default
Soliton.Clock.permanent = true;
Soliton.Scheduler.default = Soliton.Clock.default.scheduler;