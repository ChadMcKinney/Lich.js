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



function add()
{
	return Lich.VM.getVar("LHS") + Lich.VM.getVar("RHS");
}

createPrimitive("+", ["LHS", "RHS"], add);
createPrimitive("add", ["LHS", "RHS"], add);

function subtract()
{
	return Lich.VM.getVar("LHS") - Lich.VM.getVar("RHS");
}

createPrimitive("-", ["LHS", "RHS"], subtract);
createPrimitive("subtract", ["LHS", "RHS"], subtract);

function mul()
{
	return Lich.VM.getVar("LHS") * Lich.VM.getVar("RHS");
}

createPrimitive("*", ["LHS", "RHS"], mul);
createPrimitive("mul", ["LHS", "RHS"], mul);

function div()
{
	return Lich.VM.getVar("LHS") / Lich.VM.getVar("RHS");
}

createPrimitive("/", ["LHS", "RHS"], div);
createPrimitive("div", ["LHS", "RHS"], div);

function pow()
{
	return Math.pow(Lich.VM.getVar("LHS"), Lich.VM.getVar("RHS"));
}

createPrimitive("^", ["LHS", "RHS"], pow);
createPrimitive("**", ["LHS", "RHS"], pow);

function mod()
{
	return Lich.VM.getVar("LHS") % Lich.VM.getVar("RHS");
}

createPrimitive("%", ["LHS", "RHS"], mod);
createPrimitive("mod", ["LHS", "RHS"], mod);


function equivalent()
{
	return Lich.VM.getVar("LHS") == Lich.VM.getVar("RHS");
}

createPrimitive("==", ["LHS", "RHS"], equivalent);


function notequivalent()
{
	return Lich.VM.getVar("LHS") != Lich.VM.getVar("RHS");
}

createPrimitive("/=", ["LHS", "RHS"], notequivalent);

function greater()
{
	return Lich.VM.getVar("LHS") > Lich.VM.getVar("RHS");
}

createPrimitive(">", ["LHS", "RHS"], greater);


function lesser()
{
	return Lich.VM.getVar("LHS") < Lich.VM.getVar("RHS");
}

createPrimitive("<", ["LHS", "RHS"], lesser);

function greaterEqual()
{
	return Lich.VM.getVar("LHS") >= Lich.VM.getVar("RHS");
}

createPrimitive(">=", ["LHS", "RHS"], greaterEqual);

function lesserEqual()
{
	return Lich.VM.getVar("LHS") <= Lich.VM.getVar("RHS");
}

createPrimitive("<=", ["LHS", "RHS"], lesserEqual);