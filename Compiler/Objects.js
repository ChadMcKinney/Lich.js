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
var NUMBER = 7;
var STRING = 8;
var LIST = 9;
var ACTOR = 10;
var PRIMITIVE = 11;
var BOOLEAN = 12;

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
		_lichType: DATA
	}
}

function _createPrimitive(name, primitive)
{
	Lich.VM.reserved[name] = primitive;
}

function ActorSupervisor()
{
	var thisSupervisor = this;
	var actors = {main: Lich.VM.currentThread};

	this.parseMessage = function(event)
	{
		//Lich.post("PARSE MESSAGE.type " + event.type);
		switch(event.type)
		{
			case "registerActor":
				thisSupervisor.registerActor(event.name, event.func, event.args, event.source);
				break;

			case "unregisterActor":
				thisSupervisor.unregisterActor(event.name);
				break;

			case "hasActor":
				thisSupervisor.hasActor(event.name, event.source);
				break;

			case "sendActor":
				thisSupervisor.sendActor(event.name, event.message,event.source);
				break;
		}
	}

	this.registerActor = function(name, func, args, source, ret)
	{
		if(!actors.hasOwnProperty(name))
		{
			var worker = new Worker("../Compiler/Thread.js");
			actors[name] = worker;
					
			worker.addEventListener(
				"message",
				function(event)
				{
					if(event.data.message != undefined)
						Lich.post(event.data.message);
					else if(event.data.print != undefined)
						Lich.post(event.data.print);
					else if(event.data.supervisor)
						thisSupervisor.parseMessage(event.data);
					else if(event.data.evaluate)
						_evalMessage(event.data);
				},
				false
			);

			worker.addEventListener(
				"error",
				function(event)
				{
					Lich.post("Actor error: " + event.message);
				},
				false
			);	

			worker._lichType = ACTOR;

			worker.postMessage(
			{
				type:"init", 
				name:name,
				func:func,
				args:args, 
				modules:Lich.VM.modules.join(";")
			});

			if(source === "main")
			{
				ret(name);
			}

			else
			{
				actors[source].postMessage({type:"supervisor-register-response"});
			}
		}

		else
		{
			if(source === "main")
			{
				throw new Error("Unable to register actor. Actor " + name + " is already registered.");
			}

			else if(actors.hasOwnProperty(source))
			{
				actors[source].postMessage({type:"error",message:"Unable to register actor. Actor " + name + " is already registered."});
			}

			else
			{
				Lich.post("registerActor failed. registerActor was requested by a non-registered actor: " + source);
			}
		}
	}

	this.unregisterActor = function(name)
	{
		if(name === "main")
			throw new Error("Can't unregister the main thread.");

		delete actors[name];
	}

	this.hasActor = function(name, source, ret)
	{
		if(source === "main")
		{
			return true;
		}

		else if(actors.hasOwnProperty(source))
		{
			if(source === "main")
			{
				ret(name);
			}

			else
			{
				actors[source].postMessage({type:"supervisor-has-response", value: actors.hasOwnProperty(name)});
			}
		}

		else
		{
			Lich.post("hasActor failed. hasActor was requested by a non-registered actor: " + source);
		}
	}

	this.sendActor = function(name, message, source)
	{
		if(actors.hasOwnProperty(name))
		{
			actors[name].postMessage(message);
		}

		else
		{
			if(source === "main")
			{
				throw new Error("Unable to send actor message. Actor " + name + " does not exist");
			}

			else if(actors.hasOwnProperty(source))
			{
				actors[source].postMessage({type:"error",message:"Unable to send actor message. Actor " + name + " does not exist"});
			}

			else
			{
				Lich.post("Send failed. Send was requested by a non-registered actor: " + source);
			}
		}
	}
}

function ThreadedActorSupervisor()
{
	var queuedSupervisorReturn = null;

	this.parseMessage = function(event)
	{
		switch(event.type)
		{
			case "supervisor-register-response":
				if(queuedSupervisorReturn != null)
				{
					var func = queuedSupervisorReturn;
					queuedSupervisorReturn = null;
					func();
				}
				break;
			case "supervistor-has-response":
				var func = queuedSupervisorReturn;
					queuedSupervisorReturn = null;
					func(event.value);
				break;
		}
	}

	this.registerActor = function(name, func, args, source, ret)
	{
		queuedSupervisorReturn = function(){ ret(name); }; // wait for response to continue
		self.postMessage(
		{
			supervisor:true,
			type:"registerActor",
			name:name,
			func:func,
			args:args,
			source:source
		});

		//ret(name);
	}

	this.unregisterActor = function(name)
	{
		self.postMessage(
		{
			supervisor:true,
			type:"unregisterActor",
			name:name
		});
	}

	this.hasActor = function(name, source, ret)
	{
		queuedSupervisorReturn = function(has){ ret(has); }; // wait for response to continue
		self.postMessage(
		{
			supervisor:true,
			type:"hasActor",
			source:source
		});
	}

	this.sendActor = function(name, message, source)
	{
		self.postMessage(
		{
			supervisor:true,
			type:"sendActor",
			name:name,
			message:message,
			source:source
		});
	}
}