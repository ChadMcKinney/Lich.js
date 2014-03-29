#!/bin/sh
# genLexPar.sh generates the lexer and parser for Lich.js using jison. Must have installed jison via npm to use this script.
cd ../Parser
jison LichParser.jison
cp LichParser.jison LichLibraryParser.jison
sed 's/    \: topexps EOF      { return $1; }/    \/\/\: topexps EOF      { return $1; }/' <LichLibraryParser.jison >LichLibraryParserNew.jison
mv LichLibraryParserNew.jison LichLibraryParser.jison
sed 's/    \/\/ \: module_ EOF          { return $1; }/    \: module_ EOF          { return $1; }/' <LichLibraryParser.jison >LichLibraryParserNew.jison
mv LichLibraryParserNew.jison LichLibraryParser.jison
jison LichLibraryParser.jison
