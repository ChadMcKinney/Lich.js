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

Function.prototype.collapse = function(_collapseRet)
{
	if(typeof this.curriedFunc === "undefined")
	{
		if(this.length <= arguments.length)
		{
			return this.apply(this, arguments);
		}
			
		else
		{
			return _collapseRet(this);
		}
	}

	else
	{
		if(this.curriedFunc.length <= (this.curriedArgs.length + arguments.length))
		{
			this.apply(this, arguments);
		}

		else
		{
			_collapseRet(this);
		}
	}
}

Lich.collapse = function(object, _ret)
{
	if(object == null || typeof object === "undefined")
		_ret(Lich.VM.Nothing);

	else if(typeof object === "function")
		object.collapse(_ret);
	else
		_ret(object);
}

// Error if curry is called on non-function objects
/*Object.prototype.curry = function()
{
	throw new Error("Expression "+this+" cannot be used as a function for function application.");
}*/

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

Lich.apply = function(exp, context, _arguments)
{
	if(typeof exp === "function")
		exp.apply(context, _arguments);
	else
		_arguments[0].apply(context, [exp]);
}

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

// The Lich.js compiler traverse the abstract syntax tree returned by the parser and calls native JavaScript
Lich.compileAST = function(ast, ret)
{
	if(ast instanceof Array)
	{
		var res = new Array();
		for(var i = 0; i < ast.length; ++i)
		{	
			Lich.compileAST(ast[i], function(tempRes)
			{
				res.push(tempRes);
			});

			//if(i < ast.length - 1)
			//	Lich.VM.Print(res);
		}

		//return res;
		ret(res);
	}

	else if(ast instanceof Object)
	{
		/*
		if (typeof ast === "function")
		{
			Lich.post("AST FUNCTION?!: " + ast);
			return; // Do nothing, this is a tail end function given by the parser we don't need.
		}*/

		//Lich.post("AST name: " + ast.astType);
		//Lich.post(ast);

		switch(ast.astType)
		{
			case "primitive":
				return ast(ret);

			case "percStream":
				return Lich.compilePercStream(ast, ret);

			case "percList":
				return Lich.compilePercList(ast, ret);

			case "percMods":
				return Lich.compilePercMods(ast, ret);

			case "soloStream":
				return Lich.compileSoloStream(ast, ret);

			case "soloList":
				return Lich.compileSoloList(ast, ret);

			case "soloMods":
				return Lich.compileSoloMods(ast, ret);

			case "decl-fun":
				return Lich.compileDeclFun(ast,ret);

			case "local-decl-fun":
				return Lich.compileLocalDeclFun(ast,ret);
				
			case "fun-where":
				return Lich.compileFunWhere(ast,ret);
				
			case "ite":
				return Lich.compileIte(ast,ret);
				
			case "application":
				return Lich.compileApplication(ast,ret);
				
			case "function-application-op":
				return Lich.compileFunctionApplicationOp(ast,ret);

			case "receive":
				return Lich.compileReceive(ast,ret);
				
			case "function-composition":
				return Lich.compileFunctionComposition(ast,ret);

			case "function-stream":
				return Lich.compileFunctionStream(ast,ret);

			case "lambda":
				return Lich.compileLambda(ast,ret);
				
			case "let":
				return Lich.compileLet(ast,ret);
				
			case "let-one": // ghci style let expression for global definitions
				return Lich.compileLetOne(ast,ret);
				
			case "listexp":
				return Lich.compileListExp(ast,ret);
				
			case "qop":
				return Lich.compileQop(ast,ret);
				
			case "conpat":
				return Lich.compileConPat(ast,ret);
				
			case "wildcard":
				ret({ _lichType: WILDCARD });
				break;
				
			case "integer-lit":
			case "char-lit":
			case "number":
			case "float-lit":
			case "boolean-lit":
			case "string-lit":
				ret(ast.value);
				break;
				
			case "varname":
				return Lich.compileVarName(ast,ret);
				
			case "dacon":
				return Lich.compileDacon(ast,ret);
				
			case "binop-exp":
				return Lich.compileBinOpExp(ast,ret);

			case "curried-binop-exp":
				return Lich.compileCurriedBinOpExp(ast,ret);

			case "left-curried-binop-exp":
				return Lich.compileLeftCurriedBinOpExp(ast,ret);

			case "right-curried-binop-exp":
				return Lich.compileRightCurriedBinOpExp(ast,ret);
				
			case "negate":
				return Lich.compileNegate(ast,ret);
				
			case "listrange":
				return Lich.compileListRange(ast,ret);
				
			case "dictionary":
				return Lich.compileDictionary(ast,ret);
				
			case "case":
				return Lich.compileCase(ast,ret);
				
			case "Nothing":
				ret("Lich.VM.Nothing");
				break;
				
			case "list-comprehension":
				return Lich.compileListComprehension(ast,ret);
				
			case "module":
				return Lich.compileModule(ast,ret);
				
			case "body":
				return Lich.compileBody(ast,ret);
				
			case "data-decl":
				return Lich.compileDataDecl(ast,ret);
				
			case "data-inst":
				return Lich.compileDataInst(ast,ret);
				
			case "data-lookup":
				return Lich.compileDataLookup(ast,ret);
				
			case "data-update":
				return Lich.compileDataUpdate(ast,ret);
				
			case "data-enum":
				return Lich.compileDataEnum(ast,ret);
				
			case "data-match":
				return Lich.compileDataMatch(ast,ret);
				
			case "topdecl-decl":
				return Lich.compileTopdeclDecl(ast,ret);

			case "class-exp":
				return Lich.compileClassExpr(ast,ret);

			case "class-decl":
				return Lich.compileClassDecl(ast,ret);
					
			case "class-binop":
				return Lich.compileClassBinOp(ast,ret);

			case "top-exp":
				return Lich.compileTopExp(ast, ret);

			case "do-exp":
				return Lich.compileDoExp(ast, ret);

			case "guard-fun":
				return Lich.compileGuardExp(ast, ret);

			case "synthdef":
				return Lich.compileSynthDef(ast,ret);

			case "impjs":
				return Lich.compileImportJS(ast,ret);

			default:
				return Lich.unsupportedSemantics(ast,ret);
		}
	}

	else if(typeof ast === "undefined")
	{
		ret(Lich.VM.Nothing);
	}

	else
	{
		throw new Error("Unknown AST Type: " + (typeof ast));
	}
}

Lich.unsupportedSemantics = function(ast,ret)
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

Lich.generateMatchFunc = function(object, pat, i, throwCode, ret)
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
			ret(matchCode);
		else
			ret(matchCode+"return true");
		break;

	case "Nothing":
		if(throwCode)
		{
			ret(matchCode + "if(Lich.getType("+object+") != NOTHING){throw new Error(\"Function argument does not match Nothing pattern for "
				+"argument number \"+"+i+")};");
		}

		else
		{
			ret(matchCode + "if(Lich.getType("+object+") == NOTHING){return true}else{return false};");
		}
		break;

	case "data-match":
		matchCode = matchCode + "if(Lich.dataMatch("+object+", \""+pat.id+"\")){";

		for(var j = 0; j < pat.members.length; ++j)
		{
			matchCode = matchCode + pat.members[j] + " = " + object + "[" + object + "._argNames[" + j + "]];";
		}

		if(throwCode)
			matchCode = matchCode + "}else{throw new Error(\"Function argument does not match "+pat.id+" pattern for argument number \"+"+i+")};";
		else
			matchCode = matchCode + ";return true}else{return false};";
		ret(matchCode);
		break;

	case "literal-match":
		var value = pat.value.value;
		if(typeof value === "string")
			value = value.replace(/\"/g,"");

		if(throwCode)
		{
			ret(matchCode+"if("+object+" !== "+pat.value.value+"){Lich.VM.Print("+object+");throw new Error(\"Function argument does not match "
				+value+" pattern for argument number \"+"+i+")};");
		}

		else
		{
			ret(matchCode+"if("+object+" === "+pat.value.value+"){return true}else{return false};");
		}
		break;

	case "head-tail-match":
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
		
		ret(matchCode);
		break;

	case "list-match":
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
					Lich.generateMatchFunc(object+"["+j+"]", pat.list[j], i, throwCode, function(tempCode)
					{
						if(throwCode)
							matchCode = matchCode + tempCode;
						else
							matchCode = matchCode + "var _bool=(function(){" + tempCode + "})();if(!(_bool)){return false};";
						
					});
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
		
		ret(matchCode);
		break;

	case "lambda-pat":
		if(throwCode)
		{
			matchCode = matchCode + "if((typeof "+ object + " !== \"function\")||(Lich.numLambdaArgs("+object+") != " + (pat.numArgs+1)+")){"
				+"throw new Error(\"Function argument does not match "+Lich.lambdaPatternPrint(pat.numArgs)+" pattern for argument number \"+"+i+")};";	
		}

		else
		{
			matchCode = matchCode + "if((typeof "+ object + " !== \"function\")||(Lich.numLambdaArgs("+object+") != " + (pat.numArgs+1)+")){"
				+"return false}else{return true};";	
		}
		
		
		ret(matchCode);
		break;

	default:
		ret(matchCode);
		break;
	}
}

// Generates a list of argument names and optional variable names from a pattern. 
// Used to create local scope variables before generating the actual matching code.
// Every match must generate an argument name for the pattern, and can optionally create extra variables as needed.
// The i argument is used to prevent namespace clashes in name generation. All non-user generated names must start with an underscore
Lich.generateOneArgNameAndMatchVars = function(pat, i, ret)
{
	var argName = "_";
	var matchVars = "";
	if(pat.astType == "at-match")
	{
		argName = pat.id;
		Lich.generateOneArgNameAndMatchVars(pat.pat, i, function(tempName, tempVars)
		{
			matchVars = matchVars + tempVars;
			ret(argName, matchVars);
		});
	}

	else
	{
		switch(pat.astType)
		{
		case "varname":
		case "wildcard":
			argName = pat.id;
			ret(argName, matchVars);
			break;

		case "Nothing":
			argName = "_nothing"+i;
			ret(argName, matchVars);
			break;

		case "data-match":
			argName = "_"+pat.id+i;
			for(var i = 0; i < pat.members.length; ++i)
			{	
				matchVars = matchVars + "var "+pat.members[i]+";";
			}
			ret(argName, matchVars);
			break;

		case "literal-match":
			argName = "_"+pat.astType.replace(/-/g,"_")+i;
			ret(argName, matchVars);
			break;

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
			ret(argName, matchVars);
			break;

		case "list-match":
			argName = "_list"+i;
			forEachCps(
				pat.list,
				function(elem, j, next)
				{
					if(elem.astType !== "wildcard")
					{
						if(elem.astType == "varname")
						{
							matchVars = matchVars + "var "+elem.id+";";
							next();
						}

						else
						{
							Lich.generateOneArgNameAndMatchVars(elem, i, function(argName, itemMatchVars)
							{
								matchVars = matchVars + itemMatchVars;
								next();
							});
						}
					}

					else
					{
						next();
					}
				},
				function()
				{
					ret(argName,matchVars);
				}
			);
			break;

		case "lambda-pat":
			argName = "_lambda"+i;
			ret(argName,matchVars);
			break;

		default:
			ret(argName,matchVars);
			break;
		}
	}
}

Lich.generateArgNamesAndMatchVars = function(args, ret)
{
	var argNames = new Array();
	var matchVars = "";
	forEachCps(
		args,
		function(arg, i, next)
		{
			Lich.generateOneArgNameAndMatchVars(arg, i, function(tempArgName, tempMatchVars)
			{
				argNames.push(tempArgName);
				matchVars = matchVars + tempMatchVars;
				next();
			});
		},
		function()
		{
			ret(argNames, matchVars);
		}
	);
}

Lich.checkFunctionArgMatches = function(argNames, pats, ret)
{
	var matchCode = "";
	for(var i = 0; i < argNames.length; ++i)
	{
		Lich.generateMatchFunc(argNames[i], pats[i], i, true, function(tempCode)
		{
			matchCode = matchCode + tempCode;
		});
	}

	ret(matchCode);
}

Lich.compileModule = function(ast,ret)
{
	Lich.post("Compiling module: " + ast.modid);
	
	Lich.compileAST(ast.body, function(res)
	{
		ret(res);
		Lich.post("Done compiling module: " + ast.modid);
	});
}

Lich.compileBody = function(ast,ret)
{
	var body = "";

	forEachCps(
		ast.topdecls, 
		function(elem,index,next)
		{
			Lich.compileAST(elem, function(res)
			{
				body = body + ";" + res;
				next();
			});
		},
		function(){ret(body);}
	);
}

Lich.compileTopdeclDecl = function(ast,ret)
{
	Lich.compileAST(ast.decl, ret);
}

Lich.compileTopdeclData = function(ast,ret)
{
	Lich.unsupportedSemantics(ast, ret);
}

Lich.generatePatternMatching = function(patterns, ret)
{
	var matchCode = "";
	forEachCps(
		patterns,
		function(pat, i, next)
		{
			matchCode = matchCode+Lich.generateMatchVars(pat);
		},
		function()
		{
			ret(matchCode);
		}
	);
}

// Collapses all the arguments passed to a function, using CPS, so that the body can use them unboxed.
Lich.generateCollapseArguments = function(argNames)
{
	var collapseCode = "(function(_argRet){";

	for(var i = 0; i < argNames.length; ++i)
	{
		var arg = argNames[i];
		collapseCode = collapseCode + "Lich.collapse(" + arg + ",function("+arg+"Res){"+arg+"="+arg+"Res;";
	}

	for(var j = 0; j < argNames.length; ++j)
	{
		if(j < argNames.length - 1)
			collapseCode = collapseCode + "})";
		else
			collapseCode = collapseCode + ";_argRet()})";
	}

	collapseCode = collapseCode + "})"; // Final }) for original function
	return collapseCode;
}

Lich.collapseArguments = function(_arguments, _ret)
{
	mapCps(
		_arguments,
		function(elem, i, callback)
		{
			Lich.collapse(elem, function(collapsedElem)
			{
				callback(collapsedElem);
			})
		},
		function(collapsedArgs)
		{
			_ret(collapsedArgs);
		}
	)
}

Lich.compileLocalDeclFun = function(ast,ret)
{
	if(ast.args.length == 0)
	{
		Lich.compileAST(ast.rhs, function(rhs)
		{
			ret("var "+ast.ident.id + "=" + rhs + ";");
		});
	}

	else
	{
		Lich.compileAST(ast.rhs, function(rhs)
		{
			Lich.generateArgNamesAndMatchVars(ast.args, function(argNames, matchVars)
			{
				Lich.checkFunctionArgMatches(argNames, ast.args, function(matchCode)
				{
					var collapseCode = Lich.generateCollapseArguments(argNames);
					ret("var " + ast.ident.id + "=function (" + [].concat(argNames).concat("_ret").join(",") + "){"+collapseCode+"(function(){"+matchVars
						+matchCode+";Lich.collapse("+rhs+",_ret)})};");
					//ret("var "+ast.ident.id + "=function (" + [].concat(argNames).concat("_ret").join(",") + "){"+collapseCode+"(function(){"+matchVars
					//	+matchCode+";Lich.collapse("+rhs+",_ret)})};");
				});
			});
		});
	}
}

Lich.printAll = function(arr)
{
	for(var i = 0; i < arr.length; ++i)
	{
		Lich.post("printAll: " + Lich.VM.PrettyPrint(arr[i]));
	}
}

Lich.compileDeclFun = function(ast,ret)
{
	if(ast.args.length == 0)
	{
		Lich.compileAST(ast.rhs, function(rhs)
		{
			//ret(ast.ident.id + "=" + rhs + ";");
			ret(ast.ident.id + "="+rhs+";Lich.collapse("+ast.ident.id+",function(_res){"+ast.ident.id+"=_res;});");
		});
	}

	else
	{
		Lich.compileAST(ast.rhs, function(rhs)
		{
			Lich.generateArgNamesAndMatchVars(ast.args, function(argNames, matchVars)
			{
				Lich.checkFunctionArgMatches(argNames, ast.args, function(matchCode)
				{
					var collapseCode = Lich.generateCollapseArguments(argNames);
					ret(ast.ident.id+"=function "+ast.ident.id+"(" + [].concat(argNames).concat("_ret").join(",") + "){"+collapseCode+"(function(){"+matchVars
						+matchCode+";Lich.collapse("+rhs+",_ret)})};");
				});
			});
		});
	}
}

Lich.compileFunWhere = function(ast,ret)
{
	var func = "((function(){";

	mapCps(
		ast.decls,
		function(elem,i,callback)
		{
			if(elem.astType == "decl-fun")
				elem.astType = "local-decl-fun";
			else if(elem.astType == "guard-fun")
				elem.local = true;

			Lich.compileAST(elem,function(decl)
			{
				callback(decl);
			});
		},
		function(decls)
		{
			Lich.compileAST(ast.exp, function(exp)
			{
				ret(func + decls.join("")+"return "+exp+"})())"/* + "Lich.apply(" + exp +", this, arguments)}"*/);
			});
		}
	);
}

Lich.compileConstr = function(ast,ret)
{
	Lich.unsupportedSemantics(ast,ret);
}

Lich.compileIte = function(ast,ret)
{
	Lich.compileAST(ast.e1, function(expRes1)
	{
		Lich.compileAST(ast.e2, function(expRes2)
		{
			Lich.compileAST(ast.e3, function(expRes3)
			{
				var func = "(function(_ret){Lich.collapse(("+expRes1+"),(function(cond){if(cond){";
				func = func + "Lich.collapse(("+expRes2+"),_ret)}else{Lich.collapse(("+ expRes3 +"),_ret)}}))})";
				ret(func);
			});
		});
	});
}

Lich.application = function(func, args, _ret)
{
	//Lich.post("Applicaion func = " + func);
	//Lich.post("Lich.application args = " + Lich.VM.PrettyPrint(args));

	if(typeof func !=="function")
		throw new Error("Expression " + Lich.VM.PrettyPrint(func) + " cannot be used as a function for function application.");

	var collapsedArgs = new Array();
	forEachCps(
		args,
		function(arg, _, next)
		{
			Lich.collapse(arg, function(collapsedArg)
			{
				collapsedArgs.push(collapsedArg);
				next();
			});
		},
		function()
		{
			//Lich.post("Application collapsed args = " + Lich.VM.PrettyPrint(collapsedArgs));
			//ich.collapse(func.curry.apply(func, collapsedArgs), _ret);
			Lich.collapse(func, function(collapsedFunc)
			{
				Lich.collapse(collapsedFunc.curry.apply(collapsedFunc, collapsedArgs), _ret)
			});
		}
	);
}

Lich.compileApplication = function(ast,ret)
{
	mapCps(
		ast.exps,
		function(elem, i, callback)
		{
			Lich.compileAST(elem, function(exp)
			{
				callback(exp);
			});
		},
		function(exps)
		{
			var func = "Lich.application.curry("+exps[0]+",["+exps.slice(1, exps.length).join(",")+"])";
			// var func = exps[0]+".curry("+exps.slice(1, exps.length).join(",")+")";
			ret(func);	
		}
	);
}

Lich.compileFunctionApplicationOp = function(ast,ret)
{
	Lich.compileAST(ast.lhs, function(exp1)
	{
		Lich.compileAST(ast.rhs, function(exp2)
		{
			//ret(exp1 + ".curry("+ exp2 + ")");
			ret("Lich.application.curry("+exp1+",["+exp2+"])");
		});
	});	
}

Lich.functionCompositionWrapper = function(funcs)
{
	return function(a,_fcompRet)
	{
		Lich.collapse(a,function(arg)
		{
			var compRes = arg;
			forEachReverseCps(
				funcs,
				function(func, i, next)
				{
					Lich.collapse(func,function(funcRes)
					{
						//compRes = function(_ret) { _ret(newRes) };
						funcRes(compRes, function(res)
						{
							compRes = res;
							next();
						});
					});

				},
				function()
				{
					Lich.collapse(compRes, _fcompRet);
				}
			);
		});
	};
}

Lich.compileFunctionComposition = function(ast,ret)
{
	mapCps(
		ast.exps,
		function(elem,i,callback)
		{
			Lich.compileAST(elem, function(func)
			{
				callback(func);
			})
		},
		function(funcs)
		{
			ret("Lich.functionCompositionWrapper(["+funcs.join(",")+"])");
		}
	);
}

Lich.functionStreamWrapper = function(funcs)
{
	return function(_fcompRet)
	{
		Lich.collapse(funcs[0], function(compRes)
		{
			forEachCps(
				funcs.slice(1, funcs.length),
				function(func, i, next)
				{
					Lich.collapse(func,function(funcRes)
					{
						//compRes = function(_ret) { _ret(newRes) };
						funcRes(compRes, function(res)
						{
							compRes = res;
							next();
						});
					});

				},
				function()
				{
					Lich.collapse(compRes, _fcompRet);
				}
			);
		});	
	};
}

Lich.compileFunctionStream = function(ast,ret)
{
	mapCps(
		ast.exps,
		function(elem,i,callback)
		{
			Lich.compileAST(elem, function(func)
			{
				callback(func);
			})
		},
		function(funcs)
		{
			ret("Lich.functionStreamWrapper(["+funcs.join(",")+"])");
		}
	);
}

Lich.compileLambda = function(ast,ret)
{
	Lich.compileAST(ast.rhs, function(rhs)
	{
		Lich.generateArgNamesAndMatchVars(ast.args, function(argNames, matchVars)
		{
			Lich.checkFunctionArgMatches(argNames, ast.args, function(matchCode)
			{
				var collapseCode = Lich.generateCollapseArguments(argNames);
				ret("(function (" + [].concat(argNames).concat("_ret").join(",") + "){"+collapseCode+"(function(){"+matchVars
					+matchCode+";Lich.collapse("+rhs+",_ret)})})");
			});
		});
	});
}

Lich.compileLet = function(ast,ret)
{
	var func = "((function(){";

	mapCps(
		ast.decls,
		function(elem,i,callback)
		{
			elem.astType = "local-decl-fun";
			Lich.compileAST(elem,function(decl)
			{
				callback(decl);
			});
		},
		function(decls)
		{
			Lich.compileAST(ast.exp, function(exp)
			{
				ret(func + decls.join("")+"return "+exp+"})())"/* + "Lich.apply(" + exp +", this, arguments)}"*/);
			});
		}
	);
}

Lich.compileLetOne = function(ast,ret)
{
	Lich.compileAST(ast.decl, function(res)
	{
		//ret(res+";Lich.collapse("+ast.decl.ident.id+",function(res){Lich.post(\"Lich> \"+Lich.VM.PrettyPrint(res))});");
		ret(res+";Lich.post(\"Lich> \"+Lich.VM.PrettyPrint("+ast.decl.ident.id+"))");
	});
}

Lich.listExp = function(elems, _ret)
{
	var collapsedElems = new Array();
	forEachCps(
		elems,
		function(elem, i, next)
		{
			Lich.collapse(elem, function(collapsedElem)
			{
				collapsedElems.push(collapsedElem);
				next();
			});
		},
		function()
		{
			_ret(collapsedElems);
		}
	);
}

Lich.compileListExp = function(ast,ret)
{
	mapCps(
		ast.members,
		function(elem,i,callback)
		{
			Lich.compileAST(elem, function(elemRes)
			{
				callback(elemRes);
			})
		},
		function(res)
		{
			ret("Lich.listExp.curry(["+res.join(",")+"])");
			//ret("["+res.join(",")+"]");
		}
	);
}

Lich.compileQop = function(ast,ret)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileConPat = function(ast,ret)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileWildCard = function(ast,ret)
{
	Lich.unsupportedSemantics(ast);
}

Lich.compileVarName = function(ast,ret)
{
	ret(ast.id);
}

Lich.compileDacon = function(ast,ret)
{
	if(ast == "Nothing")
		ret("function(_ret){_ret(null)}");
	else
		Lich.unsupportedSemantics({astType:ast});
}

Lich.collapseDataConstructor = function(dict, members)
{
	forEachDictCps(
		members,
		function(n, i, next)
		{
			Lich.collapse(members[n], function(memberRes)
			{
				dict[n] = memberRes;
				next();
			});
		},
		function(){}
	);

	return dict; // One of the few times we don't enforce CPS. Data declarations are always global.
}

Lich.compileDataDecl = function(ast,ret)
{
	var argNames = [];
	var initialData = [];
	mapCps(
		ast.members,
		function(elem,i,callback)
		{
			Lich.compileAST(elem.exp, function(elemRes)
			{
				argNames.push("\""+elem.id+"\"");
				callback(elem.id+":"+elemRes);
			});
		},
		function(dataPairs)
		{
			initialData.push("_lichType:DATA");
			initialData.push("_datatype:\""+ast.id+"\"");
			initialData.push("_argNames:["+argNames.join(",")+"]");
			ret(ast.id+"=Lich.collapseDataConstructor({"+initialData.join(",")+"},{"+dataPairs.join(",")+"})");
		}
	);
}

Lich.newData = function(constructor,members, _dataRet)
{
	if(constructor == null) throw new Error("Unable to find data constructor for " + constructor);
	var data = _deepCopy(constructor);
	forEachCps(
		members, 
		function(elem,i,next)
		{
			Lich.collapse(elem, function(elemRes)
			{
				data[constructor._argNames[i]] = elemRes;
				next();
			});
		},
		function()
		{
			_dataRet(data);
		}
	);
}

Lich.compileDataInst = function(ast,ret)
{
	mapCps(
		ast.members, 
		function(elem,i,callback)
		{
			Lich.compileAST(elem, function(res)
			{
				callback(res);
			})			
		},
		function(members)
		{
			ret("(function(_ret){Lich.newData("+ast.id+",["+members.join(",")+"],_ret)})");
			//ret(ast.id+".curry("+members.join(",")+")");
		}
	);
}

Lich.compileDataLookup = function(ast,ret)
{
	Lich.compileAST(ast.data, function(res)
	{
		ret("(function(_lookRet){Lich.collapse("+res+",function(_lookRes){_lookRet(_lookRes[\""+ast.member+"\"])})})");
	});
}

Lich.dataUpdate = function(data,members, _dataRet)
{
	var newData = _deepCopy(data);
	forEachCps(
		members, 
		function(elem,i,next)
		{
			Lich.collapse(elem.exp, function(elemRes)
			{
				newData[members[i].id] = elemRes;
				next();
			});
		},
		function()
		{
			_dataRet(newData);
		}
	);
}

Lich.compileDataUpdate = function(ast,ret)
{
	Lich.compileAST(ast.data, function(dataCon)
	{
		mapCps(
			ast.members, 
			function(elem,i,callback)
			{
				Lich.compileAST(elem.exp, function(elemRes)
				{
					var newMember = "{id:\""+ast.members[i].id+"\", exp:"+elemRes+"}";
					callback(newMember);
				});
			},
			function(members)
			{
				ret("(function(_ret){Lich.dataUpdate("+dataCon+",["+members.join(",")+"],_ret)})");
			}
		);
	});
}

Lich.compileDataEnum = function(ast,ret)
{
	mapCps(
		ast.members,
		function(elem,i,callback)
		{
			callback(elem);
		},
		function(argNames)
		{
			dataPairs = new Array();
			var res = "";

			for(var i = 0; i < argNames.length; ++i)
			{
				res = res + argNames[i] + "={_lichType:DATA,_argNames:[],_datatype:\""+argNames[i]+"\"};"
				dataPairs.push(argNames[i] + ":" + argNames[i]);
			}

			dataPairs.push("_lichType:DATA");
			dataPairs.push("_argNames:["+argNames.join(",")+"]");
			dataPairs.push("_datatype:\""+ast.id+"\"");
			ret(res+ast.id+"={"+dataPairs.join(",")+"};");
		}
	);
}

Lich.compileBinOpExp = function(ast,ret)
{
	Lich.compileAST(ast.lhs, function(lhs)
	{
		Lich.compileAST(ast.rhs, function(rhs)
		{
			if(Lich.VM.reserved.hasOwnProperty(ast.op))
				ret("Lich.application.curry(Lich.VM.reserved[\""+ast.op+"\"],["+lhs+","+rhs+"])");
				//ret("Lich.VM.reserved[\""+ast.op+"\"].curry("+lhs+","+rhs+")");
			else if((ast.lhs.astType == "float-lit" || ast.lhs.astType == "string-lit") && (ast.rhs.astType == "float-lit" || ast.rhs.astType == "string-lit"))
				ret("(function(_opRet){_opRet("+lhs+""+ast.op+""+rhs+")})");
			else
				ret("function(_opRet){Lich.collapse("+lhs+",(function(resL){Lich.collapse("+rhs+",(function(resR){_opRet(resL"+ast.op+"resR)}))}))}");
		});
	});
}


Lich.compileCurriedBinOpExp = function(ast,ret)
{
	if(Lich.VM.reserved.hasOwnProperty(ast.op))
		ret("Lich.VM.reserved[\""+ast.op+"\"]");
	else
		throw new Error("Unrecongized binary operator: " + ast.op);
}

Lich.compileLeftCurriedBinOpExp = function(ast,ret)
{
	Lich.compileAST(ast.lhs, function(lhs)
	{
		if(Lich.VM.reserved.hasOwnProperty(ast.op))
			ret("Lich.VM.reserved[\""+ast.op+"\"].curry("+lhs+")");
		else
			throw new Error("Unrecongized binary operator: " + ast.op);
	});
}

Lich.compileRightCurriedBinOpExp = function(ast,ret)
{
	Lich.compileAST(ast.rhs, function(rhs)
	{
		if(Lich.VM.reserved.hasOwnProperty(ast.op))
			ret("(function(lhs,_ret){Lich.application(Lich.VM.reserved[\""+ast.op+"\"],[lhs,"+rhs+"],_ret)})");
		else
			throw new Error("Unrecongized binary operator: " + ast.op);
	});
}

Lich.compileNegate = function(ast,ret)
{ 
	Lich.compileAST(ast.rhs, function(rhs)
	{
		ret("function(_ret){_ret(-"+rhs+")}");
	});
}

Lich.listRange = function(l,u,n,_rangeRet)
{
	Lich.collapse(l, function(lower)
	{
		Lich.collapse(u, function(upper)
		{
			Lich.collapse(n, function(next)
			{
	var next;
	var skip = 0;

	if(Lich.getType(n) == NOTHING)
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
		if(typeof ast.skip === "undefined")
		{
			throw new Error("List range syntax can only be used with numbers. failed with: " 
				+ Lich.VM.PrettyPrint(lower) + ".." + Lich.VM.PrettyPrint(upper));
		}

		else
		{
			throw new Error("List range syntax can only be used with numbers. failed with: " 
				+ Lich.VM.PrettyPrint(lower) + "," + Lich.VM.PrettyPrint(next) + ".." + Lich.VM.PrettyPrint(upper));
		}
	}

	var array = new Array();

	if(skip <= 0)
	{
		for(var i = lower; i >= upper; i += skip)
		{
			array.push(i);
		}

		_rangeRet(array);
	}

	else
	{
		for(var i = lower; i <= upper; i += skip)
		{
			array.push(i);
		}

		_rangeRet(array);
	}
			}); // next
		}); // upper
	}); // lower
}

Lich.compileListRange = function(ast,ret)
{
	Lich.compileAST(ast.lower, function(lower)
	{
		Lich.compileAST(ast.upper, function(upper)
		{
			if(typeof ast.skip !== "undefined")
			{
				Lich.compileAST(ast.skip, function(skipRes)
				{
					ret("Lich.listRange.curry("+lower+","+upper+","+skipRes+")");
				});
			}
			else
			{
				ret("Lich.listRange.curry("+lower+","+upper+", Lich.VM.Nothing)");
			}
		});
	});
}

Lich.newDictionary = function(pairs, _ret)
{
	res = {_lichType:DICTIONARY};
	forEachCps(
		pairs,
		function(pair, i, next)
		{
			Lich.collapse(pair[0], function(key)
			{
				Lich.collapse(pair[1], function(value)
				{
					res[key] = value;
					next();
				});
			});
		},
		function()
		{
			_ret(res);
		}
	);
}

Lich.compileDictionary = function(ast,ret)
{
	var pairs = new Array();

	forEachPairsCps(
		ast.pairs, 

		function(elem,i,next)
		{
			Lich.compileAST(elem,function(dictKey)
			{
				Lich.compileAST(ast.pairs[i + 1], function(dictRes)
				{
					pairs.push("["+dictKey+","+dictRes+"]");
					next();
				});
			});
		},

		function()
		{
			ret("Lich.newDictionary.curry(["+pairs.join(",")+"])");
		}
	);
}

Lich.compileCase = function(ast,ret)
{
	var caseCode = "function(_ret){Lich.collapse(";
	Lich.compileAST(ast.exp, function(exp)
	{
		caseCode += exp+",function(_object){ var _bool=false;";
		var matchCode = "";
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
						Lich.compileAST(elem.exp, function(altExp)
						{
							matchCode += "_bool = (function(){" + tempMatchCode + "})();if(_bool){return Lich.collapse("+ altExp + ", _ret)};";
							next();
						});
					})
				});
			},

			function()
			{
				caseCode += matchCode + "throw new Error(\"case statement found no matching patterns.\")})}";
				ret(caseCode);
			}
		);
	});
}

Lich.generateListComprehensionCode = function(exp,generators,filters,_listRet)
{
	var code = "(function(_listRet){var _listRes = new Array();";

	for(var i = 0; i < generators.length; ++i)
	{
		code += "Lich.collapse("+generators[i][1]+",function(_list"+i+"){forEachCpsTco(_list"+i+",function("+generators[i][0]+",_,_next"+i+"){";
	}

	for(var i = 0; i < filters.length; ++i)
	{
		code += "Lich.collapse("+filters[i]+",function(_bool"+i+"){";
	}

	code += "if(true";

	for(var i = 0; i < filters.length; ++i)
	{
		code += "&&_bool"+i;
	}

	code += "){Lich.collapse("+exp+",function(_expRes){_listRes.push(_expRes)})};_next"+(generators.length-1)+"();";

	for(var i = 0; i < filters.length; ++i)
	{
		code += "})";
	}

	for(var i = generators.length-1; i >= 0; --i)
	{
		if(i > 0)
			code += "},function(){_next"+(i-1)+"();})})";
		else
			code += "},function(){_listRet(_listRes)})})})";
	}

	_listRet(code);
}

Lich.compileListComprehension = function(ast,ret)
{
	var filters = new Array();
	var generators = new Array();

	// First we collect all the filter functions
	for(var i = 0; i < ast.generators.length; ++i)
	{
		if(ast.generators[i].astType != "decl-fun")
		{
			Lich.compileAST(ast.generators[i], function(filterRes)
			{
				filters.push(filterRes);
			});
		}	
	}

	// Collect all the lists from the generators
	for(var i = 0; i < ast.generators.length; ++i)
	{
		if(ast.generators[i].astType == "decl-fun")
		{
			Lich.compileAST(ast.generators[i].rhs, function(list)
			{
				generators.push([ast.generators[i].ident,list]);
			});
		}
	}

	Lich.compileAST(ast.exp, function(expRes)
	{
		Lich.generateListComprehensionCode(expRes,generators,filters,ret);
	});
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
}

Lich.compileTopExp = function(ast, ret)
{
	Lich.compileAST(ast.exp, function(exp)
	{
		ret("function _lich(_ret){Lich.collapse("+exp+",_ret)};_lich(function(res) { Lich.post(\"Lich> \"+Lich.VM.PrettyPrint(res)); });");
	});
}

Lich.compileImportJS = function(ast,ret)
{
	ret("importjs("+ast.imports+")");
}

Lich.doExp = function(exps, ret)
{
	var res = exps[0];
	forEachCps(
		exps,
		function(exp, i, next)
		{
			Lich.collapse(exp, function(expRes)
			{
				res = expRes;
				next();
			})
		},
		function()
		{
			ret(res);
		}
	);
}

Lich.compileDoExp = function(ast, ret)
{
	var res = "";
	forEachCps(
		ast.exps,
		function(exp, i, next)
		{
			Lich.compileAST(exp, function(expRes)
			{
				res += expRes + ",";
				next();
			});
		},
		function()
		{
			ret("Lich.doExp.curry(["+res+"])");
		}
	);
}

Lich.guard = function(guards,ret)
{
	var match = false;
	var exp;

	forEachWithBreakCps(
		guards,
		function(guard, i, next)
		{
			Lich.collapse(guard[0], function(guardRes)
			{
				if(guardRes)
				{
					match = true;
					exp = guard[1];
					next(true); // break
				}

				else
				{
					next(false); // continue
				}
			})
		},
		function()
		{
			if(match)
			{
				Lich.collapse(exp, function(expRes)
				{
					ret(expRes);
				});
			}

			else
			{
				throw new Error("Non-exhaustive patterns in guard function.");
			}
		}
	);
}

Lich.compileGuardExp = function(ast, ret)
{
	Lich.generateArgNamesAndMatchVars(ast.args, function(argNames, matchVars)
	{
		Lich.checkFunctionArgMatches(argNames, ast.args, function(matchCode)
		{
			var guards = new Array();
			forEachCps(
				ast.guards,
				function(guard, i, next)
				{
					Lich.compileAST(guard.e1, function(exp1)
					{
						Lich.compileAST(guard.e2, function(exp2)
						{
							guards.push("["+exp1+","+exp2+"]");
							next();
						});
					});
				},
				function()
				{
					var guardCode = "Lich.guard(["+guards.join(",")+"],_ret)";
					var collapseCode = Lich.generateCollapseArguments(argNames);
					var prefix = ast.ident.id+"=function "+ast.ident.id;
					
					if(ast.local)
						prefix = "var " + ast.ident.id + "=function";			

					ret(prefix+"(" + [].concat(argNames).concat("_ret").join(",") + "){"+collapseCode+"(function(){"+matchVars
						+matchCode+";"+guardCode+"})};");
				}
			);
		});
	});
}

Lich.compilePercStream = function(ast, ret)
{
	Lich.compileAST(ast.list, function(list)
	{
		Lich.compileAST(ast.modifiers, function(modifiers)
		{
			if(eval ("typeof "+ast.id+" !== \"undefined\""))
				ret(ast.id+".update("+list+","+modifiers+");");
			else
				ret(ast.id+"=new Soliton.PercStream("+list+","+modifiers+");Lich.scheduler.addScheduledEvent("+ast.id+");");
		});
	});
}

Lich.compilePercList = function(ast, ret)
{
	var res = [];
	forEachCps(
		ast.list,
		function(listItem, i, next)
		{
			Lich.compileAST(listItem, function(listRes)
			{
				if(listItem.astType == "Nothing" || listItem.astType === "percList")
					res.push(listRes);
				else
					res.push("\""+listItem.id+"\"");
				next();
			});
		},
		function()
		{
			ret("["+res.join(",")+"]");
		}
	)
}

Lich.compilePercMods = function(ast, ret)
{
	var res = [];
	forEachCps(
		ast.list,
		function(listItem, i, next)
		{
			Lich.compileAST(listItem, function(listRes)
			{
				res.push(listRes);
				next();
			});
		},
		function()
		{
			ret("["+res.join(",")+"]");
		}
	)	
}

Lich.compileSoloStream = function(ast, ret)
{
	Lich.compileAST(ast.list, function(list)
	{
		Lich.compileAST(ast.modifiers, function(modifiers)
		{
			if(eval ("typeof "+ast.id+" !== \"undefined\""))
				ret(ast.id+".update("+list+","+modifiers+");");
			else
				ret(ast.id+"=new Soliton.SoloStream(\""+ast.synth+"\","+list+","+modifiers+");Lich.scheduler.addScheduledEvent("+ast.id+");");
		});
	});
}

Lich.compileSoloList = function(ast, ret)
{
	var res = [];
	forEachCps(
		ast.list,
		function(listItem, i, next)
		{
			Lich.compileAST(listItem, function(listRes)
			{
				res.push(listRes);
				next();
			});
		},
		function()
		{
			ret("["+res.join(",")+"]");
		}
	)
}

Lich.compileSoloMods = function(ast, ret)
{
	var res = [];
	forEachCps(
		ast.list,
		function(listItem, i, next)
		{
			Lich.compileAST(listItem, function(listRes)
			{
				res.push(listRes);
				next();
			});
		},
		function()
		{
			ret("["+res.join(",")+"]");
		}
	)	
}

Lich.compileSynthDef = function(ast,ret)
{
	var args = []
	var argNames = [];
	var argControls = [];
	var initialData = [];
	var dataPairs = [];
	forEachCps(
		ast.args,
		function(elem,i,next)
		{
			argNames.push("\""+elem.ident.id+"\"");
			args.push(elem.ident.id);
			//argControls.push("dc("+elem.ident.id+",function(res){"+elem.ident.id+"=res})");
			dataPairs.push(elem.ident.id+":"+elem.ident.id);
			next();
		},
		function()
		{
			Lich.compileAST(ast.rhs, function(rhs)
			{
				/*
				initialData.push("_lichType:SYNTH");
				initialData.push("_datatype:\""+ast.id+"\"");
				initialData.push("_argNames:["+argNames.join(",")+"]");
				initialData.push("_audioFunc:_rhsRes");
				var def = ast.id+"=function ("+args.concat("_sRet").join(",")+"){"
				def = def + argControls.join(";")+";var _rhsRes="+rhs+";Lich.collapse(_rhsRes,function(res){_rhsRes=res});";
				def = def + "_sRet({"+initialData.concat(dataPairs).join(",")+"})};";
				ret(def);*/
				//var def = ast.id+"=function ("+args.concat("_sRet").join(",")+"){";
				//def = def + "_sRet("+initialData.concat(dataPairs).join(",")+"})};";
				ret(
					"Soliton.synthDefs[\""+ast.id+"\"]=function ("+args.concat("_sRet").join(",")+"){"+rhs+"(_sRet)};"
					+ast.id+"=Soliton.synthDefs[\""+ast.id+"\"];"
				);
			});
		}
	);
}