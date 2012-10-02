/* 
    Lich.js - JavaScript audio/visual live coding language
    Copyright (C) 2012 Chad McKinney
	
	http://chadmckinneyaudio.com/
	seppukuzombie@gmail.com
	
	All rights reserved.
	
	Licensed under the Modified BSD License

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:
	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.
	    * Neither the name of the <organization> nor the
	      names of its contributors may be used to endorse or promote products
	      derived from this software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
	DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var ctrlDown = false; // Global for input commands

function colorize(str)
{

}

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
	var ctrl = document.getElementById("terminal");
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
	var ctrl = document.getElementById("terminal");
	
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

// http://css-tricks.com/snippets/javascript/support-tabs-in-textareas/
function tab()
{	
	var currentCaretPosition, newCaretPosition, textarea;
	currentCaretPosition = getCaretPosition();
	textarea = document.getElementById("terminal");
    newCaretPosition = currentCaretPosition + "    ".length;
    
    textarea.value = textarea.value.substring(0, currentCaretPosition) + "    " 
    	+ textarea.value.substring(currentCaretPosition, textarea.value.length);

    setCaretPosition(newCaretPosition);
    return false;
}

function post(text)
{
	var obj = document.getElementById("post");
	var appendedText = document.createTextNode(text + "\n");
	obj.appendChild(appendedText);
	obj.scrollTop = obj.scrollHeight;
}

function currentLine()
{
	var cursor, terminal, lineLength, lineNum, start, end, textArea;
	terminal = document.getElementById("terminal");
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

function parseArray(token)
{
	var lichTokenArray = tokenize(token.substring(1, token.length - 1)); // Tokenize string without the array brackets
	var lichObjectArray = new Array();

	for(var i = 0; i < lichTokenArray.length; ++i) // Convert the contents of the token into an array of tokens
	{
		lichObjectArray.push(parseToken(lichTokenArray[i])); 
	}
	
	return new LichArray(lichObjectArray);
}

function parseFunctionDefinition(token)
{
	var currentIndex, argumentTokens, bodyTokens, bodyObjects;
	bodyObjects = new Array();
	currentIndex = 0;
	
	if(token[0] == ":") // If arguments are supplied
	{
		for(currentIndex = 0; currentIndex < token.length; ++currentIndex)
		{
			if(token[currentIndex] == "{") // Found beginning of the body
			{
				break;
			}
		}

		argumentTokens = tokenize(token.substring(1, currentIndex)); // Parse the argument sub string and create the individual tokens
	}
	
	else // Otherwise, no arguments
	{
		argumentTokens = new Array();
	}
		
	bodyTokens = tokenize(token.substring(currentIndex + 1, token.length - 1));
	for(var i = bodyTokens.length - 1; i >= 0; --i) // Iterate through the tokens, parsing them into objects
	{
		bodyObjects.push(parseToken(bodyTokens[i]));
	}
	
	return new LichFunction(argumentTokens, bodyObjects);
}

function parseToken(token)
{ 
	var object = parseFloat(token);
		
	if(isNaN(object))
	{
		if(token[0] == "[") // If it is an array
		{	
			object = parseArray(token);
		}
		
		else if(token[0] == "'" || token[0] == "\"") // If it is a String
		{
			object = new LichString(token.substring(1, token.length - 1));
		}
		
		else if(token[0] == ":" && token[1] == ":") // If it is a function call
		{
			object = LichVM.get("::");
		}
		
		else if((token[0] == ":" && token[1] != ":") || token[0] == "{") // If it is a function definition
		{
			object = parseFunctionDefinition(token); 
		}
		
		else if(!LichVM.isNil(token)) // If we find the token, assign the object to it
		{
			object = LichVM.get(token);
		}
		
		else						// Otherwise it is a new variable
		{
			object = new LichVariable(token);
		}
	}
	
	else
	{
		object = new LichFloat(object);
	}	
	
	return object;	
}

function tokenizeString(string, currentIndex)
{
	var arrayStart, arrayEnd;
	arrayStart = currentIndex;
	currentIndex = currentIndex + 1;
	arrayEnd = currentIndex;

	while(currentIndex < string.length) // Iterate to collect the entire string
	{
		if(string[currentIndex] == "'" || string[currentIndex] == "\"") // If this is the end of the string
		{
			currentIndex += 1;
			arrayEnd = currentIndex;
			
			return {
				string: string.substring(arrayStart, arrayEnd),
				index: currentIndex
			}
		}

		++currentIndex;
	}

	if(arrayStart == arrayEnd) // If no closing bracket is found, post error
	{
		post("ERROR: NO CLOSING STRING ' FOUND. YOU ARE WEAK MINDED.\n");
		return "' '";
	}
}

function tokenizeArray(string, currentIndex)
{
	var arrayStart, arrayEnd;
	arrayStart = currentIndex;
	++currentIndex;
	arrayEnd = currentIndex;

	while(currentIndex < string.length) // Iterate to collect the entire array
	{
		if(string[currentIndex] == "[") // If this is a multichannel array
		{
			var subArrayToken = tokenizeArray(string, currentIndex);
			currentIndex = subArrayToken.index; // We aren't parsing the new array right now, so we'll just fast forward to the end of it
		}
		
		else if(string[currentIndex] == "]") // If this is the end of the array
		{
			currentIndex += 1;
			arrayEnd = currentIndex;
			
			return {
				string: string.substring(arrayStart, arrayEnd),
				index: currentIndex
			}
		}
		
		else
		{
			++currentIndex;
		}
	}

	if(arrayStart == arrayEnd) // If no closing bracket is found, post error
	{
		post("ERROR: NO CLOSING ARRAY BRACKET FOUND. YOU ARE WEAK MINDED.\n");
		return "[ ]";
	}
}

function tokenizeFunctionDefinition(string, currentIndex)
{
	var functionStart, functionEnd, initialFunctionBodyFound;
	functionStart = functionEnd = currentIndex;
	initialFunctionBodyFound = 0;
	
	while(currentIndex < string.length) // Iterate to collect the entire function
	{
		
		if(string[currentIndex] == "{") // If this is a new function definition inside the current function
		{
			if(initialFunctionBodyFound == 0)
			{
				initialFunctionBodyFound = 1;
				++currentIndex;
			}
			
			else
			{
				var subFunctionToken = tokenizeFunctionDefinition(string, currentIndex);
				currentIndex = subFunctionToken.index; // We aren't parsing the new function right now, so we'll just fast forward to the end of it
			}
		}
		
		else if(string[currentIndex] == "}") // If this is the end of the function
		{
			currentIndex += 1;
			functionEnd = currentIndex;
			
			return {
				string: string.substring(functionStart, functionEnd),
				index: currentIndex
			}
		}
		
		else
		{
			++currentIndex;
		}
	}

	if(functionStart == functionEnd) // If no closing bracket is found, post error
	{
		post("ERROR: NO CLOSING FUNCTION BRACKET FOUND IN FUNCTION DEFINITION. STOP BEING SUCH A FAIL FACE.\n");
		return "{ }";
	}
}

function tokenize(string) // Break up a string into an array of tokens
{
	var tokens, tokenStart, tokenEnd;
	tokens = new Array();
	tokenStart = tokenEnd = 0;
	
	string = trim11(string); // Remove spaces from the beginning and end
	string = string.replace(/ +/g, " "); // remove duplicate white space
		
	for(var i = 0; i < string.length; ++i) // Iterate through the string
	{	
		var currentChar = string[i];
		
		if(string[i] == '/' && string[i + 1] == '/') // If we find the beginning of a comment
		{
			return tokens;
		}
		
		// If we find a space, line end, begin bracket, colon, or begin curly brack then substring a new token
		else if(currentChar == " " || i == string.length - 1 || currentChar == "[" || currentChar == ":" || currentChar == "{" 
			|| currentChar == "'" || currentChar == "\"" || currentChar == "~") 
		{		
			if(string[i] == "[") // If this is an array
			{	
				var arrayToken = tokenizeArray(string, i);
				tokens.push(arrayToken.string);
				i = arrayToken.index;
				tokenStart = tokenEnd = i + 1; // Reassign the tokenStart/tokenEnd to the next character
			}
			
			else if(string[i] == "'" || string[i] == "\"") // If this is a String
			{
				var stringToken = tokenizeString(string, i);
				tokens.push(stringToken.string);
				i = stringToken.index;
				tokenStart = tokenEnd = i + 1;
			}
			
			else if(string[i] == ":" && string[i + 1] == ":") // If this is a function call
			{
				i += 2;
				tokenEnd = i;
				tokens.push(string.substring(tokenStart, tokenEnd));
				tokenStart = tokenEnd = i; // Reassign the tokenStart/tokenEnd to the next character
			}
			
			else if((string[i] == ":" && string[i + 1] != ":") || string[i] == "{") // If this is a function definition
			{
				var functionDefinitionToken = tokenizeFunctionDefinition(string, i);
				tokens.push(functionDefinitionToken.string);
				i = functionDefinitionToken.index;
				tokenStart = tokenEnd = i + 1; // Reassign the tokenStart/tokenEnd to the next character
			}
			
			else
			{
				if(i == string.length - 1) 	// If line end, assign the token end to the end of the string
				{
					tokenEnd = i + 1;
				}

				else						// Otherwise, assign to i
				{
					tokenEnd = i;
				}
				
				tokens.push(string.substring(tokenStart, tokenEnd));
				tokenStart = tokenEnd = i + 1; // Reassign the tokenStart/tokenEnd to the next character
			}
		}
	}
	
	return tokens;
}

function parseCurrentLine()
{	
	// Tokenize current line
	var tokens, objects, line;
	line = currentLine();
	tokens = tokenize(line.line);
	objects = new Array();
	
	for(var i = 0; i < tokens.length; ++i) // populate the objects array
	{
		var object = parseToken(tokens[i]);
		objects.push(object);
	}
	
	for(var i = objects.length - 1; i >= 0; --i)
	{
		LichVM.push(objects[i]);
	}
	
	if(objects.length > 0) // If there were objects, print the state of the VM. Otherwise, No code, or it was a comment
	{
		LichVM.interpretStack();
		LichVM.printState();
	}

	setCaretPosition(line.end + 1); // Move the cursor to the next line
}

function keyDown(thisEvent)
{	
	switch(thisEvent.keyCode)
	{
	case 9: // Tab key
		return tab();
		break;

	case 13: // Enter key
	
		if(ctrlDown)
		{
			parseCurrentLine();
        	return false; // do nothing
		}
	
		break;

	case 16: // shift
	case 17: // Ctrl
	case 18: // alt
	case 91: // Webkit left command
	case 93: // Webkit right command
	case 224: // Firefox command
		ctrlDown = true;
		break;
	}
}

function keyUp(thisEvent)
{
	switch(thisEvent.keyCode)
	{
	case 16: // shift
	case 17: // Ctrl
	case 18: // alt
	case 91: // Webkit left command
	case 93: // Webkit right command
	case 224: // Firefox command
		ctrlDown = false;
		break;
	}
}