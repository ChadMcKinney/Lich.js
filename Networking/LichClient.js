//LichClient.js

////////////////////////////////////////////////////////////////////////
// Client Networking
////////////////////////////////////////////////////////////////////////
var socket,clientName;

function broadcastLichCode(code)
{
	console.log("Sending Code:" + code);
	socket.emit('BroadcastCode',code);
}

function broadcastTyping(text)
{
	console.log("Sending Typing: " + text);
	socket.emit('Typing',clientName, text);
}

function receivedTyping(id,text)
{
	console.log("Received Typing:" + text);
	
	writeTextToTerminal(id,text);
}

function receivedLichCode(code)
{
	console.log("Received Code:" + code);	
	try
    {
    	var res = Lich.parse(code);
        Lich.VM.Print(Lich.compileAST(res));
    }   
    catch(e)
    {
		Lich.post(e);
	}
}

function login()
{
	clientName = getCookie("name");

	if(clientName==null)
	{
		clientName = prompt("Please enter your name","Noob"+Math.floor((Math.random()*1000)+1));
		createCookie("name",clientName,30);
	}

	if (clientName!=null)
  	{
  		socket.emit('LoginInfo',clientName);
  	}
}

var users = [];

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
	var newUsers = [];
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

function connectToWebSocketServer()
{
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
	socket.emit('Login');
	initChat();
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