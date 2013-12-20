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

var Lich = new Object();

Lich.VM = new Object();
Lich.VM.procedureStack = new Array();
Lich.VM.main = lichClosure([], null, true); // We allow mutability at the global scope in interactive mode.
Lich.VM.procedureStack.push(Lich.VM.main);
Lich.VM.Nothing = new LichNothing(); // We only need one Nothing value because they're immutable and identical.
Lich.VM.Void = new LichVoid(); // Same as Nothing, we only need one.

Lich.VM.pushProcedure = function(procedure)
{
	Lich.VM.procedureStack.push(procedure);
}

Lich.VM.popProcedure = function()
{
	Lich.VM.procedureStack.pop();
}

Lich.VM.getVar = function(varName) // Dynamically check scopes for a variable's value
{
	for(var i = Lich.VM.procedureStack.length - 1; i >= 0; --i)
	{
		if(Lich.VM.procedureStack[i].hasVar(varName))
			return Lich.VM.procedureStack[i].getVar(varName);
	}

	return Lich.VM.Nothing; // Variable not found
}

Lich.VM.setVar = function(varName, value)
{
	if(Lich.VM.procedureStack.length > 0)
	 	Lich.VM.procedureStack[Lich.VM.procedureStack.length - 1].setVar(varName, value);
	else
		throw new Error("Lich.VM.Main procedure is missing. Fatal exception. WTF THE WORLD IS ENDING!!!");
}

Lich.post = function post(text)
{
    var obj = document.getElementById("post");
    var appendedText = document.createTextNode(text + "\n");
    obj.appendChild(appendedText);
    obj.scrollTop = obj.scrollHeight;
}

Lich.VM.Print = function(object)
{
	if(typeof object === "undefined")
		Lich.post(object);
	if(object.lichType == CLOSURE || object.lichType == THUNK)
		printClosure(object);
	else if(object == Lich.VM.Nothing)
		Lich.post("Nothing");
	else if(object != Lich.VM.Void)
		Lich.post(object);
}