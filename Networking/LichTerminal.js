////////////////////////////////////////////////////////////////////////
// Dynamic Webpage
////////////////////////////////////////////////////////////////////////

editors = {};

// NEED TO MAKE IDE STYLE NEW/OPEN/SAVE functions for the text editor
function newDocument()
{
	
}

function saveDocument()
{

}

function openDocument()
{

}

function writeTextToTerminal(id,text)
{
	if(id != clientName)
	{
		//Lich.post("ID = " + id);
		//Lich.post("CLIENT NAME + " + clientName);
		//document.getElementById("terminal"+id).value = text;
		editors[id].setValue(text, text.length);
	}
}

function createTextAreas()
{
	users = users.sort(function(a,b){return a.name != clientName});
	for (var i=0;i<users.length;i++)
	{ 
		//console.log(users[i]);
		createTextArea(users[i].name,i,users.length);
	}
}


function createTextArea(name,num,total)
{
	var div = document.getElementById("textdiv");	
	var input = document.getElementById("terminal"+name); 
	var nameTag  = document.getElementById("nameTag"+name); 

	if( input == null)
	{
		
		input = document.createElement("div");
		input.id = "terminal"+name;
		input.style.zIndex = 10;
		input.style.overflow = "hidden";
		input.style.opacity = getShowingOpacity();
		input.position = "relative";

		/*
		var subDiv = document.createElement("div");
		subDiv.id = "terminalEditor"+name;
		subDiv.style.opacity = getShowingOpacity();
		input.appendChild(subDiv);*/

		//Terminal text area

		/*
		input = document.createElement("textarea");

		input.className = "terminal";
		input.id = "terminal"+name;
		input.name = "terminal"+name;
		input.addEventListener('keydown', keyDown);
		input.addEventListener('keyup', keyUp);
		input.spellcheck = false;
		input.value = "";
		input.readOnly = name != clientName;
		
		input.style.zIndex = 10;
		input.rows = 1;	
		input.style.width = "100%";
		
		input.style.opacity = getShowingOpacity();*/
		
		
		div.appendChild(input);

		//document.body.appendChild(input);
		var editor = ace.edit("terminal"+name);

		editor.setTheme("ace/theme/lich");
		editor.getSession().setMode("ace/mode/haskell");
		editor.renderer.setShowGutter(false);
		editor.renderer.setShowPrintMargin(false);
		var session = editor.getSession();
		session.setUseWrapMode(true);
		session.setUseWorker(true);
		session.selection.on('changeCursor', networkCursor);
		
		editor.commands.addCommand({
		    name: 'evaluateCode',
		    bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
		    exec: parseCurrentLine,
		    readOnly: false // false if this command should not apply in readOnly mode
		});

		editor.commands.addCommand({
		    name: 'evaluateCode2',
		    bindKey: {win: 'Shift-Enter', mac: 'Shift-Enter'},
		    exec: parseCurrentLine,
		    readOnly: false // false if this command should not apply in readOnly mode
		});

		editor.commands.addCommand({
		    name: 'chatInputWindow',
		    bindKey: {win: 'Alt-c', mac: 'Alt-c'},
		    exec: chatEntryFromWindow,
		    readOnly: false // false if this command should not apply in readOnly mode
		});

		editor.commands.addCommand({
			name: "killall",
			bindKey: {win: 'Ctrl-.', mac: "Command-."},
			exec: killall,
			readOnly: false
		});

		editor.on('input', function()
		{
			if(name == clientName)
				broadcastTyping(editor.getValue());
		});

		input = document.getElementById('terminal'+name);
		input.style.fontSize = '1.1em';
		input.style.overflow = "hidden";
		//input.style.fontSize = '14px';
		input.position = "relative";
		//input.position = "absolute";
		editors[name] = editor;

		//Terminal nameTag
		nameTag = document.createElement("textarea");
		nameTag.className = "nameTag";
		nameTag.id = "nameTag"+name;
		nameTag.name = "nameTag"+name;
		nameTag.value = name;
		nameTag.readOnly = true;
		nameTag.rows = 1;	
		nameTag.style.opacity = getShowingOpacity();
		nameTag.style.zIndex = 20;
		nameTag.style.height = "3%";
		div.appendChild(nameTag);

		if(name != clientName)
		{
			nameTag.style.color = "#902550";
			editor.setReadOnly(true);
			editor.setHighlightActiveLine(false);
		}

		else
		{
			editor.focus();
		}
		
	}

	input.style.opacity = getShowingOpacity();

	if(name == clientName)
	{
		input.style.top = "0px";
		if(total > 1)
		{
			input.style.height = (document.documentElement.clientHeight * 0.5 * 1) + "px";
		}
		else
		{
			input.style.height = (document.documentElement.clientHeight * 1) + "px";
		}
	}
	else
	{
		var half = document.documentElement.clientHeight * 0.5;
		input.style.top = (half + (document.documentElement.clientHeight * 0.5 * ((num-1)/(total-1)))) + "px";
		input.style.height = (document.documentElement.clientHeight * 0.5* (1/(total-1))) + "px";
	}

	
	input.style.width = (document.documentElement.clientWidth * 0.75) + "px";

	/*
	var editor = document.getElementById('terminalEditor'+name);
	editor.style.opacity = getShowingOpacity();
	editor.style.top = (document.documentElement.clientHeight * 0.78 * (num/total)) + "px";
	editor.style.height = (document.documentElement.clientHeight * 0.78 * (1/total)) + "px";*/
	setTimeout(function(){editors[name].resize(true)}, 2100); // waits till animation is done to resize

	/*
	var mirror = CodeMirror.fromTextArea(input, {
		extraKeys: {
			"Shift-Enter": parseCurrentLine,
			"Ctrl-Enter": parseCurrentLine,
			"Cmd-Enter": parseCurrentLine
		},
		readOnly: name != clientName,
		lineNumbers: false,
		showCursorWhenSelecting: true,
		autofocus: name == clientName,
		mode: "haskell"
	});

	mirrors[name] = mirror;*/

	//mirrors[name].getDoc().style.top = (document.documentElement.clientHeight * 0.78 * (num/total));
	//mirrors[name].setSize(null, (document.documentElement.clientHeight * 0.78 * (1/total)));
	//mirrors[name].refresh();

	nameTag.style.opacity = getShowingOpacity();

	if(name == clientName)
	{
		nameTag.style.top = (document.documentElement.clientHeight * 1.0 * (num/total)) + "px";
	}
	else
	{
		var half = document.documentElement.clientHeight * 0.5;
		nameTag.style.top = (half + (document.documentElement.clientHeight * 0.5 * ((num-1)/(total-1)))) + "px";
	}

	//nameTag.style.height = (document.documentElement.clientHeight * 0.8 * (1/total)) + "px";
}

function removeTextArea(id)
{
	var input = document.getElementById("terminal" + id);
    if(input != null)
    {
		input.style.zIndex = "1";
		input.style.opacity = "0.0";

		var nameTag = document.getElementById("nameTag" + id);
		nameTag.style.zIndex = "1";
		nameTag.style.opacity = "0.0";

		//setTimeout(function(){
		//	input.parentNode.removeChild(input);
		//	nameTag.parentNode.removeChild(nameTag);
		//},6000);
    }
}

function removeDeadUserTerminals(oldUsers,newUsers)
{
	for(i=0;i<oldUsers.length;i++)
	{
		var userToCheck = oldUsers[i];
		if(!containsUser(userToCheck,newUsers))
       	{
           	removeTextArea(userToCheck.name);
       	}
	}
}

function containsUser(user, usersToCheck)
{
	for(i=0;i<usersToCheck.length;i++)
	{
		if(usersToCheck[i].name == user.name)
			return true;
	}	

	return false;
}

function hideTextAreas()
{
	for (var i=0;i<users.length;i++)
	{ 
		var input = document.getElementById("terminal"+users[i].name);
		var nameTag  = document.getElementById("nameTag"+users[i].name); 
		
		if(input!= null)
		{
			input.style.opacity = "0.0";
			nameTag.style.opacity = "0.0";
		}
	}

	var postArea = document.getElementById("post");
	postArea.style.opacity = "0.0";
}

function getShowingOpacity()
{
	if(playingMadness)
		return "0.0";
	else
		return "1.0";
}

function showTextAreas()
{
	for (var i=0;i<users.length;i++)
	{ 
		var input = document.getElementById("terminal"+users[i].name);
		
		if(input!= null)
		{
			input.style.opacity = getShowingOpacity();
		}
	}

	var postArea = document.getElementById("post");
	postArea.style.opacity = getShowingOpacity();
}

function networkCursor()
{
	var editor = editors[clientName];

	broadcastCursor(editor.getCursorPosition().row,editor.getCursorPosition().column); 
	//console.log(".getCursorPosition(): " + editor.getCursorPosition().row + "," + editor.getCursorPosition().column);
}
