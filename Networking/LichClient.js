//LichClient.js

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
	document.getElementById("terminal1").value = text;
	document.getElementById("terminal2").value = text;
	document.getElementById("terminal3").value = text;
}

function receivedLichCode(code)
{
	console.log("Received Code:" + code);	
}

function login()
{
	clientName = getCookie("name");

	if(clientName==null)
	{
		clientName = prompt("Please enter your name","Noobzorz");
		createCookie("name",person,30);
	}

	if (clientName!=null)
  	{
  		socket.emit('LoginInfo',clientName);
  	}
}

function connectToWebSocketServer()
{
	socket = io.connect('ws://173.203.102.166:80');	
	//socket = io.connect('ws://127.0.0.1');
	socket.on('TypingClient', receivedTyping);
	socket.on('BroadcastCodeClient', receivedLichCode);
	socket.on('LoginClient', login);

	socket.emit('Login');
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