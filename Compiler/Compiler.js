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
		for(n in ast)
		{
			Lich.compileAST(ast[n]);
		}
	}

	else if(ast instanceof Object)
	{
		if (typeof ast === "function")
			return; // Do nothing, this is a tail end function given by the parser we don't need.

		Lich.post("AST name: " + ast.name);
		Lich.post(ast);

		switch(ast.name)
		{
			case "module":
				break;
			case "body":
				break;
			case "topdecl-decl":
				break;
			case "topdecl-data":
				break;
			case "decl-fun":
				break;
			case "type-signature":
				break;
			case "fun-where":
				break;
			case "fixity":
				break;
			case "simpletype":
				break;
			case "constr":
				break;
			case "export-qvar":
				break;
			case "export-module":
				break;
			case "export-type-unspec":
				break;
			case "export-type-all":
				break;
			case "export-type-vars":
				break;
			case "impdecl":
				break;
			case "impspec":
				break;
			case "impspec-hiding":
				break;
			case "import-var":
				break;
			case "import-tycon":
				break;
			case "import-tycon":
				break;
			case "import-tycon":
				break;
			case "type-signature":
				break;
			case "infixexp":
				break;
			case "ite":
				break;
			case "application":
				break;
			case "lambda":
				break;
			case "let":
				break;
			case "let-one":
				break;
			case "alt":
				break;
			case "tuple":
				break;
			case "listexp":
				break;
			case "qop":
				break;
			case "conpat":
				break;
			case "wildcard":
				break;
			case "tuple_pat":
				break;
			case "integer-lit":
				break;
			case "string-lit":
				break;
			case "char-lit":
				break;
			case "float-lit":
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