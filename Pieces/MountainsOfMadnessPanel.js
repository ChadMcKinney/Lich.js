//Chat

var madnessPanel;

function initPanel()
{
	var div = document.getElementById("textdiv");	

	madnessPanel = document.createElement("textarea");
	madnessPanel.className = "terminal";
	madnessPanel.id = "madnessPanel";
	madnessPanel.name = "madnessPanel";
	madnessPanel.spellcheck = false;
	madnessPanel.readOnly = true;

	madnessPanel.style.zIndex = 21;

	div.appendChild(madnessPanel);

	madnessPanel.rows = 1;	
	madnessPanel.style.width = "100%";
	madnessPanel.style.top = "5%";
	madnessPanel.style.opacity = "1.0"
	madnessPanel.style.left = "0%"
	madnessPanel.style.fontSize = "300%"
	madnessPanel.style.textAlign="center"
	madnessPanel.style.height = "80%";
	madnessPanel.style.fontFamily = "'OCRAMedium'";

	var div = document.getElementById("post");
	post.style.opacity = "0.1";
}

function updateNarration(narrationString)
{
	if(madnessPanel == null)
		initPanel();

	//madnessPanel.value = chat.value + "\n" + chatString;
	madnessPanel.value = narrationString;
	madnessPanel.style.overFlow = "hidden";

	madnessPanelScroll();
}

function madnessPanelScroll()
{
	madnessPanel.scrollTop = madnessPanel.scrollTop + 3;

	if(madnessPanel.scrollTop < (madnessPanel.scrollHeight - madnessPanel.clientHeight))
		setTimeout(madnessPanelScroll,1);
}