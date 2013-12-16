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

function LichVoid() // Non-return value for the VM. 
{
	this.type = "Void";
}

// Haskell-like Nothing object
function LichNothing()
{
	this.type = "Nothing";
	this.value = null;
}

function LichClosure(args, rhs, mutable)
{
	var args = args;
	var rhs = rhs;
	var namespace = {};

	this.type = "Closure";

	this.mutable = typeof mutable !== "undefined" ? mutable : false;

	this.hasVar = function(name)
	{
		Lich.post("LichClosure.hasVar(" + name + ") = " + namespace[name]);
		return typeof namespace[name] !== "undefined";
	}

	this.getVar = function(name)
	{
		var res = namespace[name];
		return typeof res !== "undefined" ? res : Lich.VM.Nothing;
	}

	this.setVar = function(name, value)
	{
		Lich.post("LichClosure.setVar(" + name + ") = " + value);

		if(namespace.hasOwnProperty(name))
		{
			if(this.mutable)
				namespace[name] = value;
			else
				throw new Error("Unable to change immutable variable: " + name);
		}

		else
		{
			namespace[name] = value;
		}
	}
}