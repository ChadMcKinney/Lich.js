////////////////////////////////////////////////////////////////////////
// Dynamic Webpage
////////////////////////////////////////////////////////////////////////


function writeTextToTerminal(id,text)
{
	if(id!=clientName)
		document.getElementById("terminal"+id).value = text;
}

function createTextAreas()
{
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

		/*
		//Terminal text area
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
		
		input.style.opacity = getShowingOpacity();
		*/
		div.appendChild(input);
		

		//Terminal nameTag
		nameTag = document.createElement("textarea");
		nameTag.className = "nameTag";
		nameTag.id = "nameTag"+name;
		nameTag.name = "nameTag"+name;
		nameTag.value = name;
		nameTag.readOnly = true;
		nameTag.rows = 1;	
		nameTag.style.opacity = getShowingOpacity();
		nameTag.style.zIndex = 0;
		div.appendChild(nameTag);

		if(name == clientName)
			input.focus();
		else
			nameTag.style.color = "rgb(166,48,48)";
	}
		
	
	input.style.opacity = getShowingOpacity();
	input.style.top = (document.documentElement.clientHeight * 0.78 * (num/total)) + "px";
	input.style.height = (document.documentElement.clientHeight * 0.78 * (1/total)) + "px";

	nameTag.style.opacity = getShowingOpacity();
	nameTag.style.top = (document.documentElement.clientHeight * 0.8 * (num/total)) + "px";
	nameTag.style.height = (document.documentElement.clientHeight * 0.8 * (1/total)) + "px";

	var mirror = CodeMirror(input, {
		extraKeys: {
			"Shift-Enter": parseCurrentLine
		}
	});
	mirror.mode = "haskell";
	mirror.setSize(null, (document.documentElement.clientHeight * 0.78 * (1/total)) + "px");
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

