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
	chat.style.width = "100%";
	chat.style.top = "0px";
	chat.style.opacity = "0.0"
	chat.style.fontSize = "250%"
	chat.style.height = (document.documentElement.clientHeight * 1.0) + "px";

	hideChat();
}

function sendChat(chatString)
{
	socket.emit('Chat',clientName + ": " + chatString);
}

function newChat(chatString)
{
	chat.value = chat.value + "\n" + chatString;
	showChat();
}

function showChat()
{
	hideTextAreas();
	setTimeout(showChat2,700);
}

function showChat2()
{
	chat.style.opacity = "1.0";
	chat.style.zIndex = 40;

	setTimeout(hideChat,2000);
}

function hideChat()
{
	chat.style.opacity = "0.0";
	chat.style.zIndex = 1;

	setTimeout(showTextAreas,700);
}



