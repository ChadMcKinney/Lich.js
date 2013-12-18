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

function insertText(text, caretOffset) // Text to insert, offset for caret after insertion
{
	var currentCaretPosition, newCaretPosition, textarea;
	currentCaretPosition = getCaretPosition();
	textarea = document.getElementById("terminal");
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
	loginName = document.getElementById("userName").value;
	post("Logging in as user: "+loginName);
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
		ctrlDown = true;
		shiftDown = true;
		break;

	case 57:

		if(shiftDown) // ( begin parentheses
		{
			return insertText("()", -1);
		}

		break;

	case 17: // Ctrl
	case 18: // alt
	case 91: // Webkit left command
	case 93: // Webkit right command
	case 224: // Firefox command
		ctrlDown = true;
		break;

	case 219: // [ square bracket
		if(!shiftDown) // ( begin parentheses
		{
			return insertText("[]", -1);
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
			return insertText("''", -1);
		}
		
		break;
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

function parseCurrentLine()
{
	var tokens, objects, line,str;
	line = currentLine("terminal");
	str = line.line;

	post("CODE: " + str);

	try
	{
		var res = Lich.parse(str);
		Lich.post(Lich.showAST(res));
	}
	
	catch(e)
	{
		Lich.post(e);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Lich Virtual Machine
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Lich machine commands
var OP_NOP = 0;
var OP_VOID = 1; 
var OP_COMPEQ = 2;
var OP_COMPNEQ = 3;
var OP_COMPGT = 4;
var OP_COMPLT = 5;
var OP_COMPGTEQ = 6;
var OP_COMPLTEQ = 7;
var OP_PLUS = 8;
var OP_MINUS = 9;
var OP_MUL = 10;
var OP_DIVIDE = 11;
var OP_NEG = 12;
var OP_POW = 13;
var OP_MOD = 14
var OP_IF = 15;
var OP_ASSIGN = 16;
var OP_FUNCASSIGN = 17;
var OP_FUNCINVOKE = 18;

// Parse Node types
var NODE_OP = 19;
var NODE_VAR = 20;
var NODE_CONST = 21;
var NODE_FUNC = 22;
var NODE_LIST = 23;
var NODE_ARGLIST = 24;
var NODE_EXPRLIST = 25;

// Object types
var LICH_CLOSURE = 26;

// Parse node, these are used to combine AST creation and code generation as this is just a simple script language.
function node()
{
	var type;
	var value;
	var children;
}

function createNode(type, value, children)
{
	var n = new node();
	n.type = type;
	n.value = value;
	n.children = new Array();

	for(var i = 2; i < arguments.length; ++i)
	{
		n.children.push(arguments[i]);
	}

	return n;
}

function LichClosure(parameterNames, expression, namespace, definedArguments)
{
	this.parameterNames = parameterNames ? parameterNames : new Array();
	this.numArgs = this.parameterNames.size;
	this.definedArguments = definedArguments ? definedArguments : 0;
	this.namespace = namespace ? namespace : {};
	this.type = LICH_CLOSURE;
	this.expression = expression;

	this.invoke = function(parameterValues)
	{
		for(var i = definedArguments; i < parameterValues.length; ++i)
		{
			this.namespace[this.parameterNames[i]] = parameterValues[i];
			this.definedArguments += 1;
		}

		if(this.definedArguments < this.parameterNames.length) // This allows partial application
		{
			return new LichClosure(this.parameterNames, this.expression, this.namespace, this.definedArguments);
		}

		else
		{
			LichVM.pushScope(this.namespace);
			var result = LichVM.interpretNode(this.expression);
			LichVM.popScope();
			return result;
		}
	}
}

function lichVirtualMachine()
{
	this.namespace = {};
	this.scopeStack = new Array();

	// pushScope and popScope allow for 
	this.pushScope = function(scope)
	{
		this.scopeStack.push(scope);
	}

	this.popScope = function()
	{
		this.scopeStack.pop();
	}
	
	this.getVar = function(varName) // Dynamically check scopes for a variable's value
	{
		var v = null;
		
		for(var i = this.scopeStack.length - 1; i >= 0; --i)
		{
			if(this.scopeStack[i][varName] != undefined)
				return this.scopeStack[i][varName];
		}

		v = this.namespace[varName];

		if(v == undefined)
			v = null;

		// post("LichVM.getVar("+varName+") = " + v);
		return v;
	}

	this.setVar = function(varName, value)
	{
		// post("LichVM.setVar("+varName+") = " + value);

		if(this.scopeStack.length > 0)
		 	this.scopeStack[this.scopeStack.length - 1][varName] = value;
		else
			this.namespace[varName] = value;
	}

	this.executeOperation = function(node)
	{
		switch(node.value)
		{
			case OP_NOP:
			case OP_VOID:
				return null;
				break;

			case OP_COMPEQ:
				return this.interpretNode(node.children[0]) == this.interpretNode(node.children[1]);
				break;

			case OP_COMPNEQ:
				return this.interpretNode(node.children[0]) != this.interpretNode(node.children[1]);
				break;

			case OP_COMPGT:
				return this.interpretNode(node.children[0]) > this.interpretNode(node.children[1]);
				break;

			case OP_COMPLT:
				return this.interpretNode(node.children[0]) < this.interpretNode(node.children[1]);
				break;

			case OP_COMPGTEQ:
				return this.interpretNode(node.children[0]) >= this.interpretNode(node.children[1]);
				break;

			case OP_COMPLTEQ:
				return this.interpretNode(node.children[0]) <= this.interpretNode(node.children[1]);
				break;

			case OP_PLUS:
				return this.interpretNode(node.children[0]) + this.interpretNode(node.children[1]);
				break;

			case OP_MINUS:
				return this.interpretNode(node.children[0]) - this.interpretNode(node.children[1]);
				break;

			case OP_MUL:
				return this.interpretNode(node.children[0]) * this.interpretNode(node.children[1]);
				break;

			case OP_DIVIDE:
				return this.interpretNode(node.children[0]) / this.interpretNode(node.children[1]);
				break;

			case OP_NEG:
				return -this.interpretNode(node.children[0]);
				break;

			case OP_POW:
				return Math.pow(this.interpretNode(node.children[0]), this.interpretNode(node.children[1]));
				break;

			case OP_MOD:
				return this.interpretNode(node.children[0]) % this.interpretNode(node.children[1]);
				break;

			case OP_IF:
				if(this.interpretNode(node.children[0]))
					return this.interpretNode(node.children[1]);
				else
					return this.interpretNode(node.children[2]);
				break;

			case OP_ASSIGN:
				var value = this.interpretNode(node.children[1]);
				this.setVar(node.children[0], value);
				return value;
				break;

			case OP_FUNCASSIGN:
				var argList = this.interpretNode(node.children[1]);
				var func = new LichClosure(argList, node.children[2]); // parameterNames, expression, namespace, definedArguments
				func = func.invoke(new Array());
				this.setVar(node.children[0], func);
				return func;
				break;

			case OP_FUNCINVOKE:
				var closure = this.getVar(node.children[0]);
				
				if(closure.type == LICH_CLOSURE) // Check to see if the result has been collapsed or not
				{
					var parameterValues = this.interpretNode(node.children[1]);
					return closure.invoke(parameterValues);
				}

				else // It's been collapsed, just return the result directly
				{
					return closure;
				}

				break;

			default:
				return node; // Raw values
				break;
		}
	}

	this.interpretNode = function(node)
	{
		if(node == null)
			return null;

		switch(node.type)
		{
			case NODE_OP:
				return this.executeOperation(node);
				break;

			case NODE_VAR:
				return LichVM.getVar(node.value);
				break;

			case NODE_FUNC:
				return LichVM.getVar(node.value);
				break;
			
			case NODE_CONST:
				return node.value;
				break;

			case NODE_ARGLIST:
				var args = new Array();
				args.push(node.value);
				
				for(var i = 0; i < node.children.length; ++i)
				{
					var val = this.interpretNode(node.children[i]);
					if(val != undefined)
						args.push(val);
				}
				
				return args;
				break;

			case NODE_EXPRLIST:
				var exprs = new Array();
				
				for(var i = 0; i < node.children.length; ++i)
				{
					var val = this.interpretNode(node.children[i]);
					if(val != undefined)
						exprs.push(val);
				}
				
				return exprs;
				break;

			default:
				return node;
				break;				
		}
	}

	this.compileProgram = function(program)
	{
		this.state = this.interpretNode(program);
		post(this.state);
	}
}

/*

function lichVirtualMachine() {
	
	// Methods
	this.isReserved = function(objectName)
	{
		if(this.namespace.hasOwnProperty(objectName))
		{
			return this.namespace[objectName].reserved;
		}
		
		else
		{
			return false;
		}
	}
	
	this.isNil = function(objectName)
	{
		return !this.namespace.hasOwnProperty(objectName);
	}
	
	this.addVar = function(objectName, object)
	{
		if(!this.isReserved(objectName))
		{
			this.namespace[objectName] = object;
			this.namespace[objectName].reserved = false;
		}
		
		else
		{
			post("VARIABLE " + objectName + " IS RESERVED. DON'T BE A FOOL.")
		}
	}
	
	this.reserveVar = function(objectName, object)
	{
		this.namespace[objectName] = object;
		this.namespace[objectName].reserved = true;
	}
	
	this.get = function(objectName)
	{
		if(!this.isNil(objectName))
		{
			return this.namespace[objectName];
		}
		
		else
		{
			return 0;
		}
	}
	
	this.push = function(object)
	{
		return this.stack.push(object);
	}
	
	this.pop = function()
	{
		return this.stack.pop();
	}
	
	this.interpretStack = function()
	{		
		this.sleep = 0;

		while(this.stack.length > 0 && this.sleep == 0)
		{
			var pointer = this.stack.pop();
			var value = pointer.value();
			this.state = value;	
		}
	}
	
	this.clearStack = function()
	{
		post("STACK CLEARED. APOCALYPSE.\n");
		while(this.stack.length > 0)
		{
			this.stack.pop();
		}
		
		return undefined;
	}

	this.freeStack = function()
	{
		for(var i = 0; i < this.stack.length; ++i)
		{
			if(this.stack[i].type() == 'Stream')
			{
				this.stack[i].stop();
			}
		}

		this.clearStack();
	}
	
	this.printState = function()
	{
		if(this.state == undefined)
		{
			// Taken out because it's annoying!
			// post("undefined");
		}

		else
		{
			if(this.state.constructor == Array) // Print Array
			{
				post(arrayToPrintString(this.state));
			}
			
			else if(this.state == '__LICH_PRINT_VALUE__') // Ignore the print value, it prints on it's own
			{
				
			}
			
			// If a Lich Object
			else if(this.state.constructor == LichFunction || this.state.constructor == LichPrimitive 
				|| this.state.constructor == LichEnvelope || this.state.constructor == LichStream)
			{
				if(this.state.type() == "Envelope")
				{
					var printString = arrayToPrintString(this.state.points.value());
					printString = printString.concat(" ").concat(this.state.shape);
					post(printString);
				}
				else
				{
					post(this.state.type());
				}
			}
			
			else
			{
				post(this.state);
			}
		}
	}
	
	// Member variables
	this.stack = new Array();
	this.state = 0;
	this.namespace = {};
	this.thread = "main";
	this.sleep = 0;
};

*/

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*

function stringToAscii(string)
{
	var asciiArray = new Array();
	
	for(var i = 0; i < string.length; ++i)
	{
		asciiArray.push(string[i].charCodeAt(0));
	}
	
	return asciiArray;
}

function asciiToString(asciiArray)
{
	var string = "";
	
	for(var i = 0; i < asciiArray.length; ++i)
	{
		string = string.concat(String.fromCharCode(asciiArray[i] % 256));
	}
	
	return string;
}

function numberArraySubtract(array, operand)
{
	for(var i = 0; i < array.length; ++i)
	{
		array[i] = array[i] - operand;
	}
	
	return array;
}

function numberArraySubtractArray(array, operand)
{
		
	for(var i = 0; i < array.length; ++i)
	{
		array[i] = array[i] - operand[i % operand.length];
	}
	
	return array;
}

function numberArrayDivide(array, operand)
{
	for(var i = 0; i < array.length; ++i)
	{
		array[i] = operand / array[i];
	}
	
	return array;
}

function numberArrayDividedBy(array, operand)
{
	for(var i = 0; i < array.length; ++i)
	{
		array[i] = array[i] / operand;
	}
	
	return array;
}

function numberArrayDivideArray(array, operand)
{
	for(var i = 0; i < array.length; ++i)
	{
		array[i] = operand[i % operand.length] / array[i];
	}
	
	return array;
}

function numberArrayDividedByArray(array, operand)
{
	for(var i = 0; i < array.length; ++i)
	{
		array[i] = array[i] / operand[i % operand.length];
	}
	
	return array;
}

function numberArrayMultiply(array, operand)
{
	for(var i = 0; i < array.length; ++i)
	{
		array[i] = array[i] * operand;
	}
	
	return array;
}

function numberArrayMultiplyArray(array, operand)
{
	for(var i = 0; i < array.length; ++i)
	{
		array[i] = array[i] * operand[i % operand.length];
	}
	
	return array;
}

function numberArrayModulus(array, operand)
{
	for(var i = 0; i < array.length; ++i)
	{
		array[i] = array[i] % operand;
	}
	
	return array;
}

function numberArrayModulusArray(array, operand)
{
	for(var i = 0; i < array.length; ++i)
	{
		array[i] = array[i] % operand[i % operand.length];
	}
	
	return array;
}

function arrayToPrintString(array) // Creates a printable string which represents the contents of an array. Supports multidimensional arrays.
{
	var printString = "[";

	for(var i = 0; i < array.length; ++i)
	{
		if(array[i].constructor == Array)
		{
			printString = printString.concat(arrayToPrintString(array[i]));
		}
		
		else if(array[i].constructor == LichFunction || array[i].constructor == LichPrimitive || array[i].constructor == LichArray 
			|| array[i].constructor == LichFloat || array[i].constructor == LichString || array[i].constructor == LichEnvelope
			|| array[i].constructor == LichVariable || array[i].constructor == LichStream) // Lich Object
		{			
			switch(array[i].type())
			{
			case 'Array':
				printString = printString.concat(arrayToPrintString(array[i].arrayVar));
				break;
				
			case 'String':
				printString = printString.concat(array[i].value());
				break;
				
			case 'Float':
				printString = printString.concat(array[i].value());
				break;

			case 'Envelope':
				printString = printString.concat(arrayToPrintString(array[i].points.value()));
				printString = printString.concat(" ").concat(array[i].shape);
				break;

			case 'Variable':
				printString = printString.concat(array[i].object.type());
				break;
				
			default:
				printString = printString.concat(array[i].type());
			}
		}
		
		else
		{
			printString = printString.concat(array[i]);
		}
		
		if(i < array.length - 1)
		{
			printString = printString.concat(", ");
		}
	}
	
	printString = printString.concat("]");
	return printString;
}

*/

function lerp(value1, value2, amount)
{
	return (value2 - value1) * amount + value1;
}

function exerp(value1, value2, amount)
{
	return Math.pow(value2 / value1, amount) * value1;
}

/*

function deserializeLichObjectNamespace(serializedNamespace)
{
	var namespace = {};

	for(key in serializedNamespace)
	{
		if(serializedNamespace.hasOwnProperty(key))
		{
			namespace[key] = deserializeLichObject(serializedNamespace[key]);
		}
	}

	return namespace;
}

function deserializeLichObject(serializedObject)
{
	var object;

	switch(serializedObject.type)
	{
	case 'String':
		object = new LichString(serializedObject.value);
		object.namespace = deserializeLichObjectNamespace(serializedObject.namespace);
		break;

	case 'Float':
		object = new LichFloat(parseFloat(serializedObject.value));
		object.namespace = deserializeLichObjectNamespace(serializedObject.namespace);
		break;

	case 'Array':
		var objectArray = new Array();

		for(var i = 0; i < serializedObject.value.length; ++i)
		{
			objectArray.push(deserializeLichObject(serliazedObject.value[i]));
		}

		object = new LichArray(objectArray);
		object.namespace = deserializeLichObjectNamespace(serializedObject.namespace);
		break;

	case 'Function':
		var objectFunctionArray = new Array();

		for(var i = 0; i < serializedObject.value.function.length; ++i)
		{
			objectFunctionArray.push(deserializeLichObject(serializedObject.value.function[i]));
		}

		object = new LichFunction(serializedObject.value.argNames, objectFunctionArray);
		object.namespace = deserializeLichObjectNamespace(serializedObject.namespace);
		break;

	case 'Primitive':
		var func = eval(serializedObject.value);
		object = new LichPrimitive(func, serializedObject.numArgs);
		break;

	case 'Variable': // Deserialize variable here
		object = new LichVariable(serializedObject.objectName);
		object.object = deserializeLichObject(serializedObject.value);
		break;

	case 'Envelope':
		object = new LichEnvelope(deserializeLichObject(serializedObject.value.points), deserializeLichObject(serializedObject.value.shape));
		object.namespace = deserializeLichObjectNamespace(serializedObject.namespace);
		break;

	case 'Stream':
		object = new LichStream(deserializeLichObject(serializedObject.value.durations), deserializeLichObject(serializedObject.value.values));
		object.namespace = deserializeLichObject(serializedObject.namespace);
		break;

	default:
		object = new LichString("COULD NOT SERIALIZE THIS OBJECT"); // Should probably come up with a better error method
		break;
	}

	return object;
}

*/

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Lich Classes 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// All classes must have the following methods value, call, type, length, at, insert, add, subtract, multiply, divide, modulus, equivalent, 
// inequivalent, greater than, less than, greater than equal, and less than equal, serialize, deserialize

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LichString
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*

function LichString(_stringVar) {
	
	// Public methods
	this.value = function()
	{
		return this.stringVar;
	}
	
	this.call = function()
	{
		return this.value();
	}
	
	this.type = function()
	{
		return 'String';
	}
	
	this.length = function()
	{
		return this.stringVar.length;
	}
	
	this.insert = function(index, value)
	{
		if(index.type() == 'Float')
		{
			if(value.type() == 'String' || value.type() == 'Float')
			{
				if(index.value() == 0)
				{
					this.stringVar = String(value.value()).concat(this.stringVar.substring(1, this.stringVar.length));
					LichVM.push(this);
					return this;
				}
				
				else if(index.value() >= this.stringVar.length)
				{
					this.stringVar = this.stringVar.concat(value.value());
					LichVM.push(this);
					return this;
				}
				
				else
				{
					var sub1 = this.stringVar.substring(0, index.value() - 1);
					var sub2 = this.stringVar.substring(index.value(), this.stringVar.length);
					this.stringVar = sub1.concat(value.value()).concat(sub2);
					LichVM.push(this);
					return this;
				}
			}

			else
			{
				var error = "YOU CAN'T INSERT A ";
				error = error.concat(value.type()).concat(" BY INDEX INTO A STRING. LAMENTABLY LAME.");
				post(error);
				LichVM.push(this);
				return this;
			}
		}

		else
		{
			this.namespace[index.value()] = value;
			LichVM.push(this);
			return this;
		}
	}
	
	this.at = function(index)
	{
		if(index.type() == 'Float')
		{
			LichVM.push(new LichString(this.stringVar[index.value() % this.stringVar.length]));
			return this.stringVar[index.value() % this.stringVar.length];	
		}

		else
		{
			if(this.namespace.hasOwnProperty(index.value()))
			{
				LichVM.push(this.namespace[index.value()]);
				return this.namespace[index.value()].value();
			}

			else
			{
				LichVM.push(this);
				return undefined;
			}
		}
	}
	
	
	this.add = function(object)
	{
		switch(object.type())
		{
		case 'String':
			var result = new LichString(this.stringVar + object.value());
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Float':
			var result = new LichString(this.stringVar + object.value());
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.add(object.call());
			break;
			
		case 'Primitive':
			return this.add(object.call());
			break;
			
		case 'Array':
			var objArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < object.length(); ++i)
			{
				this.add(objArray[i]); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.add(object.object);
			break;

		case 'Envelope':

			for(var i = 0; i < object.points.length(); ++i)
			{
				this.add(object.points.arrayVar[i].back());
				var newString = LichVM.pop(); // Pop the results off the stack
				this.stringVar = newString.stringVar; // Reassign the results
			}

			LichVM.push(this);
			return this.value();
			break;

		case 'Stream':
			return this.add(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.subtract = function(object)
	{
		switch(object.type())
		{
		case 'String':
			var result = new LichString(
							asciiToString(
								numberArraySubtractArray(stringToAscii(this.stringVar), stringToAscii(object.value()))
							)
			);
			
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Float':
			var resultString = this.stringVar;
			var result;
			resultString = resultString.substring(0, Math.max(0, resultString.length - object.value()));
			result = new LichString(resultString);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.subtract(object.call());
			break;
			
		case 'Primitive':
			return this.subtract(object.call());
			break;
			
		case 'Array':
			var objArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < object.length(); ++i)
			{
				this.subtract(objArray[i]); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.subtract(object.object);
			break;

		case 'Envelope':

			for(var i = 0; i < object.points.length(); ++i)
			{
				this.subtract(object.points.arrayVar[i].back());
				var newString = LichVM.pop(); // Pop the results off the stack
				this.stringVar = newString.stringVar; // Reassign the results
			}

			LichVM.push(this);
			return this.value();
			break;

		case 'Stream':
			return this.subtract(object.value());
			break;
		
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.divide = function(object)
	{
		switch(object.type())
		{
		case 'String':
			var result = new LichString(
							asciiToString(
								numberArrayDivideArray(stringToAscii(object.value()), stringToAscii(this.value()))
							)
			);
			
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Float':
			var resultString = this.stringVar;
			var result;
			resultString = resultString.substring(0, Math.max(0, resultString.length / object.value()));
			result = new LichString(resultString);
			
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.divide(object.call());
			break;
			
		case 'Primitive':
			return this.divide(object.call());
			break;
			
		case 'Array':
			var objArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < object.length(); ++i)
			{
				this.divide(objArray[i]); // Pushes the result onto the stack;
				result.push(LichVM.pop()); // Pop it back off the stack and store it in our array
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.divide(object.object);
			break;

		case 'Envelope':

			for(var i = 0; i < object.points.length(); ++i)
			{
				this.divide(object.points.arrayVar[i].back());
				var newString = LichVM.pop(); // Pop the results off the stack
				this.stringVar = newString.stringVar; // Reassign the results
			}

			LichVM.push(this);
			return this.value();
			break;

		case 'Stream':
			return this.divide(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
		}
	}
	
	this.multiply = function(object)
	{
		switch(object.type())
		{
		case 'String':
			var result = new LichString(
							asciiToString(
								numberArrayMultiplyArray(stringToAscii(this.stringVar), stringToAscii(object.value()))
							)
			);
			
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Float':
			var resultString = "";
			var result;
			var length = this.stringVar.length * object.value();
			
			for(var i = 0; i < length; ++i)
			{
				resultString = resultString.concat(this.stringVar[i % this.stringVar.length]);
			}
			
			result = new LichString(resultString);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.multiply(object.call());
			break;
			
		case 'Primitive':
			return this.multiply(object.call());
			break;
			
		case 'Array':
			var objArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < object.length(); ++i)
			{
				this.multiply(objArray[i]); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.multiply(object.object);
			break;

		case 'Envelope':

			for(var i = 0; i < object.points.length(); ++i)
			{
				this.multiply(object.points.arrayVar[i].back());
				var newString = LichVM.pop(); // Pop the results off the stack
				this.stringVar = newString.stringVar; // Reassign the results
			}

			LichVM.push(this);
			return this.value();
			break;

		case 'Stream':
			return this.multiply(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
		}
	}
	
	this.modulus = function(object)
	{
		switch(object.type())
		{
		case 'String':
			var result = new LichString(
							asciiToString(
								numberArrayModulusArray(stringToAscii(this.stringVar), stringToAscii(object.value()))
							)
			);
			
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Float':
			var result = new LichString(
							asciiToString(
								numberArrayModulus(stringToAscii(this.stringVar), object.value())
							)
			);
			
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.modulus(object.call());
			break;
			
		case 'Primitive':
			return this.modulus(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < object.length(); ++i)
			{
				this.modulus(objectArray[i]); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result back off the stack and store in our array
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.modulus(object.object);
			break;

		case 'Envelope':

			for(var i = 0; i < object.points.length(); ++i)
			{
				this.modulus(object.points.arrayVar[i].back());
				var newString = LichVM.pop(); // Pop the results off the stack
				this.stringVar = newString.stringVar; // Reassign the results
			}

			LichVM.push(this);
			return this.value();
			break;

		case 'Stream':
			return this.modulus(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
		}
	}
	
	this.equivalent = function(object)
	{
		switch(object.type())
		{
		case 'String':
			var bool = 0;
			var result;
			
			if(this.stringVar == object.value())
			{
				bool = 1;
			}
			
			result = new LichFloat(bool);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Float':
			result = new LichFloat(0);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.equivalent(object.call());
			break;
			
		case 'Primitive':
			return this.equivalent(object.call());
			break;
			
		case 'Array':
			return object.equivalent(this);
			break;
			
		case 'Variable':
			return this.equivalent(object.object);
			break;

		case 'Envelope':
			LichVM.push(new LichFloat(0));
			return 0;
			break;

		case 'Stream':
			return this.equivalent(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
		}
	}
	
	this.inequivalent = function(object)
	{
		switch(object.type())
		{
		case 'String':
			var bool = 0;
			var result;
			
			if(this.stringVar != object.value())
			{
				bool = 1;
			}
			
			result = new LichFloat(bool);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Float':
			result = new LichFloat(1);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.inequivalent(object.call());
			break;
			
		case 'Primitive':
			return this.inequivalent(object.call());
			break;
			
		case 'Array':
			return object.inequivalent(this);
			break;
			
		case 'Variable':
			return this.inequivalent(object.object);
			break;

		case 'Envelope':
			LichVM.push(new LichFloat(1));
			return 1;
			break;

		case 'Stream':
			return this.inequivalent(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(1));
			return 0;
		}
	}
	
	this.greaterThan = function(object)
	{
		switch(object.type())
		{
		case 'String':
			var bool = 0;
			var result;
			
			if(this.stringVar.length > object.value().length)
			{
				bool = 1;
			}
			
			result = new LichFloat(bool);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Float':
			result = new LichFloat(0);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.greaterThan(object.call());
			break;
			
		case 'Primitive':
			return this.greaterThan(object.call());
			break;
			
		case 'Array':
			return object.lessThan(this);
			break;
			
		case 'Variable':
			return this.greaterThan(object.object);
			break;

		case 'Envelope':
			LichVM.push(new LichFloat(0));
			return 0;
			break;

		case 'Stream':
			return this.greaterThan(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
		}
	}
	
	this.lessThan = function(object)
	{
		switch(object.type())
		{
		case 'String':
			var bool = 0;
			var result;
			
			if(this.stringVar.length < object.value().length)
			{
				bool = 1;
			}
			
			result = new LichFloat(bool);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Float':
			result = new LichFloat(0);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.lessThan(object.call());
			break;
			
		case 'Primitive':
			return this.lessThan(object.call());
			break;
			
		case 'Array':
			return object.greaterThan(this);
			break;
			
		case 'Variable':
			return this.lessThan(object.object);
			break;

		case 'Envelope':
			LichVM.push(new LichFloat(0));
			return 0;
			break;

		case 'Stream':
			return this.lessThan(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
		}
	}
	
	this.greaterThanEqual = function(object)
	{
		switch(object.type())
		{
		case 'String':
			var bool = 0;
			var result;
			
			if(this.stringVar.length >= object.value().length)
			{
				bool = 1;
			}
			
			result = new LichFloat(bool);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Float':
			result = new LichFloat(0);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.greaterThanEqual(object.call());
			break;
			
		case 'Primitive':
			return this.greaterThanEqual(object.call());
			break;
			
		case 'Array':
			return object.lessThanEqual(this);
			break;
			
		case 'Variable':
			return this.greaterThanEqual(object.object);
			break;

		case 'Envelope':
			LichVM.push(new LichFloat(0));
			return 0;
			break;

		case 'Stream':
			return this.greaterThanEqual(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
		}
	}
	
	this.lessThanEqual = function(object)
	{
		switch(object.type())
		{
		case 'String':
			var bool = 0;
			var result;
			
			if(this.stringVar.length <= object.value().length)
			{
				bool = 1;
			}
			
			result = new LichFloat(bool);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Float':
			result = new LichFloat(0);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.lessThanEqual(object.call());
			break;
			
		case 'Primitive':
			return this.lessThanEqual(object.call());
			break;
			
		case 'Array':
			return object.greaterThanEqual(this);
			break;
			
		case 'Variable':
			return this.lessThanEqual(object.object);
			break;

		case 'Envelope':
			LichVM.push(new LichFloat(0));
			return 0;
			break;

		case 'Stream':
			return this.lessThanEqual(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
		}
	}

	this.to = function(lichType)
	{
		switch(lichType)
		{
		case 'String':
			return this;
			break;
			
		case 'Float':
			return new LichFloat(stringToAscii(this.stringVar)[0]);
			break;
			
		case 'Function':
			return new LichFunction(new Array(), [this]);
			break;
			
		case 'Primitive':
			post("OBVIOUSLY you can't cast to a primtive, OBVIOUSLY.")
			break;
			
		case 'Array':
			var charArray = new Array();
			for(var i = 0; i < this.length(); ++i)
			{
				charArray.push(new LichString(this.stringVar[i]));
			}
			return new LichArray(charArray);
			break;
			
		case 'Variable':
			post("WTF. Casting to a Variable is like translating to vapid programmer speak.");
			break;

		case 'Envelope':
			var charArray = this.to('Array');
			var points = new Array();

			for(var i = 0; i < charArray; ++i)
			{
				var point = new Array();
				point.push(new LichFloat(i));
				point.push(charArray.arrayVar[i].to('Float'));
				points.push(new LichArray(point));
			}

			return new LichEnvelope(points, new LichString('linear'));
			break;

		case 'Stream':
			var asciiArray = stringToAscii(this.stringVar);
			var durations = new Array();

			for(var i = 0; i < asciiArray.length; ++i)
			{
				durations.push(new LichFloat(asciiArray[i]));
			}

			return new LichStream(new LichArray(durations), this);
			break;
			
		default:
			return this;
		}
	}

	this.play = function()
	{
		var newStream = this.to('Stream');
		LichVM.push(newStream);
		return newStream;
	}

	this.stop = function()
	{
		return this;
	}
	

	this.serialize = function() // Serialize the object into a JSON representation
	{
		var serialized = {};
		serialized.namespace = {};

		for(var key in this.namespace)
		{
			if(this.namespace.hasOwnProperty(key))
			{
				serialized.namespace[key] = this.namespace[key].serialize();
			}
		}

		serialized.value = this.stringVar;
		serialized.type = this.type();
		return serialized;
	}

	// Member vars
	this.stringVar = _stringVar;
	this.namespace = {};
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LichFloat
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function LichFloat(_floatVar) {
		
	// Public methods
	this.value = function()
	{
		return this.floatVar;
	}
	
	this.call = function()
	{
		return this.value();
	}
	
	this.type = function()
	{
		return 'Float';
	}
	
	this.length = function()
	{
		return 1;
	}
	
	this.insert = function(index, value)
	{
		if(value.type() == 'Float')
		{
			this.floatVar = value.value();
		}
		
		else
		{
			this.namespace[index.value()] = value;
		}

		LichVM.push(this);
		return this;
	}
	
	this.at = function(index)
	{
		if(index.type() == 'Float')
		{
			LichVM.push(this);
			return this.value();
		}

		else
		{
			if(this.namespace.hasOwnProperty(index.value()))
			{
				LichVM.push(this.namespace[index.value()]);
				return this.namespace[index.value()].value();
			}

			else
			{
				LichVM.push(this);
				return undefined;
			}
		}
	}
	
	
	this.add = function(object)
	{
		switch(object.type())
		{
		case 'String':
			var newString = String(this.floatVar).concat(object.value());
			LichVM.push(new LichString(newString));
			return newString;
			break;
			
		case 'Float':
			var result = new LichFloat(this.value() + object.value());
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.add(object.call());
			break;
			
		case 'Primitive':
			return this.add(object.call());
			break;
			
		case 'Array':
			return object.add(this);
			break;
			
		case 'Variable':
			return this.add(object.object);
			break;

		case 'Envelope':
			return object.add(this);
			break;

		case 'Stream':
			return this.add(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.subtract = function(object)
	{
		switch(object.type())
		{
		case 'String':
			return object.add(new LichFloat(this.value() * -1));
			break;
			
		case 'Float':
			var result = new LichFloat(this.value() - object.value());
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.subtract(object.call());
			break;
			
		case 'Primitive':
			return this.subtract(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < object.length(); ++i)
			{
				this.subtract(objectArray[i]); // Pushes the result onto the stack
				result.push(LichVM.pop()); // Pop it back off the stack and store it in our array
			}
		
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.subtract(object.object);
			break;

		case 'Envelope':
			var newPoints = new LichArray(new Array());
			
			for(var i = 0; i < object.points.length(); ++i)
			{
				var newPoint = new LichArray(new Array());
				var level = new LichFloat(this.value() - object.points.arrayVar[i].back().value());
				newPoint.push(object.points.arrayVar[i].front());
				newPoint.push(level);
				newPoints.push(newPoint);
			}
		
			var result = new LichEnvelope(newPoints, object.shape);
			LichVM.push(result);
			return result.value();
			break;

		case 'Stream':
			return this.subtract(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.divide = function(object)
	{
		switch(object.type())
		{	
		case 'String':
			var result = new LichString(
							asciiToString(
								numberArrayDividedBy(stringToAscii(object.value()), this.value())
							)
			);
			
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Float':
			var result = new LichFloat(object.value() / this.value());
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.divide(object.call());
			break;
			
		case 'Primitive':
			return this.divide(object.call());
			break;
			
		case 'Array':
		
			var objectArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < object.length(); ++i)
			{
				this.divide(objectArray[i]); // Pushes the result onto the stack
				result.push(LichVM.pop()); // Pop it back off the stack and store it in our array
			}
		
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.divide(object.object);
			break;

		case 'Envelope':
			var newPoints = new LichArray(new Array());
			
			for(var i = 0; i < object.points.length(); ++i)
			{
				var newPoint = new LichArray(new Array());
				var level = new LichFloat(object.points.arrayVar[i].back().value() / this.value());
				newPoint.push(object.points.arrayVar[i].front());
				newPoint.push(level);
				newPoints.push(newPoint);
			}
		
			var result = new LichEnvelope(newPoints, object.shape);
			LichVM.push(result);
			return result.value();
			break;

		case 'Stream':
			return this.divide(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.multiply = function(object)
	{
		switch(object.type())
		{
		case 'String':
			return object.multiply(this);
			break;
			
		case 'Float':
			var result = new LichFloat(this.value() * object.value());
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.multiply(object.call());
			break;
			
		case 'Primitive':
			return this.multiply(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < objectArray.length; ++i)
			{
				this.multiply(objectArray[i]); // Pushes result onto the stack;
				result.push(LichVM.pop()); // Pops result off the stack and pushes it into the result array
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			this.multiply(object.object);
			break;

		case 'Envelope':
			return object.multiply(this);
			break;

		case 'Stream':
			return this.multiply(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.modulus = function(object)
	{
		switch(object.type())
		{
		case 'String':
		
			var numberArray = new Array();
			
			for(var i = 0; i < object.length(); ++i)
			{
				numberArray.push(this.floatVar);
			}
		
			var result = new LichString(
							asciiToString(
								numberArrayModulusArray(numberArray, stringToAscii(object.value()))
							)
			);
			
			LichVM.push(result);
			return result.value();
			break;
		
		case 'Float':
			var result = new LichFloat(this.value() % object.value());
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.modulus(object.call());
			break;
			
		case 'Primitive':
			return this.modulus(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < objectArray.length; ++i)
			{
				this.modulus(objectArray[i]); // Pushes result onto the stack;
				result.push(LichVM.pop()); // Pops result off the stack and pushes it into the result array
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.modulus(object.object);
			break;

		case 'Envelope':
			var newPoints = new LichArray(new Array());
			
			for(var i = 0; i < object.points.length(); ++i)
			{
				var newPoint = new LichArray(new Array());
				var level = new LichFloat(this.value() % object.points.arrayVar[i].back().value());
				newPoint.push(object.points.arrayVar[i].front());
				newPoint.push(level);
				newPoints.push(newPoint);
			}
		
			var result = new LichEnvelope(newPoints, object.shape);
			LichVM.push(result);
			return result.value();
			break;

		case 'Stream':
			return this.modulus(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.equivalent = function(object)
	{
		switch(object.type())
		{
		case 'String':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Float':
			var bool = 0;
			
			if(this.value() == object.value())
			{
				bool = 1;
			}
			
			LichVM.push(new LichFloat(bool));
			return bool;
			break;
			
		case 'Function':
			return this.equivalent(object.call());
			break;
			
		case 'Primitive':
			return this.equivalent(object.call());
			break;
			
		case 'Array':
			return object.equivalent(this);
			break;
			
		case 'Variable':
			return this.equivalent(object.object);
			break;
			
		case 'Envelope':
			LichVM.push(new LichFloat(0));
			return 0;
			break;

		case 'Stream':
			return this.equivalent(object.value());
			break;

		default:
			LichVM.push(new LichFloat(0));
			return 0;
			break;
		}
	}
	
	this.inequivalent = function(object)
	{
		switch(object.type())
		{
		case 'String':
			LichVM.push(new LichFloat(1));
			return 1;
			break;
			
		case 'Float':
			var bool = 0;
			
			if(this.value() != object.value())
			{
				bool = 1;
			}
			
			LichVM.push(new LichFloat(bool));
			return bool;
			break;
			
		case 'Function':
			return this.inequivalent(object.call());
			break;
			
		case 'Primitive':
			return this.inequivalent(object.call());
			break;
			
		case 'Array':
			return object.inequivalent(this);
			break;
			
		case 'Variable':
			return this.inequivalent(object.object);
			break;

		case 'Envelope':
			LichVM.push(new LichFloat(1));
			return 1;
			break;

		case 'Stream':
			return this.inequivalent(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(1));
			return 1;
			break;
		}
	}
	
	this.greaterThan = function(object)
	{
		switch(object.type())
		{
		case 'String':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Float':
			var bool = 0;
			
			if(this.value() > object.value())
			{
				bool = 1;
			}
			
			LichVM.push(new LichFloat(bool));
			return bool;
			break;
			
		case 'Function':
			return this.greaterThan(object.call());
			break;
			
		case 'Primitive':
			return this.greaterThan(object.call());
			break;
			
		case 'Array':
			return object.lessThan(this);
			break;
			
		case 'Variable':
			return this.greaterThan(object.object);
			break;

		case 'Envelope':
			LichVM.push(new LichFloat(0));
			return 0;
			break;

		case 'Stream':
			return this.greaterThan(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
			break;
		}
	}
	
	this.lessThan = function(object)
	{
		switch(object.type())
		{
		case 'String':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Float':
			var bool = 0;
			
			if(this.value() < object.value())
			{
				bool = 1;
			}
			
			LichVM.push(new LichFloat(bool));
			return bool;
			break;
			
		case 'Function':
			return this.lessThan(object.call());
			break;
			
		case 'Primitive':
			return this.lessThan(object.call());
			break;
			
		case 'Array':
			return object.greaterThan(this);
			break;
			
		case 'Variable':
			return this.lessThan(object.object);
			break;

		case 'Envelope':
			LichVM.push(new LichFloat(0));
			return 0;
			break;

		case 'Stream':
			return this.lessThan(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
			break;
		}
	}
	
	this.greaterThanEqual = function(object)
	{
		switch(object.type())
		{
		case 'String':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Float':
			var bool = 0;
			
			if(this.value() >= object.value())
			{
				bool = 1;
			}
			
			LichVM.push(new LichFloat(bool));
			return bool;
			break;
			
		case 'Function':
			return this.greaterThanEqual(object.call());
			break;
			
		case 'Primitive':
			return this.greaterThanEqual(object.call());
			break;
			
		case 'Array':
			return object.lessThanEqual(this);
			break;
			
		case 'Variable':
			return this.greaterThanEqual(object.object);
			break;

		case 'Envelope':
			LichVM.push(new LichFloat(0));
			return 0;
			break;

		case 'Stream':
			return this.greaterThanEqual(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
			break;
		}
	}
	
	this.lessThanEqual = function(object)
	{
		switch(object.type())
		{
		case 'String':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Float':
			var bool = 0;
			
			if(this.value() <= object.value())
			{
				bool = 1;
			}
			
			LichVM.push(new LichFloat(bool));
			return bool;
			break;
			
		case 'Function':
			return this.lessThanEqual(object.call());
			break;
			
		case 'Primitive':
			return this.lessThanEqual(object.call());
			break;
			
		case 'Array':
			return object.greaterThanEqual(this);
			break;
			
		case 'Variable':
			return this.lessThanEqual(object.object);
			break;

		case 'Envelope':
			LichVM.push(new LichFloat(0));
			return 0;
			break;

		case 'Stream':
			return this.lessThanEqual(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
			break;
		}
	}

	this.to = function(lichType)
	{
		switch(lichType)
		{
		case 'String':
			return new LichString(asciiToString(this.floatVar));
			break;
			
		case 'Float':
			return this;
			break;
			
		case 'Function':
			return new LichFunction(new Array(), [this]);
			break;
			
		case 'Primitive':
			post("OBVIOUSLY you can't cast to a primtive, OBVIOUSLY.")
			break;
			
		case 'Array':
			return new LichArray([this]);
			break;
			
		case 'Variable':
			post("WTF. Casting to a Variable is like translating to vapid programmer speak.");
			break;

		case 'Envelope':
			var point = new LichArray([new LichFloat(0), this]);
			return new LichEnvelope(new LichArray([point]), new LichString('linear'));
			break;

		case 'Stream':
			return new LichStream(this, this);
			break;
			
		default:
			return this;
		}
	}

	this.play = function()
	{
		var newStream = this.to('Stream');
		LichVM.push(newStream);
		return newStream;
	}

	this.stop = function()
	{
		return this;
	}

	this.serialize = function() // Serialize the object into a JSON representation
	{
		var serialized = {};
		serialized.namespace = {};

		for(var key in this.namespace)
		{
			if(this.namespace.hasOwnProperty(key))
			{
				serialized.namespace[key] = this.namespace[key].serialize();
			}
		}

		serialized.value = this.floatVar;
		serialized.type = this.type();
		return serialized;
	}
	
	// Member vars
	this.floatVar = _floatVar;
	this.namespace = {};
	this.isVisualPointer = false;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LichArray
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function LichArray(_arrayVar) {
		
	// Public methods
	this.value = function()
	{
		return this.arrayVar;
	}
	
	this.call = function()
	{
		return this.value();
	}
	
	this.type = function()
	{
		return 'Array';
	}
	
	this.length = function()
	{
		return this.arrayVar.length;
	}

	this.map = function(func) // used internally for mapping functions to each item in an array
	{
		var result = new Array();
		var lichResult;
			
		for(var i = 0; i < this.arrayVar.length; ++i)
		{
			result.push(func(this.arrayVar[i]));
		}
			
		lichResult = new LichArray(result);
		LichVM.push(lichResult);
		return lichResult.value();
	}
	
	this.insert = function(index, value)
	{
		if(index.type() == 'Float')
		{
			if(index.value() >= this.length())
			{
				this.push(value);
			}
			
			else
			{
				this.arrayVar[index.value()] = value;
			}
		}

		else
		{
			this.namespace[index.value()] = value;
		}

		LichVM.push(this);
		return this;
	}
	
	this.at = function(index)
	{
		if(index.type() == 'Float')
		{
			var object = this.arrayVar[index.value() % this.arrayVar.length];
			LichVM.push(object);
			return object;
		}

		else
		{
			if(this.namespace.hasOwnProperty(index.value()))
			{
				LichVM.push(this.namespace[index.value()]);
				return this.namespace[index.value()].value();
			}

			else
			{
				LichVM.push(this);
				return undefined;
			}
		}
	}
	
	this.front = function()
	{
		return this.arrayVar[0];
	}
	
	this.back = function()
	{
		return this.arrayVar[this.arrayVar.length - 1];
	}
	
	this.push = function(object)
	{
		this.arrayVar.push(object);
	}
	
	this.add = function(object)
	{
		switch(object.type())
		{
		case 'String':
			return object.add(this);
			break;
			
		case 'Float':
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < this.arrayVar.length; ++i)
			{
				this.arrayVar[i].add(object); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Function':
			return this.add(object.call());
			break;
			
		case 'Primitive':
			return this.add(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult, length;
			length = this.arrayVar.length;
			
			if(objectArray.length > length)
			{
				length = objectArray.length;
			}
			
			for(var i = 0; i < length; ++i)
			{
				this.arrayVar[i % this.arrayVar.length].add(objectArray[i % objectArray.length]); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.add(object.object);
			break;

		case 'Envelope':
			return object.add(this);
			break;

		case 'Stream':
			return this.add(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.subtract = function(object)
	{
		switch(object.type())
		{
		case 'String':
			return object.subtract(this);
			break;
			
		case 'Float':
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < this.arrayVar.length; ++i)
			{
				this.arrayVar[i].subtract(object); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Function':
			return this.subtract(object.call());
			break;
			
		case 'Primitive':
			return this.subtract(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult, length;
			length = this.arrayVar.length;
			
			if(objectArray.length > length)
			{
				length = objectArray.length;
			}
			
			for(var i = 0; i < length; ++i)
			{
				this.arrayVar[i % this.arrayVar.length].subtract(objectArray[i % objectArray.length]); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.subtract(object.object);
			break;

		case 'Envelope':
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < this.arrayVar.length; ++i)
			{
				this.arrayVar[i].subtract(object); // Pushes result onto the stack;
				result.push(LichVM.pop()); // Pops result off the stack and pushes it into the result array
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;

		case 'Stream':
			return this.subtract(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.divide = function(object)
	{
		switch(object.type())
		{
		case 'String':
			return object.divide(this);
			break;
			
		case 'Float':
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < this.arrayVar.length; ++i)
			{
				this.arrayVar[i].divide(object); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Function':
			return this.divide(object.call());
			break;
			
		case 'Primitive':
			return this.divide(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult, length;
			length = this.arrayVar.length;
			
			if(objectArray.length > length)
			{
				length = objectArray.length;
			}
			
			for(var i = 0; i < length; ++i)
			{
				this.arrayVar[i % this.arrayVar.length].divide(objectArray[i % objectArray.length]); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.divide(object.object);
			break;

		case 'Envelope':
			var objectArray = this.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < objectArray.length; ++i)
			{
				objectArray[i].divide(object); // Pushes result onto the stack;
				result.push(LichVM.pop()); // Pops result off the stack and pushes it into the result array
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;

		case 'Stream':
			return this.divide(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.multiply = function(object)
	{
		switch(object.type())
		{
		case 'String':
			return object.multiply(this);
			break;
			
		case 'Float':
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < this.arrayVar.length; ++i)
			{
				this.arrayVar[i].multiply(object); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Function':
			return this.multiply(object.call());
			break;
			
		case 'Primitive':
			return this.multiply(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult, length;
			length = this.arrayVar.length;
			
			if(objectArray.length > length)
			{
				length = objectArray.length;
			}
			
			for(var i = 0; i < length; ++i)
			{
				this.arrayVar[i % this.arrayVar.length].multiply(objectArray[i % objectArray.length]); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.add(object.object);
			break;

		case 'Envelope':
			return object.multiply(this);
			break;

		case 'Stream':
			return this.multiply(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.modulus = function(object)
	{
		switch(object.type())
		{
		case 'String':
			return object.modulus(this);
			break;
			
		case 'Float':
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < this.arrayVar.length; ++i)
			{
				this.arrayVar[i].modulus(object); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Function':
			return this.modulus(object.call());
			break;
			
		case 'Primitive':
			return this.modulus(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult, length;
			length = this.arrayVar.length;
			
			if(objectArray.length > length)
			{
				length = objectArray.length;
			}
			
			for(var i = 0; i < length; ++i)
			{
				this.arrayVar[i % this.arrayVar.length].modulus(objectArray[i % objectArray.length]); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.modulus(object.object);
			break;

		case 'Envelope':
			var objectArray = this.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < objectArray.length; ++i)
			{
				objectArray[i].modulus(object); // Pushes result onto the stack;
				result.push(LichVM.pop()); // Pops result off the stack and pushes it into the result array
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;

		case 'Stream':
			return this.modulus(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.equivalent = function(object)
	{
		if(object.type() != undefined)
		{
			if(object.type() == 'Array')
			{
				var objectArray = object.value();
				var result = new Array();
				var lichResult, length;
				length = this.arrayVar.length;
				
				if(objectArray.length > length)
				{
					length = objectArray.length;
				}
				
				for(var i = 0; i < length; ++i)
				{
					this.arrayVar[i % this.arrayVar.length].equivalent(objectArray[i % objectArray.length]); // Pushes result onto the stack
					result.push(LichVM.pop()); // Pop the result off the stack
				}
				
				lichResult = new LichArray(result);
				LichVM.push(lichResult);
				return lichResult.value();
			}

			else
			{
				var result = new Array();
				var lichResult;
				
				for(var i = 0; i < this.arrayVar.length; ++i)
				{
					this.arrayVar[i].equivalent(object); // Pushes result onto the stack
					result.push(LichVM.pop()); // Pop the result off the stack
				}
				
				lichResult = new LichArray(result);
				LichVM.push(lichResult);
				return lichResult.value();
			}
		}

		else
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}

	}
	
	this.inequivalent = function(object)
	{
		if(object.type() != undefined)
		{
			if(object.type() == 'Array')
			{
				var objectArray = object.value();
				var result = new Array();
				var lichResult, length;
				length = this.arrayVar.length;
				
				if(objectArray.length > length)
				{
					length = objectArray.length;
				}
				
				for(var i = 0; i < length; ++i)
				{
					this.arrayVar[i % this.arrayVar.length].inequivalent(objectArray[i % objectArray.length]); // Pushes result onto the stack
					result.push(LichVM.pop()); // Pop the result off the stack
				}
				
				lichResult = new LichArray(result);
				LichVM.push(lichResult);
				return lichResult.value();
			}

			else
			{
				var result = new Array();
				var lichResult;
				
				for(var i = 0; i < this.arrayVar.length; ++i)
				{
					this.arrayVar[i].inequivalent(object); // Pushes result onto the stack
					result.push(LichVM.pop()); // Pop the result off the stack
				}
				
				lichResult = new LichArray(result);
				LichVM.push(lichResult);
				return lichResult.value();
			}
		}

		else
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
	}
	
	this.greaterThan = function(object)
	{
		if(object.type() != undefined)
		{
			if(object.type() == 'Array')
			{
				var objectArray = object.value();
				var result = new Array();
				var lichResult, length;
				length = this.arrayVar.length;
				
				if(objectArray.length > length)
				{
					length = objectArray.length;
				}
				
				for(var i = 0; i < length; ++i)
				{
					this.arrayVar[i % this.arrayVar.length].greaterThan(objectArray[i % objectArray.length]); // Pushes result onto the stack
					result.push(LichVM.pop()); // Pop the result off the stack
				}
				
				lichResult = new LichArray(result);
				LichVM.push(lichResult);
				return lichResult.value();
			}

			else
			{
				var result = new Array();
				var lichResult;
				
				for(var i = 0; i < this.arrayVar.length; ++i)
				{
					this.arrayVar[i].greaterThan(object); // Pushes result onto the stack
					result.push(LichVM.pop()); // Pop the result off the stack
				}
				
				lichResult = new LichArray(result);
				LichVM.push(lichResult);
				return lichResult.value();
			}
		}

		else
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
	}
	
	this.lessThan = function(object)
	{
		if(object.type() != undefined)
		{
			if(object.type() == 'Array')
			{
				var objectArray = object.value();
				var result = new Array();
				var lichResult, length;
				length = this.arrayVar.length;
				
				if(objectArray.length > length)
				{
					length = objectArray.length;
				}
				
				for(var i = 0; i < length; ++i)
				{
					this.arrayVar[i % this.arrayVar.length].lessThan(objectArray[i % objectArray.length]); // Pushes result onto the stack
					result.push(LichVM.pop()); // Pop the result off the stack
				}
				
				lichResult = new LichArray(result);
				LichVM.push(lichResult);
				return lichResult.value();
			}

			else
			{
				var result = new Array();
				var lichResult;
				
				for(var i = 0; i < this.arrayVar.length; ++i)
				{
					this.arrayVar[i].lessThan(object); // Pushes result onto the stack
					result.push(LichVM.pop()); // Pop the result off the stack
				}
				
				lichResult = new LichArray(result);
				LichVM.push(lichResult);
				return lichResult.value();
			}
		}

		else
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
	}
	
	this.greaterThanEqual = function(object)
	{
		if(object.type() != undefined)
		{
			if(object.type() == 'Array')
			{
				var objectArray = object.value();
				var result = new Array();
				var lichResult, length;
				length = this.arrayVar.length;
				
				if(objectArray.length > length)
				{
					length = objectArray.length;
				}
				
				for(var i = 0; i < length; ++i)
				{
					this.arrayVar[i % this.arrayVar.length].greaterThanEqual(objectArray[i % objectArray.length]); // Pushes result onto the stack
					result.push(LichVM.pop()); // Pop the result off the stack
				}
				
				lichResult = new LichArray(result);
				LichVM.push(lichResult);
				return lichResult.value();
			}

			else
			{
				var result = new Array();
				var lichResult;
				
				for(var i = 0; i < this.arrayVar.length; ++i)
				{
					this.arrayVar[i].greaterThanEqual(object); // Pushes result onto the stack
					result.push(LichVM.pop()); // Pop the result off the stack
				}
				
				lichResult = new LichArray(result);
				LichVM.push(lichResult);
				return lichResult.value();
			}
		}

		else
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
	}
	
	this.lessThanEqual = function(object)
	{
		if(object.type() != undefined)
		{
			if(object.type() == 'Array')
			{
				var objectArray = object.value();
				var result = new Array();
				var lichResult, length;
				length = this.arrayVar.length;
				
				if(objectArray.length > length)
				{
					length = objectArray.length;
				}
				
				for(var i = 0; i < length; ++i)
				{
					this.arrayVar[i % this.arrayVar.length].lessThanEqual(objectArray[i % objectArray.length]); // Pushes result onto the stack
					result.push(LichVM.pop()); // Pop the result off the stack
				}
				
				lichResult = new LichArray(result);
				LichVM.push(lichResult);
				return lichResult.value();
			}

			else
			{
				var result = new Array();
				var lichResult;
				
				for(var i = 0; i < this.arrayVar.length; ++i)
				{
					this.arrayVar[i].lessThanEqual(object); // Pushes result onto the stack
					result.push(LichVM.pop()); // Pop the result off the stack
				}
				
				lichResult = new LichArray(result);
				LichVM.push(lichResult);
				return lichResult.value();
			}
		}

		else
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
	}

	this.to = function(lichType)
	{
		switch(lichType)
		{
		case 'String':
			var stringSum = "";

			// Iterate through the array index by index casting to string and concating with our sum
			for(var i = 0; i < this.arrayVar.length; ++i)
			{
				stringSum = stringSum.concat(this.arrayVar[i].to('String').stringVar);
			}

			return new LichString(stringSum);
			break;
			
		case 'Float':
			return new LichFloat(this.length());
			break;
			
		case 'Function':
			return new LichFunction(new Array(), [this]);
			break;
			
		case 'Primitive':
			post("OBVIOUSLY you can't cast to a primtive, OBVIOUSLY.")
			break;
			
		case 'Array':
			return this;
			break;
			
		case 'Variable':
			post("WTF. Casting to a Variable is like translating to vapid programmer speak.");
			break;

		case 'Envelope':
			
			var points = new Array();
			var popBack = false;

			if(this.arrayVar.length % 2 != 0)
			{
				this.arrayVar.push(this.arrayVar[this.arrayVar.length - 1]);
				popBack = true;
			}

			for(var i = 0; i < this.arrayVar.length; i += 2)
			{
				var point = new Array();
				point.push(this.arrayVar[i].to('Float'));
				point.push(this.arrayVar[i + 1]).to('Float');
				points.push(new LichArray(point));
			}

			if(popBack)
				this.arrayVar.pop();

			return new LichEnvelope(new LichArray(points), new LichString('linear'));
			break;

		case 'Stream':
			return new LichStream(this, this);
			break;
			
		default:
			return this;
		}
	}

	this.play = function()
	{
		var streamArray = new Array();

		for(var i = 0; i < this.arrayVar.length; ++i)
		{
			streamArray.push(this.arrayVar[i].play());
		}

		streamArray = new LichArray(LichArray);
		LichVM.push(streamArray);
		return streamArray;
	}

	this.stop = function()
	{
		for(var i = 0; i < this.arrayVar.length; ++i)
		{
			this.arrayVar[i].stop();
		}

		return this;
	}

	this.serialize = function() // Serialize the object into a JSON representation
	{
		var serialized = {};
		serialized.namespace = {};

		for(var key in this.namespace)
		{
			if(this.namespace.hasOwnProperty(key))
			{
				serialized.namespace[key] = this.namespace[key].serialize();
			}
		}

		var serialArray = new Array();

		for(var i = 0; i < this.arrayVar.length; ++i)
		{
			serialArray.push(this.arrayVar[i].serialize());
		}

		serialized.value = serialArray;
		serialized.type = this.type();
		return serialized;
	}
	
	// Member vars
	this.arrayVar = _arrayVar;
	this.namespace = {};
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LichPrimitive
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Primitives take a pointer to the predefined primitive function as well as the number of arguments they expect
function LichPrimitive(_primitive, _numArgs) {
	
	// Public methods
	this.call = function()
	{	
		if(LichVM.stack.length < this.numArgs) // If there aren't enough arguments, we push ourselves onto the stack instead for assignment
		{
			return this;
		}
		
		else
		{
			var argArray = new Array();
			
			// Here we pop arguments from the top of the stack and populate the arg argArray
			for(var i = 0; i < this.numArgs && LichVM.stack.length > 0; ++i)
			{
				var arg = LichVM.pop();
				
				// If the argument is a primitive or function, recursively call function values
				if(arg.type() == 'Primitive')
				{
					arg.call();
					argArray.push(LichVM.pop());
				}

				else
				{
					argArray.push(arg); // Any other types (Float, Array) simply push into the arg array
				}
			}

			return this.primitive(argArray);
		}
	}
	
	this.value = function()
	{
		return this.call();
	}
	
	this.type = function()
	{
		return 'Primitive';
	}
	
	this.length = function()
	{
		return 0;
	}
	
	this.insert = function(index, value)
	{
		return this.value().insert(index, value);
	}
	
	this.at = function(index)
	{
		return this.value().at(index);
	}
	
	this.add = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.call().add(object);
		}
	}
	
	this.subtract = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.call().subtract(object);
		}
	}
	
	this.divide = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.call().divide(object);
		}
	}
	
	this.multiply = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.call().multiply(object);
		}
	}
	
	this.modulus = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.call().modulus(object);
		}
	}
	
	this.equivalent = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.call().equivalent(object);
		}
	}
	
	this.inequivalent = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(1));
			return 1;
		}
		
		else
		{
			return this.call().inequivalent(object);
		}
	}
	
	this.greaterThan = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.call().greaterThan(object);
		}
	}
	
	this.lessThan = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.call().lessThan(object);
		}
	}
	
	this.greaterThanEqual = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.call().greaterThanEqual(object);
		}
	}
	
	this.lessThanEqual = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.call().lessThanEqual(object);
		}
	}

	this.to = function(lichType)
	{
		post("YOU CAN'T CAST A PRIMITIVE. Your computer will explode in 3...2...1...");
	}

	this.play = function()
	{
		post("Penguins can't fly and you can't play a primitive.");
		return this;
	}

	this.stop = function()
	{
		post("Stop trying to stop a primitive. It doesn't work. Get out of my face.");
		return this;
	}

	this.serialize = function() // Serialize the object into a JSON representation
	{
		var serialized = {};
		var serialFunc = value = this.primitive + ''; // Stringify the primitive
		var prepend = "DESERIALPRIMITIVE = function(argArray) ";

		for(var i = 0; i < serialFunc.length; ++i)
		{
			if(serialFunc[i] == "{")
			{
				serialFunc = serialFunc.substring(i, serialFunc.length);
				break;
			}
		}

		serialFunc = prepend.concat(serialFunc);
		serialized.value = serialFunc;
		serialized.numArgs = this.numArgs;
		serialized.type = this.type();
		return serialized;
	}
	
	// Member vars
	this.primitive = _primitive;
	this.numArgs = _numArgs;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LichFunction
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Lich Functions are defined in the Lich language. They take an array of names and an array of objects that are called when the function is called
function LichFunction(_argNames, _functionObjects) {
	
	this.collectArgObjects = function()
	{
		delete this.argObjects;
		this.argObjects = {}; // Redefine as a clean object
		
		for(var i = 0; i < _argNames.length; ++i)
		{
			this.argObjects[this.argNames[i]] = LichVM.pop(); // One by collect arguments from the stack
		}
	}
	
	this.value = function()
	{
		return this;
	}
	
	this.call = function()
	{		
		if(LichVM.stack.length < this.argNames.length)
		{
			return this;
		}
		
		else
		{
			this.collectArgObjects(); // Collect 

			for(var i = 0; i < this.functionObjects.length; ++i)
			{
				var currentObject = this.functionObjects[i];

				if(currentObject.type() == 'Variable') 
				{
					// If the current object is a reference to a previously collected argument
					if(this.argObjects.hasOwnProperty(currentObject.objectName)) 
					{
						LichVM.push(this.argObjects[currentObject.objectName]); // Use our collected arguments, reference by name
					}

					else // Non argument reference
					{
						LichVM.push(currentObject);
					}
				}

				else // Not a variable
				{
					LichVM.push(currentObject);
				}
			}
			
			return LichVM.pop().value(); // Call the top of the stack
		}
	}
	
	this.type = function()
	{
		return 'Function';
	}
	
	this.length = function()
	{
		return 0;
	}
	
	this.insert = function(index, value)
	{
		return this.call().insert(index, value);
	}
	
	this.at = function(index)
	{
		return this.call().at(index);
	}
	
	
	this.add = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.call().add(object);
		}
	}
	
	this.subtract = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.call().subtract(object);
		}
	}
	
	this.divide = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.call().divide(object);
		}
	}
	
	this.multiply = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.call().multiply(object);
		}
	}
	
	this.modulus = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.call().modulus(object);
		}
	}
	
	this.equivalent = function(object)
	{
		if(object.type() == 'Function')
		{
			var bool = 0;
			
			if(this.functionVar == object.functionVar)
			{
				bool = 1;
			}
			
			LichVM.push(new LichFloat(bool));
			return bool
		}
		
		else if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.call().equivalent(object);
		}
	}
	
	this.inequivalent = function(object)
	{
		if(object.type() == 'Function')
		{
			var bool = 0;
			
			if(this.functionVar != object.functionVar)
			{
				bool = 1;
			}
			
			LichVM.push(new LichFloat(bool));
			return bool
		}
		
		else if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(1));
			return 1;
		}
		
		else
		{
			return this.call().inequivalent(object);
		}
	}
	
	this.greaterThan = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.call().greaterThan(object);
		}
	}
	
	this.lessThan = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.call().lessThan(object);
		}
	}
	
	this.greaterThanEqual = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.call().greaterThanEqual(object);
		}
	}
	
	this.lessThanEqual = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.call().lessThanEqual(object);
		}
	}

	this.to = function(lichType)
	{
		return this.call().to(lichType);
	}

	this.play = function()
	{
		return this.call().play();
	}

	this.stop = function()
	{
		var result = this.call();
		if(result)
			return result.stop();
	}

	this.serialize = function() // Serialize the object into a JSON representation
	{
		var serialized = {};
		serialized.namespace = {};
		var serializedValueFunction = new Array();

		for(var key in this.namespace)
		{
			if(this.namespace.hasOwnProperty(key))
			{
				serialized.namespace[key] = this.namespace[key].serialize();
			}
		}

		for(var i = 0; i < this.functionObjects.length; ++i)
		{
			serializedValueFunction.push(this.functionObjects[i].serialize());
		}

		serialized.value = {};
		serialized.value.argNames = this.argNames;
		serialized.value.function = serializedValueFunction;
		serialized.type = this.type();
		return serialized;
	}
	
	this.argObjects = {};
	this.argNames = _argNames;
	this.functionObjects = _functionObjects;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LichVariable
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function LichVariable(_objectName) {
	
	this.undefinedError = function()
	{
		post("ERROR. UNDEFINED VARIABLE: " + this.objectName + ". YOUR WORLD IS A LIE.");
		return LichVM.clearStack();
	}
	
	this.value = function()
	{
		if(this.object == undefined)
		{
			return this.undefinedError();
		}
		
		else
		{
			return this.object.value();
		}
	}
	
	this.call = function()
	{
		if(this.object == undefined)
		{
			return this.undefinedError();
		}
				
		return this.object.call();
	}
	
	this.type = function()
	{	
		return 'Variable';
	}
	
	this.length = function()
	{
		if(this.object == undefined)
		{
			return this.undefinedError();
		}
		
		return this.object.length();
	}
	
	this.insert = function(index, value)
	{
		return this.object.insert(index, value);
	}
	
	this.at = function(index)
	{
		if(this.object == undefined)
		{
			return this.undefinedError();
		}
		
		return this.object.at(index);
	}
	
	this.add = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.object.add(object);
		}
	}
	
	this.subtract = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.object.subtract(object);
		}
	}
	
	this.divide = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.object.divide(object);
		}
	}
	
	this.multiply = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.object.multiply(object);
		}
	}
	
	this.modulus = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(this);
			return this;
		}
		
		else
		{
			return this.object.modulus(object);
		}
	}
	
	this.equivalent = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.object.equivalent(object);
		}
	}
	
	this.inequivalent = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(1));
			return 1;
		}
		
		else
		{
			return this.object.inequivalent(object);
		}
	}
	
	this.greaterThan = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.object.greaterThan(object);
		}
	}
	
	this.lessThan = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.object.lessThan(object);
		}
	}
	
	this.greaterThanEqual = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.object.greaterThanEqual(object);
		}
	}
	
	this.lessThanEqual = function(object)
	{
		if(object.type() == undefined)
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
		
		else
		{
			return this.object.lessThanEqual(object);
		}
	}
	
	this.increment = function()
	{
		this.object.add(new LichFloat(1));
		this.assign();
		LichVM.push(this);
		return this.object.value()
	}
	
	this.decrement = function()
	{
		this.object.subtract(new LichFloat(1));
		this.assign();
		LichVM.push(this);
		return this.object.value()
	}
	
	this.assign = function()
	{
		if(this.object)
		{
			switch(this.object.type())
			{
			case "Stream":
				this.object.stop();
				break;
			case "Float":
				if(this.object.isVisualPointer)
				{
					CloudChamber.delete(this.object.value());
				}
				break;
			}
		}

		var object = LichVM.pop();
		
		if(object.type() == 'Primitive')
		{	
			object.value();
			this.object = LichVM.pop();
		}
		
		else
		{
			this.object = object;
		}
		
		LichVM.addVar(this.objectName, this);
		return this.objectName;
	}

	this.to = function(lichType)
	{
		if(this.object != undefined && this.object != null)
			return this.object.to(lichType);
	}

	this.play = function()
	{
		if(this.object != undefined && this.object != null)
			return this.object.play();
	}

	this.stop = function()
	{
		if(this.object != undefined && this.object != null)
			return this.object.stop();
	}

	this.serialize = function() // Serialize the object into a JSON representation
	{
		var serialized = {};
		serialized.value = this.object.serialize();
		serialized.objectName = this.objectName;
		serialized.type = this.type();
		return serialized;
	}
	
	this.objectName = _objectName;
	this.object;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LichEnvelope
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// [0] _points: 2D Array of objects containing times and levels. [[0 0] [0.1 1] [1 0]]. Times are absolute!
// [1] _shape: 'none', 'linear', 'exponential' supplied as a string

// example:
// Envelope [[0 0] [0.1 1] [1 0]] 'exponential'


function LichEnvelope(_points, _shape) {
		
	// Public methods
	this.value = function()
	{
		return this;
	}
	
	this.call = function()
	{
		return this.value();
	}
	
	this.type = function()
	{
		return 'Envelope';
	}
	
	this.length = function()
	{	
		return this.points.back().front(); // Returns the last time, which is the length of the Envelope
	}
	
	this.insert = function(index, value) // Insert a point into the Envelope using seperate time and level arguments
	{
		if(index.type() == 'Float' && value.type() == 'Float')
		{
			var time = index;
			var level = value;

			var newPoint = new LichArray(new Array());
			newPoint.push(time);
			newPoint.push(level);
			this.points.push(newPoint);
			// Sort the array according to time
			this.points.arrayVar = this.points.arrayVar.sort(function(a,b){return a.front().value() - b.front().value()}); 
			LichVM.push(this);
			return this;
		}
		
		else
		{
			this.namespace[index.value()] = value;
			LichVM.push(this);
			return this;
		}
	}
	
	this.at = function(index) // Interpolate the value at any point in time based on our interpolation time
	{
		if(index.type() == 'Float')
		{
			var time = index.value();
			var interpolatedValue = this.points.front().back().value(); // The first level
		
			if(time > this.points.front().front().value())
			{
				var pointOne = this.points.front();
				var pointTwo = pointOne;
				
				for(var i = 0; i < this.points.length(); ++i)
				{
					if(time == this.points.arrayVar[i].front().value()) // If we have an perfect match, use that for both points
					{
						pointOne = this.points.arrayVar[i];
						pointTwo = pointOne;
						break;
					}
					
					else if(time < this.points.arrayVar[i].front().value()) // Otherwise check to see if we've found the interpolation points
					{
						pointOne = this.points.arrayVar[i - 1];
						pointTwo = this.points.arrayVar[i];
						break;
					}
				}
				
				var timeOne = pointOne.front().value();
				var timeTwo = pointTwo.front().value();
				var amount = 0;
				
				if(timeOne != timeTwo) // If we have two different times
				{	
					amount = (time - timeOne) / (timeTwo - timeOne); // Calculate the interpolation amount based on proximity

					switch(this.shape)
					{
					case 'none':
						interpolatedValue = pointOne.back().value();
						post("InterpolatedValue!: " + interpolatedValue);
						break;

					case 'linear':
						interpolatedValue = lerp(pointOne.back().value(), pointTwo.back().value(), amount);
						break;

					case 'exponential':
						interpolatedValue = exerp(pointOne.back().value(), pointTwo.back().value(), amount);
						break;

					default:
						interpolatedValue = pointOne.back().value();
						break;
					}
				}
				
				else // Otherwise just pick the first one and take it's value
				{
					interpolatedValue = pointOne.back().value();
				}
			}
			
			LichVM.push(new LichFloat(interpolatedValue));
			return interpolatedValue;
		}

		else
		{
			if(this.namespace.hasOwnProperty(index.value()))
			{
				LichVM.push(this.namespace[index.value()]);
				return this.namespace[index.value()].value();
			}

			else
			{
				LichVM.push(this);
				return undefined;
			}
		}
	}

	this.comparePoints = function(point0, point1)
	{
		if(point0.arrayVar[0].value() == point1.arrayVar[0].value() && point0.arrayVar[1].value() == point1.arrayVar[1].value())
		{
			return 1;
		}

		else
		{
			return 0;
		}
	}

	this.removeDuplicates = function(pointArray)
	{
		for(var i = 1; i < pointArray.length; )
		{
            if(this.comparePoints(pointArray[i-1], pointArray[i]))
            {
                pointArray.splice(i, 1);
            } 

            else 
            {
                ++i;
            }
        }

        return pointArray;
	}
	
	this.combine = function(object, operatorFunction) // Used for combining two LichEnvelopes
	{
		var newPoints = new Array();
		
		// Iterate through each LichEnvelopes points array, calling the operator function at each point
		
		for(var i = 0; i < this.points.length(); ++i)
		{
			var thisTime = this.points.arrayVar[i].front().value();
			var newPoint = new LichArray(new Array());
			var objectLevel = object.at(new LichFloat(thisTime));
			LichVM.pop(); // pop the results off the stack;
			var level = operatorFunction(this.points.arrayVar[i].back().value(), objectLevel);
			newPoint.push(new LichFloat(thisTime));
			newPoint.push(new LichFloat(level));
			newPoints.push(newPoint);
		}
		
		for(var i = 0; i < object.points.length(); ++i)
		{
			var objectTime = object.points.arrayVar[i].front().value();
			var newPoint = new LichArray(new Array());
			var thisLevel = this.at(new LichFloat(objectTime));
			LichVM.pop(); // pop the results off the stack;
			var level = operatorFunction(object.points.arrayVar[i].back().value(), thisLevel);
			newPoint.push(new LichFloat(objectTime));
			newPoint.push(new LichFloat(level));
			newPoints.push(newPoint);
		}
		
		newPoints = newPoints.sort(function(a,b){return a.front().value() - b.front().value()}); // Sort the array according to time
		newPoints = this.removeDuplicates(newPoints); // Remove duplicates from the points array
		result = new LichEnvelope(new LichArray(newPoints), this.shape);
		LichVM.push(result);
		return result.value();
	}
	
	this.addFunction = function(operand0, operand1)
	{
		return operand0 + operand1;
	}
	
	this.subtractFunction = function(operand0, operand1)
	{
		return operand0 - operand1;
	}
	
	this.divideFunction = function(operand0, operand1)
	{
		return operand1 / operand0;
	}
	
	this.multiplyFunction = function(operand0, operand1)
	{
		return operand0 * operand1;
	}
	
	this.modulusFunction = function(operand0, operand1)
	{
		return operand0 % operand1;
	}
	
	this.add = function(object)
	{
		switch(object.type())
		{
		case 'String':
			return object.add(this);
			break;
			
		case 'Float':
			var newPoints = new LichArray(new Array());
			
			for(var i = 0; i < this.points.length(); ++i)
			{
				var newPoint = new LichArray(new Array());
				var level = new LichFloat(this.points.arrayVar[i].back().value() + object.value());
				newPoint.push(this.points.arrayVar[i].front());
				newPoint.push(level);
				newPoints.push(newPoint);
			}
		
			var result = new LichEnvelope(newPoints, this.shape);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.add(object.call());
			break;
			
		case 'Primitive':
			return this.add(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < objectArray.length; ++i)
			{
				this.add(objectArray[i]); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.add(object.object);
			break;
			
		case 'Envelope':
			return this.combine(object, this.addFunction);
			break;

		case 'Stream':
			return this.add(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.subtract = function(object)
	{
		switch(object.type())
		{
		case 'String':
			return object.add(this);
			break;
			
		case 'Float':
			var newPoints = new LichArray(new Array());
			
			for(var i = 0; i < this.points.length(); ++i)
			{
				var newPoint = new LichArray(new Array());
				var level = new LichFloat(this.points.arrayVar[i].back().value() - object.value());
				newPoint.push(this.points.arrayVar[i].front());
				newPoint.push(level);
				newPoints.push(newPoint);
			}
		
			var result = new LichEnvelope(newPoints, this.shape);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.subtract(object.call());
			break;
			
		case 'Primitive':
			return this.subtract(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < objectArray.length; ++i)
			{
				this.subtract(objectArray[i]); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.subtract(object.object);
			break;
			
		case 'Envelope':
			return this.combine(object, this.subtractFunction);
			break;

		case 'Stream':
			return this.subtract(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.divide = function(object)
	{
		switch(object.type())
		{	
		case 'String':
			
			for(var i = 0; i < this.points.length(); ++i)
			{

				this.points.arrayVar[i].back().divide(object);
			}
			
			break;
			
		case 'Float':
			var newPoints = new LichArray(new Array());
			
			for(var i = 0; i < this.points.length(); ++i)
			{
				var newPoint = new LichArray(new Array());
				var level = new LichFloat(object.value() / this.points.arrayVar[i].back().value());
				newPoint.push(this.points.arrayVar[i].front());
				newPoint.push(level);
				newPoints.push(newPoint);
			}
		
			var result = new LichEnvelope(newPoints, this.shape);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.divide(object.call());
			break;
			
		case 'Primitive':
			return this.divide(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < objectArray.length; ++i)
			{
				this.divide(objectArray[i]); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.divide(object.object);
			break;
			
		case 'Envelope':
			return this.combine(object, this.divideFunction);
			break;

		case 'Stream':
			return this.divide(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.multiply = function(object)
	{
		switch(object.type())
		{
		case 'String':
			return object.multiply(this);
			break;
			
		case 'Float':
			var newPoints = new LichArray(new Array());
			
			for(var i = 0; i < this.points.length(); ++i)
			{
				var newPoint = new LichArray(new Array());
				var level = new LichFloat(this.points.arrayVar[i].back().value() * object.value());
				newPoint.push(this.points.arrayVar[i].front());
				newPoint.push(level);
				newPoints.push(newPoint);
			}
		
			var result = new LichEnvelope(newPoints, this.shape);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.multiply(object.call());
			break;
			
		case 'Primitive':
			return this.multiply(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < objectArray.length; ++i)
			{
				this.multiply(objectArray[i]); // Pushes result onto the stack
				result.push(LichVM.pop()); // Pop the result off the stack
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			this.multiply(object.object);
			break;
			
		case 'Envelope':
			return this.combine(object, this.multiplyFunction);
			break;

		case 'Stream':
			return this.multiply(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.modulus = function(object)
	{
		switch(object.type())
		{
		case 'String':
			var newArray = new LichArray(this.points);
			return newArray.modulus(object);
			break;
		
		case 'Float':
			var newPoints = new LichArray(new Array());
			
			for(var i = 0; i < this.points.length(); ++i)
			{
				var newPoint = new LichArray(new Array());
				var level = new LichFloat(this.points.arrayVar[i].back().value() % object.value());
				newPoint.push(this.points.arrayVar[i].front());
				newPoint.push(level);
				newPoints.push(newPoint);
			}
		
			var result = new LichEnvelope(newPoints, this.shape);
			LichVM.push(result);
			return result.value();
			break;
			
		case 'Function':
			return this.modulus(object.call());
			break;
			
		case 'Primitive':
			return this.modulus(object.call());
			break;
			
		case 'Array':
			var objectArray = object.value();
			var result = new Array();
			var lichResult;
			
			for(var i = 0; i < objectArray.length; ++i)
			{
				this.modulus(objectArray[i]); // Pushes result onto the stack;
				result.push(LichVM.pop()); // Pops result off the stack and pushes it into the result array
			}
			
			lichResult = new LichArray(result);
			LichVM.push(lichResult);
			return lichResult.value();
			break;
			
		case 'Variable':
			return this.modulus(object.object);
			break;
			
		case 'Envelope':
			return this.combine(object, this.modulusFunction);
			break;

		case 'Stream':
			return this.modulus(object.value());
			break;
			
		default:
			LichVM.push(this);
			return this.value();
			break;
		}
	}
	
	this.equivalent = function(object)
	{
		switch(object.type())
		{
		case 'String':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Float':			
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Function':
			return this.equivalent(object.call());
			break;
			
		case 'Primitive':
			return this.equivalent(object.call());
			break;
			
		case 'Array':
			return object.equivalent(this);
			break;
			
		case 'Variable':
			return this.equivalent(object.object);
			break;
			
		case 'Envelope':
			
			var bool = 1;
			
			if(this.points.length() == object.points.length())
			{				
				for(var i = 0; i < this.points.length(); ++i)
				{
					if(this.points.arrayVar[i].front().value() != object.points.arrayVar[i].front().value()
						|| this.points.arrayVar[i].back().value() != object.points.arrayVar[i].back().value())
					{
						bool = 0;
						break;
					}
				}
			}
			
			else
			{
				bool = 0;
			}
			
			LichVM.push(new LichFloat(bool));
			return bool;
			break;

		case 'Stream':
			return this.equivalent(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
			break;
		}
	}
	
	this.inequivalent = function(object)
	{
		switch(object.type())
		{
		case 'String':
			LichVM.push(new LichFloat(1));
			return 1;
			break;
			
		case 'Float':
			LichVM.push(new LichFloat(1));
			return 1;
			break;
			
		case 'Function':
			return this.inequivalent(object.call());
			break;
			
		case 'Primitive':
			return this.inequivalent(object.call());
			break;
			
		case 'Array':
			return object.inequivalent(this);
			break;
			
		case 'Variable':
			return this.inequivalent(object.object);
			break;
			
		case 'Envelope':
			var bool = 0;
			
			if(this.points.length() == object.points.length())
			{				
				for(var i = 0; i < this.points.length(); ++i)
				{
					if(this.points.arrayVar[i].front().value() != object.points.arrayVar[i].front().value()
						|| this.points.arrayVar[i].back().value() != object.points.arrayVar[i].back().value())
					{
						bool = 1;
						break;
					}
				}
			}
			
			else
			{
				bool = 1;
			}
			
			LichVM.push(new LichFloat(bool));
			return bool;
			break;

		case 'Stream':
			return this.inequivalent(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(1));
			return 1;
			break;
		}
	}
	
	this.greaterThan = function(object)
	{
		switch(object.type())
		{
		case 'String':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Float':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Function':
			return this.greaterThan(object.call());
			break;
			
		case 'Primitive':
			return this.greaterThan(object.call());
			break;
			
		case 'Array':
			return object.lessThan(this);
			break;
			
		case 'Variable':
			return this.greaterThan(object.object);
			break;
			
		case 'Envelope':
			var bool = 0;
			
			if(this.length() > object.length())
			{
				bool = 1;
			}
			
			LichVM.push(new LichFloat(bool));
			return bool;
			break;

		case 'Stream':
			return this.greaterThan(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
			break;
		}
	}
	
	this.lessThan = function(object)
	{
		switch(object.type())
		{
		case 'String':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Float':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Function':
			return this.lessThan(object.call());
			break;
			
		case 'Primitive':
			return this.lessThan(object.call());
			break;
			
		case 'Array':
			return object.greaterThan(this);
			break;
			
		case 'Variable':
			return this.lessThan(object.object);
			break;
			
		case 'Envelope':
			var bool = 0;
			
			if(this.length() < object.length())
			{
				bool = 1;
			}

			LichVM.push(new LichFloat(bool));
			return bool;
			break;

		case 'Stream':
			return this.lessThan(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
			break;
		}
	}
	
	this.greaterThanEqual = function(object)
	{
		switch(object.type())
		{
		case 'String':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Float':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Function':
			return this.greaterThanEqual(object.call());
			break;
			
		case 'Primitive':
			return this.greaterThanEqual(object.call());
			break;
			
		case 'Array':
			return object.greaterThanEqual(this);
			break;
			
		case 'Variable':
			return this.greaterThanEqual(object.object);
			break;
			
		case 'Envelope':
			var bool = 0;
			
			if(this.length() >= object.length())
			{
				bool = 1;
			}

			LichVM.push(new LichFloat(bool));
			return bool;
			break;

		case 'Stream':
			return this.greaterThanEqual(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
			break;
		}
	}
	
	this.lessThanEqual = function(object)
	{
		switch(object.type())
		{
		case 'String':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Float':
			LichVM.push(new LichFloat(0));
			return 0;
			break;
			
		case 'Function':
			return this.lessThanEqual(object.call());
			break;
			
		case 'Primitive':
			return this.lessThanEqual(object.call());
			break;
			
		case 'Array':
			return object.greaterThanEqual(this);
			break;
			
		case 'Variable':
			return this.lessThanEqual(object.object);
			break;
			
		case 'Envelope':
			var bool = 0;
			
			if(this.length() <= object.length())
			{
				bool = 1;
			}

			LichVM.push(new LichFloat(bool));
			return bool;
			break;

		case 'Stream':
			return this.lessThanEqual(object.value());
			break;
			
		default:
			LichVM.push(new LichFloat(0));
			return 0;
			break;
		}
	}

	this.to = function(lichType)
	{
		switch(lichType)
		{
		case 'String':
			
			var asciiArray = new Array();

			for(var i = 0; i < this.points.arrayVar.length; ++i)
			{
				// grab the values of each point and push them into our ascii array
				asciiArray.push(this.points.arrayVar[i].arrayVar[1].to('Float').floatVar);
			}

			// Translate the ascii array to a string
			return new LichString(asciiToString(asciiArray));
			break;
			
		case 'Float':
			return new LichFloat(this.length());
			break;
			
		case 'Function':
			return new LichFunction(new Array(), [this]);
			break;
			
		case 'Primitive':
			post("OBVIOUSLY you can't cast to a primtive, OBVIOUSLY.")
			break;
			
		case 'Array':
			return this.points;
			break;
			
		case 'Variable':
			post("WTF. Casting to a Variable is like translating to vapid programmer speak.");
			break;

		case 'Envelope':
			return this;
			break;

		case 'Stream':

			var times = new Array();

			for(var i = 0; i < this.points.arrayVar.length; ++i)
			{
				times.push(this.points.arrayVar[i].arrayVar[0].to('Float'));
			}

			return new LichStream(new LichArray(times), this);
			break;
			
		default:
			return this;
		}
	}

	this.play = function()
	{
		var newStream = this.to('Stream');
		LichVM.push(newStream);
		return newStream;
	}

	this.stop = function()
	{
		return this;
	}

	this.serialize = function() // Serialize the object into a JSON representation
	{
		var serialized = {};
		serialized.namespace = {};

		for(var key in this.namespace)
		{
			if(this.namespace.hasOwnProperty(key))
			{
				serialized.namespace[key] = this.namespace[key].serialize();
			}
		}

		serialized.value = {};
		serialized.value.points = this.points.serialize();
		serialized.value.shape = this.shape;
		serialized.type = this.type();
		return serialized;
	}
	
	// Member vars
	this.points = _points;
	this.points.arrayVar = this.points.arrayVar.sort(function(a,b){return a.front().value() - b.front().value()}); // Sort by time
	this.shape = _shape;
	this.namespace = {};
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LichStream
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// A stream of values at given intervals. Useful for sequencing, modulation, playback, etc...
// Everything is quantized to beats and aligned.

// [0] _durations: An array (although it doesn't have to be, it can be anything!) of durations, can be other Streams or anything
// [1] _values: An Array (although it doesn't have to be, it can be anything!) of values, can be other Streams or anything

// example:
// Stream [ 0.1 0.2 1.0 ] [ { print '1' } { print '2' } { print '3' } { print '4' } ]

function LichStream(_durations, _values) {
		
	// Public methods
	this.value = function()
	{
		return this.currentValue.value();
	}
	
	this.call = function()
	{
		return this.value();
	}
	
	this.type = function()
	{
		return 'Stream';
	}
	
	this.length = function()
	{	
		return this.values.length();
	}
	
	this.insert = function(index, value) // Insert a value
	{
		this.values.insert(index, value);
	}
	
	this.at = function(index) // Interpolate the value at any point in time based on our interpolation time
	{
		return this.values.at(index);
	}
	
	this.add = function(object)
	{
		return this.currentValue.add(object);
	}
	
	this.subtract = function(object)
	{
		return this.currentValue.subtract(object);
	}
	
	this.divide = function(object)
	{
		return this.currentValue.divide(object);
	}
	
	this.multiply = function(object)
	{
		return this.currentValue.multiply(object);
	}
	
	this.modulus = function(object)
	{
		return this.currentValue.modulus(object);
	}
	
	this.equivalent = function(object)
	{
		return this.currentValue.equivalent(object);
	}
	
	this.inequivalent = function(object)
	{
		return this.currentValue.inequivalent(object);
	}
	
	this.greaterThan = function(object)
	{
		return this.currentValue.greaterThan(object);
	}
	
	this.lessThan = function(object)
	{
		return this.currentValue.lessThan(object);
	}
	
	this.greaterThanEqual = function(object)
	{
		return this.currentValue.greaterThanEqual(object);
	}
	
	this.lessThanEqual = function(object)
	{
		return this.currentValue.lessThanEqual(object);
	}

	this.to = function(lichType)
	{
		switch(lichType)
		{
		case 'String':
			return this.currentValue.to('String');
			break;
			
		case 'Float':
			return this.currentValue.to('Float');
			break;
			
		case 'Function':
			return this.currentValue.to('Function');
			break;
			
		case 'Primitive':
			post("OBVIOUSLY you can't cast to a primtive, OBVIOUSLY.")
			break;
			
		case 'Array':
			return this.currentValue.to('Array');
			break;
			
		case 'Variable':
			post("WTF. Casting to a Variable is like translating to vapid programmer speak.");
			break;

		case 'Envelope':
			return this.currentValue.to('Envelope');
			break;

		case 'Stream':
			return this;
			break;
			
		default:
			return this;
		}
	}

	this.serialize = function() // Serialize the object into a JSON representation
	{
		var serialized = {};
		serialized.namespace = {};

		for(var key in this.namespace)
		{
			if(this.namespace.hasOwnProperty(key))
			{
				serialized.namespace[key] = this.namespace[key].serialize();
			}
		}

		serialized.value = {};
		serialized.value.durations = this.durations.serialize();
		serialized.value.values = this.values.serialize();
		serialized.type = this.type();
		return serialized;
	}

	this.play = function()
	{
		this.playing = true;
		this.pbind.play();
		return this;
	}

	this.stop = function()
	{
		this.playing = false;
		return this;
	}

	this.nextDuration = function(inval)
	{
		// post("Stream.nextDuration!!!");
		if(this.playing)
		{
			// post("Stream.nextDuration.playing == true");
			var duration;

			if(this.durations.type() == 'Array')
			{
				duration = this.durations.arrayVar[this.durationArrayIndex % this.durations.length()];
				// post("Stream.nextDuration this.durations.type() == Array");
				this.durationArrayIndex = (this.durationArrayIndex + 1) % this.durations.length();
			}

			else
			{
				// post("Stream.nextDuration this.durations.type() != Array");
				duration = this.durations;	
				// post("Stream.nextDuration duration is assigned");
			}

			switch(duration.type())
			{
			case 'Function':
				duration = duration.call().to('Float').value();
				break;

			case 'Float':
				duration = duration.value();
				break;

			default:
				duration = duration.to('Float').value();
			}

			// post("Stream.nextDuration: " + duration);
			return duration;
		}
		
		else
		{
			// post("Stream.nextDuration: null");
			return null;	
		}
	}

	this.nextValue = function(inval)
	{
		var value;

		if(this.values.type() == 'Array')
		{
			value = this.values.arrayVar[this.valuesArrayIndex % this.values.length()];
			this.valuesArrayIndex = (this.valuesArrayIndex + 1) % this.values.length();
		}

		else
		{
			value = this.values;	
		}


		if(value.type() == 'Function')
			value = value.call();

		// post("Stream.nextValue: " + value);

		// LichVM.push(value);
		this.currentValue = value;
		return value.value();
	}
	
	// Member vars
	this.durations = _durations;
	this.values = _values;
	this.currentValue = new LichFloat(0);
	this.durationRepeatNum = 0;
	this.durationArrayIndex = 0;
	this.valuesArrayIndex = 0;
	this.playing = true;
	this.namespace = {};

	// Pbind is used to create a sequence with bindings for duration and "value" which just calls its contenxts
	// it also calls any contained functions which can have external side effects as well as setting this.currentValue
	
	(
		function(self)
		{
			self.pbind = new Soliton.Pbind(
				'dur', new Soliton.Pfunc(function(inval)
				{
					return self.nextDuration(inval);
				}),

				'value', new Soliton.Pfunc(function(inval)
				{
					return self.nextValue(inval);
				})
			)	
		}
	)(this);

	this.play();
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Lich Primitives: Predefined functions written in javascript
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function compileLich()
{
	LichVM = new lichVirtualMachine();

	// var add, subtract, multiply, divide, modulus, assign, equivalent, inequivalent, ifControl, println, callFunction, incrementOne, decrementOne;
	// var newEnvelope, doFunction;
	
	function add(argArray)
	{
		return argArray[0].add(argArray[1]);
	}
	
	LichVM.reserveVar('add', new LichPrimitive(add, 2));
	LichVM.reserveVar('+', new LichPrimitive(add, 2));
	
	function subtract(argArray)
	{	
		return argArray[0].subtract(argArray[1]);
	}
	
	
	LichVM.reserveVar('subtract', new LichPrimitive(subtract, 2));
	LichVM.reserveVar('-', new LichPrimitive(subtract, 2));
	
	function multiply(argArray)
	{	
		return argArray[0].multiply(argArray[1]);
	}
	
	
	LichVM.reserveVar('multiply', new LichPrimitive(multiply, 2));
	LichVM.reserveVar('*', new LichPrimitive(multiply, 2));
	
	function divide(argArray)
	{	
		return argArray[1].divide(argArray[0]);
	}
	
	
	LichVM.reserveVar('divide', new LichPrimitive(divide, 2));
	LichVM.reserveVar('/', new LichPrimitive(divide, 2));
	
	function modulus(argArray)
	{	
		return argArray[0].modulus(argArray[1]);
	}
	
	
	LichVM.reserveVar('modulus', new LichPrimitive(modulus, 2));
	LichVM.reserveVar('%', new LichPrimitive(modulus, 2));
	
	function assign(argArray)
	{


		argArray[0].assign();
		LichVM.push(argArray[0]);
		return argArray[0].type();
	}
	
	LichVM.reserveVar('assign', new LichPrimitive(assign, 1));
	LichVM.reserveVar('define', new LichPrimitive(assign, 1));
	LichVM.reserveVar('=>', new LichPrimitive(assign, 1));
	
	function incrementOne(argArray) // Adds one to the variable
	{
		if(argArray[0].type() == 'Variable')
		{
			return argArray[0].increment();
		}
		
		else
		{
			return argArray[0].add(new LichFloat(1));
		}
	}
	
	LichVM.reserveVar('++', new LichPrimitive(incrementOne, 1));
	
	function decrementOne(argArray) // Adds one to the variable
	{
		if(argArray[0].type() == 'Variable')
		{
			return argArray[0].decrement();
		}
		
		else
		{
			return argArray[0].subtract(new LichFloat(1));
		}
	}
	
	LichVM.reserveVar('--', new LichPrimitive(decrementOne, 1));
	
	function equivalent(argArray)
	{
		return argArray[0].equivalent(argArray[1]);
	}
	
	LichVM.reserveVar('equivalent', new LichPrimitive(equivalent, 2));
	LichVM.reserveVar('==', new LichPrimitive(equivalent, 2));
	
	function inequivalent(argArray)
	{
		return argArray[0].inequivalent(argArray[1]);
	}
	
	LichVM.reserveVar('inequivalent', new LichPrimitive(inequivalent, 2));
	LichVM.reserveVar('!=', new LichPrimitive(inequivalent, 2));
	
	function greaterThan(argArray)
	{
		return argArray[0].greaterThan(argArray[1]);
	}
	
	LichVM.reserveVar('greaterThan', new LichPrimitive(greaterThan, 2));
	LichVM.reserveVar('>', new LichPrimitive(greaterThan, 2));
	
	function lessThan(argArray)
	{
		return argArray[0].lessThan(argArray[1]);
	}
	
	LichVM.reserveVar('lessThan', new LichPrimitive(lessThan, 2));
	LichVM.reserveVar('<', new LichPrimitive(lessThan, 2));
	
	function greaterThanEqual(argArray)
	{
		return argArray[0].greaterThanEqual(argArray[1]);
	}
	
	LichVM.reserveVar('greaterThanEqual', new LichPrimitive(greaterThanEqual, 2));
	LichVM.reserveVar('>=', new LichPrimitive(greaterThanEqual, 2));
	
	function lessThanEqual(argArray)
	{
		return argArray[0].lessThanEqual(argArray[1]);
	}
	
	LichVM.reserveVar('lessThanEqual', new LichPrimitive(lessThanEqual, 2));
	LichVM.reserveVar('<=', new LichPrimitive(lessThanEqual, 2));

	function booleanAnd(argArray) // && float anotherfloat
	{
		if(argArray[0].type() == 'Float' && argArray[1].type() == 'Float')
		{
			var bool = argArray[0].value() && argArray[1].value();
			LichVM.push(new LichFloat(bool));
			return bool;
		}

		else // If not a boolean, return 0
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
	}

	LichVM.reserveVar('and', new LichPrimitive(booleanAnd, 2));
	LichVM.reserveVar('&&', new LichPrimitive(booleanAnd, 2));

	function booleanOr(argArray) // || float anotherfloat
	{
		if(argArray[0].type() == 'Float' && argArray[1].type() == 'Float')
		{
			var bool = argArray[0].value() || argArray[1].value();
			LichVM.push(new LichFloat(bool));
			return bool;
		}

		else // If not a boolean, return 0
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
	}

	LichVM.reserveVar('or', new LichPrimitive(booleanOr, 2));
	LichVM.reserveVar('||', new LichPrimitive(booleanOr, 2));

	function booleanNot(argArray) // ! float
	{
		if(argArray[0].type() == 'Float')
		{
			var bool = !argArray[0].value();
			LichVM.push(new LichFloat(bool));
			return bool;
		}

		else // If not a boolean, return 0
		{
			LichVM.push(new LichFloat(0));
			return 0;
		}
	}

	LichVM.reserveVar('not', new LichPrimitive(booleanNot, 1));
	LichVM.reserveVar('!', new LichPrimitive(booleanNot, 1));
	
	function ifControl(argArray) // Takes 3 arguments: [0] conditional [1] trueFunction [2] falseFunction 
	{
		var conditional = argArray[0];
		var trueFunction = argArray[1];
		var falseFunction = argArray[2];
		var result;
				
		if(conditional.value() == 1)
		{
			return trueFunction.call();
		}
		
		else
		{
			return falseFunction.call();
		}
	}
	
	LichVM.reserveVar('if', new LichPrimitive(ifControl, 3));

	function elseControl(argArray)
	{
		LichVM.push(argArray[0]);
		return argArray[0];
	}

	LichVM.reserveVar('else', new LichPrimitive(elseControl, 1));
	
	function doFunction(argArray) // Takes two arguments: [0] number of iterations [1] function to evaluate
	{
		var result;
		 
		for(var i = 0; i < argArray[0].value(); ++i)
		{
			LichVM.push(argArray[1]);
			LichVM.push(LichVM.get("call"));
		}
		
		return LichVM.pop().call();
	}
	
	LichVM.reserveVar('do', new LichPrimitive(doFunction, 2));
		
	function println(argArray)
	{
		var printString;
		
		if(argArray[0].type() == 'Array')
		{
			printString = arrayToPrintString(argArray[0].value());
		}
		
		else if(argArray[0].type() == "Envelope")
		{
			var printString = arrayToPrintString(argArray[0].points.value());
			printString = printString.concat(" ").concat(argArray[0].shape);
		}
		
		else if(argArray[0].type() == 'Variable')
		{
			LichVM.push(argArray[0].object);
			return LichVM.get('print').value();
		}
		
		else
		{
			printString = argArray[0].type().concat(": ");
			printString = printString.concat(argArray[0].value());
		}
		
		post(printString);
		LichVM.push(argArray[0]);
		return '__LICH_PRINT_VALUE__';
	}
	
	LichVM.reserveVar('print', new LichPrimitive(println, 1));
	
	function callFunction(argArray)
	{
		return argArray[0].call();
	}
	
	LichVM.reserveVar('call', new LichPrimitive(callFunction, 1));
	LichVM.reserveVar('::', new LichPrimitive(callFunction, 1));
	
	function newEnvelope(argArray)
	{
		var Envelope = new LichEnvelope(argArray[0], argArray[1].value());
		LichVM.push(Envelope);
	}
	
	LichVM.reserveVar("Envelope", new LichPrimitive(newEnvelope, 2));
	LichVM.reserveVar("Env", new LichPrimitive(newEnvelope, 2));

	function newStream(argArray)
	{
		var Stream = new LichStream(argArray[0], argArray[1]);
		LichVM.push(Stream);
	}

	LichVM.reserveVar("Stream", new LichPrimitive(newStream, 2));

	function playStream(argArray)
	{
		argArray[0].play();
	}

	LichVM.reserveVar("play", new LichPrimitive(playStream, 1));

	function stopStream(argArray)
	{
		argArray[0].stop();
	}

	LichVM.reserveVar("stop", new LichPrimitive(stopStream, 1));
	
	function atObject(argArray) // 2 arguments: [0] object [1] index
	{
		return argArray[0].at(argArray[1]);
	}
	
	LichVM.reserveVar("at", new LichPrimitive(atObject, 2));
	LichVM.reserveVar("@", new LichPrimitive(atObject, 2));
	
	function insertValue(argArray) // 3 arguments: [0] object [1] index [2] value
	{
		return argArray[0].insert(argArray[1], argArray[2]);
	}
	
	LichVM.reserveVar("->", new LichPrimitive(insertValue, 3));
	LichVM.reserveVar("insert", new LichPrimitive(insertValue, 3));

	function spawn(argArray) // 1 argument: [0] function
	{
		// LichVM.push(argArray[0]);
		// return argArray[0].value();
		var worker = new Worker("LichThread.js");
		
		worker.addEventListener(
			"message",
			function(event)
			{
				if(event.data.message != undefined)
					post(event.data.message);
				else if(event.data.print != undefined)
					post(event.data.print);
			},
			false
		);

		worker.addEventListener(
			"error",
			function(event)
			{
				post(event.message);
			},
			false
		);

		worker.postMessage({ function: argArray[0].serialize() });

		return 'thread spawned';
	}

	LichVM.reserveVar(">>", new LichPrimitive(spawn, 1));
	LichVM.reserveVar("spawn", new LichPrimitive(spawn, 1));

	function wakeupVM()
	{
		LichVM.sleep = 0;
		LichVM.interpretStack();
	}

	LichVM.reserveVar("__WAKE_UP_VM__", wakeupVM);


	function sleep(argArray) // argArray[0] amount of time to sleep in seconds
	{
		if(argArray[0].type() == 'Float')
		{
			setTimeout(LichVM.get("__WAKE_UP_VM__"), argArray[0].value() * 1000); // multiplied by 1000 to translate from seconds to milliseconds
			LichVM.sleep = 1;
			var sleeping = "sleep: ";
			return sleeping.concat(argArray[0].value());
		}
	}

	LichVM.reserveVar("sleep", new LichPrimitive(sleep, 1));

	function setTempo(argArray) // argArray[0] size
	{
		if(argArray[0].type() == 'Float' || argArray[0].type() == 'Variable')
		{
			Soliton.Clock.default.setTempoAtTime(argArray[0].value(), 0);
		}

		else
		{
			Soliton.Clock.default.setTempoAtTime(argArray[0].to('Float').value(), 0);
		}
	}

	LichVM.reserveVar("setTempo", new LichPrimitive(setTempo, 1));

	function freeStack(argArray)
	{
		LichVM.freeStack();
	}

	LichVM.reserveVar("__FREE_STACK__", new LichPrimitive(freeStack, 0));

	function printSamples(argArray)
	{
		post(sampleArray);
	}
	
	LichVM.reserveVar("printSamples", new LichPrimitive(printSamples, 0));

	function randomFloat(argArray)
	{
		var result;
		LichVM.push(new LichFloat(Math.random()));
		LichVM.push(argArray[0]);
		return LichVM.get("multiply").call();
	}

	LichVM.reserveVar("random", new LichPrimitive(randomFloat, 1));

	///////////////////////
	// Audio Primitives
	///////////////////////

	function summon(argArray) // argArray[0] url, offset, durtation
	{
		if(argArray[0].type() == 'String')
		{
			var name = argArray[0].value();
			var nodeID = Soliton.playURL(
				"http://chadmckinneyaudio.com/ChadWP-Content/resources/music/ConvertedSamples/"+name+".ogg",
				name,
				Soliton.context.destination,
				argArray[1].to('Float').value(),
				argArray[2].to('Float').value()
			);

			LichVM.push(new LichFloat(nodeID));
		}
	}

	LichVM.reserveVar("summon", new LichPrimitive(summon, 3));

	function garbage(argArray) // argArray[0] size
	{
		if(argArray[0].type() == 'Float' || argArray[0].type() == 'Variable')
		{
			Soliton.playGarbage(argArray[0].value());
		}

		else
		{
			Soliton.playGarbage(argArray[0].to('Float').value());
		}
	}

	LichVM.reserveVar("garbage", new LichPrimitive(garbage, 1));

	function setMasterGain(argArray)
	{
		Soliton.masterGain.gain.value = argArray[0].to('Float').value();
	}

	LichVM.reserveVar("setMasterGain", new LichPrimitive(setMasterGain, 1));

	function filterAudio(argArray) // [0] source nodeID, [1] freq, [2] filter type
	{
		var type;

		if(argArray[2].type() == "String")
		{
			switch(argArray[2].stringVar)
			{
				case "low":
				case "Low":
					type = "lowpass";
					break;

				case "high":
				case "High":
					type = "highpass";
					break;

				case "band":
				case "Band":
					type = "bandpass";
					break;
			}
		}

		else
		{
			type = argArray[2].to("Float").floatVar;
		}

		var nodeID = Soliton.filter(argArray[0].value(), argArray[1].value(), type);
		LichVM.push(new LichFloat(nodeID));
	}

	LichVM.reserveVar("filter", new LichPrimitive(filterAudio, 3));

	function delayAudio(argArray) // [0] source, [1] delayTime, [2] feedback level
	{
		var nodeID = Soliton.delay(argArray[0].value(), argArray[1].value(), argArray[2].value());
		LichVM.push(new LichFloat(nodeID));
	}

	LichVM.reserveVar("delay", new LichPrimitive(delayAudio, 3));

	function genSin(i, lastValue)
	{
		return new LichFloat(Math.sin(i));
	}

	function genRand(i, lastValue)
	{
		return new LichFloat(Math.random());
	}

	function genGaussian(i, lastValue)
	{
		return new LichFloat(CloudChamber.nrand());
	}

	// generate an array filled by an algorithm
	// algorithms are functions taking an "i" and "lastValue" parameters
	function genArray(argArray) // [0] algorithm, [1] num indexes
	{
		var algorithm;
		var array = new Array();
		var lastValue = null;

		switch(argArray[0].value())
		{
		case "Sine":
		case "sine":
			algorithm = genSin;
			break;

		case "Rand":
		case "rand":
			algorithm = genRand;
			break;

		case "Gaussian":
		case "gaussian":
			algorithm = genGaussian;
			break;

		default:
			algorithm = genRand;
			post("genArray algorithm not defined.");
		}

		for(var i = 0; i < argArray[1].value(); ++i)
		{
			lastValue = algorithm(i, lastValue);
			array.push(lastValue);
		}

		LichVM.push(new LichArray(array));
	}

	LichVM.reserveVar("genArray", new LichPrimitive(genArray, 2));

	// Convert Lich array to Float32Array
	function arrayToFloatArray(array)
	{
		var floatArray = new Float32Array(array.arrayVar.length);
		for(var i = 0; i < array.arrayVar.length; ++i)
		{
			floatArray[i] = array.arrayVar[i].to("Float").value();
		}

		return floatArray;
	}

	function shapeAudio(argArray)
	{
		var nodeID = Soliton.waveShape(argArray[0].value(), arrayToFloatArray(argArray[1].to("Array")));

		LichVM.push(new LichFloat(nodeID));
	}

	LichVM.reserveVar("waveShape", new LichPrimitive(shapeAudio, 2));

	function percEnv(argArray) // [0] duration
	{
		var nodeID = Soliton.createEnvelope("perc", argArray[0].value());
		LichVM.push(new LichFloat(nodeID));
	}

	LichVM.reserveVar("perc", new LichPrimitive(percEnv, 1));

	function swellEnv(argArray) // [0] duration
	{
		var nodeID = Soliton.createEnvelope("swell", argArray[0].value());
		LichVM.push(new LichFloat(nodeID));
	}

	LichVM.reserveVar("swell", new LichPrimitive(swellEnv, 1));

	function sinOsc(argArray) // [0] frequency, [1] env
	{
		var nodeID = Soliton.oscillator(argArray[0].value(), argArray[1].value(), "sine");
		LichVM.push(new LichFloat(nodeID));
	}

	LichVM.reserveVar("sinOsc", new LichPrimitive(sinOsc, 2));

	function squareOsc(argArray) // [0] frequency, [1] env
	{
		var nodeID = Soliton.oscillator(argArray[0].value(), argArray[1].value(), "square");
		LichVM.push(new LichFloat(nodeID));
	}

	LichVM.reserveVar("square", new LichPrimitive(squareOsc, 2));

	function sawOsc(argArray) // [0] frequency, [1] env
	{
		var nodeID = Soliton.oscillator(argArray[0].value(), argArray[1].value(), "sawtooth");
		LichVM.push(new LichFloat(nodeID));
	}

	LichVM.reserveVar("saw", new LichPrimitive(sawOsc, 2));

	function triOsc(argArray) // [0] frequency, [1] env
	{
		var nodeID = Soliton.oscillator(argArray[0].value(), argArray[1].value(), "triangle");
		LichVM.push(new LichFloat(nodeID));
	}

	LichVM.reserveVar("tri", new LichPrimitive(triOsc, 2));

	function osc(argArray) // [0] frequency, [1] wave table [2] env
	{
		var nodeID = Soliton.oscillator(argArray[0].value(), argArray[2].value(), "custom", arrayToFloatArray(argArray[1].to("Array")));
		LichVM.push(new LichFloat(nodeID));
	}

	LichVM.reserveVar("osc", new LichPrimitive(osc, 3));


	function spliceOSC(argArray)
	{	
		Soliton.spliceOSC(argArray[0].value(), argArray[1].value());
	}

	LichVM.reserveVar("spliceOsc", new LichPrimitive(spliceOSC, 2));

	function spliceFX(argArray)
	{
		Soliton.spliceFX(argArray[0].value(), argArray[1].value(), argArray[2].value());
	}

	LichVM.reserveVar("spliceFX", new LichPrimitive(spliceFX, 3));

	///////////////////////
	// Graphics Primitives
	///////////////////////

	function decimalToHexString(number)
	{
	    if (number < 0)
	    {
	    	number = 0xFFFFFFFF + number + 1;
	    }

	    return number.toString(16).toUpperCase();
	}

	function packRGB(r, g, b)
	{
		return ((1 << 24) + (r << 16) + (g << 8) + b);
	}

	function rgbToHex(r, g, b) {
	    return "0x" + packRGB(r, g, b).toString(16).slice(1);
	}

	function arrayToVector(array)
	{
		return {
			x: array.arrayVar[0].value(),
			y: array.arrayVar[1].value(),
			z: array.arrayVar[2].value()	
		}
	}

	function arrayToColor(array)
	{
		return packRGB(array.arrayVar[0].value(), array.arrayVar[1].value(), array.arrayVar[2].value());
	}

	function background(argArray)
	{
		CloudChamber.renderer.setClearColorHex(arrayToColor(argArray[0]), 1);
	}

	LichVM.reserveVar("background", new LichPrimitive(background, 1));

	function addVisualObject(pointer)
	{
		var pointer = new LichFloat(pointer);
		pointer.isVisualPointer = true;
		LichVM.push(pointer);
	}

	function sphere(argArray)
	{
		addVisualObject(
			CloudChamber.sphere(
				arrayToVector(argArray[0]), // position
				argArray[1].value(), // radius
				arrayToColor(argArray[2]) // color
			)
		);
	}

	LichVM.reserveVar("sphere", new LichPrimitive(sphere, 3));

	function cube(argArray)
	{
		addVisualObject(
			CloudChamber.cube(
				arrayToVector(argArray[0]), // position
				arrayToVector(argArray[1]), // size
				arrayToVector(argArray[2]), // rotation
				arrayToColor(argArray[3]) // color
			)
		);
	}

	LichVM.reserveVar("cube", new LichPrimitive(cube, 4));

	function deleteVisualObject(argArray)
	{
		CloudChamber.delete(argArray[0].value());
	}

	LichVM.reserveVar("delete", new LichPrimitive(deleteVisualObject, 1));

	function deleteAllVisualObjects(argArray)
	{
		CloudChamber.deleteAll();
	}

	LichVM.reserveVar("deleteAll", new LichPrimitive(deleteAllVisualObjects, 0));

	function wireframe(argArray)
	{
		CloudChamber.wireframe(argArray[0].value(), argArray[1].value());
	}

	LichVM.reserveVar("wireframe", new LichPrimitive(wireframe, 2));

	function wireframeAll(argArray)
	{
		CloudChamber.wireframeAll(argArray[0].value());
	}

	LichVM.reserveVar("wireframeAll", new LichPrimitive(wireframeAll, 1));

	function moveVisualObject(argArray)
	{
		CloudChamber.move(argArray[0].value(), arrayToVector(argArray[1]));
	}

	LichVM.reserveVar("move", new LichPrimitive(moveVisualObject, 2));

	function moveAllVisualObjects(argArray)
	{
		CloudChamber.moveAll(arrayToVector(argArray[0]));
	}

	LichVM.reserveVar("moveAll", new LichPrimitive(moveAllVisualObjects, 1));

	function colorVisualObject(argArray)
	{
		CloudChamber.colorize(argArray[0].value(), arrayToColor(argArray[1]));
	}

	LichVM.reserveVar("color", new LichPrimitive(colorVisualObject, 2));

	function colorAllVisualObjects(argArray)
	{
		CloudChamber.colorizeAll(arrayToColor(argArray[0]));
	}

	LichVM.reserveVar("colorAll", new LichPrimitive(colorAllVisualObjects, 1));

	function rotateVisualObject(argArray)
	{
		CloudChamber.rotate(argArray[0].value(), arrayToVector(argArray[1]));
	}

	LichVM.reserveVar("rotate", new LichPrimitive(rotateVisualObject, 2));

	function rotateAllVisualObjects(argArray)
	{
		CloudChamber.rotateAll(arrayToVector(argArray[0]));
	}

	LichVM.reserveVar("rotateAll", new LichPrimitive(rotateAllVisualObjects, 1));

	function linearVisualObject(argArray)
	{
		CloudChamber.linear(argArray[0].value(), arrayToVector(argArray[1]));
	}

	LichVM.reserveVar("linear", new LichPrimitive(linearVisualObject, 2));

	function linearAllVisualObjects(argArray)
	{
		CloudChamber.linearAll(arrayToVector(argArray[0]));
	}

	LichVM.reserveVar("linearAll", new LichPrimitive(linearAllVisualObjects, 1));

	function angularVisualObject(argArray)
	{
		CloudChamber.angular(argArray[0].value(), arrayToVector(argArray[1]));
	}

	LichVM.reserveVar("angular", new LichPrimitive(angularVisualObject, 2));

	function angularAllVisualObjects(argArray)
	{
		CloudChamber.angularAll(arrayToVector(argArray[0]));
	}

	LichVM.reserveVar("angularAll", new LichPrimitive(angularAllVisualObjects, 1));

	function positionVisualObject(argArray)
	{
		CloudChamber.position(argArray[0].value(), arrayToVector(argArray[1]));
	}

	LichVM.reserveVar("position", new LichPrimitive(positionVisualObject, 2));

	function positionAllVisualObjects(argArray)
	{
		CloudChamber.positionAll(arrayToVector(argArray[0]));
	}

	LichVM.reserveVar("positionAll", new LichPrimitive(positionAllVisualObjects, 1));

	function scaleVisualObject(argArray)
	{
		CloudChamber.scale(argArray[0].value(), argArray[1].value());
	}

	LichVM.reserveVar("scale", new LichPrimitive(scaleVisualObject, 2));

	function scaleAllVisualObjects(argArray)
	{
		CloudChamber.scaleAll(argArray[0].value());
	}

	LichVM.reserveVar("scaleAll", new LichPrimitive(scaleAllVisualObjects, 1));

	function mesh(argArray)
	{
		var geometry;

		switch(argArray[0].stringVar) // Generation Function (given as a string)
		{
		case "cloud":
		case "Cloud":
			geometry = CloudChamber.pointCloud(argArray[1].value()); // numTriangles
			break;

		case "guassian":
		case "Gaussian":
			geometry = CloudChamber.gaussianCloud(argArray[1].value());
			break;

		case "sine":
		case "Sine":
			geometry = CloudChamber.sine(argArray[1].value());
			break;

		case "sineMap":
		case "SineMap":
			geometry = CloudChamber.heightMap(CloudChamber.sineMap, argArray[1].value(), argArray[1].value()); // width/depth of height map
			break;

		case "noiseMap":
		case "NoiseMap":
			geometry = CloudChamber.heightMap(CloudChamber.noiseMap, argArray[1].value(), argArray[1].value()); // width/depth of height map
			break;

		case "gaussianMap":
		case "GaussianMap":
			geometry = CloudChamber.heightMap(CloudChamber.gaussianMap, argArray[1].value(), argArray[1].value()); // width/depth of height map
			break;

		case "squareMap":
		case "SquareMap":
			geometry = CloudChamber.heightMap(CloudChamber.squareMap, argArray[1].value(), argArray[1].value()); // width/depth of height map
			break;

		case "sawMap":
		case "Sawap":
			geometry = CloudChamber.heightMap(CloudChamber.sawMap, argArray[1].value(), argArray[1].value()); // width/depth of height map
			break;

		case "triMap":
		case "TriMap":
			geometry = CloudChamber.heightMap(CloudChamber.triMap, argArray[1].value(), argArray[1].value()); // width/depth of height map
			break;

		case "FlatMap":
		case "flatMap":
			geometry = CloudChamber.heightMap(CloudChamber.newMap, argArray[1].value(), argArray[1].value());
			break;

		default:
			post("Mesh generation function not defined.");
			return;
			break;
		}

		addVisualObject(
			CloudChamber.mesh(
				geometry, // mesh
				arrayToColor(argArray[2]) // color
			)
		);
	}

	function march(argArray)
	{
		addVisualObject(
			CloudChamber.march(
				arrayToColor(argArray[0]) // color
			)
		);
	}

	LichVM.reserveVar("march", new LichPrimitive(march, 1));

	function randomString(argArray) // length
	{
		var randString = new Array("");

		for(var i = 0; i < argArray[0].value(); ++i)
		{
			randString.push(String.fromCharCode(Math.random() * 127));
		}

		LichVM.push(new LichString(randString.join("")));
	}

	LichVM.reserveVar("randString", new LichPrimitive(randomString, 1));

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Constants
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	LichVM.reserveVar('true', new LichFloat(1));
	LichVM.reserveVar('false', new LichFloat(0));
	LichVM.reserveVar('pi', new LichFloat(3.141592654));

	/////////////////////////
	// Soliton
	/////////////////////////

	Soliton.print = post; // Set Soliton.print to our post function
	Soliton.printError = post; // Set Soliton.print to our post function
	LichVM.scheduler = Soliton.Clock.default.scheduler;

	sampleArray = new Array(
		 "Airport",
		 "Atmospheres",
		 "Banya1",
		 "Banya2",
		 "BanyaSlap",
		 "BassNogoro",
		 "Bonang",
		 "BurntUmberLogic",
		 "Caxixi",
		 "China",
		 "Clap",
		 "cluster",
		 "Cosmic Peel",
		 "Crawling Chaos",
		 "Curtis mix",
		 "DanceCadaverous",
		 "DarkGuitar",
		 "eight energon cubes SLASH a stone among stones and the dead among the dead",
		 "FeldmanSQ2",
		 "Feral Christmas Rooster - Merry Christmas From the Dragon's Lair - 01 Santa Claus is Comin to Town",
		 "Feral Christmas Rooster - Merry Christmas From the Dragon's Lair - 02 Rudolph the Red-nosed Reindeer",
		 "Feral Christmas Rooster - Merry Christmas From the Dragon's Lair - 03 Twas The Night Before Christmas",
		 "Feral Christmas Rooster - Merry Christmas From the Dragon's Lair - 04 Jingle Bell Rock",
		 "Feral Christmas Rooster - Merry Christmas From the Dragon's Lair - 05 White Christmas",
		 "Feral Christmas Rooster - Merry Christmas From the Dragon's Lair - 06 Silent Night",
		 "Feral Christmas Rooster - Merry Christmas From the Dragon's Lair - 07 Don't Even Look At It",
		 "Flam",
		 "Foetid Tunnels ambient",
		 "GreaterThanThree",
		 "hallway",
		 "HarpSoundBox",
		 "Hip trop",
		 "Hydrogen Atom Living with Necromancer",
		 "Insects and Plant Monsters demo 1",
		 "Ionisation",
		 "It Came From The Deep(With Good Chorus)",
		 "Ketuk",
		 "Killing Music (second mix)",
		 "Lanquidity",
		 "Lost To Time",
		 "Massacre at High Noon DEMO",
		 "Merzcord",
		 "Micron Atlantis Aurochs Ceil Chrysolite Birdseed",
		 "Military_dungeon_base",
		 "MomentTrio",
		 "monkdrone",
		 "Monster",
		 "myla_audio",
		 "MyoBat",
		 "Name Randomly Generated Grad Portfolio Final",
		 "Nano Mi_dungeon_01",
		 "Newspaper",
		 "Nyogtha - Summoning and Arrival",
		 "Octopodae Vulgaris (Third Mixdown)",
		 "Organism2",
		 "Pranzo",
		 "R'lyeh Grad Portfolio Final",
		 "Safezone 4",
		 "SilverBat",
		 "Sleep Music_02",
		 "SlendroLow5",
		 "Sonnerie",
		 "ss4",
		 "Stochastic",
		 "The Sea (second Mixdown) mp3",
		 "ThitherAndYon",
		 "Track No08",
		 "Turangalila",
		 "Turtle Shells and Cloud Hopping Beta 1",
		 "Underground",
		 "Ushi Oni vs. Karee Koumori- the Demon Attacks normalized",
		 "Vampire of the Sun_section2(faster)",
		 "YigSerpent",
		 "Yog-Sothoth, The Key and The Gate (mp3)",
		 "01_Dracula II the Seal of the Curse",
		 "02_ia ia",
		 "03_Oh Dae Su",
		 "04_Unicron, Swirling, Inifinite Torrent Of Nothingness  At The End Of All Things, Divided To Create Primus,  Progenitor Of The Transformers",
		 "05_Eternal Hyper Ooze of the Aeons",
		 "06_Elk Clone",
		 "Zither",
		 "Aloke1",
		"Aloke2",
		"Aloke3",
		"Aloke4",
		"Aloke5",
		"Aloke6",
		"Aloke7",
		"Aloke8",
		"Aloke9",
		"Bartok1",
		"Bartok2",
		"Bartok3",
		"Bartok4",
		"Berg1",
		"Berg2",
		"Berg3",
		"Berg4",
		"Berg5",
		"Berg6",
		"Berg7",
		"Dillinger1",
		"Dillinger2",
		"Dillinger3",
		"Dillinger4",
		"Dillinger5",
		"Dillinger6",
		"Dillinger7",
		"Dillinger8",
		"Dillinger9",
		"Dillinger10",
		"Dillinger11",
		"Dillinger12",
		"Fantomas1",
		"Fantomas2",
		"Fantomas3",
		"Fantomas4",
		"Fantomas5",
		"Fantomas6",
		"Fantomas7",
		"Fantomas8",
		"Fantomas9",
		"Fantomas10",
		"Fantomas11",
		"Fantomas12",
		"Fantomas13",
		"Fantomas14",
		"Fantomas15",
		"Fantomas16",
		"Feldman1",
		"Feldman2",
		"Feldman3",
		"Feldman4",
		"Feldman5",
		"Hella1",
		"Hella2",
		"Hella3",
		"Ligoti1",
		"Ligoti2",
		"Ligoti3",
		"Ligoti4",
		"Ligoti5",
		"Melvins1",
		"Melvins2",
		"Melvins3",
		"Melvins4",
		"Melvins5",
		"Melvins6",
		"MoonChild1",
		"MoonChild2",
		"MoonChild3",
		"MoonChild4",
		"MoonChild5",
		"MoonChild6",
		"MoonChild7",
		"Peres1",
		"Peres2",
		"Peres3",
		"Ra1",
		"Ra2",
		"Ra3",
		"Varese1",
		"Varese2",
		"Varese3",
		"Varese4",
		"Varese5"
	);

	var lichSampleArray = new Array();

	for(var i = 0; i < sampleArray.length; ++i)
	{
		lichSampleArray.push(new LichString(sampleArray[i]));
	}

	LichVM.reserveVar("samples", new LichArray(lichSampleArray));

	
	// for(var i = 0; i < preloadArray.length; ++i)
	// {
	//
	// }

	
	// var white = new Soliton.Pwhite(0, 666).asStream();
	// white.next();
	// white.next();
	// white.next();

	// // 'freq', new Soliton.Pwhite(0, 1), 
	// // 'dur', new Soliton.Pwhite(new Soliton.Pwhite(0, 0.001), new Soliton.Pwhite(0.1, 5.0))


	// var someFunc = function(inval)
	// {
	// 	var random = Math.random();
	// 	post("Pfunc: " + random);
	// 	return random;
	// }

	// var bind = new Soliton.Pbind(
	// 	// 'dur', new Soliton.Pseq([0.5, new Soliton.Pseq([new Soliton.Pwhite(0, 1), 0.5, new Soliton.Pwhite(0, 1)], Infinity)], Infinity)
	// 	'dur', new Soliton.Pfunc(someFunc)
	// );

	// bind.play();

	////////////////
	// CodeMirror
	////////////////

	// initCodeMirror();
	
	///////////////////
	// CloudChamber
	///////////////////

	
	CloudChamber.setup(document.getElementById("canvas"), 24, undefined, post); // Create the CloudChamber instance

	var lichShaderArray = new Array();
	
	for(var i = 0; i < CloudChamber.shaderArray.length; ++i)
	{
		lichShaderArray.push(new LichString(CloudChamber.shaderArray[i]));
	}

	LichVM.reserveVar("shaders", new LichArray(lichShaderArray));

	LichVM.reserveVar("mesh", new LichPrimitive(mesh, 3));

	function setShader(argArray) // [0] shader name or array of names
	{
		if(argArray[0].type() == "String")
		{
			CloudChamber.setShader(argArray[0].value()); // , argArray[1].value()
		}

		else if(argArray[0].type() == "Array")
		{
			var shaderNames = new Array();

			for(var i = 0; i < argArray[0].arrayVar.length; ++i)
			{
				shaderNames.push(argArray[0].arrayVar[i].value());
			}

			CloudChamber.setShaders(shaderNames);
		}
	}

	LichVM.reserveVar("setShader", new LichPrimitive(setShader, 1));

	function spliceShader(argArray) // [0] splice string
	{
		CloudChamber.spliceShader(argArray[0].value());
	}

	LichVM.reserveVar("spliceShader", new LichPrimitive(spliceShader, 1));

	// CloudChamber.start();
}
*/

function compileLich()
{
	LichVM = new lichVirtualMachine();
}