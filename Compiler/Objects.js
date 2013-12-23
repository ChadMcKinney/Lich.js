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


var VOID = 0;
var NOTHING = 1;
var CLOSURE = 2;
var DICTIONARY = 3;
var THUNK = 4;
var WILDCARD = 5;
var DATA = 6;

function LichVoid() // Non-return value for the VM. 
{
	this.lichType = VOID;
}

// Haskell-like Nothing object
function LichNothing()
{
	this.lichType = NOTHING;
	this.value = null;
}

function printClosure(closure)
{
	var string = "(\\";

	for(var i = 0; i < closure.argNames.length; ++i)
	{
		string = string.concat(closure.argNames[i] + " ");
	}

	string = string.concat("->)");

	Lich.post(string);
}

function lichClosure(argNames, rhs, mutable, namespace, decls)
{
	var _argNames = argNames;
	var _rhs = rhs;
	var _mutable = typeof mutable !== "undefined" ? mutable : false;
	var _namespace = typeof namespace !== "undefined" ? namespace : {};
	var _decls = typeof decls !== "undefined" ? decls : [];

	return { // Resolves circular dependencies with Lich.compileAST
		
		lichType: CLOSURE,
		argNames: _argNames,

		hasVar: function(name)
		{
			return typeof _namespace[name] !== "undefined";
		},

		getVar: function(name)
		{
			var res = _namespace[name];
			res = typeof res !== "undefined" ? res : Lich.VM.Nothing;

			if(res.lichType == THUNK)
			{
				return res.invoke([]); // DO WE NEED TO MEMOIZE THIS RESULT?
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

		invoke: function(args)
		{
			var i;
			for(i = 0; i < args.length && i < _argNames.length; ++i)
			{
				_namespace[_argNames[i]] = args[i];
			}

			if(i < _argNames.length) // Partial application
			{
				return new lichClosure(_argNames.slice(i, _argNames.length), _rhs, _mutable, deepCopy(_namespace), _decls);
			}

			else
			{
				Lich.VM.pushProcedure(this);

				for(var i = 0; i < _decls.length; ++i) // Evaluate all the declarations in the where statement
				{
					Lich.compileAST(_decls[i]);
				}

				var res = Lich.compileAST(_rhs);
				Lich.VM.popProcedure();
				return res;
			}
		}
	}
}

function createPrimitive(name, argNames, primitiveFunc)
{
	primitiveFunc.astType = "primitive";
	Lich.VM.reserveVar(name, new lichClosure(argNames, primitiveFunc));
}