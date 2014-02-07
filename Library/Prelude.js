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

function madnessIntro(_ret)
{
	_madnessIntro();
	//if(!(typeof str === "string"))
	//	throw new Error("netEval can only be applied to a string!");

	//broadcastNetEval(str);
	ret(Lich.VM.Void);
}

function netEval(s,ret)
{
	Lich.collapse(s, function(str)
	{
		if(!(typeof str === "string"))
			throw new Error("netEval can only be applied to a string!");

		broadcastNetEval(str);	
		ret(Lich.VM.Void);
	});
}

function evalLich(s,ret)
{
	Lich.collapse(s, function(str)
	{
		if(!(typeof str === "string"))
		throw new Error("eval can only be applied to a string!");
	
		try
	    {
	    	var ast = Lich.parse(str);
	        //Lich.VM.Print(L);
	        //return Lich.compileAST(ast);
	        Lich.compileAST(ast, function(res)
	        {	
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
	        });
	    }

	    catch(e)
	    {
			Lich.post(e);
			//ret(Lich.VM.Nothing);
		}
	});
}

function print(o, ret)
{
	Lich.collapse(o, function(object)
	{
		Lich.VM.Print(object);
		ret(Lich.VM.Void);
	});
}

function printAndReturn(l, r, ret)
{
	Lich.collapse(l, function(left)
	{
		Lich.collapse(r, function(right)
		{
			Lich.VM.Print(left);
			ret(right);
		});
	});
}

function lichClientName(ret)
{
	ret(clientName);
}

function lichUsers(ret)
{
	if(!(users instanceof Array))
		throw new Error("Users isn't an array!");

	console.log(users);
	Lich.VM.PrettyPrint(users.map(function(elem){return elem.name}));
	ret(users.map(function(elem){return elem.name}));
}

function stateSync(s,ret)
{
	Lich.collapse(s, function(state)
	{
		sendStateSync(state);
		ret(Lich.VM.Void);
	});
}

function compile(l,ret)
{
	Lich.collapse(l, function(libName)
	{
		if(!(typeof libName === "string"))
			throw new Error("compile can only be applied to a string!");

		compileLibClient(libName);
		//Lich.VM.modules.push(libName);
		ret(Lich.VM.Void);
	});
}

function load(f, ret)
{
	Lich.collapse(f, function(fileName)
	{
		if(!(typeof fileName === "string"))
			throw new Error("load can only be applied to a string!");

		askForFileFromServer(fileName);
		ret(Lich.VM.Void);
	});
}

function chat(c,ret)
{
	Lich.collapse(c, function(chatString)
	{
		if(!(typeof chatString === "string"))
			throw new Error("chat can only be applied to strings!");

		sendChat(chatString);
		ret(Lich.VM.Void);
	});
}

function postNarration(c, ret)
{
	Lich.collapse(c, function(chatString)
	{
		if(!(typeof chatString === "string"))
			throw new Error("postNarration can only be applied to strings!");

		updateNarration(chatString);
		ret(Lich.VM.Void);
	});
}

function importjs(fileName)
{
	Lich.collapse(fileName,function(_fileName)
	{
		if(Lich.VM.currentThread === "main")
		{
			var script = document.createElement("script")
		    script.type = "text/javascript";

		    script.onload = function()
		    {
		        Lich.post("Done importing " + _fileName);
		    };

		    script.src = "http://"+ self.location.hostname + "/" + _fileName;
		    document.getElementsByTagName("head")[0].appendChild(script);	
		}
			
		else
		{
			try{
				importScripts("../"+_fileName);
				/*
				var oRequest = new XMLHttpRequest();
				var sURL = "http://"
				         + self.location.hostname
				         + _fileName;

				oRequest.open("GET",sURL,false);
				//oRequest.setRequestHeader("User-Agent",navigator.userAgent);
				oRequest.send(null)

				if(oRequest.status == 200)
				{
					eval(oRequest.responseText);
					Lich.post("Done importing " + _fileName);
				}
				
				else 
				{
					Lich.post("Unable to load js file " + _fileName);
				}*/
			}

			catch(e)
			{
				Lich.post(e);
			}
		}
	});
}

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

function evalInMainThread(f, a, ret)
{
	Lich.collapse(f, function(func)
	{
		Lich.collapse(a, function(args)
		{
			var funcAndArgs = _extractFunctionAndArgs(func); // Uncurry the function and collect the curried arguments.
			var funcString = funcAndArgs[0].toString(); // Translate the function to a string representation.

			self.postMessage({
				evaluate:true,
				func: "((function(){return " + funcString + "})())",
				args: Lich.stringify(args.concat(funcAndArgs[1]))
			});
		});
	});
}

function actorChat(c,ret)
{
	Lich.collapse(c, function(chatString)
	{
		if(!(typeof chatString === "string"))
			throw new Error("chat can only be applied to strings!");

		_evalInMainThread("sendChat", [chatString]);
		ret(Lich.VM.Void);
	});
}

function spawn(n, c, a, ret)
{
	Lich.collapse(n, function(name)
	{
		Lich.collapse(c, function(closure)
		{
			Lich.collapse(a, function(args)
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

				Lich.VM.actorSupervisor.registerActor(name, func, args, Lich.VM.currentThread, ret);
			}); // args
		}); // closure
	}); // name
}

function send(m, a, ret)
{
	Lich.collapse(m, function(msg)
	{
		if(typeof msg === "function")
			throw new Error("Can't send a function as a message to an actor.");

		Lich.collapse(a, function(actor)
		{
			if(actor._lichType != ACTOR && typeof actor !== "string")
				throw new Error("send can only be used as: send message actor. Failed with send " + Lich.VM.PrettyPrint(msg) 
					+ " " + Lich.VM.PrettyPrint(actor));

			if(actor._lichType == ACTOR)
				actor.postMessage({type: "msg", message: Lich.stringify(msg)});
			else
				Lich.VM.actorSupervisor.sendActor(actor, {type: "msg", message: Lich.stringify(msg)}, Lich.VM.currentThread);
			
			ret(actor);
		});
	});
}
_createPrimitive(":>>", send);

function numArgs(f,ret)
{
	Lich.collapse(f, function(func)
	{
		if(typeof func !== "function")
			throw new Error("numArgs can only be used with functions.")

		ret(func.length);
	});
}

function add(l, r, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			if(resL._lichType == AUDIO || resR._lichType == AUDIO)
				return mix2(l,r, ret);

			_checkNumStringOpError(resL, "+", resR);
			ret(resL + resR);
		});
	});
}

_createPrimitive("+", add);

function minus(l, r, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			if(resL._lichType == AUDIO || resR._lichType == AUDIO)
				return _subtractMix(l,r, ret);
			
			_checkNumOpError(resL, "-", resR);
			ret(resL - resR);
		});
	});
}

_createPrimitive("-", minus);

function subtract(r, l, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			_checkNumOpError(resL, "-", resR);
			ret(resL - resR);
		});
	});
}

function mul(l, r, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			if(resL._lichType == AUDIO || resR._lichType == AUDIO)
				return gain(l,r, ret);

			_checkNumOpError(resL, "*", resR);
			ret(resL * resR);
		});
	});
}

_createPrimitive("*", mul);

function div(l, r, ret)
{	
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			if(resL._lichType == AUDIO || resR._lichType == AUDIO)
				return _audioDivision(l,r, ret);

			_checkNumOpError(resL, "/", resR);
			ret(resL / resR);
		});
	});
}

_createPrimitive("/", div);

function pow(l, r, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			_checkNumOpError(resL, "^", resR);
			ret(Math.pow(resL,resR));
		});
	});
}

_createPrimitive("^", pow);
_createPrimitive("**", pow);
_createPrimitive("pow", pow);

function mod(l, r, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			_checkNumOpError(resL, "%", resR);
			ret(resL % resR);
		});
	});
}

_createPrimitive("%", mod);

function nsin(v, ret)
{
	Lich.collapse(v, function(value)
	{
		ret(Math.sin(v));
	})
}

function linlin(value, inMin, inMax, outMin, outMax, ret)
{
    if(value <= inMin)
		ret(outMin);
	else if(value >= inMax)
		ret(outMax);
    else
        ret(((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin);
}

function explin(value, inMin, inMax, outMin, outMax, ret)
{
    if(value <= inMin)
		ret(outMin);
	else if(value >= inMax)
		ret(outMax);
    else
        ret((Math.log(value / inMin) / Math.log(inMax / inMin)) * (outMax - outMin) + outMin);
}

function expexp(value, inMin, inMax, outMin, outMax, ret)
{
    if(value <= inMin)
		ret(outMin);
	else if(value >= inMax)
		ret(outMax);
    else
        ret(Math.pow(outMax/outMin, Math.log(value/inMin) / Math.log(inMax/inMin)) * outMin);
}

// Map a number from a linear range to an exponential range
function linexp(val, inMin, inMax, outMin, outMax, ret)
{
	if(val <= inMin)
		ret(outMin);
	else if(val >= inMax)
		ret(outMax);
	else
		ret(Math.pow(outMax / outMin, (val - inMin) / (inMax - inMin)) * outMin);
}

function _equivalent(l, r, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			if(Lich.getType(resL) == DATA && Lich.getType(resR) == DATA)
				ret(resL._datatype == resR._datatype);
			else
				ret(resL === resR);
		});
	});
}

_createPrimitive("==", _equivalent);


function _notequivalent(l, r, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			if(Lich.getType(resL) == DATA && Lich.getType(resR) == DATA)
				ret(resL._datatype != resR._datatype);
			else
				ret(resL !== resR);
		});
	});
}

_createPrimitive("/=", _notequivalent);

function _greater(l, r, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			_checkNumOpError(resL, ">", resR);
			ret(resL > resR);
		});
	});
}

_createPrimitive(">", _greater);

function _lesser(l, r, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			_checkNumOpError(resL, "<", resR);
			ret(resL < resR);
		});
	});
}

_createPrimitive("<", _lesser);

function _greaterEqual(l, r, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			_checkNumOpError(resL, ">=", resR);
			ret(resL >= resR);
		});
	});
}

_createPrimitive(">=", _greaterEqual);

function _lesserEqual(l, r, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			_checkNumOpError(resL, "<=", resR);
			ret(resL <= resR);
		});
	});
}

_createPrimitive("<=", _lesserEqual);

function _andand(l, r, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			if(typeof resL !== "boolean" || typeof resR !== "boolean")
				throw new Error("Cannot use && operator with: " + Lich.VM.PrettyPrint(l) + " && " + Lich.VM.PrettyPrint(r));

			ret(resL && resR);
		});
	});
}

_createPrimitive("&&", _andand);

function _oror(l, r, ret)
{
	Lich.collapse(l, function(resL)
	{
		Lich.collapse(r, function(resR)
		{
			if(typeof resL !== "boolean" || typeof resR !== "boolean")
				throw new Error("Cannot use && operator with: " + Lich.VM.PrettyPrint(l) + " || " + Lich.VM.PrettyPrint(r));

			ret(resL || resR);
		});
	});
}

_createPrimitive("||", _oror);

function not(bool, ret)
{
	Lich.collapse(bool, function(boolRes)
	{
		if(typeof boolRes !== "boolean")
			throw new Error("The 'not' function can only be applied to booleans. Cannot use 'not' with: " + Lich.VM.PrettyPrint(bool));

		ret(!boolRes);
	});
}

_createPrimitive("not", not);

function lookup(k,l, ret)
{
	Lich.collapse(k, function(key)
	{
		Lich.collapse(l, function(list)
		{
			if(!((list instanceof Array) || (list._lichType == DICTIONARY)))
				throw new Error("indexing via !! or lookup can only be applied to lists and dictionaries as: lookup key container or: container !! "
					+"key. Failed with: lookup " + Lich.VM.PrettyPrint(key) + " " + Lich.VM.PrettyPrint(list));

			//var res = list[key];
			Lich.collapse(list[key], function(res)
			{
				ret(typeof res === "undefined" ? Lich.VM.Nothing : res);
			});
		});
	});
}

_createPrimitive("!!", function(l,k,r){lookup(k,l,r)});
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

function map(f, c, ret)
{
	Lich.collapse(f, function(func)
	{
		Lich.collapse(c, function(container)
		{

	if(typeof func !== "function")
		throw new Error("map can only be applied using: map function container. Failed with: map " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(container));

	if((container instanceof Array) || (typeof container === "string"))
	{	
		var res = new Array();
		forEachCps(
			container,
			function(exp, i, next)
			{
				Lich.collapse(exp, function(collapsedExp)
				{
					Lich.collapse(func.curry(collapsedExp), function(collapsedValue)
					{
						res.push(collapsedValue);
						next();
					});
				});
			},

			function()
			{
				if(typeof container === "string")
					res = res.join("");

				ret(res);
			}
		);
	}

	else if(container._lichType == DICTIONARY)
	{
		var res = {};
		forEachDictCps(
			container,
			function(n, i, next)
			{
				Lich.collapse(container[n], function(collapsedExp)
				{
					Lich.collapse(func.curry(collapsedExp), function(collapsedValue)
					{
						res[n] = collapsedValue;
						next();
					});
				});
			},

			function()
			{
				res._lichType = DICTIONARY;
				ret(res);
			}
		);
	}

	else
	{
		throw new Error("map can only be applied to lists and dictionaries. Failed with: map " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(container));	
	}
		}); // container 
	}); // func
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


function cons(v, l, ret)
{
	Lich.collapse(v, function(value)
	{
		Lich.collapse(l, function(list)
		{
			if(!(list instanceof Array || typeof list === "string" || list._lichType == DICTIONARY))
				throw new Error("Cons can only be applied to lists and dictionaries. Failed with: cons " + Lich.VM.PrettyPrint(value) 
					+ " " + Lich.VM.PrettyPrint(list));

			var res;

			if(value instanceof Array && list instanceof Array 
				|| typeof value === "string" && typeof list === "string")
				res = value.concat(list);
			else if(list._lichType == DICTIONARY)
				res = _mergeDictionaries(list, value);
			else
				res = [value].concat(list);

			ret(typeof res === "undefined" ? Lich.VM.Nothing : res);
		}); // list
	}); // value
}

_createPrimitive(":", cons);


function insert(v, c, ret)
{
	Lich.collapse(v, function(value)
	{
		Lich.collapse(c, function(list)
		{
			if(!((list._lichType == DICTIONARY) && (value._lichType == DICTIONARY)))
				throw new Error("insert can only be applied to dictionaries. Failed with: insert " + Lich.VM.PrettyPrint(value) 
					+ " " + Lich.VM.PrettyPrint(list));

			var res = _mergeDictionaries(list, value);
			ret(typeof res === "undefined" ? Lich.VM.Nothing : res);
		});
	});
}

function deleteEntry(v, d, ret)
{
	Lich.collapse(v, function(value)
	{
		Lich.collapse(d, function(dict)
		{
			if(!(dict._lichType == DICTIONARY))
				throw new Error("delete can only be applied to lists. Failed with: delete " + Lich.VM.PrettyPrint(value) + " " + Lich.VM.PrettyPrint(dict));

			var newDict = _deepCopy(dict);
			delete newDict[value];
			ret(newDict);
		});
	});
}

del = deleteEntry;
remove = deleteEntry;

function concatList(l,v,ret)
{
	Lich.collapse(l, function(list)
	{
		Lich.collapse(v, function(value)
		{
			if(!(list instanceof Array || typeof list === "string"))
				throw new Error("Concat can only be applied to lists. Failed with: " + Lich.VM.PrettyPrint(list) + " ++ " + Lich.VM.PrettyPrint(value));

			// list = _deepCopy(list);
			var res = list.concat(value);

			ret(typeof res === "undefined" ? Lich.VM.Nothing : res);
		});
	});
}

_createPrimitive("++", concatList);

function experiential(l,r,ret)
{
	Lich.collapse(l, function(left)
	{
		Lich.collapse(r,function(right)
		{
			if(Lich.getType(left) == NOTHING)
				ret(right);
			else
				ret(left);
		})
	})
}

_createPrimitive("?", experiential);

function foldl(f, i, c, ret)
{
	Lich.collapse(f, function(func)
	{
		Lich.collapse(i, function(initialValue)
		{
			Lich.collapse(c, function(container)
			{

	if(typeof func !== "function")
		throw new Error("foldl can only be applied using: foldl function container. Failed with: foldr " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(initialValue) + " " + Lich.VM.PrettyPrint(container));

	var res = initialValue;

	if((container instanceof Array) || (typeof container === "string"))
	{
		forEachCps(
			container,
			function(exp, i, next)
			{
				Lich.collapse(exp, function(collapsedExp)
				{
					Lich.collapse(func.curry(res, collapsedExp), function(expRes)
					{
						res = expRes;
						next();
					});
				});	
			},
			function()
			{
				ret(res);
			}
		);
	}

	else if(container._lichType == DICTIONARY)
	{
		forEachDictCps(
			container,
			function(n, i, next)
			{
				Lich.collapse(container[n], function(collapsedExp)
				{
					Lich.collapse(func.curry(res, collapsedExp), function(expRes)
					{
						res = expRes;
						next();
					});
				});	
			},

			function()
			{
				res._lichType = DICTIONARY;
				ret(res)
			}
		);
	}

	else
	{
		throw new Error("foldl can only be applied to lists and dictionaries. Failed with: foldl " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(initialValue) + " " + Lich.VM.PrettyPrint(container));	
	}
			}); // container
		}); // initialValue
	}); // function
}

function foldr(f, i, c, ret)
{
	Lich.collapse(f, function(func)
	{
		Lich.collapse(i, function(initialValue)
		{
			Lich.collapse(c, function(container)
			{

	if(typeof func !== "function")
		throw new Error("foldl can only be applied using: foldl function container. Failed with: foldr " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(initialValue) + " " + Lich.VM.PrettyPrint(container));

	var res = initialValue;

	if((container instanceof Array) || (typeof container === "string"))
	{		
		forEachReverseCps(
			container,
			function(exp, i, next)
			{
				Lich.collapse(exp, function(collapsedExp)
				{
					Lich.collapse(func.curry(collapsedExp, res), function(expRes)
					{
						res = expRes;
						next();
					});
				});	
			},
			function()
			{
				ret(res);
			}
		);
	}

	else if(container._lichType == DICTIONARY)
	{
		forEachDictReverseCps(
			container,
			function(n, i, next)
			{
				Lich.collapse(container[n], function(collapsedExp)
				{
					Lich.collapse(func.curry(collapsedExp, res), function(expRes)
					{
						res = expRes;
						next();
					});
				});	
			},

			function()
			{
				res._lichType = DICTIONARY;
				ret(res)
			}
		);
	}

	else
	{
		throw new Error("foldr can only be applied to lists and dictionaries. Failed with: foldr " + Lich.VM.PrettyPrint(func) 
			+ " " + Lich.VM.PrettyPrint(initialValue) + " " + Lich.VM.PrettyPrint(container));	
	}
			}); // container
		}); // initialValue
	}); // function
}

function zip(l,r,ret)
{
	Lich.collapse(l, function(lcontainer)
	{
		Lich.collapse(r, function(rcontainer)
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

			ret(res);
		});
	});
}

function zipWith(f,l,r,ret)
{	
	Lich.collapse(f, function(func)
	{
		Lich.collapse(l, function(lcontainer)
		{
			Lich.collapse(r, function(rcontainer)
			{
				var res = new Array();

				if((lcontainer instanceof Array) || (typeof lcontainer === "string")
					&& (rcontainer instanceof Array) || (typeof rcontainer === "string"))
				{
					var container;
					if(rcontainer.length < lcontainer.length)
						container = rcontainer;
					else
						container = lcontainer;

					forEachCps(
						container,
						function(elem, i, next)
						{
							Lich.collapse(func.curry(lcontainer[i],rcontainer[i]), function(collapsedRes)
							{
								res.push(collapsedRes);
								next();
							});
						},
						function()
						{
							ret(res);
						})
				}

				else
				{
					throw new Error("zipWith can only be applied to lists. Failed with: zipWith " + Lich.VM.PrettyPrint(func) 
						+ " " + Lich.VM.PrettyPrint(lcontainer) + " " + Lich.VM.PrettyPrint(rcontainer));	
				}
			}); // rcontainer
		}); // lcontainer
	}); // func
}

function filter(f, c, ret)
{
	Lich.collapse(f, function(func)
	{
		Lich.collapse(c, function(container)
		{
			if(typeof func !== "function")
				throw new Error("filter can only be applied using: filter function container. Failed with: filter " + Lich.VM.PrettyPrint(func) 
					+ " " + Lich.VM.PrettyPrint(container));

			if((container instanceof Array) || (typeof container === "string"))
			{
				var res = new Array();

				forEachCps(
					container,
					function(elem, i, next)
					{
						Lich.collapse(elem, function(collapsedExp)
						{
							Lich.collapse(func.curry(collapsedExp), function(bool)
							{
								if(bool)
									res.push(collapsedExp);
								next();
							});
						});
					},
					function()
					{
						if(typeof container === "string")
							res = res.join("");

						ret(res);	
					}
				);
			}

			else if(container._lichType == DICTIONARY)
			{
				var res = {};

				forEachDictCps(
					container,
					function(n, i, next)
					{
						Lich.collapse(container[n], function(collapsedExp)
						{
							Lich.collapse(func.curry(collapsedExp), function(bool)
							{
								if(bool)
									res[n] = collapsedExp;
								next();
							});
						});
					},
					function()
					{
						res._lichType = DICTIONARY;
						ret(res);	
					}
				);
			}

			else
			{
				throw new Error("map can only be applied to lists and dictionaries. Failed with: filter " + Lich.VM.PrettyPrint(func) 
					+ " " + Lich.VM.PrettyPrint(container));	
			}
		}); // container
	}); // function
}

function head(c, ret)
{
	Lich.collapse(c, function(container)
	{
		if((container instanceof Array) || (typeof container === "string"))
		{
			if(container.length == 0)
				ret(Lich.VM.Nothing);
			else
				ret(container[0]);
		}

		else
		{
			throw new Error("head can only be applied to lists. Failed with: head " + Lich.VM.PrettyPrint(container));	
		}
	});
}

function tail(c, ret)
{
	Lich.collapse(c, function(container)
	{
		if((container instanceof Array) || (typeof container === "string"))
		{
			if(container.length == 0)
				ret(Lich.VM.Nothing);
			else
				ret(container.slice(1, container.length));
		}

		else
		{
			throw new Error("tail can only be applied to lists. Failed with: tail " + Lich.VM.PrettyPrint(container));	
		}
	});
}

function init(c,ret)
{
	Lich.collapse(c, function(container)
	{
		if((container instanceof Array) || (typeof container === "string"))
		{
			if(container.length == 0)
				ret(Lich.VM.Nothing);
			else
				ret(container.slice(0, container.length - 1));
		}

		else
		{
			throw new Error("init can only be applied to lists. Failed with: init " + Lich.VM.PrettyPrint(container));	
		}
	});
}

function last(c, ret)
{
	Lich.collapse(c, function(container)
	{
		if((container instanceof Array) || (typeof container === "string"))
		{
			if(container.length == 0)
				ret(Lich.VM.Nothing);
			else
				ret(container[container.length - 1]);
		}

		else
		{
			throw new Error("last can only be applied to lists. Failed with: last " + Lich.VM.PrettyPrint(container));	
		}
	});
}

function sum(c, ret)
{
	Lich.collapse(c, function(container)
	{
		if(container instanceof Array)
		{
			if(container.length == 0)
			{
				ret(0);
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

				ret(res);
			}
		}

		else
		{
			throw new Error("sum can only be applied to lists. Failed with: sum " + Lich.VM.PrettyPrint(container));	
		}
	});
}

function take(n,c,ret)
{
	Lich.collapse(n, function(num)
	{
		Lich.collapse(c, function(container)
		{
			if(((container instanceof Array) || (typeof container === "string")) && (typeof num === "number"))
			{
				if(container.length == 0)
				{
					ret([]);
				}

				else
				{
					ret(container.slice(0, num));
				}
			}

			else
			{
				throw new Error("take can only be applied to lists. Failed with: take " + Lich.VM.PrettyPrint(num) + " " + Lich.VM.PrettyPrint(container));	
			}
		});
	});
}

function drop(n, c, ret)
{
	Lich.collapse(n, function(num)
	{
		Lich.collapse(c, function(container)
		{
			if(((container instanceof Array) || (typeof container === "string")) && (typeof num === "number"))
			{
				if(container.length == 0)
				{
					ret(container);
				}

				else
				{
					ret(container.slice(num, container.length));
				}
			}

			else
			{
				throw new Error("drop can only be applied to lists. Failed with: drop " + Lich.VM.PrettyPrint(num) + " " + Lich.VM.PrettyPrint(container));	
			}
		});
	});
}

function length(c, ret)
{
	Lich.collapse(c, function(container)
	{
		if((container instanceof Array) || (typeof container === "string"))
		{
			ret(container.length);
		}

		if(Lich.getType(container) == DICTIONARY)
		{
			var size = 0, key;
			    
			for (key in container) {
			    if(container.hasOwnProperty(key) && key !== "_lichType") size++;
			}

			ret(size);
		}

		else
		{
			throw new Error("length can only be applied to lists. Failed with: length " + Lich.VM.PrettyPrint(container));	
		}
	});
}

function isNullList(l,ret)
{
	Lich.collapse(l, function(container)
	{
		if((container instanceof Array) || (typeof container === "string"))
		{
			ret(container.length == 0);
		}

		else
		{
			throw new Error("null can only be applied to lists. Failed with: null " + Lich.VM.PrettyPrint(container));	
		}
	});
}

function maximum(c,ret)
{
	Lich.collapse(c, function(container)
	{
		if((container instanceof Array) || (typeof container === "string"))
		{
			if(container.length == 0)
			{
				ret(Lich.VM.Nothing);
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

				ret(res);
			}
		}

		else
		{
			throw new Error("maximum can only be applied to lists. Failed with: maximum " + Lich.VM.PrettyPrint(container));	
		}
	});
}

function minimum(c, ret)
{
	Lich.collapse(c, function(container)
	{
		if((container instanceof Array) || (typeof container === "string"))
		{
			if(container.length == 0)
			{
				ret(Lich.VM.Nothing);
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

				ret(res);
			}
		}

		else
		{
			throw new Error("minimum can only be applied to lists. Failed with: minimum " + Lich.VM.PrettyPrint(container));	
		}
	});
}

function product(c, ret)
{
	Lich.collapse(c, function(container)
	{
		if(container instanceof Array)
		{
			if(container.length == 0)
			{
				ret(0);
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

				ret(res);
			}
		}

		else
		{
			throw new Error("product can only be applied to lists. Failed with: product " + Lich.VM.PrettyPrint(container));	
		}
	});
}

function elem(i, c, ret)
{
	Lich.collapse(i, function(item)
	{
		Lich.collapse(c, function(container)
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

				ret(found);
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

				ret(found);
			}

			else
			{
				throw new Error("elem can only be applied to lists and dictionaries. Failed with: elem " + Lich.VM.PrettyPrint(item) 
					+ " " + Lich.VM.PrettyPrint(container));	
			}
		}); // container
	}); // item
}

function member(i, c, ret)
{
	Lich.collapse(i, function(item)
	{
		Lich.collapse(c, function(container)
		{
			if(container._lichType == DICTIONARY)
			{
				ret(container.hasOwnProperty(item));
			}

			else
			{
				throw new Error("member can only be applied to lists and dictionaries. Failed with: member " + Lich.VM.PrettyPrint(item) 
					+ " " + Lich.VM.PrettyPrint(container));	
			}
		});
	});
}

function notMember(i, c, ret)
{
	Lich.collapse(i, function(item)
	{
		Lich.collapse(c, function(container)
		{
			if(container._lichType == DICTIONARY)
			{
				ret(!container.hasOwnProperty(item));
			}

			else
			{
				throw new Error("notMember can only be applied to lists and dictionaries. Failed with: notMember " + Lich.VM.PrettyPrint(item) 
					+ " " + Lich.VM.PrettyPrint(container));	
			}
		});
	});
}

function replicate(_n, _i, _ret)
{
	Lich.collapse(_n, function(_number)
	{
		Lich.collapse(_i, function(_item)
		{
			if(typeof _number === "number")
			{
				var _res = new Array();

				for(var i = 0; i < _number; ++i)
				{
					_res.push(_item);
				}

				_ret(_res);
			}

			else
			{
				throw new Error("replicate must be used like: replicate number value. Failed with: replicate " + Lich.VM.PrettyPrint(_number) 
					+ " " + Lich.VM.PrettyPrint(_item));	
			}
		})
	})
}

function cycle(_n, _i, _ret)
{
	Lich.collapse(_n, function(_number)
	{
		Lich.collapse(_i, function(_item)
		{
			if(typeof _number === "number")
			{
				var _res = [];

				for(var i = 0; i < _number; ++i)
				{
					_res = _res.concat(_item);
				}

				_ret(_res);
			}

			else
			{
				throw new Error("replicate must be used like: replicate number value. Failed with: replicate " + Lich.VM.PrettyPrint(_number) 
					+ " " + Lich.VM.PrettyPrint(_item));	
			}
		})
	})
}

function flatten(container, ret)
{
	Lich.collapse(container, function(c)
	{
		var res = []
		forEachCps(
			c,
			function(elem, i, next)
			{
				res = res.concat(elem);
				next();
			},
			function()
			{
				ret(res);
			}
		);
	})
}

function reverse(c, ret)
{
	Lich.collapse(c, function(container)
	{
		if((container instanceof Array) || (typeof container === "string"))
		{
			if(container.length == 0)
			{
				ret([]);
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

				ret(res);
			}
		}

		else
		{
			throw new Error("reverse can only be applied to lists. Failed with: reverse " + Lich.VM.PrettyPrint(container));	
		}
	});
}

function sort(c, ret)
{
	Lich.collapse(c, function(container)
	{
		container = _deepCopy(container);

		if(container instanceof Array)
		{
			ret(container.sort(function(a,b)
			{
				return a - b;
			}));
		}

		else if(typeof container === "string")
		{
			ret(container.sort());
		}

		else
		{
			throw new Error("sort can only be applied to lists. Failed with: reverse " + Lich.VM.PrettyPrint(container));	
		}
	});
}

function slice(l,u,c,ret)
{
	var lower = Lich.VM.getVar("_L");
	var upper = Lich.VM.getVar("_U");
	var container = Lich.VM.getVar("_C");

	Lich.collapse(l, function(lower)
	{
		Lich.collapse(u, function(upper)
		{
			Lich.collapse(c, function(container)
			{
				if((container instanceof Array) || (typeof container === "string"))
				{
					ret(container.slice(lower, upper));
				}

				else
				{
					throw new Error("slice can only be applied to lists. Failed with: slice " + Lich.VM.PrettyPrint(lower) + " " + Lich.VM.PrettyPrint(upper) 
						+ Lich.VM.PrettyPrint(container));	
				}
			}); // container
		}); // upper
	}); // lower
}

function randF(l,u,ret)
{
	Lich.collapse(l, function(lower)
	{
		Lich.collapse(u, function(upper)
		{
			if(typeof lower === "number" && typeof upper === "number")
			{
				ret(Math.random() * (upper - lower) + lower);
			}

			else
			{
				throw new Error("randF can only be applied to numbers. Failed with: randF " + Lich.VM.PrettyPrint(lower) + " " + Lich.VM.PrettyPrint(upper));	
			}
		});
	});
}

rand = randF;
random = randF;

function randI(l, u, ret)
{
	Lich.collapse(l, function(lower)
	{
		Lich.collapse(u, function(upper)
		{
			if(typeof lower === "number" && typeof upper === "number")
			{
				ret(Math.floor(Math.random() * (upper - lower) + lower));
			}

			else
			{
				throw new Error("randF can only be applied to numbers. Failed with: randI " + Lich.VM.PrettyPrint(lower) + " " + Lich.VM.PrettyPrint(upper));	
			}
		});
	});
}

randomI = randI;

function choose(list, ret)
{
	Lich.collapse(list, function(l)
	{
		ret(l[Math.round(Math.random() * (l.length - 1))]);
	})
}

function odd(n, ret)
{
	Lich.collapse(n, function(num)
	{
		if(typeof num === "number")
		{
			if(num < 0)
				num = -num;

			ret((num % 2) == 1);		
		}

		else
		{
			throw new Error("odd can only be applied to numbers. Failed with: odd " + Lich.VM.PrettyPrint(num));	
		}
	});
}

function even(n,ret)
{
	Lich.collapse(n, function(num)
	{
		if(typeof num === "number")
		{
			if(num < 0)
				num = -num;

			ret((num % 2) == 0);
		}

		else
		{
			throw new Error("even can only be applied to numbers. Failed with: even " + Lich.VM.PrettyPrint(num));	
		}
	});
}

function sqrt(n,ret)
{
	Lich.collapse(n, function(num)
	{
		if(typeof num === "number")
		{
			ret(Math.sqrt(num));		
		}

		else
		{
			throw new Error("sqrt can only be applied to numbers. Failed with: sqrt " + Lich.VM.PrettyPrint(num));	
		}
	});
}

function show(_o, ret)
{
	Lich.collapse(_o, function(_object)
	{
		ret(Lich.VM.PrettyPrint(_object));
	});
}

function getCurrentTime(ret)
{
	ret(new Date().getTime());
}

function recur(ret)
{
	if(Lich.VM.currentThread !== "Actor")
		throw new Error("recur can only be called from an Actor thread.");
	
	ret(threadFunc);
}

function _streamRight(l,r,ret)
{
	Lich.collapse(r, function(exp2)
	{
		Lich.collapse(l, function(exp1)
		{
			Lich.collapse(exp2.curry(exp1), ret);
		});
	});	
}

_createPrimitive(">>", _streamRight);

function _streamLeft(l,r,ret)
{
	Lich.collapse(l, function(exp1)
	{
		Lich.collapse(r, function(exp2)
		{
			Lich.collapse(exp1.curry(exp2), ret);
		});
	});	
}

_createPrimitive("<<", _streamLeft);

function typeOf(obj, ret)
{
	Lich.collapse(obj, function(object)
	{
		if(object == null || typeof object === "undefined")
			ret(NothingT); // undefined == Nothing
		else if(object._lichType == DATA)
			ret(object._datatype);
		else if(typeof object === "string")
			ret(StringT);
		else if(typeof object === "number")
			ret(NumberT);
		else if(object instanceof Array)
			ret(ListT);
		else if(typeof object === "function")
			ret(FunctionT);
		else if(object._lichType == DICTIONARY)
			ret(DictionaryT);
		else if (object._lichType == ACTOR)
			ret(ActorT);
		else if(object == Lich.VM.Nothing)
			ret(NothingT);
		else if(object._lichType == Lich.VM.Nothing)
			ret(NothingT);
		else
			ret(UnknownT);		
	})
}

function sleep(seconds, ret)
{
	Lich.collapse(seconds, function(s)
	{
		setTimeout((function(){ret(Lich.VM.Void)}), s * 1000.0);
	})
}

// Constants
pi = 3.141592653589793;

function setTempo(bpm, ret)
{
	Lich.scheduler.setTempo(bpm);
	ret(Lich.VM.Void);
}

function initGraphics()
{
	CloudChamber.setup(document.getElementById("canvas"), 24, undefined, Lich.post); // Create the CloudChamber instance

	(function animloop(time){
		requestAnimFrame(animloop);
		CloudChamber.draw(time);
	})();
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