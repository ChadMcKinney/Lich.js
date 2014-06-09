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


/*
var defaultServerOptions = { 
	sNumAudioBusChannels: 128,
	sNumControlBusChannels: 4096,
	sMaxLogins: 64,
	sMaxNodes: 1024,
	sNumInputBusChannels: 8,
	sNumOutputBusChannels: 8,
	sNumBuffers: 1024,
	sMaxSynthDefs: 2048,
	sProtocol: Udp,
	sBufLength: 64,
	sNumRGens: 64,
	sMaxWireBufs: 64,
	sPreferredSampleRate: 44100,
	sLoadGraphDefs: True,
	sVerbosity: 0,
	sRendezvous: False,
	sRemoteControlVolume: False,
	sMemoryLocking: False,
	sPreferredHardwareBufferFrameSize: 512,
	sRealTimeMemorySize: 81920, // Increased
	sBlockSize: 512,
	sPortNum: 57110, // Don't use the default SuperCollider scsynth port to prevent clashes
	sNumPrivateAudioBusChannels: 112
}*/

// process.env.SC_JACK_DEFAULT_INPUTS = "system";
// process.env.SC_JACK_DEFAULT_OUTPUTS = "system";
// process.env.JACK_START_SERVER = "false";

var scsynth = require('supercolliderjs').scsynth;
var server = new scsynth({
	path:"/usr/local/bin"
});

var fs = require('fs');

var _currentNodeID = 1000;
var s = server;
s.connect();
//s.boot();


/*
// Wait for server to boot ... perhaps there's a better way here.
setTimeout( // Initial messages
	function()
	{
		s.connect();
		s.sendMsg('/notify', [1]);
		s.sendMsg('/status', []);
	},
	1000
);

setInterval( // Initial messages
	function()
	{
		s.connect();
		s.sendMsg('/notify', [1]);
		s.sendMsg('/status', []);
	},
	2000
);*/

/*
s.on('OSC', function(addr, msg) {
	console.log(addr+msg);
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
s.nodeID = 1;

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
}

////////////////////
// UGen Bindings
////////////////////

var _BIN_PLUS = 0;
var _BIN_MINUS = 1;
var _BIN_MUL = 2;
var _BIN_DIV = 4;

function _binaryOpUGen(selector, a, b)
{
	return new UGen("BinaryOpUGen", AudioRate, [a, b], 1, selector);
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

// deterministic
function sin(freq)
{
	return new UGen("SinOsc", AudioRate, [freq, 0], 1, 0);
}

function saw(freq)
{
	return new UGen("Saw", AudioRate, [freq], 1, 0);
}

function tri(freq)
{
	return new UGen("LFTri", AudioRate, [freq,0], 1, 0);
}

function square(freq)
{
	return new UGen("Pulse", AudioRate, [freq,0.5], 1, 0);
}

function pulse(freq,width)
{
	return new UGen("Pulse", AudioRate, [freq,width], 1, 0);
}

function blip(freq,nharm)
{
	return new UGen("Blip", AudioRate, [freq,nharm], 1, 0);
}

function formant(fundf,formf,bwf)
{
	return new UGen("Formant", AudioRate, [fundf,formf,bwf], 1, 0);
}

function impulse(freq)
{
	return new UGen("Impulse", AudioRate, [freq,0], 1, 0);
}

// noise
function white(amp)
{
	return _binaryOpUGen(_BIN_MUL, new UGen("WhiteNoise", AudioRate, [], 1, 0), amp);
}

function pink(amp)
{
	return _binaryOpUGen(_BIN_MUL, new UGen("PinkNoise", AudioRate, [], 1, 0), amp);
}

function brown(amp)
{
	return _binaryOpUGen(_BIN_MUL, new UGen("BrownNoise", AudioRate, [], 1, 0), amp);
}

function gray(amp)
{
	return _binaryOpUGen(_BIN_MUL, new UGen("GrayNoise", AudioRate, [], 1, 0), amp);
}

function clipNoise(amp)
{
	return _binaryOpUGen(_BIN_MUL, new UGen("ClipNoise", AudioRate, [], 1, 0), amp);
}
// fix this?
function crackle(chaos)
{
	return new UGen("Crackle", AudioRate, [chaos], 1, 0);
}

function dust(value)
{
	return new UGen("Dust", AudioRate, [value], 1, 0);
}

function noiseN(value)
{
	return new UGen("LFNoise0", AudioRate, [value], 1, 0);
}

function noiseL(value)
{
	return new UGen("LFNoise1", AudioRate, [value], 1, 0);
}

function noiseX(value)
{
	return new UGen("LFNoise2", AudioRate, [value], 1, 0);
}

// chaos
function cuspN(freq,a,b,xi)
{
	return new UGen("CuspN", AudioRate, [freq,a,b,xi], 1, 0);
}

function cuspL(freq,a,b,xi)
{
	return new UGen("CuspL", AudioRate, [freq,a,b,xi], 1, 0);
}

function gbmanN(freq,xi,yi)
{
	return new UGen("GbmanN", AudioRate, [freq,xi,yi], 1, 0);
}

function gbmanL(freq,xi,yi)
{
	return new UGen("GbmanL", AudioRate, [freq,xi,yi], 1, 0);
}

// filters
function lowpass(freq, q, input)
{
	return new UGen("RLPF", AudioRate, [input,freq,1/q], 1, 0);
}

function highpass(freq, q, input)
{
	return new UGen("RHPF", AudioRate, [input,freq,1/q], 1, 0);
}

function bandpass(freq, q, input)
{
	return new UGen("BPF", AudioRate, [input,freq,1/q], 1, 0);
}

//
function dc(value)
{
	return new UGen("DC", AudioRate, [value], 1, 0);
}

function out(busNum, value)
{
	return new UGen("Out", AudioRate, [busNum, value], 0, 0); // Out has not outputs
}

// Control is used interanlly for SynthDef arguments/controls

function _ControlName(name, controlIndex)
{
	return {_lichType:"CONTROL_NAME", name: name, controlIndex: controlIndex };
}

function _Control(numControls)
{
	var values = [];

	for(var i = 0; i < numControls; ++i)
	{
		values.push(0);
	}
	
	return new UGen("Control", ControlRate, values, numControls, 0);
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

	else if(ugen._lichType == "CONTROL_NAME")
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
	if(typeof ugen === "number")
	{
		if(!constants.hasOwnProperty(ugen))
		{
			constants[ugen] = constants.numConstants;
			constants.arr.push(ugen);
			constants.numConstants += 1;
		}

		return [];
	}

	else if(ugen._lichType === "CONTROL_NAME")
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
	
	buf = buf.slice(0, offset);
	console.log(buf.toString());
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
	); 
	
	return Lich.VM.Void;
}

function stop(synth)
{
	if(!(synth instanceof Synth))
	   throw new Error("stop can only be called on Synths.");

	synth.freeNode();
	return Lich.VM.Void;
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
				localArgNames.push("var " + argName + " = _ControlName(\""+argName+"\","+numArgs+");");
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

/*
Example usage of Synth.grain
function spawnSynths(num)
{
	for(var i = 0; i < num; ++i)
	{
		setTimeout(function() {
			Synth.grain("TestGrain", ["freq", Math.random() * 1000 + 200]);
		}, i * 100);
	}

	return Lich.VM.Void;
}
*/
