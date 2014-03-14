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
// _createPrimitive("primitiveName", ["Array","Of","Argument","Names"], primitiveFunction);

var lichProcesses = new Object;

function madnessIntro()
{
	_madnessIntro();
	//if(!(typeof str === "string"))
	//	throw new Error("netEval can only be applied to a string!");

	//broadcastNetEval(str);
	return Lich.VM.Void;
}

function netEval(str)
{
	if(!(typeof str === "string"))
		throw new Error("netEval can only be applied to a string!");

	broadcastNetEval(str);
	return Lich.VM.Void;
}

function evalLich(str)
{
	if(!(typeof str === "string"))
		throw new Error("eval can only be applied to a string!");
	
	try
	{
	   	var ast = Lich.parse(str);
	    //Lich.VM.Print(L);
	    //return Lich.compileAST(ast);
	    var res = Lich.compileAST(ast);
       	if(res instanceof Array)
		{
			for(var i = 0; i < res.length; ++i)
			{
				eval(res[i]);
			}
		}

		else
		{
			eval(res);
		}
    }

    catch(e)
    {
		Lich.post(e);
	}
}

function print(object)
{
	Lich.VM.Print(object);
	return Lich.VM.Void;
}

_createPrimitive("print", print);

IO = {_lichType: DATA,_argNames:[],_datatype:"IO"};

function mprint(object)
{
	return State(function(s){Lich.VM.Print(object); return Result(IO, s)});
}

_createPrimitive("mprint", mprint);

function lift(func, arg)
{
	if(typeof func !== "function")
		throw new Error("lift fist argument must be a function. Failed with: " + Lich.VM.PrettyPrint(func));
	
	return State(function(s){func.curry(arg); return Result(IO, s)});
}

_createPrimitive("lift", lift);

function printAndReturn(left, right)
{
	Lich.VM.Print(left);
	return right;
}

_createPrimitive("printAndReturn", printAndReturn);

function lichClientName()
{
	return clientName;
}

_createPrimitive("lichClientName", lichClientName);

function lichUsers()
{
	if(!(users instanceof Array))
		throw new Error("Users isn't an array!");

	console.log(users);
	Lich.VM.PrettyPrint(users.map(function(elem){return elem.name}));
	return users.map(function(elem){return elem.name});
}

_createPrimitive("lichUsers", lichUsers);

function stateSync(state)
{
	sendStateSync(state);
	return Lich.VM.Void;
}

function compile(libName)
{
	if(!(typeof libName === "string"))
		throw new Error("compile can only be applied to a string!");

	compileLibClient(libName);
	//Lich.VM.modules.push(libName);
	return Lich.VM.Void;
}

_createPrimitive("compile", compile);

function load(fileName)
{
	if(!(typeof fileName === "string"))
		throw new Error("load can only be applied to a string!");

	askForFileFromServer(fileName);
	return Lich.VM.Void;
}

_createPrimitive("load", load);

function chat(chatString)
{
	if(!(typeof chatString === "string"))
		throw new Error("chat can only be applied to strings!");

	sendChat(chatString);
	return Lich.VM.Void;
}

_createPrimitive("chat", chat);

function postNarration(chatString)
{
	if(!(typeof chatString === "string"))
		throw new Error("postNarration can only be applied to strings!");

	updateNarration(chatString);
	return Lich.VM.Void;
}

function importjs(fileName)
{
	if(Lich.VM.currentThread === "main")
	{
		var script = document.createElement("script")
	    script.type = "text/javascript";

	    script.onload = function()
	    {
	        Lich.post("Done importing " + fileName);
	    };

	    script.src = "http://"+ self.location.hostname + "/" + fileName;
	    document.getElementsByTagName("head")[0].appendChild(script);	
	}
		
	else
	{
		try
		{
			importScripts("../"+fileName);
		}

		catch(e)
		{
			Lich.post(e);
		}
	}
}

_createPrimitive("importjs", importjs);

function _checkNumStringOpError(l, op, r)
{
	if((typeof l !== "number" && typeof l !== "string")
		|| (typeof r !== "number" && typeof r !== "string"))
		throw new Error(op + " can only be used with numbers and strings. Cannont use " + op + " with: " 
			+ Lich.VM.PrettyPrint(l) + " " + op + " " + Lich.VM.PrettyPrint(r));
}

function _checkNumOpError(l, op, r)
{
	if((typeof l !== "number")
		|| (typeof r !== "number"))
		throw new Error(op + " can only be used with numbers. Cannont use " + op + " with: " 
			+ Lich.VM.PrettyPrint(l) + " " + op + " " + Lich.VM.PrettyPrint(r));
}

function _extractFunctionAndArgs(func)
{
	if(typeof func.curriedFunc === "undefined")
		return [func, []];
	else
		return [func.curriedFunc, func.curriedArgs];
}

function _evalMessage(message)
{
	var func = eval(message.func);
	var args = Lich.parseJSON(message.args);

	func.apply(null, args);
}

function _evalInMainThread(func, args)
{
	var funcAndArgs = _extractFunctionAndArgs(func); // Uncurry the function and collect the curried arguments.
	var funcString = funcAndArgs[0].toString(); // Translate the function to a string representation.

	self.postMessage({
		evaluate:true,
		func: "((function(){return " + funcString + "})())",
		args: Lich.stringify(args.concat(funcAndArgs[1]))
	});
}

function evalInMainThread(func, args)
{
	var funcAndArgs = _extractFunctionAndArgs(func); // Uncurry the function and collect the curried arguments.
	var funcString = funcAndArgs[0].toString(); // Translate the function to a string representation.

	self.postMessage({
		evaluate:true,
		func: "((function(){return " + funcString + "})())",
		args: Lich.stringify(args.concat(funcAndArgs[1]))
	});
}

function actorChat(chatString)
{
	if(!(typeof chatString === "string"))
		throw new Error("chat can only be applied to strings!");

	_evalInMainThread("sendChat", [chatString]);
	return Lich.VM.Void;
}

function spawn(name, closure, args)
{
	if(typeof closure !== "function")
		throw new Error("spawn can only be used as spawn function list. Failed with: spawn " + Lich.VM.PrettyPrint(closure) 
			+ " " + Lich.VM.PrettyPrint(args));

	if(Lich.getType(args) != LIST)
		throw new Error("spawn can only be used as spawn function list. Failed with: spawn " + Lich.VM.PrettyPrint(closure) 
			+ " " + Lich.VM.PrettyPrint(args));

	var funcAndArgs = _extractFunctionAndArgs(closure); // Uncurry the function and collect the curried arguments.
	var funcString = funcAndArgs[0].toString(); // Translate the function to a string representation.
	/*var func = funcString.match(/function ([^\(]+)/);

	if(func == null || typeof func === "undefined")
		func = funcString;
	else
		func = func[1];*/

	// allows for assignment in the actor thread
	func = Lich.stringify({_lichType:CLOSURE, value: "((function(){return "+funcString+"})())"});
	// Combine curried arguments with arguments passed in
	args = Lich.stringify(funcAndArgs[1].concat(args));

	return Lich.VM.actorSupervisor.registerActor(name, func, args, Lich.VM.currentThread);
}

_createPrimitive("spawn", spawn);

function send(msg, actor)
{
	if(typeof msg === "function")
		throw new Error("Can't send a function as a message to an actor.");

	if(actor._lichType != ACTOR && typeof actor !== "string")
		throw new Error("send can only be used as: send message actor. Failed with send " + Lich.VM.PrettyPrint(msg) 
			+ " " + Lich.VM.PrettyPrint(actor));

	if(actor._lichType == ACTOR)
		actor.postMessage({type: "msg", message: Lich.stringify(msg)});
	else
		Lich.VM.actorSupervisor.sendActor(actor, {type: "msg", message: Lich.stringify(msg)}, Lich.VM.currentThread);
	
	return actor;
}

_createPrimitive(":>>", send, "send");
_createPrimitive("send", send);

function numArgs(func)
{
	if(typeof func !== "function")
		throw new Error("numArgs can only be used with functions.")

	return func.length;
}

function add(l, r)
{
	if(l._lichType == AUDIO || r._lichType == AUDIO)
		return mix2(l,r);

	_checkNumStringOpError(l, "+", r);
	return l + r;
}

_createPrimitive("+", add, "add");
_createPrimitive("add", add);

function minus(l, r)
{
	if(l._lichType == AUDIO || r._lichType == AUDIO)
		return _subtractMix(l, r);
			
	_checkNumOpError(l, "-", r);
	return l - r;
}

_createPrimitive("-", minus, "minus");
_createPrimitive("minus", minus);

function subtract(r, l)
{
	if(l._lichType == AUDIO || r._lichType == AUDIO)
		return _subtractMix(l, r);
			
	_checkNumOpError(l, "-", r);
	return l - r;
}

_createPrimitive("subtract", subtract);

function mul(l, r)
{
	if(l._lichType == AUDIO || r._lichType == AUDIO)
		return gain(l, r);

	_checkNumOpError(l, "*", r);
	return l * r;
}

_createPrimitive("*", mul, "mul");
_createPrimitive("mul", mul);

function div(l, r)
{	
	if(l._lichType == AUDIO || r._lichType == AUDIO)
		return _audioDivision(l, r);

	_checkNumOpError(l, "/", r);
	return l / r;
}

_createPrimitive("/", div, "div");
_createPrimitive("div", div);

function pow(l, r)
{
	_checkNumOpError(l, "^", r);
	return Math.pow(l,r);
}

_createPrimitive("^", pow, "pow");
_createPrimitive("**", pow, "pow");
_createPrimitive("pow", pow);

function mod(l, r)
{
	_checkNumOpError(l, "%", r);
	return l % r;
}

_createPrimitive("%", mod, "mod");
_createPrimitive("mod", mod);

function nsin(value)
{
	return Math.sin(value);
}

_createPrimitive("nsin", nsin);

function ncos(value)
{
	return Math.cos(value);
}

_createPrimitive("ncos", ncos);

function linlin(value, inMin, inMax, outMin, outMax)
{
    if(value <= inMin)
		return outMin;
	else if(value >= inMax)
		return outMax;
    else
        return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

_createPrimitive("linlin", linlin);

function _linlin(value, inMin, inMax, outMin, outMax)
{
    if(value <= inMin)
		return outMin;
	else if(value >= inMax)
		return outMax;
    else
        return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}


function explin(value, inMin, inMax, outMin, outMax)
{
    if(value <= inMin)
		return outMin;
	else if(value >= inMax)
		return outMax;
    else
        return (Math.log(value / inMin) / Math.log(inMax / inMin)) * (outMax - outMin) + outMin;
}

_createPrimitive("explin", explin);

function expexp(value, inMin, inMax, outMin, outMax)
{
    if(value <= inMin)
		return outMin;
	else if(value >= inMax)
		return outMax;
    else
        return Math.pow(outMax/outMin, Math.log(value/inMin) / Math.log(inMax/inMin)) * outMin;
}

_createPrimitive("expexp", expexp);

// Map a number from a linear range to an exponential range
function _linexp(val, inMin, inMax, outMin, outMax)
{
	if(val <= inMin)
		return outMin;
	else if(val >= inMax)
		return outMax;
	else
		return Math.pow(outMax / outMin, (val - inMin) / (inMax - inMin)) * outMin;
}

// Map a number from a linear range to an exponential range
function linexp(val, inMin, inMax, outMin, outMax)
{
	if(val <= inMin)
		return outMin;
	else if(val >= inMax)
		return outMax;
	else
		return Math.pow(outMax / outMin, (val - inMin) / (inMax - inMin)) * outMin;
}

_createPrimitive("linexp", linexp);

function _equivalent(l, r)
{
	if(Lich.getType(l) == DATA && Lich.getType(r) == DATA)
		return l._datatype == r._datatype;
	else
		return l === r;
}

_createPrimitive("==", _equivalent, "_equivalent");

function _notequivalent(l, r)
{
	if(Lich.getType(l) == DATA && Lich.getType(r) == DATA)
		return l._datatype != r._datatype;
	else
		return l !== r;
}

_createPrimitive("/=", _notequivalent, "_notequivalent");

function _greater(l, r)
{
	_checkNumOpError(l, ">", r);
	return l > r;
}

_createPrimitive(">", _greater, "_greater");

function _lesser(l, r)
{
	_checkNumOpError(l, "<", r);
	return l < r;
}

_createPrimitive("<", _lesser, "_lesser");

function _greaterEqual(l, r)
{
	_checkNumOpError(l, ">=", r);
	return l >= r;
}

_createPrimitive(">=", _greaterEqual, "_greaterEqual");

function _lesserEqual(l, r)
{
	_checkNumOpError(l, "<=", r);
	return l <= r;
}

_createPrimitive("<=", _lesserEqual, "_lesserEqual");

function _andand(l, r)
{
	if(typeof l !== "boolean" || typeof r !== "boolean")
		throw new Error("Cannot use && operator with: " + Lich.VM.PrettyPrint(l) + " && " + Lich.VM.PrettyPrint(r));

	return l && r;
}

_createPrimitive("&&", _andand, "_andand");

function _oror(l, r)
{
	if(typeof l !== "boolean" || typeof r !== "boolean")
		throw new Error("Cannot use && operator with: " + Lich.VM.PrettyPrint(l) + " || " + Lich.VM.PrettyPrint(r));

	return l || r;
}

_createPrimitive("||", _oror, "_oror");

function not(bool)
{
	if(typeof bool !== "boolean")
		throw new Error("The 'not' function can only be applied to booleans. Cannot use 'not' with: " + Lich.VM.PrettyPrint(bool));

	return !bool;
}

_createPrimitive("not", not);

function lookup(key, list)
{
	if(!((list instanceof Array) || (list._lichType == DICTIONARY)))
		throw new Error("indexing via !! or lookup can only be applied to lists and dictionaries as: lookup key container or: container !! "
			+"key. Failed with: lookup " + Lich.VM.PrettyPrint(key) + " " + Lich.VM.PrettyPrint(list));

	if(list.hasOwnProperty(key))
		return list[key];
	else
		return Lich.VM.Nothing;
}

function _flipLookup(l,k){return lookup(k,l)}

_createPrimitive("!!", _flipLookup, "_flipLookup");
_createPrimitive("lookup", lookup);

function _deepCopy(obj) 
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

function map(func, container)
{
	if(typeof func !== "function")
		throw new Error("map can only be applied using: map function container. Failed with: map " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(container));

	if(container instanceof Array)
	{	
		return container.map(function(elem){return func.curry(elem)});
	}

	else if(typeof container === "string")
	{
		var res = ""
		for(var i = 0; i < container.length; ++i)
		{
			res += func.curry(container[i]);
		}

		return res;
	}

	else if(container._lichType == DICTIONARY)
	{
		res = {_lichType:DICTIONARY};
		for(var n in container)
		{
			if(n !== "_lichType") // _lichType reserved by Lich.js
			{
				res[n] = func.curry(container[n]);
			}
		}

		return res;
	}

	else
	{
		throw new Error("map can only be applied to lists and dictionaries. Failed with: map " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("map", map);

function _mergeDictionaries(obj1, obj2) 
{
	obj1 = _deepCopy(obj1);
	obj2 = _deepCopy(obj2);
	
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


function cons(value, container)
{
	if(!(container instanceof Array || typeof container === "string" || container._lichType == DICTIONARY))
		throw new Error("Cons can only be applied to lists and dictionaries. Failed with: cons " + Lich.VM.PrettyPrint(value) 
			+ " " + Lich.VM.PrettyPrint(container));

	var res;

	if(container._lichType == DICTIONARY)
		res = _mergeDictionaries(container, value);
	else
		res = [value].concat(container);

	return typeof res === "undefined" ? Lich.VM.Nothing : res;
}

_createPrimitive(":", cons, "cons");
_createPrimitive("cons", cons);

function insert(value, container)
{
	if(!((container._lichType == DICTIONARY) && (value._lichType == DICTIONARY)))
		throw new Error("insert can only be applied to dictionaries. Failed with: insert " + Lich.VM.PrettyPrint(value) 
			+ " " + Lich.VM.PrettyPrint(list));

	var res = _mergeDictionaries(container, value);
	return typeof res === "undefined" ? Lich.VM.Nothing : res;
}

_createPrimitive("insert", insert);

function deleteEntry(value, dict)
{
	if(!(dict._lichType == DICTIONARY))
		throw new Error("delete can only be applied to lists. Failed with: delete " + Lich.VM.PrettyPrint(value) + " " + Lich.VM.PrettyPrint(dict));

	var newDict = _deepCopy(dict);
	delete newDict[value];
	return newDict;
}

del = deleteEntry;
remove = deleteEntry;
_createPrimitive("del", del);
_createPrimitive("remove", remove);

function concatList(list, value)
{
	if(!(list instanceof Array || typeof list === "string"))
		throw new Error("Concat can only be applied to lists. Failed with: " + Lich.VM.PrettyPrint(list) + " ++ " + Lich.VM.PrettyPrint(value));

	// list = _deepCopy(list);
	var res = list.concat(value);
	return typeof res === "undefined" ? Lich.VM.Nothing : res;
}

_createPrimitive("++", concatList, "concatList");

function experiential(l, r)
{
	if(Lich.getType(l) == NOTHING)
		return r;
	else
		return l;
}

_createPrimitive("?", experiential, "experiential");

function foldl(func, initialValue, container)
{

	if(typeof func !== "function")
		throw new Error("foldl can only be applied using: foldl function container. Failed with: foldr " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(initialValue) + " " + Lich.VM.PrettyPrint(container));

	var res = initialValue;

	if((container instanceof Array) || (typeof container === "string"))
	{
		
		for(var i = 0; i < container.length; ++i)
		{
			res = func.curry(res, container[i]);
		}

		return res;
	}

	else if(container._lichType == DICTIONARY)
	{
		for(var n in container)
		{
			if(n !== "_lichType")
				res = func.curry(res, container[n]);
		}

		return res;
	}

	else
	{
		throw new Error("foldl can only be applied to lists and dictionaries. Failed with: foldl " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(initialValue) + " " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("foldl", foldl);

function foldr(func, container, initialValue)
{

	if(typeof func !== "function")
		throw new Error("foldr can only be applied using: foldl function container. Failed with: foldr " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(initialValue) + " " + Lich.VM.PrettyPrint(container));

	var res = initialValue;

	if((container instanceof Array) || (typeof container === "string"))
	{		
		for(var i = container.length - 1; i >= 0; --i)
		{
			res = func.curry(res, container[i]);
		}

		return res;
	}

	else if(container._lichType == DICTIONARY)
	{
		for(var n in container)
		{
			if(n !== "_lichType")
				res = func.curry(res, container[n]);
		}

		return res;
	}

	else
	{
		throw new Error("foldr can only be applied to lists and dictionaries. Failed with: foldr " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(initialValue) + " " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("foldr", foldr);

function zip(lcontainer, rcontainer)
{
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
		throw new Error("zip can only be applied to lists. Failed with: zip " + Lich.VM.PrettyPrint(lcontainer) 
			+ " " + Lich.VM.PrettyPrint(rcontainer));	
	}

	return res;
}

_createPrimitive("zip", zip);

function zipWith(func, lcontainer, rcontainer)
{
	var res = [];

	if((lcontainer instanceof Array) || (typeof lcontainer === "string")
		&& (rcontainer instanceof Array) || (typeof rcontainer === "string"))
	{
		var container;
		if(rcontainer.length < lcontainer.length)
			container = rcontainer;
		else
			container = lcontainer;

		for(var i = 0; i < container.length; ++i)
		{
			res.push(func.curry(lcontainer[i], rcontainer[i]));
		}

		return res;
	}

	else
	{
		throw new Error("zipWith can only be applied to lists. Failed with: zipWith " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(lcontainer) + " " + Lich.VM.PrettyPrint(rcontainer));	
	}
}

_createPrimitive("zipWith", zipWith);

function filter(func, container)
{
	if(typeof func !== "function")
		throw new Error("filter can only be applied using: filter function container. Failed with: filter " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(container));

	if((container instanceof Array) || (typeof container === "string"))
	{
		var res = [];

		for(var i = 0; i < container.length; ++i)
		{
			if(func.curry(container[i]))
				res.push(container[i]);
		}

		if(typeof container === "string")
			res = res.join("");

		return res;
	}

	else if(container._lichType == DICTIONARY)
	{
		var res = {_lichType: DICTIONARY};

		for(var n in container)
		{
			if(n !== "_lichType")
				if(func.curry(container[n]))
					res[n] = container[n];
		}

		return res;
	}

	else
	{
		throw new Error("map can only be applied to lists and dictionaries. Failed with: filter " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("filter", filter);

function head(container)
{
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

_createPrimitive("head", head);

function tail(container)
{
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

_createPrimitive("tail", tail);

function init(container)
{
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

_createPrimitive("init", init);

function last(container)
{
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

_createPrimitive("last", last);

function sum(container)
{
	if(container instanceof Array)
	{
		if(container.length == 0)
		{
			return 0;
		}

		else
		{
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
	}

	else
	{
		throw new Error("sum can only be applied to lists. Failed with: sum " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("sum", sum);

function take(num, container)
{
	if(((container instanceof Array) || (typeof container === "string")) && (typeof num === "number"))
	{
		if(container.length == 0)
		{
			return [];
		}

		else
		{
			return container.slice(0, num);
		}
	}

	else
	{
		throw new Error("take can only be applied to lists. Failed with: take " + Lich.VM.PrettyPrint(num) + " " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("take", take);

function drop(num, container)
{
	if(((container instanceof Array) || (typeof container === "string")) && (typeof num === "number"))
	{
		if(container.length == 0)
		{
			return container;
		}

		else
		{
			return container.slice(num, container.length);
		}
	}

	else
	{
		throw new Error("drop can only be applied to lists. Failed with: drop " + Lich.VM.PrettyPrint(num) + " " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("drop", drop);

function length(container)
{
	if((container instanceof Array) || (typeof container === "string"))
	{
		return container.length;
	}

	else if(Lich.getType(container) == DICTIONARY)
	{
		var size = 0, key;
		    
		for (key in container) {
		    if(container.hasOwnProperty(key) && key !== "_lichType") size++;
		}

		return size;
	}

	else
	{
		throw new Error("length can only be applied to lists or dictionaries. Failed with: length " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("length", length);

function isNullList(container)
{
	if((container instanceof Array) || (typeof container === "string"))
	{
		return container.length == 0;
	}

	else
	{
		throw new Error("null can only be applied to lists. Failed with: null " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("isNullList", isNullList);

function maximum(container)
{
	if((container instanceof Array) || (typeof container === "string"))
	{
		if(container.length == 0)
		{
			return Lich.VM.Nothing;
		}

		else
		{
			res = container[0];

			for(var i = 0; i < container.length; ++i)
			{
				var item = container[i];

				if(typeof item !== "number")
					throw new Error("maximum can only be used on lists containing numbers. Failed with " + Lich.VM.PrettyPrint(item));

				if(item > res)
					res = item;
			}

			return res;
		}
	}

	else
	{
		throw new Error("maximum can only be applied to lists. Failed with: maximum " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("maximum", maximum);

function minimum(container)
{
	if((container instanceof Array) || (typeof container === "string"))
	{
		if(container.length == 0)
		{
			return Lich.VM.Nothing;
		}

		else
		{
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
	}

	else
	{
		throw new Error("minimum can only be applied to lists. Failed with: minimum " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("minimum", minimum);

function product(container)
{
	if(container instanceof Array)
	{
		if(container.length == 0)
		{
			return 0;
		}

		else
		{
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
	}

	else
	{
		throw new Error("product can only be applied to lists. Failed with: product " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("product", product);

function elem(item, container)
{
	if((container instanceof Array) || (typeof container === "string"))
	{
		var found = false;
		for(var i = 0; i < container.length; ++i)
		{
			if(container[i] == item)
			{
				found = true;
				break;
			}
		}

		return found;
	}

	else if(container._lichType == DICTIONARY)
	{
		var found = false;
		for(n in container)
		{
			if(container[n] == item)
			{
				found = true;
				break;
			}
		}

		return found;
	}

	else
	{
		throw new Error("elem can only be applied to lists and dictionaries. Failed with: elem " + Lich.VM.PrettyPrint(item) 
			+ " " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("elem", elem);

function member(item, container)
{
	if(container._lichType == DICTIONARY)
	{
		return container.hasOwnProperty(item);
	}

	else
	{
		throw new Error("member can only be applied to lists and dictionaries. Failed with: member " + Lich.VM.PrettyPrint(item) 
			+ " " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("member", member);

function notMember(item, container)
{
	if(container._lichType == DICTIONARY)
	{
		return !container.hasOwnProperty(item);
	}

	else
	{
		throw new Error("notMember can only be applied to lists and dictionaries. Failed with: notMember " + Lich.VM.PrettyPrint(item) 
			+ " " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("notMember", notMember);

function replicate(number, item)
{
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

_createPrimitive("replicate", replicate);

function cycle(number, item)
{
	if(typeof number === "number")
	{
		var res = [];

		for(var i = 0; i < number; ++i)
		{
			res = res.concat(item);
		}

		return res;
	}

	else
	{
		throw new Error("cycle must be used like: cycle number value. Failed with: cycle " + Lich.VM.PrettyPrint(number) 
			+ " " + Lich.VM.PrettyPrint(item));	
	}
}

_createPrimitive("cycle", cycle);

function flatten(container)
{
	var res = [];

	for(var i = 0; i < container.length; ++i)
	{
		res = res.concat(container[i]);
	}

	return res;
}

_createPrimitive("flatten", flatten);

function reverse(container)
{
	if((container instanceof Array) || (typeof container === "string"))
	{
		if(container.length == 0)
		{
			return [];
		}

		else
		{
			var res = new Array();

			for(var i = container.length -1; i >= 0; --i)
			{
				res.push(container[i]);
			}

			if(typeof container === "string")
				res = res.join("");

			return res;
		}
	}

	else
	{
		throw new Error("reverse can only be applied to lists. Failed with: reverse " + Lich.VM.PrettyPrint(container));	
	}
}

_createPrimitive("reverse", reverse);

function sort(container)
{
	container = _deepCopy(container);

	if(container instanceof Array)
	{
		return container.sort(function(a,b){return a - b;});
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

_createPrimitive("sort", sort);

function slice(lower, upper, container)
{
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

_createPrimitive("slice", slice);

function randF(lower, upper)
{
	if(typeof lower === "number" && typeof upper === "number")
	{
		return Math.random() * (upper - lower) + lower;
	}

	else
	{
		throw new Error("randF can only be applied to numbers. Failed with: randF " + Lich.VM.PrettyPrint(lower) + " " + Lich.VM.PrettyPrint(upper));	
	}
}

rand = randF;
random = randF;
_createPrimitive("rand", rand);
_createPrimitive("randF", randF);
_createPrimitive("random", random);

function exprand(lower, upper)
{
	if(upper < lower)
	{
		var temp = lower;
		lower = upper;
		upper = temp;
	}

	return lower * Math.exp(Math.log(upper/lower) * Math.random());
}

exprandom = exprand;

function randI(lower, upper)
{
	if(typeof lower === "number" && typeof upper === "number")
	{
		return Math.floor(Math.random() * (upper - lower) + lower);
	}

	else
	{
		throw new Error("randF can only be applied to numbers. Failed with: randI " + Lich.VM.PrettyPrint(lower) + " " + Lich.VM.PrettyPrint(upper));	
	}
}

randomI = randI;
_createPrimitive("randI", randI);
_createPrimitive("randomI", randomI);

function choose(list)
{
	return list[Math.round(Math.random() * (list.length - 1))];
}

_createPrimitive("choose", choose);

floor = Math.floor;
_createPrimitive("floor", floor);
round = Math.round;
_createPrimitive("round", round);
ceil = Math.ceil;
_createPrimitive("ceil", ceil);
max = Math.max;
_createPrimitive("max", max);
min = Math.min;
_createPrimitive("min", min);
abs = Math.abs;
_createPrimitive("abs", abs);

function odd(num)
{
	if(typeof num === "number")
	{
		if(num < 0)
			num = -num;

		return (num % 2) == 1;		
	}

	else
	{
		throw new Error("odd can only be applied to numbers. Failed with: odd " + Lich.VM.PrettyPrint(num));	
	}
}

_createPrimitive("odd", odd);

function even(num)
{
	if(typeof num === "number")
	{
		if(num < 0)
			num = -num;

		return (num % 2) == 0;
	}

	else
	{
		throw new Error("even can only be applied to numbers. Failed with: even " + Lich.VM.PrettyPrint(num));	
	}
}

_createPrimitive("even", even);

function sqrt(num)
{
	if(typeof num === "number")
	{
		return Math.sqrt(num);	
	}

	else
	{
		throw new Error("sqrt can only be applied to numbers. Failed with: sqrt " + Lich.VM.PrettyPrint(num));	
	}
}

_createPrimitive("sqrt", sqrt);

function show(object)
{
	return Lich.VM.PrettyPrint(object);
}

_createPrimitive("show", show);

function getCurrentTime()
{
	return new Date().getTime();
}

_createPrimitive("getCurrentTime", getCurrentTime);

function _streamRight(exp1, exp2)
{
	return Lich.application(exp2, [exp1]);
}

_createPrimitive(">>", _streamRight, "_streamRight");

function _streamLeft(l,r)
{
	return Lich.application(l, [r]);
}

_createPrimitive("<<", _streamLeft, "_streamLeft");

function _bitShiftRight(l,r)
{
	_checkNumOpError(l, ".>>", r);
	return l >> r;
}

_createPrimitive(".>>", _bitShiftRight, "_bitShiftRight");

function _bitShiftLeft(l,r)
{
	_checkNumOpError(l, ".<<", r);
	return l << r;
}

_createPrimitive(".<<", _bitShiftLeft, "_bitShiftLeft");

function _bitOr(l,r)
{
	_checkNumOpError(l, ".|", r);
	return l | r;
}

_createPrimitive(".|", _bitOr, "_bitOr");


function _bitAnd(l,r)
{
	_checkNumOpError(l, ".&", r);
	return l & r;
}

_createPrimitive(".&", _bitAnd, "_bitAnd");

function apply(func, args)
{
	return func.curry.apply(func, args);
}

_createPrimitive("apply", apply);

primes = [
	2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 
	163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 
	347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 
	541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 
	739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 
	953, 967, 971, 977, 983, 991, 997
];

function typeOf(object)
{
	if(object == null || typeof object === "undefined")
		return NothingT; // undefined == Nothing
	else if(object._lichType == DATA)
		return object._datatype;
	else if(typeof object === "string")
		return StringT;
	else if(typeof object === "number")
		return NumberT;
	else if(object instanceof Array)
		return ListT;
	else if(typeof object === "function")
		return FunctionT;
	else if(object._lichType == DICTIONARY)
		return DictionaryT;
	else if (object._lichType == ACTOR)
		return ActorT;
	else if(object == Lich.VM.Nothing)
		return NothingT;
	else if(object._lichType == Lich.VM.Nothing)
		return NothingT;
	else
		return UnknownT;
}

_createPrimitive("typeOf", typeOf);

// Constants
pi = Math.PI;
_createPrimitive("pi", pi);

function setTempo(bpm)
{
	Lich.scheduler.setTempo(bpm);
	return Lich.VM.Void;
}

_createPrimitive("setTempo", setTempo);

function _wrap(value, lo, hi)
{
	var range;
	if (value >= hi) 
    {
    	range = hi - lo;
    	value -= range;
    	if (value < hi) return value;
    } 

    else if (value < lo) 
    {
    	range = hi - lo;
        value += range;
        if (value >= lo) return value;
    } 

    else 
    	return value;

    if (hi == lo) 
    	return lo;
    
 	return value - range*Math.floor((value - lo)/range);
}

function wrapRange(lo, hi, value)
{
	return _wrap(value, lo, hi);
}

function foldRange(lo, hi, value)
{
	return Soliton._fold(value, lo, hi);
}

function _mod(value, lo, hi)
{
	if (value >= hi) 
    {
    	value -= hi;
    	if (value < hi) return value;
    } 

    else if (value < lo) 
    {
        value += hi;
        if (value >= lo) return value;
    } 

    else 
    	return value;

    if (hi == lo) 
    	return lo;
    
 	return value - hi*Math.floor(value/hi);
}

function _wrapAt(index, list)
{
	index = Math.floor(index);
	return list[_mod(index, 0, list.length)];
}

function shuffle(list)
{
	var v = _deepCopy(list);
    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
};

function degree2Freq(scale, degree)
{
	if(scale._datatype != "Scale")
		throw new Error("degree2Freq can only be used with Scale data objects.");

	var octave = Math.pow(2, Math.floor(degree / scale.degrees.length));
	return scale.tuning[_wrapAt(degree, scale.degrees)] * octave * scale.rootFreq;
}

_createPrimitive("degree2Freq", degree2Freq);

function initGraphics()
{
	CloudChamber.setup(document.getElementById("canvas"), 24, undefined, Lich.post); // Create the CloudChamber instance

	(function animloop(time){
		requestAnimFrame(animloop);
		CloudChamber.draw(time);
	})();
}

_createPrimitive("initGraphics", initGraphics);

Result=function(a,s){return {_lichType:DATA,_datatype:"Result",_argNames:["a","s"],a:a,s:s}}
State=function(a){return {_lichType:DATA,_datatype:"State",_argNames:["a"],a:a}}

function runState(_State0, b) {
    var f;
    if (Lich.dataMatch(_State0, "State")) {
        f = _State0.a;
    } else {
        throw new Error("Monadic function argument does not match State pattern. Failed with: " + Lich.VM.PrettyPrint(_State0))
    };
    return Lich.application(f, [b])
};

_createPrimitive("runState", runState);

// bind (State h) f = State (\s -> let res = h s in (f res::a) res::s)
function bind(_State0, f) {
    var h;
    if (Lich.dataMatch(_State0, "State")) {
        h = _State0.a;
    } else {
        throw new Error("Monadic function argument does not match State pattern. Failed with: " + Lich.VM.PrettyPrint(_State0));
    };
    return Lich.application(State, [(function (s) {
            var res = Lich.application(h, [s]);
            return (Lich.application(runState, [(Lich.application(f, [res.a])), res.s]))
    })]);
};

//CREATE_PRIMITIVE = _createPrimitive;
//_createPrimitive("CREATE_PRIMITIVE", CREATE_PRIMITIVE);
_createPrimitive("bind", bind);
_createPrimitive(">>=", bind, "bind");


function error(s)
{
	throw new Error(s);
}

// This should probably be moved out of Prelude and into a personal library file
sampleList = new Array(
	 "Airport",
	 "Atmospheres",
	 "Banya1",
	 "Banya2",
	 "BanyaSlap",
	 "BassNogoro",
	 "Bonang",
	 "BurntUmberLogic",
	 "Caxixi",
	 "China",
	 "Clap",
	 "cluster",
	 "Cosmic-Peel",
	 "Crawling_Chaos",
	 "Curtis_mix",
	 "DanceCadaverous",
	 "DarkGuitar",
	 "eight_energon_cubes_SLASH_a_stone_among_stones_and_the_dead_among_the_dead",
	 "FeldmanSQ2",
	 "Feral_Christmas_Rooster_-_Merry_Christmas_From_the_Dragons_Lair_-_01_Santa_Claus_is_Comin_to_Town",
	 "Feral_Christmas_Rooster_-_Merry_Christmas_From_the_Dragons_Lair_-_02_Rudolph_the_Red-nosed_Reindeer",
	 "Feral_Christmas_Rooster_-_Merry_Christmas_From_the_Dragons_Lair_-_03_Twas_The_Night_Before_Christmas",
	 "Feral_Christmas_Rooster_-_Merry_Christmas_From_the_Dragons_Lair_-_04_Jingle_Bell_Rock",
	 "Feral_Christmas_Rooster_-_Merry_Christmas_From_the_Dragons_Lair_-_05_White_Christmas",
	 "Feral_Christmas_Rooster_-_Merry_Christmas_From_the_Dragons_Lair_-_06_Silent_Night",
	 "Feral_Christmas_Rooster_-_Merry_Christmas_From_the_Dragons_Lair_-_07_Don't_Even_Look_At_It",
	 "Flam",
	 "Foetid_Tunnels_ambient",
	 "GreaterThanThree",
	 "hallway",
	 "HarpSoundBox",
	 "Hip_trop",
	 "Hydrogen_Atom_Living_with_Necromancer",
	 "Insects_and_Plant_Monsters_demo_1",
	 "Ionisation",
	 "It_Came_From_The_Deep(With_Good_Chorus)",
	 "Ketuk",
	 "Killing_Music_(second_mix)",
	 "Lanquidity",
	 "Lost_To_Time",
	 "Massacre_at_High_Noon_DEMO",
	 "Merzcord",
	 "Micron_Atlantis_Aurochs_Ceil_Chrysolite_Birdseed",
	 "Military_dungeon_base",
	 "MomentTrio",
	 "monkdrone",
	 "Monster",
	 "myla_audio",
	 "MyoBat",
	 "Name_Randomly_Generated_Grad_Portfolio_Final",
	 "Nano_Mi_dungeon_01",
	 "Newspaper",
	 "Nyogtha_-_Summoning_and_Arrival",
	 "Octopodae_Vulgaris_(Third_Mixdown)",
	 "Organism2",
	 "Pranzo",
	 "Rlyeh_Grad_Portfolio_Final",
	 "Safezone_4",
	 "SilverBat",
	 "Sleep_Music_02",
	 "SlendroLow5",
	 "Sonnerie",
	 "ss4",
	 "Stochastic",
	 "The_Sea_(second_Mixdown)_mp3",
	 "ThitherAndYon",
	 "Track_No08",
	 "Turangalila",
	 "Turtle_Shells_and_Cloud_Hopping_Beta_1",
	 "Underground",
	 "Ushi_Oni_vs._Karee_Koumori-_the_Demon_Attacks_normalized",
	 "Vampire_of_the_Sun_section2(faster)",
	 "YigSerpent",
	 "Yog-Sothoth,_The_Key_and_The_Gate_(mp3)",
	 "01_Dracula_II_the_Seal_of_the_Curse",
	 "02_ia_ia",
	 "03_Oh_Dae_Su",
	 "04_Unicron,_Swirling,_Inifinite_Torrent_Of_Nothingness__At_The_End_Of_All_Things,_Divided_To_Create_Primus,__Progenitor_Of_The_Transformers",
	 "05_Eternal_Hyper_Ooze_of_the_Aeons",
	 "06_Elk_Clone",
	 "Zither",
	 "Aloke1",
	"Aloke2",
	"Aloke3",
	"Aloke4",
	"Aloke5",
	"Aloke6",
	"Aloke7",
	"Aloke8",
	"Aloke9",
	"Bartok1",
	"Bartok2",
	"Bartok3",
	"Bartok4",
	"Berg1",
	"Berg2",
	"Berg3",
	"Berg4",
	"Berg5",
	"Berg6",
	"Berg7",
	"Dillinger1",
	"Dillinger2",
	"Dillinger3",
	"Dillinger4",
	"Dillinger5",
	"Dillinger6",
	"Dillinger7",
	"Dillinger8",
	"Dillinger9",
	"Dillinger10",
	"Dillinger11",
	"Dillinger12",
	"Fantomas1",
	"Fantomas2",
	"Fantomas3",
	"Fantomas4",
	"Fantomas5",
	"Fantomas6",
	"Fantomas7",
	"Fantomas8",
	"Fantomas9",
	"Fantomas10",
	"Fantomas11",
	"Fantomas12",
	"Fantomas13",
	"Fantomas14",
	"Fantomas15",
	"Fantomas16",
	"Feldman1",
	"Feldman2",
	"Feldman3",
	"Feldman4",
	"Feldman5",
	"Hella1",
	"Hella2",
	"Hella3",
	"Ligoti1",
	"Ligoti2",
	"Ligoti3",
	"Ligoti4",
	"Ligoti5",
	"Melvins1",
	"Melvins2",
	"Melvins3",
	"Melvins4",
	"Melvins5",
	"Melvins6",
	"MoonChild1",
	"MoonChild2",
	"MoonChild3",
	"MoonChild4",
	"MoonChild5",
	"MoonChild6",
	"MoonChild7",
	"Peres1",
	"Peres2",
	"Peres3",
	"Ra1",
	"Ra2",
	"Ra3",
	"Varese1",
	"Varese2",
	"Varese3",
	"Varese4",
	"Varese5"
);

irList = [
	"5UnderpassValencia",
"3000CStreetGarageStairwell",
"AcademicQuadrangle",
"Avenue52UnderpassLARiver",
"Avenue60UnderpassLARiver",
"Batcave",
"BatteryBenson",
"BatteryBrannan",
"BatteryPowell",
"BatteryQuarles",
"BatteryRandol",
"BatteryTolles",
"BiomedicalSciences",
"ByronGlacier",
"CaribooRdUnderGaglardiWay",
"CarpenterCenter",
"CathedralRoom",
"CCRMAStairwell",
"CedarCreekWinery",
"CleftRidgeArch",
"Commerical&5Underpass",
"ConradPrebysConcertHallSeatF111",
"ConventionCenterSteps",
"ConvocationMall",
"CPMC264",
"CPMCNorthStairwell",
"DevilsPunchbowl",
"DipwayArch",
"DiscoveryRoom",
"DrainageTunnel",
"ExerciseAndNutritionSciences",
"FatMansMisery",
"FatMansSqueeze",
"FishCreekTrestleBridge",
"FortWordenPillbox",
"FortWordenTunnel",
"FourPointsRoom270",
"FremontTroll",
"GalbraithHall",
"GeiselLibrary",
"GraffitiHallway",
"HaleHolisticYogaStudio",
"HarborEntranceControlPost",
"HartwellTavern",
"Hawxhurst",
"HepnerHall",
"HopkinsDriveUnderpass",
"HumanitiesSocialSciencesCourtyard",
"LawrenceWelkCave",
"LionsGateBridge",
"LoveLibrary",
"NancyLakeTunnel",
"Natatorium",
"NaturalSciences",
"NaumburgBandshell",
"OldSouthBridge",
"OutbackClimbingCenter",
"PabstBrewery",
"PacificHall",
"PepperCanyonHall",
"PortageCreekTunnel",
"PortTownsendSkatepark",
"PurgatoryChasm",
"Qasgiq",
"QuadracciPavilion",
"RacquetballCourt",
"RedBridge",
"RiverMountainsLoopTrailAqueduct",
"SanDiegoSupercomputerCenter",
"SewardWaterfrontPark",
"Space4ArtGallery",
"StanleyParkCauseway",
"StanleyParkCliffs",
"StanleyParkDriveUnderpass",
"SteinmanFoundationRecordingSuite",
"SteinmanHall",
"StorageTankNo7",
"SwitzerStUnderEHarborDr",
"TelephoneWash",
"TijuanaAqueductTunnel",
"TijuanaMall",
"TonyKnowlesCoastalTrailTunnel",
"TransitCenter",
"TunnelToHeaven",
"TunnelToHell",
"WalkwayUnderECampusDr",
"WangenheimRareBooksRoom",
"WarrenLectureHall2005",
"WaterplacePark",
"WoodruffLane",
]