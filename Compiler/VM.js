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
Lich.VM.Nothing = {_lichType: NOTHING }; // We only need one Nothing value because they're immutable and identical.
Lich.VM.Void = {_lichType: VOID }; // Same as Nothing, we only need one.
Lich.VM.actorSupervisor = new ActorSupervisor();
Lich.VM.reserved = {}; // For variables reserved by the language
Lich.VM.currentThread = "main";
Lich.VM.modules = [];

Lich.VM.reserveVar = function(varName, value)
{
	//Lich.VM.setVar(varName, value);
	Lich.VM.reserved[varName] = value;
}

Lich.VM.printArray = function(object)
{
    var string = "[";

    for(var i = 0; i < object.length; ++i)
    {
    	if(i < object.length - 1)
    		string = string + Lich.VM.PrettyPrint(object[i]) + ",";
    	else
    		string = string + Lich.VM.PrettyPrint(object[i]);
    }

    return string + "]";
}

Lich.VM.printDictionary = function(object)
{
    var string = "(";

    for(n in object)
    {
    	if(n != "_lichType" && n != "curry")
    	{
    		string = string + "\"" + n + "\" = " + Lich.VM.PrettyPrint(object[n]) + ", ";
    	}
    }

    if(string.length > 1)
    	return string.substring(0, string.length - 2) + ")";
	else
		return string + ")";
}

Lich.VM.printSynthDef = function(object)
{
	var string = "SynthDef (" + object._datatype;

	for(var i = 0; i < object._argNames.length; ++i)
	{
		string = string + " " + object._argNames[i];
	}

	return string + ")";
}

Lich.VM.printData = function(object)
{
	var string = object._datatype + " { ";

	for(var i = 0; i < object._argNames.length; ++i)
	{
		string = string + object._argNames[i] + " = " + (Lich.VM.PrettyPrint(object[object._argNames[i]]));
		if(i < object._argNames.length - 1)
			string = string.concat(", ");
	}

	return string + " }";
}

Lich.VM.printClosure = function(closure)
{
	var curried = false;
	var initClosure = closure;

	if(typeof closure.curriedFunc !== "undefined")
	{
		closure = closure.curriedFunc;
		curried = true;
	}


	var string = "(\\";
	var reg = /\(([\s\S]*?)\)/;

	var params = reg.exec(closure);
	if (params)
	{
		params = params[1].split(",").map(function(elem){return elem.replace(/ /g,"")});
		if(curried)
			string = string + params.slice(initClosure.curriedArgs.length,params.length).join(" ");
		else	
			string = string + params.slice(0,params.length).join(" ");
	} 

	//Lich.post("PRINT CLOSURE!");
	return string.concat(" ->)");
}

Lich.VM.printPercStream = function(object)
{
	return "(\\ +>)";
}

Lich.VM.printAST = function(object)
{
	switch(object.astType)
	{
		case "at-match":
			return object.id + "@" + Lich.VM.printAST(object.pat);

		case "wildcard":
			return "_";

		case "varname":
			return object.id;

		case "literal-match":
			return object.value.value;

		case "head-tail-match":
			return "(" + Lich.VM.PrettyPrint(object.head).replace(/\"/g,"") + ":" + Lich.VM.PrettyPrint(object.tail).replace(/\"/g,"") + ")";

		case "data-match":
			var string = "(" + object.id + " ";

			for(var i = 0; i < object.members.length; ++i)
			{
				string = string.concat(Lich.VM.PrettyPrint(object.members[i]).replace(/\"/g,""));

				if(i == object.members.length - 1)
					string = string.concat(")");
				else
					string = string.concat(" ");
			}
			return string;

		case "list-match":
			return Lich.VM.PrettyPrint(object.list);

		case "lambda-pat":
			var string = "(\\";

			for(var i = 0; i < object.numArgs; ++i)
			{
				string = string.concat("_ ");

				if(i == object.numArgs - 1)
					string = string.concat("->)");
			}

			return string;

		default:
			return object.astType;
	}
}

Lich.post = function(text)
{
    var obj = document.getElementById("post");
    var appendedText = document.createTextNode(text + "\n");
    obj.appendChild(appendedText);
    obj.scrollTop = obj.scrollHeight;
}

Lich.VM.PrettyPrint = function(object)
{
	var lichType = object._lichType;
	//Lich.post(Lich.VM.printData(object));
	if(object == null || typeof object === "undefined")
		return "Nothing"; // undefined == Nothing
	else if(lichType == SYNTH)
		return Lich.VM.printSynthDef(object);
	else if(lichType == DATA)
		return Lich.VM.printData(object);
	else if(typeof object === "string")
		return "\"" + object + "\"";
	else if(typeof object === "number")
		return object;
	else if(object instanceof Array)
		return Lich.VM.printArray(object);
	else if(typeof object === "function")
		return Lich.VM.printClosure(object);
	else if(lichType == IMPSTREAM)
		return "+>";
	else if(lichType == SOLOSTREAM)
		return "~>";
	else if(lichType == CLOSURE || lichType == THUNK)
		return Lich.VM.printClosure(object);
	else if(lichType == DICTIONARY)
		return Lich.VM.printDictionary(object);
	else if (lichType == ACTOR)
		return "Actor";
	else if(object == Lich.VM.Nothing)
		return "Nothing";
	else if(lichType == NOTHING)
		return "Nothing";
	else if(lichType == VOID)
		return "";
	else
		return object;
}

Lich.VM.Print = function(object)
{
	//Lich.post("PRINT OBJECT: " + object);
	if(object._lichType != VOID)
		Lich.post(Lich.VM.PrettyPrint(object));
		// Lich.post(Lich.VM.PrettyPrint(JSON.parse(JSON.stringify(object)))); // Message passing translation		
}
