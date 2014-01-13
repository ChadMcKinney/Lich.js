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

// Lich Object type enumeration
var VOID = 0;
var NOTHING = 1;
var CLOSURE = 2;
var DICTIONARY = 3;
var THUNK = 4;
var WILDCARD = 5;
var DATA = 6;
var CLASS = 7;
var NUMBER = 8;
var STRING = 9;
var LIST = 10;
var ACTOR = 11;
var PRIMITIVE = 12;

function LichVoid() // Non-return value for the VM. 
{
	this._lichType = VOID;
}

// Haskell-like Nothing object
function LichNothing()
{
	this._lichType = NOTHING;
	this.value = null;
}

function lichData(name)
{
	return {
		_argNames: new Array(),
		_datatype: name,
		lichType: DATA
	}
}

function lichClass(name)
{
	return {
		_classtype: name,
		lichType: CLASS
	}
}

function lichClosure(argPatterns, rhs, mutable, namespace, decls)
{
	var _argPatterns = argPatterns;
	var _rhs = rhs;
	var _mutable = typeof mutable !== "undefined" ? mutable : false;
	var _namespace = typeof namespace !== "undefined" ? namespace : {};
	var _decls = typeof decls !== "undefined" ? decls : [];

	return { // Resolves circular dependencies with Lich.compileAST
		astType: "closure",
		lichType: CLOSURE,
		argPatterns: _argPatterns,
		rhs: _rhs,
		mutable: _mutable,
		namespace: _namespace,
		decls: _decls,

		hasVar: function(name)
		{
			return typeof _namespace[name] !== "undefined";
		},

		getVar: function(name)
		{
			var res = _namespace[name];
			res = typeof res !== "undefined" ? res : Lich.VM.Nothing;

			if(res._lichType == THUNK)
			{
				res.invoke([], function(thunkRes)
				{
					res = thunkRes; // DO WE NEED TO MEMOIZE THIS RESULT?
				}); 

				return res;
			}

			else
			{
				return res;
			}
		},

		setVar: function(name, value)
		{
			if(Lich.VM.reserved.hasOwnProperty(name))
				throw new Error("Cannot set variable " + name + " because it is reserved by the language.");


			if(_namespace.hasOwnProperty(name))
			{
				if(_mutable)
					_namespace[name] = value;
				else
					throw new Error("Unable to change immutable variable: " + name);
			}

			else
			{
				_namespace[name] = value;
			}
		},

		invoke: function(args, ret)
		{
			var i;
			for(i = 0; i < args.length && i < _argPatterns.length; ++i)
			{
				if(typeof _argPatterns[i] === "string")
					_namespace[_argPatterns[i]] = args[i]; // otherwise the variables have already been declared during pattern matching
				else if(_argPatterns[i].astType == "varname")
					_namespace[_argPatterns[i].id] = args[i];
			}

			if(i < _argPatterns.length) // Partial application
			{
				ret(new lichClosure(_argPatterns.slice(i, _argPatterns.length), _rhs, _mutable, deepCopy(_namespace), _decls));
			}

			else
			{
				Lich.VM.pushProcedure(this);

				/*
				for(var i = 0; i < _decls.length; ++i) // Evaluate all the declarations in the where statement
				{
					Lich.compileAST(_decls[i]);
				}

				var res = Lich.compileAST(_rhs);
				Lich.VM.popProcedure();
				ret(res);*/

				forEachCps(
					_decls, 
					function(elem,index,next)
					{
						Lich.compileAST(elem, function(declRes)
						{
							next();
						});
					},
					function()
					{
						Lich.compileAST(_rhs, function(res)
						{
							Lich.VM.popProcedure();
							ret(res);
						})
					}
				);
			}
		}
	}
}

/*
function createPrimitive(name, argNames, primitiveFunc)
{
	primitiveFunc.astType = "primitive";
	primitiveFunc.primitiveName = name;

	var varNames = new Array();

	for(var i = 0; i < argNames.length; ++i)
	{
		varNames.push({astType:"varname", id: argNames[i]});
	}

	var closure = new lichClosure(varNames, primitiveFunc);

	if(argNames.length == 0)
		closure._lichType = THUNK; // this will let it actually get invoked on being called

	Lich.VM.reserveVar(name, closure);
}*/

function _createPrimitive(name, primitive)
{
	Lich.VM.reserved[name] = primitive;
}