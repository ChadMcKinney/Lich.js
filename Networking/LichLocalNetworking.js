/* 
    Lich.js - JavaScript audio/visual live coding language
    Copyright (C) 2012-2014 Chad McKinney

	http://chadmckinneyaudio.com/
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


// var io = require('socket.io');
var io = require('socket.io-client');
Lich.clientName = "noob"+(Math.random()*666);

/*
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);*/

var _commandHeader = "__LICH_COMMAND__␞";
var _commandTail = "␞__LICH_END_COMMAND__\n";
var _WRITE_TERMINAL_ = 0;
var _SET_CURSOR_ = 1;
var _CREATE_TERMINAL_ = 2;
var _REMOVE_TERMINAL_ = 3;
var _CHAT_MESSAGE_ = 4;
var _SET_USER_NAME_ = 5;
var location = {host: 'http://localhost:80'};
var users = new Array();

var _getElementById = function(id)
{
	return document[id];
}

var _connectionStatus = {
	value: false,
	style: {color: "rgb(0,0,0)"}
}

var document = {getElementById: _getElementById, connectionStatus: _connectionStatus};

function _lcommand(commandNumber, args)
{
	var _commandString = _commandHeader + commandNumber + "␞";

	for(var i = 0; i < args.length; ++i)
	{
		_commandString += args[i];
		
		if(i < args.length - 1)
			_commandString += "␞";
	}

	console.log(_commandString + _commandTail);
}

function writeTextToTerminal(id,text)
{
	if(id != Lich.clientName && text != null)
	{
		_lcommand(_WRITE_TERMINAL_, [id, text]);
	}
}

// HTML-like function support for networking

function getCookie(name){ return Lich.clientName; }
function newChat(chatString)
{
	_lcommand(_CHAT_MESSAGE_, [chatString]);
}

function sendChat(chatString)
{
	socket.emit('Chat', Lich.clientName + ": " + chatString + "\n");
}

function sendChat2(userName, chatString)
{
	if(Lich.clientName === userName)
		socket.emit('Chat', Lich.clientName + ": " + chatString + "\n");
}

// dummy functions to make LichClient work, we need to work out LichClient so it isn't so dependent on HTML.
function initChat() {}
function prompt(msg) { console.log("Prompt: " + Lich.clientName); return Lich.clientName; }

function containsUser(user, usersToCheck)
{
	for(var i = 0; i < usersToCheck.length; i++)
	{
		if(usersToCheck[i].name == user.name)
			return true;
	}	

	return false;
}

function removeDeadUserTerminals(oldUsers, newUsers)
{
	for(var i = 0; i < oldUsers.length; i++)
	{
		var userToCheck = oldUsers[i];
		if(!containsUser(userToCheck, newUsers))
       	{
           	// removeTextArea(userToCheck.name);
			_lcommand(_REMOVE_TERMINAL_, [userToCheck.name]);
       	}
	}
}

function createTextAreas()
{
	users = users.sort(function(a,b){return a.name != clientName});

	_lcommand(_CREATE_TERMINAL_, users.map(function(e){ return e.name; }));
	/*
	for (var i=0; i < users.length; i++)
	{
		//console.log(users[i]);
		// createTextArea(users[i].name,i,users.length);
		_lcommand(_CREATE_TERMINAL_, [users[i].name, i, users.length]);
	}*/
}

// document.getElementById("terminal" + clientName).value

function beginNetworking(ipAddress, userName)
{
	if(ipAddress != null && typeof ipAddress !== "undefined")
		location.host = ipAddress;


	_lcommand(_SET_USER_NAME_, [userName]);
	console.log("beginNetworking: " + userName);
	Lich.clientName = userName;
	document["terminal"+Lich.clientName] = {value: " "};
	console.log("beginNetworking: " + Lich.clientName);
	_connectionStatus = true;
	connectToWebSocketServer(true);
	
	//io.connect = function(){ return io; };
	//io.socket = io;
	//io.connected = true;
	//connectToWebSocketServer();
}


//LichClient.js

////////////////////////////////////////////////////////////////////////
// Client Networking
////////////////////////////////////////////////////////////////////////

var socket = null;
var clientName = null;
var startUpFunctions = [];

function broadcastLichCode(code)
{
	if(socket != null)
		socket.emit('BroadcastCode',code);
	
	console.log("Sending Code:" + code);
}

function broadcastNetEval(code)
{
	//console.log("Sending Code:" + code);
	socket.emit('BroadcastNetEval',code);
}

function broadcastTyping(text)
{
	//console.log("Sending Typing: " + text);
	socket.emit('Typing',clientName, text);
}

function broadcastTyping2(userName, text)
{
	//console.log("Sending Typing: " + text);

	if(userName === Lich.clientName)
		socket.emit('Typing', Lich.clientName, text);
}

function receivedTyping(id,text)
{
	//console.log("Received Typing:" + text);
	if(id!=clientName)
	{
		writeTextToTerminal(id,text);
	}
}

function broadcastCursor(x,y)
{
	//console.log("Sending Typing: " + text);
	socket.emit('CursorPos', clientName, x, y);
}

function receiveCursorPos(name,x,y)
{
	if(name != clientName)
	{
		_lcommand(_SET_CURSOR_, [name, x, y]);
		//console.log("receiveCursorPos: " + name + "," + x + "," + y);
		//editors[name].clearSelection();
		//editors[name].moveCursorTo(x,y);
		//editors[name].clearSelection();
	}
}

function receivedLichCode(code)
{
	//console.log("Received Code:" + code);	
	try
    {
    	var ast = Lich.parse(code);
        var res = Lich.compileAST(ast);	
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
    }   

    catch(e)
    {
		Lich.post(clientName + ": " + e);
	}
}

function login()
{
	clientName = getCookie("name");

	if(clientName == null)
	{
		clientName = prompt("Please enter your name","Fledgling Undead "+Math.floor((Math.random()*1000)+1));
		createCookie("name",clientName,30);
	}

	if(clientName != null)
  	{
  		socket.emit('LoginInfo',clientName);
  	}
}

function currentUsers(newUsers)
{
	var reorderedNewUsers = reorderUserArray(newUsers);
	removeDeadUserTerminals(users,reorderedNewUsers);
	users = reorderedNewUsers;
	createTextAreas();
	socket.emit('Typing',clientName, document.getElementById("terminal" + clientName).value);
}

function printUsers(usersToCheck,string)
{
    console.log(string+":[");
    for (var i=0;i<usersToCheck.length;i++)
    {
   		console.log(printUserString(usersToCheck[i])+ ",");
    }
    console.log("];");
}

function printUserString(user)
{
	return "   " + user.name + " - " + user.address.address + ":" + user.address.port;
}

function reorderUserArray(oldUsers)
{
	var newUsers = new Array();
	var us;

	for(i=0;i<oldUsers.length;i++)
	{
		if(oldUsers[i].name == clientName)
		{
			us = oldUsers[i];
		}
		else
		{
			newUsers.push(oldUsers[i]);
		}
	}

	newUsers.push(us);
	return newUsers;
}

function nameTaken()
{
	clientName = prompt("That name is TAKEN.\n Please enter a new name.","Noob"+Math.floor((Math.random()*1000)+1));
	if (clientName!=null)
  	{
  		createCookie("name",clientName,30);
  		socket.emit('LoginInfo',clientName);
  	}
  	else
  	{
  		nameTaken();
  	}
}

function askForFileFromServer(fileName)
{
	socket.emit('ReadFile',fileName);
}

function readFileDataFromServer(fileData)
{
	document.getElementById("terminal"+clientName).value = fileData;
}

function compileLibClient(libName)
{
	//console.log("Sent CompileLib to server.");
	socket.emit('CompileLib',libName);
}

function compileLibFromServer(libData)
{
	//console.log("compiling from server");
	var ast = Lich.parseLibrary(libData);
	try
	{
		var res = Lich.compileAST(ast);
		Lich.post("JS> "+res);
		eval(res); 
		Lich.VM.modules.push(res);
	}

	catch(e)
	{
		Lich.post(e);
	}
}

var connectionStatus;
var connected;

function connectToWebSocketServer(isLocal)
{
	connectionStatus = document.getElementById("connectionStatus");
	
	//socket = io.connect('ws://173.203.102.166:80');	
	//socket = io.connect('ws://127.0.0.1');

	if(typeof isLocal === "undefined" || !isLocal)
	{
		socket = io.connect(location.host);
	}

	else
	{
		socket = io(location.host);
		socket.socket = socket.io;
	}

	socket.on('connect', function() {
		socket.on('TypingClient', receivedTyping);
		socket.on('BroadcastCodeClient', receivedLichCode);
		socket.on('LoginClient', login);
		socket.on('CurrentUsers', currentUsers);
		socket.on('NameTaken', nameTaken);
		socket.on('ChatClient', newChat);
		socket.on('ReadFileClient',readFileDataFromServer);
		socket.on('CompileLibClient',compileLibFromServer);
		socket.on('StateSyncClient',receiveStateSync);
		socket.on('CursorPosClient',receiveCursorPos);

		//socket.on('connect',clientConnected);
		socket.on('disconnect',clientDisconnected);

		socket.emit('Login');
		initChat();

		checkConnection();
	});
	
	

	/*
	document.addEventListener("keydown", function(e) {
  		if (e.keyCode == 27) {
			toggleFullScreen();
  		}
	}, false);*/
}

function checkConnection()
{
	if(socket.socket.connected)
		clientConnected();
	else
		clientDisconnected();

	setTimeout(checkConnection,1000);
}

function clientConnected()
{
	if(!connected)
	{
		//console.log("Connected to server.");
		connectionStatus.style.color = "rgb(0,130,60)";
		connectionStatus.value = "Connected";
		runStartUpFunctions(clientName);
	}
	
	connected = true;
}

function clientDisconnected()
{
	if(!connected)
	{
		//console.log("Disconnected from server.");
		connectionStatus.style.color = "rgb(130,0,60)";
		connectionStatus.value = "Disconnected";
	}
	
	socket.socket.reconnect();
	connected = false;
}

function sendStateSync(state)
{
	//console.log("sending state:\n"+state);
	socket.emit("StateSync",state);
}

function receiveStateSync(state)
{
	//console.log("Received state:\n"+state);
}

////////////////////////////////////////////////////////////////////////
// Full Screen
////////////////////////////////////////////////////////////////////////

function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
      (!document.mozFullScreen && !document.webkitIsFullScreen)) {               // current working methods
    if (document.documentElement.requestFullScreen) {
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}

////////////////////////////////////////////////////////////////////////
// Cookies
////////////////////////////////////////////////////////////////////////
function createCookie(name, value, expires, path, domain) {
	var cookie = name + "=" + escape(value) + ";";
 
	if (expires) {
	  	// If it's a date
	    if(expires instanceof Date) {
	    	// If it isn't a valid date
	    	if (isNaN(expires.getTime()))
	       	expires = new Date();
	    }
    	else
	  		expires = new Date(new Date().getTime() + parseInt(expires) * 1000 * 60 * 60 * 24);	 
		    	
		cookie += "expires=" + expires.toGMTString() + ";";
	}
		 
	if (path)
	    cookie += "path=" + path + ";";
	if (domain)
		cookie += "domain=" + domain + ";";
		 
	document.cookie = cookie;
}

function getCookie(name) {
	var regexp = new RegExp("(?:^" + name + "|;\s*"+ name + ")=(.*?)(?:;|$)", "g");
	var result = regexp.exec(document.cookie);
	return (result === null) ? null : result[1];
}

function runStartUpFunctions(cName)
{
	if(cName == null || typeof cName === "undefined")
		return;
	
	for(var i = 0; i < startUpFunctions.length; ++i)
	{
		startUpFunctions[i](cName);
	}

	startUpFunctions = [];
}

function addStartUpFunction(func)
{
	startUpFunctions.push(func);
}

function fillClientTerminal(text)
{
	if(!connected)
	{
		startUpFunctions.push(function(cName){editors[cName].setValue(text, 0); editors[cName].navigateFileStart();});
	}

	else
	{
		editors[clientName].setValue(text, 0);
		editors[clientName].navigateFileStart();
	}
}
