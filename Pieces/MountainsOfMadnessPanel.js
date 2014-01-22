//Chat

var madnessPanel;
var madnessPanel2;
var playerInput;
var playingMadness = false;
var whichPanel = 1;
var bubble;
var bubble2;
var bubble3;
var bubble4;

var bubbleHolder1;
var bubbleHolder2;

function initPanel()
{
	var div = document.getElementById("textdiv");

	var bubbleHolder1 = document.createElement("div");
	bubbleHolder1.id = "bubbleHolder1";
	bubbleHolder1.name = "bubbleHolder1";
	document.documentElement.appendChild(bubbleHolder1);

	var bubbleHolder2 = document.createElement("div");
	bubbleHolder2.id = "bubbleHolder2";
	bubbleHolder2.name = "bubbleHolder2";	
	document.documentElement.appendChild(bubbleHolder2);

	bubble = document.createElement("div");
	bubble.className = "outerBubble";
	bubble.id = "bubbleDiv";
	bubble.name = "bubbleDiv";
	bubble.style.top = "0px"
	bubble.style.height = (document.documentElement.clientHeight * 0.8) + "px";
	bubble.style.width = (document.documentElement.clientWidth * 1.0) + "px";

	bubbleHolder1.appendChild(bubble);

	bubble2 = document.createElement("div");
	bubble2.className = "innerBubble";
	bubble2.id = "bubbleDiv2";
	bubble2.name = "bubbleDiv2";

	bubble.appendChild(bubble2);

	bubble3 = document.createElement("div");
	bubble3.className = "outerBubble";
	bubble3.id = "bubbleDiv3";
	bubble3.name = "bubbleDiv3";
	bubble3.style.top = "0px"
	bubble3.style.height = (document.documentElement.clientHeight * 0.8) + "px";
	bubble3.style.width = (document.documentElement.clientWidth * 1.0) + "px";

	bubbleHolder2.appendChild(bubble3);

	bubble4 = document.createElement("div");
	bubble4.className = "innerBubble";
	bubble4.id = "bubbleDiv4";
	bubble4.name = "bubbleDiv4";

	bubble3.appendChild(bubble4);

	madnessPanel = document.createElement("div");
	madnessPanel.className = "fadeElement";
	madnessPanel.id = "madnessPanel";
	madnessPanel.name = "madnessPanel";
	madnessPanel.style.opacity = "0.0";

	bubble2.appendChild(madnessPanel);

	madnessPanel2 = document.createElement("div");
	madnessPanel2.className = "fadeElement";
	madnessPanel2.id = "madnessPanel2";
	madnessPanel2.name = "madnessPanel2";
	madnessPanel2.style.opacity = "0.0";
	
	bubble4.appendChild(madnessPanel2);

	playerInput = document.createElement("textarea");
	playerInput.className = "terminal";
	playerInput.id = "playerInput";
	playerInput.name = "playerInput";
	playerInput.spellcheck = false;
	playerInput.readOnly = false;
	playerInput.style.zIndex = 21;
	playerInput.rows = 1;	
	playerInput.style.width = "100%";
	playerInput.style.top = "85%";
	playerInput.style.opacity = "1.0"
	playerInput.style.left = "0%"
	playerInput.style.fontSize = "200%"
	playerInput.style.textAlign="center"
	playerInput.style.height = "15%";
	playerInput.style.fontFamily = "'OCRAMedium'";

	div.appendChild(playerInput);

	playerInput.onkeydown = onKeyDown;

	playingMadness = true;

	hideTextAreas();
}

function _prUpdateNarration(narrationString)
{
	if(madnessPanel == null)
		initPanel();

	var newNarrationString = narrationString;
	if(lastPlayerInput!=null)
		newNarrationString =  "<p Class=playerInputText><br>&gt; " + lastPlayerInput + "</p><br>" + newNarrationString;

	//madnessPanel.value = chat.value + "\n" + chatString;
	if(whichPanel == 1)
	{
		whichPanel = 2;
		

		madnessPanel.innerHTML = newNarrationString;
		setTimeout(function(){madnessPanel.style.opacity = "1.0";},2500);
		madnessPanel2.style.opacity = "0.0";
	}
	else
	{
		whichPanel = 1;
		madnessPanel2.innerHTML = newNarrationString;
		setTimeout(function(){madnessPanel2.style.opacity = "1.0";},2500);
		madnessPanel.style.opacity = "0.0";
	}
}

function updateNarration(narrationString, ret)
{
	Lich.collapse(narrationString, function(nString)
	{
		console.log("updateNarration: \n"+nString);

		if(Lich.VM.currentThread !== "main")
			_evalInMainThread("_prUpdateNarration", [nString]);
		else
			_prUpdateNarration(nString);

		//ret(nString);
	});
}


/*
function addNarration(narrationString)
{
	if(madnessPanel == null)
		initPanel();

	//madnessPanel.value = chat.value + "\n" + chatString;
	madnessPanel.value = madnessPanel.value + narrationString;
	madnessPanel.style.overFlow = "hidden";

	madnessPanelScroll();
}
*/

function madnessPanelScroll(panel)
{
	panel.scrollTop = panel.scrollTop + 1;

	if(panel.scrollTop < (panel.scrollHeight - panel.clientHeight))
		setTimeout(madnessPanelScroll(panel),5);
}

var lastPlayerInput;

function compileFromPlayerInput()
{
	if(playingMadness)
	{
		var line = currentLine("playerInput");
		lastPlayerInput = line.line;
		var str = line.line + " \"" + clientName + "\"";
		console.log("Player input: " + str);
		broadcastLichCode(str);

		var ast = Lich.parse(str); // interactive parsing
			// var ast = Lich.parseLibrary(str); // For library parsing testing
			//Lich.post(Lich.showAST(ast));
			
			//Lich.VM.Print(Lich.compileAST(ast));
			Lich.compileAST(ast, function(res)
			{
				//Lich.VM.Print(res);
				//Lich.post("JS Source> " + res);
				
				try
				{
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
					console.log(e);
					throw e;
				}
			})

		playerInput.value = "";
	}
}

function onKeyDown(thisEvent)
{
	switch(thisEvent.keyCode)
	{
	case 9: // Tab key
		// Prevent line return in the textarea. We have to check which method to use. Web development is fun. Yaaay.......
		(arguments[0].preventDefault) ? arguments[0].preventDefault() : arguments[0].returnValue = false;
		return tab();
		break;

	case 13: // Enter key
	
		if(ctrlDown)
		{
			compileFromPlayerInput();
			// Prevent line return in the textarea. We have to check which method to use. Web development is fun. Yaaay.......
			(arguments[0].preventDefault) ? arguments[0].preventDefault() : arguments[0].returnValue = false;
        	return false; // do nothing
		}
	
		break;

	case 16: // shift
		ctrlDown = true;
		shiftDown = true;
		break;

	case 17: // Ctrl
	case 18: // alt
	case 91: // Webkit left command
	case 93: // Webkit right command
	case 224: // Firefox command
		ctrlDown = true;
		break;
	}

}


function madnessIntro()
{
	if(madnessPanel == null)
		initPanel();

	var narrationArray = [];
	narrationArray.push("<p class=\"redText\">AT THE MOUNTAINS OF MADNESS</p>");
	narrationArray.push("A performance based on the story by H.P. Lovecraft, with inspiration from the text based game Zork.");
	narrationArray.push("Created by the members of<br><br><p class=\"redText\">GLITCH LICH</p><br>An intercontinental laptop band.");
	narrationArray.push("Tonight you will hear a live performance by the four members who are each in a different location:<br><br>Cole Ingraham - Shanghai,PRC<br>Chad McKinney - Brighton,UK<br>Curtis McKinney - Brooklyn,NY<br>Ben O'Brien - Gainsville,FL");
	narrationArray.push("&quot;The most merciful thing in the world, I think, is the inability of the human mind to correlate all its contents. We live on a placid island of ignorance in the midst of black seas of the infinity, and it was not meant that we should voyage far.&quot;<br><br>― H.P. Lovecraft");

	narrationArray.push("");

	narrationArray.push("There was an ineffable majesty of the whole scene, and a queer state of my sensations at being in the lee of vast, silent pinnacles whose ranks shot up like a wall reaching the sky at the world’s rim.");
	narrationArray.push("I stood amongst the ruins of my forward scout's base camp. They had gone missing. We are part of a small group of biologists exploring the reaches of Antartica.");
	narrationArray.push("To the north, east, and west I can see three prominent mounds of snow. Given the scout's absence, this seemed ominous. Amongst the tattered bedrolls I see a worn diary.<br><br> What should I do?");


	var time = 7000;
	setTimeout(function(){_prUpdateNarration(narrationArray[0]);},(0*time)+1);
	setTimeout(function(){_prUpdateNarration(narrationArray[1]);},(1*time)+1);
	setTimeout(function(){_prUpdateNarration(narrationArray[2]);},(2*time)+1);
	setTimeout(function(){_prUpdateNarration(narrationArray[3]);},(3*time)+1);
	setTimeout(function(){_prUpdateNarration(narrationArray[4]);},(5*time)+1);
	
	setTimeout(function(){_prUpdateNarration(narrationArray[5]);},(7*time)+1);
	
	setTimeout(function(){_prUpdateNarration(narrationArray[6]);},(8*time)+1);
	setTimeout(function(){_prUpdateNarration(narrationArray[7]);},(10*time)+1);
	setTimeout(function(){_prUpdateNarration(narrationArray[8]);},(12*time)+1);
}
