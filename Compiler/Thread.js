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


importScripts("Objects.js", "VM.js", "Compiler.js", "../Library/Prelude.js", "../third-party/cycle.js");

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
				//Lich.VM.Print(res);
				eval(res);
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

this.addEventListener("message", 
	function(event)
	{
		switch(event.data.type)
		{
			case "init":
				Lich.post("Actor initializing...");
				//var modules = Lich.parseJSON(event.data.modules);
				//modules.map(function(lib){compile(lib)});
				eval(event.data.modules);
				//Lich.post("Actor init event.data.func = " + event.data.func);
				threadFunc = Lich.parseJSON(event.data.func);
				//Lich.post("Actor compiled func = " + threadFunc);
				//Lich.post("Actor init even.data.args = " + event.data.args);
				var args = Lich.parseJSON(event.data.args);
				//Lich.post("Actor compiled args = " + args);
				Lich.post("Actor initialized.");

				Lich.collapse(threadFunc.curry.apply(threadFunc, args), function(res)
				{
					Lich.collapse(res, function(collapsedRes)
					{
						Lich.post("Actor result: " + Lich.VM.PrettyPrint(res));
						Lich.post("Actor closing.");
						self.close();
					});
				});
				break;

			case "message":
				var message = Lich.parseJSON(event.data.message);
				Lich.VM.post("Actor message: " + Lich.VM.PrettyPrint(message));
				messageBox.push(message);
				
				if(queuedReceive != null)
				{
					//Lich.post("queuedReceive = " + queuedReceive);
					queuedReceive[0].apply(null, queuedReceive[1]);
						//queuedReceive[0](queuedReceive[1], queuedReceive[2]);
				}
				break;

			/*case "finish":
				Lich.VM.post("Actor closing.");
				return self.close();*/

			default:
				Lich.post("Actor DEFAULT? event.data.type: " + event.data.type);
				break;
		}
	},
	false
);