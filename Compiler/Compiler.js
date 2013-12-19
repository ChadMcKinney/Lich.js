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

// The Lich.js compiler traverse the abstract syntax tree returned by the parser and calls native JavaScript
Lich.compileAST = function(ast)
{
	if(ast instanceof Array)
	{
		var res = null;
		for(n in ast)
		{	
			res = Lich.compileAST(ast[n]);
		}

		return res;
	}

	else if(ast instanceof Object)
	{
		/*
		if (typeof ast === "function")
		{
			Lich.post("AST FUNCTION?!: " + ast);
			return; // Do nothing, this is a tail end function given by the parser we don't need.
		}*/

		// Lich.post("AST name: " + ast.astType);
		// Lich.post(ast);

		switch(ast.astType)
		{
			case "primitive":
				return ast();
				break;
			case "module":
				return Lich.compileModule(ast);
				break;
			case "body":
				return Lich.compileBody(ast);
				break;
			case "decl-fun":
				return Lich.compileDeclFun(ast);
				break;
			case "fun-where":
				return Lich.compileFunWhere(ast);
				break;
			case "ite":
				return Lich.compileIte(ast);
				break;
			case "application":
				return Lich.compileApplication(ast);
				break;
			case "lambda":
				return Lich.compileLambda(ast);
				break;
			case "let":
				return Lich.compileLet(ast);
				break;
			case "let-one": // ghci style let expression for global definitions
				return Lich.compileLetOne(ast);
				break;
			case "alt":
				return Lich.compileAlt(ast);
				break;
			case "tuple":
				return Lich.compileTuple(ast);
				break;
			case "listexp":
				return Lich.compileListExp(ast);
				break;
			case "qop":
				return Lich.compileQop(ast);
				break;
			case "conpat":
				return Lich.compileConPat(ast);
				break;
			case "wildcard":
				return Lich.compileWildCard(ast);
				break;
			case "tuple_pat":
				return Lich.compileTuplePat(ast);
				break;
			case "integer-lit":
				return Lich.compileIntegerLit(ast);
				break;
			case "string-lit":
				return Lich.compileStringLit(ast);
				break;
			case "char-lit":
				return Lich.compileCharLit(ast);
				break;
			case "number":
			case "float-lit":
				return Lich.compileFloatLit(ast);
				break;
			case "varname":
				return Lich.compileVarName(ast);
				break;
			case "dacon":
				return Lich.compileDacon(ast);
				break;
			case "boolean-lit":
				return Lich.compileBooleanLit(ast);
				break;
			case "binop-exp":
				return Lich.compileBinOpExp(ast);
				break;
			case "negate":
				return Lich.compileNegate(ast);
			case "listrange":
				return Lich.compileListRange(ast);
			default:
				Lich.unsupportedSemantics(ast);
				break;
		}
	}

	else
	{
		Lich.post("Unknown AST Type: " + (typeof ast));
	}
}

Lich.unsupportedSemantics = function(ast)
{
	throw new Error("Unsupported semantics for " +ast+" with type "+ ast.astType);
}

Lich.compileModule = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileBody = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileTopdeclDecl = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileTopdeclData = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileDeclFun = function(ast)
{
	if(ast.args.length == 0)
	{
		var expRes = Lich.compileAST(ast.rhs);
		Lich.VM.setVar(ast.ident, expRes);
		return expRes;
	}

	else
	{
		var closure = lichClosure(ast.args, ast.rhs);
		Lich.VM.setVar(ast.ident, closure);
		return closure;
	}
}

Lich.compileTypeSignature = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileFunWhere = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileFixity = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileSimpleType = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileConstr = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileExportQvar = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileExportModule = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileExportTypeUnspec = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileExportTypeAll = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileExportTypeVars = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileImpDecl = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileImpSpec = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileImpSpecHiding = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileImportVar = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileImportTycon = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileTypeSignature = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileInfixExp = function(ast)
{
	var res = null;

	for(var i = 0; i < ast.exps.length; ++i)
	{
		res = Lich.compileAST(ast.exps[i]);
	}

	return res;
}

Lich.compileIte = function(ast)
{
	var expRes = Lich.compileAST(ast.e1); 
	if(expRes == true) // explicit to avoid false positives
		return Lich.compileAST(ast.e2);
	else
		return Lich.compileAST(ast.e3);
}

Lich.compileApplication = function(ast)
{
	var closure = Lich.compileAST(ast.exps[0]);

	if(closure.lichType != CLOSURE)
	{
		throw new Error("Unable to use application on " + closure.astType);
	}

	else
	{
		var args = new Array();
		for(var i = 1; i < ast.exps.length; ++i)
		{
			args.push(Lich.compileAST(ast.exps[i]));
		}

		return closure.invoke(args);
	}
}

Lich.compileLambda = function(ast)
{
	return lichClosure(ast.args, ast.rhs);
}

Lich.compileLet = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileLetOne = function(ast)
{
	return Lich.compileAST(ast.decl);
}

Lich.compileAlt = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileTuple = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileListExp = function(ast)
{
	var res = new Array();

	for(var i = 0; i < ast.members.length; ++i)
	{
		res.push(Lich.compileAST(ast.members[i]));
	}

	return res;
}

Lich.compileQop = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileConPat = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileWildCard = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileTuplePat = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileIntegerLit = function(ast)
{
	return ast.value;
}

Lich.compileStringLit = function(ast)
{
	return ast.value.substring(1, ast.value.length - 1);
}

Lich.compileCharLit = function(ast)
{
	return ast.value.substring(1, ast.value.length - 1);
}

Lich.compileFloatLit = function(ast)
{
	return ast.value;
}

Lich.compileVarName = function(ast)
{
	return Lich.VM.getVar(ast.id);
}

Lich.compileDacon = function(ast)
{
	if(ast == "True")
		return true;
	else if(ast == "False")
		return false;
	else if(ast == "Nothing")
		return Lich.VM.Nothing;
	else
		Lich.unsupportedSemantics({astType:ast});
}

Lich.compileBooleanLit = function(ast)
{
	return ast.value;
}

Lich.compileBinOpExp = function(ast)
{

	var op = Lich.VM.getVar(ast.op); // Lookup function for operator

	if(op == Lich.VM.Nothing)
		throw new Error("Binary Operator not found: " + ast.op);

	return op.invoke([Lich.compileAST(ast.lhs), Lich.compileAST(ast.rhs)]);
}

Lich.compileNegate = function(ast)
{ 
	return Lich.VM.getVar("subtract").invoke([0, Lich.compileAST(ast.rhs)]);
}

Lich.compileListRange = function(ast)
{
	var lower = Lich.compileAST(ast.lower);
	var upper = Lich.compileAST(ast.upper);
	var skip = 0;

	if(typeof ast.skip == "undefined")
	{
		if(lower < upper)
			skip = 1;
		else
			skip = -1;
	}
	
	else
	{
		skip = Lich.compileAST(ast.skip) - lower;
	}

	if(typeof lower !== "number" || typeof skip !== "number" || typeof skip !== "number")
		throw new Error("List range syntax can only be used with numbers.");

	Lich.post("Lich.compileListRange lower: " + lower + ", upper: " + upper + ", skip: " + skip);

	var array = new Array();

	if(skip <= 0)
	{
		for(var i = lower; i >= upper; i += skip)
		{
			array.push(i);
		}

		return array;
	}

	else
	{
		for(var i = lower; i <= upper; i += skip)
		{
			array.push(i);
		}

		return array;
	}
}