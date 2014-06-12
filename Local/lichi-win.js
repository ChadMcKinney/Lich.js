// #!/usr/bin/node

// Lich.js Node based interactive compiler for the command line or embedding
var fs = require('fs');
var readline = require('readline');

try {
  process.chdir(__dirname);
}
catch (err) {
  console.log('chdir: ' + err);
}

// jison adds node.js code to compile files, but we don't need this in interactive mode, so we're going to strip it out.
var fileCompileString = "if (typeof require !== \'undefined\' && typeof exports !== \'undefined\') {";
var interactiveParser = fs.readFileSync("../Parser/LichParser.js")+"";
interactiveParser = interactiveParser.substring(0, interactiveParser.indexOf(fileCompileString));

// We want to pollute the local namespace. We can't use normal Node module exporting because the same code is used in non-Node web based contexts.
eval(interactiveParser);

eval(
	fs.readFileSync("../Compiler/Objects.js") + "" + fs.readFileSync("../Compiler/VM.js") 
	+ fs.readFileSync("../Compiler/Compiler.js") + fs.readFileSync("../Parser/ParseUtility.js") 
	+ fs.readFileSync("../Parser/Types.js")
);

eval(
	fs.readFileSync("../Parser/Lexeme.js") + "" + fs.readFileSync("../Parser/preL.js")
	+ fs.readFileSync("../Parser/iterL.js") + fs.readFileSync("../Parser/parse.js")
);

eval(fs.readFileSync("../Library/Prelude.js") + "" + fs.readFileSync("../Soliton.js/SuperCollider.js") + "");

// Overwrite global printing so that we can use the console instead of the DOM.
post = console.log;
Lich.post = console.log;
console.log("{- Lich.js -}\n");

_compile = function(lc)
{
	try
	{
		var ast = Lich.parse(lc);
		var res = Lich.compileAST(ast);
		
		if(res instanceof Array)
		{
			for(var i = 0; i < res.length; ++i)
			{
				eval(res[i]);
			}
		}

		else
		{
			eval(res);
		}

		return res;
	}

	catch(e)
	{
		console.log(e);
		return "";
	}
}

_quit = function()
{
	console.log('Exiting Lich.js ...');
  	process.exit(0);
}

var readline = require('readline'),
rl = readline.createInterface(process.stdin, process.stdout);

// rl.setPrompt('Lich> ');
rl.setPrompt('');
rl.prompt();

rl.on('line', function(line) {
	switch(line.trim()) {
		case ':quit':
    	case 'exit':
      	_quit();
      	break;
    default:
    	_compile(line.trim());
    	break;
    }

	rl.prompt();
}).on('close', function() {
  	_quit();
});
