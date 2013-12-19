/*  
    Grammar specification for Lich. This is essentially a modified version of the parser found in the JSHC project, reworked for Lich.
    Thank you JSHC for all the hardwork! You can find more about the project here:
    https://github.com/evilcandybag/Lich


    Rules are sorted under their corresponding chapter
    in the Haskell 2010 Report, for readability and 
    overview. If a rule is present in several chapters 
    in the report, it is sorted under the first chapter
    it appears. 
*/


/*

//function to flatten a nestled array
{function flatten(array){
    var flat = [];
    for (var i = 0, l = array.length; i < l; i++){
        var type = Object.prototype.toString.call(array[i]).split(' ').pop().split(']').shift().toLowerCase();
        if (type) { flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? flatten(array[i]) : array[i]); }
    }
    return flat;
}}start = (whitespace / lexeme )+

lexeme = (varid_e / conid_e / varsym_e / consym_e / qvarid / qconid / qvarsym / qconsym / literal / special / reservedop / reservedid)
literal = ( integer / float / char  / string )
special = s:( "(" / ")" / "," / ";" / "[" / "]" / "`" / "{" / "}" ) {return {val: s, typ: s}}

whitespace = w:( whitestuff )+ {return {val: w.join("")}}
whitestuff = ( whitechar / comment / ncomment )
whitechar = ( newline / vertab / space / tab ) 
newline =  ( return linefeed / linefeed / formfeed )
return = "\r"
linefeed = "\n"
vertab = "\v"
formfeed = "\f"
space = " "
tab = "\t"

comment = ds:dashes ((!symbol any) any*)? n:newline {return n}
dashes = d:"-"ds:("-")+ {return d.concat(ds.join(""))}
opencom = "{-"
closecom = "-}" 
ncomment = !symbol com:(opencom ANYseq (ncomment ANYseq)* closecom) {return flatten(com).join("").replace(/\S/g," ");}
ANYseq = as:ANY* {return as.join("")} 
ANY = !(opencom / closecom) a:( graphic / whitechar ) {return a}
any = ( graphic / space / tab ) 
graphic = g:( small / large / symbol / digit / special / "\"" / "'" ) {return (g instanceof Object? g.val:g)}

small = ( ascSmall / "_" )
ascSmall = [a-z]

large = ascLarge
ascLarge = [A-Z]

symbol = s:ascSymbol {return s}
ascSymbol = !(opencom / closecom) s:( "!" / "#" / "$" / "&" / "." / "<" / ">" / "=" / "?" / "@" / "\\" / "|" / "~" / ":" ) {return s}

equivalent "=="
notEquivalent = "/="
greater = ">"
lesser = "<"
greaterEqual = ">="
lesserEqual = "<="
minus = "-"
plus = "+"
mod = "%"
mul = "*"
div = "/"
pow = "^"

digit = ascDigit
ascDigit = [0-9]
octit = [0-7]
hexit = ( digit / [A-F] / [a-f] )
 
varid = ( !reservedid head:small tail:( small / large / digit / "'" )* ) {return head.concat(tail.join(""))}
conid = ( head:large tail:( small / large / digit / "'" )* ) {return head.concat(tail.join(""))}
reservedid = res:( "hiding" / "case" / "class" / "data" / "default" / "deriving" / "do" / "else" / "foreign" / "if" / "import" / "infixl" / "infixr" / "infix" / "instance" / "in" / "let" / "module" / "newtype" / "of" / "then" / "type" / "where" / "_" ) !(varid / reservedid) {return {val: res, typ: res}}

varsym = !(reservedop / dashes / escape / ":") s:(symbol)+ {return s.join("")}
consym = !reservedop s:(":"symbol*) {return flatten(s).join("")}
// Took out !escapestuff from the "\\" entry to allow for correct lamba parsing like (\acc x -> acc ++ [x])
reservedop = op:( ".." / "::" / ":" / "=>" / "=" !"="  / "\\" / "|" !"|" / "<-" / "->" / "@" / "~" ) !(varsym / consym) {return {val: (op instanceof Array)? op.join(""): op, typ: (op instanceof Array)? op.join(""): op}}

qvarid = qs:(conid ".")+ ref:((!"." varid) !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qvarid", qual: qs.substr(0,qs.length-1)}}
qconid = qs:(conid ".")+ ref:((!"." conid) !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qconid", qual: qs.substr(0,qs.length-1)}}
qvarsym = qs:(conid ".")+ ref:(varsym !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qvarsym", qual: qs.substr(0,qs.length-1)}}
qconsym = qs:(conid ".")+ ref:((!"." consym) !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qconsym", qual: qs.substr(0,qs.length-1)}}

varid_e = !"." v:varid !"." {return {val: v, typ: "varid"}}
conid_e = !"." c:conid !"." {return {val: c, typ: "conid"}}
varsym_e = v:varsym !"."    {return {val: v, typ: "varsym"}}
consym_e = !"." c:consym !"." {return {val: c, typ: "consym"}}

decimal = d:digit+ {return d.join("")}
octal = o:octit+ {return o.join("")}
hexadecimal = h:hexit+ {return h.join("")}

integer = i:( notdecimal / decimal !("o" /"O" / "x" / "X")) !"." {return {val: i.join(""), typ: "integer"}}
notdecimal = ( "0o" octal / "0O" octal / "0x" hexadecimal / "0X" hexadecimal )

float = f:( (decimal "." decimal (exponent)?) / decimal exponent ) {return {val: f.join(""), typ: "float"}}
exponent = e:(("e"/"E") ("+"/"-")? decimal) {return e.join("")}

char = ("'"c:( !("'" / "\\") graphic / space / !"\\&" escape)"'" ) {return {val: ("'" + c.join("") + "'"), typ: "char"}}
string = "\"" bod:stringchar* "\"" {return {val: ('"' + bod.join("") + '"'), typ: "string"}}
stringchar =  !("\"") ch:(space / escape / graphic / gap)  {return ch}
escape = esc:("\\" escapestuff) {return esc.join("")} 
escapestuff = ( charesc / ascii / decimal / "o" octal / "x" hexadecimal)
charesc = ( "a" / "b" / "f" / "n" / "r" / "t" / "v" / "\\" / "\"" / "'" / "&" )
ascii = ( "^" cntrl "&#0" / "&#1" / "&#2" / "&#3" / "&#4" / "&#5" / "&#6" / "&#7" / "&#8" / "&#9" / "&#10" / "&#11" / "&#12" / "&#13" / "&#14" / "&#15" / "&#16" / "&#17" / "&#18" / "&#19" / "&#20" / "&#21" / "&#22" / "&#23" / "&#24" / "&#25" / "&#26" / "&#27" / "&#28" / "&#29" / "&#30" / "&#31" / "&#32" / "&#127" )
cntrl = ( ascLarge / "@" / "[" / "\\" / "]" / "^" / "_" )
gap = "\\" whitechar+ "\\"

*/

/* lexical grammar */
%lex
%%

[\t\r\v\f" "]+|"--".*|"{-".*"-}"       {/* skip whitespace and comments */}
\n                          return 'ENDL';
[0-9]+("."[0-9]+)?          return 'NUMBER';
"False"|"false"             return 'FALSE';
"True"|"true"               return 'TRUE';
"*"                         return '*';
"/"                         return '/';
"-"                         return '-';
"+"                         return '+';
"^"                         return '^';
"=="                        return '==';
"/="                        return '/=';
">"                         return '>';
">="                        return '>=';
"<"                         return '<';
"<="                        return '<=';
"("                         return '(';
")"                         return ')';
"="                         return '=';
"_"                         return '_';
"!"                         return '!';
"#"                         return '#';
"$"                         return '$';
"&"                         return '&';
"."                         return '.';
"@"                         return '@';
"\\"                        return '\\';      
"|"                         return '|';
"~"                         return '~';
":"                         return ':';
"::"                        return '::';
","                         return ',';
<<EOF>>                     return 'EOF';
"where"                     return 'WHERE';
"if"                        return 'IF';
"then"                      return 'THEN';
"else"                      return 'ELSE';
"let"                       return 'LET';
"hiding"                    return 'HIDING';
"case"                      return 'CASE';
"class"                     return 'CLASS';
"data"                      return 'DATA';
"default"                   return 'DEFAULT';
"deriving"                  return 'DERIVING';
"do"                        return 'DO';
"foreign"                   return 'FOREIGN';
"import"                    return 'IMPORT';
"infixl"                    return 'INFIXL';
"instance"                  return 'INSTANCE';
"in"                        return 'IN';
"module"                    return 'MODULE';
"newtype"                   return 'NEWTYPE';
"of"                        return 'OF';
"type"                      return 'TYPE';
[a-z][A-Za-z0-9_]*          return 'varid';
[A-Z][A-Za-z0-9_]*          return 'conid';
\"([^\"])*\"                return 'string';
["!""#""$""&"".""<"">""=""?""@""\\""|""~"]+     return 'varsym';
":"["!""#""$""&"".""<"">""=""?""@""\\""|""~"]*  return 'consym';
[[A-Z][A-Za-z0-9_]*"."]+[a-z][A-Za-z0-9_]*      return 'qvarid';
[[A-Z][A-Za-z0-9_]*"."]+[A-Z][A-Za-z0-9_]*      return 'qconid';
[[A-Z][A-Za-z0-9_]*"."]+["!""#""$""&"<"">""=""?""@""\\""|""~"]+ return 'qvarsym';
[[A-Z][A-Za-z0-9_]*"."]+":"["!""#""$""&"<"">""=""?""@""\\""|""~"]+ return 'qconsym';

/*
qvarid = qs:(conid ".")+ ref:((!"." varid) !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qvarid", qual: qs.substr(0,qs.length-1)}}
qconid = qs:(conid ".")+ ref:((!"." conid) !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qconid", qual: qs.substr(0,qs.length-1)}}
qvarsym = qs:(conid ".")+ ref:(varsym !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qvarsym", qual: qs.substr(0,qs.length-1)}}
qconsym = qs:(conid ".")+ ref:((!"." consym) !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qconsym", qual: qs.substr(0,qs.length-1)
*/

/lex

/* operator associations and precedence */

%left '+' '-' '%'
%left '*' '/'
%left '^'
%left UMINUS

%nonassoc '='


%start start_
%% /* language grammar */

start_
    : exp EOF    { return $1; }
    // : module_ EOF          { return $1; }
    ;

////////////////////////////////////////////////////////////////////////////////
// 5.1 Module Structure

module_ // : object
  : MODULE modid WHERE body
       {{$$ = {name: MODULE, modid: $2, body: $4, pos: @$}; }}
  | MODULE modid '(' exports ')' WHERE body
       {{$$ = {name: MODULE, modid: $2, exports: $4, body: $7, pos: @$}; }}
  | body
      {{$$ = {name: MODULE, modid: new Lich.ModName("Main"), body: $1, pos:@$}; }}
         // no modid since missing. defaults to 'Main'.
         // no exports since missing. everything exported.
  ;

// To avoid a lookahead > 1, we allow parsing of intermingled imports and other
// top-level declarations, but perform a post-check that enforces that there are
// no imports after the first other declaration.  
body // : object
  : '{' topdecls '}'    
        {{ 
        var imps = [], decs = [], atdecs = false;
        for (var i = 0; i < $2.length; i++) {
            if ($2[i].name == "impdecl" && !atdecs) {
                imps.push($2[i]);
            } else if ($2[i].name == "impdecl" && atdecs) {
                throw new Error("Parse error: import declaration in statement block at line " + $2[i].pos.first_line);
            } else {
                atdecs = true;
                decs.push($2[i]);
            }
        }
        
        // add Prelude as an import if not explicitly imported
        var prelude_imported = false;
        for(i=0 ; i<imps.length ; i++){
      if( imps[i].modid == "Prelude" ){
          prelude_imported = true;
          break;
            }
        }
        if( ! prelude_imported ){
            imps.push({name: "impdecl", modid: new Lich.ModName("Prelude")});
        }

        $$ = {name: "body", impdecls: imps, topdecls: decs, pos:@$}; }}
  |   {{$$ = {name: "body", impdecls: [], topdecls: [], pos:@$}; }}
  ;
  
topdecls // : [topdecl]
  : topdecls_nonempty                 {{ $$ = $1; }}
  ;
  
topdecls_nonempty // : [topdecl]
  : topdecls_nonempty ";" topdecl     {{ $1.push($3); $$ = $1; }}
  | topdecl                           {{ $$ = [$1]; }}
  ;

////////////////////////////////////////////////////////////////////////////////
/* 4 Declarations and Bindings */

topdecl // : object
    : decl                          {{$$ = {name: "topdecl-decl", decl: $1, pos: @$};}}
    | DATA simpletype             {{$$ = {name: "topdecl-data", typ: $2, constrs: [], pos: @$};}}
    | DATA simpletype "=" constrs {{$$ = {name: "topdecl-data", typ: $2, constrs: $4, pos: @$};}}
    | impdecl                       {{$$ = $1;}}
    ;


decls // : [decl]
  //:                                      {{ $$ = []; }}
  : list_decl_comma_1                    {{ $$ = $1; }}
  // | error                                {{ $$ = []; }}
  //| list_decl_comma_1 error              {{ $$ = $1; }}
  ;

list_decl_comma_1 // : [decl]
  : list_decl_comma_1 ENDL decl       {{ ($1).push($3); $$ = $1; }}
  | decl                              {{ $$ = [$1]; }}
  ;

//decl // : object
//  : funlhs rhs          {{$$ = {name: "decl-fun", lhs: $1, rhs: $2, pos:@$};}}
    //| pat rhs
//  | gendecl
//  ;
decl // : object
  // : decl_fixity           {{$$ = $1;}}
  : var rhs           {{$$ = {name:"decl-fun", ident: $1, args: [], rhs: $2, pos: @$};}}
  | var apats rhs     {{$$ = {name:"decl-fun", ident: $1, args: $2, rhs: $3, pos: @$};}}
  | pat varop pat rhs {{$$ = {name:"decl-fun", ident: $2, args: [$1,$3], rhs: $4, pos: @$, orig: "infix"};}}
  | '(' pat varop pat ')' apats rhs
    {{$$ = {name:"decl-fun", ident: $3, args: [$2,$4].concat($6), rhs: $7, pos: @$, orig: "infix"};}}
  // | var "::" type           {{$$ = {name:"type-signature",vars:[$1],sig:$3,pos:@$};}}
  // | var "," vars "::" type  {{$$ = {name:"type-signature",vars:[$1].concat($3),sig:$5,pos:@$};}}
  ;

//funlhs // : object
//    : var apats       {{$$ = {name: "fun-lhs", ident: $1, args: $2, pos: @$};}}
//    | var             {{$$ = {name:"fun-lhs", ident: $1, args: [], pos: @$};}}
//  | pat varop pat
//    ;

rhs // : object
    : '=' exp                  {{$$ = $2;}}
    // | '=' exp WHERE decls    {{$$ = {name: "fun-where", exp: $2, decls: $4, pos: @$}; }}
    // | '=' exp ENDL WHERE decls    {{$$ = {name: "fun-where", exp: $2, decls: $5, pos: @$}; }}
    | '=' exp ENDL WHERE ENDL decls    {{$$ = {name: "fun-where", exp: $2, decls: $6, pos: @$}; }}
    ; //TODO

/*
decl_fixity // : type declaration | fixity
    : INFIXL literal op_list_1_comma  {{ $$ = {name: "fixity", fix: "leftfix", num: $2, ops: $3, pos: @$}; }}
    | INFIXR literal op_list_1_comma  {{ $$ = {name: "fixity", fix: "rightfix", num: $2, ops: $3, pos: @$}; }}
    | INFIXR literal op_list_1_comma   {{ $$ = {name: "fixity",  fix: "nonfix",num: $2, ops: $3, pos: @$}; }}
    ;

simpletype // : object
    : tycon         {{$$ = {name: "simpletype", tycon: $1, vars: [], pos: @$};}}
    | tycon tyvars  {{$$ = {name: "simpletype", tycon: $1, vars: $2, pos: @$};}}
    ;

constrs // : [constr]
    : constrs "|" constr        {{$1.push($3); $$ = $1;}}
    | constr                    {{$$ = [$1];}}
    ;

constr // : object
    : con
        {{$$ = {name: "constr", dacon: $1, types: [], pos: @$};}}
    | con atypes
        {{$$ = {name: "constr", dacon: $1, types: $2, pos: @$};}}
    ;

atypes // : [atype]
    : atypes atype      {{$1.push($2); $$ = $1;}}
    | atype             {{$$ = [$1];}}
    ;

*/

////////////////////////////////////////////////////////////////////////////////
// 5.2 Export Lists
/*
exports // : [export]
    : exports_inner         {{$$ = $1;}}
    | exports_inner ','     {{$$ = $1;}}
    ;

exports_inner // : [export]
    : exports_inner ',' export      {{$1.push($3); $$ = $1;}}
    | export                        {{$$ = [$1];}}
    ;

export // : object
    : qvar
        {{$$ = {name: "export-qvar", exp: $1, pos: @$};}}
    | MODULE modid 
        {{$$ = {name: "export-module", exp: $2, pos: @$};}}
    | qtycon
        {{$$ = {name: "export-type-unspec", exp: $1, pos: @$};}}
    | qtycon '(' ".." ')'
        {{$$ = {name: "export-type-all", exp: $1, pos: @$};}}
    | qtycon '(' list_cname_0_comma ')'
        {{$$ = {name: "export-type-vars", exp: $1, vars: $3, pos: @$};}}
    ; //TODO: export types and classes
*/
////////////////////////////////////////////////////////////////////////////////
// 5.3 Import Declarations

impdecl // : object
    : IMPORT modid
        {{$$ = {name: "impdecl", modid: $2, pos: @$};}}
    | IMPORT modid '(' imports ')'
        {{$$ = {name: "impdecl", modid: $2, hiding: false, imports: $4, pos: @$};}}
    | IMPORT modid HIDING '(' imports ')'
        {{$$ = {name: "impdecl", modid: $2, hiding: true, imports: $5, pos: @$};}}
    ; //TODO: qualified and renamed imports
/*
impspec // : object
    : '(' imports ')'
        {{$$ = {name: "impspec", imports: $2, pos: @$};}}
    | HIDING '(' imports ')'
        {{$$ = {name: "impspec-hiding", imports: $3, pos: @$};}}
    ;
*/
imports // : [import]
    : list_import_1_comma         {{$$ = $1;}}
    | list_import_1_comma ','     {{$$ = $1;}}
    | ','                         {{$$ = [];}}
    |                             {{$$ = [];}}
    ;

list_import_1_comma // : [import]
    : list_import_1_comma ',' import_a   {{$1.push($3); $$ = $1;}}
    | import_a                           {{$$ = [$1];}}
    ;

import_a // : object
    : var                              {{$$ = {name: "import-var", varname: $1, pos: @$};}}
    | tycon                            {{$$ = {name: "import-tycon", tycon: $1, all: false, pos: @$};}}
    | tycon '(' ".." ')'               {{$$ = {name: "import-tycon", tycon: $1, all: true, pos: @$};}}
    | tycon '(' list_cname_0_comma ')' {{$$ = {name: "import-tycon", tycon: $1, all: false, list:$3, pos: @$};}}
    ; //TODO: classes

////////////////////////////////////////////////////////////////////////////////
// 3 Expressions
/*
exps // : [exp]
  : exps ";" exp        {{ ($1).push($3); $$ = $1; }}
  | exp                              {{ $$ = [$1]; }}
  ;
*/
exp // : object
  // : infixexp "::" type          {{$$ = {name:"type-signature",exp:$1,sig:$3,pos:@$};}}
  // : infixexp %prec NOSIGNATURE  {{$$ = $1;}}
  : lexp {{$$ = $1;}}
  ;

/*
infixexp // : [lexp | qop | '-']
  : infixexpLR lexp     %prec INFIXEXP          {{
          ($1).push($2);
          if( ($1).length == 1 && ($1)[0].name=="infixexp" ){
                  $$ = ($1)[0];
          } else {
              $$ = {name:"infixexp",exps:$1,pos:@$};
          }
      }}
  ;

// : infixexpLR lexp qop           {{var t=($1).pop();($1).push($3,t,$2); $$ = $1;}} // Rewrite order for infix qop expression
infixexpLR // : [lexp | qop | '-']. re-written to be left recursive.
  // : infixexpLR lexp qop           {{($1).push($2,$3); $$ = $1;}}
  : infixexpLR lexp qop           {{var t=($1).pop();($1).push($3,t,$2); $$ = $1;}} // Rewrite order for infix qop expression
  | infixexpLR '-'                {{($1).push($2);    $$ = $2;}}
  |                               {{$$ = [];}}
  ;

*/

//  lexp OP infixexp            {{ ($3).unshift($1,$2); $$ = $3; }}
//  '-' infixexp                {{ ($2).shift($1);      $$ = $2; }}
//  lexp                        {{ $$ = [$1]; }}

lexp // : object
  : IF exp THEN exp ELSE exp        {{$$ = {name:"ite",e1:$2,e2:$4,e3:$6,pos:@$}; }}
  | fexp                            {{ $$ = ($1.length === 1) ? ($1[0]) : {name:"application", exps:$1,pos:@$}; }}
  | '\' apats "->" exp              {{$$ = {name:"lambda", args: $2, rhs: $4, pos: @$}; }}
  | CASE exp OF alts                {{$$ = {name:"case", exp: $2, alts: $4, pos: @$}; }}
  | LET decls IN exp                {{$$ = {name:"let", decls: $2, exp: $4, pos: @$}; }}
  | LET decl                        {{$$ = {name:"let-one", decl: $2, pos: @$}; }}
  ;

// list of 1 or more 'aexp' without separator
fexp // : [aexp]
  : aexp              {{$$ = [$1];}}
  | fexp aexp         {{($1).push($2); $$ = $1;}}
  ;

// list of 1 or more non-qualified variable names
vars // : [var]
    : vars ',' var                {{$1.push($3); $$ = $1;}}
    | var                         {{$$ = [$1];}}
    ;

////////////////////////////////////////////////////////////////////////////////
// Operators
/*
binop
  : "*"                         {return $1;}
  | "/"                         {return $1;}
  | "-"                         {return $1;}
  | "+"                         {return $1;}
  | "^"                         {return $1;}
  | "=="                        {return $1;}
  | "/="                        {return $1;}
  | ">"                         {return $1;}
  | ">="                        {return $1;}
  | "<"                         {return $1;}
  | "<="                        {return $1;}
  ;    
*/
////////////////////////////////////////////////////////////////////////////////
// case expression alternatives

// ';' separated list of 1 or more 'alt'
alts // : [alt]
    : alts alt          {{$1.push($2); $$ = $1;}}
    | alt               {{$$ = [$1];}}
    ;

alt // : object
    : pat "->" exp      {{$$ = {name:"alt", pat: $1, exp: $3};}}
    // TODO: incomplete
    ;

////////////////////////////////////////////////////////////////////////////////
// 3.2 Variables, Constructors, Operators, and Literals

list_cname_0_comma // : [cname]
    : list_cname_1_comma     {{$$ = $1;}}
    |                        {{$$ = [];}}
    ;
list_cname_1_comma // : [cname]
    : list_cname_1_comma ',' cname   {{$1.push($3); $$ = $1;}}
    | cname                          {{$$ = [$1];}}
    ;

// non-qualified variable name (record selector) or data constructor name
cname // : VarName | DaCon
    :  con        {{$$ = $1;}}
    // | var      {{$$ = $1;}}      // record selectors
    ;

aexp // : object
  : qvar                {{$$ = $1;}}
  | gcon                {{$$ = $1;}}
  | literal             {{$$ = $1;}}
  | "(" exp ")"         {{$$ = $2;}}
  | tuple               {{$$ = $1;}}
  | listexp             {{$$ = $1;}}
  // TODO: incomplete
  ;

tuple // : object
    : "(" exp "," list_exp_1_comma ")" {{$4.unshift($2); $$ = {name: "tuple", members: $4, pos: @$}; }}
    ;

listexp // : object
    : "[" list_exp_1_comma "]" {{ $$ = {name: "listexp", members: $2, pos: @$}; }}
    ;

list_exp_1_comma
    : list_exp_1_comma ',' exp   {{$1.push($3); $$ = $1; }}
    | exp                        {{$$ = [$1];}}
    ;

modid // : object # {conid .} conid
    : qconid              {{$$ = new Lich.ModName($1, @$, yy.lexer.previous.qual);}}
    | conid               {{$$ = new Lich.ModName($1, @$);}}
    ;

// optionally qualified binary operators in infix expressions
qop // : object
    : qvarop              {{$$ = {name: "qop", id: $1, pos: @$};}}
    | qconop              {{$$ = {name: "qop", id: $1, pos: @$};}}
    ;

op_list_1_comma // : [op]
    : op_list_1_comma "," op {{ $1.push($3); $$ = $1; }}
    | op                     {{ $$ = [$1]; }}
    ;

op // : object
    : varop {{ $$ = $1; }}
    | conop {{ $$ = $1; }}
    ;

conop // : object
    : consym                {{ $$ = new Lich.DaCon($1, @$, true); }}
    | '`' conid '`'         {{ $$ = new Lich.DaCon($2, @$, false); }}
    ;

// optionally qualified variable symbol or variable id as a symbol
qvarop // : object
    : qvarsym           {{$$ = new Lich.VarName($1, @$, true, yy.lexer.previous.qual);}}
    | varop             {{$$ = $1;}}
    | '`' qvarid '`'    {{$$ = new Lich.VarName($2, @$, false, yy.lexer.previous.qual);}}
    ;

qconop // : object
    : gconsym           {{$$ = $1;}}
    | '`' qconid '`'    {{$$ = new Lich.DaCon($2, @$, false, yy.lexer.previous.qual);}}
    ;

// non-qualified variable symbol or variable id as a symbol
varop // : object
    : varsym            {{$$ = new Lich.VarName($1, @$, true);}}
    | '`' varid '`'     {{$$ = new Lich.VarName($2, @$, false)}}
    ;

// list of 0 or more tyvars without separator
tyvars // : [TyVar]
    : tyvars tyvar          {{$1.push($2); $$ = $1;}}
    | tyvar                 {{$$ = [$1];}}
    ;

// type variable
tyvar // : Lich.TyVar
    : varid      {{$$ = new Lich.TyVar($1, @$);}}
    ;

// non-qualified type constructor id name
tycon // : Lich.TyCon
    : conid      {{$$ = new Lich.TyCon($1, @$);}}
    ;

// optionally qualified type constructor id name
qtycon // : Lich.TyCon
    : qconid     {{$$ = new Lich.TyCon($1, @$, yy.lexer.previous.qual);}}
    | tycon      {{$$ = $1;}}
    ;

// non-qualified data constructor id (or symbol in parentheses) name
con // : Lich.DaCon
    : conid              {{$$ = new Lich.DaCon($1, @$, false);}}
    | '(' consym ')'     {{$$ = new Lich.DaCon($2, @$, true);}}
    ;

// optionally qualified data constructor id (or symbol in parentheses) name
qcon // : Lich.DaCon
    : qconid           {{$$ = new Lich.DaCon($1, @$, false, yy.lexer.previous.qual);}}
    | '(' gconsym ')'  {{$$ = $2;}}
    | con              {{$$ = $1;}}
    ;

// optionally qualified data constructor, or a built-in data constructor
gcon // : object
    : "(" ")"               {{$$ = new Lich.UnitDaCon(@$);}}
    | "[" "]"               {{$$ = new Lich.NilDaCon(@$);}}
    | "(" list_1_comma ")"  {{$$ = new Lich.TupleDaCon($2 + 1, @$);}}
    | qcon                  {{$$ = $1;}}
    ;

list_1_comma // : integer
    : ","                {{$$ = 1;}}
    | list_1_comma ","   {{$$ = $1 + 1;}}
    ;

// non-qualified variable id (or symbol in parentheses) name
var // : Lich.VarName
    : varid           {{$$ = new Lich.VarName($1, @$, false);}}
    | '(' varsym ')'  {{$$ = new Lich.VarName($2, @$, true);}}
    ;

// optionally qualified variable id (or symbol in parentheses) name
qvar // : Lich.VarName
    : qvarid          {{$$ = new Lich.VarName($1, @$, false, yy.lexer.previous.qual);}}
    | '(' qvarsym ')' {{$$ = new Lich.VarName($2, @$, true, yy.lexer.previous.qual);}}
    | var             {{$$ = $1;}}
    ;

gconsym // : object
    : ':'           {{$$ = new Lich.ConsDaCon(@$);}}
    | qconsym       {{$$ = new Lich.DaCon($1, @$, true, yy.lexer.previous.qual);}}
    ;

////////////////////////////////////////////////////////////////////////////////
// 4.1.2 Syntax of Types

atype // : object
    : gtycon                {{$$ = $1;}}
    | tyvar                 {{$$ = $1;}}
    | "(" type ")"          {{$$ = $2;}}
    // TODO: incomplete
    ;

type // : object
    : apptype               {{$$ = $1;}}
    | apptype "->" type     {{$$ = new Lich.FunType([$1,$3],@$);}}
    ;

apptype // : object
    : apptype atype     {{$$ = new Lich.AppType($1,$2,@$);}}
                        //{{$1.push($2); $$ = $1;}}
    | atype             {{$$ = $1;}}
                        //{{$$ = [$1];}}
    ;

// optionally qualified type constructor, or a built-in type constructor
gtycon // : object
    : qtycon            {{$$ = $1;}}
    // TODO: incomplete
    ;

////////////////////////////////////////////////////////////////////////////////
// 3.17 Pattern Matching

pat // : object
    : lpat             {{$$ = $1;}}
    // TODO: incomplete
    ;

lpat // : object
    : apat          {{$$ = $1;}}
    | gcon apats    {{$$ = {name: "conpat", con: $1, pats: $2}; }}
    // TODO: incomplete
    ;

// list of 1 or more apat without separator
apats // : [apat]
    : apat              {{$$ = [$1];}}
    | apats apat        {{$1.push($2); $$ = $1;}}
    ;

apat // : object
    : var               {{$$ = $1; }}
    | gcon              {{$$ = $1; }}
    | literal           {{$$ = $1; }}
    | '_'               {{$$ = {name:"wildcard", pos: @$}; }}
    | tuple_pat         {{$$ = $1; }}
    | "(" pat ")"       {{$$ = $2; }}
    ;

tuple_pat // object
    :  "(" pat "," pat_list_1_comma ")" {{$4.unshift($2); $$ = {name: "tuple_pat", members: $4, pos: @$}; }}
    ;
    
pat_list_1_comma // : [pat]
    : pat_list_1_comma "," pat      {{$1.push($3); $$ = $1; }}
    | pat                           {{$$ = [$1]; }}
    ;

////////////////////////////////////////////////////////////////////////////////
// Literals

literal  // : object
    : integer {{$$ = {name: "integer-lit", value: Number($1), pos: @$};}}
    | string {{$$ = {name: "string-lit", value: yytext, pos: @$};}}
    | char {{$$ = {name: "char-lit", value: $1, pos: @$};}}
    | float {{$$ = {name: "float-lit", value: Number($1), pos: @$};}}
    | NUMBER {{$$ = {name: "number", value: Number($1)}; }}
    | FALSE {{$$ = {name: "boolean-lit", value: false}; }}
    | TRUE {{$$ = {name: "boolean-lit", value: true}; }}
    ;

////////////////////////////////////////////////////////////////////////////////


/*
varsym = !(reservedop / dashes / escape / ":") s:(symbol)+ {return s.join("")}
consym = !reservedop s:(":"symbol*) {return flatten(s).join("")}
// Took out !escapestuff from the "\\" entry to allow for correct lamba parsing like (\acc x -> acc ++ [x])
reservedop = op:( ".." / "::" / ":" / "=>" / "=" !"="  / "\\" / "|" !"|" / "<-" / "->" / "@" / "~" ) !(varsym / consym) {return {val: (op instanceof Array)? op.join(""): op, typ: (op instanceof Array)? op.join(""): op}}

qvarid = qs:(conid ".")+ ref:((!"." varid) !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qvarid", qual: qs.substr(0,qs.length-1)}}
qconid = qs:(conid ".")+ ref:((!"." conid) !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qconid", qual: qs.substr(0,qs.length-1)}}
qvarsym = qs:(conid ".")+ ref:(varsym !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qvarsym", qual: qs.substr(0,qs.length-1)}}
qconsym = qs:(conid ".")+ ref:((!"." consym) !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qconsym", qual: qs.substr(0,qs.length-1)}}

varid_e = !"." v:varid !"." {return {val: v, typ: "varid"}}
conid_e = !"." c:conid !"." {return {val: c, typ: "conid"}}
varsym_e = v:varsym !"."    {return {val: v, typ: "varsym"}}
consym_e = !"." c:consym !"." {return {val: c, typ: "consym"}}
*/