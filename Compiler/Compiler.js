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
	Lich.post("Lich.compileAST: " + ast);

	if(ast instanceof Array)
	{
		var res = null;
		for(n in ast)
		{	
			Lich.post("AST ARRAY!: " + ast[n]);
			res = Lich.compileAST(ast[n]);
		}

		return res;
	}

	else if(ast instanceof Object)
	{
		if (typeof ast === "function")
		{
			Lich.post("AST FUNCTION?!: " + ast);
			return; // Do nothing, this is a tail end function given by the parser we don't need.
		}

		Lich.post("AST name: " + ast.name);
		Lich.post(ast);

		switch(ast.name)
		{
			case "module":
				return Lich.compileModule(ast);
				break;
			case "body":
				return Lich.compileBody(ast);
				break;
			case "topdecl-decl":
				return Lich.compileTopdeclDecl(ast);
				break;
			case "topdecl-data":
				return Lich.compileTopdeclData(ast);
				break;
			case "decl-fun":
				return Lich.compileDeclFun(ast);
				break;
			case "type-signature":
				return Lich.compileTypeSignature(ast);
				break;
			case "fun-where":
				return Lich.compileFunWhere(ast);
				break;
			case "fixity":
				return Lich.compileFixity(ast);
				break;
			case "simpletype":
				return Lich.compileSimpleType(ast);
				break;
			case "constr":
				return Lich.compileConstr(ast);
				break;
			case "export-qvar":
				return Lich.compileExportQvar(ast);
				break;
			case "export-module":
				return Lich.compileExportModule(ast);
				break;
			case "export-type-unspec":
				return Lich.compileExportTypeUnspec(ast);
				break;
			case "export-type-all":
				return Lich.compileExportTypeAll(ast);
				break;
			case "export-type-vars":
				return Lich.compileExportTypeVars(ast);
				break;
			case "impdecl":
				return Lich.compileImpDecl(ast);
				break;
			case "impspec":
				return Lich.compileImpSpec(ast);
				break;
			case "impspec-hiding":
				return Lich.compileImpSpecHiding(ast);
				break;
			case "import-var":
				return Lich.compileImportVar(ast);
				break;
			case "import-tycon":
				return Lich.compileImportTycon(ast);
				break;
			case "type-signature":
				return Lich.compileTypeSignature(ast);
				break;
			case "infixexp":
				return Lich.compileInfixExp(ast);
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
			default:
				Lich.unsupportedSemantics(ast);
				break;
		}
	}

	else
	{
		post("Unknown AST Type: " + (typeof ast));
	}
}

Lich.unsupportedSemantics = function(ast)
{
	throw new Error("Unsupported semantics for " + ast.name);
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
		Lich.VM.setVar(ast.ident, new LichClosure(ast.args, ast.rhs));
		return Lich.VM.Void;
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
	Lich.unsupportedSemantics(ast);
}

Lich.compileLambda = function(ast)
{
	Lich.unsupportedSemantics(ast);
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
	Lich.unsupportedSemantics(ast);
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
	return ast.value;
}

Lich.compileCharLit = function(ast)
{
	return ast.value;
}

Lich.compileFloatLit = function(ast)
{
	return ast.value;
}

Lich.compileVarName = function(ast)
{
	return Lich.VM.getVar(ast);
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
		Lich.unsupportedSemantics({name:ast});
}

Lich.compileBooleanLit = function(ast)
{
	return ast.value;
}