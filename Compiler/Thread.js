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


importScripts("Objects.js", "VM.js", "Compiler.js", "../Library/Prelude.js");
//compileLich(); // Can we just do this synchronously?
Lich.VM.thread = 'worker'; // Not the main thread

/*
<script type="text/javascript" src="Compiler/Objects.js"></script>
<script type="text/javascript" src="Compiler/VM.js"></script>
<script type="text/javascript" src="Compiler/Compiler.js"></script>
<script type="text/javascript" src="Soliton.js/Soliton.js"></script>
<script type="text/javascript" src="CloudChamber.js/CloudChamber.js"></script>
<script type="text/javascript" src="CloudChamber.js/MarchingCubes.js"></script>
<script type="text/javascript" src="third-party/CodeMirror.js"></script>
<script type="text/javascript" src="Parser/ParseUtility.js"></script>
<script type="text/javascript" src="Parser/Types.js"></script>	
<script type="text/javascript" src="Parser/Lexeme.js"></script>
<script type="text/javascript" src="Parser/preL.js"></script>
<script type="text/javascript" src="Parser/iterL.js"></script>
<script type="text/javascript" src="Parser/parse.js"></script>
<script type="text/javascript" src="Parser/LichParser.js"></script>
<script type="text/javascript" src="Parser/LichLibraryParser.js"></script>
<script type="text/javascript" src="Library/Prelude.js"></script>
<script type="text/javascript" src="Lich.js"></script>
*/


var threadFunc;
var messageBox = new Array();
var queuedReceive = null;
Lich.VM.currentThread = "Actor";

Lich.VM.post = function(message)
{
	self.postMessage({ print: message });
}

Lich.post = Lich.VM.post;

function compileLich() // compile default library
{
	try
	{
		var oRequest = new XMLHttpRequest();
		var sURL = "http://"
		         + self.location.hostname
		         + "/Library/Prelude.lich";

		oRequest.open("GET",sURL,false);
		//oRequest.setRequestHeader("User-Agent",navigator.userAgent);
		oRequest.send(null)

		if(oRequest.status == 200)
		{
			var ast = Lich.parseLibrary(oRequest.responseText); // For library parsing testing
			Lich.compileAST(ast, function(res)
			{
				Lich.VM.Print(res);
			});
		}
		
		else 
		{
			Lich.post("Unable to load Prelude module.");
		}	
	}
	
	catch(e)
	{
		Lich.post(e);
	}
}

function executeThreadFunc(arg)
{
	Lich.VM.pushProcedure(new lichClosure([], {}, false, {})); // scope for patterns
	if(!Lich.match(arg, threadFunc.argPatterns[0]))
		throw new Error("Non-matching pattern in function " + Lich.VM.PrettyPrint(threadFunc) + " . Failed on: " + Lich.VM.PrettyPrint(arg))
		
	var res = threadFunc.invoke([arg]);
	Lich.VM.popProcedure();
	return res;
}

this.addEventListener("message", 
	function(event)
	{
		/*
		var threadFunc = deserializeLichObject(event.data.function);
		LichVM.push(threadFunc);
		LichVM.push(LichVM.get("call"));
		LichVM.interpretStack();
		LichVM.printState();*/
		

		//Lich.compileAST(JSON.parse(event));
		//Lich.VM.Print();
		//self.close();


		switch(event.data.type)
		{
			case "init":
				//Lich.post("Actor init event.data.func = " + event.data.func);
				threadFunc = Lich.parseJSON(event.data.func);
				Lich.post("Actor initialized.");
				break;

			case "message":
				Lich.VM.post("Actor: message");
				messageBox.push(Lich.parseJSON(event.data.message));
				
				if(queuedReceive != null)
				{
					queuedReceive();
				}
				break;

			case "finish":
				Lich.VM.post("Actor closing.");
				return self.close();

			default:
				Lich.post("Actor default event.data.type: " + event.data.type);
				break;
		}
	},
	false
);