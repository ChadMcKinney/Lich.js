/*

 	Utility objects/functions for Lich parsing
	Most of this is taken from the JSHC project, modified for use with the Lich language. 
*/

Lich.Parser = new Object() // Global Lich object for lexing/parsing

//////////////////////////////////////////////////////////////////////////////////////////
// Assert
//////////////////////////////////////////////////////////////////////////////////////////

/*
http://wiki.commonjs.org/wiki/Unit_Testing/1.0
TODO: make a module. see http://wiki.commonjs.org/wiki/Modules/1.1
*/

assert = {};

assert.AssertionError = function(obj){
    //Error.call(this);
    //for(var k in this){
    //   document.write("key:"+k+",value:"+this[k]+"<br>");
    //}
    var err = new Error();  // error object used to initialize some members
    //if(this.stack === undefined)post("no stack");
    //document.write(this.stack);

    // message, fileName, lineNumber, stack, name
    for(var k in err){
       this[k] = err[k];
       //document.write("key:"+k+",value:"+err[k]+"<br>");
    }

    this.name = "AssertionError";

    if( obj !== undefined ){
        this.message = obj.message;
        this.actual = obj.actual;
        this.expected = obj.expected;
    } else {
        // use default empty message from Error class.
        //this.message = err.message;
    }
};
assert.AssertionError.prototype = new Error(); //Error.prototype;
//assert.AssertionError.prototype.name = "Error";
//assert.AssertionError.prototype.constructor = assert.AssertionError;

assert.ok = function(guard, message){
    assert.equal(guard, true, message);
};

assert.equal = function(actual, expected, message){
    if( actual == expected ){
	return;
    }
    
    throw new assert.AssertionError({message: message,
				     actual: actual,
				     expected: expected});
};

assert.notEqual = function(actual, expected, message){
    if( actual != expected ){
	return;
    }

    throw new assert.AssertionError({message: message,
				     actual: actual,
				     expected: expected});
};
/*
assert.deepEqual = function(actual, expected, message){
    if( actual === expected )return;
    if( typeof actual == "object" &&
	typeof expected == "object" ){

	if( actual.prototype !== undefined &&
	    actual.prototype.hasOwnProperty !== undefined &&
	    expected.prototype !== undefined &&
	    expected.prototype.hasOwnProperty !== undefined &&
	    actual.prototype.hasOwnProperty.call !==
            expected.prototype.hasOwnProperty.call )
	    return;
	if( actual.prototype !== expected.prototype )
	    return;

	//check if same set of keys and equivalent values for every key pair.
	var ok = true;
	for(var key in actual){
	    //assert.deepEqual
	};
	if( ok )return;

	throw new assert.AssertionError({message: message,
					 actual: actual,
					 expected: expected});
    } else {
	assert.equal(actual, expected, message);
    }
};
*/


////////////////////////////////////////////////////////////////////////////////

/*
  abstract class for names.
  all subclasses must contain a member "id", and if has a position in a source
  file it must also contain a "pos" with that position.
*/
Lich.Name = function(){
};
Lich.Name.prototype.equal = function(other){
    return this.id === other.id && this.name === other.name;
};

////////////////////////////////////////////////////////////////////////////////

// no location parameter as module names are never qualified and always global.
Lich.ModName = function(id,pos){
    this.name = "modname";
    this.id = id;
    if( pos !== undefined ){
        this.pos = pos;
    } else {
        this.pos = {};
    }
};
Lich.ModName.prototype = new Lich.Name();
Lich.ModName.prototype.toStringN = function(){
    return this.id;
};
Lich.ModName.prototype.toStringQ = function(){
    return this.toStringN();
};
Lich.ModName.prototype.toStringV = function(){
    return "module " + this.toStringQ();
};
Lich.ModName.prototype.toString = Lich.ModName.prototype.toStringN;

Lich.ModName.prefixes = function(id){
    var prefixes = [];

    var startix = 0;
    while(true){
        var endix = id.indexOf(".", startix);
        if( endix === -1 ){
            prefixes.push(id);
            break;
        }
        prefixes.push(id.substr(startix,endix));
        startix = endix + 1;
    }
    return prefixes;
};

////////////////////////////////////////////////////////////////////////////////

Lich.TyCls = function(id,pos,loc){
    this.name = "tycls";
    if( loc !== undefined ){
        this.loc = loc;
        if( id.substr(0,loc.length) == loc ){
            id = id.substr(loc.length+1);
        }
    }
    this.id = id;
    if( pos !== undefined ){
        this.pos = pos;
    } else {
        this.pos = {};
    }
};
Lich.TyCls.prototype = new Lich.Name();
Lich.TyCls.prototype.toStringN = function(){
    return this.id;
};
Lich.TyCls.prototype.toStringQ = function(){
    return (this.loc===undefined ? "" : this.loc+".") + this.toStringN();
};
Lich.TyCls.prototype.toStringV = function(){
    return "type class " + this.toStringQ();
};
Lich.TyCls.prototype.toString = Lich.TyCls.prototype.toStringN;

////////////////////////////////////////////////////////////////////////////////

// no location parameter as they are never top-level names.
Lich.TyVar = function(id,pos){
    this.name = "tyvar";
    this.id = id;
    if( pos !== undefined ){
        this.pos = pos;
    } else {
        this.pos = {};
    }
};
Lich.TyVar.prototype = new Lich.Name();
Lich.TyVar.prototype.toStringN = function(){
    return this.id;
};
Lich.TyVar.prototype.toStringQ = function(){
    return this.toStringN();
};
Lich.TyVar.prototype.toStringV = function(){
    return "type variable " + this.toStringQ();
};
Lich.TyVar.prototype.toString = Lich.TyVar.prototype.toStringN;

////////////////////////////////////////////////////////////////////////////////

Lich.TyCon = function(id,pos,loc){
    this.name = "tycon";
    if( loc !== undefined ){
        this.loc = loc;
        if( id.substr(0,loc.length) == loc ){
            id = id.substr(loc.length+1);
        }
    }
    this.id = id;
    if( pos !== undefined ){
        this.pos = pos;
    } else {
        this.pos = {};
    }
};
Lich.TyCon.prototype = new Lich.Name();
Lich.TyCon.prototype.toStringN = function(){
    return this.id;
};
Lich.TyCon.prototype.toStringQ = function(){
    return (this.loc===undefined ? "" : this.loc+".") + this.toStringN();
};
Lich.TyCon.prototype.toStringV = function(){
    return "type constructor " + this.toStringQ();
};
Lich.TyCon.prototype.toString = Lich.TyCon.prototype.toStringN;

////////////////////////////////////////////////////////////////////////////////

Lich.DaCon = function(id,pos,isSymbol,loc){
    assert.ok( typeof isSymbol === "boolean" );
    this.name = "dacon";
    if( loc !== undefined ){
        this.loc = loc;
        if( id.substr(0,loc.length) == loc ){
            id = id.substr(loc.length+1);
        }
    }
    this.id = id;
    this.isSymbol = isSymbol;
    if( pos !== undefined ){
        this.pos = pos;
    } else {
        this.pos = {};
    }
};
Lich.DaCon.prototype = new Lich.Name();
Lich.DaCon.prototype.toStringN = function(){
    return (this.isSymbol ? "("+this.id+")" : this.id);
};
Lich.DaCon.prototype.toStringQ = function(){
    var qid = this.loc===undefined ? this.id : this.loc+"."+this.id;
    return (this.isSymbol ? "("+qid+")" : qid);
};
Lich.DaCon.prototype.toStringV = function(){
    return "data constructor " + this.toStringQ();
};
Lich.DaCon.prototype.toString = Lich.DaCon.prototype.toStringN;

////////////////////////////////////////////////////////////////////////////////

Lich.VarName = function(id,pos,isSymbol,loc){
    assert.ok( typeof isSymbol === "boolean" );
    this.name = "varname";
    if( loc !== undefined ){
        this.loc = loc;
        if( id.substr(0,loc.length) == loc ){
            id = id.substr(loc.length+1);
        }
    }
    this.id = id;
    this.isSymbol = isSymbol;
    if( pos !== undefined ){
        this.pos = pos;
    } else {
        this.pos = {};
    }
};
Lich.VarName.prototype = new Lich.Name();
Lich.VarName.prototype.toStringN = function(){
    return (this.isSymbol ? "("+this.id+")" : this.id);
};
Lich.VarName.prototype.toStringQ = function(){
    var qid = this.loc===undefined ? this.id : this.loc+"."+this.id;
    return (this.isSymbol ? "("+qid+")" : qid);
};
Lich.VarName.prototype.toStringV = function(){
    return "variable " + this.toStringQ();
};
Lich.VarName.prototype.toString = Lich.VarName.prototype.toStringN;

////////////////////////////////////////////////////////////////////////////////

Lich.UnitDaCon = function(pos){
    if( pos !== undefined ){
        this.pos = pos;
    } else {
        this.pos = {};
    }
};
Lich.UnitDaCon.prototype = new Lich.DaCon("()",{}, false);

Lich.NilDaCon = function(pos){
    if( pos !== undefined ){
        this.pos = pos;
    } else {
        this.pos = {};
    }
};
Lich.NilDaCon.prototype = new Lich.DaCon("[]",{}, false);

Lich.ConsDaCon = function(pos){
    if( pos !== undefined ){
        this.pos = pos;
    } else {
        this.pos = {};
    }
};
Lich.ConsDaCon.prototype = new Lich.DaCon(":",{}, true);

Lich.TupleDaCon = function(numberOfParams,pos){
    var id = "(";
    for(var ix=1 ; ix<numberOfParams ; ix++){
        id += ",";
    }
    id += ")";
    this.id = id;
    if( pos !== undefined ){
        this.pos = pos;
    } else {
        this.pos = {};
    }
    this.numberOfParams = numberOfParams;
};
Lich.TupleDaCon.prototype = new Lich.DaCon(null, {}, false);

////////////////////////////////////////////////////////////////////////////////

Lich.TupleTyCon = function(numberOfParams,pos){
    var id = "(";
    for(var ix=1 ; ix<numberOfParams ; ix++){
        id += ",";
    }
    id += ")";
    this.id = id;
    if( pos !== undefined ){
        this.pos = pos;
    } else {
        this.pos = {};
    }
    this.numberOfParams = numberOfParams;
};
Lich.TupleTyCon.prototype = new Lich.TyCon(null,{});

////////////////////////////////////////////////////////////////////////////////

Lich.ConPat = function(con, pats, pos){
    this.name = "conpat";
    
    this.con = con;
    this.pats = pats;
    if( pos !== undefined ){
        this.pos = pos;
    } else {
        this.pos = {};
    }
};
Lich.ConPat.prototype = new Lich.Name();
Lich.ConPat.prototype.toStringN = function(){
    return (this.con.toStringN());
};
Lich.ConPat.prototype.toStringQ = function(){
    return this.con.toStringQ();
};
Lich.ConPat.prototype.toStringV = function(){
    return "data constructor " + this.toStringQ();
};
Lich.ConPat.prototype.toString = Lich.ConPat.prototype.toStringN;

////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// showing AST

Lich.showAST = (function(){
	var showAST = function(ast){
	    var sb = [];  // a list as a string buffer/builder
	    try {
	        showAST2(sb,ast);
	    } catch (err) {
	        if( err.message == "too much recursion" && err.name == "InternalError" ){
	            sb.unshift("too much recursion while showing: ");
	        } else {
	            Lich.post(err);
	        }
	    }
	    return sb.join("");
	};

	var showAST2 = function(sb,ast, depth){
        // Lich.post("AST TYPE: " + (typeof ast));

        var depthN = typeof depth == "undefined" ? 0 : depth;
        var tabSpace = Array.apply(null, new Array(depthN)).map(String.prototype.valueOf,"  ").join("");
        
        sb.push("\n");
        sb.push(tabSpace);

	    if( typeof ast === "string" ){
		sb.push("\"" + ast.toString() + "\"");
	    } else if( typeof ast === "number" ){
		sb.push(ast.toString());
	    } else if( typeof ast === "boolean" ){
		sb.push(ast.toString());
	    } else if( ast instanceof Array ){
		sb.push("[");
		sb.push(showNode(sb,ast,depthN));
		sb.push("]");
	    } else if( ast instanceof Object ){
		//        if (typeof ast.toString === "function") {
		//            sb.push(ast.toString());
		//        } else {
		sb.push("{");
		var empty = true;
	        for(k in ast){
	            if (typeof ast[k] !== "function") {
	                sb.push(k+": ");
	                //if( k==="rhs" )document.write("yy"+ast[k] +"<br>");
	                showAST2(sb,ast[k], depthN + 1);
	                //document.write(s +"<br>");
	                sb.push(", ");
	                empty = false;
	            } 
	        }
	        if( !empty )sb.pop();
	        sb.push("}");
		//	    }
	    } else if( ast === null ){ // typeof null === "object"
	        sb.push("null");
	    } else if( ast === undefined){
	        sb.push("undefined");
	    } else {
		throw new Error("unhandled case: "+typeof ast);
	    }
	    //return "(" + typeof ast + ast.toString() + ")";
	};

	var showNode = function(sb,l,depth){
	    if ( l.length == 0 ) {
		    return;
	    }
	    //document.write(s +"<br>");
	    showNodeNE(sb,l,depth + 1);
	};
	
	var showNodeNE = function(sb,l,depth){
	    for(var i=0 ; i<l.length-1 ; i=i+1){
	        showAST2(sb,l[i], depth + 1);
		    sb.push(", ");
	    }
	    //document.write(s +"<br>");
	    showAST2(sb,l[l.length-1], depth + 1);
	}

	return showAST;
    })();

// -----------------------------------------------------------------------------