#!/bin/sh
cd Parser
jison LichParser.jison
cp LichParser.jison LichLibraryParser.jison
sed 's/    \: \"†\" exp \"‡\" EOF         { return $2; }/    \/\/\: \"†\" exp \"‡\" EOF         { return $2; }/' <LichLibraryParser.jison >LichLibraryParserNew.jison
mv LichLibraryParserNew.jison LichLibraryParser.jison
sed 's/    \/\/ \: module_ EOF          { return $1; }/    \: module_ EOF          { return $1; }/' <LichLibraryParser.jison >LichLibraryParserNew.jison
mv LichLibraryParserNew.jison LichLibraryParser.jison
sed 's/  | \"let\" decl                      {{$$ = {astType\:\"let-one\", decl\: $2, pos\: @$}; }}/  \/\/ | \"let\" decl                      {{$$ = {astType\:\"let-one\", decl\: $2, pos\: @$}; }} /'  <LichLibraryParser.jison >LichLibraryParserNew.jison
mv LichLibraryParserNew.jison LichLibraryParser.jison
jison LichLibraryParser.jison
