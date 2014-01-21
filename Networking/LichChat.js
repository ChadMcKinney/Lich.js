//Chat

var _chat;

function initChat()
{
	var div = document.getElementById("textdiv");	

	_chat = document.createElement("textarea");
	_chat.className = "terminal";
	_chat.id = "_chat";
	_chat.name = "_chat";
	_chat.spellcheck = false;
	_chat.readOnly = true;

	_chat.style.zIndex = 1;

	div.appendChild(_chat);

	_chat.rows = 1;	
	_chat.style.width = "53%";
	_chat.style.top = "0px";
	_chat.style.opacity = "0.0";
	_chat.style.left = "45%";
	_chat.style.fontSize = "250%";
	_chat.style.height = (document.documentElement.clientHeight * 1.0) + "px";
	_chat.style.textAlign = "right";
	_chat.style.overflow = "hidden";
	hideChat();
}

function sendChat(chatString)
{
	socket.emit('Chat',clientName + ":\n" + chatString + "\n");
}

function newChat(chatString)
{
	_chat.value = _chat.value + "\n" + chatString;
	showChat();
}

function showChat()
{
	//hideTextAreas();
	//setTimeout(showChat2,700);
	showChat2();
}

var fadeOut;

function showChat2()
{
	_chat.style.opacity = "1.0";
	_chat.style.zIndex = 40;
	_chat.style.overFlow = "hidden";
	chatScroll();

	if(fadeOut!=null)
		clearTimeout(fadeOut);

	fadeOut = setTimeout(hideChat,4500);
}

function chatScroll()
{
	_chat.scrollTop = _chat.scrollTop + 3;

	if(_chat.scrollTop < (_chat.scrollHeight - _chat.clientHeight))
		setTimeout(chatScroll,1);
}

function hideChat()
{
	_chat.style.opacity = "0.0";
	_chat.style.zIndex = 1;
	fadeOut = null;
}




