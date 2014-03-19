// Lich.js Node based compiler for local files.

var fs = require('fs');

// jison adds node.js code to compile files, but we're going to use our own below, so we strip out theirs
var fileCompileString = "if (typeof require !== \'undefined\' && typeof exports !== \'undefined\') {";
var libraryParser = fs.readFileSync("../Parser/LichLibraryParser.js")+"";
libraryParser = libraryParser.substring(0, libraryParser.indexOf(fileCompileString));

// We want to pollute the local namespace. We can't use normal Node module exporting because the same code is used in non-Node web based contexts.
eval(libraryParser);

eval(
	fs.readFileSync("../Compiler/Objects.js") + "" + fs.readFileSync("../Compiler/VM.js") 
	+ fs.readFileSync("../Compiler/Compiler.js") + fs.readFileSync("../Parser/ParseUtility.js") 
	+ fs.readFileSync("../Parser/Types.js")
);

eval(
	fs.readFileSync("../Parser/Lexeme.js") + "" + fs.readFileSync("../Parser/preL.js")
	+ fs.readFileSync("../Parser/iterL.js") + fs.readFileSync("../Parser/parse.js")
);

eval(fs.readFileSync("../Library/Prelude.js") + "");

// Overwrite global printing so that we can use the console instead of the DOM.
post = console.log;
Lich.post = console.log;

_compile = function(lc)
{
	var ast = Lich.parseLibrary(lc);
	var res = Lich.compileAST(ast);
		
	if(res instanceof Array)
	{
		res = res.join(";");
	}

	return res;
}

exports.main = function commonjsMain(args) {
    if (!args[1] || ! args[2]) {
        console.log('Usage: '+args[0]+' FILE DEST');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    var lichExtension = args[1].indexOf(".lich");

    if(lichExtension == -1)
    	throw new Error("lichc can only be used with \".lich\" files.");

    var res = _compile(source);
    fs.writeFile(args[2], res, function(err){
    	if(err) console.log(err);
    });
    return res;
};

if (typeof module !== 'undefined' && require.main === module) {
	exports.main(process.argv.slice(1));
}