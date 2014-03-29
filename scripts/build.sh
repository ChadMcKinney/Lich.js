#!/bin/sh

# Build script for Lich.js
# This script generates the lexer and parser, minifies the various lich files, and concatenates them into a single file.
# usage:
# ./build.sh
# For a full build (which includes regenerating the lexer and parser) use:
# ./build.sh full


gen_lex_par()
{
	echo "generating lexer and parser..."
	sh ./genLexPar.sh
}

minify() 
{
	echo "minifying..."
	node min.js
}

case $1 in
	full)
	    gen_lex_par
	    minify
		;;
	*)
	    minify
		;;
	
esac

echo "\n\n\n"
echo "--------------------------"
echo "--| done building Lich.js"
echo "--------------------------"
exit 0
