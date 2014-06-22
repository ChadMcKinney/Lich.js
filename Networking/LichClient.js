//LichClient.js

////////////////////////////////////////////////////////////////////////
// Client Networking
////////////////////////////////////////////////////////////////////////
var socket,clientName;
var startUpFunctions = [];

function broadcastLichCode(code)
{
	//console.log("Sending Code:" + code);
	socket.emit('BroadcastCode',code);
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
	socket.emit('CursorPos',clientName, x,y);
}

function receiveCursorPos(name,x,y)
{
	if(name != clientName)
	{
		//console.log("receiveCursorPos: " + name + "," + x + "," + y);
		editors[name].clearSelection();
		editors[name].moveCursorTo(x,y);
		editors[name].clearSelection();
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

var users = new Array();

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

function connectToWebSocketServer()
{
	connectionStatus = document.getElementById("connectionStatus");
	
	//socket = io.connect('ws://173.203.102.166:80');	
	//socket = io.connect('ws://127.0.0.1');
	socket = io.connect(location.host);
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

	document.addEventListener("keydown", function(e) {
  		if (e.keyCode == 27) {
			toggleFullScreen();
  		}
	}, false);
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
