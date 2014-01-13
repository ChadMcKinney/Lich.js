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


// Lambda Calculus and CPS Helper functions

// Trampoline return 
// setTimeout(function () { continuation(result) }, 0); // This method is waaaayyyy too slow. 
var returnLambda = "(function(res){_ret(res)})";
/*
var returnLambda = "(function(res){_NUM_CONTINUATIONS_=_NUM_CONTINUATIONS_+1;"
	+"if(_NUM_CONTINUATIONS_>50){_NUM_CONTINUATIONS_=0;"
	+"setTimeout(function(){_ret(res)},0);}else{_ret(res)}})";
//var returnNextTickLambda = "(function(res){setTimeout(function(){_ret(res)},0)})";
var _NUM_CONTINUATIONS_ = 0;*/
//var returnLambda = "(function(res){tco(_ret(res))})";

/*
function _curry(fn, args) 
{
  // no need to var these, they are scoped via argument list - we overwrite them
  // convert the arguments to a real array:
  args = [].slice.apply(arguments);
  // first argument is a function:
  fn = args.shift();
  return function() {
    // get internal args
    var iArgs = [].slice.apply(arguments);
    // apply curried arguments, then our arguments:
    return fn.apply(this, args.concat(iArgs));
  }
}

Function.prototype.curry = function(args...) {
    var fn = this;
    var args = Array.slice(arguments, 0);
    return function() {
        return fn.apply(this, args.concat(Array.slice(arguments, 0)));
    };
}
*/

Function.prototype.collapse = function(_collapseRet)
{
	Lich.post("this.length: " + this.length + "; arguments.length: " + arguments.length);
	if(arguments.length == 1)
	{
		Lich.post("COLLAPSE!");
			this(_collapseRet);
	}
	
	else
	{
		Lich.post("No collapse.");
		_collapseRet(this);
	}
}

Lich.collapse = function(object)
{
	var res = object;
	if(typeof object === "function")
		object.collapse(function(res) { res = object; })
	
	return res;
}
	

function __curry(func) {
	if(typeof func !== "function")
		return func;

    var initial_args = [].slice.apply(arguments, [1]);
    var func_args_length = func.length;

    function __curry(args) {
        if (args.length >= func_args_length) {
            return func.apply(null, args);
        }

        return function () {
            return __curry(args.concat([].slice.apply(arguments)));
        };
    }

    return __curry(initial_args);
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

Lich.apply = function(object, _ret)
{
	if(typeof object === "function")
		object(_ret);
	else
		_ret(object);
}

/*
Function.prototype.curry = function curry() {
    var fn = this, args = Array.prototype.slice.call(arguments);
    return function curryed() {
        return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
    };
};*/


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
        	if(!doBreak)
            	forEachCpsWithBreakRec(index+1, arr, visitor, done);
            else
            	done();
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

/*
function forEachCps(arr, visitor, done)
{
	trampoline(forEachCpsProto(arr, visitor, done));
}*/

// The Lich.js compiler traverse the abstract syntax tree returned by the parser and calls native JavaScript
Lich.compileAST = function(ast, ret)
{
	try
	{
		if(ast instanceof Array)
		{
			var res = null;
			for(var i = 0; i < ast.length; ++i)
			{	
				Lich.compileAST(ast[i], function(tempRes)
				{
					res = tempRes;
				});

				if(i < ast.length - 1)
					Lich.VM.Print(res);
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
					
				case "thunk":
					return Lich.compileDeclThunk(ast,ret);

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
					ret({ lichType: WILDCARD });
					break;
					
				case "integer-lit":
				case "char-lit":
				case "number":
				case "float-lit":
				case "boolean-lit":
				case "string-lit":
					//ret("function(_ret){_ret("+ast.value+")}");
					ret(ast.value);
					break;
					
				case "varname":
					return Lich.compileVarName(ast,ret);
					
				case "dacon":
					return Lich.compileDacon(ast,ret);
					
				case "binop-exp":
					return Lich.compileBinOpExp(ast,ret);
					
				case "negate":
					return Lich.compileNegate(ast,ret);
					
				case "listrange":
					return Lich.compileListRange(ast,ret);
					
				case "dictionary":
					return Lich.compileDictionary(ast,ret);
					
				case "case":
					return Lich.compileCase(ast,ret);
					
				case "Nothing":
					ret(null);
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

	catch(e)
	{
		Lich.VM.clearProcedureStack();
		throw e;
	}
}

Lich.unsupportedSemantics = function(ast,ret)
{
	throw new Error("Unsupported semantics for " +ast+" with type "+ ast.astType);
}

Lich.getType = function(object)
{
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
		if(object._datatype == pat.id)
			return true;
		else
			return false;
	}
}

Lich.match = function(object, pat, ret)
{
	if(pat.astType == "at-match")
	{
		Lich.VM.setVar(pat.id, object);
		pat = pat.pat;
	}

	switch(pat.astType)
	{
	case "varname":
	case "wildcard":
		ret(true);
		break;

	case "Nothing":
		if(object._lichType == NOTHING)
			ret(true);
		else
			ret(false);
		break;

	case "data-match":
		if(Lich.dataMatch(object, pat))
		{
			for(var i = 0; i < pat.members.length; ++i)
			{	
				Lich.VM.setVar(pat.members[i], object[object._argNames[i]]);
			}

			ret(true);
		}

		else
		{
			ret(false);
		}
		break;

	case "literal-match":
		ret(object === pat.value.value); // Prevent false positives with true/false
		break;

	case "head-tail-match":
		if(Lich.getType(object) == LIST)
		{
			if(object.length < 1) // we require at least a head for x:xs matching
			{
				ret(false);
			}	

			else
			{
				if(pat.head.astType != "wildcard")
				{
					var head = object.length >= 1 ? object[0] : Nothing;
					Lich.VM.setVar(pat.head, head);	
				}
				
				if(pat.tail.astType != "wildcard")
				{
					var tail = object.slice(1, object.length);
					Lich.VM.setVar(pat.tail, tail);
				}

				ret(true);
			}
		}

		else
		{
			ret(false);
		}
		break;

	case "list-match":
		if(Lich.getType(object) == LIST)
		{
			if(object.length == pat.list.length)
			{
				var match = true;
				/*
				for(var i = 0; i < object.length; ++i)
				{
					if(pat.list[i].astType !== "wildcard")
					{
						if(pat.list[i].astType == "varname")
						{
							Lich.VM.setVar(pat.list[i], object[i]);
						}

						else
						{
							Lich.match(object[i], pat.list[i], function(matchRes)
							{
								if(!matchRes)
								{
									match = false;
									break;
								}	
							});
						}
					}
				}*/

				forEachWithBreakCps(
					object,
					function(elem, i, next)
					{
						if(pat.list[i].astType !== "wildcard")
						{
							if(pat.list[i].astType == "varname")
							{
								Lich.VM.setVar(pat.list[i], elem);
								next(false); // continue
							}

							else
							{
								Lich.match(object[i], pat.list[i], function(matchRes)
								{
									if(!matchRes)
									{
										match = false;
										next(true); // found a non-match, break
									}

									else
									{
										next(false) // continue
									}	
								});
							}
						}
					},
					function()
					{
						ret(match);
					}
				);
			}

			else
			{
				ret(false);
			}
		}

		else
		{
			ret(false);
		}
		break;

	case "lambda-pat":
		var type = Lich.getType(object);
		if(type == CLOSURE || type == THUNK)
		{
			if(object.argPatterns.length == pat.numArgs)
				ret(true);
			else
				ret(false);
		}
			
		else
		{
			ret(false);
		}
		break;

	default:
		ret(false);
		break;
	}
}

Lich.compileModule = function(ast,ret)
{
	Lich.post("Compiling module: " + ast.modid);
	
	Lich.compileAST(ast.body, function(res)
	{
		Lich.post("Done compiling module: " + ast.modid);
		ret(res);
	});
}

Lich.compileBody = function(ast,ret)
{
	/*
	for(var i = 0; i < ast.topdecls.length; ++i)
	{
		Lich.compileAST(ast.topdecls[i]);
	}*/

	var body = "";

	forEachCps(
		ast.topdecls, 
		function(elem,index,next)
		{
			Lich.compileAST(elem, function(res)
			{
				body = body + res;
				next();
			});
		},
		function(){ret(res);}
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

Lich.compileLocalDeclFun = function(ast,ret)
{
	Lich.compileAST(ast.rhs, function(res)
	{
		ret("var "+ast.ident.id+"="+res+";");
	});
}

Lich.compileDeclFun = function(ast,ret)
{
	/*
	if(ast.args.length == 0)
	{
		Lich.compileAST(ast.rhs, function(res)
		{
			Lich.VM.setVar(ast.ident, res);
			ret(res);
		})
	}

	else
	{
		var closure = new lichClosure(ast.args, ast.rhs);
		Lich.VM.setVar(ast.ident, closure);
		ret(closure);
	}*/

	if(ast.args.length == 0)
	{
		Lich.compileAST(ast.rhs, function(rhs)
		{
			ret(ast.ident.id + "=Lich.collapse(" + rhs+")");
		});
	}

	else
	{
		Lich.compileAST(ast.rhs, function(rhs)
		{
			var args = new Array();
			ret(ast.ident.id + "=function (" + ast.args.map(function(e){return e.id}).concat("_ret").join(",") + "){return ("+rhs+")"+returnLambda + "};");
		});
	}
}

Lich.compileDeclThunk = function(ast,ret)
{
	/*
	if(ast.args.length == 0)
	{
		var thunk = new lichClosure([], ast.rhs);
		Lich.VM.setVar(ast.ident, thunk);
		thunk._lichType = THUNK;
		ret(thunk);
	}

	else
	{
		var closure = new lichClosure(ast.args, ast.rhs);
		Lich.VM.setVar(ast.ident, closure);
		ret(closure);
	}*/

	Lich.compileAST(ast.rhs, function(rhs)
	{
		ret("(function(" + ast.args.map(function(e){return e.id}).concat("_ret").join(",") + "){return " + rhs + returnLambda + "})");
	});
}

Lich.compileFunWhere = function(ast,ret)
{
	/*
	// CHECK WHERE VARS AGAINST FUNC VARS!!!!!!!!!!??????????
	// Currently the parser doesn't allow for this.
	for(var i = 0; i < ast.decls.length; ++i)
	{
		ast.decls[i].astType = "thunk";
	}

	//return new lichClosure([], ast.exp, false, {}, ast.decls).invoke([]);
	var closure = new lichClosure([], ast.exp, false, {}, ast.decls);
	closure.invoke([], function(res){ ret(res); });*/

	//var func = "function "+ast.ident+"(" + ast.args.map(function(e){return e.id}).concat("_ret").join(",") + "){ ";
	var func = "(function(_ret){";

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
				ret(func + decls.join("") + " return (" +exp +")"+ returnLambda + "})");
			});
		}
	);
}

Lich.compileConstr = function(ast,ret)
{
	Lich.unsupportedSemantics(ast,ret);
}

/*
Lich.compileInfixExp = function(ast,ret)
{
	var res = null;

	for(var i = 0; i < ast.exps.length; ++i)
	{
		res = Lich.compileAST(ast.exps[i]);
	}

	return res;
}*/

Lich.compileIte = function(ast,ret)
{
	/*
	var expRes = Lich.compileAST(ast.e1); 
	if(expRes === true) // explicit to avoid false positives
		return Lich.compileAST(ast.e2);
	else
		return Lich.compileAST(ast.e3);
	*/

	/*
	Lich.compileAST(ast.e1, function(expRes)
	{
		var returnFunc = function(res) { ret(res); };

		if(expRes === true) // explicit to avoid false positives
			Lich.compileAST(ast.e2, returnFunc);
		else
			Lich.compileAST(ast.e3, returnFunc);
	});*/

	Lich.compileAST(ast.e1, function(expRes1)
	{
		Lich.compileAST(ast.e2, function(expRes2)
		{
			Lich.compileAST(ast.e3, function(expRes3)
			{
				var func = "(function(_ret){Lich.apply(("+expRes1+"),(function(cond){if(cond){";
				func = func + "Lich.apply(("+expRes2+")," + returnLambda + ")}else{Lich.apply(("+ expRes3 +"),"+ returnLambda + ")}}))})";
				ret(func);
			});
		});
	});
}

	/*
	var closure = Lich.compileAST(ast.exps[0]);

	if(typeof closure === "undefined")
		throw new Error("Cannot invoke an undefined object");

	if(closure._lichType != CLOSURE)
	{
		throw new Error("Unable to use application on " + closure.astType);
	}

	else
	{
		var args = new Array();
		Lich.VM.pushProcedure(new lichClosure([], {}, false, {})); // scope for patterns
		for(var i = 1; i < ast.exps.length; ++i)
		{
			var exp = Lich.compileAST(ast.exps[i]);
			if(Lich.match(exp, closure.argPatterns[i -1]))
				args.push(exp);
			else
				throw new Error("Non-matching pattern in function " + Lich.VM.PrettyPrint(closure) + " . Failed on: " + Lich.VM.PrettyPrint(exp));
		}
		
		var res = closure.invoke(args);
		Lich.VM.popProcedure();
		return res;
	}*/

Lich.compileApplication = function(ast,ret)
{
	/*
	Lich.compileAST(ast.exps[0], function(closure)
	{
		if(typeof closure === "undefined")
			throw new Error("Cannot invoke an undefined object");

		if(closure._lichType != CLOSURE)
		{
			throw new Error("Unable to use application on " + closure.astType);
		}

		else
		{
			Lich.VM.pushProcedure(new lichClosure([], {}, false, {})); // scope for patterns
			mapCps(
				ast.exps.slice(1, ast.exps.length),

				function(elem, i, callback)
				{
					Lich.compileAST(elem, function(exp)
					{
						Lich.match(exp, closure.argPatterns[i], function(match)
						{
							if(match)
								callback([exp]);
							else
								throw new Error("Non-matching pattern in function " + Lich.VM.PrettyPrint(closure) 
									+ " . Failed on: " + Lich.VM.PrettyPrint(exp));
						});
					});
				},

				function(args)
				{
					closure.invoke(args, function(res)
					{
						Lich.VM.popProcedure();
						ret(res);
					}); // CPS is making by brain break.
				}
			);
		}	
	})*/

	mapCps(
		ast.exps,
		function(elem, i, callback)
		{
			Lich.compileAST(elem, function(exp)
			{
				/*
				Lich.match(exp, closure.argPatterns[i], function(match)
				{
					if(match)
						callback([exp]);
					else
						throw new Error("Non-matching pattern in function " + Lich.VM.PrettyPrint(closure) 
							+ " . Failed on: " + Lich.VM.PrettyPrint(exp));
				});*/
				callback(exp);
			});
		},
		function(exps)
		{
			//Lich.post(exps);
			// Trampoline
			var func = "__curry("+exps[0]+")("+exps.slice(1, exps.length).join(",") + ")";
			ret(func);	
		}
	);
}

Lich.compileFunctionApplicationOp = function(ast,ret)
{
	/*
	var exp1 = Lich.compileAST(ast.lhs);

	if(exp1._lichType != CLOSURE)
		throw new Error("$ can only be applied using: function $ expression");

	var exp2 = Lich.compileAST(ast.rhs);

	return exp1.invoke([exp2]);*/

	/*
	Lich.compileAST(ast.lhs, function(exp1)
	{
		if(exp1._lichType != CLOSURE)
			throw new Error("$ can only be applied using: function $ expression");

		Lich.compileAST(ast.rhs, function(exp2)
		{
			exp1.invoke([exp2], function(res)
			{
				ret(res);
			})
		});
	});*/

	Lich.compileAST(ast.lhs, function(exp1)
	{
		//if(exp1._lichType != CLOSURE)
		//	throw new Error("$ can only be applied using: function $ expression");

		Lich.compileAST(ast.rhs, function(exp2)
		{
			/*
			exp1.invoke([exp2], function(res)
			{
				ret(res);
			})*/

			ret("__curry(" + exp1 + ")("+ exp2 + ")");
		});
	});	
}

Lich.functionCompositionWrapper = function(funcs)
{
	return function(arg,_fcompRet)
	{
		var compRes = arg;
		forEachReverseCps(
			funcs,
			function(func, i, next)
			{
				func(compRes,function(newRes)
				{
					compRes = function(_ret) { _ret(newRes) };
					next();
				})

			},
			function()
			{
				compRes(function(res) { _fcompRet(res); });
			}
		)
	};
}

Lich.compileFunctionComposition = function(ast,ret)
{
	/*
	var funcs = new Array();

	for(var i = 0; i < ast.exps.length; ++i)
	{
		var func = Lich.compileAST(ast.exps[i]);

		if(func._lichType != CLOSURE)
			throw new Error("function composition can only be applied using: function . function. Failed with " + Lich.VM.PrettyPrint(func));

		funcs.push(func);
	}

	var composed = composeFunction(funcs);
	return new lichClosure(["X"], composed);*/

	mapCps(
		ast.exps,
		function(elem,i,callback)
		{
			Lich.compileAST(elem, function(func)
			{
				//if(func._lichType != CLOSURE)
				//	throw new Error("function composition can only be applied using: function . function. Failed with " + Lich.VM.PrettyPrint(func));
				callback(func);
			})
		},
		function(funcs)
		{
			Lich.post(funcs);
			ret("Lich.functionCompositionWrapper(["+funcs.join(",")+"])");
		}
	);
}

Lich.compileLambda = function(ast,ret)
{
	Lich.compileAST(ast.rhs, function(rhs)
	{
		ret("(function(" + ast.args.map(function(e){return e.id}).concat("_ret").join(",") + "){ return " + rhs + returnLambda + "})");
	});
}

Lich.compileLet = function(ast,ret)
{
	var func = "(function(_ret){";

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
				ret(func + decls.join("") + " return (" +exp +")"+ returnLambda + "})");
			});
		}
	);
}

Lich.compileLetOne = function(ast,ret)
{
	//return Lich.compileAST(ast.decl);
	Lich.compileAST(ast.decl, function(res)
	{
		ret(res);
	});
}

Lich.compileListExp = function(ast,ret)
{
	/*
	var res = new Array();

	for(var i = 0; i < ast.members.length; ++i)
	{
		res.push(Lich.compileAST(ast.members[i]));
	}

	return res;*/

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
			ret("function(_ret){_ret(["+res.join(",")+"])}");
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
	//ret(Lich.VM.getVar(ast.id));
	//ret("function(_ret){_ret("+ast.id+")}");
	ret("__curry("+ast.id+")");
}

Lich.compileDacon = function(ast,ret)
{
	if(ast == "Nothing")
		ret("function(_ret){_ret(null)}");
	else
		Lich.unsupportedSemantics({astType:ast});
}

Lich.compileDataDecl = function(ast,ret)
{
	/*
	var data = lichData(ast.id);

	for(var i = 0; i < ast.members.length; ++i)
	{
		data._argNames.push(ast.members[i].id);
		data[ast.members[i].id] = Lich.compileAST(ast.members[i].exp);
	}

	Lich.VM.setVar(ast.id, data);
	return data;*/

	/*
	var data = lichData(ast.id);

	mapCps(
		ast.members,
		function(elem,i,callback)
		{
			Lich.compileAST(elem.exp, function(elemRes)
			{
				data[elem.id] = elemRes;
				callback(elem.id);
			});
		},
		function(dataArgNames)
		{
			data._argNames = dataArgNames;
			Lich.VM.setVar(ast.id, data);
			ret(data);
		}
	);*/

	// Native

	var argNames = [];
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
			dataPairs.push("_lichType:\"DATA\"");
			dataPairs.push("_argNames:["+argNames.join(",")+"]");
			ret(ast.id+"={"+dataPairs.join(",")+"}");
		}
	);
}

Lich.newData = function(constructor,members, _dataRet)
{
	if(constructor == null) throw new Error("Unable to find data constructor for " + constructor);
	var data = deepCopy(constructor);
	forEachCps(
		members, 
		function(elem,i,next)
		{
			Lich.post("constructor._argNames[i] = " + constructor._argNames[i]);
			data[constructor._argNames[i]] = elem;
			next();
		},
		function()
		{
			_dataRet(data);
		}
	);

	/*
	return data;function(_dataRet)
	{
		_dataRet(data);
	}*/
}

Lich.compileDataInst = function(ast,ret)
{
	/*
	var dataCon = Lich.VM.getVar(ast.id);

	if(dataCon == Lich.VM.Nothing)
		throw new Error("Unable to find data constructor for " + ast.id);

	var data = deepCopy(dataCon);

	if(dataCon._argNames.length < ast.members.length)
		throw new Error("Too many arguments for data constructor " + ast.id);

	for(var i = 0; i < ast.members.length; ++i)
	{
		data[dataCon._argNames[i]] = Lich.compileAST(ast.members[i]);
	}

	return data;*/

	/*
	var dataCon = Lich.VM.getVar(ast.id);

	if(dataCon == Lich.VM.Nothing)
		throw new Error("Unable to find data constructor for " + ast.id);

	var data = deepCopy(dataCon);

	if(dataCon._argNames.length < ast.members.length)
		throw new Error("Too many arguments for data constructor " + ast.id);

	forEachCps(
		ast.members, 
		function(elem,i,next)
		{
			Lich.compileAST(elem, function(elemRes)
			{
				data[dataCon._argNames[i]] = elemRes;
				next();
			});
		},
		function()
		{
			ret(data);
		}
	);*/


	// Native

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
		}
	);
}

Lich.compileDataLookup = function(ast,ret)
{
	/*
	var data = Lich.compileAST(ast.data);

	if(data._lichType != DATA)
		throw new Error("Unable to find data constructor. Failed with: " + ast.data + " :: " + ast.member);

	var res = data[ast.member];

	if(typeof res === "undefined")
		throw new Error("Data constructor " + data._datatype + " does not contain member " + ast.member);

	return res;	*/

	/*
	Lich.compileAST(ast.data, function(data)
	{
		if(data._lichType != DATA)
			throw new Error("Unable to find data constructor. Failed with: " + ast.data + " :: " + ast.member);

		var res = data[ast.member];

		if(typeof res === "undefined")
			throw new Error("Data constructor " + data._datatype + " does not contain member " + ast.member);

		ret(res);
	});*/

	// Native
	Lich.compileAST(ast.data, function(res)
	{
		//ret(res+"[\""+ast.member+"\"]");
		
		ret("(function(_lookRet){Lich.apply("+res+",function(_lookRes){_lookRet(_lookRes[\""+ast.member+"\"])})})");
	});
}

Lich.dataUpdate = function(data,members, _dataRet)
{
	var newData = deepCopy(data);
	var res;
	forEachCps(
		members, 
		function(elem,i,next)
		{
			Lich.post(members[i].id + " = " + elem.exp);
			newData[members[i].id] = elem.exp;
			next();
		},
		function()
		{
			_dataRet(newData);
		}
	);

	//return newData;function(_dataRet)
	/*{
		Lich.post("typeof newData = " + typeof newData);
		_dataRet(newData);
	};*/
}

Lich.compileDataUpdate = function(ast,ret)
{
	/*
	var dataCon = Lich.compileAST(ast.data);

	if(dataCon == Lich.VM.Nothing)
		throw new Error("Unable to find data object for update. Failed on update to " + ast.data);

	var data = deepCopy(dataCon);

	for(var i = 0; i < ast.members.length; ++i)
	{
		data[ast.members[i].id] = Lich.compileAST(ast.members[i].exp);
	}

	return data;*/


	/*
	Lich.compileAST(ast.data, function(dataCon)
	{
		if(dataCon == Lich.VM.Nothing)
			throw new Error("Unable to find data constructor for " + ast.id);

		var data = deepCopy(dataCon);

		if(dataCon._argNames.length < ast.members.length)
			throw new Error("Too many arguments for data constructor " + ast.id);

		forEachCps(
			ast.members, 
			function(elem,i,next)
			{
				Lich.compileAST(elem.exp, function(elemRes)
				{
					data[ast.members[i].id] = elemRes;
					next();
				});
			},
			function()
			{
				ret(data);
			}
		);
	});*/

	// Native
	Lich.compileAST(ast.data, function(dataCon)
	{
		/*
		if(dataCon == Lich.VM.Nothing)
			throw new Error("Unable to find data constructor for " + ast.id);

		var data = deepCopy(dataCon);

		if(dataCon._argNames.length < ast.members.length)
			throw new Error("Too many arguments for data constructor " + ast.id);*/

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
	/*
	var data = lichData(ast.id);

	for(var i = 0; i < ast.members.length; ++i)
	{
		data._argNames.push(ast.members[i]);
		data[ast.members[i]] = lichData(ast.members[i]);
		Lich.VM.setVar(ast.members[i], data[ast.members[i]]);
	}

	Lich.VM.setVar(ast.id, data);
	return data;*/

	/*
	var data = lichData(ast.id);

	mapCps(
		ast.members,
		function(elem,i,callback)
		{
			data[elem] = lichData(elem);
			Lich.VM.setVar(elem, data[elem]);
			callback(elem);
		},
		function(dataArgNames)
		{
			data._argNames = dataArgNames;
			Lich.VM.setVar(ast.id, data);
			ret(data);
		}
	);*/

	// Native

	//var argNames = [];
	mapCps(
		ast.members,
		function(elem,i,callback)
		{
			callback(elem);
			//argNames.push("\""+elem.id+"\"");
			//callback(elem.id+":{_lichType:\"DATA\",_argNames:[]}");
		},
		function(argNames)
		{
			dataPairs = new Array();
			var res = "";

			for(var i = 0; i < argNames.length; ++i)
			{
				res = res + argNames[i] + "={_lichType:\"DATA\",_argNames:[]};"
				dataPairs.push(argNames[i] + ":" + argNames[i]);
			}

			dataPairs.push("_lichType:\"DATA\"");
			dataPairs.push("_argNames:["+argNames.join(",")+"]");
			ret(res+ast.id+"={"+dataPairs.join(",")+"};");
		}
	);
}

Lich.compileBinOpExp = function(ast,ret)
{
	//var op = Lich.VM.getVar(ast.op); // Lookup function for operator

	//if(op == Lich.VM.Nothing)
	//	throw new Error("Binary Operator not found: " + ast.op);

	//return op.invoke([Lich.compileAST(ast.lhs), Lich.compileAST(ast.rhs)]);
	Lich.compileAST(ast.lhs, function(lhs)
	{
		Lich.compileAST(ast.rhs, function(rhs)
		{
			/*
			op.invoke([lhs,rhs], function(res)
			{
				ret(res);
			});*/

			if(Lich.VM.reserved.hasOwnProperty(ast.op))
				ret("__curry("+Lich.VM.reserved[ast.op]+")("+lhs+","+rhs+")");
			else if((ast.lhs.astType == "float-lit" || ast.lhs.astType == "string-lit") && (ast.rhs.astType == "float-lit" || ast.rhs.astType == "string-lit"))
				ret("(function(_opRet){_opRet("+lhs+""+ast.op+""+rhs+")})");
			else
				ret("function(_opRet){Lich.apply("+lhs+",(function(resL){Lich.apply("+rhs+",(function(resR){_opRet(resL"+ast.op+"resR)}))}))}");
		});
	});
}

Lich.compileNegate = function(ast,ret)
{ 
	// return Lich.VM.getVar("subtract").invoke([0, Lich.compileAST(ast.rhs)]);
	//var op = Lich.VM.getVar("subtract");

	Lich.compileAST(ast.rhs, function(rhs)
	{
		/*
		op.invoke([0, rhs], function(res)
		{
			ret(res);
		});*/

		ret("function(_ret){_ret(-"+rhs+")}");
	});
}

Lich.listRange = function(lower,upper,next,_rangeRet)
{
	var next;
	var skip = 0;

	if(typeof next === "undefined")
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
}

Lich.compileListRange = function(ast,ret)
{
	/*
	var lower = Lich.compileAST(ast.lower);
	var upper = Lich.compileAST(ast.upper);
	var next;
	var skip = 0;

	if(typeof ast.skip === "undefined")
	{
		if(lower < upper)
			skip = 1;
		else
			skip = -1;
	}
	
	else
	{
		next = Lich.compileAST(ast.skip);
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

		return array;
	}

	else
	{
		for(var i = lower; i <= upper; i += skip)
		{
			array.push(i);
		}

		return array;
	}*/

	// CPS

	Lich.compileAST(ast.lower, function(lower)
	{
		Lich.compileAST(ast.upper, function(upper)
		{
			if(typeof ast.skip !== "undefined")
			{
				Lich.compileAST(ast.skip, function(skipRes)
				{
					ret("(function(_rangeRet){Lich.listRange("+lower+","+upper+","+skipRes+",_rangeRet)})");
				});
			}
			else
			{
				ret("(function(_rangeRet){Lich.listRange("+lower+","+upper+","+ast.skip+",_rangeRet)})");
			}
		});
	});
}

Lich.compileDictionary = function(ast,ret)
{
	/*
	var dict = {lichType: DICTIONARY};
	
	for(var i = 0; i < ast.pairs.length; i += 2)
	{
		dict[Lich.compileAST(ast.pairs[i])] = Lich.compileAST(ast.pairs[i+1]);
	}

	return dict;*/

	/*
	var dict = {lichType: DICTIONARY};

	forEachPairsCps(
		ast.pairs, 

		function(elem,i,next)
		{
			Lich.compileAST(elem,function(dictKey)
			{
				Lich.compileAST(ast.pairs[i + 1], function(dictRes)
				{
					dict[dictKey] = dictRes;
					next();
				});
			});
		},

		function()
		{
			ret(dict);
		}
	);*/

	// Native
	var pairs = new Array();
	pairs.push("_lichType:DICTIONARY")

	forEachPairsCps(
		ast.pairs, 

		function(elem,i,next)
		{
			Lich.compileAST(elem,function(dictKey)
			{
				Lich.compileAST(ast.pairs[i + 1], function(dictRes)
				{
					//dict[dictKey] = dictRes;
					pairs.push(dictKey+":"+dictRes);
					next();
				});
			});
		},

		function()
		{
			ret("{"+pairs.join(",")+"}");
		}
	);
}

Lich.compileCase = function(ast,ret)
{
	/*
	var exp = Lich.compileAST(ast.exp);
	var closure = new lichClosure([], {}, false, {});
	Lich.VM.pushProcedure(closure);

	for(var i = 0; i < ast.alts.length; ++i)
	{
		var pat = ast.alts[i].pat;
		if(pat._lichType == WILDCARD || Lich.match(exp, pat))
		{
			var res = Lich.compileAST(ast.alts[i].exp);
			Lich.VM.popProcedure();
			return res;
		}
	}

	Lich.VM.popProcedure();
	return Lich.VM.Nothing;*/

	Lich.compileAST(ast.exp, function(exp)
	{
		Lich.VM.pushProcedure(new lichClosure([], {}, false, {})); // scope for patterns
		var match = false;
		var res;
		forEachWithBreakCps(
			ast.alts, 

			function(elem,index,next)
			{
				var pat = elem.pat;
				if(pat._lichType == WILDCARD)
				{
					Lich.compileAST(ast.alts[index].exp, function(expRes)
					{
						match = true;
						res = expRes;
						next(true);
					});
				}

				else
				{
					Lich.match(exp, pat, function(matchRes)
					{
						if(matchRes)
						{
							Lich.compileAST(ast.alts[index].exp, function(expRes)
							{
								match = true;
								res = expRes;
								next(true);
							});
						}

						else
						{
							next(false);
						}
					});
				}
			},

			function()
			{
				Lich.VM.popProcedure();
				
				if(match)
					ret(res);
				else
					ret(Lich.VM.Nothing);
			}
		);
	});
}

Lich.listComprehension = function(exp,generatorScope,generatorLoop,filters,_listRet)
{
	//var closure = new lichClosure([], ast.exp);
	var res = new Array();

	// Then iterate over the lists, creating all the combinations of the lists and applying the filters to each item.
	var nestLoop = function(nI) // recusrive nested looping over each list from the generators
	{
		var loopID = generatorLoop[nI];
		var currentList = generatorScope[loopID];
		//var scope = typeof nScope !== "undefined" ? nScope : {};

		/*
		if(!(list instanceof Array))
				throw new Error("List comprehensions can only be created with list generators and boolean expressions such as: [x | x <- [1..9], x /= 3]"
					+ ". Failed when compiling a generator from: " + Lich.VM.PrettyPrint(list));
		*/

		for(var j = 0; j < currentList.length; ++j)
		{
			//scope[loopID] = currentList[j];

			if(nI < generatorLoop.length - 1)
			{
				nestLoop(nI + 1);
			}

			else
			{
				//closure = new lichClosure([], ast.exp, false, scope);
				exp(function(temp)
				{
					var collect = true;

					for(var k = 0; k < filters.length; ++k)
					{
						filters[k](temp, function(unfiltered)
						{
							if(!unfiltered) // !unfiltered == filtered meaning, don't collect
							{
								collect = false;
							}
						});

						if(!collect)
							break;
					}

					if(collect)
						res.push(temp);
				});
			}	
		}
	}
	
	nestLoop(0);
	_listRet(res);
}

Lich.compileListComprehension = function(ast,ret)
{
	/*
	var closure = new lichClosure([], ast.exp);
	var generatorScope = {}
	var generatorLoop = new Array();
	var res = new Array();
	var filters = new Array();

	// First we collect all the filter functions
	for(var i = 0; i < ast.generators.length; ++i)
	{
		if(ast.generators[i].astType != "decl-fun")
			filters.push(ast.generators[i]);
	}

	// Collect all the lists from the generators
	for(var i = 0; i < ast.generators.length; ++i)
	{
		if(ast.generators[i].astType == "decl-fun")
		{
			var list = Lich.compileAST(ast.generators[i].rhs);

			if(!(list instanceof Array))
				throw new Error("List comprehensions can only be created with list generators and boolean expressions such as: [x | x <- [1..9], x /= 3]"
					+ ". Failed when compiling a generator from: " + Lich.VM.PrettyPrint(list));

			generatorScope[ast.generators[i].ident] = list;
			generatorLoop.push(ast.generators[i].ident);
		}
	}

	res = new Array();

	// Then iterate over the lists, creating all the combinations of the lists and applying the filters to each item.
	var nestLoop = function(nI, nScope) // recusrive nested looping over each list from the generators
	{
		var loopID = generatorLoop[nI];
		var currentList = generatorScope[loopID];
		var scope = typeof nScope !== "undefined" ? nScope : {};

		for(var j = 0; j < currentList.length; ++j)
		{
			scope[loopID] = currentList[j];

			if(nI < generatorLoop.length - 1)
			{
				nestLoop(nI + 1, scope);
			}

			else
			{
				closure = new lichClosure([], ast.exp, false, scope);
				var temp = closure.invoke([]);
				var collect = true;

				for(var k = 0; k < filters.length; ++k)
				{
					var filterClosure = new lichClosure([], filters[k], false, scope);
					
					if(!filterClosure.invoke([]))
					{
						collect = false;
						break;
					}
				}

				if(collect)
					res.push(temp);
			}	
		}
	}
	
	nestLoop(0);
	return res;*/

	/*
	var closure = new lichClosure([], ast.exp);
	var generatorScope = {}
	var generatorLoop = new Array();
	var res = new Array();
	var filters = new Array();

	// First we collect all the filter functions
	for(var i = 0; i < ast.generators.length; ++i)
	{
		if(ast.generators[i].astType != "decl-fun")
			filters.push(ast.generators[i]);
	}

	// Collect all the lists from the generators
	for(var i = 0; i < ast.generators.length; ++i)
	{
		if(ast.generators[i].astType == "decl-fun")
		{
			Lich.compileAST(ast.generators[i].rhs, function(list)
			{
				if(!(list instanceof Array))
					throw new Error("List comprehensions can only be created with list generators and boolean expressions such as: [x | x <- [1..9], x /= 3]"
						+ ". Failed when compiling a generator from: " + Lich.VM.PrettyPrint(list));

				generatorScope[ast.generators[i].ident] = list;
				generatorLoop.push(ast.generators[i].ident);
			});
		}
	}

	res = new Array();

	// Then iterate over the lists, creating all the combinations of the lists and applying the filters to each item.
	var nestLoop = function(nI, nScope) // recusrive nested looping over each list from the generators
	{
		var loopID = generatorLoop[nI];
		var currentList = generatorScope[loopID];
		var scope = typeof nScope !== "undefined" ? nScope : {};

		for(var j = 0; j < currentList.length; ++j)
		{
			scope[loopID] = currentList[j];

			if(nI < generatorLoop.length - 1)
			{
				nestLoop(nI + 1, scope);
			}

			else
			{
				closure = new lichClosure([], ast.exp, false, scope);

				closure.invoke([], function(temp)
				{
					var collect = true;

					for(var k = 0; k < filters.length; ++k)
					{
						var filterClosure = new lichClosure([], filters[k], false, scope);
						filterClosure.invoke([], function(unfiltered)
						{
							if(!unfiltered) // !unfiltered == filtered meaning, don't collect
							{
								collect = false;
							}
						});

						if(!collect)
							break;
					}

					if(collect)
						res.push(temp);
				});
			}	
		}
	}
	
	nestLoop(0);
	ret(res);*/

	// Native
	var filters = new Array();
	var generatorScope = new Array();
	var generatorLoop = new Array();

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
				generatorScope.push(ast.generators[i].ident+":" + list);
				generatorLoop.push(ast.generators[i].ident);
			});
		}
	}

	Lich.compileAST(ast.exp, function(expRes)
	{
		var func = "(function(_listCompRet){Lich.listComprehension(";
		func = func + expRes+",{"+generatorScope.join(",")+"},["+generatorLoop.join(",")+"],["+filters.join(",")+ "],_listCompRet)})";
		ret(func);
	});
}

// {astType: "class-exp", id:$2, var:$3,members:$6}
Lich.compileClassExpr = function(ast,ret)
{
	/*
	var classObject = lichClass(ast.id);

	for(var i = 0; i < ast.members.length; ++i)
	{
		classObject[Lich.patternHash(ast.members[i])] = Lich.compileAST(ast.members[i].rhs);
	}

	Lich.VM.setVar(ast.id, classObject);
	return data;*/

	Lich.unsupportedSemantics(ast, ret);
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
    		return object;

    	if(object._lichType == CLOSURE || object._lichType == THUNK)
	    {
	    	var rhs = object.rhs;

	    	if(rhs._lichType == PRIMITIVE)
	    	{
		    	rhs = Lich.VM.getVar(rhs.id).rhs;
			}

			var type = object._lichType;
			object = new lichClosure(object.argPatterns, rhs, object.mutable, object.namespace, object.decls);
			object._lichType = type;
	    }

        for(var n in object)
		{
			object[n] = postProcessJSON(object[n]);
		}

		return object;
    }

    return object;
}

Lich.parseJSON = function(json)
{
	return postProcessJSON(JSON.parse(json));
}

Lich.stringify = function(object)
{
	return JSON.stringify(object, function (key, value) 
	{
		if(value.astType == "primitive")
		{
			return {lichType:PRIMITIVE, id: value.primitiveName};
		}

	    return value;

	});
}

/*
function matchMessage(message, alts, ret)
{
	for(var i = 0; i < ast.alts.length; ++i)
	{
		var pat = ast.alts[i].pat;
		if(pat._lichType == WILDCARD || Lich.match(exp, pat))
		{
			res = Lich.compileAST(ast.alts[i].exp);
			return true;
		}
	}

	return false;

	var match = false;
	forEachWithBreakCps(
		ast.alts, 
		function(elem, index, next)
		{
			var pat = elem.pat;
			if(pat._lichType == WILDCARD)
			{
				match = true;
				next(true);
			}

			else
			{
				Lich.match()
			}
		}, 
		function()
		{

		}
	);
}*/

Lich.compileReceive = function(ast,ret)
{
	/*
	if(Lich.VM.currentThread !== "Actor")
		throw new Error("Cannot use receive from the main thread. receive can only be called by an Actor.");

	if(messageBox.length == 0)
		// createListener

	var closure = new lichClosure([], {}, false, {});
	var match = false;
	var messageIndex = 0;
	var res = Nothing;
	Lich.VM.pushProcedure(closure);

	for(var i = 0; i < messageBox.length; ++i)
	{
		var exp = messageBox[i];

		for(var j = 0; j < ast.alts.length; ++j)
		{
			var pat = ast.alts[j].pat;
			if(pat._lichType == WILDCARD || Lich.match(exp, pat))
			{
				res = Lich.compileAST(ast.alts[j].exp);
				match = true;
				messageIndex = i;
				break
			}
		}

		if(match)
			break;
	}

	Lich.VM.popProcedure();
	
	if(match)
	{
		messageBox.slice(messageIndex, 1);
		return res;
	}

	else
	{
		// createListener
	}*/

	//////////
	// CPS
	//////////

	if(Lich.VM.currentThread !== "Actor")
		throw new Error("Cannot use receive from the main thread. receive can only be called by an Actor.");

	if(messageBox.length == 0)
	{
		queuedReceive = function()
		{
			Lich.compileReceive(ast, ret);
		}

		return;
	}

	var closure = new lichClosure([], {}, false, {}); // scope for patterns
	var match = false;
	var messageIndex = 0;
	var altIndex = 0;
	Lich.VM.pushProcedure(closure);

	// Two dimensional iteration over each message against each defined pattern.
	// If we find a match break from both loops and call the pattern's matching expression.
	// Otherwise we schedule receive to be called again upon the arrival of a new message.
	forEachWithBreakCps
	(
		messageBox, // For each message in the messageBox
		function(exp, i, nextMessage)
		{
			forEachWithBreakCps
			(
				ast.alts, // for each pattern
				function(elem, j, nextAlt)
				{
					var pat = elem.pat;
					if(pat._lichType == WILDCARD) // Wild Cards always match
					{
						match = true;
						messageIndex = i;
						altIndex = j;
						nextAlt(true); // break
					}

					else
					{
						// Check for a match of the message expression against the pattern
						Lich.match(exp, pat, function(matchRes)
						{
							if(matchRes)
							{
								match = true;
								messageIndex = i;
								altIndex = j;
								nextAlt(true); // break
							}

							else
							{
								nextAlt(false); // continue
							}
						});
					}
				},

				function()
				{
					nextMessage(match); // if true, then break, if false then continue
				}
			)
		},

		function()
		{
			if(match) // Did we find a match?
			{
				messageBox.splice(messageIndex, 1); // Remove the message from the message box
				// We found a match, so compile the pattern's expression, continue with ret(res)
				Lich.compileAST(ast.alts[altIndex].exp, function(res)
				{
					Lich.VM.popProcedure();
					queuedReceive = null;
					ret(res);
				});
			}

			else // No match
			{
				Lich.VM.popProcedure();
				// createListener for future messages
				queuedReceive = function()
				{
					Lich.compileReceive(ast, ret);
				}
			}
		}
	);
}


Lich.matchFunctionWithPatterns = function(func, args, ret)
{
	Lich.VM.pushProcedure(new lichClosure([], null, false)); // closure for pattern scope
	forEachCps(
		args,
		function(exp, i, next)
		{
			Lich.match(exp, func.argPatterns[i], function(match)
			{
				if(match)
					next();
				else
					throw new Error("Non-matching pattern in function " + Lich.VM.PrettyPrint(func) 
						+ " . Failed on: " + Lich.VM.PrettyPrint(exp));
			});
		},

		function()
		{
			ret();
		}
	);
}

Lich.compileTopExp = function(ast, ret)
{
	Lich.compileAST(ast.exp, function(exp)
	{
		ret("function _lich(_ret){Lich.apply("+exp+",_ret)};_lich(function(res) { Lich.VM.Print(res); });");
	});
}

Lich.test = function(_ret)
{
	return function(_ret2)
	{
		_ret(ret2)
	}();
}