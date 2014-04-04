/* 
    Lich.js - JavaScript audio/visual live coding language
    Copyright (C) 2012 Chad McKinney

	"http://chadmckinneyaudio.com/
	seppukuzombie@gmail.com

	LICENSE
	=======

	Licensed under the Simplified BSD License:

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met: 

	1. Redistributions of source code must retain the above copyright notice, this
	   list of conditions and the following disclaimer. 
	2. Redistributions in binary form must reproduce the above copyright notice,
	   this list of conditions and the following disclaimer in the documentation
	   and/or other materials provided with the distribution. 

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

	The views and conclusions contained in the software and documentation are those
	of the authors and should not be interpreted as representing official policies, 
	either expressed or implied, of the FreeBSD Project.
*/

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Lich DOM and Parser Util Functions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var ctrlDown = false;

function trim11 (str) // Trim white space from front and back of string
{	
    
	str = str.replace(/^\s+/, '');
    
	for (var i = str.length - 1; i >= 0; i--) 
	{
        if (/\S/.test(str.charAt(i))) 
        {
            str = str.substring(0, i + 1);
            break;
        }
    }
    
	return str;
}

function getInputSelection(el) 
{
    var start = 0, end = 0, normalizedValue, range,
        textInputRange, len, endRange;

    if(typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") 
	{
        start = el.selectionStart;
        end = el.selectionEnd;
    } 

	else 
	{
        range = document.selection.createRange();

        if(range && range.parentElement() == el) 
		{
            len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = el.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = el.createTextRange();
            endRange.collapse(false);

            if(textInputRange.compareEndPoints("StartToEnd", endRange) > -1) 
			{
                start = end = len;
            } 

			else 
			{
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;

                if(textInputRange.compareEndPoints("EndToEnd", endRange) > -1) 
				{
                    end = len;
                } 
				
				else 
				{
                    end = -textInputRange.moveEnd("character", -len);
                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                }
            }
        }
    }

    return {
        start: start,
        end: end
    };
}

function getCaretPosition () 
{
	var ctrl = document.getElementById("terminal"+clientName);
	var CaretPos = 0;	// IE Support
	
	if(document.selection) 
	{
		ctrl.focus();
		var Sel = document.selection.createRange();
		Sel.moveStart('character', -ctrl.value.length);
		CaretPos = Sel.text.length;
	}
	
	// Firefox support
	else if(ctrl.selectionStart || ctrl.selectionStart == '0')
		CaretPos = ctrl.selectionStart;
	
	return (CaretPos);
}

function setCaretPosition(pos)
{
	var ctrl = document.getElementById("terminal"+clientName);
	
	if(ctrl.setSelectionRange)
	{
		ctrl.focus();
		ctrl.setSelectionRange(pos,pos);
	}
	
	else if(ctrl.createTextRange) 
	{
		var range = ctrl.createTextRange();
		// range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character', pos);
		range.select();
	}
}

function insertText(text, caretOffset) // Text to insert, offset for caret after insertion
{
	var currentCaretPosition, newCaretPosition, textarea;
	currentCaretPosition = getCaretPosition();
	textarea = document.getElementById("terminal"+clientName);
    newCaretPosition = currentCaretPosition + text.length;
    
    textarea.value = textarea.value.substring(0, currentCaretPosition) + text 
    	+ textarea.value.substring(currentCaretPosition, textarea.value.length);

    setCaretPosition(newCaretPosition + caretOffset);
    return false;
}

// http://css-tricks.com/snippets/javascript/support-tabs-in-textareas/
function tab()
{	
	return insertText("    ", 0);
}

function login()
{
	//loginName = document.getElementById("userName").value;
	Lich.post("Logging in as user: "+clientName);
}

function currentLine(name)
{
	var cursor, terminal, lineLength, lineNum, start, end, textArea;
	terminal = document.getElementById(name);
	lineLength = 62;
	cursor = getInputSelection(terminal).end;
	textArea = terminal.value;
	
	if(terminal.selectionStart == terminal.selectionEnd)
	{
		// If the cursor is at the end of the line, push it back so we can find the entire line
		if(textArea[cursor] == '\n' && textArea[cursor - 1] != '\n') 
			cursor -= 1;
			
		for(start = cursor; start >= 0 && textArea[start] != '\n'; --start);
		for(end = cursor; end < textArea.length && textArea[end] != '\n'; ++end);
		
		start += 1; // Remove the initial line break
	}
	
	else
	{
		start = terminal.selectionStart;
		end = terminal.selectionEnd;
	}
	
	return  {
		line: terminal.value.substring(start, end), // Return the subtring of the text area, which is the currently selected line
		end: end
	};
}

function currentLineCodeMirror(cm)
{
	var cursor, terminal, lineLength, lineNum, start, end, textArea;
	//terminal = document.getElementById(name);
	//lineLength = 62;
	//cursor = getInputSelection(terminal).end;
	cursor = cm.getCursor();
	textArea = cm.getValue();
	Lich.post("Cursor = " + cursor);
	if(!cm.somethingSelected())
	{
		/*
		// If the cursor is at the end of the line, push it back so we can find the entire line
		if(textArea[cursor] == '\n' && textArea[cursor - 1] != '\n') 
			cursor -= 1;
			
		for(start = cursor; start >= 0 && textArea[start] != '\n'; --start);
		for(end = cursor; end < textArea.length && textArea[end] != '\n'; ++end);
		
		start += 1; // Remove the initial line break*/

		return  {
			line: cm.getLine(cursor.line),
			end: end
		};
	}
	
	else
	{
		return {
			line: cm.getSelection()
		}
	}
}

function keyDown(thisEvent)
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
			parseCurrentLine();
			// Prevent line return in the textarea. We have to check which method to use. Web development is fun. Yaaay.......
			(arguments[0].preventDefault) ? arguments[0].preventDefault() : arguments[0].returnValue = false;
        	return false; // do nothing
		}
	
		break;

	case 16: // shift
		ctrlDown = true;
		shiftDown = true;
		break;

		/*
	case 57:

		if(shiftDown) // ( begin parentheses
		{
			return insertText(")", -1);
		}

		break;*/

	case 17: // Ctrl
	case 18: // alt
	case 91: // Webkit left command
	case 93: // Webkit right command
	case 224: // Firefox command
		ctrlDown = true;
		break;

		/*
	case 219: // [ square bracket
		if(!shiftDown) // ( begin square bracket
		{
			return insertText("]", -1);
		}

		break;

	case 222: // Quotation marks
		
		// Doesn't work with UK keyboards
		//if(shiftDown) // " double 
		//{
		//	return insertText("\"\"", -1);
		//}

		// else // ' single
		if(!shiftDown) {
			return insertText("'", -1);
		}
		
		break;*/
	}

	broadcastTyping(document.getElementById("terminal"+clientName).value);
}

function keyUp(thisEvent)
{
	switch(thisEvent.keyCode)
	{
	case 16: // shift
		ctrlDown = false;
		shiftDown = false;
		break;

	case 17: // Ctrl
	case 18: // alt
	case 91: // Webkit left command
	case 93: // Webkit right command
	case 224: // Firefox command
		ctrlDown = false;
		break;
	}

	broadcastTyping(document.getElementById("terminal"+clientName).value);
}

function parseCurrentLine(editor)
{
	var tokens, objects, line,str;
	//line = currentLineCodeMirror(cm);
	var selectionRange = editor.getSelectionRange();
	var str = "";

	if(selectionRange.isEmpty())
	{
		str = getCurrentFunctionBlock(editor);
		//str = editor.session.getLine(editor.selection.getCursor().row);
	}

	else
	{
		str = editor.session.getTextRange(selectionRange);
	}
	
	//Lich.post("Str = " + str);
	//str = line.line;
	broadcastLichCode(str);

	try
	{
		if(/\S/.test(str)) // if not just whitespace
		{
			var ast = Lich.parse(str); // interactive parsing
			// var ast = Lich.parseLibrary(str); // For library parsing testing
			//Lich.post(Lich.showAST(ast));
			
			//Lich.VM.Print(Lich.compileAST(ast));
			var res = Lich.compileAST(ast);
			//Lich.VM.Print(res);
			//Lich.post("JS Source> " + res);
				
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
	}
	
	catch(e)
	{
		if(Lich.Lexer.yy.lexer.yylloc.first_line != Infinity 
			&& Lich.Lexer.yy.lexer.yylloc.first_column != Infinity)
		{
			Lich.post(clientName + ": " +e + " found at [line, column]: [" + Lich.Lexer.yy.lexer.yylloc.first_line 
			+ ", " + Lich.Lexer.yy.lexer.yylloc.first_column + "]");
		}

		else
		{
			Lich.post(clientName + ": " +e + " found at [line, column]: [0, 0]");
		}

		//throw e;
	}
}

function getCurrentFunctionBlock(editor)
{
	var currentRow = editor.selection.getCursor().row;
	var startingRow = findStartingRow(editor,currentRow);
	var endingRow = findEndingRow(editor,currentRow+1);

	var str = "";

	for(var i=startingRow;i<endingRow;++i)
	{
		if(i>startingRow && i<endingRow)
			str = str + "\n" + editor.session.getLine(i);
		else
			str = str + editor.session.getLine(i);
	}
	return str;
}

function findStartingRow(editor,currentRow)
{
	var line = editor.session.getLine(currentRow);

	if(currentRow <= 0)
		return currentRow;
	else if(line == NaN || line == null || line == "" || line == "\n")
		return currentRow+1;
	else if(indentionLevel(line) == 0)
		return currentRow;
	else
		return findStartingRow(editor,currentRow-1);
}

function findEndingRow(editor,currentRow)
{
	var line = editor.session.getLine(currentRow);

	if(line == NaN || line == null || line == "" || line == "\n")
		return currentRow;
	else if(indentionLevel(line) == 0)
		return currentRow;
	else
		return findEndingRow(editor,currentRow+1);
}

function indentionLevel(text)
{
	return text.match(/^\s{0,2}/)[0].length;
}

function lerp(value1, value2, amount)
{
	return (value2 - value1) * amount + value1;
}

function exerp(value1, value2, amount)
{
	return Math.pow(value2 / value1, amount) * value1;
}

function compileLich()
{
	try
	{
		Soliton.print = Lich.post; // Set Soliton.print to our Lich.post function
		Soliton.printError = Lich.post; // Set Soliton.print to our Lich.post function
		Soliton.init();
		Lich.scheduler = new Soliton.SteadyScheduler();
		Lich.scheduler.start();
		
		var oRequest = new XMLHttpRequest();
		var sURL = "http://"
		         + self.location.hostname
		         + "/Library/Prelude.lich";

		oRequest.open("GET",sURL,false);
		//oRequest.setRequestHeader("User-Agent",navigator.userAgent);
		oRequest.send(null)

		if(oRequest.status == 200)
		{
			var ast = Lich.parseLibrary(oRequest.responseText); // For library parsing testing
			var preludeSource = Lich.compileAST(ast);
			//Lich.post(preludeSource);
			//Lich.VM.Print(eval(preludeSource));
			eval(preludeSource);
		}
		
		else 
		{
			Lich.post("Unable to load Prelude module.");
		}	
	}
	
	catch(e)
	{
		Lich.post(clientName + ": " + e);
		throw e;
	}
	
	/*
	CloudChamber.setup(document.getElementById("canvas"), 24, undefined, Lich.post); // Create the CloudChamber instance

	var lichShaderArray = new Array();
	
	for(var i = 0; i < CloudChamber.shaderArray.length; ++i)
	{
		lichShaderArray.push(CloudChamber.shaderArray[i]);
	}*/
	//Lich.scheduler.addScheduledEvent(Soliton.testMetrognome());
}
