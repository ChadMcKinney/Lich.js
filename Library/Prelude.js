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

function indexList()
{
	var list = Lich.VM.getVar("_L");

	if(!(list instanceof Array))
		throw new Error("indexing via !! can only be applied to lists.");

	var res = list[Lich.VM.getVar("_R")];
	return typeof res === "undefined" ? Lich.VM.Nothing : res;
}

createPrimitive("!!", ["_L", "_R"], indexList);

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


function mapList()
{
	var func = Lich.VM.getVar("_L");
	var list = Lich.VM.getVar("_R");

	if(func.lichType != CLOSURE)
		throw new Error("map can only be applied using: map function list");

	if(!(list instanceof Array))
		throw new Error("map can only be applied to lists.");

	var res = new Array();

	for(var i = 0; i < list.length; ++i)
	{
		// Iterate over each item in the list and invoke the function passing [item]. It must be as an array to work correctly.
		res.push(func.invoke([list[i]])); 
	}

	return res;
}

createPrimitive("map", ["_L", "_R"], mapList);

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
		throw new Error("Cons can only be applied to lists.");

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

function indexDictionary()
{
	var dictionary = Lich.VM.getVar("_L");

	if(!(dictionary instanceof Object))
		throw new Error("indexing via :: can only be applied to dictionary.");

	var res = dictionary[Lich.VM.getVar("_R")];
	return typeof res === "undefined" ? Lich.VM.Nothing : res;
}

createPrimitive("::", ["_L", "_R"], indexDictionary);
