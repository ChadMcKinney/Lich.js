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
	//var printString = Lich.VM.getVar("_R");
	ret(clientName);
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

function postNarration(c, r, ret)
{
	Lich.collapse(c, function(chatString)
	{
		Lich.collapse(r, function(returnVal)
		{
			if(!(typeof chatString === "string"))
				throw new Error("postNarration can only be applied to strings!");

			updateNarration(chatString);
			ret(returnVal);
		});
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
		mapCps(
			container,
			function(exp, i, callback)
			{
				Lich.collapse(exp, function(collapsedExp)
				{
					Lich.collapse(func.curry(collapsedExp), callback);
				});
			},

			function(res)
			{
				if(typeof container === "string")
					res = res.join("");

				ret(res);
			}
		);
	}

	else if(container._lichType == DICTIONARY)
	{
		mapDictCps(
			container,
			function(n, i, callback)
			{
				Lich.collapse(container[n], function(collapsedExp)
				{
					Lich.collapse(func.curry(collapsedExp), callback);
				});
			},

			function(res)
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

// Constants
pi = 3.141592653589793;

/*
Soliton.print = Lich.post; // Set Soliton.print to our Lich.post function
Soliton.printError = Lich.post; // Set Soliton.print to our Lich.post function
Lich.scheduler = Soliton.Clock.default.scheduler;
*/
