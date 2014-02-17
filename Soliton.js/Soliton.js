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

var Soliton = {}; // Soliton namespace
Soliton.context = 0;
Soliton.masterGain = 0;
Soliton.limiter = 0;
Soliton.blockSize = 4096; // Audio block size
Soliton.spliceFuncBlockSize = 64; // block size for splice generated osc node functions
Soliton.spliceFuncBlockRatio = Soliton.blockSize / Soliton.spliceFuncBlockSize; // Ratio use for sample generation in splice osc nodes
Soliton.buffers = {}; // Soliton.buffers namespace
Soliton.synthDefs = {};
Soliton.buses = [];
Soliton.numBuses = 10;

//window.addEventListener('load', Soliton.init, false);

Soliton.init = function()
{
	try
	{
		 // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
    	// Http://cwilso.github.io/AudioContext-MonkeyPatch/AudioContextMonkeyPatch.js
    	// TO WORK ON CURRENT CHROME!! But this means our code can be properly
    	// spec-compliant, and work on Chrome, Safari and Firefox.

		Soliton.context = new AudioContext(); // create the webkit audio context!
		Soliton.masterGain = Soliton.context.createGain();
		Soliton.masterGain.connect(Soliton.context.destination);
		Soliton.masterGain.gain.value = 0.25;
		Soliton.limiter = Soliton.context.createDynamicsCompressor();
		Soliton.limiter.threshold.value = -3;
		//compr.knee.value = knee;
		Soliton.limiter.ratio.value = 20;
		Soliton.limiter.attack.value = 0.003;
		Soliton.limiter.release.value = 0.003;
		Soliton.masterGain.connect(Soliton.limiter);
		Soliton.limiter.connect(Soliton.context.destination);

		for(var i = 0; i < (Soliton.context.sampleRate * 4); ++i) 
		{
			Soliton.whiteTable.push(Math.random() * 2 - 1);
		}

		for(var i = 0; i < Soliton.numBuses; ++i)
		{
			var bus = Soliton.context.createGain();
			bus._lichType = AUDIO;
			bus.startAll = function(){};
			bus.stopAll = function(){};
			Soliton.buses.push(bus);
		}
	}

	catch(e)
	{
		alert('Web Audio API is not supported in this browser');
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Soliton Functions
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Soliton.print = function(text) // You should probably redefine Soliton.print somewhere in your code!!!!
{
	Lich.post(text);
}

Soliton.printError = function(text) // You should probably redefine Soliton.print somewhere in your code!!!!
{
	Lich.post(text);
}

Soliton.roundUp = function(inval, quant)
{
	return quant == 0.0 ? inval : Math.ceil(inval / quant) * quant;
}

// Buffer a url with an optional name for storage, callback on finish, 
// and optional destination (for callback function)
Soliton.bufferURL = function(url, name, callback, callbackDestination, offset, duration)
{
	if(!Soliton.buffers.hasOwnProperty(name))
	{
		Lich.post("Downloading audio...");
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
					Lich.post(errorString);
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
		shape.oversample = "4x";
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

Soliton.createOscillator = function(target, type, freq, table)
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

	//osc.connect(Soliton.nodes[env]);
	osc.gainNode = Soliton.context.createGain();
	osc.gainNode.connect(target);
	osc.gainNode.gain.value = 0;
	osc.connect(osc.gainNode);
	osc.startAll = osc.start;
	osc.stopAll = osc.stop;
	return osc;
}

Soliton.createOscillatorNode = function(type, freq, table)
{
	var input = null;
	var osc = Soliton.context.createOscillator();

	if(freq._lichType == AUDIO)
	{
		osc.frequency.value = 0;
		input = freq;
		freq.connect(osc.frequency)
	}
	
	else
	{
		osc.frequency.value = freq;
	}

	if(type == "custom")
	{
		osc.setPeriodicWave(Soliton.context.createPeriodicWave(table, table));
	}

	else
	{
		osc.type = type;
	}

	osc._lichType = AUDIO;
	osc.stopAll = function(time){ if(input != null){ input.stopAll(time); }; osc.stop(time); }
	osc.startAll = function(time){ if(input != null){ input.startAll(time); }; osc.start(time); }
	return osc;
}

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

function spliceOsc(lang, divider, ret)
{
	var oscNode = Soliton.context.createScriptProcessor(1024, 0, 1);
	oscNode.audioFuncArray = Soliton.parseSpliceOsc(lang);
	oscNode.currentFunc = 0;
	oscNode.divider = divider;

	oscNode.onaudioprocess = function(event)
	{
		var outputArrayL = event.outputBuffer.getChannelData(0);
		//var outputArrayR = event.outputBuffer.getChannelData(1);
		var output;

		for(var i = 0; i < 1024; i ++)
		{
			output = this.audioFuncArray[this.currentFunc](i);

			for(var j = 0; j < Soliton.spliceFuncBlockSize; j += divider)
			{
				
				//for(var k = 1; k <= this.divider; ++k)
				//{
					outputArrayL[i] = outputArrayR[i] += output[j];

					if(outputArrayL[i] > 1 || outputArrayL[i] < -1)
						outputArrayL[i] = 1/outputArrayL[i];

					//if(outputArrayR[i] > 1 || outputArrayR[i] < -1)
					//	outputArrayR[i] = 1/outputArrayR[i];

				//}  
			}

			if(++this.currentFunc >= this.audioFuncArray.length)
			 	this.currentFunc = 0;
		}
	}

	oscNode.onaudioprocess.parentNode = oscNode;
	oscNode._lichType = AUDIO;
	oscNode.startAll = function(time){}
	oscNode.stopAll = function(time){setTimeout(function(){oscNode.disconnect(0)}, (time - Soliton.context.currentTime) * 1000)}
	/*
	var fadeGain = Soliton.context.createGain();
	oscNode.connect(fadeGain);
	fadeGain.connect(Soliton.masterGain);
	fadeGain.gain.value = 1.0;
	fadeGain.gain.linearRampToValueAtTime(1.0, Soliton.context.currentTime + 0.1);
	fadeGain.gain.linearRampToValueAtTime(0.0, Soliton.context.currentTime + 1);
	//return Soliton.addNode(oscNode);*/
	ret(oscNode);
}

//////////////////
// spliceFX
//////////////////

Soliton.parseSpliceFXChar = function(character)
{
	switch(character)
	{
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

	default:
		var sample = (character.charCodeAt(0) / 256 * 2 - 1);
		return function(inputL, inputR, i)
		{ 
			var output = new Array(Soliton.spliceFuncBlockSize);
			//var outputR = new Array(Soliton.spliceFuncBlockSize);
			for(var j = 0; j < Soliton.spliceFuncBlockSize; ++j) 
			{ 
				output[j] = Soliton.wrap(inputL[i + j] + sample);
				//outputR[j] = Soliton.wrap(inputR[i +j] + sample);
			} 

			return output;
			//return { l: outputL, r: outputR };
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

	Lich.post(audioFuncArray);
	return audioFuncArray;
}

function spliceFX(lang, divider, source, ret)
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

	//var source = Soliton.nodes[nodeID];

	//if(source == null)
	//	return null;

	var oscNode = Soliton.context.createScriptProcessor(1024, 1, 1);
	oscNode.audioFuncArray = Soliton.parseSpliceFX(lang);
	oscNode.currentFunc = 0;
	oscNode.divider = divider;

	oscNode.onaudioprocess = function(event)
	{
		var outputArrayL = event.outputBuffer.getChannelData(0);
		//var outputArrayR = event.outputBuffer.getChannelData(1);
		var inputArrayL = event.inputBuffer.getChannelData(0);
		//var inputArrayR = event.inputBuffer.getChannelData(1);
		var output;

		for(var i = 0; i < 1024; /*i += (1024 * this.divider)*/ ++i)
		{
			output = this.audioFuncArray[this.currentFunc](inputArrayL, inputArrayL, i);

			for(var j = 0; j < Soliton.spliceFuncBlockSize; j += this.divider)
			{
				
				//for(var k = 1; k <= this.divider; ++k)
				//{
					outputArrayL[i] += output[j];

					if(isNaN(outputArrayL[i]))
						outputArrayL[i] = inputArrayL[i];
					else if(outputArrayL[i] > 1 || outputArrayL[i] < -1)
						outputArrayL[i] = 1/outputArrayL[i];

					/*outputArrayR[i] += output[j];

					if(isNaN(outputArrayR[i]))
						outputArrayR[i] = inputArrayR[i];
					else if(outputArrayR[i] > 1 || outputArrayR[i] < -1)
						outputArrayR[i] = 1/outputArrayR[i];*/
				//}  
			}

			if(++this.currentFunc >= this.audioFuncArray.length)
			 	this.currentFunc = 0;
		}
		//Lich.post(outputArrayL[0]);
	}

	oscNode.onaudioprocess.parentNode = oscNode;
	oscNode._lichType = AUDIO;
	oscNode.startAll = function(time){source.startAll(time)}
	oscNode.stopAll = function(time){source.stopAll(time)}
	source.connect(oscNode);
	/*
	var fadeGain = Soliton.context.createGain();
	source.disconnect(0);
	source.connect(oscNode);
	oscNode.connect(fadeGain);
	fadeGain.connect(Soliton.masterGain);
	fadeGain.gain.value = 1.0;
	fadeGain.gain.linearRampToValueAtTime(1.0, Soliton.context.currentTime + 0.1);
	fadeGain.gain.linearRampToValueAtTime(0.0, Soliton.context.currentTime + 1);
	return Soliton.addNode(oscNode);*/
	ret(oscNode);
}

_createPrimitive("spliceFX", spliceFX);


function spliceFilter(spliceString, input, ret)
{
	if(spliceString.length == 1)
		spliceString += spliceString;

	var string1 = spliceString.slice(0, Math.floor(spliceString.length / 2));
	var string2 = spliceString.slice(Math.floor(spliceString.length / 2), spliceString.length);
	var coeff1 = new Array();
	var coeff2 = new Array();
	var inMem = new Array();
	var outMem = new Array();

	for(var i = 0; i < string1.length; ++i)
	{
		coeff1.push(string1.charCodeAt(i) / 256 - 0.25);
		inMem.push(0);
	}

	for(var i = 0; i < string2.length; ++i)
	{
		coeff2.push(string2.charCodeAt(i) / 128 - 0.5);
		outMem.push(0);
	}

	var filt = Soliton.context.createScriptProcessor(1024, 1, 1);

	filt.onaudioprocess = function(event)
	{
		var inputArray = event.inputBuffer.getChannelData(0);
		var outputArray = event.outputBuffer.getChannelData(0);

		for(var i = 0; i < 1024; i ++)
		{
			outMem[0] = 0;
			inMem[0] = inputArray[i];
			for(var j = coeff1.length - 1; j > 0; --j)
			{
				outMem[0] += coeff1[j] * inMem[j];
				inMem[j] = inMem[j - 1];
			}

			outMem[0] += coeff1[0] * inMem[0];

			for(var j = coeff2.length - 1; j > 0; --j)
			{
				outMem[0] += -coeff2[j] * outMem[j];
				outMem[j] = outMem[j - 1];
			}

			outputArray[i] = outMem[0];
		}
	}


	filt._lichType = AUDIO;
	input.connect(filt);
	filt.startAll = function(time){input.startAll(time)};
	filt.stopAll = function(time)
	{
		input.stopAll(time);
		setTimeout(function(){input.disconnect(0); filt.disconnect(0)}, (time - Soliton.context.currentTime) * 1000)
	};

	ret(filt);
}

_createPrimitive("spliceFilter", spliceFilter);

function iir(coeff1, coeff2, input, ret)
{
	var inMem = new Array();
	var outMem = new Array();

	for(var i = 0; i < coeff1.length; ++i)
	{
		inMem.push(0);
	}

	for(var i = 0; i < coeff2.length; ++i)
	{
		outMem.push(0);
	}

	var filt = Soliton.context.createScriptProcessor(1024, 1, 1);

	filt.onaudioprocess = function(event)
	{
		var inputArray = event.inputBuffer.getChannelData(0);
		var outputArray = event.outputBuffer.getChannelData(0);

		for(var i = 0; i < 1024; i ++)
		{
			outMem[0] = 0;
			inMem[0] = inputArray[i];
			for(var j = coeff1.length - 1; j > 0; --j)
			{
				outMem[0] += coeff1[j] * inMem[j];
				inMem[j] = inMem[j - 1];
			}

			outMem[0] += coeff1[0] * inMem[0];

			for(var j = coeff2.length - 1; j > 0; --j)
			{
				outMem[0] += -coeff2[j] * outMem[j];
				outMem[j] = outMem[j - 1];
			}

			outputArray[i] = outMem[0];
		}
	}


	filt._lichType = AUDIO;
	input.connect(filt);
	filt.startAll = function(time){input.startAll(time)};
	filt.stopAll = function(time)
	{
		input.stopAll(time);
		setTimeout(function(){input.disconnect(0); filt.disconnect(0)}, (time - Soliton.context.currentTime) * 1000)
	};

	ret(filt);
}

_createPrimitive("iir", iir);

function fir(coeff, input, ret)
{
	var inMem = new Array();

	for(var i = 0; i < coeff.length; ++i)
	{
		inMem.push(0);
	}

	var filt = Soliton.context.createScriptProcessor(1024, 1, 1);

	filt.onaudioprocess = function(event)
	{
		var inputArray = event.inputBuffer.getChannelData(0);
		var outputArray = event.outputBuffer.getChannelData(0);

		for(var i = 0; i < 1024; i ++)
		{
			inMem[0] = inputArray[i];
			var res = 0;
			
			for(var j = coeff.length - 1; j > 0; --j)
			{
				res += coeff[j] * inMem[j];
				inMem[j] = inMem[j - 1];
			}
			
			outputArray[i] = res;
		}
	}


	filt._lichType = AUDIO;
	input.connect(filt);
	filt.startAll = function(time){input.startAll(time)};
	filt.stopAll = function(time)
	{
		input.stopAll(time);
		setTimeout(function(){input.disconnect(); filt.disconnect()}, (time - Soliton.context.currentTime) * 1000)
	};

	ret(filt);
}

_createPrimitive("fir", fir);

function hpz1(input, ret)
{
	var filt = Soliton.context.createScriptProcessor(1024, 1, 1);
	var lastVal = 0.0;

	filt.onaudioprocess = function(event)
	{
		var inputArray = event.inputBuffer.getChannelData(0);
		var outputArray = event.outputBuffer.getChannelData(0);

		for(var i = 0; i < 1024; i ++)
		{
			outputArray[i] = 0.5 * (inputArray[i] - lastVal);
			lastVal = inputArray[i];
		}
	}


	filt._lichType = AUDIO;
	input.connect(filt);
	filt.startAll = function(time){input.startAll(time)};
	filt.stopAll = function(time)
	{
		input.stopAll(time);
		setTimeout(function(){input.disconnect(); filt.disconnect()}, (time - Soliton.context.currentTime) * 1000)
	};

	ret(filt);
}

_createPrimitive("hpz1", hpz1);

function hpz2(input, ret)
{
	var filt = Soliton.context.createScriptProcessor(1024, 1, 1);
	var lastVal1 = 0.0;
	var lastVal2 = 0.0;


	filt.onaudioprocess = function(event)
	{
		var inputArray = event.inputBuffer.getChannelData(0);
		var outputArray = event.outputBuffer.getChannelData(0);

		for(var i = 0; i < 1024; i ++)
		{
			outputArray[i] = 0.25 * (inputArray[i] - (2 * lastVal1) + lastVal2);
			lastVal2 = lastVal1;
			lastVal1 = inputArray[i];
		}
	}


	filt._lichType = AUDIO;
	input.connect(filt);
	filt.startAll = function(time){input.startAll(time)};
	filt.stopAll = function(time)
	{
		input.stopAll(time);
		setTimeout(function(){input.disconnect(); filt.disconnect()}, (time - Soliton.context.currentTime) * 1000)
	};

	ret(filt);
}

_createPrimitive("hpz2", hpz2);

function lpz1(input, ret)
{
	var filt = Soliton.context.createScriptProcessor(1024, 1, 1);
	var lastVal = 0.0;

	filt.onaudioprocess = function(event)
	{
		var inputArray = event.inputBuffer.getChannelData(0);
		var outputArray = event.outputBuffer.getChannelData(0);

		for(var i = 0; i < 1024; i ++)
		{
			outputArray[i] = 0.5 * (inputArray[i] + lastVal);
			lastVal = inputArray[i];
		}
	}


	filt._lichType = AUDIO;
	input.connect(filt);
	filt.startAll = function(time){input.startAll(time)};
	filt.stopAll = function(time)
	{
		input.stopAll(time);
		setTimeout(function(){input.disconnect(); filt.disconnect()}, (time - Soliton.context.currentTime) * 1000)
	};

	ret(filt);
}

_createPrimitive("lpz1", lpz1);

function lpz2(input, ret)
{
	var filt = Soliton.context.createScriptProcessor(1024, 1, 1);
	var lastVal1 = 0.0;
	var lastVal2 = 0.0;


	filt.onaudioprocess = function(event)
	{
		var inputArray = event.inputBuffer.getChannelData(0);
		var outputArray = event.outputBuffer.getChannelData(0);

		for(var i = 0; i < 1024; i ++)
		{
			outputArray[i] = 0.25 * (inputArray[i] + (2 * lastVal1) + lastVal2);
			lastVal2 = lastVal1;
			lastVal1 = inputArray[i];
		}
	}


	filt._lichType = AUDIO;
	input.connect(filt);
	filt.startAll = function(time){input.startAll(time)};
	filt.stopAll = function(time)
	{
		input.stopAll(time);
		setTimeout(function(){input.disconnect(); filt.disconnect()}, (time - Soliton.context.currentTime) * 1000)
	};

	ret(filt);
}

_createPrimitive("lpz2", lpz2);

function bpz2(input, ret)
{
	var filt = Soliton.context.createScriptProcessor(1024, 1, 1);
	var lastVal1 = 0.0;
	var lastVal2 = 0.0;


	filt.onaudioprocess = function(event)
	{
		var inputArray = event.inputBuffer.getChannelData(0);
		var outputArray = event.outputBuffer.getChannelData(0);

		for(var i = 0; i < 1024; i ++)
		{
			outputArray[i] = 0.5 * (inputArray[i] - lastVal2);
			lastVal2 = lastVal1;
			lastVal1 = inputArray[i];
		}
	}


	filt._lichType = AUDIO;
	input.connect(filt);
	filt.startAll = function(time){input.startAll(time)};
	filt.stopAll = function(time)
	{
		input.stopAll(time);
		setTimeout(function(){input.disconnect(); filt.disconnect()}, (time - Soliton.context.currentTime) * 1000)
	};

	ret(filt);
}

_createPrimitive("bpz2", bpz2);

function brz2(input, ret)
{
	var filt = Soliton.context.createScriptProcessor(1024, 1, 1);
	var lastVal1 = 0.0;
	var lastVal2 = 0.0;


	filt.onaudioprocess = function(event)
	{
		var inputArray = event.inputBuffer.getChannelData(0);
		var outputArray = event.outputBuffer.getChannelData(0);

		for(var i = 0; i < 1024; i ++)
		{
			outputArray[i] = 0.5 * (inputArray[i] + lastVal2);
			lastVal2 = lastVal1;
			lastVal1 = inputArray[i];
		}
	}


	filt._lichType = AUDIO;
	input.connect(filt);
	filt.startAll = function(time){input.startAll(time)};
	filt.stopAll = function(time)
	{
		input.stopAll(time);
		setTimeout(function(){input.disconnect(); filt.disconnect()}, (time - Soliton.context.currentTime) * 1000)
	};

	ret(filt);
}

_createPrimitive("brz2", brz2);

Soliton.white = function(event)
{
	var outputArrayL = event.outputBuffer.getChannelData(0);
	//var outputArrayR = event.outputBuffer.getChannelData(1);

	for(var i = 0; i < 1024; ++i)
	{
		outputArrayL[i] = Math.random() * 2 - 1;
		//outputArrayR[i] = val;
	}
}

Soliton.whiteTable = [];

function white(ret)
{
	/*
	var ugenFunc = Soliton.context.createScriptProcessor(1024, 0, 1);

	ugenFunc.onaudioprocess = function(event)
	{
		var outputArrayL = event.outputBuffer.getChannelData(0);
		//var outputArrayR = event.outputBuffer.getChannelData(1);

		for(var i = 0; i < 1024; ++i)
		{
			outputArrayL[i] = Math.random() * 2 - 1;
			//outputArrayR[i] = val;
		}

		if(this.stop)
			event.disconnect();
	}

	ugenFunc.startAll = function(time){};
	ugenFunc.stopAll = function(time){setTimeout(function(){ugenFunc.onaudioprocess = null; ugenFunc.stop = true}, time*1010)};*/

	var node = Soliton.context.createBufferSource();
	var buffer = Soliton.context.createBuffer(1, Soliton.context.sampleRate * 4, Soliton.context.sampleRate);
	var data = buffer.getChannelData(0);

	for(var i = 0; i < (Soliton.context.sampleRate * 4); ++i)
	{
		data[i] = Soliton.whiteTable[i];
		//outputArrayR[i] = val;
	}

	node.buffer = buffer;
	node.loop = true;
	node.startAll = node.start;
	node.stopAll = node.stop;

	node._lichType = AUDIO;
	ret(node);
}

_createPrimitive("white", white);

// Thanks to noise hack for the nice implementation: http://noisehack.com/generate-noise-web-audio-api/#pink-noise
function pink(ret)
{
	var pinkFunc = Soliton.context.createScriptProcessor(1024, 0, 1);

	var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    pinkFunc.onaudioprocess = function(e) {
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < 1024; i++) {
            var white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11; // (roughly) compensate for gain
            b6 = white * 0.115926;
        }
    }

	pinkFunc.startAll = function(time){};
	pinkFunc.stopAll = function(time)
	{
		setTimeout(function(){pinkFunc.disconnect(0);}, (time - Soliton.context.currentTime) * 1000)
	};
	pinkFunc._lichType = AUDIO;
	ret(pinkFunc);
}

_createPrimitive("pink", pink);


// Thanks to noise hack for the nice implementation: http://noisehack.com/generate-noise-web-audio-api/#pink-noise
function violet(ret)
{
	var violetFunc = Soliton.context.createScriptProcessor(1024, 0, 1);
	var lastVal = 0.0;
    violetFunc.onaudioprocess = function(e) {
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < 1024; i++) {
            var white = Math.random() * 2 - 1;
            output[i] = 0.5 * (white - lastVal);
            lastVal = output[i]; 
        }
    }

	violetFunc.startAll = function(time){};
	violetFunc.stopAll = function(time)
	{
		setTimeout(function(){violetFunc.disconnect(0);}, (time - Soliton.context.currentTime) * 1000)
	};
	violetFunc._lichType = AUDIO;
	ret(violetFunc);
}

_createPrimitive("violet", violet);

// Thanks to noise hack for the nice implementation: http://noisehack.com/generate-noise-web-audio-api/#brown-noise
function brown(ret)
{
	var brownFunc = Soliton.context.createScriptProcessor(1024, 0, 1);
	var lastOut = 0;
	brownFunc.onaudioprocess = function(e) {
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < 1024; i++) {
            var white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // (roughly) compensate for gain
        }
    }

	brownFunc.startAll = function(time){};
	brownFunc.stopAll = function(time)
	{
		setTimeout(function(){brownFunc.disconnect(0);}, (time - Soliton.context.currentTime) * 1000)
	};
	brownFunc._lichType = AUDIO;
	ret(brownFunc);
}

_createPrimitive("brown", brown);

function clipNoise(ret)
{
	var clipNoise = Soliton.context.createScriptProcessor(1024, 0, 1);

	clipNoise.onaudioprocess = function(e) {
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < 1024; i++) {
            output[i] = Math.random() > 0.5 ? 1 : -1;
        }
    }

	clipNoise.startAll = function(time){};
	clipNoise.stopAll = function(time)
	{
		setTimeout(function(){clipNoise.disconnect(0);}, (time - Soliton.context.currentTime) * 1000)
	};

	clipNoise._lichType = AUDIO;
	ret(clipNoise);
}

_createPrimitive("clipNoise", clipNoise);

// Many thanks to Stefan Gustavason for the nice Simplex implementation
// http://staffwww.itn.liu.se/~stegu/aqsis/aqsis-newnoise/
Soliton.simplexNoisePerm = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
  151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180 
];

Soliton.simplexGrad1 = function(hash, x) 
{
    var h = hash & 15;
    var grad = 1.0 + (h & 7);   // Gradient value 1.0, 2.0, ..., 8.0
    if(h&8) grad = -grad;         // Set a random sign for the gradient
    return (grad * x);           // Multiply the gradient with the distance
}

function simplex(freq, ret) 
{
	if(typeof freq !== "number")
		throw new Error("simplex frequency must be a number.");

	var simplexFunc = Soliton.context.createScriptProcessor(1024, 0, 1);
	var x = 0;
	var increment = freq * (1 / Soliton.context.sampleRate);

	simplexFunc.onaudioprocess = function(event) 
	{
        var output = event.outputBuffer.getChannelData(0);
        for (var i = 0; i < 1024; i++) 
        {	
        	x += increment;
            var i0 = Math.floor(x);
			var i1 = i0 + 1;
			var x0 = x - i0;
			var x1 = x0 - 1.0;

			var n0, n1;

			var t0 = 1.0 - x0*x0;
			//  if(t0 < 0.0f) t0 = 0.0f;
			t0 *= t0;
			n0 = t0 * t0 * Soliton.simplexGrad1(Soliton.simplexNoisePerm [i0 & 0xff], x0);

			var t1 = 1.0 - x1*x1;
			//  if(t1 < 0.0f) t1 = 0.0f;
			t1 *= t1;
			n1 = t1 * t1 * Soliton.simplexGrad1(Soliton.simplexNoisePerm [i1 & 0xff], x1);
			// The maximum value of this noise is 8*(3/4)^4 = 2.53125
			// A factor of 0.395 would scale to fit exactly within [-1,1]
			output[i] = 0.395 * (n0 + n1);
        }
    }

	simplexFunc.startAll = function(time){};
	simplexFunc.stopAll = function(time)
	{
		setTimeout(function(){simplexFunc.disconnect(0);}, (time - Soliton.context.currentTime) * 1000)
	};

	simplexFunc._lichType = AUDIO;
	ret(simplexFunc);
}

_createPrimitive("simplex", simplex);

function sin(freq, ret)
{
	ret(Soliton.createOscillatorNode("sine",freq));
}

_createPrimitive("sin", sin);

function tri(freq, ret)
{
	ret(Soliton.createOscillatorNode("triangle",freq));
}

_createPrimitive("tri", tri);

function square(freq, ret)
{
	ret(Soliton.createOscillatorNode("square",freq));
}

_createPrimitive("square", square);

function saw(freq, ret)
{
	ret(Soliton.createOscillatorNode("sawtooth",freq));
}

_createPrimitive("saw", saw);

function waveTable(freq, table, ret)
{
	ret(Soliton.createOscillatorNode("custom",freq, new Float32Array(table)));
}

_createPrimitive("waveTable", waveTable);

function waveShape(shape, input, ret)
{
	var shaper = Soliton.context.createWaveShaper();
	input.connect(shaper);
	// Create and specify parameters for the low-pass filter.
	shaper.curve = new Float32Array(shape);
	shaper.startAll = input.startAll;
	shaper.stopAll = input.stopAll;
	shaper._lichType = AUDIO;
	ret(shaper);
}

_createPrimitive("waveShape", waveShape);

function gain(input1, input2, ret)
{
	if(input2._lichType != AUDIO)
	{
		if(input1._lichType == AUDIO)
		{
			// swap inputs if input2 isn't an audio source so that we're using .connect on an actual audio source.
			var temp = input2;
			input2 = input1;
			input1 = temp;
		}

		else
		{
			throw new Error("gain must be used with at least one audio source.");
		}
	}

	var gainNode = Soliton.context.createGain();

	if(input1._lichType == AUDIO)
		input1.connect(gainNode.gain);
	else
		gainNode.gain.value = input1;

	input2.connect(gainNode);
	
	gainNode.startAll = function(time)
	{ 
		if(input1._lichType == AUDIO)
			input1.startAll(time);

		input2.startAll(time);
	}

	gainNode.stopAll = function(time)
	{ 
		if(input1._lichType == AUDIO)
			input1.stopAll(time);

		input2.stopAll(time);
	}

	gainNode._lichType = AUDIO;
	ret(gainNode);
}

_createPrimitive("gain", gain);

function _subtractMix(input1, input2, ret)
{	
	var resGain = Soliton.context.createGain();
	resGain.gain.value = 1;
	
	if(typeof input1 === "number")
	{
		dc(input1, function(dc1)
		{
			input1 = dc1;
		});
	}

	input1.connect(resGain);

	if(typeof input2 === "number")
	{
		dc(input2, function(dc2)
		{
			input2 = dc2;
		});
	}

	var subtractGain = Soliton.context.createGain();
	subtractGain.gain.value = -1;
	input2.connect(subtractGain);
	subtractGain.connect(resGain);
	
	resGain._lichType = AUDIO;
	
	resGain.startAll = function(time)
	{ 
		input1.startAll(time);
		input2.startAll(time);
	}

	resGain.stopAll = function(time)
	{ 
		input1.stopAll(time);
		input2.stopAll(time);
	}

	ret(resGain);
}

function delay(delayTime, feedbackLevel, input, ret)
{
	var ins = [delayTime, feedbackLevel, input];
	var mix = Soliton.context.createGain();
	var feedBack = Soliton.context.createGain();

	if(feedbackLevel._lichType == AUDIO)
		feedbackLevel.connect(feedBack.gain)
	else
		feedBack.gain.value = feedbackLevel;
	
	var delay = Soliton.context.createDelay();
	
	if(delayTime._lichType == AUDIO)
		delayTime.connect(delay.delayTime);
	else
		delay.delayTime.value = delayTime;
	
	input.connect(delay);
	input.connect(mix);
	delay.connect(mix);
	delay.connect(feedBack);
	feedBack.connect(delay);
	
	mix.startAll = function(time)
	{
		ins.map(function(elem)
		{
			if(elem._lichType == AUDIO)
				elem.startAll(time);
		});
	}

	mix.stopAll = function(time)
	{
		ins.map(function(elem)
		{
			if(elem._lichType == AUDIO)
				elem.stopAll(time);
		});

		setTimeout(function()
		{
			ins.map(function(elem)
			{
				if(elem._lichType == AUDIO)
					elem.disconnect(0);

				feedBack.disconnect(0);
				delay.disconnect(0);
			});
		},
		(time - Soliton.context.currentTime) * 1000)
	}

	mix._lichType = AUDIO;
	ret(mix);
}

_createPrimitive("delay", delay);

function compressor(threshold, knee, ratio, attack, release, input, ret)
{
	Lich.collapse(input, function(input)
	{
		var compr = Soliton.context.createDynamicsCompressor();
		compr.threshold.value = threshold;
		compr.knee.value = knee;
		compr.ratio.value = ratio;
		compr.attack.value = attack;
		compr.release.value = release;
		input.connect(compr);
		compr.startAll = input.startAll;
		compr._lichType = AUDIO;
		compr.stopAll = function(time)
		{
			input.stopAll(time);
			setTimeout(
				function()
				{
					input.disconnect(0);
				},
				(time - Soliton.context) * 1000
			)
		}

		ret(compr);
	});
}

_createPrimitive("compressor", compressor);

function limiter(threshold, input, ret)
{
	Lich.collapse(input, function(input)
	{
		var compr = Soliton.context.createDynamicsCompressor();
		compr.threshold.value = threshold;
		//compr.knee.value = knee;
		compr.ratio.value = 20;
		Soliton.limiter.attack.value = 0.003;
		Soliton.limiter.release.value = 0.003;
		input.connect(compr);
		compr.startAll = input.startAll;
		compr._lichType = AUDIO;
		compr.stopAll = function(time)
		{
			input.stopAll(time);
			setTimeout(
				function()
				{
					input.disconnect(0);
				},
				(time - Soliton.context) * 1000
			)
		}

		ret(compr);
	});
}

_createPrimitive("limiter", limiter);

function pan(position, input, ret)
{
	if(typeof position !== "number")
		throw new Error("Panning position can only be a number.");

	var panner = Soliton.context.createPanner();
	panner.panningModel = "equalpower";
	panner._lichType = AUDIO;
	panner.setPosition(position, 0, 0); // This seems to be broken or a bug. Just hard pans -1, 0, or 1. Can't do 0.5 or -0.1 for instance.
	input.connect(panner);
	
	panner.startAll = function(time)
	{
		input.startAll(time);
	}

	panner.stopAll = function(time)
	{
		input.stopAll(time);
		input.disconnect(0);
	}

	ret(panner);
}

_createPrimitive("pan", pan);

function mix2(input1, input2, ret)
{
	//if(input1._lichType != AUDIO || input2._lichType != AUDIO)
	//	throw new Error("mix2 can only be used with audio sources.");

	if(typeof input1 === "number")
	{
		dc(input1, function(dc1)
		{
			input1 = dc1;
		});
	}

	if(typeof input2 === "number")
	{
		dc(input2, function(dc2)
		{
			input2 = dc2;
		});
	}

	var mix = Soliton.context.createGain();
	input1.connect(mix);
	input2.connect(mix);
	mix.startAll = function(time){input1.startAll(time);input2.startAll(time);}
	mix.stopAll = function(time)
	{
		input1.stopAll(time);
		input2.stopAll(time);
		setTimeout(function(){input1.disconnect(0); input2.disconnect(0)}, (time - Soliton.context.currentTime) * 1000);
	}
	mix._lichType = AUDIO;
	ret(mix);
}

_createPrimitive("mix2", mix2);

function range(low, high, input,ret)
{
	if(typeof low !== "number" || typeof high !== "number")
		throw new Error("range low and high values can only be numbers. It is not modulatable.");

	if(input._lichType != AUDIO)
		throw new Error("range can only be used with audio ugens.");

	var mulVal = (high - low) * 0.5;
	var addVal = mulVal + low;

	gain(mulVal,input,function(mulRes)
	{
		mix2(addVal,mulRes, ret);
	})
}

_createPrimitive("range", range);

Soliton.linexpUGen = function(inMin, inMax, outMin, outMax)
{
	var outRatio = outMax / outMin;
	var inRatio = 1 / (inMax - inMin);
	var minusLow = inRatio * -inMin;

	return function(event)
	{
		var inputArray = event.inputBuffer.getChannelData(0);
		var outputArray = event.outputBuffer.getChannelData(0);

		for(var i = 0; i < 1024; ++i)
		{
			outputArray[i] = outMin * Math.pow(outRatio, inputArray[i] * inRatio + minusLow);
		}
	}
}

function exprange(low, high, input, ret)
{
	var rangeFunc = Soliton.context.createScriptProcessor(1024, 1, 1);
	rangeFunc.onaudioprocess = Soliton.linexpUGen(-1, 1, low, high);
	rangeFunc.startAll = input.startAll;
	rangeFunc._lichType = AUDIO;
	input.connect(rangeFunc);
	rangeFunc.stopAll = function(time){input.stopAll(time); setTimeout(function(){input.disconnect(0)}, (time - Soliton.context.currentTime) * 1000)}
	ret(rangeFunc);
}

Soliton.divisionUGen = function(event)
{
	var inputArray1 = event.inputBuffer.getChannelData(0);
	var inputArray2 = event.inputBuffer.getChannelData(1);
	var outputArrayL = event.outputBuffer.getChannelData(0);

	Lich.post(inputArray2[0]);
	for(var i = 0; i < 1024; ++i)
	{
		if(inputArray2[i] == 0)
			outputArrayL[i] = 0;
		else	
			outputArrayL[i] = inputArray1[i] / inputArray2[i];
	}
}

function _audioDivision(input1, input2, ret)
{	
	if(typeof input1 === "number")
	{
		dc(input1, function(dc1)
		{
			input1 = dc1;
		});
	}

	if(typeof input2 === "number")
	{
		dc(input2, function(dc2)
		{
			input2 = dc2;
		});
	}

	var divisionFunc = Soliton.context.createScriptProcessor(1024, 2, 2);
	divisionFunc.onaudioprocess = function(event)
	{
		var inputArray1 = event.inputBuffer.getChannelData(0);
		var inputArray2 = event.inputBuffer.getChannelData(1);
		var outputArrayL = event.outputBuffer.getChannelData(0);

		Lich.post(inputArray2[0]);
		for(var i = 0; i < 1024; ++i)
		{
			if(inputArray2[i] == 0)
				outputArrayL[i] = 0;
			else	
				outputArrayL[i] = inputArray1[i] / inputArray2[i];
		}
	}
	//divisionFunc.channelInterpretation = "discrete";
	divisionFunc.startAll = function(time){ input2.startAll(time); input1.startAll(time);}
	divisionFunc.stopAll = function(time)
	{
		input1.stopAll(time);
		input2.stopAll(time); 
		setTimeout(function(){input1.disconnect(0); input2.disconnect(0)}, (time - Soliton.context.currentTime) * 1000);
	}
	
	divisionFunc._lichType = AUDIO;
	input1.connect(divisionFunc, 0, 0);
	input2.connect(divisionFunc, 0, 0);
	ret(divisionFunc);
}


Soliton.createFilter = function(type, freq, input, q, gain)
{
 	if(input._lichType != AUDIO)
 		throw new Error("filters can only use audio sources as inputs.");

 	var ins = [freq, input, q, gain];
	var filter = Soliton.context.createBiquadFilter();
	input.connect(filter);
	// Create and specify parameters for the low-pass filter.
	filter.type = type; // Low-pass filter. See BiquadFilterNode docs

	if(freq._lichType == AUDIO)
		freq.connect(filter.frequency)
	else
		filter.frequency.value = freq;

	if(q._lichType == AUDIO)
		q.connect(filter.Q);
	else if(typeof q === "number")
		filter.Q.value = q;

	if(gain._lichType == AUDIO)
		gain.connect(filter.gain);
	else if(typeof gain === "number")
		filter.gain.value = gain;

	filter.startAll = function(time)
	{
		ins.map(function(elem)
		{
			if(elem._lichType == AUDIO)
				elem.startAll(time);
		});
	}

	filter.stopAll = function(time)
	{
		ins.map(function(elem)
		{
			if(elem._lichType == AUDIO)
				elem.stopAll(time);
		});
	}

	filter._lichType = AUDIO;
	return filter;
 }

function lowpass(freq, q, input, ret)
{
	ret(Soliton.createFilter("lowpass", freq, input, q, Lich.VM.Nothing));
}

_createPrimitive("lowpass", lowpass);

function highpass(freq, q, input, ret)
{
	ret(Soliton.createFilter("highpass", freq, input, q, Lich.VM.Nothing));
}

_createPrimitive("highpass", highpass);

function bandpass(freq, q, input, ret)
{
	ret(Soliton.createFilter("bandpass", freq, input, q, Lich.VM.Nothing));
}

_createPrimitive("bandpass", bandpass);

function lowshelf(freq, boost, input, ret)
{
	ret(Soliton.createFilter("lowshelf", freq, input, Lich.VM.Nothing, boost));
}

_createPrimitive("lowshelf", lowshelf);

function highshelf(freq, boost, input, ret)
{
	ret(Soliton.createFilter("highshelf", freq, input, Lich.VM.Nothing, boost));
}

_createPrimitive("highshelf", highshelf);

function peaking(freq, q, boost, input, ret)
{
	ret(Soliton.createFilter("peaking", freq, input, q, boost));
}

function notch(freq, q, input, ret)
{
	ret(Soliton.createFilter("notch", freq, input, q, Lich.VM.Nothing));
}

_createPrimitive("notch", notch);

function allpass(freq, q, input, ret)
{
	ret(Soliton.createFilter("allpass", freq, input, q, Lich.VM.Nothing));
}

_createPrimitive("allpass", allpass);

// Buffer a url with an optional name for storage, callback on finish, 
// and optional destination (for callback function)
Soliton.bufferURL = function(name, callback)
{
	if(!Soliton.buffers.hasOwnProperty(name))
	{
		var url = "http://"
		         + self.location.hostname
		         + "/Samples/" + name + ".ogg";

		//Lich.post("Downloading audio... " + url);
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
						callback(buffer);
				}, 

				function()
				{
					var errorString = "Unable to load URL: ";
					errorString = errorString.concat(url);
					Lich.post(errorString);
					throw new Error(errorString);
				}
			);
		}

		request.send();
	}

	else
	{
		//Soliton.print("Already Downloaded!");
		if(callback != undefined)
			callback(Soliton.buffers[name]);
	}
}

// Play a buffer into the destination
Soliton.playBuffer = function(buffer, rate, loopStart, loopEnd, ret)
{
	//Lich.post("Playing Buffer!");
	var source = Soliton.context.createBufferSource();
	source.buffer = buffer;
	source.loop = true;
	source.playbackRate.value = rate;
	source.loopStart = loopStart;
	source.loopEnd = loopEnd;
	
	source.startAll = function(time)
	{ 
		source.start(time, loopStart)
	}
	
	source.stopAll = source.stop;

	source._lichType = AUDIO;
	ret(source);
}

function playBuf(name, rate, loopStart, loopEnd, ret)
{
	if(typeof rate !== "number" || typeof loopStart !== "number" || typeof loopEnd !== "number")
	{
		throw new Error("playBuf can only be used with numbers. playBuf arguments cannot be modulated by audio unit generators");
		//Lich.post("playBuf can only be used with numbers. playBuf arguments cannot be modulated by audio unit generators");
	}

	Soliton.bufferURL(
		name, 
		function(buf)
		{
			Soliton.playBuffer(buf, rate, loopStart, loopEnd, ret)
		}
	);
}

_createPrimitive("playBuf", playBuf);

function convolve(name, input, ret)
{
	Soliton.bufferURL(
		name, 
		function(buf)
		{
			var conv = Soliton.context.createConvolver();
			conv.buffer = buf;
			conv.normalize = true;
			input.connect(conv);
			conv.startAll = input.startAll;
			conv.stopAll = input.stopAll;
			conv._lichType = AUDIO;
			ret(conv);
		}
	);
}

_createPrimitive("convolve", convolve);

function dc(value, ret)
{
	Lich.collapse(value, function(value)
	{
		var dcFunc = Soliton.context.createScriptProcessor(1024, 0, 1);
		dcFunc.value = value;

		dcFunc.onaudioprocess = function(event)
		{
			var outputArray = event.outputBuffer.getChannelData(0);
			var val = this.value;

			for(var i = 0; i < 1024; ++i)
			{
				outputArray[i] = val;
			}
		}

		dcFunc.startAll = function(time){};
		dcFunc.stopAll = function(time){};
		dcFunc._lichType = AUDIO;
		ret(dcFunc);
	});
}

_createPrimitive("dc", dc);

/*
function set(argument, value, input, ret)
{
	if(typeof argument !== "string" || input._lichType != SYNTH || typeof value !== "number")
		throw new Error("set can only be used on Synth control inputs with numbers as values. For example: set \"freq\" 33.3 mySynth");

	
	input[argument] = value;
	ret(input);
}
*/

function contextTime(ret)
{
	Lich.post(Soliton.context.currentTime);
	ret(Soliton.context.currentTime);
}

function chain(input2, input1, ret)
{
	Lich.collapse(input2, function(input2)
	{
		Lich.collapse(input1, function(input1)
		{
			input2.connect(Soliton.masterGain);
			input2.start(0);
			input1.connect(input2);
			ret(input2);
		});
	});
}

function fade(time, input, ret)
{
	if(typeof time != "number" || input._lichType != AUDIO)
		throw new Error("fade can only be used with a number value for time and a gain node.");

	//var fadeGain = Soliton.context.createGain();
	//fadeGain.value = 1;
	//input.connect(fadeGain);
	input.gain.exponentialRampToValueAtTime(0.001, Soliton.context.currentTime + time - 0.001);
	input.gain.linearRampToValueAtTime(0.0, Soliton.context.currentTime + time);
	input.stopAll(Soliton.context.currentTime + time);
	ret(input);
}

function perc(attack, peak, decay, input, ret)
{
	Lich.collapse(input, function(input)
	{
		if(typeof attack !== "number" || typeof peak !== "number" || typeof decay !== "number")
		throw new Error("perc can only use numbers for attack, peak, and decay arguments.");

		if(typeof input == "number")
		{
			dc(input, function(inRes){input = inRes});
		}

		var percGain = Soliton.context.createGain();
		input.connect(percGain);
		
		percGain.startAll = function(time)
		{
			input.startAll(time);
			percGain.gain.setValueAtTime(0, time);
			percGain.gain.linearRampToValueAtTime(peak, attack + time);
			percGain.gain.linearRampToValueAtTime(0, attack + decay + time);
			input.stopAll(attack + decay + time);
		}

		percGain.stopAll = input.stopAll;
		percGain._lichType = AUDIO;
		ret(percGain);
	});
}

_createPrimitive("perc", perc);

function play(synth, ret)
{
	if(typeof synth === "string")
	{
		synth = Soliton.synthDefs[synth];
	}

	Lich.collapse(synth, function(synth)
	{
		var type = synth._lichType;
		if(type != AUDIO && type != IMPSTREAM && type != SOLOSTREAM)
			throw new Error("play can only be used with synth definitions, functions, or patterns.");

		synth.connect(Soliton.masterGain);
		synth.startAll(Soliton.context.currentTime);
		synth.startAll = function(){}
		ret(synth);
	});
}

_createPrimitive("play", play);

function stop(synth, ret)
{
	Lich.collapse(synth, function(synth)
	{
		var type = synth._lichType;
		if(type != AUDIO && type != SYNTH && type != IMPSTREAM && type != SOLOSTREAM)
			throw new Error("stop can only be used with synth definitions, functions, or patterns.");

		if(type == AUDIO)
		{
			synth.disconnect(Soliton.masterGain);
			synth.stopAll(0);
			ret(Lich.VM.Void);
		}

		else if(type == SYNTH)
		{		
			Lich.collapse(synth, function(audioRes)
			{
				if(audioRes._lichType != AUDIO)
					throw new Error("play can only be used with synth definitions and audio functions.");
				
				audioRes.stopAll(0);
				ret(Lich.VM.Void);
			});
		}

		else
		{
			synth.stop();
		}
	});
}

_createPrimitive("stop", stop);

function auxIn(num, ret)
{
	if(num >= 0 && num < Soliton.numBuses)
		ret(Soliton.buses[num]);
	else
		throw new Error("Bus number " + num + " exceeds the number of buses: " + Soliton.numBuses);
}

_createPrimitive("auxIn", auxIn);

function localBus(ret)
{
	var bus = Soliton.context.createGain();
	bus.startAll = function(){};
	bus.stopAll = function(){}
	bus._lichType = AUDIO;
	ret(bus);
}

_createPrimitive("localBus", localBus);

function auxOut(bus, input, ret)
{
	if(typeof bus === "number")
	{
		if(bus >= 0 && bus < Soliton.numBuses)
		{
			bus = Soliton.buses[bus];		
		}
			
		else
		{
			throw new Error("Bus number " + bus + " exceeds the number of buses: " + Soliton.numBuses);
		}
	}

	input.connect(bus);
	ret({
		_lichType:AUDIO, 
		startAll:input.startAll, 
		stopAll:input.stopAll, 
		connect:function(){}, 
		disconnect:function()
		{
			input.disconnect();
		}
	});
}

_createPrimitive("auxOut", auxOut);

function auxThrough(bus, input, ret)
{
	if(typeof bus === "number")
	{
		if(bus >= 0 && bus < Soliton.numBuses)
		{
			bus = Soliton.buses[bus];		
		}
			
		else
		{
			throw new Error("Bus number " + bus + " exceeds the number of buses: " + Soliton.numBuses);
		}
	}

	input.connect(bus);
	ret(input);
}

_createPrimitive("auxThrough", auxThrough);

function clip(value, input, ret)
{
	if(input._lichType != AUDIO)
	{
		throw new Error("clip must be used with at least one audio source.");
	}

	else if(value._lichType != AUDIO)
	{
		dc(value, function(vRes){value = vRes;});
	}

	var merger = Soliton.context.createChannelMerger(2);
	merger.channelInterpretation = "discrete";
	var clipNode = Soliton.context.createScriptProcessor(1024, 2, 1);
	//clipNode.channelInterpretation = "discrete";

	clipNode.onaudioprocess = function(event)
	{
		var inputArrayL = event.inputBuffer.getChannelData(0);
		//var inputArrayR = event.inputBuffer.getChannelData(1);
		var clipArray = event.inputBuffer.getChannelData(1);
		//var clipArrayR = event.inputBuffer.getChannelData(3);
		var outputArrayL = event.outputBuffer.getChannelData(0);
		//var outputArrayR = event.outputBuffer.getChannelData(1);
		var pos = 0;
		var neg = 0;
		//var posR = 0;
		//var negR = 0;

		for(var i = 0; i < 1024; ++i)
		{
			pos = Math.abs(clipArray[i]);
			neg = -pos;
			if(inputArrayL[i] > pos)
				outputArrayL[i] = pos;
			else if(inputArrayL[i] < neg)
				outputArrayL[i] = neg;
			else
				outputArrayL[i] = inputArrayL[i];

			/*
			posR = Math.abs(clipArrayR[i]);
			negR = -posR;
			if(inputArrayR[i] > posR)
				outputArrayR[i] = posR;
			else if(inputArrayR[i] < negR)
				outputArrayR[i] = negR;
			else
				outputArrayR[i] = inputArrayR[i];*/
		}

		//Lich.post("["+inputArrayL[0]+","+clipArray[0]+"]");
	}


	input.connect(merger, 0, 0);
	//input.connect(clipNode, 1, 1);
	value.connect(merger, 0, 1);
	merger.connect(clipNode);
	//value.connect(clipNode, 1, 3);

	clipNode.startAll = function(time)
	{ 
		input.startAll(time);
		value.startAll(time);
	}

	clipNode.stopAll = function(time)
	{ 
		input.stopAll(time);
		value.stopAll(time);
		setTimeout(function(){input.disconnect(); value.disconnect(); merger.disconnect(); clipNode.disconnect()}, (time - Soliton.context.currentTime) * 1000);
	}

	clipNode._lichType = AUDIO;
	ret(clipNode);
}

_createPrimitive("clip", clip);

function killall(ret)
{
	Lich.scheduler.freeScheduledEvents();
    Soliton.masterGain.disconnect(0);
	Soliton.masterGain = Soliton.context.createGain();
	//Soliton.masterGain.connect(Soliton.context.destination);
	Soliton.masterGain.gain.value = 0.25;
	Soliton.limiter = Soliton.context.createDynamicsCompressor();
	Soliton.limiter.threshold.value = 0;
	//compr.knee.value = knee;
	Soliton.limiter.ratio.value = 15;
	Soliton.limiter.attack.value = 0.01;
	Soliton.limiter.release.value = 0.01;
	Soliton.masterGain.connect(Soliton.limiter);
	Soliton.limiter.connect(Soliton.context.destination);
	
	Soliton.buses = [];
	for(var i = 0; i < Soliton.numBuses; ++i)
	{
		var bus = Soliton.context.createGain();
		bus._lichType = AUDIO;
		bus.startAll = function(){};
		bus.stopAll = function(){};
		Soliton.buses.push(bus);
	}
	
	//ret(Lich.VM.Void);
}

_createPrimitive("killall", killall);

Soliton.testMetrognome = function()
{
	return new Soliton.AudioEvent(
		function(){ return Soliton.createOscillator(Soliton.masterGain, "triangle", 440) }, 
		Soliton.context.currentTime, 
		Soliton.context.currentTime + 0.1, 
		function(currentTime)
		{
			//Lich.post("Metrognome nextTime = " + (Lich.scheduler.tempoSeconds));
			return [currentTime + Lich.scheduler.tempoSeconds, currentTime + Lich.scheduler.tempoSeconds + 0.1];
		}
	);
}

Soliton.PercStream = function(_events, _modifiers)
{
	var events = _events;
	var modifiers = _modifiers;
	
    this.collapseModifiers = function()
    {
	    mapCps(
			modifiers,
			function(modifier, i, callback)
			{
			    Lich.collapse(modifier, callback);
			},
			function(collapsedModifiers)
			{
			    modifiers = collapsedModifiers;
			}
	    );
	}

    this.collapseModifiers();
    this.nextTime = Math.floor((Soliton.context.currentTime / Lich.scheduler.tempoSeconds) + 0.5) * Lich.scheduler.tempoSeconds;
	var macroBeat = 0;
	var modifierBeat = 0;
	var hasModifiers = modifiers.length > 0;
	this._lichType = IMPSTREAM;
	var playing = true;

	// Push to the next metric down beat
	this.nextTime += ((this.nextTime / Lich.scheduler.tempoSeconds) % _events.length) * Lich.scheduler.tempoSeconds;

	
	//Lich.post("NextTime = " + this.nextTime);
	//Lich.post("events = " + Lich.VM.PrettyPrint(events));
	//Lich.VM.Print(modifiers);

	this.stop = function()
	{
		playing = false;
		Lich.scheduler.removeScheduledEvent(this);
	}

	this.play = function()
	{
		if(!playing)
		{
			playing = true;
			Lich.scheduler.addScheduledEvent(this);
		}
	}

	this.subSchedulePlay = function(nevent, nDuration, offset)
	{
		if(nevent instanceof Array)
		{
			if(nevent.length > 0)
			{
				var divDuration = nDuration / nevent.length;
				for(var i = 0; i < nevent.length; ++i)
				{
					this.subSchedulePlay(nevent[i], divDuration, offset + (divDuration * i));
				}
			}
		}

		else if(nevent != Lich.VM.Nothing)
		{
			var nextTime = this.nextTime;
			Lich.collapse(Soliton.synthDefs[nevent], function(synth)
			{
				if(synth._lichType == AUDIO)
				{
					synth.connect(Soliton.masterGain);
					synth.startAll(nextTime + offset);
				}
			});
		}
	}

	this.schedulePlay = function()
	{
		var event = events[macroBeat];
		var beatDuration = Lich.scheduler.tempoSeconds;
		
		if(++macroBeat >= events.length)
				macroBeat = 0;

		if(hasModifiers)
		{
			var modifier = modifiers[modifierBeat];

			if(modifier != Lich.VM.Nothing)
			{
				modifier(Lich.scheduler.tempoSeconds, function(_beatDuration)
				{
					beatDuration = _beatDuration;
				});
			}

			if(++modifierBeat >= modifiers.length)
					modifierBeat = 0;
		}
		
		this.subSchedulePlay(event, beatDuration, 0); // recursively schedule beat, adjusting for tuple nesting
		this.nextTime += beatDuration;

		//Lich.post("PercStream nextTime = " + this.nextTime);
		//Lich.post("Soliton.context.currentTime = " + Soliton.context.currentTime);
		return this.nextTime;
	}

	this.update = function(newEvents, newModifiers)
	{
		events = newEvents;
		modifiers = newModifiers;
	        this.collapseModifiers();
		macroBeat = macroBeat % events.length;

		if(modifiers.length)
			modifierBeat = modifierBeat % modifiers.length;
		else
			modifierBeat = 0;

		hasModifiers = modifiers.length > 0;

		if(!playing)
		{
			this.nextTime = Math.floor((Soliton.context.currentTime / Lich.scheduler.tempoSeconds) + 0.5) * Lich.scheduler.tempoSeconds;
			this.nextTime += ((this.nextTime / Lich.scheduler.tempoSeconds) % _events.length) * Lich.scheduler.tempoSeconds;
		}

		this.play();
	}
}

Soliton.SoloStream = function(_instrument, _events, _modifiers)
{
	var instrument = _instrument;
	var events = _events;
	var modifiers = _modifiers;
        
    this.collapseModifiers = function()
    {
	    mapCps(
			modifiers,
			function(modifier, i, callback)
			{
			    Lich.collapse(modifier, callback);
			},
			function(collapsedModifiers)
			{
			    modifiers = collapsedModifiers;
			}
	    );
	}

    this.collapseModifiers();
	this.nextTime = Math.floor((Soliton.context.currentTime / Lich.scheduler.tempoSeconds) + 0.5) * Lich.scheduler.tempoSeconds;
	var macroBeat = 0;
	var modifierBeat = 0;
	var hasModifiers = modifiers.length > 0;
	this._lichType = SOLOSTREAM;
	var playing = true;

	// Push to the next metric down beat
	this.nextTime += ((this.nextTime / Lich.scheduler.tempoSeconds) % _events.length) * Lich.scheduler.tempoSeconds;

	
	//Lich.post("NextTime = " + this.nextTime);
	//Lich.post("events = " + Lich.VM.PrettyPrint(events));
	//Lich.VM.Print(modifiers);

	this.stop = function()
	{
		playing = false;
		Lich.scheduler.removeScheduledEvent(this);
	}

	this.play = function()
	{
		if(!playing)
		{
			playing = true;
			Lich.scheduler.addScheduledEvent(this);
		}
	}

	this.subSchedulePlay = function(nevent, nDuration, offset)
	{
		if(nevent instanceof Array)
		{
			if(nevent.length > 0)
			{
				var divDuration = nDuration / nevent.length;
				for(var i = 0; i < nevent.length; ++i)
				{
					this.subSchedulePlay(nevent[i], divDuration, offset + (divDuration * i));
				}
			}
		}

		else if(nevent != Lich.VM.Nothing)
		{
			if(hasModifiers)
			{
				var modifier = modifiers[modifierBeat];

				if(modifier != Lich.VM.Nothing)
				{
					modifier(nevent, function(_newEvent)
					{
						nevent = _newEvent;
					});
				}
			}

			var nextTime = this.nextTime;
			Soliton.synthDefs[instrument](nevent, function(synth)
			{
				if(synth._lichType == AUDIO)
				{
					synth.connect(Soliton.masterGain);
					synth.startAll(nextTime + offset);
				}
			});
		}
	}

	this.schedulePlay = function()
	{
		var event = events[macroBeat];
		var beatDuration = Lich.scheduler.tempoSeconds;
		
		if(++macroBeat >= events.length)
				macroBeat = 0;
		
		this.subSchedulePlay(event, beatDuration, 0); // recursively schedule beat, adjusting for tuple nesting
		this.nextTime += beatDuration;

		if(hasModifiers)
		{
			if(++modifierBeat >= modifiers.length)
					modifierBeat = 0;
		}

		//Lich.post("PercStream nextTime = " + this.nextTime);
		//Lich.post("Soliton.context.currentTime = " + Soliton.context.currentTime);
		return this.nextTime;
	}

	this.update = function(newEvents, newModifiers)
	{
		events = newEvents;
		modifiers = newModifiers;
	        this.collapseModifiers();
	        macroBeat = macroBeat % events.length;

		if(modifiers.length)
			modifierBeat = modifierBeat % modifiers.length;
		else
			modifierBeat = 0;

		hasModifiers = modifiers.length > 0;

		if(!playing)
		{
			this.nextTime = Math.floor((Soliton.context.currentTime / Lich.scheduler.tempoSeconds) + 0.5) * Lich.scheduler.tempoSeconds;
			this.nextTime += ((this.nextTime / Lich.scheduler.tempoSeconds) % _events.length) * Lich.scheduler.tempoSeconds;
		}

		this.play();
	}
}

Soliton.AudioEvent = function(_nodeFunc, _startTime, _stopTime, _calcFunc)
{
	var nodeFunc = _nodeFunc;
	var node = null;
	this.nextTime = _startTime;
	var stopTime = _stopTime;
	var calcFunc = _calcFunc;
	var calcArray = [];

	this.schedulePlay = function()
	{
		node = nodeFunc();
		node.start(this.nextTime);
		node.gainNode.gain.setValueAtTime(0, this.nextTime);
		node.gainNode.gain.linearRampToValueAtTime(1, this.nextTime + 0.001);
		node.gainNode.gain.linearRampToValueAtTime(0, stopTime);
		node.stop(stopTime);

		calcArray = calcFunc(this.nextTime);
		this.nextTime = calcArray[0];
		stopTime = calcArray[1];

		return this.nextTime;
	}
}

Soliton.SteadyScheduler = function()
{
	this.tempo = 240; // bpm
	this.tempoSeconds = (60 / this.tempo); 
	this.tempoMillis = this.tempoSeconds * 1000;
	var playing = false;
	var startTime = null;
	var lookAhead = 25; // How frequently to call scheduling, in milliseconds
	var scheduleAhead = 0.1; // How far ahead to actually schedule events, in seconds
	 // We use 2 queues and a temporary variable to efficiently filter called events by swapping variables, only using push, 
	 // and reassining currentQueue.length = 0
	var currentQueue = [];
	var nextQueue = [];
	var tempQueue = null;
	var timerID = null;
	var requiresSchedule = 0;
	var nextTime = 0;

	this.scheduleEvent = function(event)
	{
		try
		{
			nextTime = event.schedulePlay();
		}

		catch(e)
		{
			Lich.post(e);
		}

		// Schedule all events that fall within our requiresSchedule range.
		while(nextTime != null)
		{
			if(nextTime < requiresSchedule)
				nextTime = event.schedulePlay();
			else
				break;
		}

		// If nextTime still isn't null, reschedule the event for visitation in our scheduler's nextQueue
		if(nextTime != null/* && typeof nextTime == "number"*/)
			nextQueue.push(event);
	}

	this.visitScheduledEvents = function()
	{
		// requiresSchedule ss the current time + the schedule ahead time. 
		// This allows us to reduce jitter while still being reactive to pattern and tempo changes.
		requiresSchedule = Soliton.context.currentTime + scheduleAhead;
		//Lich.post("Requires schedule = " + requiresSchedule);
		for(var i = 0; i < currentQueue.length; ++i)
		{
			// If the event time is within our barrier for look ahead time, then we schedule the audio event.
			if(currentQueue[i].nextTime < requiresSchedule)
			{
				Lich.scheduler.scheduleEvent(currentQueue[i]);
			}

			// Otherwise we push the event into the nextQueue for future evaluation.
			else
			{
				nextQueue.push(currentQueue[i]);
			}
		}

		currentQueue.length = 0; // Reassign length of the currentQueue so we can keep using push on the next visitScheduledEvents run
		//// Here we swap the current and next queues, using a temporary variable. ////
		tempQueue = currentQueue; // store the current Queue in a temporary variable for swapping
		currentQueue = nextQueue; // Swap current queue with the next Queue
		nextQueue = tempQueue; // swap the next queue with the previous current Queue, stored in the temporary variable.

		// Reschedule visitScheduledEvents, keeping track of the ID for stopping/pausing.
		timerID = setTimeout(Lich.scheduler.visitScheduledEvents, lookAhead);
	}

	this.start = function()
	{
		if(!playing)
		{
			playing = true;
			Lich.scheduler.visitScheduledEvents();
		}
	}

	this.pause = function()
	{
		if(playing)
		{
			playing = false;
			clearTimeout(timerID);
		}
	}

	this.stop = function()
	{
		playing = false;
		clearTimeout(timerID);

		for(var i = 0; i < currentQueue.length; ++i)
		{
			currentQueue[i].stop();
		}
		
		for(var i = 0; i < nextQueue.length; ++i)
		{
			nextQueue[i].stop();
		}

		for(var i = 0; i < tempQueue.length; ++i)
		{
			tempQueue[i].stop();
		}

		currentQueue = [];
		nextQueue = [];
		tempQueue = null;
		timerID = null;
	}

	this.freeScheduledEvents = function()
	{
		for(var i = 0; i < currentQueue.length; ++i)
		{
			var elem = currentQueue[i];
			if(elem._lichType == IMPSTREAM || elem._lichType == SOLOSTREAM)
				elem.stop();
		}
		
		for(var i = 0; i < nextQueue.length; ++i)
		{
			var elem = nextQueue[i];
			if(elem._lichType == IMPSTREAM || elem._lichType == SOLOSTREAM)
				elem.stop();
		}

		for(var i = 0; i < tempQueue.length; ++i)
		{
			var elem = tempQueue[i];
			if(elem._lichType == IMPSTREAM || elem._lichType == SOLOSTREAM)
				elem.stop();
		}

		currentQueue = [];
		nextQueue = [];
		tempQueue = null;
	}

	this.addScheduledEvent = function(event)
	{
		currentQueue.push(event);
	}

	this.removeScheduledEvent = function(event)
	{
		var currentIndex = currentQueue.indexOf(event);
		if(currentIndex != -1)
			currentQueue.splice(currentIndex, 1);
	}

	this.setTempo = function(bpm)
	{
		Lich.scheduler.tempo = bpm;
		Lich.scheduler.tempoSeconds = (60 / Lich.scheduler.tempo); 
		Lich.scheduler.tempoMillis = Lich.scheduler.tempoSeconds * 1000;
	}
}
