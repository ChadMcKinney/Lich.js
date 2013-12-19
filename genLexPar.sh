#!/bin/sh
cd Parser
#rhino ~/Documents/source/libraries/jscc/jscc.js -v -o LichParser.js -p web -t ~/Documents/source/libraries/jscc/driver_web.js_ LichParser.js.par
# We require pgjs and jison to generate the lexer and parser. These can be acquired from  node.js if you want to generate them yourselves
# Unless you plan on making changes to the lexer/parser you should never need to do this.
# removed pegjs because it's completely unneccessary and slow
#pegjs lexical_structure tokenize.js
#sed 's/module.exports = (function(){/Lich.Parser.tokenize = (function(){/' tokenize.js >tokenizeNew.js
#mv tokenizeNew.js tokenize.js
jison LichParser.jison
