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
	//console.log("Received Typing. id:" + obj.id + ", text: " + obj.text);
	console.log("Received Typing:" + text);
	
	if(id!=clientName)
		document.getElementById("terminal"+id).value = text;
}

function receivedLichCode(code)
{
	console.log("Received Code:" + code);	
}

function login()
{
	clientName = getCookie("name");
	//var cientName;

	if(clientName==null)
	{
		clientName = prompt("Please enter your name","Noobzorz"+Math.floor((Math.random()*1000)+1));
		createCookie("name",clientName,30);
	}

	if (clientName!=null)
  	{
  		socket.emit('LoginInfo',clientName);
  	}
  	
  	initGame();
}

var users = [];

function currentUsers(newUsers)
{
	if(users.length != newUsers.length)
	{		
		for(i=0;i<users.length;i++)
		{
			if( newUsers.indexOf(users[i]) < 0)
        	{

            	var input = document.getElementById("terminal" + users[i].name);
            	if(input != null)
            	{
					input.rows = 1;	
					input.style.width = "100%";
					//input.style.top = "110%";
					input.style.height = "0%";
					input.style.zIndex = 1;
					//setTimeout(function(){input.parentNode.removeChild(input);},4000);
        		}
        	}
		}

		users = reorderUserArray(newUsers);
		createTextAreas();
	}
	else
	{
		users = reorderUserArray(newUsers);
		createTextAreas();
	}

	socket.emit('Typing',clientName, document.getElementById("terminal" + clientName).value);
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
	clientName = prompt("That name is TAKEN.\n Please enter a new name.","MAJORNoob"+Math.floor((Math.random()*1000)+1));
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

function connectToWebSocketServer()
{
	//socket = io.connect('ws://173.203.102.166:80');	
	socket = io.connect('ws://127.0.0.1');
	socket.on('TypingClient', receivedTyping);
	socket.on('BroadcastCodeClient', receivedLichCode);
	socket.on('LoginClient', login);
	socket.on('CurrentUsers', currentUsers);
	socket.on('NameTaken', nameTaken);

	socket.emit('Login');
}

////////////////////////////////////////////////////////////////////////
// Dynamic Webpage
////////////////////////////////////////////////////////////////////////

function createTextAreas()
{
	for (var i=0;i<users.length;i++)
	{ 
		console.log(users[i]);
		createTextArea(users[i].name,i,users.length);
	}
}

function removeTextArea()
{


}

function createTextArea(name,num,total)
{
	var div = document.getElementById("textdiv");	
	var input;
	
	if(document.getElementById("terminal"+name) == null)
	{
		input = document.createElement("textarea");
		input.className = "terminal";
		input.id = "terminal"+name;
		input.name = "terminal"+name;
		input.addEventListener('keydown', keyDown);
		input.addEventListener('keyup', keyUp);
		input.spellcheck = false;
		input.value = name + "'s terminal.";
		input.readOnly = name != clientName;
		input.style.zIndex = 10;

		div.appendChild(input);
	}
	else 
	{
		input = document.getElementById("terminal"+name);
	}
		
	input.rows = 1;	
	input.style.width = "100%";
	input.style.top = (document.documentElement.clientHeight * 0.8 * (num/total)) + "px";
	input.style.height = (document.documentElement.clientHeight * 0.8 * (1/total)) + "px";


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