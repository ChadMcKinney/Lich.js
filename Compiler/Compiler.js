/* 
    Lich.js - JavaScript audio/visual live coding language
    Copyright (C) 2012 Chad McKinney

	http://chadmckinneyaudio.com/
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

Function.prototype.curriedArgs = [];

// Function currying that allows for currying to be used multiple times.
Function.prototype.curry = function curry() 
{
	if(typeof this.curriedFunc !== "undefined")
	{
		if(this.curriedFunc.length <= (this.curriedArgs.length + arguments.length))
	    {
	    	return this.curriedFunc.apply(this.curriedFunc, this.curriedArgs.concat(Array.prototype.slice.call(arguments)));
	    }

	    else
	    {
	    	return this.curriedFunc.curry.apply(this.curriedFunc, this.curriedArgs.concat(Array.prototype.slice.call(arguments)));
	    }
	}

	else
	{
		if(this.length <= arguments.length)
		{
			return this.apply(this, arguments);
		}

		var fn = this;
	    var args = Array.prototype.slice.call(arguments);
	    var newFunc = function() {

	    	if(fn.length <= (args.length + arguments.length))
	    	{
	    		return fn.apply(fn, args.concat(Array.prototype.slice.call(arguments)));
	    	}

	    	else
	    	{
	    		return fn.curry.apply(fn, args.concat(Array.prototype.slice.call(arguments)));
	    	}
	    };

	    newFunc.curriedFunc = fn;
	    newFunc.curriedArgs = args;
	    return newFunc;
	}
};

// Thanks to: https://gist.github.com/Gozala/1697037
function tco(f) {
  /**
  Takes `f` function and returns wrapper in return, that may be
  used for tail recursive algorithms. Note that returned funciton
  is not side effect free and should not be called from anywhere
  else during tail recursion. In other words if
  `var f = tco(function foo() { ... bar() ... })`, then `bar`
  should never call `f`. It is ok though for `bar` to call `tco(foo)`
  instead.

  ## Examples
  var sum = tco(function(x, y) {
    return y > 0 ? sum(x + 1, y - 1) :
           y < 0 ? sum(x - 1, y + 1) :
           x
  })
  sum(20, 100000) // => 100020
  **/

  var value, active = false, accumulated = []
  return function accumulator() {
    // Every time accumulator is called, given set of parameters
    // are accumulated.
    accumulated.push(arguments)
    // If accumulator is inactive (is not in the process of
    // tail recursion) activate and start accumulating parameters.
    if (!active) {
      active = true
      // If wrapped `f` performs tail call, then new set of parameters will
      // be accumulated causing new iteration in the loop. If `f` does not
      // performs tail call then accumulation is finished and `value` will
      // be returned. 
      while (accumulated.length) value = f.apply(this, accumulated.shift())
      active = false
      return value
    }
  }
}

function forEachCpsTco(arr, visitor, done) // cps style array iteration via recursion
{ 
    trampoline(forEachCpsRecTco(0, arr, visitor, done));
}

function forEachCpsRecTco(index, arr, visitor, done) 
{
    if (index < arr.length) 
    {
    	var retArr;
        visitor(arr[index], index, function () 
        {
            retArr = [forEachCpsRecTco,[index+1, arr, visitor, done]];
        });

        return retArr;
    } 

    else 
    {
        return [done];
    }
}

function forEachCps(arr, visitor, done) // cps style array iteration via recursion
{ 
    forEachCpsRec(0, arr, visitor, done)
}

function forEachCpsRec(index, arr, visitor, done) 
{
    if (index < arr.length) 
    {
        visitor(arr[index], index, function () 
        {
            forEachCpsRec(index+1, arr, visitor, done);
        });
    } 

    else 
    {
        done();
    }
}

function forEachDictCps(arr, visitor, done) // cps style array iteration via recursion
{ 
	var keys = Object.keys(arr).filter(function(element) { return element != "_lichType"});
    forEachDictCpsRec(0, keys, visitor, done)
}

function forEachDictCpsRec(index, arr, visitor, done) 
{
    if (index < arr.length) 
    {
        visitor(arr[index], index, function () 
        {
            forEachDictCpsRec(index+1, arr, visitor, done);
        });
    } 

    else 
    {
        done();
    }
}

function forEachDictReverseCps(arr, visitor, done) // cps style array iteration via recursion
{ 
	var keys = Object.keys(arr).filter(function(element) { return element != "_lichType"});
    forEachDictReverseCpsRec(keys.length - 1, keys, visitor, done)
}

function forEachDictReverseCpsRec(index, arr, visitor, done) 
{
    if (index >= 0) 
    {
        visitor(arr[index], index, function () 
        {
            forEachDictReverseCpsRec(index-1, arr, visitor, done);
        });
    } 

    else 
    {
        done();
    }
}

function forEachReverseCps(arr, visitor, done) // cps style array iteration via recursion
{ 
    forEachReverseCpsRec(arr.length - 1, arr, visitor, done)
}

function forEachReverseCpsRec(index, arr, visitor, done) 
{
    if(index >= 0) 
    {
        visitor(arr[index], index, function () 
        {
            forEachReverseCpsRec(index - 1, arr, visitor, done);
        });
    } 

    else 
    {
        done();
    }
}

function forEachWithBreakCps(arr, visitor, done) // cps style array iteration via recursion
{ 
    forEachCpsWithBreakRec(0, arr, visitor, done)
}

function forEachCpsWithBreakRec(index, arr, visitor, done)
{
    if (index < arr.length) 
    {
        visitor(arr[index], index, function(doBreak) // Extra doBreak argument for conditional breaking
        {
        	if(doBreak)
            	done();
        	else
            	forEachCpsWithBreakRec(index+1, arr, visitor, done);
        });
    }

    else 
    {
        done();
    }
}

function forEachPairsCps(arr, visitor, done) // cps style array iteration via recursion
{ 
    forEachPairsCpsRec(0, arr, visitor, done)
}

function forEachPairsCpsRec(index, arr, visitor, done) // increment by pairs
{
    if (index < arr.length) 
    {
        visitor(arr[index], index, function () 
        {
            forEachPairsCpsRec(index+2, arr, visitor, done);
        });
    } 

    else 
    {
        done();
    }
}

function mapCps(arr, func, done) 
{
    mapCpsRec(0, [], arr, func, done)
}

function mapCpsRec(index, outArr, inArr, func, done) 
{
    if (index < inArr.length) 
    {
        func(inArr[index], index, function (result) 
        {
            mapCpsRec(index+1, outArr.concat(result),
                      inArr, func, done);
        });
    } 

    else {
        done(outArr);
    }
}

function mapDictCps(arr, func, done) 
{
	var keys = Object.keys(arr).filter(function(element) { return element != "_lichType"});
    mapDictCpsRec(0, {}, keys, func, done)
}

function mapDictCpsRec(index, outArr, inArr, func, done) 
{
    if (index < inArr.length) 
    {
        func(inArr[index], index, function (result) 
        {
        	outArr[inArr[index]] = result;
            mapDictCpsRec(index+1, outArr, inArr, func, done);
        });
    } 

    else {
        done(outArr);
    }
}


function trampoline(result) 
{
    while(Array.isArray(result)) 
    {
        var func = result[0];
        var args = (result.length >= 2 ? result[1] : []);
        result = func.apply(null, args);
    }
}

Lich.verifyDef = function(name)
{
	if(Lich.parseType === "library")
	{
		if(Lich.libraryNamespace.indexOf(name) != -1)
			throw new Error("Duplicate definition for " + name);
		else
			Lich.libraryNamespace.push(name);
	}

	if(Lich.VM.reserved.hasOwnProperty(name))
		throw new Error("Duplicate definition for reserved variable " + name + ". Use a different name.");
}

// The Lich.js compiler traverse the abstract syntax tree returned by the parser and calls native JavaScript
Lich.compileAST = function(ast)
{
	if(ast instanceof Array)
	{
		var res = new Array();
		for(var i = 0; i < ast.length; ++i)
		{	
			res.push(Lich.compileAST(ast[i]));
		}

		return res;
	}

	else if(ast instanceof Object)
	{
		switch(ast.astType)
		{
			case "primitive":
				return ast;

			case "percStream":
				return Lich.compilePercStream(ast);

			case "percList":
				return Lich.compilePercList(ast);

			case "percMods":
				return Lich.compilePercMods(ast);

			case "soloStream":
				return Lich.compileSoloStream(ast);

			case "soloList":
				return Lich.compileSoloList(ast);

			case "soloMods":
				return Lich.compileSoloMods(ast);

			case "decl-fun":
				return Lich.compileDeclFun(ast);

			case "local-decl-fun":
				return Lich.compileLocalDeclFun(ast);
				
			case "fun-where":
				return Lich.compileFunWhere(ast);
				
			case "ite":
				return Lich.compileIte(ast);
				
			case "application":
				return Lich.compileApplication(ast);
				
			case "function-application-op":
				return Lich.compileFunctionApplicationOp(ast);

			case "receive":
				return Lich.compileReceive(ast);
				
			case "function-composition":
				return Lich.compileFunctionComposition(ast);

			case "function-stream":
				return Lich.compileFunctionStream(ast);

			case "lambda":
				return Lich.compileLambda(ast);
				
			case "let":
				return Lich.compileLet(ast);
				
			case "let-one": // ghci style let expression for global definitions
				return Lich.compileLetOne(ast);
				
			case "listexp":
				return Lich.compileListExp(ast);
				
			case "qop":
				return Lich.compileQop(ast);
				
			case "conpat":
				return Lich.compileConPat(ast);
				
			case "wildcard":
				return { _lichType: WILDCARD };
				
			case "integer-lit":
			case "char-lit":
			case "number":
			case "float-lit":
			case "boolean-lit":
			case "string-lit":
				return ast.value;
				
			case "varname":
				return Lich.compileVarName(ast);
				
			case "dacon":
				return Lich.compileDacon(ast);
				
			case "binop-exp":
				return Lich.compileBinOpExp(ast);

			case "curried-binop-exp":
				return Lich.compileCurriedBinOpExp(ast);

			case "left-curried-binop-exp":
				return Lich.compileLeftCurriedBinOpExp(ast);

			case "right-curried-binop-exp":
				return Lich.compileRightCurriedBinOpExp(ast);
				
			case "negate":
				return Lich.compileNegate(ast);
				
			case "listrange":
				return Lich.compileListRange(ast);
				
			case "dictionary":
				return Lich.compileDictionary(ast);
				
			case "case":
				return Lich.compileCase(ast);
				
			case "Nothing":
				return "Lich.VM.Nothing";
				
			case "list-comprehension":
				return Lich.compileListComprehension(ast);
				
			case "module":
				return Lich.compileModule(ast);
				
			case "body":
				return Lich.compileBody(ast);
				
			case "data-decl":
				return Lich.compileDataDecl(ast);
				
			case "data-inst":
				return Lich.compileDataInst(ast);
				
			case "data-lookup":
				return Lich.compileDataLookup(ast);
				
			case "data-update":
				return Lich.compileDataUpdate(ast);
				
			case "data-enum":
				return Lich.compileDataEnum(ast);
				
			case "data-match":
				return Lich.compileDataMatch(ast);
				
			case "topdecl-decl":
				return Lich.compileTopdeclDecl(ast);

			case "top-exp":
				return Lich.compileTopExp(ast);

			case "do-exp":
				return Lich.compileDoExp(ast);

			case "guard-fun":
				return Lich.compileGuardExp(ast);

			case "synthdef":
				return Lich.compileSynthDef(ast);

			case "impjs":
				return Lich.compileImportJS(ast);

			default:
				return Lich.unsupportedSemantics(ast);
		}
	}

	else if(typeof ast === "undefined")
	{
		return Lich.VM.Nothing;
	}

	else
	{
		throw new Error("Unknown AST Type: " + (typeof ast));
	}
}

Lich.unsupportedSemantics = function(ast)
{
	throw new Error("Unsupported semantics for " +ast+" with type "+ ast.astType);
}

Lich.getType = function(object)
{
	if(object == null)
		return NOTHING;

	var type = typeof object;

	if(object instanceof Array)
		return LIST;
	else if(type === "undefined")
		return NOTHING;
	else if(type === "number")
		return NUMBER;
	else if(type === "string")
		return STRING;
	else if(type === "function")
		return CLOSURE;
	else if(type === "boolean")
		return BOOLEAN;
	else if(typeof object._lichType !== "undefined")
		return object._lichType;
	else
		throw new Error("uknown object: " + object);
	
}

Lich.dataMatch = function(object, pat)
{
	if(Lich.getType(object) != DATA)
	{
		return false;
	}	

	else
	{
		if(object._datatype == pat)
			return true;
		else
			return false;
	}
}

Lich.matchError = function(object, pat)
{
	throw new Error("Unmatched pattern: " + object);
}

Lich.listMatchError = function(i)
{
	throw new Error("Function argument does not match list pattern for argument number "+i);
}

Lich.lambdaPatternPrint = function(numArgs)
{
	var lambdaString = "(\\\\";
	for(var i = 0; i < numArgs; ++i)
	{
		lambdaString = lambdaString + "_ ";
	}

	lambdaString = lambdaString + "->)";
	return lambdaString;
}

Lich.numLambdaArgs = function(object)
{
	if(typeof object.curriedFunc !== "undefined")
	{
		return object.curriedFunc.length - object.curriedArgs.length;
	}

	else
	{
		return object.length;
	}
}

Lich.generateMatchFunc = function(object, pat, i, throwCode)
{
	var matchCode = "";
	if(pat.astType == "at-match")
	{
		pat = pat.pat;
	}

	switch(pat.astType)
	{
	case "varname":
	case "wildcard":
		if(throwCode)
			return matchCode;
		else
			return matchCode + "true";

	case "Nothing":
		if(throwCode)
		{
			return (matchCode + "if(Lich.getType("+object+") != NOTHING){throw new Error(\"Function argument does not match Nothing pattern for "
				+"argument number \"+"+i+")};");
		}

		else
		{
			return matchCode + "Lich.getType("+object+") == NOTHING";
		}

	case "data-match":

		if(!throwCode)
			matchCode += "(function(){";

		matchCode = matchCode + "if(Lich.dataMatch("+object+", \""+pat.id+"\")){";

		for(var j = 0; j < pat.members.length; ++j)
		{
			matchCode = matchCode + pat.members[j] + " = " + object + "[" + object + "._argNames[" + j + "]];";
		}

		if(throwCode)
			matchCode = matchCode + "}else{throw new Error(\"Function argument does not match "+pat.id+" pattern for argument number \"+"+i+")};";
		else
			matchCode = matchCode + ";return true}else{return false}";
		
		if(!throwCode)
			matchCode += "})()";

		return matchCode;

	case "literal-match":
		var value = pat.value.value;
		if(typeof value === "string")
			value = value.replace(/\"/g,"");

		if(throwCode)
		{
			return (matchCode+"if("+object+" !== "+pat.value.value+"){Lich.VM.Print("+object+");throw new Error(\"Function argument does not match "
				+value+" pattern for argument number \"+"+i+")};");
		}

		else
		{
			return matchCode + object+" === "+pat.value.value;
		}

	case "head-tail-match":

		if(!throwCode)
			matchCode += "(function(){";

		matchCode = matchCode + "if(Lich.getType("+object+") == LIST){if("+object+".length < 1){";

		if(throwCode)
		{
			matchCode = matchCode +"throw new Error(\"Function argument does not match ("+pat.head+":"+pat.tail+") pattern for argument number \"+"+i
				+"+\". Matching lists much have a length greater than 0.\")}else{";
		}

		else
		{
			matchCode = matchCode + "return false}else{";
		}

		if(pat.head.astType != "wildcard")
		{
			matchCode = matchCode + pat.head + " = " + object + ".length >= 1 ? " + object + "[0] : Lich.VM.Nothing;";
		}

		if(pat.tail.astType != "wildcard")
		{
			matchCode = matchCode + pat.tail + " = " + object + ".slice(1, " + object + ".length);";
		}
		
		if(throwCode)
		{
			matchCode = matchCode + "}}else{throw new Error(\"Function argument does not match ("+pat.head+":"+pat.tail+") pattern for argument number \"+"
				+i+"+\". Supplied argument is not a list.\")};";
		}

		else
		{
			matchCode = matchCode + ";return true}}else{return false};";
		}
		
		if(!throwCode)
			matchCode += "})()";
		
		return matchCode;

	case "list-match":

		if(!throwCode)
			matchCode += "(function(){";

		matchCode = matchCode + "if(Lich.getType("+object+") == LIST){if("+object+".length == "+pat.list.length+"){";
				
		for(var j = 0; j < pat.list.length; ++j)
		{
			if(pat.list[j].astType !== "wildcard")
			{
				if(pat.list[j].astType == "varname")
				{
					matchCode = matchCode + pat.list[j].id + " = " + object + "[" + j + "];";
				}

				else
				{
					var tempCode = Lich.generateMatchFunc(object+"["+j+"]", pat.list[j], i, throwCode);
					if(throwCode)
						matchCode = matchCode + tempCode;
					else
						matchCode = matchCode + "var _bool=(function(){" + tempCode + "})();if(!(_bool)){return false};";
				}
			}
		}

		if(throwCode)
		{
			matchCode = matchCode + "}else{Lich.listMatchError("+i+")}}else{Lich.listMatchError("+i+")};";	
		}

		else
		{
			matchCode = matchCode + ";return true}else{return false}}else{return false};";	
		}
		
		if(!throwCode)
			matchCode += "})()";
		
		return matchCode;

	case "lambda-pat":

		if(throwCode)
		{
			matchCode = matchCode + "if((typeof "+ object + " !== \"function\")||(Lich.numLambdaArgs("+object+") != " + pat.numArgs+")){"
				+"throw new Error(\"Function argument does not match "+Lich.lambdaPatternPrint(pat.numArgs)+" pattern for argument number \"+"+i+")};";	
			return matchCode;
		}

		else
		{
			matchCode = matchCode + "(typeof "+ object + " === \"function\")&&(Lich.numLambdaArgs("+object+") == " + pat.numArgs+")";	
		}
		
	default:
		return matchCode;
	}
}

// Generates a list of argument names and optional variable names from a pattern. 
// Used to create local scope variables before generating the actual matching code.
// Every match must generate an argument name for the pattern, and can optionally create extra variables as needed.
// The i argument is used to prevent namespace clashes in name generation. All non-user generated names must start with an underscore
Lich.generateOneArgNameAndMatchVars = function(pat, i)
{
	var argName = "_";
	var matchVars = "";
	if(pat.astType == "at-match")
	{
		argName = pat.id;
		var arr = Lich.generateOneArgNameAndMatchVars(pat.pat, i);
		var tempName = arr[0];
		var tempVars = arr[1];
		matchVars = matchVars + tempVars;
		return [argName, matchVars];
	}

	else
	{
		switch(pat.astType)
		{
		case "varname":
		case "wildcard":
			argName = pat.id;
			return [argName, matchVars];

		case "Nothing":
			argName = "_nothing"+i;
			return [argName, matchVars];

		case "data-match":
			argName = "_"+pat.id+i;
			for(var i = 0; i < pat.members.length; ++i)
			{	
				matchVars = matchVars + "var "+pat.members[i]+";";
			}
			return [argName, matchVars];

		case "literal-match":
			argName = "_"+pat.astType.replace(/-/g,"_")+i;
			return [argName, matchVars];

		case "head-tail-match":
			argName = "_headTail"+i;
			if(pat.head.astType != "wildcard")
			{
				matchVars = matchVars + "var "+pat.head+";";	
			}
			
			if(pat.tail.astType != "wildcard")
			{
				matchVars = matchVars + "var "+pat.tail+";";	
			}
			return [argName, matchVars];

		case "list-match":
			argName = "_list"+i;
			for(var j = 0; j < pat.list.length; ++j)
			{
				var elem = pat.list[j];
				if(elem.astType !== "wildcard")
				{
					if(elem.astType == "varname")
					{
						matchVars = matchVars + "var "+elem.id+";";
					}
	
					else
					{
						matchVars += Lich.generateOneArgNameAndMatchVars(elem, i)[1];
					}
				}
			}

			return [argName, matchVars];

		case "lambda-pat":
			argName = "_lambda"+i;
			return [argName,matchVars];

		default:
			return [argName,matchVars];
		}
	}
}

Lich.generateArgNamesAndMatchVars = function(args)
{
	var argNames = new Array();
	var matchVars = "";
	
	for(var i = 0; i < args.length; ++i)
	{
		var arr = Lich.generateOneArgNameAndMatchVars(args[i], i);
		argNames.push(arr[0]);
		matchVars += arr[1];
	}

	return [argNames, matchVars];
}

Lich.checkFunctionArgMatches = function(argNames, pats)
{
	var matchCode = "";
	for(var i = 0; i < argNames.length; ++i)
	{
		matchCode += Lich.generateMatchFunc(argNames[i], pats[i], i, true);
	}

	return matchCode;

}

Lich.compileModule = function(ast)
{
	Lich.post("Compiling module: " + ast.modid);
	var res = Lich.compileAST(ast.body);
	Lich.post("Done compiling module: " + ast.modid);
	return res;
}

Lich.compileBody = function(ast)
{
	var body = "";
	for(var i = 0; i < ast.topdecls.length; ++i)
	{
		body += Lich.compileAST(ast.topdecls[i]) + ";";
	}

	return body;
}

Lich.compileTopdeclDecl = function(ast)
{
	return Lich.compileAST(ast.decl);
}

Lich.compileTopdeclData = function(ast)
{
	return Lich.unsupportedSemantics(ast);
}

Lich.compileLocalDeclFun = function(ast)
{
	if(ast.args.length == 0)
	{
		return "var "+ast.ident.id + "=" + Lich.compileAST(ast.rhs);
	}

	else
	{
		
		var localArgNames = [];

		for(var i = 0; i < ast.args.length; ++i)
		{
			if(ast.args[i].astType == "varname")
			{
				if(localArgNames.indexOf(ast.args[i].id) != -1)
					throw new Error("Duplicate definition for argument: " + ast.args[i].id + " in function " + ast.ident.id);
				else
					localArgNames.push(ast.args[i].id);
			}
		}

		var rhs = Lich.compileAST(ast.rhs);
		var arr = Lich.generateArgNamesAndMatchVars(ast.args);
		var argNames = arr[0];
		var matchVars = arr[1];
		var matchCode = Lich.checkFunctionArgMatches(argNames, ast.args);
		return "var " + ast.ident.id + "=function (" + argNames.join(",") + "){"+matchVars+matchCode+"return "+rhs+"}";
	}
}

Lich.printAll = function(arr)
{
	for(var i = 0; i < arr.length; ++i)
	{
		Lich.post("printAll: " + Lich.VM.PrettyPrint(arr[i]));
	}
}

Lich.compileDeclFun = function(ast)
{
	Lich.verifyDef(ast.ident.id);

	if(ast.args.length == 0 && typeof ast.noCollapse == "undefined")
	{
		return  ast.ident.id + "="+Lich.compileAST(ast.rhs)+";";
	}

	else
	{
		var localArgNames = [];

		for(var i = 0; i < ast.args.length; ++i)
		{
			if(ast.args[i].astType == "varname")
			{
				if(localArgNames.indexOf(ast.args[i].id) != -1)
					throw new Error("Duplicate definition for argument: " + ast.args[i].id + " in function " + ast.ident.id);
				else
					localArgNames.push(ast.args[i].id);
			}
		}

		var rhs = Lich.compileAST(ast.rhs);
		var arr = Lich.generateArgNamesAndMatchVars(ast.args);
		var argNames = arr[0];
		var matchVars = arr[1];
		var matchCode = Lich.checkFunctionArgMatches(argNames, ast.args);
		return ast.ident.id+"=function "+ast.ident.id+"(" + argNames.join(",") + "){"+matchVars+matchCode+"return "+rhs+"}";
	}
}

Lich.compileFunWhere = function(ast)
{
	var declNames = [];

	for(var i = 0; i < ast.decls.length; ++i)
	{
		if(declNames.indexOf(ast.decls[i].ident.id) != -1)
			throw new Error("Duplicate definition for local declaration: " + ast.decls[i].ident.id);
		else
			declNames.push(ast.decls[i].ident.id);
	}

	var decls = [];
	for(var i = 0; i < ast.decls.length; ++i)
	{
		var elem = ast.decls[i];

		if(elem.astType == "decl-fun")
			elem.astType = "local-decl-fun";
		else if(elem.astType == "guard-fun")
			elem.local = true;

		decls.push(Lich.compileAST(elem));
	}

	var exp = Lich.compileAST(ast.exp);
	return "(function(){"+decls.join(";")+";return "+exp+"})();";
}

Lich.compileConstr = function(ast)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileIte = function(ast)
{
	var expRes1 = Lich.compileAST(ast.e1);
	var expRes2 = Lich.compileAST(ast.e2);
	var expRes3 = Lich.compileAST(ast.e3);
	return "(function(){if("+expRes1+"){return "+expRes2+"}else{return "+expRes3+"}})()";
}

Lich.application = function(func, args)
{
	if(typeof func !=="function")
		throw new Error("Expression " + Lich.VM.PrettyPrint(func) + " cannot be used as a function for function application.");

	return func.curry.apply(func, args);
}

Lich.compileApplication = function(ast)
{
	var exps = [];
	for(var i = 0; i < ast.exps.length; ++i)
	{
		exps.push(Lich.compileAST(ast.exps[i]));
	}

	return "Lich.application(" + exps[0]+",["+exps.slice(1, exps.length).join(",")+"])";
}

Lich.compileFunctionApplicationOp = function(ast)
{
	return "Lich.application("+Lich.compileAST(ast.lhs)+",["+Lich.compileAST(ast.rhs)+"])";
}

Lich.compileFunctionComposition = function(ast)
{
	var funcs = [];
	for(var i = 0; i < ast.exps.length; ++i)
	{
		funcs.push(Lich.compileAST(ast.exps[i]));
	}

	return "function(a){var funcs=["+funcs.join(",")+"];var res = a;for(var i = funcs.length - 1; i >= 0; --i){res = funcs[i](res);};return res;}";
}

Lich.compileFunctionStream = function(ast)
{
	var funcs = "";
	var end = "";
	for(var i = ast.exps.length - 1; i >= 0; --i)
	{
		if(i > 0)
			funcs += "Lich.application(";

		funcs += "("+Lich.compileAST(ast.exps[i])+")";

		if(i > 0)
		{
			funcs += ",[";
			end += "])";
		}
	}

	return funcs + end;
}

Lich.compileLambda = function(ast)
{
	var rhs = Lich.compileAST(ast.rhs);
	var arr = Lich.generateArgNamesAndMatchVars(ast.args);
	var argNames = arr[0];
	var matchVars = arr[1];
	var matchCode = Lich.checkFunctionArgMatches(argNames, ast.args);
	return "(function (" + argNames.join(",") + "){"+matchVars+matchCode+"return "+rhs+"})"; 			
}

Lich.compileLet = function(ast)
{
	var declNames = [];

	for(var i = 0; i < ast.decls.length; ++i)
	{
		if(declNames.indexOf(ast.decls[i].ident.id) != -1)
			throw new Error("Duplicate definition for local declaration: " + ast.decls[i].ident.id);
		else
			declNames.push(ast.decls[i].ident.id);
	}

	var decls = [];
	for(var i = 0; i < ast.decls.length; ++i)
	{
		var elem = ast.decls[i];

		if(elem.astType == "decl-fun")
			elem.astType = "local-decl-fun";
		else if(elem.astType == "guard-fun")
			elem.local = true;

		decls.push(Lich.compileAST(elem));
	}

	var exp = Lich.compileAST(ast.exp);
	return "(function(){"+decls.join(";")+";return "+exp+"})();";
}

Lich.compileLetOne = function(ast)
{
	return Lich.compileAST(ast.decl)+";Lich.post(\"Lich> \"+Lich.VM.PrettyPrint("+ast.decl.ident.id+"))";
}

Lich.compileListExp = function(ast)
{
	var res = [];
	for(var i = 0; i < ast.members.length; ++i)
	{
		res.push(Lich.compileAST(ast.members[i]));
	}

	return "["+res.join(",")+"]";
}

Lich.compileQop = function(ast)
{
	return Lich.unsupportedSemantics(ast);
}

Lich.compileConPat = function(ast)
{
	return Lich.unsupportedSemantics(ast);
}

Lich.compileWildCard = function(ast)
{
	return Lich.unsupportedSemantics(ast);
}

Lich.compileVarName = function(ast)
{
	return ast.id;
}

Lich.compileDacon = function(ast)
{
	if(ast == "Nothing")
		return "null";
	else
		return Lich.unsupportedSemantics({astType:ast});
}

Lich.compileDataDecl = function(ast)
{
	Lich.verifyDef(ast.id);

	var argNames = [];
	var initialData = [];
	var args = [];
	var dataPairs = [];
	for(var i = 0; i < ast.members.length; ++i)
	{
		//var elemRes = Lich.compileAST(ast.members[i].exp);
		argNames.push("\""+ast.members[i].id+"\"");
		args.push(ast.members[i].id);
		dataPairs.push(ast.members[i].id+":"+ast.members[i].id);
	}

	initialData.push("_lichType:DATA");
	initialData.push("_datatype:\""+ast.id+"\"");
	initialData.push("_argNames:["+argNames.join(",")+"]");

	return ast.id+"=function("+args.join(",")+"){return {"+initialData.concat(dataPairs).join(",")+"}}";
}

Lich.newData = function(constructor, members)
{
	if(constructor == null) throw new Error("Unable to find data constructor for " + constructor);
	var data = _deepCopy(constructor);
	
	for(var i = 0; i < members.length; ++i)
	{
		data[constructor._argNames[i]] = members[i];
	}

	return data;
}

Lich.compileDataInst = function(ast)
{
	var members = [];
	for(var i = 0; i < ast.members.length; ++i)
	{
		members.push(Lich.compileAST(ast.members[i]));
	}

	if(members.length > 0)
		return "Lich.application("+ast.id+",["+members.join(",")+"])";
	else
		return ast.id;
}

Lich.compileDataLookup = function(ast)
{
	return Lich.compileAST(ast.data)+"."+ast.member;
}

Lich.dataUpdate = function(data,members)
{
	var newData = _deepCopy(data);
	for(var i = 0; i < members.length; ++i)
	{
		newData[members[i].id] = members[i].exp;
	}

	return newData;
}

Lich.compileDataUpdate = function(ast)
{
	var dataCon = Lich.compileAST(ast.data);
	var members = [];
	for(var i = 0; i < ast.members.length; ++i)
	{
		members.push("{id:\""+ast.members[i].id+"\", exp:"+Lich.compileAST(ast.members[i].exp)+"}")
	}

	return "Lich.dataUpdate("+dataCon+",["+members.join(",")+"])";
}

Lich.compileDataEnum = function(ast)
{
	Lich.verifyDef(ast.id);
	dataPairs = new Array();
	var res = "";

	for(var i = 0; i < ast.members.length; ++i)
	{
		res = res + ast.members[i] + "={_lichType:DATA,_argNames:[],_datatype:\""+ast.members[i]+"\"};"
		dataPairs.push("\""+ast.members[i] + "\"" + ":" + ast.members[i]);
	}

	var argNames = ast.members.map(function(elem){return "\""+elem+"\"";});

	dataPairs.push("_lichType:DATA");
	dataPairs.push("_argNames:["+argNames.join(",")+"]");
	dataPairs.push("_datatype:\""+ast.id+"\"");
	return res+ast.id+"={"+dataPairs.join(",")+"};";
}

var _literalBinOps = ["+","-","/","*","%",">","<",">=","<=","=="];
_binOps = {};

Lich.compileBinOpExp = function(ast)
{
	var lhs = Lich.compileAST(ast.lhs);
	var rhs = Lich.compileAST(ast.rhs);
	
	if(((ast.lhs.astType == "float-lit" || ast.lhs.astType == "string-lit") && (ast.rhs.astType == "float-lit" || ast.rhs.astType == "string-lit"))
		&& _literalBinOps.indexOf(ast.op) != -1)
		return lhs+ast.op+" "+rhs; // space added for negative numbers
	else if(Lich.VM.reserved.hasOwnProperty(ast.op))
		return _binOps[ast.op]+"("+lhs+","+rhs+")";
	else
		throw new Error("Unrecongized binary operator: " + ast.op);
}


Lich.compileCurriedBinOpExp = function(ast)
{
	if(Lich.VM.reserved.hasOwnProperty(ast.op))
		return "Lich.VM.reserved[\""+ast.op+"\"]";
	else
		throw new Error("Unrecongized binary operator: " + ast.op);
}

Lich.compileLeftCurriedBinOpExp = function(ast)
{
	if(Lich.VM.reserved.hasOwnProperty(ast.op))
		return "Lich.VM.reserved[\""+ast.op+"\"].curry("+Lich.compileAST(ast.lhs)+")";
	else
		throw new Error("Unrecongized binary operator: " + ast.op);
}

Lich.compileRightCurriedBinOpExp = function(ast)
{
	if(Lich.VM.reserved.hasOwnProperty(ast.op))
		return "(function(lhs){return Lich.application(Lich.VM.reserved[\""+ast.op+"\"],[lhs,"+Lich.compileAST(ast.rhs)+"])})";
	else
		throw new Error("Unrecongized binary operator: " + ast.op);
}

Lich.compileNegate = function(ast)
{ 
	return "(-"+Lich.compileAST(ast.rhs)+")"
}

Lich.listRange = function(lower, upper, next)
{
	var skip = 0;

	if(Lich.getType(next) == NOTHING)
	{
		if(lower < upper)
			skip = 1;
		else
			skip = -1;
	}
	
	else
	{
		skip = next - lower;
	}

	if(typeof lower !== "number" || typeof skip !== "number" || typeof upper !== "number")
	{
		throw new Error("List range syntax can only be used with numbers. failed with: " 
			+ Lich.VM.PrettyPrint(lower) + "," + Lich.VM.PrettyPrint(next) + ".." + Lich.VM.PrettyPrint(upper));
	}

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

Lich.compileListRange = function(ast)
{
	var lower = Lich.compileAST(ast.lower);
	var upper = Lich.compileAST(ast.upper);
	
	if(typeof ast.skip !== "undefined")
	{
		return "Lich.listRange("+lower+","+upper+","+Lich.compileAST(ast.skip)+")";
	}
	
	else
	{
		return "Lich.listRange("+lower+","+upper+", Lich.VM.Nothing)";
	}
}

Lich.newDictionary = function(pairs)
{
	res = {_lichType:DICTIONARY};

	for(var i = 0; i < pairs.length; ++i)
	{
		res[pair[0]] = pair[1];
	}

	return res;
}

Lich.compileDictionary = function(ast)
{
	var pairs = new Array();
	pairs.push("_lichType:DICTIONARY");

	for(var i = 0; i < ast.pairs.length; i += 2)
	{
		var dictKey = Lich.compileAST(ast.pairs[i]);
		var dictRes = Lich.compileAST(ast.pairs[i+1]);
		pairs.push(dictKey+":"+dictRes);
	}

	return "{" + pairs.join(",") + "}";
}

Lich.compileCase = function(ast)
{
	var caseCode = "(function(_object){";
	var matchCode = "";

	for(var i = 0; i < ast.alts.length; ++i)
	{
		var elem = ast.alts[i];
		var pat = elem.pat;
		var arr = Lich.generateOneArgNameAndMatchVars(pat, i);
		var argName = arr[0];
		var matchVars = arr[1];

		if(pat.astType == "at-match")
			caseCode += "var "+argName+"=_object;";

		caseCode += matchVars;

		var tempMatchCode = Lich.generateMatchFunc("_object", pat, i, false);
		var altExp = Lich.compileAST(elem.exp);

		if(i > 0)
			matchCode += "else ";

		matchCode += "if("+tempMatchCode+"){return "+altExp+"}";
	}

	return caseCode + matchCode + "else throw new Error(\"case statement found no matching patterns.\")})("+Lich.compileAST(ast.exp)+")";
}

Lich.generateListComprehensionCode = function(exp,generators,filters)
{
	var code = "(function(){var _listRes = new Array();";

	for(var i = 0; i < generators.length; ++i)
	{
		var varName = "_list"+i;
		var iName = "i"+i;
		code += "var "+varName+"="+generators[i][1]+";for(var "+iName+"=0;"+iName+"<"+varName+".length;++"+iName+"){"+generators[i][0]+"="
			+varName+"[i"+i+"];"
	}

	var doFilters = filters.length > 0;

	if(doFilters)
		code += "if(";

	for(var i = 0; i < filters.length; ++i)
	{
		if(i > 0)
			code += "&&(";
		else
			code += "(";

		code += filters[i]+")";
	}
	
	if(doFilters)
		code += "){";

	code += "_listRes.push("+exp+");";

	if(doFilters)
		code += "}";

	for(var i = generators.length-1; i >= 0; --i)
	{
		code += "}";
	}

	return code+"; return _listRes})()";
}

Lich.compileListComprehension = function(ast)
{
	var filters = new Array();
	var generators = new Array();

	// First we collect all the filter functions
	for(var i = 0; i < ast.generators.length; ++i)
	{
		if(ast.generators[i].astType != "decl-fun")
		{
			filters.push(Lich.compileAST(ast.generators[i]));
		}	
	}

	// Collect all the lists from the generators
	for(var i = 0; i < ast.generators.length; ++i)
	{
		if(ast.generators[i].astType == "decl-fun")
		{
			generators.push([ast.generators[i].ident, Lich.compileAST(ast.generators[i].rhs)]);
		}
	}

	return Lich.generateListComprehensionCode(Lich.compileAST(ast.exp), generators, filters);
}

function postProcessJSON(object)
{
	if (Object.prototype.toString.call(object) === '[object Array]') 
    {
        var out = [], i = 0, len = object.length;
        for ( ; i < len; i++) 
        {
			object[i] = postProcessJSON(object[i]);
        }

        return object;
    }

	else if(typeof object === 'object') 
    {
    	if(object == null || typeof object === "undefined")
    		return Lich.VM.Nothing;

    	if(object._lichType == CLOSURE)
	    {
	    	return eval(object.value);
	    }

	    else
	    {
	    	for(n in object)
	    	{
	    		object[n] = postProcessJSON(object[n]);
	    	}
	    }

	    return object;
    }

    return object;
}

Lich.parseJSON = function(json)
{
	try{
		return postProcessJSON(JSON.parse(json));
	}

	catch(e)
	{
		Lich.post(e);
	}
	// return JSON.retrocycle(postProcessJSON(JSON.parse(json)));
}

Lich.stringify = function(object)
{
	var string = "";

	try{
		string = JSON.stringify(object, function (key, val) 
		// return JSON.stringify(JSON.decycle(object), function (key, val) 
		{
			if(typeof val === "function")
			{
				/*
				var funcAndArgs = _extractFunctionAndArgs(val);
				var funcString = funcAndArgs[0].toString();
				/*var args = Lich.stringify(funcAndArgs[1]);
				var func = funcString.match(/function ([^\(]+)/);

				if(func == null || typeof func === "undefined")
					func = funcString;
				else
					func = func[1];*/

				return {_lichType:CLOSURE, value: "((function(){return "+val+"})())"};



				//return Lich.stringify({_lichType:CLOSURE, value: "((function(){return "+value+"})())"});
				//Lich.post("Lich.Stringify = " + val);
				//return Lich.stringify({_lichType:CLOSURE, value: "((function(){return "+func+"})())"});
				//return "((function(){return "+func+"})())";
			}

		    return val;

		});
	}

	catch(e)
	{
		Lich.post(e);
	}

	return string;
}
/*
Lich.receive = function(patternFunc, ret)
{
	if(Lich.VM.currentThread === "main")
		throw new Error("Cannot use receive from the main thread. receive can only be called by an Actor.");

	if(messageBox.length == 0)
	{
		//Lich.post("*******if(messageBox.length == 0)");
		queuedReceive = [Lich.receive, this, Array.prototype.slice.call(arguments)];
		return;
	}

	var match = false;
	var messageIndex = 0;
	var altFunc;
	var continueFunc = [Lich.receive, this, Array.prototype.slice.call(arguments)];

	// Two dimensional iteration over each message against each defined pattern.
	// If we find a match break from both loops and call the pattern's matching expression.
	// Otherwise we schedule receive to be called again upon the arrival of a new message.
	forEachWithBreakCps
	(
		messageBox, // For each message in the messageBox
		function(exp, i, nextMessage)
		{
			Lich.collapse(exp, function(expRes)
			{
				patternFunc(expRes, function(_bool, func)
				{
					if(_bool)
					{
						match = true;
						messageIndex = i;
						altFunc = func;
						nextMessage(true); // break
					}

					else
					{
						nextMessage(false); // continue
					}
				})
			});
		},

		function()
		{
			//Lich.post("Receive altFunc = " + altFunc);
			if(match) // Did we find a match?
			{
				//Lich.post("*****MATCH!!!!!!!!!");
				messageBox.splice(messageIndex, 1); // Remove the message from the message box
				queuedReceive = null;
				// We found a match, so compile the pattern's expression, continue with ret(res)
				Lich.collapse(altFunc, ret);
			}

			else // No match
			{
				// createListener for future messages
				//Lich.post("*********NO MATCH");
				queuedReceive = continueFunc;
			}
		}
	);
}

Lich.compileReceive = function(ast, ret)
{
	var caseCode = "Lich.receive.curry(function(_object,_patRet){";
	Lich.compileAST(ast.exp, function(exp)
	{
		//caseCode += exp+",function(_object){";

		matchCode = "";
		forEachCps(
			ast.alts, 
			function(elem,i,next)
			{
				var pat = elem.pat;
				Lich.generateOneArgNameAndMatchVars(pat, i, function(argName, matchVars)
				{
					if(pat.astType == "at-match")
						caseCode += "var "+argName+"=_object;";

					caseCode += matchVars;
					Lich.generateMatchFunc("_object", pat, i, false, function(tempMatchCode)
					{
						Lich.compileAST(ast.alts[i].exp, function(altExp)
						{
							matchCode += "if((function(){" + tempMatchCode + "})()){return _patRet(true,"+ altExp + ")};";
							next();
						});
					})
				});
			},

			function()
			{
				caseCode += matchCode + "_patRet(false)})";
				ret(caseCode);
			}
		);
	});
}*/

Lich.compileTopExp = function(ast)
{
	return "Lich.post(Lich.VM.PrettyPrint("+Lich.compileAST(ast.exp)+"));";
}

Lich.compileImportJS = function(ast)
{
	return "importjs("+ast.imports+")";
}

Lich.compileDoExp = function(ast, ret)
{
	var res = "";
	var first = ast.exps.length - 1;

	for(var i = first; i >= 0; --i)
	{

		if(i == first)
			res = Lich.compileAST(ast.exps[i].exp);
		else
			res = "bind("+Lich.compileAST(ast.exps[i].exp)+",function(" + ast.exps[i].arg + "){return "+res+"})";
	}

	return res; 
}

Lich.compileGuardExp = function(ast, ret)
{
	var arr = Lich.generateArgNamesAndMatchVars(ast.args);
	var argNames = arr[0];
	var matchVars = arr[1];
	var matchCode = Lich.checkFunctionArgMatches(argNames, ast.args);
	var prefix = ast.ident.id+"=function "+ast.ident.id;
					
	if(ast.local)
		prefix = "var " + ast.ident.id + "=function";

	var gaurdCode = prefix +"(" + [].concat(argNames).join(",") + "){"+matchVars+matchCode;

	for(var i = 0; i < ast.guards.length; ++i)
	{
		if(i > 0)
			gaurdCode += "else ";
		gaurdCode += "if("+Lich.compileAST(ast.guards[i].e1)+"){return "+Lich.compileAST(ast.guards[i].e2)+"}";
	}

	return gaurdCode + "else throw new Error(\"Non-exhaustive patterns in guard function.\")}";
}

Lich.compilePercStream = function(ast)
{
	Lich.verifyDef(ast.id);
	var list = Lich.compileAST(ast.list);
	var modifiers = Lich.compileAST(ast.modifiers);
	var res;
	if(eval ("typeof "+ast.id+" !== \"undefined\""))
	{
		res = ast.id+".update("+list+","+modifiers+");";
		res += "Lich.post(\"" + ast.id + " \"+ Lich.VM.PrettyPrint(" + ast.id + "));";
	}
				
	else
	{
		res = ast.id+"=new Soliton.PercStream("+list+","+modifiers+");";
		if(Lich.parseType !== "library")
		{
			res += ast.id + ".play();";
			//res += "Lich.scheduler.addScheduledEvent("+ast.id+");";
			res += "Lich.post(\"" + ast.id + " \"+ Lich.VM.PrettyPrint(" + ast.id + "));";
		}
	}

	return res;
}

Lich.compilePercList = function(ast)
{
	var res = [];

	for(var i = 0; i < ast.list.length; ++i)
	{
		var listItem = ast.list[i];
		if(listItem.astType != "varname")
			res.push(Lich.compileAST(listItem));
		else
			res.push("\""+listItem.id+"\"");
	}

	return "["+res.join(",")+"]";
}

Lich.compilePercMods = function(ast)
{
	var res = [];

	for(var i = 0; i < ast.list.length; ++i)
	{
		res.push(Lich.compileAST(ast.list[i]));
	}

	return "["+res.join(",")+"]"; 	
}

Lich.compileSoloStream = function(ast)
{
	Lich.verifyDef(ast.id);

	var list = Lich.compileAST(ast.list)
	var mods = Lich.compileAST(ast.mods);
	var rmods = Lich.compileAST(ast.rmods);
	var res;
	if(eval ("typeof "+ast.id+" !== \"undefined\""))
	{
		res = ast.id+".update("+ast.synth+","+list+","+mods+","+rmods+");";
		res += "Lich.post(\"" + ast.id + " \"+ Lich.VM.PrettyPrint(" + ast.id + "));";
	}
				
	else
	{
		res = ast.id+"=new Soliton.SoloStream("+ast.synth+","+list+","+mods+","+rmods+");";
		if(Lich.parseType !== "library")
		{
			res += ast.id + ".play();";
			//res += "Lich.scheduler.addScheduledEvent("+ast.id+");";
			res += "Lich.post(\"" + ast.id + " \"+ Lich.VM.PrettyPrint(" + ast.id + "));";
		}
	}

	return res;
}

Lich.compileSoloList = function(ast)
{
	var res = [];

	for(var i = 0; i < ast.list.length; ++i)
	{
		res.push(Lich.compileAST(ast.list[i]));
	}

	return "["+res.join(",")+"]"; 
}

Lich.compileSoloMods = function(ast)
{
	var res = [];

	for(var i = 0; i < ast.list.length; ++i)
	{
		res.push(Lich.compileAST(ast.list[i]));
	}	

	return "["+res.join(",")+"]";
}

Lich.compileSynthDef = function(ast)
{
	ast.astType = "decl-fun";
	ast.noCollapse = true;
	var res = Lich.compileAST(ast)+";Soliton.synthDefs[\""+ast.ident.id+"\"]="+ast.ident.id;

	if(Lich.parseType !== "library")
		res += ";Lich.VM.Print("+ast.ident.id+");";

	return res;
}
