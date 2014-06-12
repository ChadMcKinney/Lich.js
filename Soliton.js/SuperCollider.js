/* 
    Soliton.js - JavaScript audio framework
    Copyright (C) 2012 Chad McKinney

	http://chadmckinneyaudio.com/
	seppukuzombie@gmail.com

	LICENSE
	=======

	Licensed under the Simplified BSD License:

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met: 

	1. Redistributions of source code must retain the above copyright notice, this
	   list of conditions and the following disclaimer. 
	2. Redistributions in binary form must reproduce the above copyright notice,
	   this list of conditions and the following disclaimer in the documentation
	   and/or other materials provided with the distribution. 

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

	The views and conclusions contained in the software and documentation are those
	of the authors and should not be interpreted as representing official policies, 
	either expressed or implied, of the FreeBSD Project.
*/



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Server setup
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var spawn = require('child_process').spawn;
var scsynth = require('supercolliderjs').scsynth;
var server = new scsynth({
	path: getSCPath(),
	debug: false,
	echo: false,
});

function getSCPath()
{
	switch(process.platform)
	{
	case "win32":
	case "win64":
		return "C:\Program Files (x86)\SuperCollider-3.6.6\scsynth";
		break;
		
	case "darwin":
		return "/Applications/SuperCollider/SuperCollider.app/Contents/Resources/scsynth";
		break;

	case "linux":
		process.env["SC_JACK_DEFAULT_INPUTS"] = "system";
		process.env["SC_JACK_DEFAULT_OUTPUTS"] = "system";
		process.env["JACK_START_SERVER"] = "true";
		return "/usr/local/bin/scsynth";
		break;
	}
}

var _options = { 
	sNumAudioBusChannels: 128,
	sNumControlBusChannels: 4096,
	sMaxLogins: 64,
	sMaxNodes: 1024,
	sNumInputBusChannels: 2,
	sNumOutputBusChannels: 2,
	sNumBuffers: 1024,
	sMaxSynthDefs: 8192,
	sProtocol: "Udp",
	sBufLength: 64,
	sNumRGens: 64,
	sMaxWireBufs: 64,
	sPreferredSampleRate: 44100,
	sLoadGraphDefs: 0,
	sVerbosity: 0,
	sRendezvous: 0,
	sRemoteControlVolume: 0,
	sMemoryLocking: 0,
	sPreferredHardwareBufferFrameSize: 512,
	sRealTimeMemorySize: 81920, // Increased
	sBlockSize: 512,
	sPortNum: 57110,
	sNumPrivateAudioBusChannels: 112
}

var _optionsArray = [
	"-u", _options.sPortNum,
	"-a", _options.sNumAudioBusChannels,
	"-c", _options.sNumControlBusChannels,
	"-i", _options.sNumInputBusChannels,
	"-o", _options.sNumOutputBusChannels,
	"-z", _options.sBlockSize,
	"-Z", _options.sPreferredHardwareBufferFrameSize,
	"-S", _options.sPreferredSampleRate,
	"-b", _options.sNumBuffers,
	"-n", _options.sMaxNodes,
	"-d", _options.sMaxSynthDefs,
	"-m", _options.sRealTimeMemorySize,
	"-w", _options.sMaxWireBufs,
	"-l", _options.sMaxLogins
];

var fs = require('fs');

var _scsynthpid = spawn(getSCPath(), _optionsArray, { env: process.env, stdio: ['pipe', process.stdout, process.stderr] });
var _currentNodeID = 1000;
var s = server;

/*_scsynthpid.stderr.setEncoding('utf8');
_scsynthpid.stderr.on('data', function (data) {
	if (/^execvp\(\)/.test(data))
	{
		console.log('Failed to start child process.');
	}
});*/

process.on('exit', function(code){ console.log("quitting scsynth... "); _scsynthpid.kill(); });

//s.boot();



// Wait for server to boot ... perhaps there's a better way here.
setTimeout( // Initial messages
	function()
	{
		s.connect();
		s.sendMsg("/g_new", [1, 0, 0]); // default group
		s.sendMsg('/notify', [1]);
		s.sendMsg('/status', []);
	},
	2000
);


/*
setInterval( // Initial messages
	function()
	{
		s.connect();
		s.sendMsg('/notify', [1]);
		s.sendMsg('/status', []);
	},
	2000
);
*/

/*
s.on('OSC', function(addr, msg) {
	//console.log(addr+msg);
	if(addr == "/fail")
		console.log('scsynth ERROR:' + msg);
});

scsynth.on('sendosc', function() {
	
});

scsynth.on('rcvosc', function(addr, msg) {
	if(addr == "/fail")
		console.log('scsynth ERROR:' + msg);
});

scsynth.on('debug', function(d) {
  //console.log('scsynth ERROR:' + d);
});
*/

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Nodes
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Function.prototype.inheritsFrom = function(parentClassOrObject) { 
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

// Enum for AddAction
var AddToHead  = 0;
var AddToTail  = 1;
var AddBefore  = 2;
var AddAfter   = 3;
var AddReplace = 4;

// Node IDs for various kinds of nodes
var rootNodeID = 0;
var defaultGroupID = 1;
var grainNodeID = -1;
s.nodeID = 1; // default group

function Node()
{	
	this.freeNode = function()
	{
		s.sendMsg('/n_free', [this.nodeID]);
	}

	this.run = function(bool)
	{
		s.sendMsg('/n_run', [this.nodeID, bool]);
	}

	this.set = function(arg, val)
	{
		s.sendMsg('/n_set', [this.nodeID, arg, val]);
	}

	this.setList = function(argValuePairs)
	{
		s.sendMsg('/n_set', [this.nodeID].concat(argValuePairs));
	}

	this.release = function(releaseTime)
	{
		this.set("gate", (-1 - releaseTime));
	}

	this.trace = function()
	{
		s.sendMsg("/n_trace", [this.nodeID]);
	}

	this.moveBefore = function(node)
	{
		s.sendMsg("/n_before", [this.nodeID, node.nodeID]);
	}

	this.moveAfter = function(node)
	{
		s.sendMsg("/n_after", [this.nodeID, node.nodeID]);
	}

	this.moveToHead = function(group)
	{
		s.sendMsg("/g_head", [group.nodeID, this.nodeID]);
	}

	this.moveToTail = function(group)
	{
		s.sendMsg("/g_tail", [group.nodeID, this.nodeID]);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Group
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function Group(target, action)
{
	target = typeof target === "undefined" ? s : target;
	action = typeof action === "undefined" ? AddToHead : action;
	
	this.moveNodeTohead = function(node)
	{
		s.sendMsg("/g_head", [this.nodeID, node.nodeID]);
	}

	this.moveNodeToTail = function(node)
	{
		s.sendMsg("/g_tail", [this.nodeID, node.nodeID]);
	}

	this.freeAll = function()
	{
		s.sendMsg("/g_freeAll", [this.nodeID]);
	}

	this.deepFree = function()
	{
		s.sendMsg("/g_deepFree", [this.nodeID]);
	}

	this.dumpTree = function()
	{
		s.sendMsg("/g_dumpTree", [this.nodeID]);
	}

	this.nodeID = _currentNodeID++;
	s.sendMsg("/g_new", [this.nodeID, action, target.nodeID]);
}

Group.inheritsFrom(Node);

Group.after = function(target)
{
	return new Group(target, AddAfter);
}

Group.before = function(target)
{
	return new Group(target, AddBefore);
}

Group.head = function(target)
{
	return new Group(target, AddToHead);
}

Group.tail = function(target)
{
	return new Group(target, AddToTail);
}

Group.replace = function(target)
{
	return new Group(target, AddReplace);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Synth
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Synth(name, args, target, action)
{
	args = typeof args === "undefined" ? [] : args;
	target = typeof target === "undefined" ? s : target;
	action = typeof action === "undefined" ? AddToHead : action;

	this.name = name;
	this.nodeID = _currentNodeID++;
	s.sendMsg("/s_new", [name, this.nodeID, action, target.nodeID].concat(args));
}

Synth.inheritsFrom(Node);

Synth.after = function(name, args, target)
{
	return new Synth(name, args, target, AddAfter);
}

Synth.before = function(name, args, target)
{
	return new Synth(name, args, target, AddBefore);
}

Synth.head = function(name, args, target)
{
	return new Synth(name, args, target, AddToHead);
}

Synth.tail = function(name, args, target)
{
	return new Synth(name, args, target, AddToTail);
}

Synth.replace = function(name, args, target)
{
	return new Synth(name, args, target, AddReplace);
}

// Doesn't return a synth, just creates an instance on the server
Synth.grain = function(name, args, target, action)
{
	target = typeof target === "undefined" ? s : target;
	action = typeof action === "undefined" ? AddToHead : action;
	s.sendMsg("/s_new", [name, -1, action, target.nodeID].concat(args)); 
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UGen
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Rate constants
var ScalarRate = 0;
var ControlRate = 1;
var AudioRate = 2;
var DemandRate = 3;

function UGen(name, rate, inputs, numOutputs, specialIndex)
{
	
	this.name = name;
	this.rate = rate;
	this.inputs = inputs;
	this.numInputs = inputs.length;
	this.numOutputs = numOutputs;
	this.specialIndex = typeof specialIndex === "undefined" ? 0 : specialIndex;
	this.synthIndex = -1;
	this.outputIndex = 0;
	this._lichType = AUDIO;
	this._collected = false; // used internally to cull duplicates in the synth graph
}

// supports multi-channel expansion
function multiNewUGen(name, rate, inputs, numOutputs, specialIndex)
{
	var size = 0;

	// Find the largest array length
	for(var i = 0; i < inputs.length; ++i)
	{
		var input = inputs[i];
		
		if(input instanceof Array)
		{
			size = size > input.length ? size : input.length;
		}
	}

	if(size == 0)
	{
		return new UGen(name, rate, inputs, numOutputs, specialIndex);
	}

	else
	{
		var res = [];

		for(var i = 0; i < size; ++i)
		{
			var newInputs = inputs.map(function(e) {
				if(e instanceof Array)
					return e[i % e.length];
				else
					return e;
			});

			res.push(new UGen(name, rate, newInputs, numOutputs, specialIndex));
		}

		return res;
	}
}

////////////////////
// UGen Bindings
////////////////////

/**
 * Lich.sc UGen bindings.
 * @module Lich.sc UGens
 */

var _BIN_PLUS = 0;
var _BIN_MINUS = 1;
var _BIN_MUL = 2;
var _BIN_DIV = 4;

function _binaryOpUGen(selector, a, b)
{
	var rate = ControlRate;
	
	if(a.rate == AudioRate || b.rate == AudioRate)
		rate = AudioRate;
	
	return multiNewUGen("BinaryOpUGen", rate, [a, b], 1, selector);
}

function mix2(a, b)
{
	return _binaryOpUGen(_BIN_PLUS, a, b);
}

function _subtractMix(a, b)
{
	return _binaryOpUGen(_BIN_MINUS, a, b);
}

function gain(a, b)
{
	return _binaryOpUGen(_BIN_MUL, a, b);
}

function _audioDivision(a, b)
{
	return _binaryOpUGen(_BIN_DIV, a, b);
}

/**
 * Output a constant value
 *
 * @class dc
 * @constructor
 * @param value Value to be output
 * @example let test value => dc value >> out 0
 * @example let t = test 1
 * @example stop t
 */
function dc(value)
{
	return multiNewUGen("DC", AudioRate, [value], 1, 0);
}

/**
 * Oscillators.
 * @submodule Oscillators
 */

/**
 * A sine wave oscillator.
 *
 * @class sin
 * @constructor
 * @param freq Frequency
 * @example let test f => sin f >> out 0
 * @example let t = test 440
 * @example stop t
 */
function sin(freq)
{
	return multiNewUGen("SinOsc", AudioRate, [freq, 0], 1, 0);
}

/**
 * A saw wave oscillator.
 *
 * @class saw 
 * @constructor
 * @param freq Frequency
 * @example let test f => saw f >> out 0
 * @example let t = test 440
 * @example stop t
 */
function saw(freq)
{
	return multiNewUGen("Saw", AudioRate, [freq], 1, 0);
}

/**
 * A triangle wave oscillator.
 *
 * @class tri
 * @constructor
 * @param freq Frequency
 * @example let test f => tri f >> out 0
 * @example let t = test 440
 * @example stop t
 */
function tri(freq)
{
	return multiNewUGen("LFTri", AudioRate, [freq,0], 1, 0);
}

/**
 * A square wave oscillator.
 *
 * @class square
 * @constructor
 * @param freq Frequency
 * @example let test f => square f >> out 0
 * @example let t = test 440
 * @example stop t
 */
function square(freq)
{
	return multiNewUGen("Pulse", AudioRate, [freq,0.5], 1, 0);
}

/**
 * A pulse wave oscillator with variable duty cycle.
 *
 * @class pulse
 * @constructor
 * @param freq Frequency
 * @param width Pulse width from 0.0 to 1.0
 * @example let test f w => pulse f w >> out 0
 * @example let t = test 440 0.2
 * @example stop t
 */
function pulse(freq,width)
{
	return multiNewUGen("Pulse", AudioRate, [freq,width], 1, 0);
}

/**
 * An oscillator with a variable number of harmonics of equal amplitude.
 *
 * @class blip
 * @constructor
 * @param freq Frequency
 * @param nharm Number of harmonics
 * @example let test f n => blip f n >> out 0
 * @example let t = test 440 5
 * @example stop t
 */
function blip(freq,nharm)
{
	return multiNewUGen("Blip", AudioRate, [freq,nharm], 1, 0);
}

/**
 * Generates a set of harmonics around a formant frequency at a given fundamental frequency.
 *
 * @class formant
 * @constructor
 * @param fundf Fundamental frequency
 * @param formf Formant frequency
 * @param bwf Pulse width frequency. Must be >= fundf.
 * @example let test fund form bwf => blip fund form bwf >> out 0
 * @example let t = test 440 1760 880
 * @example stop t
 */
function formant(fundf,formf,bwf)
{
	return multiNewUGen("Formant", AudioRate, [fundf,formf,bwf], 1, 0);
}

/**
 * Generates single sample impulses at a frequency.
 *
 * @class impulse
 * @constructor
 * @param freq Frequency
 * @example let test f => impulse f >> out 0
 * @example let t = test 5
 * @example stop t
 */
function impulse(freq)
{
	return multiNewUGen("Impulse", AudioRate, [freq,0], 1, 0);
}

/**
 * White noise generator.
 *
 * @class white 
 * @constructor
 * @param amp Amplitude of the noise
 * @example let test a => white a >> out 0
 * @example let t = test 1
 * @example stop t
 */
function white(amp)
{
	return _binaryOpUGen(_BIN_MUL, multiNewUGen("WhiteNoise", AudioRate, [], 1, 0), amp);
}

/**
 * Noise.
 * @submodule Noise
 */

/**
 * Pink noise generator.
 *
 * @class pink
 * @constructor
 * @param amp Amplitude of the noise
 * @example let test a => pink a >> out 0
 * @example let t = test 1
 * @example stop t
 */
function pink(amp)
{
	return _binaryOpUGen(_BIN_MUL, multiNewUGen("PinkNoise", AudioRate, [], 1, 0), amp);
}

/**
 * Brownian noise generator.
 *
 * @class brown
 * @constructor
 * @param amp Amplitude of the noise
 * @example let test a => brown a >> out 0
 * @example let t = test 1
 * @example stop t
 */
function brown(amp)
{
	return _binaryOpUGen(_BIN_MUL, multiNewUGen("BrownNoise", AudioRate, [], 1, 0), amp);
}

/**
 * Gray noise generator.
 *
 * @class gray
 * @constructor
 * @param amp Amplitude of the noise
 * @example let test a => gray a >> out 0
 * @example let t = test 1
 * @example stop t
 */
function gray(amp)
{
	return _binaryOpUGen(_BIN_MUL, multiNewUGen("GrayNoise", AudioRate, [], 1, 0), amp);
}

/**
 * Generates noise whose values are either -1 or 1.
 *
 * @class clipNoise
 * @constructor
 * @param amp Amplitude of the noise
 * @example let test a => clipNoise a >> out 0
 * @example let t = test 1
 * @example stop t
 */
function clipNoise(amp)
{
	return _binaryOpUGen(_BIN_MUL, multiNewUGen("ClipNoise", AudioRate, [], 1, 0), amp);
}

/**
 * A noise generator based on a chaotic function.
 *
 * @class crackle
 * @constructor
 * @param chaos A parameter of the chaotic function with useful values from just below 1.0 to just above 2.0. Towards 2.0 the sound crackles.
 * @example let test c => crackle c >> out 0
 * @example let t = test 1.5
 * @example stop t
 */
// fix this?
function crackle(chaos)
{
	return multiNewUGen("Crackle", AudioRate, [chaos], 1, 0);
}

/**
 * Generates random impulses from 0 to +1.
 *
 * @class dust
 * @constructor
 * @param density Average number of impulses per second.
 * @example let test d => dust d >> out 0
 * @example let t = test 1.5
 * @example stop t
 */
function dust(density)
{
	return multiNewUGen("Dust", AudioRate, [density], 1, 0);
}

/**
 * A stepped random number generator
 *
 * @class noiseN
 * @constructor
 * @param freq Frequency of random number generation
 * @example let test f => noiseN f >> out 0
 * @example let t = test 440
 * @example stop t
 */
function noiseN(freq)
{
	return multiNewUGen("LFNoise0", AudioRate, [freq], 1, 0);
}

/**
 * A linearly interpolated random number generator
 *
 * @class noiseL
 * @constructor
 * @param freq Frequency of random number generation
 * @example let test f => noiseL f >> out 0
 * @example let t = test 440
 * @example stop t
 */
function noiseL(freq)
{
	return multiNewUGen("LFNoise1", AudioRate, [freq], 1, 0);
}

/**
 * A cubic interpolated random number generator
 *
 * @class noiseX
 * @constructor
 * @param freq Frequency of random number generation
 * @example let test f => noiseX f >> out 0
 * @example let t = test 440
 * @example stop t
 */
function noiseX(freq)
{
	return multiNewUGen("LFNoise2", AudioRate, [freq], 1, 0);
}

/**
 * A non-interpolating sound generator based on the difference equation: x[n+1] = a - b * sqrt(abs(x[n]))
 *
 * @class cuspN 
 * @constructor
 * @param freq Frequency
 * @param a Equation variable
 * @param b Equation variable
 * @param xi Initial value of x
 * @example let test f a b xi => cuspN f a b xi >> out 0
 * @example let t = test 22050 1 1.9 0
 * @example stop t
 */
function cuspN(freq,a,b,xi)
{
	return multiNewUGen("CuspN", AudioRate, [freq,a,b,xi], 1, 0);
}

/**
 * Chaotic Oscillators.
 * @submodule Chaos
 */

/**
 * A linearly interpolating sound generator based on the difference equation: x[n+1] = a - b * sqrt(abs(x[n]))
 *
 * @class cuspL 
 * @constructor
 * @param freq Frequency
 * @param a Equation variable
 * @param b Equation variable
 * @param xi Initial value of x
 * @example let test f a b xi => cuspL f a b xi >> out 0
 * @example let t = test 22050 1 1.9 0
 * @example stop t
 */
function cuspL(freq,a,b,xi)
{
	return multiNewUGen("CuspL", AudioRate, [freq,a,b,xi], 1, 0);
}

/**
 * A non-interpolating sound generator based on the difference equation: x[n+1] = 1 - y[n] + abs(x[n]); y[n+1] = x[n];
 *
 * @class gbmanN
 * @constructor
 * @param freq Frequency
 * @param xi Initial value of x
 * @param yi Initial value of y
 * @example let test f xi yi => gbmanN f xi yi >> out 0
 * @example let t = test 22050 1.2 2.1
 * @example stop t
 */
function gbmanN(freq,xi,yi)
{
	return multiNewUGen("GbmanN", AudioRate, [freq,xi,yi], 1, 0);
}

/**
 * A linearly interpolating sound generator based on the difference equation: x[n+1] = 1 - y[n] + abs(x[n]); y[n+1] = x[n];
 *
 * @class gbmanL
 * @constructor
 * @param freq Frequency
 * @param xi Initial value of x
 * @param yi Initial value of y
 * @example let test f xi yi => gbmanL f xi yi >> out 0
 * @example let t = test 22050 1.2 2.1
 * @example stop t
 */
function gbmanL(freq,xi,yi)
{
	return multiNewUGen("GbmanL", AudioRate, [freq,xi,yi], 1, 0);
}

/**
 * A low pass filter.
 * 
 * @class lowpass
 * @constructor
 * @param freq Cutoff frequency for the filter
 * @param q Quality of the filter
 * @example let test f q => white 1 >> lowpass f q >> out 0
 * @example let t = test 440 10
 * @example stop t
 */
function lowpass(freq, q, input)
{
	return multiNewUGen("RLPF", AudioRate, [input,freq,1/q], 1, 0);
}

/**
 * Filters.
 * @submodule Filters
 */

/**
 * A high pass filter.
 * 
 * @class highpass
 * @constructor
 * @param freq Cutoff frequency for the filter
 * @param q Quality of the filter
 * @example let test f q => white 1 >> highpass f q >> out 0
 * @example let t = test 440 10
 * @example stop t
 */
function highpass(freq, q, input)
{
	return multiNewUGen("RHPF", AudioRate, [input,freq,1/q], 1, 0);
}

/**
 * A band pass filter.
 * 
 * @class bandpass 
 * @constructor
 * @param freq Cutoff frequency for the filter
 * @param q Quality of the filter
 * @example let test f q => white 1 >> bandpass f q >> out 0
 * @example let t = test 440 10
 * @example stop t
 */
function bandpass(freq, q, input)
{
	return multiNewUGen("BPF", AudioRate, [input,freq,1/q], 1, 0);
}

/**
 * Ramp a signal between two values over time.
 *
 * @class lag
 * @constructor
 * @param lagtime Ramp time in seconds
 * @example let test lagtime => noiseN 100 >> lag lagtime >> out 0
 * @example let t = test 0.001
 * @example stop t
 */
function lag(lagtime, input)
{
	return multiNewUGen("Lag", AudioRate, [input,lagtime], 1, 0);
}

/**
 * Bit crush a signal.
 *
 * @class crush
 * @constructor
 * @param bits Bitdepth of resulting signal (1-64)
 * @example let test b => sin 440 >> crush b >> out 0
 * @example let t = test 4
 * @example stop t
 */
function crush(bits, input)
{
	return multiNewUGen("Decimator", AudioRate, [input,44100,bits], 1, 0);
}

/**
 * Sample rate reduction on a signal.
 *
 * @class decimate
 * @constructor
 * @param rate Sample rate of resulting signel (1-44100)
 * @example let test r => sin 440 >> decimate r >> out 0
 * @example let t = test 11000
 * @example stop t
 */
function decimate(rate, input)
{
	return multiNewUGen("Decimator", AudioRate, [input,rate,64], 1, 0);
}

/**
 * An allpass delay line with no interpolation.
 * 
 * @class allpassN
 * @constructor
 * @param maxDel Max delay time in seconds
 * @param del Delay time in seconds
 * @param decay Time for the echoes to decay by 60 decibels.
 * @example let test del => impulse 1 >> allpassN del del 1 >> out 0
 * @example let t = test 0.1
 * @example stop t
 */
function allpassN(maxDel, del, decay, input)
{
	return multiNewUGen("AllpassN", AudioRate, [input,maxDel,del,decay], 1, 0);
}

/**
 * Delays.
 * @submodule Delays
 */

/**
 * An allpass delay line with linear interpolation.
 *
 * @class allpassL
 * @constructor
 * @param maxDel Max delay time in seconds
 * @param del Delay time in seconds
 * @param decay Time for the echoes to decay by 60 decibels.
 * @example let test del => impulse 1 >> allpassL del del 1 >> out 0
 * @example let t = test 0.1
 * @example stop t
 */
function allpassL(maxDel, del, decay, input)
{
	return multiNewUGen("AllpassL", AudioRate, [input,maxDel,del,decay], 1, 0);
}

/**
 * An allpass delay line with cubic interpolation.
 *
 * @class allpassC 
 * @constructor
 * @param maxDel Max delay time in seconds
 * @param del Delay time in seconds
 * @param decay Time for the echoes to decay by 60 decibels.
 * @example let test del => impulse 1 >> allpassC del del 1 >> out 0
 * @example let t = test 0.1
 * @example stop t
 */
function allpassC(maxDel, del, decay, input)
{
	return multiNewUGen("AllpassC", AudioRate, [input,maxDel,del,decay], 1, 0);
}

/**
 * A comb delay line with no interpolation.
 *
 * @class combN
 * @constructor
 * @param maxDel Max delay time in seconds
 * @param del Delay time in seconds
 * @param decay Time for the echoes to decay by 60 decibels.
 * @example let test del => impulse 1 >> combN del del 1 >> out 0
 * @example let t = test 0.1
 * @example stop t
 */
function combN(maxDel, del, decay, input)
{
	return multiNewUGen("CombN", AudioRate, [input,maxDel,del,decay], 1, 0);
}

/**
 * A comb delay line with linear interpolation.
 *
 * @class combL
 * @constructor
 * @param maxDel Max delay time in seconds
 * @param del Delay time in seconds
 * @param decay Time for the echoes to decay by 60 decibels.
 * @example let test del => impulse 1 >> combL del del 1 >> out 0
 * @example let t = test 0.1
 * @example stop t
 */
function combL(maxDel, del, decay, input)
{
	return multiNewUGen("CombL", AudioRate, [input,maxDel,del,decay], 1, 0);
}

/**
 * A comb delay line with cubic interpolation.
 *
 * @class combC
 * @constructor
 * @param maxDel Max delay time in seconds
 * @param del Delay time in seconds
 * @param decay Time in seconds for the echoes to decay by 60 decibels.
 * @example let test del => impulse 1 >> combC del del 1 >> out 0
 * @example let t = test 0.1
 * @example stop t
 */
function combC(maxDel, del, decay, input)
{
	return multiNewUGen("CombC", AudioRate, [input,maxDel,del,decay], 1, 0);
}

/**
 * A simple delay with no interpolation.
 *
 * @class delayN
 * @constructor
 * @param maxDel Max delay time in seconds
 * @param del Delay time in seconds
 * @example let test del => impulse 1 >> delayN del del >> out 0
 * @example let t = test 0.1
 * @example stop t
 */
function delayN(maxDel, del, input)
{
	return multiNewUGen("DelayN", AudioRate, [input,maxDel,del], 1, 0);
}

/**
 * A simple delay with linear interpolation.
 *
 * @class delayL
 * @constructor
 * @param maxDel Max delay time in seconds
 * @param del Delay time in seconds
 * @example let test del => impulse 1 >> delayL del del >> out 0
 * @example let t = test 0.1
 * @example stop t
 */
function delayL(maxDel, del, input)
{
	return multiNewUGen("DelayL", AudioRate, [input,maxDel,del], 1, 0);
}

/**
 * A simple delay with cubic interpolation.
 *
 * @class delayC
 * @constructor
 * @param maxDel Max delay time in seconds
 * @param del Delay time in seconds
 * @example let test del => impulse 1 >> delayC del del >> out 0
 * @example let t = test 0.1
 * @example stop t
 */
function delayC(maxDel, del, input)
{
	return multiNewUGen("DelayC", AudioRate, [input,maxDel,del], 1, 0);
}

var _shapeNames = {
	step: 0,
	lin: 1,
	linear: 1,
	exp: 2,
	exponential: 2,
	sin: 3,
	sine: 3,
	wel: 4,
	welch: 4,
	sqr: 6,
	squared: 6,
	cub: 7,
	cubed: 7
}

function _prEnv(levels, times, shape, input, doneAction)
{
	if(!(levels instanceof Array && times instanceof Array))
		throw new Error("env levels and times must be arrays");

	var size = times.length;
	var contents = [];
	contents.push(levels[0]);
	contents.push(size);
	contents.push(-99); // -99 = no releaseNode
	contents.push(-99); // -99 = no loopNode
	var shapeNum = _shapeNames.hasOwnProperty(shape) ? _shapeNames[shape] : 5; // 5 = custom shape
	var curveNum = typeof shape === "string" ? 0 : shape; // 0 default shape

	for(var i = 0; i < size; ++i)
	{
		contents.push(levels[i+1]);
		contents.push(times[i]);
		contents.push(shapeNum);
		contents.push(curveNum);
	}
	
	return multiNewUGen(
		"EnvGen",
		AudioRate,
		[1/*gate*/, 1/*levelScale*/, 0/*levelBias*/, 1/*timeScale*/, doneAction].concat(contents),
		1,
		0
	);
}

/**
 * Envelope generator. Used for amplitude envelopes, will automatically free the synth when finished.
 * @class env
 * @constructor
 * @param levels The levels that the envelope will move through
 * @param times The times it takes for the env to move between levels. Should be 1 item less than levels
 * @param shape Either a shape number or string. Some examples: -4, 0, 1, "linear", "squared"
 * @param input The input will be scaled according to the envelope. This can be a ugen or number.
 */
function env(levels, times, shape, input)
{	
	// doneAction 2 kills the synth
	return _binaryOpUGen(_BIN_MUL, _prEnv(levels, times, shape, input, 2), input);
}

/**
 * Envelopes.
 * @submodule Envelopes
 */

/**
 * Envelope generator. Used for amplitude envelopes, will NOT automatically free the synth when finished.
 * @class env2
 * @constructor
 * @param levels The levels that the envelope will move through
 * @param times The times it takes for the env to move between levels. Should be 1 item less than levels
 * @param shape Either a shape number or string. Some examples: -4, 0, 1, "linear", "squared"
 * @param input The input will be scaled according to the envelope. This can be a ugen or number.
 */
function env2(levels, times, shape, input)
{	
	// doneAction 0 doesn't kill the synth
	return _binaryOpUGen(_BIN_MUL, _prEnv(levels, times, shape, input, 0), input);
}

/**
 * Envelope generator. Used for amplitude envelopes, will automatically free the synth when finished.
 * @class perc
 * @constructor
 * @param attackTime Time for the envelope to go from 0 to the peak
 * @param peak The highest level the envelope with reach
 * @param decayTime Time for the envelope to go from the peak to 0
 * @param input The input will be scaled according to the envelope. This can be a ugen or number.
 */
function perc(attackTime, peak, decayTime, input)
{
	return env([0,peak,0], [attackTime, decayTime], -4, input);
}

/**
 * Envelope generator. Used for amplitude envelopes, will NOT automatically free the synth when finished.
 * @class perc2
 * @constructor
 * @param attackTime Time for the envelope to go from 0 to the peak
 * @param peak The highest level the envelope with reach
 * @param decayTime Time for the envelope to go from the peak to 0
 * @param input The input will be scaled according to the envelope. This can be a ugen or number.
 */
function perc2(attackTime, peak, decayTime, input)
{
	return env2([0,peak,0], [attackTime, decayTime], -4, input);
}

/**
 * Send a signal to an output bus.
 *
 * @class out
 * @constructor
 * @param busNum The bus index to send to
 * @example let test bus => white 1 >> out bus
 * @example let t = test 0
 * @example stop t
 */
function out(busNum, value)
{
	var outGen =  multiNewUGen("Out", AudioRate, [busNum, value], 0, 0); // Out has not outputs

	if(outGen instanceof Array)
	{
		for(var i = 0; i < outGen.length; ++i) // expand the output bus to account for multichannel expansion
		{
			outGen[i].inputs[0] = busNum + i;
		}
	}

	return outGen;
}

/**
 * Inputs and Outputs
 * @submodule InputOutput
 */

// Control is used internally for SynthDef arguments/controls
function _ControlName(name, controlIndex)
{
	this._lichType = AUDIO;
	this.name = name;
	this.controlIndex = controlIndex;
	this.rate = ControlRate;
}

function _Control(numControls)
{
	var values = [];

	for(var i = 0; i < numControls; ++i)
	{
		values.push(0);
	}
	
	return multiNewUGen("Control", ControlRate, values, numControls, 0);
}

function _writeInputSpec(buf, ugen, offset, constants, controls)
{
	var isNum = typeof ugen === "number";

	if(isNum)
	{
		buf.writeInt32BE(-1, offset);
		offset += 4;
		buf.writeInt32BE(constants[ugen], offset);
	}

	else if(ugen instanceof _ControlName)
	{
		buf.writeInt32BE(0, offset); // The control ugen is always in the 0 index
		offset += 4;
		buf.writeInt32BE(controls[ugen.name], offset);
	}

	else
	{
		buf.writeInt32BE(ugen.synthIndex, offset);
		offset += 4;
		buf.writeInt32BE(ugen.outputIndex, offset);
	}

	return offset + 4;
}

function _writeUGenBytes(buf, ugen, offset, constants, controls)
{
	offset = _pstring(buf, ugen.name, offset);
	buf.writeInt8(ugen.rate, offset);
	offset += 1;
	buf.writeInt32BE(ugen.numInputs, offset);
	offset += 4;
	buf.writeInt32BE(ugen.numOutputs, offset);
	offset += 4;
	buf.writeInt16BE(ugen.specialIndex, offset);
	offset += 2;
	
	for(var i = 0; i < ugen.inputs.length; ++i)
	{
		offset = _writeInputSpec(buf, ugen.inputs[i], offset, constants, controls);
	}

	for(var i = 0; i < ugen.numOutputs; ++i)
	{
		buf.writeInt8(ugen.rate, offset);
		++offset;
	}
	
	return offset;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SynthDef
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _pstring(buf, string, offset)
{
	buf.writeInt8(string.length, offset);
	offset += 1;
	buf.write(string, offset, string.length);

	return offset + string.length;
}

function _ugenToDefList(ugen, constants, controls)
{
	if(ugen instanceof Array) // Multichannel support
	{
		var defList = [];

		for(var i = 0; i < ugen.length; ++i)
		{
			defList = defList.concat(_ugenToDefList(ugen[i], constants, controls));
		}

		return defList;
	}
	
	else if(typeof ugen === "number")
	{
		if(!constants.hasOwnProperty(ugen))
		{
			constants[ugen] = constants.numConstants;
			constants.arr.push(ugen);
			constants.numConstants += 1;
		}

		return [];
	}

	else if(ugen instanceof _ControlName)
	{
		if(!controls.hasOwnProperty(ugen.name))
		{
			controls[ugen.name] = ugen.controlIndex;
			controls.arr.push(ugen);
			controls.numControls += 1;
		}

		return [];
	}
	   
	var defList = [ugen];

	for(var i = ugen.inputs.length - 1; i >= 0; --i)
	{
		defList = defList.concat(_ugenToDefList(ugen.inputs[i], constants, controls));
	}
	
	return defList;
}

function _writeDef(buf, children, offset, constants, controls)
{
	for(var i = 0; i < children.length; ++i)
	{
		offset = _writeUGenBytes(buf, children[i], offset, constants, controls);
	}

	return offset;
}

function _removeDuplicateChildren(children)
{
	for(var i = 0; i < children.length; ++i)
	{
		var child = children[i];

		if(child._collected)
			children[i] = null;
		else
			child._collected = true;
	}

	return children.filter(function(e){ return e != null });
}

// Compile a Lich synth to a SuperCollider synth definition. This requires a very specific binary format.
function _synthDef(name, def)
{
	var offset = 4; // default offset to for becase we always start with the same header
	var numBytes = 11 + name.length;
	var buf = new Buffer(1024);

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Initialize controls, constants, and children
	
	var controls = { numControls: 0, arr: [] };
	var constants = { numConstants: 1, arr: [0], 0:0 }; // We always need the zero constat for controls
	var children = _ugenToDefList(def, constants, controls).reverse();

	children = _removeDuplicateChildren(children);
	
	if(controls.numControls > 0)
		children = [_Control(controls.numControls)].concat(children);
	
	for(var i = 0; i < children.length; ++i)
	{
		children[i].synthIndex = i;
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Header
	
	buf.write("SCgf", 0, 4); // SuperCollider synth definition file header
	buf.writeInt32BE(2, offset); // SC synthdef version number
	offset += 4;
	buf.writeInt16BE(1, offset); // Number of SynthDefinitions
	offset += 2;
	offset = _pstring(buf, name, offset); // Name of the SynthDef

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Constants
	
	buf.writeInt32BE(constants.numConstants, offset);
	offset += 4;
	
	for(var i = 0; i < constants.arr.length; ++i) // Write the constant values
	{
		buf.writeFloatBE(constants.arr[i], offset);
		offset += 4;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Controls

	buf.writeInt32BE(controls.numControls, offset); // NUMBER OF Arguments/Parameters/Controls.
	offset += 4;

	for(var i = 0; i < controls.numControls; ++i) // Write the default values for all the controls. In Lich they're always just 0.
	{
		buf.writeFloatBE(0, offset);
		offset += 4;
	}
	
	buf.writeInt32BE(controls.numControls, offset); // NUMBER OF Arguments/Parameters/Controls NAMES. This will always be the same in Lich
	offset += 4;

	for(var i = 0; i < controls.numControls; ++i) // Write the names of all the controls
	{
		offset = _pstring(buf, controls.arr[i].name, offset); // name of the controls
 		buf.writeInt32BE(i, offset); // index of the control value, in Lich this will be the same for the name as the initial value above
		offset += 4;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// UGens
	
	buf.writeInt32BE(children.length, offset); // Number of UGens
	offset += 4;
	
	offset = _writeDef(buf, children, offset, constants, controls); // Compile the ugen list

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Variants
	
	buf.writeInt16BE(0, offset); // number of variants. ZERO until variants are supported
	offset += 2;

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// File and OSC
	
	// buf = buf.slice(0, offset);
	s.sendMsg('/d_recv', [buf.slice(0, offset)]);
	// console.log(buf.toString());

    	/*
    	var path = "/tmp/"+name+".scsyndef";
	
	fs.writeFile(
		path,
		buf,
		function(err) {
			if(err) {
				console.log(err);
			} else {
				s.sendMsg('/d_load', [path]);
			}
		}
	);*/
	
	return Lich.VM.Void;
}

function stop(synth)
{
	if(!(synth instanceof Synth))
	   throw new Error("stop can only be called on Synths.");

	synth.freeNode();
	return Lich.VM.Void;
}

function freeAll()
{
    s.sendMsg('/g_freeAll', [1]);
}

// Redefine Lich.compileSynthDef to use SuperCollider behavior instead of web audio
Lich.compileSynthDef = function(ast)
{
	//ast.astType = "decl-fun";
	//ast.noCollapse = true;
	// var res = Lich.compileAST(ast)+";Soliton.synthDefs[\""+ast.ident.id+"\"]="+ast.ident.id;
	var def = Lich.compileAST(ast.rhs);
	var localArgNames = [];
	var localArgs = [];
	var numArgs = 0;

	for(var i = 0; i < ast.args.length; ++i)
	{
		if(ast.args[i].astType == "varname")
		{
			var argName = ast.args[i].id;
			
			if(localArgNames.indexOf(argName) != -1)
			{
				throw new Error("Duplicate definition for argument: " + argName + " in synth definition " + ast.ident.id);
			}

			else
			{
				localArgNames.push("var " + argName + " = new _ControlName(\""+argName+"\","+numArgs+");");
				localArgs.push(argName);
				numArgs++;
			}
		}
	}

	var res;
	
	if(numArgs == 0)
		res = "_synthDef(\""+ast.ident.id+"\","+def+");";
	else
		res = "_synthDef(\""+ast.ident.id+"\",(function(){"+localArgNames.join("")+"return "+def+"})());";

	var argsAndIndexes = [];

	for(var i = 0; i < localArgs.length; ++i)
	{
		argsAndIndexes.push(i);
		argsAndIndexes.push(localArgs[i]);
	}
	
	res += ast.ident.id + "=function("+localArgs.join(",")+"){return new Synth(\""+ast.ident.id+"\",["+argsAndIndexes.join(",")+"]);};";
	 
	if(Lich.parseType !== "library")
		res += ";Lich.VM.Print("+ast.ident.id+");";

	return res;
}
