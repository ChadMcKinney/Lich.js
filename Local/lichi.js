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

var libraryParser = fs.readFileSync("../Parser/LichLibraryParser.js")+"";
libraryParser = libraryParser.substring(0, libraryParser.indexOf(fileCompileString));

// We want to pollute the local namespace. We can't use normal Node module exporting because the same code is used in non-Node web based contexts.
eval(interactiveParser + "" + libraryParser);

eval(
    fs.readFileSync("../Compiler/Objects.js") + "" + fs.readFileSync("../Compiler/VM.js") 
		+ fs.readFileSync("../Compiler/Compiler.js") + fs.readFileSync("../Parser/ParseUtility.js") 
		+ fs.readFileSync("../Parser/Types.js")
);

eval(
    fs.readFileSync("../Parser/Lexeme.js") + "" + fs.readFileSync("../Parser/preL.js")
		+ fs.readFileSync("../Parser/iterL.js") + fs.readFileSync("../Parser/parse.js")
);

eval(fs.readFileSync("../Library/Prelude.js") + "" + fs.readFileSync("../Soliton.js/SuperCollider.js") + "" + fs.readFileSync("../Soliton.js/Patterns.js") + "");
eval(fs.readFileSync("../Networking/LichLocalNetworking.js") + ""/* + fs.readFileSync("../Networking/LichClient.js")*/);

// Overwrite global printing so that we can use the console instead of the DOM.
post = console.log;
Lich.post = console.log;


var clientName = "Noob";
var ast = Lich.parseLibrary(fs.readFileSync("../Library/Prelude.lich") + "");
var preludeSource = Lich.compileAST(ast);

setTimeout(function(){eval(preludeSource);}, 2000);


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
	server.quit();
    console.log('Exiting Lich.js ...');
    process.exit(0);
}

var _codeString = "";

process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    if(chunk !== null)
    {
		chunk = chunk.toString();

		if(chunk == ":quit\n")
		{
			return _quit();
		}
		
		var eot = chunk.indexOf('␗');
		
		if(eot != -1)
		{
			_codeString += chunk.slice(0, eot);

			switch(_codeString)
			{
			case '':
				break;
			/*
			case 'freeAll':
				freeAll();
				break;
  			case ':quit':
			case ':q':
    		case 'exit':
      			_quit();
      			break;*/
			default:
				broadcastLichCode(_codeString);
				_compile(_codeString);
				break;
			}
			
			_codeString = chunk.slice(eot + 2, chunk.length);
			return;
		}

		else
		{
			_codeString += chunk;
		}
	}
});
