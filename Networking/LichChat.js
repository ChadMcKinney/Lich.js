//Chat

var chat;

function initChat()
{
	var div = document.getElementById("textdiv");	

	chat = document.createElement("textarea");
	chat.className = "terminal";
	chat.id = "chat";
	chat.name = "chat";
	chat.spellcheck = false;
	chat.readOnly = true;

	chat.style.zIndex = 1;

	div.appendChild(chat);

	chat.rows = 1;	
	chat.style.width = "46%";
	chat.style.top = "0px";
	chat.style.opacity = "0.0"
	chat.style.left = "55%"
	chat.style.fontSize = "250%"
	chat.style.height = (document.documentElement.clientHeight * 1.0) + "px";

	hideChat();
}

function sendChat(name,chatString)
{
	socket.emit('Chat',clientName + ":\n" + chatString + "\n");
}

function newChat(chatString)
{
	chat.value = chat.value + "\n" + chatString;
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
	chat.style.opacity = "1.0";
	chat.style.zIndex = 40;
	chat.style.overFlow = "hidden";
	chatScroll();

	if(fadeOut!=null)
		clearTimeout(fadeOut);

	fadeOut = setTimeout(hideChat,3500);
}

function chatScroll()
{
	chat.scrollTop = chat.scrollTop + 3;

	if(chat.scrollTop < (chat.scrollHeight - chat.clientHeight))
		setTimeout(chatScroll,1);
}

function hideChat()
{
	chat.style.opacity = "0.0";
	chat.style.zIndex = 1;
	fadeOut = null;
}




