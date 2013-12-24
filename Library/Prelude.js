/* 
    Lich.js - JavaScript audio/visual live coding language
    Copyright (C) 2012 Chad McKinney

	"http://chadmckinneyaudio.com/
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

// Primitives are created by first creating a function that takes no arguments and returns some value.
// That primitive attains arguments by getting them from the VM using Lich.VM.getVar("variableName");
// next we use the create primitive function to actually add it to the VM using these arguments:
// createPrimitive("primitiveName", ["Array","Of","Argument","Names"], primitiveFunction);

function stateSync()
{
	var state = Lich.VM.getVar("_R");	

	//if(!(typeof libName === "string"))
	//	throw new Error("compileLib can only be applied to a string!");

	sendStateSync(state);

	return Lich.VM.Void;
}

createPrimitive("stateSync", ["_R"], stateSync);

function compileLib()
{
	var libName = Lich.VM.getVar("_R");	

	if(!(typeof libName === "string"))
		throw new Error("compileLib can only be applied to a string!");

	compileLibClient(libName);

	return Lich.VM.Void;
}

createPrimitive("compileLib", ["_R"], compileLib);

function load()
{
	var fileName = Lich.VM.getVar("_R");	

	if(!(typeof fileName === "string"))
		throw new Error("load can only be applied to a string!");

	askForFileFromServer(fileName);

	return Lich.VM.Void;
}

createPrimitive("load", ["_R"], load);

function chatPrimitive()
{
	var chatString = Lich.VM.getVar("_R");

	if(!(typeof chatString === "string"))
		throw new Error("chat can only be applied to strings!");

	sendChat(chatString);

	return Lich.VM.Void;
}

createPrimitive("chat", ["_R"], chatPrimitive);

function add()
{
	return Lich.VM.getVar("_L") + Lich.VM.getVar("_R");
}

createPrimitive("+", ["_L", "_R"], add);
createPrimitive("add", ["_L", "_R"], add);

function subtract()
{
	return Lich.VM.getVar("_L") - Lich.VM.getVar("_R");
}

createPrimitive("-", ["_L", "_R"], subtract);
createPrimitive("subtract", ["_L", "_R"], subtract);

function mul()
{
	return Lich.VM.getVar("_L") * Lich.VM.getVar("_R");
}

createPrimitive("*", ["_L", "_R"], mul);
createPrimitive("mul", ["_L", "_R"], mul);

function div()
{
	return Lich.VM.getVar("_L") / Lich.VM.getVar("_R");
}

createPrimitive("/", ["_L", "_R"], div);
createPrimitive("div", ["_L", "_R"], div);

function divR()
{
	return Lich.VM.getVar("_L") / Lich.VM.getVar("_R");
}

// Swapped for use with (/3) type currying
createPrimitive("/R", ["_R", "_L"], divR);

function pow()
{
	return Math.pow(Lich.VM.getVar("_L"), Lich.VM.getVar("_R"));
}

createPrimitive("^", ["_L", "_R"], pow);
createPrimitive("**", ["_L", "_R"], pow);

function powR()
{
	return Math.pow(Lich.VM.getVar("_L"), Lich.VM.getVar("_R"));
}

createPrimitive("^R", ["_R", "_L"], powR);


function mod()
{
	return Lich.VM.getVar("_L") % Lich.VM.getVar("_R");
}

createPrimitive("%", ["_L", "_R"], mod);
createPrimitive("mod", ["_L", "_R"], mod);


function equivalent()
{
	return Lich.VM.getVar("_L") == Lich.VM.getVar("_R");
}

createPrimitive("==", ["_L", "_R"], equivalent);


function notequivalent()
{
	return Lich.VM.getVar("_L") != Lich.VM.getVar("_R");
}

createPrimitive("/=", ["_L", "_R"], notequivalent);

function greater()
{
	return Lich.VM.getVar("_L") > Lich.VM.getVar("_R");
}

createPrimitive(">", ["_L", "_R"], greater);

function greaterR()
{
	return Lich.VM.getVar("_L") > Lich.VM.getVar("_R");
}

createPrimitive(">R", ["_R", "_L"], greaterR);


function lesser()
{
	return Lich.VM.getVar("_L") < Lich.VM.getVar("_R");
}

createPrimitive("<", ["_L", "_R"], lesser);

function lesserR()
{
	return Lich.VM.getVar("_L") < Lich.VM.getVar("_R");
}

createPrimitive("<R", ["_R", "_L"], lesserR);

function greaterEqual()
{
	return Lich.VM.getVar("_L") >= Lich.VM.getVar("_R");
}

createPrimitive(">=", ["_L", "_R"], greaterEqual);

function greaterEqualR()
{
	return Lich.VM.getVar("_L") >= Lich.VM.getVar("_R");
}

createPrimitive(">=R", ["_R", "_L"], greaterEqualR);

function lesserEqual()
{
	return Lich.VM.getVar("_L") <= Lich.VM.getVar("_R");
}

createPrimitive("<=", ["_L", "_R"], lesserEqual);

function lesserEqualR()
{
	return Lich.VM.getVar("_L") <= Lich.VM.getVar("_R");
}

createPrimitive("<=R", ["_R", "_L"], lesserEqualR);

function andand()
{
	return Lich.VM.getVar("_L") && Lich.VM.getVar("_R");
}

createPrimitive("&&", ["_R", "_L"], andand);

function oror()
{
	return Lich.VM.getVar("_L") || Lich.VM.getVar("_R");
}

createPrimitive("||", ["_R", "_L"], oror);

function indexList()
{
	var list = Lich.VM.getVar("_L");

	if(!((list instanceof Array) || (list.lichType == DICTIONARY)))
		throw new Error("indexing via !! can only be applied to lists and dictionaries.");

	var res = list[Lich.VM.getVar("_R")];
	return typeof res === "undefined" ? Lich.VM.Nothing : res;
}

createPrimitive("!!", ["_L", "_R"], indexList);
createPrimitive("lookup", ["_R", "_L"], indexList); // Container is on the right when using lookup

function deepCopy(obj) 
{
    if (Object.prototype.toString.call(obj) === '[object Array]') 
    {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++) 
        {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }

    if (typeof obj === 'object') 
    {
        var out = {}, i;
        for (i in obj) 
        {
            out[i] = arguments.callee(obj[i]);
        }
        
        return out;
    }
    
    return obj;
}


function mapContainer()
{
	var func = Lich.VM.getVar("_L");
	var container = Lich.VM.getVar("_R");

	if(func.lichType != CLOSURE)
		throw new Error("map can only be applied using: map function container");

	var res = container;

	if((container instanceof Array) || (typeof container === "string"))
	{
		res = new Array();

		for(var i = 0; i < container.length; ++i)
		{
			// Iterate over each item in the container and invoke the function passing [item]. It must be as an array to work correctly.
			res.push(func.invoke([container[i]])); 
		}

		if(typeof container === "string")
			res = res.join("");	
	}

	else if(container.lichType == DICTIONARY)
	{
		res = {};

		for(n in container)
		{
			if(n != "lichType")
				res[n] = func.invoke([container[n]]);
		}

		res.lichType = DICTIONARY;
	}

	else
	{
		throw new Error("map can only be applied to lists and dictionaries.");	
	}

	return res;
}

createPrimitive("map", ["_L", "_R"], mapContainer);

function mergeDictionaries(obj1, obj2) 
{
	obj1 = deepCopy(obj1);
	obj2 = deepCopy(obj2);
	
	for (var p in obj2) 
	{
    	try 
    	{
      		obj1[p] = obj2[p];
    	} 

    	catch(e) 
    	{
      		// Property in destination object not set; create it and set its value.
      		obj1[p] = obj2[p];
    	}
  }

  return obj1;
}


function cons()
{
	var value = Lich.VM.getVar("_L");
	var list = Lich.VM.getVar("_R");

	if(!(list instanceof Array || typeof list === "string" || list.lichType == DICTIONARY))
		throw new Error("Cons can only be applied to lists and dictionaries.");

	// list = deepCopy(list);
	// value = deepCopy(value);

	var res;

	if(value instanceof Array && list instanceof Array 
		|| typeof value === "string" && typeof list === "string")
		res = value.concat(list);
	else if(list.lichType == DICTIONARY)
		res = mergeDictionaries(list, value);
	else
		res = [value].concat(list);

	return typeof res === "undefined" ? Lich.VM.Nothing : res;
}

createPrimitive(":", ["_L", "_R"], cons);


function insert()
{
	var value = Lich.VM.getVar("_L");
	var list = Lich.VM.getVar("_R");

	if(!(list.lichType == DICTIONARY))
		throw new Error("Cons can only be applied to lists.");

	var res = mergeDictionaries(list, value);
	return typeof res === "undefined" ? Lich.VM.Nothing : res;
}

createPrimitive("insert", ["_L", "_R"], insert);


function deleteEntry()
{
	var value = Lich.VM.getVar("_L");
	var dict = Lich.VM.getVar("_R");

	if(!(dict.lichType == DICTIONARY))
		throw new Error("Cons can only be applied to lists.");

	var newDict = deepCopy(dict);
	delete newDict[value];
	return newDict;
}

createPrimitive("delete", ["_L", "_R"], deleteEntry); // delete "key" myMap


function concatList()
{
	var list = Lich.VM.getVar("_L");
	var value = Lich.VM.getVar("_R");

	if(!(list instanceof Array || typeof list === "string"))
		throw new Error("Concat can only be applied to lists.");

	// list = deepCopy(list);
	var res = list.concat(value);

	return typeof res === "undefined" ? Lich.VM.Nothing : res;
}

createPrimitive("++", ["_L", "_R"], concatList);

function foldl()
{
	var func = Lich.VM.getVar("_F");
	var initialValue = Lich.VM.getVar("_I");
	var container = Lich.VM.getVar("_C");

	if(func.lichType != CLOSURE)
		throw new Error("foldl can only be applied using: foldl function container");

	var res = container;

	if((container instanceof Array) || (typeof container === "string"))
	{
		res = initialValue;

		for(var i = 0; i < container.length; ++i)
		{
			res = func.invoke([res, container[i]]); 
		}
	}

	else if(container.lichType == DICTIONARY)
	{
		res = initialValue;

		for(n in container)
		{
			if(n != "lichType")
				res = func.invoke([res, container[n]]);
		}
	}

	else
	{
		throw new Error("foldl can only be applied to lists and dictionaries.");	
	}

	return res;
}

createPrimitive("foldl", ["_F", "_I", "_C"], foldl);

function foldr()
{
	var func = Lich.VM.getVar("_F");
	var initialValue = Lich.VM.getVar("_I");
	var container = Lich.VM.getVar("_C");

	if(func.lichType != CLOSURE)
		throw new Error("foldr can only be applied using: foldr function container");

	var res = container;

	if((container instanceof Array) || (typeof container === "string"))
	{
		res = initialValue;

		for(var i = (container.length - 1); i >= 0; --i)
		{
			res = func.invoke([container[i], res]); 
		}
	}

	else if(container.lichType == DICTIONARY)
	{
		res = initialValue;

		for(n in container)
		{
			if(n != "lichType")
				res = func.invoke([container[n], res]);
			else
				Lich.post("lichType in foldl.");
		}
	}

	else
	{
		throw new Error("foldr can only be applied to lists and dictionaries.");	
	}

	return res;
}

createPrimitive("foldr", ["_F", "_I", "_C"], foldr);

function zip()
{
	var lcontainer = Lich.VM.getVar("_L");
	var rcontainer = Lich.VM.getVar("_R");

	var res = new Array();

	if((lcontainer instanceof Array) || (typeof lcontainer === "string")
		&& (rcontainer instanceof Array) || (typeof rcontainer === "string"))
	{
		for(var i = 0; i < lcontainer.length && i < rcontainer.length; ++i)
		{
			res.push([lcontainer[i], rcontainer[i]]); 
		}
	}

	else
	{
		throw new Error("zip can only be applied to lists.");	
	}

	return res;
}

createPrimitive("zip", ["_L", "_R"], zip);

function zipWith()
{	
	var func = Lich.VM.getVar("_F");
	var lcontainer = Lich.VM.getVar("_L");
	var rcontainer = Lich.VM.getVar("_R");

	var res = new Array();

	if((lcontainer instanceof Array) || (typeof lcontainer === "string")
		&& (rcontainer instanceof Array) || (typeof rcontainer === "string"))
	{
		for(var i = 0; i < lcontainer.length && i < rcontainer.length; ++i)
		{
			res.push(func.invoke([lcontainer[i], rcontainer[i]])); 
		}
	}

	else
	{
		throw new Error("zipWith can only be applied to lists.");	
	}

	return res;
}

createPrimitive("zipWith", ["_F", "_L", "_R"], zipWith);

function filter()
{
	var func = Lich.VM.getVar("_L");
	var container = Lich.VM.getVar("_R");

	if(func.lichType != CLOSURE)
		throw new Error("filter can only be applied using: filter function container");

	var res = container;

	if((container instanceof Array) || (typeof container === "string"))
	{
		res = new Array();

		for(var i = 0; i < container.length; ++i)
		{
			// Iterate over each item in the container and invoke the function passing [item]. It must be as an array to work correctly.
			if(func.invoke([container[i]]))
				res.push(container[i]); 
		}

		if(typeof container === "string")
			res = res.join("");	
	}

	else if(container.lichType == DICTIONARY)
	{
		res = {};

		for(n in container)
		{
			if(n != "lichType")
				if(func.invoke([container[n]]))
					res[n] = container[n]; 
		}

		res.lichType = DICTIONARY;
	}

	else
	{
		throw new Error("map can only be applied to lists and dictionaries.");	
	}

	return res;
}

createPrimitive("filter", ["_L", "_R"], filter);

function head()
{
	var container = Lich.VM.getVar("_C");

	if((container instanceof Array) || (typeof container === "string"))
	{
		if(container.length == 0)
			return Lich.VM.Nothing;
		else
			return container[0];
	}

	else
	{
		throw new Error("head can only be applied to lists.");	
	}
}

createPrimitive("head", ["_C"], head);

function tail()
{
	var container = Lich.VM.getVar("_C");

	if((container instanceof Array) || (typeof container === "string"))
	{
		if(container.length == 0)
			return Lich.VM.Nothing;
		else
			return container.slice(1, container.length);
	}

	else
	{
		throw new Error("tail can only be applied to lists.");	
	}
}

createPrimitive("tail", ["_C"], tail);

function init()
{
	var container = Lich.VM.getVar("_C");

	if((container instanceof Array) || (typeof container === "string"))
	{
		if(container.length == 0)
			return Lich.VM.Nothing;
		else
			return container.slice(0, container.length - 1);
	}

	else
	{
		throw new Error("init can only be applied to lists.");	
	}
}

createPrimitive("init", ["_C"], init);

function last()
{
	var container = Lich.VM.getVar("_C");

	if((container instanceof Array) || (typeof container === "string"))
	{
		if(container.length == 0)
			return Lich.VM.Nothing;
		else
			return container[container.length - 1];
	}

	else
	{
		throw new Error("last can only be applied to lists.");	
	}
}

createPrimitive("last", ["_C"], last);

// We don't use createPrimitive directly, this gets called at runtime with function composition like: func1 . func2
function composeFunction(_functions)
{
	var functions = _functions;
	var newFunc = function()
	{
		var arg = Lich.VM.getVar("X");
		var res = arg;

		for(var i = functions.length - 1; i >= 0; --i)
		{
			res = functions[i].invoke([res]);
		}

		return res;
	}

	newFunc.astType = "primitive";
	return newFunc;
}

function sum()
{
	var container = Lich.VM.getVar("_C");

	if(container instanceof Array)
	{
		if(container.length == 0)
			return 0;
		
		var res = 0;

		for(var i = 0; i < container.length; ++i)
		{
			res += container[i];
		}

		return res;
	}

	else
	{
		throw new Error("sum can only be applied to lists.");	
	}
}

createPrimitive("sum", ["_C"], sum);


function take()
{
	var num = Lich.VM.getVar("_N");
	var container = Lich.VM.getVar("_C");

	if(container instanceof Array)
	{
		if(container.length == 0)
			return [];
		
		return container.slice(0, num);
	}

	else
	{
		throw new Error("take can only be applied to lists.");	
	}
}

createPrimitive("take", ["_N", "_C"], take);

function drop()
{
	var num = Lich.VM.getVar("_N");
	var container = Lich.VM.getVar("_C");

	if(container instanceof Array)
	{
		if(container.length == 0)
			return container;
		
		return container.slice(num, container.length);
	}

	else
	{
		throw new Error("drop can only be applied to lists.");	
	}
}

createPrimitive("drop", ["_N", "_C"], drop);

function lengthList()
{
	var container = Lich.VM.getVar("_C");

	if((container instanceof Array) || (typeof container === "string"))
	{
		return container.length;
	}

	else
	{
		throw new Error("length can only be applied to lists.");	
	}
}

createPrimitive("length", ["_C"], lengthList);

function nullList()
{
	var container = Lich.VM.getVar("_C");

	if((container instanceof Array) || (typeof container === "string"))
	{
		return container.length == 0;
	}

	else
	{
		throw new Error("null can only be applied to lists.");	
	}
}

createPrimitive("null", ["_C"], nullList);


function maximum()
{
	var container = Lich.VM.getVar("_C");

	if((container instanceof Array) || (typeof container === "string"))
	{
		if(container.length == 0)
			return Lich.VM.Nothing;

		res = container[0];

		for(var i = 0; i < container.length; ++i)
		{
			if(container[i] > res)
				res = container[i];
		}

		return res;
	}

	else
	{
		throw new Error("maximum can only be applied to lists.");	
	}
}

createPrimitive("maximum", ["_C"], maximum);

function minimum()
{
	var container = Lich.VM.getVar("_C");

	if((container instanceof Array) || (typeof container === "string"))
	{
		if(container.length == 0)
			return Lich.VM.Nothing;

		res = container[0];

		for(var i = 0; i < container.length; ++i)
		{
			if(container[i] < res)
				res = container[i];
		}

		return res;
	}

	else
	{
		throw new Error("minimum can only be applied to lists.");	
	}
}

createPrimitive("minimum", ["_C"], minimum);

function product()
{
	var container = Lich.VM.getVar("_C");

	if(container instanceof Array)
	{
		if(container.length == 0)
			return 0;
		
		var res = 1;

		for(var i = 0; i < container.length; ++i)
		{
			res *= container[i];
		}

		return res;
	}

	else
	{
		throw new Error("product can only be applied to lists.");	
	}
}

createPrimitive("product", ["_C"], product);

function elem()
{
	var item = Lich.VM.getVar("_I");
	var container = Lich.VM.getVar("_C");

	if((container instanceof Array) || (typeof container === "string"))
	{
		for(var i = 0; i < container.length; ++i)
		{
			if(container[i] == item)
				return true;
		}

		return false;
	}

	else if(container.lichType == DICTIONARY)
	{
		for(n in container)
		{
			if(container[n] == item)
				return true;
		}

		return false;
	}

	else
	{
		throw new Error("elem can only be applied to lists and dictionaries.");	
	}
}

createPrimitive("elem", ["_I", "_C"], elem);

function replicate()
{
	var number = Lich.VM.getVar("_N");
	var item = Lich.VM.getVar("_I");

	if(typeof number === "number")
	{
		var res = new Array();

		for(var i = 0; i < number; ++i)
		{
			res.push(item);
		}

		return res;
	}

	else
	{
		throw new Error("replicate must be used like: replicate number value");	
	}
}

createPrimitive("replicate", ["_N", "_I"], replicate);

function reverse()
{
	var container = Lich.VM.getVar("_C");

	if((container instanceof Array) || (typeof container === "string"))
	{
		if(container.length == 0)
			return [];

		var res = new Array();

		for(var i = container.length -1; i >= 0; --i)
		{
			res.push(container[i]);
		}

		return res;
	}

	else
	{
		throw new Error("reverse can only be applied to lists.");	
	}
}

createPrimitive("reverse", ["_C"], reverse);

function slice()
{
	var lower = Lich.VM.getVar("_L");
	var upper = Lich.VM.getVar("_U");
	var container = Lich.VM.getVar("_C");

	if((container instanceof Array) || (typeof container === "string"))
	{
		return container.slice(lower, upper);
	}

	else
	{
		throw new Error("slice can only be applied to lists.");	
	}
}

createPrimitive("slice", ["_L", "_U", "_C"], slice);


function randF()
{
	var lower = Lich.VM.getVar("_L");
	var upper = Lich.VM.getVar("_U");

	if(typeof lower === "number" && typeof upper === "number")
	{
		return Math.random() * (upper - lower) + lower
	}

	else
	{
		throw new Error("randF can only be applied to numbers.");	
	}
}

createPrimitive("rand", ["_L", "_U"], randF);
createPrimitive("random", ["_L", "_U"], randF);
createPrimitive("randF", ["_L", "_U"], randF);

function randI()
{
	var lower = Lich.VM.getVar("_L");
	var upper = Lich.VM.getVar("_U");

	if(typeof lower === "number" && typeof upper === "number")
	{
		return Math.floor(Math.random() * (upper - lower) + lower)
	}

	else
	{
		throw new Error("randF can only be applied to numbers.");	
	}
}

createPrimitive("randI", ["_L", "_U"], randI);
createPrimitive("randomI", ["_L", "_U"], randI);

// Constants
Lich.VM.reserveVar("pi", 3.141592653589793);

Soliton.print = Lich.post; // Set Soliton.print to our Lich.post function
Soliton.printError = Lich.post; // Set Soliton.print to our Lich.post function
LichVM.scheduler = Soliton.Clock.default.scheduler;
