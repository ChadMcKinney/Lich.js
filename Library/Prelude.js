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

function netEval()
{
	var str = Lich.VM.getVar("_R");	

	if(!(typeof str === "string"))
		throw new Error("netEval can only be applied to a string!");

	broadcastNetEval(str);
	
}
createPrimitive("netEval", ["_R"], netEval);

function lichEval()
{
	var str = Lich.VM.getVar("_R");	

	if(!(typeof str === "string"))
		throw new Error("eval can only be applied to a string!");
	try
    {
    	var res = Lich.parse(str);
        //Lich.VM.Print(L);
        return Lich.compileAST(res);
    }   
    catch(e)
    {
		Lich.post(e);
		return Lich.VM.Void;
	}
}

createPrimitive("eval", ["_R"], lichEval);

function lichPrint()
{
	Lich.VM.Print(Lich.VM.getVar("_L"));
	return Lich.VM.Void;
}
createPrimitive("print", ["_L"], lichPrint);


function lichClientName()
{
	var printString = Lich.VM.getVar("_R");
	return clientName;
}

createPrimitive("clientName", ["_R"], lichClientName);

//Lich.VM.reserveVar("clientName", lichClientName);


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
		throw new Error("compile can only be applied to a string!");

	compileLibClient(libName);

	return Lich.VM.Void;
}

createPrimitive("compile", ["_R"], compileLib);

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

function checkNumStringOpError(l, op, r)
{
	if((typeof l !== "number" && typeof l !== "string")
		|| (typeof r !== "number" && typeof r !== "string"))
		throw new Error(op + " can only be used with numbers and strings. Cannont use " + op + " with: " 
			+ Lich.VM.PrettyPrint(l) + " " + op + " " + Lich.VM.PrettyPrint(r));
}

function checkNumOpError(l, op, r)
{
	if((typeof l !== "number")
		|| (typeof r !== "number"))
		throw new Error(op + " can only be used with numbers. Cannont use " + op + " with: " 
			+ Lich.VM.PrettyPrint(l) + " " + op + " " + Lich.VM.PrettyPrint(r));
}

function spawnActor()
{
	var closure = Lich.VM.getVar("_function");

	if(closure.lichType != CLOSURE && closure.lichType != THUNK)
		throw new Error("spawn can only be used with functions. Failed with: spawn " + Lich.VM.PrettyPrint(closure));

	var worker = new Worker("../Compiler/Thread.js");
		
	worker.addEventListener(
		"message",
		function(event)
		{
			if(event.data.message != undefined)
				Lich.post(event.data.message);
			else if(event.data.print != undefined)
				Lich.post(event.data.print);
		},
		false
	);

	worker.addEventListener(
		"error",
		function(event)
		{
			Lich.post("Actor error: " + event.message);
		},
		false
	);

	worker.postMessage({type:"init", func:Lich.stringify(closure)});
	worker.lichType = ACTOR;
	return worker;
}

createPrimitive("spawn", ["_function"], spawnActor);

function sendActor()
{
	var message = Lich.VM.getVar("_message");
	var actor = Lich.VM.getVar("_actor");

	if(actor.lichType != ACTOR)
		throw new Error("send can only be used as: send message actor. Failed with send " + Lich.VM.PrettyPrint(message) + " " + Lich.VM.PrettyPrint(actor));

	actor.postMessage({type: "send", message: Lich.stringify(message)});
	return Lich.VM.Void;
}

createPrimitive("send", ["_message", "_actor"], sendActor);

function add()
{
	var l = Lich.VM.getVar("_L");
	var r = Lich.VM.getVar("_R");

	checkNumStringOpError(l, "+", r);

	return  l + r;
}

createPrimitive("+", ["_L", "_R"], add);
createPrimitive("add", ["_L", "_R"], add);

function subtract()
{
	var l = Lich.VM.getVar("_L");
	var r = Lich.VM.getVar("_R");

	checkNumOpError(l, "-", r);

	return  l - r;
}

createPrimitive("-", ["_L", "_R"], subtract);
createPrimitive("subtract", ["_L", "_R"], subtract);

function mul()
{
	var l = Lich.VM.getVar("_L");
	var r = Lich.VM.getVar("_R");

	checkNumOpError(l, "*", r);

	return  l * r;
}

createPrimitive("*", ["_L", "_R"], mul);
createPrimitive("mul", ["_L", "_R"], mul);

function div()
{
	var l = Lich.VM.getVar("_L");
	var r = Lich.VM.getVar("_R");

	checkNumOpError(l, "/", r);

	return  l / r;
}

createPrimitive("/", ["_L", "_R"], div);
createPrimitive("div", ["_L", "_R"], div);

// Swapped for use with (/3) type currying
createPrimitive("/R", ["_R", "_L"], div);

function pow()
{
	var l = Lich.VM.getVar("_L");
	var r = Lich.VM.getVar("_R");

	checkNumOpError(l, "^", r);

	return  Math.pow(l, r);
}

createPrimitive("^", ["_L", "_R"], pow);
createPrimitive("**", ["_L", "_R"], pow);
createPrimitive("^R", ["_R", "_L"], pow);


function mod()
{
	var l = Lich.VM.getVar("_L");
	var r = Lich.VM.getVar("_R");

	checkNumOpError(l, "%", r);

	return  l % r;
}

createPrimitive("%", ["_L", "_R"], mod);
createPrimitive("mod", ["_L", "_R"], mod);


function equivalent()
{
	return Lich.VM.getVar("_L") === Lich.VM.getVar("_R");
}

createPrimitive("==", ["_L", "_R"], equivalent);


function notequivalent()
{
	return Lich.VM.getVar("_L") != Lich.VM.getVar("_R");
}

createPrimitive("/=", ["_L", "_R"], notequivalent);

function greater()
{
	var l = Lich.VM.getVar("_L");
	var r = Lich.VM.getVar("_R");

	checkNumOpError(l, ">", r);

	return  l > r;
}

createPrimitive(">", ["_L", "_R"], greater);
createPrimitive(">R", ["_R", "_L"], greater);


function lesser()
{
	var l = Lich.VM.getVar("_L");
	var r = Lich.VM.getVar("_R");

	checkNumOpError(l, "<", r);

	return  l < r;
}

createPrimitive("<", ["_L", "_R"], lesser);
createPrimitive("<R", ["_R", "_L"], lesser);

function greaterEqual()
{
	var l = Lich.VM.getVar("_L");
	var r = Lich.VM.getVar("_R");

	checkNumOpError(l, ">=", r);

	return  l >= r;
}

createPrimitive(">=", ["_L", "_R"], greaterEqual);
createPrimitive(">=R", ["_R", "_L"], greaterEqual);

function lesserEqual()
{
	var l = Lich.VM.getVar("_L");
	var r = Lich.VM.getVar("_R");

	checkNumOpError(l, "<=", r);

	return  l <= r;
}

createPrimitive("<=", ["_L", "_R"], lesserEqual);
createPrimitive("<=R", ["_R", "_L"], lesserEqual);

function andand()
{
	var l = Lich.VM.getVar("_L");
	var r = Lich.VM.getVar("_R");

	if(typeof l !== "boolean" || typeof r !== "boolean")
		throw new Error("Cannot use && operator with: " + Lich.VM.PrettyPrint(l) + " && " + Lich.VM.PrettyPrint(r));

	return  l && r;
}

createPrimitive("&&", ["_R", "_L"], andand);

function oror()
{
	var l = Lich.VM.getVar("_L");
	var r = Lich.VM.getVar("_R");

	if(typeof l !== "boolean" || typeof r !== "boolean")
		throw new Error("Cannot use && operator with: " + Lich.VM.PrettyPrint(l) + " || " + Lich.VM.PrettyPrint(r));

	return  l || r;
}

createPrimitive("||", ["_R", "_L"], oror);

function not()
{
	var bool = Lich.VM.getVar("_B");

	if(typeof bool !== "boolean")
		throw new Error("The 'not' function can only be applied to booleans. Cannot use 'not' with: " + Lich.VM.PrettyPrint(bool));

	return  !bool;
}

createPrimitive("not", ["_B"], not);

function indexList()
{
	var list = Lich.VM.getVar("_L");
	var key = Lich.VM.getVar("_R");

	if(!((list instanceof Array) || (list.lichType == DICTIONARY)))
		throw new Error("indexing via !! or lookup can only be applied to lists and dictionaries as: lookup key container or: container !! key. Failed with: lookup " 
			+ Lich.VM.PrettyPrint(key) + " " + Lich.VM.PrettyPrint(list));

	var res = list[key];
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
		throw new Error("map can only be applied using: map function container. Failed with: map " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(container));

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
		throw new Error("map can only be applied to lists and dictionaries. Failed with: map " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(container));	
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
		throw new Error("Cons can only be applied to lists and dictionaries. Failed with: cons " + Lich.VM.PrettyPrint(value) 
			+ " " + Lich.VM.PrettyPrint(list));

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

	if(!((list.lichType == DICTIONARY) && (value.lichType == DICTIONARY)))
		throw new Error("insert can only be applied to dictionaries. Failed with: insert " + Lich.VM.PrettyPrint(value) + " " + Lich.VM.PrettyPrint(list));

	var res = mergeDictionaries(list, value);
	return typeof res === "undefined" ? Lich.VM.Nothing : res;
}

createPrimitive("insert", ["_L", "_R"], insert);


function deleteEntry()
{
	var value = Lich.VM.getVar("_L");
	var dict = Lich.VM.getVar("_R");

	if(!(dict.lichType == DICTIONARY))
		throw new Error("Cons can only be applied to lists. Failed with: delete " + Lich.VM.PrettyPrint(value) + " " + Lich.VM.PrettyPrint(dict));

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
		throw new Error("Concat can only be applied to lists. Failed with: " + Lich.VM.PrettyPrint(list) + " ++ " + Lich.VM.PrettyPrint(value));

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
		throw new Error("foldl can only be applied using: foldl function container. Failed with: foldr " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(initialValue) + " " + Lich.VM.PrettyPrint(container));

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
		throw new Error("foldl can only be applied to lists and dictionaries. Failed with: foldl " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(initialValue) + " " + Lich.VM.PrettyPrint(container));	
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
		throw new Error("foldr can only be applied using: foldr function container. Failed with: foldr " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(initialValue) + " " + Lich.VM.PrettyPrint(container));

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
		}
	}

	else
	{
		throw new Error("foldr can only be applied to lists and dictionaries. Failed with: foldr " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(initialValue) + " " + Lich.VM.PrettyPrint(container));	
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
		throw new Error("zip can only be applied to lists. Failed with: zip " + Lich.VM.PrettyPrint(lcontainer) + " " + Lich.VM.PrettyPrint(rcontainer));	
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
		throw new Error("zipWith can only be applied to lists. Failed with: zipWith " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(lcontainer) + " " + Lich.VM.PrettyPrint(rcontainer));	
	}

	return res;
}

createPrimitive("zipWith", ["_F", "_L", "_R"], zipWith);

function filter()
{
	var func = Lich.VM.getVar("_L");
	var container = Lich.VM.getVar("_R");

	if(func.lichType != CLOSURE)
		throw new Error("filter can only be applied using: filter function container. Failed with: filter " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(container));

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
		throw new Error("map can only be applied to lists and dictionaries. Failed with: filter " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(container));	
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
		throw new Error("head can only be applied to lists. Failed with: head " + Lich.VM.PrettyPrint(container));	
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
		throw new Error("tail can only be applied to lists. Failed with: tail " + Lich.VM.PrettyPrint(container));	
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
		throw new Error("init can only be applied to lists. Failed with: init " + Lich.VM.PrettyPrint(container));	
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
		throw new Error("last can only be applied to lists. Failed with: last " + Lich.VM.PrettyPrint(container));	
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
			var func = functions[i];

			if(typeof func === "undefined" || func.lichType != CLOSURE)
				throw new Error("function composition with the (.) operator can only be used with functions. Failed with " + Lich.VM.PrettyPrint(func));

			res = func.invoke([res]);
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
			var item = container[i];

			if(typeof item !== "number")
				throw new Error("sum can only be applied to lists containing numbers. Failed with " + Lich.VM.PrettyPrint(item));

			res += container[i];
		}

		return res;
	}

	else
	{
		throw new Error("sum can only be applied to lists. Failed with: sum " + Lich.VM.PrettyPrint(container));	
	}
}

createPrimitive("sum", ["_C"], sum);


function take()
{
	var num = Lich.VM.getVar("_N");
	var container = Lich.VM.getVar("_C");

	if(((container instanceof Array) || (typeof container === "string")) && (typeof num === "number"))
	{
		if(container.length == 0)
			return [];
		
		return container.slice(0, num);
	}

	else
	{
		throw new Error("take can only be applied to lists. Failed with: take " + Lich.VM.PrettyPrint(num) + " " + Lich.VM.PrettyPrint(container));	
	}
}

createPrimitive("take", ["_N", "_C"], take);

function drop()
{
	var num = Lich.VM.getVar("_N");
	var container = Lich.VM.getVar("_C");

	if(((container instanceof Array) || (typeof container === "string")) && (typeof num === "number"))
	{
		if(container.length == 0)
			return container;
		
		return container.slice(num, container.length);
	}

	else
	{
		throw new Error("drop can only be applied to lists. Failed with: drop " + Lich.VM.PrettyPrint(num) + " " + Lich.VM.PrettyPrint(container));	
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
		throw new Error("length can only be applied to lists. Failed with: length " + Lich.VM.PrettyPrint(container));	
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
		throw new Error("null can only be applied to lists. Failed with: null " + Lich.VM.PrettyPrint(container));	
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
			if(typeof item !== "number")
				throw new Error("maximum can only be used on lists containing numbers. Failed with " + Lich.VM.PrettyPrint(item));

			if(item > res)
				res = item;
		}

		return res;
	}

	else
	{
		throw new Error("maximum can only be applied to lists. Failed with: maximum " + Lich.VM.PrettyPrint(container));	
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
			var item = container[i];

			if(typeof item !== "number")
				throw new Error("minimum can only be used on lists containing numbers. Failed with " + Lich.VM.PrettyPrint(item));

			if(item < res)
				res = item;
		}

		return res;
	}

	else
	{
		throw new Error("minimum can only be applied to lists. Failed with: minimum " + Lich.VM.PrettyPrint(container));	
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
			var item = container[i];

			if(typeof item !== "number")
				throw new Error("Can't use product on lists containing non-numbers. Failed with " + Lich.VM.PrettyPrint(item));

			res *= item;
		}

		return res;
	}

	else
	{
		throw new Error("product can only be applied to lists. Failed with: product " + Lich.VM.PrettyPrint(container));	
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
		throw new Error("elem can only be applied to lists and dictionaries. Failed with: elem " + Lich.VM.PrettyPrint(item) 
			+ " " + Lich.VM.PrettyPrint(container));	
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
		throw new Error("replicate must be used like: replicate number value. Failed with: replicate " + Lich.VM.PrettyPrint(number) 
			+ " " + Lich.VM.PrettyPrint(item));	
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
		throw new Error("reverse can only be applied to lists. Failed with: reverse " + Lich.VM.PrettyPrint(container));	
	}
}

createPrimitive("reverse", ["_C"], reverse);

function sort()
{
	var container = Lich.VM.getVar("_C");
	container = deepCopy(container);

	if(container instanceof Array)
	{
		return container.sort(function(a,b)
		{
			return a - b;
		});
	}

	else if(typeof container === "string")
	{
		return container.sort();
	}

	else
	{
		throw new Error("sort can only be applied to lists. Failed with: reverse " + Lich.VM.PrettyPrint(container));	
	}
}

createPrimitive("sort", ["_C"], sort);

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
		throw new Error("slice can only be applied to lists. Failed with: slice " + Lich.VM.PrettyPrint(lower) + " " + Lich.VM.PrettyPrint(upper) 
			+ Lich.VM.PrettyPrint(container));	
	}
}

createPrimitive("slice", ["_L", "_U", "_C"], slice);


function randF()
{
	var lower = Lich.VM.getVar("_L");
	var upper = Lich.VM.getVar("_U");

	if(typeof lower === "number" && typeof upper === "number")
	{
		return Math.random() * (upper - lower) + lower;
	}

	else
	{
		throw new Error("randF can only be applied to numbers. Failed with: randF " + Lich.VM.PrettyPrint(lower) + " " + Lich.VM.PrettyPrint(upper));	
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
		return Math.floor(Math.random() * (upper - lower) + lower);
	}

	else
	{
		throw new Error("randF can only be applied to numbers. Failed with: randI " + Lich.VM.PrettyPrint(lower) + " " + Lich.VM.PrettyPrint(upper));	
	}
}

createPrimitive("randI", ["_L", "_U"], randI);
createPrimitive("randomI", ["_L", "_U"], randI);


function odd()
{
	var num = Lich.VM.getVar("_N");

	if(typeof num === "number")
	{
		return (num % 2) == 1;		
	}

	else
	{
		throw new Error("odd can only be applied to numbers. Failed with: odd " + Lich.VM.PrettyPrint(num));	
	}
}

createPrimitive("odd", ["_N"], odd);

function even()
{
	var num = Lich.VM.getVar("_N");

	if(typeof num === "number")
	{
		return (num % 2) == 0;
	}

	else
	{
		throw new Error("even can only be applied to numbers. Failed with: even " + Lich.VM.PrettyPrint(num));	
	}
}

createPrimitive("even", ["_N"], even);

function sqrt()
{
	var num = Lich.VM.getVar("_N");

	if(typeof num === "number")
	{
		return Math.sqrt(num);		
	}

	else
	{
		throw new Error("sqrt can only be applied to numbers. Failed with: sqrt " + Lich.VM.PrettyPrint(num));	
	}
}

createPrimitive("sqrt", ["_N"], sqrt);

function showLich()
{
	return Lich.VM.PrettyPrint(Lich.VM.getVar("_L"));
}

createPrimitive("show", ["_L"], showLich);

/*
function lichType()
{
	var object = Lich.VM.getVar("_O");

	var typeOf = typeof object;

	if(typeOf === "undefined")
		return Lich.VM.namespace["Nothing"];
	else if(typeOf === "number")
		return Lich.VM.namespace["Num"];
}

createPrimitive("typeof", ["_O"], lichType);*/

// Constants
Lich.VM.reserveVar("pi", 3.141592653589793);

/*
Soliton.print = Lich.post; // Set Soliton.print to our Lich.post function
Soliton.printError = Lich.post; // Set Soliton.print to our Lich.post function
Lich.scheduler = Soliton.Clock.default.scheduler;
*/
