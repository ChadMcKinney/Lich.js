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
Soliton.masterGain = 0;
Soliton.blockSize = 4096; // Audio block size
Soliton.spliceFuncBlockSize = 64; // block size for splice generated osc node functions
Soliton.spliceFuncBlockRatio = Soliton.blockSize / Soliton.spliceFuncBlockSize; // Ratio use for sample generation in splice osc nodes
Soliton.buffers = {}; // Soliton.buffers namespace
Soliton.nodes = new Array();

window.addEventListener('load', init, false);

function init()
{
	try
	{
		Soliton.context = new AudioContext(); // create the webkit audio context!
		Soliton.masterGain = Soliton.context.createGain();
		Soliton.masterGain.connect(Soliton.context.destination);
		Soliton.masterGain.gain.value = 0.25;
	}

	catch(e)
	{
		alert('Web Audio API is not supported in this browser');
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Soliton Functions
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Soliton.addNode = function(node)
{
	var nodeID = Soliton.nodes.indexOf(null);

	if(nodeID >= 0)
	{
		Soliton.nodes[nodeID] = node;
		return nodeID;
	}

	else
	{
		Soliton.nodes.push(node);
		return Soliton.nodes.length - 1;
	}
}

Soliton.removeNode = function(nodeID)
{
	Soliton.nodes[nodeID] = null;
}

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
Soliton.playBuffer = function(buffer, destination, offset, duration)
{
	var source = Soliton.context.createBufferSource();
	source.buffer = buffer;
	source.buffer.duration = 1.0;
	var fadeGain = Soliton.context.createGain();

	if(destination == undefined)
		destination = Soliton.masterGain;

	source.connect(fadeGain);
	fadeGain.connect(destination);
	fadeGain.gain.value = 0.0;
	source.start(0, offset, duration);
	fadeGain.gain.linearRampToValueAtTime(1.0, Soliton.context.currentTime + 0.01);
	fadeGain.gain.linearRampToValueAtTime(0.0, Soliton.context.currentTime + duration);
	return fadeGain;
}

Soliton.createEnvelope = function(type, duration)
{
	var env = Soliton.context.createGain();
	env.gain.value = 0.0;

	switch(type)
	{
	case "perc":
	case "Perc":
		env.gain.linearRampToValueAtTime(1.0, Soliton.context.currentTime + 0.1);
		env.gain.linearRampToValueAtTime(0.0, Soliton.context.currentTime + duration);
		break;

	case "swell":
	case "Swell":
		env.gain.linearRampToValueAtTime(1.0, Soliton.context.currentTime + (duration / 2));
		env.gain.linearRampToValueAtTime(1, Soliton.context.currentTime + duration);
		break;
	}

	env.connect(Soliton.masterGain);
	return Soliton.addNode(env);
}

// Buffer a url with an optional name for storage, callback on finish, 
// and optional destination (for callback function)
Soliton.bufferURL = function(url, name, callback, callbackDestination, offset, duration)
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

		return null;
	}

	else if(Soliton.buffers[name])
	{
		// Soliton.print("Already Downloaded!");
		if(callback != undefined)
			return Soliton.addNode(callback(Soliton.buffers[name], callbackDestination, offset, duration));
		else
			return null;
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
Soliton.playURL = function(url, name, destination, offset, duration)
{
	if(name == undefined)
		name = url;

	if(destination == undefined)
		destination = Soliton.masterGain;

	var context = Soliton.bufferURL(url, name, Soliton.playBuffer, destination, offset, duration);
	
	if(!Soliton.buffers[name])
		Soliton.buffers[name] = 0;

	return context;
}

// Play a buffer fille with garbage with an optional name for the buffer that will be created to store the audio 
// and optional destination
Soliton.playGarbage = function(size, name, destination)
{
	if(name == undefined)
		name = size;

	if(destination == undefined)
		destination = Soliton.masterGain;

	Soliton.bufferGarbage(size, name, Soliton.playBuffer, destination);
}

Soliton.filter = function(nodeID, freq, type)
{
	var source = Soliton.nodes[nodeID];

	if(source != null)
	{
		source.disconnect(0);
		// Create the filter
		var filter = Soliton.context.createBiquadFilter();
		source.connect(filter);
		filter.connect(Soliton.masterGain);		
		// Create and specify parameters for the low-pass filter.
		filter.type = type; // Low-pass filter. See BiquadFilterNode docs
		filter.frequency.value = freq; // Set cutoff to 440 HZ
		return Soliton.addNode(filter);
	}

	return null;
}

Soliton.delay = function(nodeID, delayTime, feedLevel)
{
	var source = Soliton.nodes[nodeID];

	if(source != null)
	{
		source.disconnect(0);
		var mix = Soliton.context.createGain();
		var feedBack = Soliton.context.createGain();
		feedBack.gain.value = feedLevel;
		var delay = Soliton.context.createDelay();
		delay.delayTime.value = delayTime;
		source.connect(delay);
		source.connect(mix);
		delay.connect(mix);
		delay.connect(feedBack);
		feedBack.connect(delay);
		mix.connect(Soliton.masterGain);
		return Soliton.addNode(mix);
	}

	return null;
}

Soliton.waveShape = function(nodeID, curve)
{
	var source = Soliton.nodes[nodeID];

	if(source != null)
	{
		source.disconnect(0);
		// Create the filter
		var shape = Soliton.context.createWaveShaper();
		source.connect(shape);
		shape.connect(Soliton.masterGain);		
		// Create and specify parameters for the low-pass filter.
		shape.curve = curve;
		return Soliton.addNode(shape);
	}

	return null;
}

Soliton.oscillator = function(freq, env, type, table)
{
	var osc = Soliton.context.createOscillator();
	osc.frequency.value = freq;

	if(type == "custom")
	{
		osc.setPeriodicWave(Soliton.context.createPeriodicWave(table, table));
	}

	else
	{
		osc.type = type;
	}

	osc.connect(Soliton.nodes[env]);
	osc.start(0);
	return env;
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


// READ/WRITE vars for splice synthesis
Soliton.var_a = 1;
Soliton.var_b = 1;
Soliton.var_c = 1;
Soliton.buffer_a = new Array(Soliton.blockSize);
Soliton.buffer_b = new Array(Soliton.blockSize);
Soliton.buffer_c = new Array(Soliton.blockSize);

// Prime numbers through 4096
Soliton.prime = [
	2,      3,      5,      7,      11,     13,     17,     19,     23,     29, 
	31,     37,     41,     43,     47,     53,     59,     61,     67,     71, 
	73 ,    79,     83,     89,     97,     101,    103,    107,    109,    113, 
	127,    131,    137,    139,    149,    151,    157,    163,    167,    173, 
	179,    181,    191,    193,    197,    199,    211,    223,    227,    229, 
	233,    239,    241,    251,    257,    263,    269,    271,    277,    281, 
	283,    293,    307,    311,    313,    317,    331,    337,    347,    349, 
	353,    359,    367,    373,    379,    383,    389,    397,    401,    409, 
	419,    421,    431,    433,    439,    443,    449,    457,    461,    463, 
	467,    479,    487,    491,    499,    503,    509,    521,    523,    541, 
	547,    557,    563,    569,    571,    577,    587,    593,    599,    601, 
	607,    613,    617,    619,    631,    641,    643,    647,    653,    659, 
	661,    673,    677,    683,    691,    701,    709,    719,    727,    733, 
	739,    743,    751,    757,    761,    769,    773,    787,    797,    809, 
	811,    821,    823,    827,    829,    839,    853,    857,    859,    863, 
	877,    881,    883,    887,    907,    911,    919,    929,    937,    941, 
	947,    953,    967,    971,    977,    983,    991,    997,    1009,   1013,
	1019,   1021,   1031,   1033,   1039,   1049,   1051,   1061,   1063,   1069, 
	1087,   1091,   1093,   1097,   1103,   1109,   1117,   1123,   1129,   1151, 
	1153,   1163,   1171,   1181,   1187,   1193,   1201,   1213,   1217,   1223, 
	1229,   1231,   1237,   1249,   1259,   1277,   1279,   1283,   1289,   1291, 
	1297,   1301,   1303,   1307,   1319,   1321,   1327,   1361,   1367,   1373, 
	1381,   1399,   1409,   1423,   1427,   1429,   1433,   1439,   1447,   1451, 
	1453,   1459,   1471,   1481,   1483,   1487,   1489,   1493,   1499,   1511, 
	1523,   1531,   1543,   1549,   1553,   1559,   1567,   1571,   1579,   1583, 
	1597,   1601,   1607,   1609,   1613,   1619,   1621,   1627,   1637,   1657, 
	1663,   1667,   1669,   1693,   1697,   1699,   1709,   1721,   1723,   1733, 
	1741,   1747,   1753,   1759,   1777,   1783,   1787,   1789,   1801,   1811, 
	1823,   1831,   1847,   1861,   1867,   1871,   1873,   1877,   1879,   1889, 
	1901,   1907,   1913,   1931,   1933,   1949,   1951,   1973,   1979,   1987, 
	1993,   1997,   1999,   2003,   2011,   2017,   2027,   2029,   2039,   2053, 
	2063,   2069,   2081,   2083,   2087,   2089,   2099,   2111,   2113,   2129, 
	2131,   2137,   2141,   2143,   2153,   2161,   2179,   2203,   2207,   2213, 
	2221,   2237,   2239,   2243,   2251,   2267,   2269,   2273,   2281,   2287, 
	2293,   2297,   2309,   2311,   2333,   2339,   2341,   2347,   2351,   2357, 
	2371,   2377,   2381,   2383,   2389,   2393,   2399,   2411,   2417,   2423, 
	2437,   2441,   2447,   2459,   2467,   2473,   2477,   2503,   2521,   2531, 
	2539,   2543,   2549,   2551,   2557,   2579,   2591,   2593,   2609,   2617, 
	2621,   2633,   2647,   2657,   2659,   2663,   2671,   2677,   2683,   2687, 
	2689,   2693,   2699,   2707,   2711,   2713,   2719,   2729,   2731,   2741, 
	2749,   2753,   2767,   2777,   2789,   2791,   2797,   2801,   2803,   2819, 
	2833,   2837,   2843,   2851,   2857,   2861,   2879,   2887,   2897,   2903, 
	2909,   2917,   2927,   2939,   2953,   2957,   2963,   2969,   2971,   2999, 
	3001,   3011,   3019,   3023,   3037,   3041,   3049,   3061,   3067,   3079, 
	3083,   3089,   3109,   3119,   3121,   3137,   3163,   3167,   3169,   3181, 
	3187,   3191,   3203,   3209,   3217,   3221,   3229,   3251,   3253,   3257, 
	3259,   3271,   3299,   3301,   3307,   3313,   3319,   3323,   3329,   3331, 
	3343,   3347,   3359,   3361,   3371,   3373,   3389,   3391,   3407,   3413, 
	3433,   3449,   3457,   3461,   3463,   3467,   3469,   3491,   3499,   3511, 
	3517,   3527,   3529,   3533,   3539,   3541,   3547,   3557,   3559,   3571, 
	3581,   3583,   3593,   3607,   3613,   3617,   3623,   3631,   3637,   3643, 
	3659,   3671,   3673,   3677,   3691,   3697,   3701,   3709,   3719,   3727, 
	3733,   3739,   3761,   3767,   3769,   3779,   3793,   3797,   3803,   3821, 
	3823,   3833,   3847,   3851,   3853,   3863,   3877,   3881,   3889,   3907, 
	3911,   3917,   3919,   3923,   3929,   3931,   3943,   3947,   3967,   3989, 
	4001,   4003,   4007,   4013,   4019,   4021,   4027,   4049,   4051,   4057, 
	4073,   4079,   4091,   4093
];

for(var i = 0; i < Soliton.blockSize; ++i)
{
	Soliton.buffer_a[i] = 0;
	Soliton.buffer_b[i] = 0;
	Soliton.buffer_c[i] = 0;
}


Soliton.clip = function(value)
{
	if(value > 1)
		return 1;
	else if(value < -1)
		return -1;
	else
		return value;
}

Soliton.wrap = function(value)
{
    if(value >= 1) 
    {
        value -= 2;
        
        if(value < 1) 
        	return value;
    } 

    else if(value < -1) 
    {
        value += 2;
        
        if(value >= -1) 
        	return value;
    } 

    else 
    	return value;
    
    return value - 2 * Math.floor((value + 1) / 2);
}

//////////////////////
// spliceOsc
//////////////////////

Soliton.parseSpliceOscChar = function(character)
{
	switch(character)
	{
	
	case '!': 
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Math.atan(i + j * Soliton.var_a); 
			} 

			return output;
		};

		break;

	
	case '£': 
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.wrap(Math.exp(1 / (Soliton.spliceFuncBlockSize / (i + j + 1)) * Soliton.var_b)); 
			} 

			return output;
		};

		break;

	case '=': 
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.clip(1 / (Soliton.spliceFuncBlockSize / (i + j + 1)) * Soliton.var_c); 
			} 

			return output;
		};

		break;

	
	case '`': 
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.clip(Math.sqrt((Soliton.spliceFuncBlockSize / (i + j + 1))) * 2 - 1 * Soliton.var_a); 
			} 

			return output;
		};

		break;

	case '~': 
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.clip(Math.tan(i + j * Soliton.var_b)); 
			} 

			return output;
		};

		break;

	case '#': 
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.wrap(((i + j) / Soliton.blockSize) * 2 - 1 * Soliton.var_b); 
			} 

			return output;
		};

		break;

		
	case ':':
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.wrap(Math.cos((i + j) / Soliton.blockSize * Soliton.var_c)); 
			} 

			return output;
		};

		break;

	
	case ';': 

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.wrap(Math.pow(i / Soliton.blockSize, j * Soliton.var_a)); 
			} 

			return output;
		};

		break;

	case '?': 
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.wrap(Math.atan2(i / Soliton.blockSize * (Math.PI * 2) * Soliton.var_b, j / (Math.PI * 2))); 
			} 

			return output;
		};

		break;

	
	case '\\': 
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.clip((i / Soliton.blockSize * (Math.PI * 2) * Soliton.var_c, j / (Math.PI * 2)) * 2 - 1); 
			} 

			return output;
		};

		break;	

	
	case ' ':
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (77) == 0)
					Soliton.var_a = Soliton.var_a * - 1;
				
				output[j] = Soliton.var_a;
			} 

			return output;
		};

		break;

	case '_': // length

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (66) == 0)
					Soliton.var_b *= Soliton.var_a * - 1;
				
				Soliton.var_b = Math.cos(Soliton.var_b);
				output[j] = Soliton.var_b;
			} 

			return output;
		};
	
		break;


	case '[': // fold add, add all components of vector returning a vector of the result
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (666) == 0)
					Soliton.var_c *= Soliton.var_b * - 1;
				
				Soliton.var_b = Math.cos(Soliton.var_b);
				output[j] = Soliton.var_c + Soliton.buffer_a[i + j];
				Soliton.buffer_a[i + j] = Soliton.wrap(Soliton.buffer_a[i + j] + (Soliton.var_a * Soliton.var_b * Soliton.var_c));
			} 

			return output;
		};
		
		break;

	
	case ']': // fold subtract, sub all components of vector returning a vector of the result
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (55) == 0)
					Soliton.var_c *= Soliton.var_b * - 1;
				
				output[j] = Soliton.var_c + Soliton.buffer_a[i + j];
				Soliton.buffer_a[((i + j) * 2) % Soliton.blockSize] = Soliton.wrap(Soliton.var_c + (Soliton.buffer_a[i + j]));
			} 

			return output;
		};
		
		break;
	
	
	case '{':
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (9) == 0)
					Soliton.var_a *= Soliton.var_c * - 1;
				
				output[j] = Soliton.var_a + Soliton.buffer_a[i + j];
				Soliton.buffer_b[((i + j) * 2) % Soliton.blockSize] = Soliton.wrap(Soliton.var_a + (Soliton.buffer_a[i + j]));
			} 

			return output;
		};

		break;
	
	case '}':
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (13) == 0)
					Soliton.var_a *= Math.round(Soliton.var_a * -Soliton.var_b);
				
				output[j] = Soliton.var_a + Soliton.buffer_c[i + j];
				Soliton.buffer_c[((i + j) * 2) % Soliton.blockSize] = Soliton.wrap(Soliton.var_a + (Soliton.buffer_c[i + j]));
			} 

			return output;
		};	

		break;
	
	
	case '.': // dot() function
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.var_a;
				Soliton.var_a = Soliton.wrap(Math.round(Math.sin(Soliton.var_a) * 100) / 100);
			} 

			return output;
		};	

		break;
	
	
	case '+': // add with next number
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.var_b;
				Soliton.var_b = Soliton.wrap(Math.round(Math.sin(Soliton.var_b)));
			} 

			return output;
		};	

		break;
	
	
	case '-': // subtract next number from this

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.var_c;
				Soliton.var_c = Soliton.clip(Math.round(Math.sin(Soliton.var_c)));
			} 

			return output;
		};	

		break;
	
	
	case '*': // multiply by next number
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_a[i + j];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = (sample * -1) + Soliton.buffer_a[i + j];

				output[j] = sample;
				Soliton.buffer_a[((i + j) * 2) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;
	
	
	case '/': // divide by next number
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_b[i + j];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = sample + Soliton.buffer_b[i + j];

				output[j] = sample;
				Soliton.buffer_b[((i + j) * 2) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;
	

	
	case '&': // bit and with next number
	
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_c[i + j];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = sample + Soliton.buffer_c[i + j];

				output[j] = sample;
				var rotatedSample = Soliton.buffer_a[i + j];
				Soliton.buffer_a[i + j] = Soliton.buffer_b[i + j];
				Soliton.buffer_b[i + j] = Soliton.buffer_c[i + j];
				Soliton.buffer_c[i + j] = rotatedSample;
			} 

			return output;
		}

		break;
	

	case '|': // bit or with next number
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_c[i + j];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = Soliton.clip(sample + Soliton.buffer_c[i + j]);

				output[j] = sample;
				var rotatedSample = Soliton.buffer_b[i + j];
				Soliton.buffer_a[i + j] = Soliton.buffer_c[i + j];
				Soliton.buffer_b[i + j] = Soliton.buffer_a[i + j];
				Soliton.buffer_c[i + j] = rotatedSample;
			} 

			return output;
		}

		break;

	
	case '%': // modulus with next number
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_a[i + j];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = Soliton.clip(sample + Soliton.buffer_a[i + j]);

				output[j] = sample;
				var rotatedSample = Soliton.buffer_a[i];
				Soliton.buffer_a[i + j] = Soliton.buffer_b[i];
				Soliton.buffer_b[i + j] = Soliton.buffer_c[i];
				Soliton.buffer_c[i + j] = rotatedSample;
			} 

			return output;
		}
		
		break;
	
	
	case '<': // decrement
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_a[Math.max(i + j - 1, 0)];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = Soliton.clip(sample + Soliton.buffer_a[i + j]);

				output[j] = sample;
				Soliton.buffer_a[((i + j) * 2 + 1) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;

	
	case '^': // exponent
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_c[Math.max(i + j - 66, 0)];

				if(sample > -0.5 && sample < 0.5)
					sample = sample * Soliton.var_a / 2;

				sample = Soliton.clip(sample + Soliton.buffer_c[i + j]);

				output[j] = sample;
				Soliton.buffer_c[((i + j) * 2 + 66) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;

	
	case '>': // increment
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var rand = Math.random() * 2 - 1;
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_a[Math.max(i + j - 666, 0)] + rand;

				if(sample > -0.5 && sample < 0.5)
					sample = sample * Soliton.var_b / 2;

				sample = Soliton.clip(sample + Soliton.buffer_a[i + j]);

				output[j] = sample;
				Soliton.buffer_a[((i + j) * 2 + 666) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;

	
	case '(': // sin
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_c[Math.max(i + j - 1, 0)] + Soliton.var_b;

				if(sample < -0.9 || sample > 0.9)
				{
					sample = sample * Soliton.var_a / 2;
					sample = Soliton.clip(sample - Soliton.buffer_a[i + j]);
					output[j] = sample;
					Soliton.buffer_c[i + j] = sample;
				}

				else
					output[j] = 0;
			} 

			return output;
		}
		
		break;
	

	case ')': // cosin
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_a[Math.max(i + j - 1, 0)] + Soliton.var_a;

				if(sample < -0.9 || sample > 0.9)
				{
					sample = sample * Soliton.var_a / 2;
					sample = Soliton.clip(sample - Soliton.buffer_b[i + j]);
					output[j] = sample;
					Soliton.buffer_b[i + j] = sample;
				}

				else
					output[j] = 0;
			} 

			return output;
		}
		
		break;


	case '@': // ascos
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.buffer_a[Soliton.blockSize - 1 - (i + j)];
			} 

			return output;
		}

		break;

	case '$': // ascos
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.buffer_b[Soliton.blockSize - 1 - (i + j)];
			} 

			return output;
		}

		break;

	case 'a':
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Math.sin(i + j); 
			} 

			return output;
		};

		break;
		
	case 'A': // absolute value

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.buffer_c[Soliton.blockSize - 1 - (i + j)];
			} 

			return output;
		}

		break;

		
	case 'b': // less than
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				switch((i + j) % 6)
				{
				case 0:
					output[j] = Soliton.var_a;
					break;

				case 1:
					output[j] = Soliton.var_b;
					break;

				case 2:
					output[j] = Soliton.var_c;
					break;

				case 3:
					output[j] = Soliton.buffer_a[i + j];
					break;

				case 4:
					output[j] = Soliton.buffer_b[i + j];
					break;

				case 5:
					output[j] = Soliton.buffer_c[i + j];
					break;	
				}
			} 

			return output;
		}

		break;

	
	case 'B': // less than equal
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				switch((i + j) % 6)
				{
				case 0:
					output[j] = Soliton.var_a * - 1;
					Soliton.buffer_c[i + j] = Soliton.var_a;
					break;

				case 1:
					output[j] = Soliton.var_b * - 1;
					Soliton.var_b = Soliton.var_a;
					break;

				case 2:
					output[j] = Soliton.var_c * - 1;
					Soliton.var_c = Soliton.var_b;
					break;

				case 3:
					output[j] = Soliton.buffer_a[i + j] * - 1;
					Soliton.buffer_a[i + j] = Soliton.var_c;
					break;

				case 4:
					output[j] = Soliton.buffer_b[i + j] * - 1;
					Soliton.buffer_b[i + j] = Soliton.buffer_a[i + j];
					break;

				case 5:
					output[j] = Soliton.buffer_c[i + j] * - 1;
					Soliton.buffer_c[i + j] = Soliton.buffer_b[i + j];
					break;	
				}
			} 

			return output;
		}

		break;

	case 'c': // ceil
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				switch((i + j) % 666)
				{
				case 0:
					output[j] = Soliton.var_a * - 1;
					Soliton.buffer_c[i + j] = Soliton.var_a;
					break;

				case 1:
					output[j] = Soliton.var_b * - 1;
					Soliton.var_b = Soliton.var_a;
					break;

				case 2:
					output[j] = Soliton.var_c * - 1;
					Soliton.var_c = Soliton.var_b;
					break;

				case 3:
					output[j] = Soliton.buffer_a[i + j] * - 1;
					Soliton.buffer_a[i + j] = Soliton.var_c;
					break;

				case 4:
					output[j] = Soliton.buffer_b[i + j] * - 1;
					Soliton.buffer_b[i + j] = Soliton.buffer_a[i + j];
					break;

				case 5:
					output[j] = Soliton.buffer_c[i + j] * - 1;
					Soliton.buffer_c[i + j] = Soliton.buffer_b[i + j];
					break;	

				default:
					output[j] = 0;
				}
			} 

			return output;
		}

		break;

	
	case 'C': // ceil

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				switch((i + j) % 100)
				{
				case 0:
				case 33:
					output[j] = Soliton.var_a * - 1;
					Soliton.buffer_c[i + j] = Soliton.var_a;
					break;

				case 10:
				case 34:
					output[j] = Soliton.var_b * - 1;
					Soliton.var_b = Soliton.var_a;
					break;

				case 20:
				case 35:
					output[j] = Soliton.var_c * - 1;
					Soliton.var_c = Soliton.var_b;
					break;

				case 30:
				case 36:
					output[j] = Soliton.buffer_a[i + j] * - 1;
					Soliton.buffer_a[i + j] = Soliton.var_c;
					break;

				case 40:
				case 37:
					output[j] = Soliton.buffer_b[i + j] * - 1;
					Soliton.buffer_b[i + j] = Soliton.buffer_a[i + j];
					break;

				case 50:
				case 38:
					output[j] = Soliton.buffer_c[i + j] * - 1;
					Soliton.buffer_c[i + j] = Soliton.buffer_b[i + j];
					break;	

				default:
					output[j] = 0;
				}
			} 

			return output;
		}

		break;


	
	case 'd': // distance
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j)
			{
				output[j] = 0;
			}

			if(i == 0)
			{
				output[i] = Soliton.var_a;
				Soliton.var_a *= -1;
			}

			return output;
		};

		break;
	
	
	case 'D': // distance
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j)
			{
				output[j] = Soliton.buffer_a[i];
			}

			if(i == 0)
			{
				var sample = Soliton.clip(Soliton.var_b + Soliton.buffer_a[i]); 
				output[i] = sample;
				Soliton.var_b = sample;
				Soliton.buffer_a[i] = sample;
			}

			return output;
		};

		break;

	
	case 'e': // equal
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j)
			{
				output[j] = Soliton.buffer_b[i];
			}

			if(i == 0)
			{
				var sample = Soliton.clip(Soliton.var_b + Soliton.buffer_b[i]); 
				output[i] = sample;
				Soliton.var_b = sample;
				Soliton.buffer_b[i] = sample;
			}

			return output;
		};

		break;

	case 'E': // equal

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.buffer_c[Soliton.blockSize - 1 - (i + j)] - Soliton.buffer_c[i + j];
			} 

			Soliton.var_c = output[0];

			return output;
		}

		break;

	
	case 'f': // floor
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				if(Math.random() > 0.5)
					output[j] = Soliton.buffer_c[Soliton.blockSize - 1 - (i + j)] - Soliton.buffer_c[i + j];
				else
					output[j] = Soliton.buffer_b[Soliton.blockSize - 1 - (i + j)];
			} 

			Soliton.var_c = output[0];

			return output;
		}

		break;
	
	
	case 'F': 

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				if(Soliton.prime[i + j])
				{
					output[j] = Soliton.var_b;
					Soliton.var_b *= -1;
				}

				else
					output[j] = 0;
			} 

			return output;
		}

		break;

	case 'g': // return input, assign "+assignVar+"
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				if(Soliton.prime[i + j])
				{
					Soliton.var_a *= 1 / (i + j + 1);
					output[j] = Soliton.var_a;
				}

				else
					output[j] = 0;
			} 

			return output;
		}

		break;

	
	case 'G': // return input, assign "+assignVar+"
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				if(Soliton.prime[i + j])
				{
					Soliton.var_c *= 1 / (i + j + 1);
					output[j] = Soliton.var_a;
				}

				else
					output[j] = Soliton.buffer_a[i + j];
			} 

			return output;
		}

		break;

	
	case 'h': // return input, assign "+assignVar+"
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				if(Soliton.prime[i + j])
				{
					output[j] = Math.sin(i + j);
				}

				else
					output[j] = Soliton.buffer_b[i + j];
			} 

			return output;
		}

		break;

	
	case 'H': // return input, assign "+assignVar+"
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				if(Soliton.prime[i + j])
				{
					var sample = Math.atan2(i + j, Soliton.buffer_c[i + j]); 
					output[j] = sample;
					Soliton.buffer_c[i + j] = sample;
				}

				else
					output[j] = Soliton.buffer_c[i + j];
			} 

			return output;
		}

		break;

	
	case 'i': // inverse sqrt

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (Soliton.var_a * 10) <= 0)
					Soliton.var_a *= Soliton.var_c * - 1;
				
				output[j] = Soliton.var_a + Soliton.buffer_a[i + j];
				Soliton.buffer_b[i + j] = Soliton.wrap(Soliton.var_a + (Soliton.buffer_a[i + j]));
			} 

			return output;
		};

		break;
	
	
	case 'I': // invsqrt(1 / exp2)

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (Soliton.var_b * 10) <= 0)
					Soliton.var_b *= Soliton.var_a * - 1;
				
				output[j] = Soliton.var_b + Soliton.buffer_b[i + j];
				Soliton.buffer_c[i + j] = Soliton.wrap(Soliton.var_b + (Soliton.buffer_b[i + j]));
			} 

			return output;
		};

		break;

	
	case 'j': // return input, assign "+assignVar+"

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (Soliton.var_c * 10) <= 0)
					Soliton.var_c *= Soliton.var_b * - 1;
				
				output[j] = Soliton.var_c + Soliton.buffer_c[i + j];
				Soliton.buffer_a[i + j] = Soliton.wrap(Soliton.var_c + (Soliton.buffer_c[i + j]));
			} 

			return output;
		};

		break;

	
	case 'J': // return input, assign "+assignVar+"

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_a[i + j];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = sample + Soliton.buffer_a[i + j];

				output[j] = sample;
				Soliton.buffer_c[((i + j) * 2) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;

	case 'k': // clamp

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_c[i + j];

				if(sample > -0.666 && sample < 0.666)
					sample = 0;

				sample = sample + Soliton.buffer_c[i + j];

				output[j] = sample;
				Soliton.buffer_b[((i + j) * 2) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;

		
	case 'K': // clamp
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_a *= Soliton.var_c * - 1;
				
				output[j] = Soliton.var_a + Soliton.buffer_b[i + j];
				Soliton.buffer_c[((i + j) * 2) % Soliton.blockSize] = Soliton.wrap(Soliton.var_a + (Soliton.buffer_b[i + j]));
			} 

			return output;
		};

		break;

	
	case 'l': // log2

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_b = Soliton.clip(Soliton.var_b - (1 / (i + j + 1)));
				
				var sample = Soliton.clip((Soliton.var_b + Soliton.buffer_b[i + j]) * (1 / (i + j + 1)));
				output[j] = sample;
				Soliton.buffer_a[((i + j) + 1) % Soliton.blockSize] = sample;
			} 

			return output;
		};

		break;
	
	
	case 'L': // log2(1 / log2)

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_b = Soliton.clip(Soliton.var_b * (1 / (i + j + 1)));
				
				var sample = Soliton.clip((Soliton.var_b + Soliton.buffer_b[i + j]) * (1 / (i + j + 1)));
				output[j] = sample;
				Soliton.buffer_a[((i + j) + 1) % Soliton.blockSize] = sample;
			} 

			return output;
		};

		break;

	
	case 'm': // min

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_c = Soliton.wrap(Soliton.var_b * (1 / (i + j + 1)));
				
				var sample = Soliton.wrap((Soliton.var_c + Soliton.buffer_a[i + j]) * (1 / (i + j + 1)));
				output[j] = sample;
				Soliton.buffer_a[((i + j) + 1) % Soliton.blockSize] = sample;
			} 

			return output;
		};

		break;
	
	
	case 'M': // max

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_a = Soliton.wrap(Soliton.var_a + (1 / (i + j + 1)));
				
				var sample = Soliton.wrap((Soliton.var_a + Soliton.buffer_a[i + j]) * (1 / (i + j + 1)));
				output[j] = sample;
				Soliton.buffer_c[((i + j) + 1) % Soliton.blockSize] = sample;
			} 

			return output;
		};


		break;

		
	case 'n': // normalize

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_c = Soliton.wrap(Soliton.var_c / (i + j + 1) * -1);
				
				var sample = Soliton.wrap((Soliton.var_c + Soliton.buffer_b[i + j]) * (1 / (i + j + 1)));
				output[j] = sample;
				Soliton.buffer_b[((i + j) + 1) % Soliton.blockSize] = sample;
			} 

			return output;
		};

		break;


	
	case 'N': // normalize

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (154) == 0)
					Soliton.var_b = Soliton.var_b * - 1;
				
				output[j] = Soliton.var_b;
			} 

			return output;
		};

		break;

	
	case 'o': // min

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (333) == 0)
					Soliton.var_c = Soliton.var_c * - 1;
				
				output[j] = Soliton.var_c;
			} 

			return output;
		};

		break;

	case 'O': // max

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_c *= Math.round(Soliton.var_c * -Soliton.var_b);
				
				output[j] = Soliton.var_c + Soliton.buffer_a[i + j];
				Soliton.buffer_a[((i + j) * 2) % Soliton.blockSize] = Soliton.wrap(Soliton.var_c + (Soliton.buffer_a[i + j]));
			} 

			return output;
		};	

		break;

	
	case 'p': // pow

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) == 999)
					Soliton.var_a *= Math.sin(Soliton.buffer_a[((i + j) * 2) % Soliton.blockSize] - Soliton.var_b);
				
				output[j] = Soliton.var_a + Soliton.buffer_c[i + j];
				Soliton.buffer_c[((i + j) * 2) % Soliton.blockSize] = Soliton.wrap(Soliton.var_a + (Soliton.buffer_c[i + j]));
			} 

			return output;
		};	

		break;

	case 'P': // pow pow

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) == 999)
					Soliton.var_b *= Math.sin(Soliton.buffer_b[((i + j) * 2) % Soliton.blockSize] - Soliton.var_b);
				
				output[j] = Soliton.var_b + Soliton.buffer_b[i + j];
				Soliton.buffer_b[((i + j) * 2 + 1) % Soliton.blockSize] = Soliton.wrap(Soliton.var_b + (Soliton.buffer_b[i + j]));
			} 

			return output;
		};

		break

	
	case 'q': // sign value

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.var_b + Soliton.buffer_b[i + j];
				Soliton.buffer_b[Soliton.blockSize - (i + j + 1)] = Soliton.wrap(Soliton.var_b + (Soliton.buffer_b[i + j]));
			} 

			return output;
		};

		break;	


	case 'Q': // sign value

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.var_a + Soliton.buffer_a[i + j];
				var sample = Soliton.wrap(Soliton.var_a - (Soliton.buffer_c[i + j]));
				Soliton.buffer_a[Soliton.blockSize - (i + j + 1)] = sample;
				Soliton.var_a = sample;
			} 

			return output;
		};

		break;

	

	case 'r': // reflect
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_a[i + j] * Soliton.buffer_b[i + j] * Soliton.buffer_c[i + j];
			} 

			return output;
		};

		break;

	
	case 'R': // Refract

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_a[Soliton.blockSize - (i + j + 1)] * Soliton.buffer_b[Soliton.blockSize - (i + j + 1)] * Soliton.buffer_c[Soliton.blockSize - (i + j + 1)];
			} 

			return output;
		};

		break;	

	
	
	case 's': // step

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Math.sin((Soliton.buffer_a[i + j] + Soliton.buffer_b[i + j] + Soliton.buffer_c[i + j]) * 666 + (i + j));
			} 

			return output;
		};

		break;
	

	
	case 'S': // smooth step

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Math.sin((Soliton.buffer_a[i + j] + Soliton.buffer_b[i + j] + Soliton.buffer_c[i + j]) * 4096);

				if((i + j) % 66 == 0)
					Soliton.var_a *= -1;
			} 

			return output;
		};

		break;


	
	case 't': // cross

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.clip(Math.sqrt((Soliton.spliceFuncBlockSize / (i + j + 1))) + Soliton.var_b); 
			} 

			Soliton.var_b = Soliton.wrap(Soliton.var_b - Soliton.buffer_a[i]);

			return output;
		};

		break;

	case 'T': // tangent

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.clip(1 / (Math.sqrt((Soliton.spliceFuncBlockSize / (i + j + 1))) + Soliton.var_b)); 
			} 

			Soliton.var_b = Soliton.wrap(Soliton.var_b - Soliton.buffer_a[i]);

			return output;
		};

		break;	
	
	
	case 'u': // 
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.var_a;

				if(Soliton.prime[i + j])
					Soliton.var_a *= -Soliton.var_b;
			} 

			return output;
		};

		break;

	
	case 'U': // 
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.var_b;

				if(Soliton.prime[i + j])
					Soliton.var_b *= -Soliton.var_c;
			} 

			return output;
		};

		break;


	
	case 'v': // sqrt
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.var_c;

				if(Soliton.prime[i + j])
					Soliton.var_c *= -Soliton.var_a;
			} 

			return output;
		};

		break;

		
	case 'V': // var sqrt
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_a[index];

				if(Soliton.prime[i + j])
					index = i + j;
			} 

			return output;
		};

		break;

	
	case 'w': // FaceForward
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_b[index];

				if(Soliton.prime[i + j])
					index = i + j;
			} 

			return output;
		};

		break;


	case 'W': // FaceForward
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_c[index];

				if(Soliton.prime[i + j])
					index = i + j;
			} 

			return output;
		};

		break;

	
	case 'x': // mix
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_a[index];

				if(Soliton.prime[i + j])
					index++;
			} 

			return output;
		};

		break;
	

	
	case 'X': // mix
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_b[index];

				if(Soliton.prime[i + j])
					index++;
			} 

			return output;
		};

		break;

	case 'y': // mul
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_c[index];

				if(Soliton.prime[i + j])
					index++;
			} 

			return output;
		};

		break;

	
	case 'Y': // mul
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;
			var var_array = [Soliton.var_a, Soliton.var_b, Soliton.var_c];

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = var_array[index];

				if(Soliton.prime[i + j])
				{
					index = (index + 1) % 3;
					var_array[index] *= -1;
				}
			} 

			return output;
		};

		break;

	
	case 'z': // mul

		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;
			var var_array = [Soliton.buffer_a, Soliton.buffer_b, Soliton.buffer_c];

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = var_array[index][i + j];

				if(Soliton.prime[i + j])
				{
					index = (index + 1) % 3;
					var_array[index][i + j] *= -1;
				}
			} 

			return output;
		};

		break;

	
	case 'Z': // mul
		
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;
			var var_array = [Soliton.buffer_a, Soliton.buffer_b, Soliton.buffer_c];

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = var_array[index][Soliton.blockSize - (i + j + 1)];

				if(Soliton.prime[i + j])
				{
					index = (index + 1) % 3;
					var_array[index][Soliton.blockSize - (i + j + 1)] *= -1;
				}
			} 

			return output;
		};

		break;

	default:
		var sample = (character.charCodeAt(0) / 256 * 2 - 1);
		return function(i) 
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				// output[j] = Math.random() * 2 - 1;
				output[j] = sample;
			} 

			return output;
		};
		
		break;
	}
}

Soliton.parseSpliceOsc = function(lang)
{
	var audioFuncArray = new Array(lang.length);

	for(var i = 0; i < lang.length; ++i)
	{
		audioFuncArray[i] = Soliton.parseSpliceOscChar(lang[i]);
	}

	return audioFuncArray;
}

Soliton.spliceOSC = function(lang, divider)
{
	var oscNode = Soliton.context.createScriptProcessor(Soliton.blockSize, 0, 2);
	oscNode.audioFuncArray = Soliton.parseSpliceOsc(lang);
	oscNode.currentFunc = 0;
	oscNode.divider = divider;

	oscNode.onaudioprocess = function(event)
	{
		var outputArrayL = event.outputBuffer.getChannelData(0);
		var outputArrayR = event.outputBuffer.getChannelData(1);
		var output;

		for(var i = 0; i < Soliton.blockSize; i += (Soliton.spliceFuncBlockSize * this.divider))
		{
			output = this.audioFuncArray[this.currentFunc](i);

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j)
			{
				
				for(var k = 1; k <= this.divider; ++k)
				{
					outputArrayL[i + (j * k)] = outputArrayR[i + (j * k)] = output[j];	
				}  
			}

			if(++this.currentFunc >= this.audioFuncArray.length)
			 	this.currentFunc = 0;
		}
	}

	oscNode.onaudioprocess.parentNode = oscNode;
	var fadeGain = Soliton.context.createGain();
	oscNode.connect(fadeGain);
	fadeGain.connect(Soliton.masterGain);
	fadeGain.gain.value = 1.0;
	fadeGain.gain.linearRampToValueAtTime(1.0, Soliton.context.currentTime + 0.1);
	fadeGain.gain.linearRampToValueAtTime(0.0, Soliton.context.currentTime + 1);
	return Soliton.addNode(oscNode);
}

//////////////////
// spliceFX
//////////////////

Soliton.parseSpliceFXChar = function(character)
{
	switch(character)
	{
	/*
	case '!': 
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Math.atan(i + j * Soliton.var_a); 
			} 

			return output;
		};

		break;

	
	case '£': 
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.wrap(Math.exp(1 / (Soliton.spliceFuncBlockSize / (i + j + 1)) * Soliton.var_b)); 
			} 

			return output;
		};

		break;

	case '=': 
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.clip(1 / (Soliton.spliceFuncBlockSize / (i + j + 1)) * Soliton.var_c); 
			} 

			return output;
		};

		break;

	
	case '`': 
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.clip(Math.sqrt((Soliton.spliceFuncBlockSize / (i + j + 1))) * 2 - 1 * Soliton.var_a); 
			} 

			return output;
		};

		break;

	case '~': 
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.clip(Math.tan(i + j * Soliton.var_b)); 
			} 

			return output;
		};

		break;

	case '#': 
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.wrap(((i + j) / Soliton.blockSize) * 2 - 1 * Soliton.var_b); 
			} 

			return output;
		};

		break;

		
	case ':':
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.wrap(Math.cos((i + j) / Soliton.blockSize * Soliton.var_c)); 
			} 

			return output;
		};

		break;

	
	case ';': 

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.wrap(Math.pow(i / Soliton.blockSize, j * Soliton.var_a)); 
			} 

			return output;
		};

		break;

	case '?': 
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.wrap(Math.atan2(i / Soliton.blockSize * (Math.PI * 2) * Soliton.var_b, j / (Math.PI * 2))); 
			} 

			return output;
		};

		break;

	
	case '\\': 
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.clip((i / Soliton.blockSize * (Math.PI * 2) * Soliton.var_c, j / (Math.PI * 2)) * 2 - 1); 
			} 

			return output;
		};

		break;	

	
	case ' ':
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (77) == 0)
					Soliton.var_a = Soliton.var_a * - 1;
				
				output[j] = Soliton.var_a;
			} 

			return output;
		};

		break;

	case '_': // length

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (66) == 0)
					Soliton.var_b *= Soliton.var_a * - 1;
				
				Soliton.var_b = Math.cos(Soliton.var_b);
				output[j] = Soliton.var_b;
			} 

			return output;
		};
	
		break;


	case '[': // fold add, add all components of vector returning a vector of the result
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (666) == 0)
					Soliton.var_c *= Soliton.var_b * - 1;
				
				Soliton.var_b = Math.cos(Soliton.var_b);
				output[j] = Soliton.var_c + Soliton.buffer_a[i + j];
				Soliton.buffer_a[i + j] = Soliton.wrap(Soliton.buffer_a[i + j] + (Soliton.var_a * Soliton.var_b * Soliton.var_c));
			} 

			return output;
		};
		
		break;

	
	case ']': // fold subtract, sub all components of vector returning a vector of the result
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (55) == 0)
					Soliton.var_c *= Soliton.var_b * - 1;
				
				output[j] = Soliton.var_c + Soliton.buffer_a[i + j];
				Soliton.buffer_a[((i + j) * 2) % Soliton.blockSize] = Soliton.wrap(Soliton.var_c + (Soliton.buffer_a[i + j]));
			} 

			return output;
		};
		
		break;
	
	
	case '{':
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (9) == 0)
					Soliton.var_a *= Soliton.var_c * - 1;
				
				output[j] = Soliton.var_a + Soliton.buffer_a[i + j];
				Soliton.buffer_b[((i + j) * 2) % Soliton.blockSize] = Soliton.wrap(Soliton.var_a + (Soliton.buffer_a[i + j]));
			} 

			return output;
		};

		break;
	
	case '}':
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (13) == 0)
					Soliton.var_a *= Math.round(Soliton.var_a * -Soliton.var_b);
				
				output[j] = Soliton.var_a + Soliton.buffer_c[i + j];
				Soliton.buffer_c[((i + j) * 2) % Soliton.blockSize] = Soliton.wrap(Soliton.var_a + (Soliton.buffer_c[i + j]));
			} 

			return output;
		};	

		break;
	
	
	case '.': // dot() function
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.var_a;
				Soliton.var_a = Soliton.wrap(Math.round(Math.sin(Soliton.var_a) * 100) / 100);
			} 

			return output;
		};	

		break;
	
	
	case '+': // add with next number
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.var_b;
				Soliton.var_b = Soliton.wrap(Math.round(Math.sin(Soliton.var_b)));
			} 

			return output;
		};	

		break;
	
	
	case '-': // subtract next number from this

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.var_c;
				Soliton.var_c = Soliton.clip(Math.round(Math.sin(Soliton.var_c)));
			} 

			return output;
		};	

		break;
	
	
	case '*': // multiply by next number
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_a[i + j];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = (sample * -1) + Soliton.buffer_a[i + j];

				output[j] = sample;
				Soliton.buffer_a[((i + j) * 2) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;
	
	
	case '/': // divide by next number
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_b[i + j];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = sample + Soliton.buffer_b[i + j];

				output[j] = sample;
				Soliton.buffer_b[((i + j) * 2) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;
	

	
	case '&': // bit and with next number
	
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_c[i + j];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = sample + Soliton.buffer_c[i + j];

				output[j] = sample;
				var rotatedSample = Soliton.buffer_a[i + j];
				Soliton.buffer_a[i + j] = Soliton.buffer_b[i + j];
				Soliton.buffer_b[i + j] = Soliton.buffer_c[i + j];
				Soliton.buffer_c[i + j] = rotatedSample;
			} 

			return output;
		}

		break;
	

	case '|': // bit or with next number
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_c[i + j];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = Soliton.clip(sample + Soliton.buffer_c[i + j]);

				output[j] = sample;
				var rotatedSample = Soliton.buffer_b[i + j];
				Soliton.buffer_a[i + j] = Soliton.buffer_c[i + j];
				Soliton.buffer_b[i + j] = Soliton.buffer_a[i + j];
				Soliton.buffer_c[i + j] = rotatedSample;
			} 

			return output;
		}

		break;

	
	case '%': // modulus with next number
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_a[i + j];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = Soliton.clip(sample + Soliton.buffer_a[i + j]);

				output[j] = sample;
				var rotatedSample = Soliton.buffer_a[i];
				Soliton.buffer_a[i + j] = Soliton.buffer_b[i];
				Soliton.buffer_b[i + j] = Soliton.buffer_c[i];
				Soliton.buffer_c[i + j] = rotatedSample;
			} 

			return output;
		}
		
		break;
	
	
	case '<': // decrement
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_a[Math.max(i + j - 1, 0)];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = Soliton.clip(sample + Soliton.buffer_a[i + j]);

				output[j] = sample;
				Soliton.buffer_a[((i + j) * 2 + 1) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;

	
	case '^': // exponent
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_c[Math.max(i + j - 66, 0)];

				if(sample > -0.5 && sample < 0.5)
					sample = sample * Soliton.var_a / 2;

				sample = Soliton.clip(sample + Soliton.buffer_c[i + j]);

				output[j] = sample;
				Soliton.buffer_c[((i + j) * 2 + 66) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;

	
	case '>': // increment
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var rand = Math.random() * 2 - 1;
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_a[Math.max(i + j - 666, 0)] + rand;

				if(sample > -0.5 && sample < 0.5)
					sample = sample * Soliton.var_b / 2;

				sample = Soliton.clip(sample + Soliton.buffer_a[i + j]);

				output[j] = sample;
				Soliton.buffer_a[((i + j) * 2 + 666) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;

	
	case '(': // sin
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_c[Math.max(i + j - 1, 0)] + Soliton.var_b;

				if(sample < -0.9 || sample > 0.9)
				{
					sample = sample * Soliton.var_a / 2;
					sample = Soliton.clip(sample - Soliton.buffer_a[i + j]);
					output[j] = sample;
					Soliton.buffer_c[i + j] = sample;
				}

				else
					output[j] = 0;
			} 

			return output;
		}
		
		break;
	

	case ')': // cosin
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_a[Math.max(i + j - 1, 0)] + Soliton.var_a;

				if(sample < -0.9 || sample > 0.9)
				{
					sample = sample * Soliton.var_a / 2;
					sample = Soliton.clip(sample - Soliton.buffer_b[i + j]);
					output[j] = sample;
					Soliton.buffer_b[i + j] = sample;
				}

				else
					output[j] = 0;
			} 

			return output;
		}
		
		break;


	case '@': // ascos
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.buffer_a[Soliton.blockSize - 1 - (i + j)];
			} 

			return output;
		}

		break;

	case '$': // ascos
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.buffer_b[Soliton.blockSize - 1 - (i + j)];
			} 

			return output;
		}

		break;

	case 'a':
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Math.sin(i + j); 
			} 

			return output;
		};

		break;
		
	case 'A': // absolute value

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.buffer_c[Soliton.blockSize - 1 - (i + j)];
			} 

			return output;
		}

		break;

		
	case 'b': // less than
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				switch((i + j) % 6)
				{
				case 0:
					output[j] = Soliton.var_a;
					break;

				case 1:
					output[j] = Soliton.var_b;
					break;

				case 2:
					output[j] = Soliton.var_c;
					break;

				case 3:
					output[j] = Soliton.buffer_a[i + j];
					break;

				case 4:
					output[j] = Soliton.buffer_b[i + j];
					break;

				case 5:
					output[j] = Soliton.buffer_c[i + j];
					break;	
				}
			} 

			return output;
		}

		break;

	
	case 'B': // less than equal
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				switch((i + j) % 6)
				{
				case 0:
					output[j] = Soliton.var_a * - 1;
					Soliton.buffer_c[i + j] = Soliton.var_a;
					break;

				case 1:
					output[j] = Soliton.var_b * - 1;
					Soliton.var_b = Soliton.var_a;
					break;

				case 2:
					output[j] = Soliton.var_c * - 1;
					Soliton.var_c = Soliton.var_b;
					break;

				case 3:
					output[j] = Soliton.buffer_a[i + j] * - 1;
					Soliton.buffer_a[i + j] = Soliton.var_c;
					break;

				case 4:
					output[j] = Soliton.buffer_b[i + j] * - 1;
					Soliton.buffer_b[i + j] = Soliton.buffer_a[i + j];
					break;

				case 5:
					output[j] = Soliton.buffer_c[i + j] * - 1;
					Soliton.buffer_c[i + j] = Soliton.buffer_b[i + j];
					break;	
				}
			} 

			return output;
		}

		break;

	case 'c': // ceil
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				switch((i + j) % 666)
				{
				case 0:
					output[j] = Soliton.var_a * - 1;
					Soliton.buffer_c[i + j] = Soliton.var_a;
					break;

				case 1:
					output[j] = Soliton.var_b * - 1;
					Soliton.var_b = Soliton.var_a;
					break;

				case 2:
					output[j] = Soliton.var_c * - 1;
					Soliton.var_c = Soliton.var_b;
					break;

				case 3:
					output[j] = Soliton.buffer_a[i + j] * - 1;
					Soliton.buffer_a[i + j] = Soliton.var_c;
					break;

				case 4:
					output[j] = Soliton.buffer_b[i + j] * - 1;
					Soliton.buffer_b[i + j] = Soliton.buffer_a[i + j];
					break;

				case 5:
					output[j] = Soliton.buffer_c[i + j] * - 1;
					Soliton.buffer_c[i + j] = Soliton.buffer_b[i + j];
					break;	

				default:
					output[j] = 0;
				}
			} 

			return output;
		}

		break;

	
	case 'C': // ceil

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				switch((i + j) % 100)
				{
				case 0:
				case 33:
					output[j] = Soliton.var_a * - 1;
					Soliton.buffer_c[i + j] = Soliton.var_a;
					break;

				case 10:
				case 34:
					output[j] = Soliton.var_b * - 1;
					Soliton.var_b = Soliton.var_a;
					break;

				case 20:
				case 35:
					output[j] = Soliton.var_c * - 1;
					Soliton.var_c = Soliton.var_b;
					break;

				case 30:
				case 36:
					output[j] = Soliton.buffer_a[i + j] * - 1;
					Soliton.buffer_a[i + j] = Soliton.var_c;
					break;

				case 40:
				case 37:
					output[j] = Soliton.buffer_b[i + j] * - 1;
					Soliton.buffer_b[i + j] = Soliton.buffer_a[i + j];
					break;

				case 50:
				case 38:
					output[j] = Soliton.buffer_c[i + j] * - 1;
					Soliton.buffer_c[i + j] = Soliton.buffer_b[i + j];
					break;	

				default:
					output[j] = 0;
				}
			} 

			return output;
		}

		break;


	
	case 'd': // distance
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j)
			{
				output[j] = 0;
			}

			if(i == 0)
			{
				output[i] = Soliton.var_a;
				Soliton.var_a *= -1;
			}

			return output;
		};

		break;
	
	
	case 'D': // distance
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j)
			{
				output[j] = Soliton.buffer_a[i];
			}

			if(i == 0)
			{
				var sample = Soliton.clip(Soliton.var_b + Soliton.buffer_a[i]); 
				output[i] = sample;
				Soliton.var_b = sample;
				Soliton.buffer_a[i] = sample;
			}

			return output;
		};

		break;

	
	case 'e': // equal
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j)
			{
				output[j] = Soliton.buffer_b[i];
			}

			if(i == 0)
			{
				var sample = Soliton.clip(Soliton.var_b + Soliton.buffer_b[i]); 
				output[i] = sample;
				Soliton.var_b = sample;
				Soliton.buffer_b[i] = sample;
			}

			return output;
		};

		break;

	case 'E': // equal

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				output[j] = Soliton.buffer_c[Soliton.blockSize - 1 - (i + j)] - Soliton.buffer_c[i + j];
			} 

			Soliton.var_c = output[0];

			return output;
		}

		break;

	
	case 'f': // floor
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				if(Math.random() > 0.5)
					output[j] = Soliton.buffer_c[Soliton.blockSize - 1 - (i + j)] - Soliton.buffer_c[i + j];
				else
					output[j] = Soliton.buffer_b[Soliton.blockSize - 1 - (i + j)];
			} 

			Soliton.var_c = output[0];

			return output;
		}

		break;
	
	
	case 'F': 

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				if(Soliton.prime[i + j])
				{
					output[j] = Soliton.var_b;
					Soliton.var_b *= -1;
				}

				else
					output[j] = 0;
			} 

			return output;
		}

		break;

	case 'g': // return input, assign "+assignVar+"
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				if(Soliton.prime[i + j])
				{
					Soliton.var_a *= 1 / (i + j + 1);
					output[j] = Soliton.var_a;
				}

				else
					output[j] = 0;
			} 

			return output;
		}

		break;

	
	case 'G': // return input, assign "+assignVar+"
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				if(Soliton.prime[i + j])
				{
					Soliton.var_c *= 1 / (i + j + 1);
					output[j] = Soliton.var_a;
				}

				else
					output[j] = Soliton.buffer_a[i + j];
			} 

			return output;
		}

		break;

	
	case 'h': // return input, assign "+assignVar+"
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				if(Soliton.prime[i + j])
				{
					output[j] = Math.sin(i + j);
				}

				else
					output[j] = Soliton.buffer_b[i + j];
			} 

			return output;
		}

		break;

	
	case 'H': // return input, assign "+assignVar+"
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				if(Soliton.prime[i + j])
				{
					var sample = Math.atan2(i + j, Soliton.buffer_c[i + j]); 
					output[j] = sample;
					Soliton.buffer_c[i + j] = sample;
				}

				else
					output[j] = Soliton.buffer_c[i + j];
			} 

			return output;
		}

		break;

	
	case 'i': // inverse sqrt

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (Soliton.var_a * 10) <= 0)
					Soliton.var_a *= Soliton.var_c * - 1;
				
				output[j] = Soliton.var_a + Soliton.buffer_a[i + j];
				Soliton.buffer_b[i + j] = Soliton.wrap(Soliton.var_a + (Soliton.buffer_a[i + j]));
			} 

			return output;
		};

		break;
	
	
	case 'I': // invsqrt(1 / exp2)

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (Soliton.var_b * 10) <= 0)
					Soliton.var_b *= Soliton.var_a * - 1;
				
				output[j] = Soliton.var_b + Soliton.buffer_b[i + j];
				Soliton.buffer_c[i + j] = Soliton.wrap(Soliton.var_b + (Soliton.buffer_b[i + j]));
			} 

			return output;
		};

		break;

	
	case 'j': // return input, assign "+assignVar+"

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (Soliton.var_c * 10) <= 0)
					Soliton.var_c *= Soliton.var_b * - 1;
				
				output[j] = Soliton.var_c + Soliton.buffer_c[i + j];
				Soliton.buffer_a[i + j] = Soliton.wrap(Soliton.var_c + (Soliton.buffer_c[i + j]));
			} 

			return output;
		};

		break;

	
	case 'J': // return input, assign "+assignVar+"

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_a[i + j];

				if(sample > -0.5 && sample < 0.5)
					sample = 0;

				sample = sample + Soliton.buffer_a[i + j];

				output[j] = sample;
				Soliton.buffer_c[((i + j) * 2) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;

	case 'k': // clamp

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{
				var sample = Soliton.buffer_c[i + j];

				if(sample > -0.666 && sample < 0.666)
					sample = 0;

				sample = sample + Soliton.buffer_c[i + j];

				output[j] = sample;
				Soliton.buffer_b[((i + j) * 2) % Soliton.blockSize] = sample;
			} 

			return output;
		}

		break;

		
	case 'K': // clamp
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_a *= Soliton.var_c * - 1;
				
				output[j] = Soliton.var_a + Soliton.buffer_b[i + j];
				Soliton.buffer_c[((i + j) * 2) % Soliton.blockSize] = Soliton.wrap(Soliton.var_a + (Soliton.buffer_b[i + j]));
			} 

			return output;
		};

		break;

	
	case 'l': // log2

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_b = Soliton.clip(Soliton.var_b - (1 / (i + j + 1)));
				
				var sample = Soliton.clip((Soliton.var_b + Soliton.buffer_b[i + j]) * (1 / (i + j + 1)));
				output[j] = sample;
				Soliton.buffer_a[((i + j) + 1) % Soliton.blockSize] = sample;
			} 

			return output;
		};

		break;
	
	
	case 'L': // log2(1 / log2)

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_b = Soliton.clip(Soliton.var_b * (1 / (i + j + 1)));
				
				var sample = Soliton.clip((Soliton.var_b + Soliton.buffer_b[i + j]) * (1 / (i + j + 1)));
				output[j] = sample;
				Soliton.buffer_a[((i + j) + 1) % Soliton.blockSize] = sample;
			} 

			return output;
		};

		break;

	
	case 'm': // min

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_c = Soliton.wrap(Soliton.var_b * (1 / (i + j + 1)));
				
				var sample = Soliton.wrap((Soliton.var_c + Soliton.buffer_a[i + j]) * (1 / (i + j + 1)));
				output[j] = sample;
				Soliton.buffer_a[((i + j) + 1) % Soliton.blockSize] = sample;
			} 

			return output;
		};

		break;
	
	
	case 'M': // max

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_a = Soliton.wrap(Soliton.var_a + (1 / (i + j + 1)));
				
				var sample = Soliton.wrap((Soliton.var_a + Soliton.buffer_a[i + j]) * (1 / (i + j + 1)));
				output[j] = sample;
				Soliton.buffer_c[((i + j) + 1) % Soliton.blockSize] = sample;
			} 

			return output;
		};


		break;

		
	case 'n': // normalize

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_c = Soliton.wrap(Soliton.var_c / (i + j + 1) * -1);
				
				var sample = Soliton.wrap((Soliton.var_c + Soliton.buffer_b[i + j]) * (1 / (i + j + 1)));
				output[j] = sample;
				Soliton.buffer_b[((i + j) + 1) % Soliton.blockSize] = sample;
			} 

			return output;
		};

		break;


	
	case 'N': // normalize

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (154) == 0)
					Soliton.var_b = Soliton.var_b * - 1;
				
				output[j] = Soliton.var_b;
			} 

			return output;
		};

		break;

	
	case 'o': // min

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) % (333) == 0)
					Soliton.var_c = Soliton.var_c * - 1;
				
				output[j] = Soliton.var_c;
			} 

			return output;
		};

		break;

	case 'O': // max

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if(Soliton.prime[i + j])
					Soliton.var_c *= Math.round(Soliton.var_c * -Soliton.var_b);
				
				output[j] = Soliton.var_c + Soliton.buffer_a[i + j];
				Soliton.buffer_a[((i + j) * 2) % Soliton.blockSize] = Soliton.wrap(Soliton.var_c + (Soliton.buffer_a[i + j]));
			} 

			return output;
		};	

		break;

	
	case 'p': // pow

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) == 999)
					Soliton.var_a *= Math.sin(Soliton.buffer_a[((i + j) * 2) % Soliton.blockSize] - Soliton.var_b);
				
				output[j] = Soliton.var_a + Soliton.buffer_c[i + j];
				Soliton.buffer_c[((i + j) * 2) % Soliton.blockSize] = Soliton.wrap(Soliton.var_a + (Soliton.buffer_c[i + j]));
			} 

			return output;
		};	

		break;

	case 'P': // pow pow

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				if((i + j) == 999)
					Soliton.var_b *= Math.sin(Soliton.buffer_b[((i + j) * 2) % Soliton.blockSize] - Soliton.var_b);
				
				output[j] = Soliton.var_b + Soliton.buffer_b[i + j];
				Soliton.buffer_b[((i + j) * 2 + 1) % Soliton.blockSize] = Soliton.wrap(Soliton.var_b + (Soliton.buffer_b[i + j]));
			} 

			return output;
		};

		break

	
	case 'q': // sign value

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.var_b + Soliton.buffer_b[i + j];
				Soliton.buffer_b[Soliton.blockSize - (i + j + 1)] = Soliton.wrap(Soliton.var_b + (Soliton.buffer_b[i + j]));
			} 

			return output;
		};

		break;	


	case 'Q': // sign value

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.var_a + Soliton.buffer_a[i + j];
				var sample = Soliton.wrap(Soliton.var_a - (Soliton.buffer_c[i + j]));
				Soliton.buffer_a[Soliton.blockSize - (i + j + 1)] = sample;
				Soliton.var_a = sample;
			} 

			return output;
		};

		break;

	

	case 'r': // reflect
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_a[i + j] * Soliton.buffer_b[i + j] * Soliton.buffer_c[i + j];
			} 

			return output;
		};

		break;

	
	case 'R': // Refract

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_a[Soliton.blockSize - (i + j + 1)] * Soliton.buffer_b[Soliton.blockSize - (i + j + 1)] * Soliton.buffer_c[Soliton.blockSize - (i + j + 1)];
			} 

			return output;
		};

		break;	

	
	
	case 's': // step

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Math.sin((Soliton.buffer_a[i + j] + Soliton.buffer_b[i + j] + Soliton.buffer_c[i + j]) * 666 + (i + j));
			} 

			return output;
		};

		break;
	

	
	case 'S': // smooth step

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Math.sin((Soliton.buffer_a[i + j] + Soliton.buffer_b[i + j] + Soliton.buffer_c[i + j]) * 4096);

				if((i + j) % 66 == 0)
					Soliton.var_a *= -1;
			} 

			return output;
		};

		break;


	
	case 't': // cross

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.clip(Math.sqrt((Soliton.spliceFuncBlockSize / (i + j + 1))) + Soliton.var_b); 
			} 

			Soliton.var_b = Soliton.wrap(Soliton.var_b - Soliton.buffer_a[i]);

			return output;
		};

		break;

	case 'T': // tangent

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.clip(1 / (Math.sqrt((Soliton.spliceFuncBlockSize / (i + j + 1))) + Soliton.var_b)); 
			} 

			Soliton.var_b = Soliton.wrap(Soliton.var_b - Soliton.buffer_a[i]);

			return output;
		};

		break;	
	
	
	case 'u': // 
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.var_a;

				if(Soliton.prime[i + j])
					Soliton.var_a *= -Soliton.var_b;
			} 

			return output;
		};

		break;

	
	case 'U': // 
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.var_b;

				if(Soliton.prime[i + j])
					Soliton.var_b *= -Soliton.var_c;
			} 

			return output;
		};

		break;


	
	case 'v': // sqrt
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.var_c;

				if(Soliton.prime[i + j])
					Soliton.var_c *= -Soliton.var_a;
			} 

			return output;
		};

		break;

		
	case 'V': // var sqrt
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_a[index];

				if(Soliton.prime[i + j])
					index = i + j;
			} 

			return output;
		};

		break;

	
	case 'w': // FaceForward
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_b[index];

				if(Soliton.prime[i + j])
					index = i + j;
			} 

			return output;
		};

		break;


	case 'W': // FaceForward
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_c[index];

				if(Soliton.prime[i + j])
					index = i + j;
			} 

			return output;
		};

		break;

	
	case 'x': // mix
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_a[index];

				if(Soliton.prime[i + j])
					index++;
			} 

			return output;
		};

		break;
	

	
	case 'X': // mix
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_b[index];

				if(Soliton.prime[i + j])
					index++;
			} 

			return output;
		};

		break;

	case 'y': // mul
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.buffer_c[index];

				if(Soliton.prime[i + j])
					index++;
			} 

			return output;
		};

		break;

	
	case 'Y': // mul
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;
			var var_array = [Soliton.var_a, Soliton.var_b, Soliton.var_c];

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = var_array[index];

				if(Soliton.prime[i + j])
				{
					index = (index + 1) % 3;
					var_array[index] *= -1;
				}
			} 

			return output;
		};

		break;

	
	case 'z': // mul

		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;
			var var_array = [Soliton.buffer_a, Soliton.buffer_b, Soliton.buffer_c];

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = var_array[index][i + j];

				if(Soliton.prime[i + j])
				{
					index = (index + 1) % 3;
					var_array[index][i + j] *= -1;
				}
			} 

			return output;
		};

		break;

	
	case 'Z': // mul
		
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			var index = 0;
			var var_array = [Soliton.buffer_a, Soliton.buffer_b, Soliton.buffer_c];

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = var_array[index][Soliton.blockSize - (i + j + 1)];

				if(Soliton.prime[i + j])
				{
					index = (index + 1) % 3;
					var_array[index][Soliton.blockSize - (i + j + 1)] *= -1;
				}
			} 

			return output;
		};

		break;

*/

	default:
		var sample = (character.charCodeAt(0) / 256 * 2 - 1);
		return function(inputL, inputR, i)
		{ 
			var outputL = new Array(Soliton.spliceFuncBlockSize);
			var outputR = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				outputL[j] = Soliton.wrap(inputL[i +j] + sample);
				outputR[j] = Soliton.wrap(inputR[i +j] + sample);
			} 

			return { l: outputL, r: outputR };
		};
		
		break;
	}
}

Soliton.parseSpliceFX = function(lang)
{
	var audioFuncArray = new Array(lang.length);

	for(var i = 0; i < lang.length; ++i)
	{
		audioFuncArray[i] = Soliton.parseSpliceFXChar(lang[i]);
	}

	return audioFuncArray;
}

Soliton.spliceFX = function(lang, divider, nodeID)
{
	/*
	var source = Soliton.nodes[nodeID];

	if(source != null)
	{
		source.disconnect(0);
		var mix = Soliton.context.createGain();
		var feedBack = Soliton.context.createGain();
		feedBack.gain.value = feedLevel;
		var delay = Soliton.context.createDelay();
		delay.delayTime.value = delayTime;
		source.connect(delay);
		source.connect(mix);
		delay.connect(mix);
		delay.connect(feedBack);
		feedBack.connect(delay);
		mix.connect(Soliton.masterGain);
		return Soliton.addNode(mix);
	}

	return null;*/

	var source = Soliton.nodes[nodeID];

	if(source == null)
		return null;

	var oscNode = Soliton.context.createScriptProcessor(Soliton.blockSize, 2, 2);
	oscNode.audioFuncArray = Soliton.parseSpliceFX(lang);
	oscNode.currentFunc = 0;
	oscNode.divider = divider;

	oscNode.onaudioprocess = function(event)
	{
		var outputArrayL = event.outputBuffer.getChannelData(0);
		var outputArrayR = event.outputBuffer.getChannelData(1);
		var inputArrayL = event.inputBuffer.getChannelData(0);
		var inputArrayR = event.inputBuffer.getChannelData(1);
		var output;

		for(var i = 0; i < Soliton.blockSize; i += (Soliton.spliceFuncBlockSize * this.divider))
		{
			output = this.audioFuncArray[this.currentFunc](inputArrayL, inputArrayR, i);

			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j)
			{
				
				for(var k = 1; k <= this.divider; ++k)
				{
					outputArrayL[i + (j * k)] = output.l[j];
					outputArrayR[i + (j * k)] = output.r[j];	
				}  
			}

			if(++this.currentFunc >= this.audioFuncArray.length)
			 	this.currentFunc = 0;
		}
	}

	oscNode.onaudioprocess.parentNode = oscNode;
	var fadeGain = Soliton.context.createGain();
	source.disconnect(0);
	source.connect(oscNode);
	oscNode.connect(fadeGain);
	fadeGain.connect(Soliton.masterGain);
	fadeGain.gain.value = 1.0;
	fadeGain.gain.linearRampToValueAtTime(1.0, Soliton.context.currentTime + 0.1);
	fadeGain.gain.linearRampToValueAtTime(0.0, Soliton.context.currentTime + 1);
	return Soliton.addNode(oscNode);
}