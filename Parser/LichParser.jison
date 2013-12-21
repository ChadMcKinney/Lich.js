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

/* lexical grammar */
%lex
%%

/*
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
*/


"--".*|"{-".*"-}"       {/* skip whitespace and comments */}
\s+                         return {val:yytext};
("-")?[0-9]+("."[0-9]+)?    return {val:yytext,typ:"float"};
"["                         return {val:"[",typ:"["};
"]"                         return {val:"]",typ:"]"};
"{"                         return {val:"{",typ:"{"};
"}"                         return {val:"}",typ:"}"};
"False"|"false"             return {val:"false",typ:"False"};
"True"|"true"               return {val:"true",typ:"True"};
"=>"                        return {val:"=>",typ:"=>"};
"->"                        return {val:"->",typ:"->"};
"=="                        return {val:"==",typ:"=="};
"/="                        return {val:"/=",typ:"/="};
">="                        return {val:">=",typ:">="};
"<="                        return {val:"<=",typ:"<="};
">"                         return {val:">",typ:">"};
"<"                         return {val:"<",typ:"<"};
"()"                        return {val:"()",typ:"()"};
"("                         return {val:"(",typ:"("};
")"                         return {val:")",typ:")"};
"*"                         return {val:"*",typ:"*"};
"/"                         return {val:"/",typ:"/"};
"-"                         return {val:"-",typ:"-"};
"++"                        return {val:"++",typ:"++"};
"+"                         return {val:"+",typ:"+"};
"^"                         return {val:"^",typ:"^"};
"="                         return {val:"=",typ:"="};
"_"                         return {val:"_",typ:"_"};
"%"                         return {val:"%",typ:"%"};  
"!!"                        return {val:"!!",typ:"!!"};
"!"                         return {val:"!",typ:"!"};
"#"                         return {val:"#",typ:"#"};
"$"                         return {val:"$",typ:"$"};
"&"                         return {val:"&",typ:"&"};
".."                         return {val:"..",typ:".."};
"."                         return {val:".",typ:"."};
"@"                         return {val:"@",typ:"@"};
"\\"                        return {val:"\\",typ:"\\"};      
"|"                         return {val:"|",typ:"|"};
"~"                         return {val:"~",typ:"~"};
"::"                        return {val:"::",typ:"::"};
":"                         return {val:":",typ:":"};
","                         return {val:",",typ:","};
"`"                         return {val:"`",typ:"`"};
<<EOF>>                     return {val:"EOF",typ:"EOF"};
"where"                     return {val:"where",typ:"where"};
"if"                        return {val:"if",typ:"if"};
"then"                      return {val:"then",typ:"then"};
"else"                      return {val:"else",typ:"else"};
"let"                       return {val:"let",typ:"let"};
"hiding"                    return {val:"hiding",typ:"hiding"};
"case"                      return {val:"case",typ:"case"};
"class"                     return {val:"class",typ:"class"};
"data"                      return {val:"data",typ:"data"};
"default"                   return {val:"default",typ:"default"};
"deriving"                  return {val:"deriving",typ:"deriving"};
"do"                        return {val:"do",typ:"do"};
"foreign"                   return {val:"foreign",typ:"foreign"};
"import"                    return {val:"import",typ:"import"};
"infixl"                    return {val:"infixl",typ:"infixl"};
"instance"                  return {val:"instance",typ:"instance"};
"in"                        return {val:"in",typ:"in"};
"module"                    return {val:"module",typ:"module"};
"newtype"                   return {val:"newtype",typ:"newtype"};
"of"                        return {val:"of",typ:"of"};
"type"                      return {val:"type",typ:"type"};
"Nothing"                   return {val:"Nothing",typ:"Nothing"};
[a-z][A-Za-z0-9_]*          return {val:yytext,typ:"varid"};
[A-Z][A-Za-z0-9_]*          return {val:yytext,typ:"conid"};
\"([^\"])*\"                return {val:yytext,typ:"string"};
\'(!\')?\'                  return {val:yytext,typ:"char"};
["!""#""$""&"".""<"">""=""?""@""\\""|""~"]+     return {val:yytext,typ:"varsym"};
":"["!""#""$""&"".""<"">""=""?""@""\\""|""~"]*  return {val:yytext,typ:"consym"};
[[A-Z][A-Za-z0-9_]*"."]+[a-z][A-Za-z0-9_]*      return {val:yytext,typ:"qvarid"};
[[A-Z][A-Za-z0-9_]*"."]+[A-Z][A-Za-z0-9_]*      return {val:yytext,typ:"qconid"};
[[A-Z][A-Za-z0-9_]*"."]+["!""#""$""&"<"">""=""?""@""\\""|""~"]+ return {val:yytext,typ:"qvarsym"};
[[A-Z][A-Za-z0-9_]*"."]+":"["!""#""$""&"<"">""=""?""@""\\""|""~"]+ return {val:yytext,typ:"qconsym"};

/*
qvarid = qs:(conid ".")+ ref:((!"." varid) !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qvarid", qual: qs.substr(0,qs.length-1)}}
qconid = qs:(conid ".")+ ref:((!"." conid) !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qconid", qual: qs.substr(0,qs.length-1)}}
qvarsym = qs:(conid ".")+ ref:(varsym !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qvarsym", qual: qs.substr(0,qs.length-1)}}
qconsym = qs:(conid ".")+ ref:((!"." consym) !".") {qs = flatten(qs).join(""); return {val: flatten([qs, ref[0]]).join(""), typ: "qconsym", qual: qs.substr(0,qs.length-1)
*/

/lex

/* operator associations and precedence */

// %nonassoc '='
%left '+' '-' '%'
%left '*' '/'
%left '^'
%left '++'
//%left '==' '>' '<' 
//%left '/=' '>=' '<='
//%left UMINUS
%right ':'


%start start_
//%error-verbose
//%debug
%% /* language grammar */

start_
    : "†" exp "‡" EOF         { return $2; }
    // : module_ EOF          { return $1; }
    ;


////////////////////////////////////////////////////////////////////////////////
// 5.1 Module Structure

module_ // : object
  : "module" modid "where" body
       {{$$ = {astType: "module", modid: $2, body: $4, pos: @$}; }}
  | "module" modid '(' exports ')' "where" body
       {{$$ = {astType: "module", modid: $2, exports: $4, body: $7, pos: @$}; }}
  | body
      {{$$ = {astType: "module", modid: new Lich.ModName("Main"), body: $1, pos:@$}; }}
         // no modid since missing. defaults to 'Main'.
         // no exports since missing. everything exported.
  ;

// To avoid a lookahead > 1, we allow parsing of intermingled imports and other
// top-level declarations, but perform a post-check that enforces that there are
// no imports after the first other declaration.  
body // : object
  : "†" topdecls "‡"    
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
            imps.push({astType: "impdecl", modid: new Lich.ModName("Prelude")});
        }

        $$ = {astType: "body", impdecls: imps, topdecls: decs, pos:@$}; }}
  |   {{$$ = {astType: "body", impdecls: [], topdecls: [], pos:@$}; }}
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
    : decl                          {{$$ = {astType: "topdecl-decl", decl: $1, pos: @$};}}
    | impdecl                       {{$$ = $1;}}
    ;


decls // : [decl]
  : "†" "‡"                           {{ $$ = []; }}
  | "†" list_decl_comma_1 "‡"         {{ $$ = $2; }}
  | "†" error "‡"                        {{ $$ = []; }}
  | "†" list_decl_comma_1 error "‡"      {{ $$ = $2; }}
  ;

list_decl_comma_1 // : [decl]
  : list_decl_comma_1 ";" decl        {{ ($1).push($3); $$ = $1; }}
  | decl                              {{ $$ = [$1]; }}
  ;

//decl // : object
//  : funlhs rhs          {{$$ = {astType: "decl-fun", lhs: $1, rhs: $2, pos:@$};}}
    //| pat rhs
//  | gendecl
//  ;
decl // : object
  : decl_fixity           {{$$ = $1;}}
  | var rhs           {{$$ = {astType:"decl-fun", ident: $1, args: [], rhs: $2, pos: @$};}}
  | var apats rhs     {{$$ = {astType:"decl-fun", ident: $1, args: $2, rhs: $3, pos: @$};}}
  | pat varop pat rhs {{$$ = {astType:"decl-fun", ident: $2, args: [$1,$3], rhs: $4, pos: @$, orig: "infix"};}}
  | '(' pat varop pat ')' apats rhs
    {{$$ = {astType:"decl-fun", ident: $3, args: [$2,$4].concat($6), rhs: $7, pos: @$, orig: "infix"};}}
  ;

//funlhs // : object
//    : var apats       {{$$ = {astType: "fun-lhs", ident: $1, args: $2, pos: @$};}}
//    | var             {{$$ = {astType:"fun-lhs", ident: $1, args: [], pos: @$};}}
//  | pat varop pat
//    ;

rhs // : object
    : '=' exp                  {{$$ = $2;}}
    | '=' exp "where" decls    {{$$ = {astType: "fun-where", exp: $2, decls: $4, pos: @$}; }}
    ; //TODO

decl_fixity // : type declaration | fixity
    : "infixl" literal op_list_1_comma  {{ $$ = {astType: "fixity", fix: "leftfix", num: $2, ops: $3, pos: @$}; }}
    | "infixr" literal op_list_1_comma  {{ $$ = {astType: "fixity", fix: "rightfix", num: $2, ops: $3, pos: @$}; }}
    | "infix" literal op_list_1_comma   {{ $$ = {astType: "fixity",  fix: "nonfix",num: $2, ops: $3, pos: @$}; }}
    ;

////////////////////////////////////////////////////////////////////////////////
// 5.2 Export Lists

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
        {{$$ = {astType: "export-qvar", exp: $1, pos: @$};}}
    | "module" modid 
        {{$$ = {astType: "export-module", exp: $2, pos: @$};}}
    | qtycon
        {{$$ = {astType: "export-type-unspec", exp: $1, pos: @$};}}
    | qtycon '(' ".." ')'
        {{$$ = {astType: "export-type-all", exp: $1, pos: @$};}}
    | qtycon '(' list_cname_0_comma ')'
        {{$$ = {astType: "export-type-vars", exp: $1, vars: $3, pos: @$};}}
    ; //TODO: export types and classes

////////////////////////////////////////////////////////////////////////////////
// 5.3 Import Declarations

impdecl // : object
    : "import" modid
        {{$$ = {astType: "impdecl", modid: $2, pos: @$};}}
    | "import" modid '(' imports ')'
        {{$$ = {astType: "impdecl", modid: $2, hiding: false, imports: $4, pos: @$};}}
    | "import" modid "hiding" '(' imports ')'
        {{$$ = {astType: "impdecl", modid: $2, hiding: true, imports: $5, pos: @$};}}
    ; //TODO: qualified and renamed imports
/*
impspec // : object
    : '(' imports ')'
        {{$$ = {astType: "impspec", imports: $2, pos: @$};}}
    | "hiding" '(' imports ')'
        {{$$ = {astType: "impspec-hiding", imports: $3, pos: @$};}}
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
    : var                              {{$$ = {astType: "import-var", varastType: $1, pos: @$};}}
    | tycon                            {{$$ = {astType: "import-tycon", tycon: $1, all: false, pos: @$};}}
    | tycon '(' ".." ')'               {{$$ = {astType: "import-tycon", tycon: $1, all: true, pos: @$};}}
    | tycon '(' list_cname_0_comma ')' {{$$ = {astType: "import-tycon", tycon: $1, all: false, list:$3, pos: @$};}}
    ; //TODO: classes

////////////////////////////////////////////////////////////////////////////////
// 3 Expressions

exps // : [exp]
  : exps ";" exp        {{ ($1).push($3); $$ = $1; }}
  | exp                 {{ $$ = [$1]; }}
  ;

exp // : object
  // : infixexp %prec NOSIGNATURE  {{$$ = $1;}}
  : lexp          {{$$ = $1}}
  | exp "+" exp         {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "-" exp         {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "*" exp         {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "/" exp         {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "^" exp         {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "%" exp         {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "==" exp        {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "/=" exp        {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp ">" exp         {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "<" exp         {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp ">=" exp        {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "<=" exp        {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "!!" exp        {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp ":" exp         {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "++" exp        {{$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "::" varid      {{$$ = {astType:"data-lookup",data:$1,member:$3,pos:@$};}}
  | "[" "]"             {{ $$ = {astType: "listexp", members: [], pos: @$}; }}
  | dataexp             {{$$ = $1;}}
  | datainst            {{$$ = $1;}}
  | dataupdate          {{$$ = $1;}}
  | "Nothing"           {{$$ = {astType: "Nothing"};}}
  ;

/*
infixexp // : [lexp | qop | '-']
  : infixexpLR lexp     %prec INFIXEXP          {{
          ($1).push($2);
          if( ($1).length == 1 && ($1)[0].name=="infixexp" ){
                  $$ = ($1)[0];
          } else {
              $$ = {astType:"infixexp",exps:$1,pos:@$};
          }
      }}
  ;

infixexpLR // : [lexp | qop | '-']. re-written to be left recursive.
  : infixexpLR lexp qop           {{($1).push($2,$3); $$ = $1;}}
  | infixexpLR '-'                {{($1).push($2);    $$ = $2;}}
  |                               {{$$ = [];}}
  ;
*/


//  lexp OP infixexp            {{ ($3).unshift($1,$2); $$ = $3; }}
//  '-' infixexp                {{ ($2).shift($1);      $$ = $2; }}
//  lexp                        {{ $$ = [$1]; }}

lexp // : object
  : "if" exp "then" exp "else" exp  {{$$ = {astType:"ite",e1:$2,e2:$4,e3:$6,pos:@$}; }}
  | fexp                            {{ $$ = ($1.length === 1) ? ($1[0]) : {astType:"application", exps:$1,pos:@$}; }}
  | '\' apats "->" exp              {{$$ = {astType:"lambda", args: $2, rhs: $4, pos: @$}; }}
  | "case" exp "of" "†" alts "‡"    {{$$ = {astType:"case", exp: $2, alts: $5, pos: @$}; }}
  | "let" decls "in" exp            {{$$ = {astType:"let", decls: $2, exp: $4, pos: @$}; }}
  | "let" decl                      {{$$ = {astType:"let-one", decl: $2, pos: @$}; }}
  | exp qop lexp                    {{$$ = {astType:"binop-exp",op:($2).id.id,lhs:$1,rhs:$3,pos:@$};}}
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
// case expression alternatives

// ';' separated list of 1 or more 'alt'
alts // : [alt]
    : alts ";" alt      {{$1.push($3); $$ = $1;}}
    | alt               {{$$ = [$1];}}
    ;

alt // : object
    : pat "->" exp      {{$$ = {astType:"alt", pat: $1, exp: $3};}}
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
  : qvar                    {{$$ = $1;}}
  | gcon                    {{$$ = $1;}}
  | literal                 {{$$ = $1;}}
  | "(" exp ")"             {{$$ = $2;}}
  | '(' '-' exp ')'         {{$$ = {astType:"negate",rhs:$3};}}
  | dictexp                 {{$$ = $1;}}
  | tuple                   {{$$ = $1;}}
  | listexp                 {{$$ = $1;}}
  | "(" "+" aexp ")"        {{ $$ = {astType:"application", exps:[new Lich.VarName($2, @$, true, yy.lexer.previous.qual),$3],pos:@$};}}
  | "(" "*" aexp ")"        {{ $$ = {astType:"application", exps:[new Lich.VarName($2, @$, true, yy.lexer.previous.qual),$3],pos:@$};}}
  | "(" "/" aexp ")"        {{ $$ = {astType:"application", exps:[new Lich.VarName("/R", @$, true, yy.lexer.previous.qual),$3],pos:@$};}}
  | "(" "^" aexp ")"        {{ $$ = {astType:"application", exps:[new Lich.VarName("^R", @$, true, yy.lexer.previous.qual),$3],pos:@$};}}
  | "(" "==" aexp ")"       {{ $$ = {astType:"application", exps:[new Lich.VarName("==", @$, true, yy.lexer.previous.qual),$3],pos:@$};}}
  | "(" "/=" aexp ")"       {{ $$ = {astType:"application", exps:[new Lich.VarName("/=", @$, true, yy.lexer.previous.qual),$3],pos:@$};}}
  | "(" ">" aexp ")"        {{ $$ = {astType:"application", exps:[new Lich.VarName(">R", @$, true, yy.lexer.previous.qual),$3],pos:@$};}}
  | "(" ">=" aexp ")"       {{ $$ = {astType:"application", exps:[new Lich.VarName(">=R", @$, true, yy.lexer.previous.qual),$3],pos:@$};}}
  | "(" "<" aexp ")"        {{ $$ = {astType:"application", exps:[new Lich.VarName("<R", @$, true, yy.lexer.previous.qual),$3],pos:@$};}}
  | "(" "<=" aexp ")"       {{ $$ = {astType:"application", exps:[new Lich.VarName("<=R", @$, true, yy.lexer.previous.qual),$3],pos:@$};}}
  | "(" "+" ")"             {{ $$ = new Lich.VarName($2, @$, true, yy.lexer.previous.qual);}}
  | "(" "-" ")"             {{ $$ = new Lich.VarName($2, @$, true, yy.lexer.previous.qual);}}
  | "(" "*" ")"             {{ $$ = new Lich.VarName($2, @$, true, yy.lexer.previous.qual);}}
  | "(" "/" ")"             {{ $$ = new Lich.VarName($2, @$, true, yy.lexer.previous.qual);}}
  | "(" "^" ")"             {{ $$ = new Lich.VarName($2, @$, true, yy.lexer.previous.qual);}}
  | "(" "==" ")"            {{ $$ = new Lich.VarName($2, @$, true, yy.lexer.previous.qual);}}
  | "(" "/=" ")"            {{ $$ = new Lich.VarName($2, @$, true, yy.lexer.previous.qual);}}
  | "(" ">" ")"             {{ $$ = new Lich.VarName($2, @$, true, yy.lexer.previous.qual);}}
  | "(" "<" ")"             {{ $$ = new Lich.VarName($2, @$, true, yy.lexer.previous.qual);}}
  | "(" ">=" ")"            {{ $$ = new Lich.VarName($2, @$, true, yy.lexer.previous.qual);}}
  | "(" "<=" ")"            {{ $$ = new Lich.VarName($2, @$, true, yy.lexer.previous.qual);}}
  ;

dictexp
  : "(" dictexp_1_comma ")"    {{$$ = {astType:"dictionary", pairs:$2};}}
  | "()"                       {{$$ = {astType:"dictionary", pairs:[]};}}
  ;

dictexp_1_comma
  : dictexp_1_comma "," dictpair           {{$$ = $1.concat($3);}}
  | dictpair                               {{$$ = $1;}}
  ;

dictpair
  : exp "=>" exp               {{$$ = [$1,$3];}}
  ;

dataexp
  : data conid "{" datamems "}"       {{$$ = {astType:"data-decl", id: $2, members: $4};}}
  | data conid "{" datamems ";" "}"   {{$$ = {astType:"data-decl", id: $2, members: $4};}}
  ;

dataupdate
  : exp "{" datamems "}"            {{$$ = {astType:"data-update", data: $1, members: $3};}}
  ;

datamems
  : datamems "," datamem            {{($1).push($3); $$ = $1;}}
  | datamem                         {{$$ = [$1];}}
  ;

datamem
  : varid "=" exp                   {{$$ = {astType:"data-mem",id:$1, exp:$3};}}  
  ;


datainst
  : conid fexp                      {{$$ = {astType:"data-inst", id: $1, members: $2};}}
  | conid                           {{$$ = {astType:"data-inst", id: $1, members: []};}}
  ;

/* Lists are basically better tuples in our dynamically typed language
tuple // : object
    : "(" exp "," list_exp_1_comma ")" {{$4.unshift($2); $$ = {astType: "tuple", members: $4, pos: @$}; }}
    ;
*/

listexp // : object
    : "[" list_exp_1_comma "]" {{ $$ = {astType: "listexp", members: $2, pos: @$}; }}
    | "(" exp ".." exp ")"         {{ $$ = {astType: "listrange", lower: $2, upper: $4, pos: @$}; }}
    | "(" exp "," exp ".." exp ")" {{ $$ = {astType: "listrange", lower: $2, upper: $6, skip: $4, pos: @$}; }}
    ;

list_exp_1_comma
    : list_exp_1_comma ',' exp   {{$1.push($3); $$ = $1; }}
    | exp                        {{$$ = [$1];}}
    ;

/*
modid // : object # {conid .} conid
    : qconid              {{$$ = new Lich.ModName($1, @$, yy.lexer.previous.qual);}}
    | conid               {{$$ = new Lich.ModName($1, @$);}}
    ;*/

// optionally qualified binary operators in infix expressions
qop // : object
    : qvarop              {{$$ = {astType: "qop", id: $1, pos: @$};}}
    | qconop              {{$$ = {astType: "qop", id: $1, pos: @$};}}
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

// non-qualified data constructor id (or symbol in parentheses) name
con // : Lich.DaCon
    //: conid              {{$$ = new Lich.DaCon($1, @$, false);}}
    : '(' consym ')'     {{$$ = new Lich.DaCon($2, @$, true);}}
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
    //: ':'           {{$$ = new Lich.ConsDaCon(@$);}}
    : qconsym       {{$$ = new Lich.DaCon($1, @$, true, yy.lexer.previous.qual);}}
    ;

////////////////////////////////////////////////////////////////////////////////
// 3.17 Pattern Matching

pat // : object
    : lpat             {{$$ = $1;}}
    // TODO: incomplete
    ;

lpat // : object
    : apat          {{$$ = $1;}}
    | gcon apats    {{$$ = {astType: "conpat", con: $1, pats: $2}; }}
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
    | '_'               {{$$ = {astType:"wildcard", pos: @$}; }}
    | tuple_pat         {{$$ = $1; }}
    | "(" pat ")"       {{$$ = $2; }}
    ;

tuple_pat // object
    :  "(" pat "," pat_list_1_comma ")" {{$4.unshift($2); $$ = {astType: "tuple_pat", members: $4, pos: @$}; }}
    ;
    
pat_list_1_comma // : [pat]
    : pat_list_1_comma "," pat      {{$1.push($3); $$ = $1; }}
    | pat                           {{$$ = [$1]; }}
    ;

////////////////////////////////////////////////////////////////////////////////
// Literals

literal  // : object
    : integer {{$$ = {astType: "integer-lit", value: Number($1), pos: @$};}}
    | string {{$$ = {astType: "string-lit", value: $1, pos: @$};}}
    | char {{$$ = {astType: "char-lit", value: $1, pos: @$};}}
    | float {{$$ = {astType: "float-lit", value: Number($1), pos: @$};}}
    | True {{$$ = {astType: "boolean-lit", value: true, pos: @$};}}
    | False {{$$ = {astType: "boolean-lit", value: false, pos: @$};}}
    ;

////////////////////////////////////////////////////////////////////////////////
