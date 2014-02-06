/*  
    Grammar specification for Lich. This is a greatly modified version of the parser found in the JSHC project, reworked for Lich.
    Thank you JSHC for all the hardwork! You can find more about the project here:
    https://github.com/evilcandybag/JSHC

*/

/* lexical grammar */
%lex

%x comment

%%

"{-"                        this.begin('comment');
<comment>"-}"               this.begin('INITIAL');
<comment>[^\n]+             {}// eat comment in chunks
<comment>\n                 yylineno++;
"--".*                      {/* skip whitespace and comments */}
\s+                         return {val:yytext};
("-")?[0-9]+("."[0-9]+)?      return {val:yytext,typ:"float"};
"::"                        return {val:"::",typ:"::"};
"[]"                        return {val:"[]",typ:"[]"};
"["                         return {val:"[",typ:"["};
"]"                         return {val:"]",typ:"]"};
"{"                         return {val:"{",typ:"{"};
"}"                         return {val:"}",typ:"}"};
"False"|"false"             return {val:"false",typ:"False"};
"True"|"true"               return {val:"true",typ:"True"};
"&&"                        return {val:"&&",typ:"&&"};
"||"                        return {val:"||",typ:"||"};
":>>"                       return {val:":>>",typ:":>>"};
"<<:"                       return {val:"<<:",typ:"<<:"};
"=>"                        return {val:"=>",typ:"=>"};
"->"                        return {val:"->",typ:"->"};
"+>"                        return {val:"+>",typ:"+>"};
"~>"                        return {val:"~>",typ:"~>"};
"=="                        return {val:"==",typ:"=="};
"/="                        return {val:"/=",typ:"/="};
">="                        return {val:">=",typ:">="};
"<="                        return {val:"<=",typ:"<="};
">>="                       return {val:">>=",typ:">>="};
">>"                        return {val:">>",typ:">>"};
"=<<"                       return {val:"=<<",typ:"=<<"};
"<<"                        return {val:"<<",typ:"<<"};
"<-"                        return {val:"<-",typ:"<-"};
">"                         return {val:">",typ:">"};
"<"                         return {val:"<",typ:"<"};
"()"                        return {val:"()",typ:"()"};
"("                         return {val:"(",typ:"("};
")"                         return {val:")",typ:")"};
"*"                         return {val:"*",typ:"*"};
"\\"                        return {val:"\\",typ:"\\"};
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
"$"                         return {val:"$",typ:"$"};
"&"                         return {val:"&",typ:"&"};
","                         return {val:",",typ:","};
".."                        return {val:"..",typ:".."};
"."                         return {val:".",typ:"."};
"@"                         return {val:"@",typ:"@"};   
"|"                         return {val:"|",typ:"|"};
"~"                         return {val:"~",typ:"~"};
":"                         return {val:":",typ:":"};
"`"                         return {val:"`",typ:"`"};
"?"                         return {val:"?",typ:"?"};
";"                         return {val:";",typ:";"}; 
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
"importjs"                  return {val:"importjs",typ:"importjs"};
"infixl"                    return {val:"infixl",typ:"infixl"};
"instance"                  return {val:"instance",typ:"instance"};
"in"                        return {val:"in",typ:"in"};
"module"                    return {val:"module",typ:"module"};
"newtype"                   return {val:"newtype",typ:"newtype"};
"of"                        return {val:"of",typ:"of"};
"type"                      return {val:"type",typ:"type"};
"Nothing"                   return {val:"Nothing",typ:"Nothing"};
"receive"                   return {val:"receive",typ:"receive"};
"otherwise"                 return {val:"otherwise",typ:"otherwise"};
[a-z][A-Za-z0-9_]*          return {val:yytext,typ:"varid"};
[A-Z][A-Za-z0-9_]*          return {val:yytext,typ:"conid"};
\"([^\"])*\"                return {val:yytext,typ:"string-lit"};
"#"([^"#"\s+])*             return {val:"\""+yytext.slice(1,yytext.length)+"\"", typ:"string-lit"};
\'(!\')?\'                  return {val:yytext,typ:"char"};
["!""#""$""&"".""<"">""=""?""@""\\""|""~"]+        return {val:yytext,typ:"varsym"};
":"["!""#""$""&"".""<"">""=""?""@""\\""|""~"]*  return {val:yytext,typ:"consym"};
[[A-Z][A-Za-z0-9_]*"."]+[a-z][A-Za-z0-9_]*      return {val:yytext,typ:"qvarid"};
[[A-Z][A-Za-z0-9_]*"."]+[A-Z][A-Za-z0-9_]*      return {val:yytext,typ:"qconid"};
[[A-Z][A-Za-z0-9_]*"."]+["!""#""$""&"<"">""=""?""@""\\""|""~"]+ return {val:yytext,typ:"qvarsym"};
[[A-Z][A-Za-z0-9_]*"."]+":"["!""#""$""&"<"">""=""?""@""\\""|""~"]+ return {val:yytext,typ:"qconsym"};


/lex

/* operator associations and precedence */

// 0
%right '='

// 1
%right '$' '<<'
%left ',' '..'

// 2
%left '>>'

// 3
%right '||'

// 4
%right '&&'

// 5
%left '==' '/=' '<' '<=' '>' '>='

// 6
%right ':' '++'

// 7
%left '+' '-'

// 8
%left '*' '/' '%'

// 9
%left '^' 

// 10
%right '.'
%left '::' '!!'


%start start_
%error-verbose
//%debug
%% /* language grammar */

start_
    : topexps EOF      { return $1; }
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
  // | body "‡"    {{$$ = $1;}}
  |   {{$$ = {astType: "body", impdecls: [], topdecls: [], pos:@$}; }}
  ;
  
topdecls // : [topdecl]
  : topdecls_nonempty                 {{ $$ = $1; }}
  ;
  
topdecls_nonempty // : [topdecl]
  : topdecls_nonempty ";" topdecl             {{ $1.push($3); $$ = $1; }}
  | topdecl                                   {{ $$ = [$1]; }}
  ;

////////////////////////////////////////////////////////////////////////////////
/* 4 Declarations and Bindings */

topdecl // : object
    : decl                    {{$$ = {astType: "topdecl-decl", decl: $1, pos: @$};}}
    | impdecl                       {{$$ = $1;}}
    | dataexp                       {{$$ = $1;}}
    //| synthDef                      {{$$ = $1;}}
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
  //: decl_fixity           {{$$ = $1;}}
  : var rhs           {{$$ = {astType:"decl-fun", ident: $1, args: [], rhs: $2, pos: @$};}}
  | var apats rhs     {{$$ = {astType:"decl-fun", ident: $1, args: $2, rhs: $3, pos: @$};}}
  | pat varop pat rhs {{$$ = {astType:"decl-fun", ident: $2, args: [$1,$3], rhs: $4, pos: @$, orig: "infix"};}}
  | '(' pat varop pat ')' apats rhs
    {{$$ = {astType:"decl-fun", ident: $3, args: [$2,$4].concat($6), rhs: $7, pos: @$, orig: "infix"};}}
  | guardexp                        {{$$ = $1;}}
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
    | "importjs" string-lit {{$$ = {astType: "impjs", modid: $2, hiding: false, imports: $2, pos: @$};}}
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

topexp
  //: "let" decl          {{$$ = {astType:"let-one", decl: $2, pos: @$}; }}
  : exp                 {{$$ = {astType:"top-exp", exp:$1};}}
  | dataexp             {{$$ = $1;}}
  | letdecl             {{$$ = $1;}}
  | impdecl             {{$$ = $1;}}
  | percStream          {{$$ = $1;}}
  | soloStream          {{$$ = $1;}}
  | "let" synthDef      {{$$ = $2;}}
  ;

topexps
  : "†" topexpsA "‡"       {{$$ = $2;}}
  //| letdecls               {{$$ = $1;}}    
  ;

topexpsA
  : topexpsA ";" topexp   {{($1).push($3); $$ = $1;}}
  | topexp                {{$$ = [$1];}}
  ;

letdecls // : [decl]
  : "‡" "†"                               {{ $$ = []; }}
  |  list_letdecl_comma_1 "‡" "†"         {{ $$ = $2; }}
  ;

list_letdecl_comma_1 // : [decl]
  : list_letdecl_comma_1 ";" letdecl      {{ ($1).push($3); $$ = $1; }}
  | letdecl                               {{ $$ = [$1]; }}
  ;

letdecl
  : "let" decl          {{$$ = {astType:"let-one", decl: $2, pos: @$}; }}
  ;

exp // : object
  // : infixexp %prec NOSIGNATURE  {{$$ = $1;}}
  : funccomp            {{$$ = $1;}}
  | funcstream          {{$$ = $1;}}
  | datalookup          {{$$ = $1;}}
  | datainst            {{$$ = $1;}}
  | dataupdate          {{$$ = $1;}}
  | classexp            {{$$ = $1;}}
  | exp "+" exp         {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "-" exp         {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "*" exp         {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "/" exp         {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "^" exp         {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "%" exp         {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "==" exp        {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "/=" exp        {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp ">"  exp        {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "<"  exp        {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp ">=" exp        {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "<=" exp        {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "!!" exp        {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp ":"  exp        {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "++" exp        {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "&&" exp        {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "||" exp        {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "<<" exp        {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp "?"  exp        {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | exp ":>>" exp       {$$ = {astType:"binop-exp",op:$2,lhs:$1,rhs:$3,pos:@$};}}
  | lexp                {{$$ = $1}}
  ;

binop
  : "+"         {{$$ = $1;}}
  | "-"         {{$$ = $1;}}
  | "*"         {{$$ = $1;}}
  | "/"         {{$$ = $1;}}
  | "^"         {{$$ = $1;}}
  | "%"         {{$$ = $1;}}
  | "=="        {{$$ = $1;}}
  | "/="        {{$$ = $1;}}
  | ">"         {{$$ = $1;}}
  | "<"         {{$$ = $1;}}
  | ">="        {{$$ = $1;}}
  | "<="        {{$$ = $1;}}
  | "!!"        {{$$ = $1;}}
  | ":"         {{$$ = $1;}}
  | "++"        {{$$ = $1;}}
  | "&&"        {{$$ = $1;}}
  | "||"        {{$$ = $1;}}
  | "<<"        {{$$ = $1;}}
  | "?"         {{$$ = $1;}}
  | ":>>"       {{$$ = $1;}}
  ;

//  lexp OP infixexp            {{ ($3).unshift($1,$2); $$ = $3; }}
//  '-' infixexp                {{ ($2).shift($1);      $$ = $2; }}
//  lexp                        {{ $$ = [$1]; }}

lexp // : object
  : "if" exp "then" exp "else" exp  {{$$ = {astType:"ite",e1:$2,e2:$4,e3:$6,pos:@$}; }}
  | fexp                            {{$$ = ($1.length === 1) ? ($1[0]) : {astType:"application", exps:$1,pos:@$}; }}
  | exp "$" exp                     {{$$ = {astType:"function-application-op", lhs: $1, rhs: $3};}}
  | lambdaExp                       {{$$ = $1;}}
  | "case" exp "of" "†" alts "‡"    {{$$ = {astType:"case", exp: $2, alts: $5, pos: @$}; }}
  | "receive" "†" alts "‡"          {{$$ = {astType:"receive", alts:$3, pos:@$};}}
  | "let" decls "in" exp            {{$$ = {astType:"let", decls: $2, exp: $4, pos: @$}; }}
  | exp qop lexp                    {{$$ = {astType:"binop-exp",op:($2).id.id,lhs:$1,rhs:$3,pos:@$};}}
  | "do" "†" doList "‡"             {{$$ = {astType:"do-exp", exps: $3, pos: @$}; }}
  ;

lambdaExp
  : '\' apats "->" exp              {{$$ = {astType:"lambda", args: $2, rhs: $4, pos: @$}; }}
  ;

/////////////////////
// SynthDefinitions
/////////////////////

synthDef
  : varid synthRhs            {{ $$ = {astType:"synthdef", id:$1, args:[], rhs:$2};}}
  | varid synthArgs synthRhs  {{ $$ = {astType:"synthdef", id:$1, args:$2, rhs:$3};}}
  ;

synthArgs
  : varid                     {{$$ = [{astType:"decl-fun", ident: {astType:"varname", id:$1}, args: [], rhs:{astType:"float-lit",value:0}, pos: @$}];}}
  | synthArgs varid           {{$1.push({astType:"decl-fun", ident: {astType:"varname", id:$2}, args: [], rhs:{astType:"float-lit",value:0}, pos: @$}); $$ = $1;}}
  ;

synthRhs
  : "=>" exp                 {{$$ = {astType: "fun-where", exp: $2, decls: [], pos: @$}; }}
  | "=>" exp "where" decls   {{$$ = {astType: "fun-where", exp: $2, decls: $4, pos: @$}; }}
  ;

///////////////
// PercStream
///////////////

percStream
  : varid "+>" percList               {{$$ = {astType:"percStream", id: $1, list:$3, modifiers: {astType:"percMods", list:[]} };}}
  | varid "+>" percList "|" percMods  {{$$ = {astType:"percStream", id: $1, list:$3, modifiers: $5};}}
  ;

percList
  : percItem                        {{$$ = {astType:"percList", list: [$1]};}}
  | percList percItem               {{($1).list.push($2); $$ = $1;}}
  ;

percItem
  : varid                           {{$$ = {astType:"varname", id:$1};}}
  | conid                           {{$$ = {astType:"varname", id:$1};}}
  | "_"                             {{$$ = {astType:"Nothing"};}}
  | "[" percList "]"                {{$$ = $2;}}
  ;

percMods
  : percMod                 {{ $$ = {astType:"percMods", list:[$1]}; }}
  | percMods percMod        {{ $1.list.push($2); $$ = $1;}}
  ;

percMod
  : aexp                    {{ $$ = $1;}}
  | "_"                     {{ $$ = {astType:"Nothing"};}}
  ;

/////////////////
// SoloStream
/////////////////

soloStream
  : varid "~>" varid soloList               {{$$ = {astType:"soloStream", id: $1, synth:$3, list:$4, modifiers: {astType:"soloMods", list:[]} };}}
  | varid "~>" varid soloList "|" soloMods  {{$$ = {astType:"soloStream", id: $1, synth:$3, list:$4, modifiers: $6};}}
  ;

soloList
  : soloItem                        {{$$ = {astType:"soloList", list: [$1]};}}
  | soloList soloItem               {{($1).list.push($2); $$ = $1;}}
  ;

soloItem
  : float                           {{$$ = {astType: "float-lit", value: Number($1), pos: @$};}}
  | "-" float                       {{$$ = {astType: "float-lit", value: -Number($2), pos: @$};}}
  | "_"                             {{$$ = {astType:"Nothing"};}}
  | "[" soloList "]"                {{$$ = $2;}}
  ;

soloMods
  : soloMod                 {{ $$ = {astType:"soloMods", list:[$1]}; }}
  | soloMods soloMod        {{ $1.list.push($2); $$ = $1;}}
  ;

soloMod
  : aexp                    {{ $$ = $1;}}
  | "_"                     {{ $$ = {astType:"Nothing"};}}
  ;

doList
  : exp               {{$$ = [$1];}}
  | doList ";" exp    {{$1.push($3); $$ = $1;}}
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
// Guards

/*
myGuard x
    | x > 4 = 99
    | otherwise = 100
*/

guardexp
  : var apats grhs-list    {{$$ = {astType:"guard-fun", ident: $1, args: $2, guards: $3, pos: @$};}}
  //| pat varop pat "†" grhs-list "‡"{{$$ = {astType:"guard-fun", ident: $2, args: [$1,$3], rhs: $5, pos: @$, orig: "infix"};}}
  //| '(' pat varop pat ')' apats "†" grhs-list "‡"
  //  {{$$ = {astType:"guard-fun", ident: $3, args: [$2,$4].concat($6), rhs: $8, pos: @$, orig: "infix"};}}
  ;

grhs-list
  : grhs-list grhs              {{$1.push($2); $$ = $1;}}
  | grhs                        {{$$ = [$1];}}
  ;

grhs
  : "|" exp "=" exp           {{$$ = {astType:"grhs",e1: $2, e2:$4};}}
  | "|" wildcard "=" exp      {{$$ = {astType:"grhs",e1: {astType:"boolean-lit", value:true, pos: @$}, e2:$4};}}
  | "|" "otherwise" "=" exp   {{$$ = {astType:"grhs",e1: {astType:"boolean-lit", value:true, pos: @$}, e2:$4};}}
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
  //| '-' exp %prec UMINUS    {{$$ = {astType:"negate",rhs:$2};}}
  | dictexp                 {{$$ = $1;}}
  | listexp                 {{$$ = $1;}}
  | "(" binop ")"           {{ $$ = {astType:"curried-binop-exp",op:$2,pos:@$};}}
  | "(" exp binop ")"       {{ $$ = {astType:"left-curried-binop-exp",op:$3,lhs:$2, pos:@$};}}
  | "(" binop exp ")"       {{ $$ = {astType:"right-curried-binop-exp",op:$2,rhs:$3,pos:@$};}}
  | "(" ">>" exp ")"        {{ $$ = {astType:"right-curried-binop-exp",op:$2,rhs:$3,pos:@$};}}
  | "(" exp ">>" ")"        {{ $$ = {astType:"left-curried-binop-exp",op:$3,lhs:$2, pos:@$};}}
  | "(" ">>" ")"            {{ $$ = {astType:"curried-binop-exp",op:$2,pos:@$};}}
  | nothing                 {{$$ = $1;}}
  ;

nothing 
  : "Nothing"               {{$$ = {astType: "Nothing"};}}
  ;

////////////////////
// Dictionary
////////////////////

dictexp
  : "(" dictexp_1_comma ")"    {{$$ = {astType:"dictionary", pairs:$2};}}
  | "()"                       {{$$ = {astType:"dictionary", pairs:[]};}}
  ;

dictexp_1_comma
  : dictexp_1_comma "," dictpair           {{$$ = $1.concat($3);}}
  | dictpair                               {{$$ = $1;}}
  ;

dictpair
  : exp "=" exp               {{$$ = [$1,$3];}}
  ;


////////////////////
// Data
////////////////////

dataexp
  : data conid "{" datamems "}"               {{$$ = {astType:"data-decl", id: $2, members: $4};}}
  | data conid "{" datamems ";" "}"           {{$$ = {astType:"data-decl", id: $2, members: $4};}}
  | data conid "=" enums                      {{$$ = {astType:"data-enum", id: $2, members: $4};}}}
  ;

datalookup
  : exp "::" varid      {{$$ = {astType:"data-lookup",data:$1,member:$3,pos:@$};}}
  | exp "::" conid      {{$$ = {astType:"data-lookup",data:$1,member:$3,pos:@$};}}    
  ;

enums
  : enums "|" conid                   {{$1.push($3); $$ = $1;}}
  | conid                             {{$$ = [$1];}}
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

////////////////////////
// Class
////////////////////////

classexp
  : class conid varid "where" "†" classmems "‡"  {{ $$ = {astType: "class-exp", id:$2, var:$3,members:$6};}}
  ;

classmems
  : classmems ";" classmem      {{$1.push($2); $$ = $1;}}
  | classmem                    {{$$ = [$1];}}
  ;

classmem
  : decl                    {{$$ = {astType:"class-decl", decl:$1};}}
  | varid binop varid rhs   {{$$ = {astType:"class-binop", left:$1, binop:$2, right:$3, rhs:$4};}}
  | varid varsym varid rhs  {{$$ = {astType:"class-binop", left:$1, binop:$2, right:$3, rhs:$4};}}
  | varid binop varid       {{$$ = {astType:"class-binop", left:$1, binop:$2, right:$3};}}
  | varid varsym varid      {{$$ = {astType:"class-binop", left:$1, binop:$2, right:$3};}}
  ;

///////////////
// List
///////////////

listexp // : object
    : "[" exp list_exp_1_comma            {{ $$ = {astType: "listexp", members: [$2].concat($3), pos: @$}; }}
    | "[" exp ".." exp "]"                {{ $$ = {astType: "listrange", lower: $2, upper: $4, pos: @$}; }}
    | "[" exp "," exp ".." exp "]"        {{ $$ = {astType: "listrange", lower: $2, upper: $6, skip: $4, pos: @$}; }}
    | "[]"                                {{ $$ = {astType: "listexp", members: [], pos: @$}; }}
    | "[" exp "|" qual list_qual_1_comma  {{ $$ = {astType: "list-comprehension", exp: $2, generators: [$4].concat($5), pos: @$}; }}
    ;

list_exp_1_comma
    : ',' exp list_exp_1_comma   {{ $$ = [$2].concat($3); }}
    | "]"                        {{ $$ = [];}}
    ;

list_qual_1_comma
    : ',' qual list_qual_1_comma   {{ $$ = [$2].concat($3); }}
    | "]"                         {{ $$ = [];}}
    ;

qual
  : varid "<-" exp            {{$$ = {astType:"decl-fun", ident: $1, args: [], rhs: $3, pos: @$};}}
  | exp                       {{$$ = $1;}}
  ;

funcstream
  : exp ">>" exp           {{$$ = {astType:"function-stream", exps:[$1,$3]};}}
  | funcstream ">>" exp    {{$1.exps.push($3); $$ = $1;}}
  ;

funccomp
  : exp "." exp         {{$$ = {astType:"function-composition", exps:[$1,$3]};}}
  | exp "." funccomp    {{$3.exps=[$1].concat($3.exps); $$ = $3;}}
  ;

modid // : object # {conid .} conid
    : qconid              {{$$ = new Lich.ModName($1, @$, yy.lexer.previous.qual);}}
    | conid               {{$$ = new Lich.ModName($1, @$);}}
    ;

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
    : conid              {{$$ = new Lich.VarName($1, @$, false);}}
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
    //: varid           {{$$ = new Lich.VarName($1, @$, false);}}
    : varid           {{$$ = {astType:"varname", id:$1};}}
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
    : lpat                  {{$$ = $1;}}
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
    : var                           {{$$ = $1; }}
    | nothing                       {{$$ = $1; }}
    | gcon                          {{$$ = $1; }}
    | literal                       {{$$ = {astType:"literal-match", value:$1, pos: @$}; }}
    | wildcard                      {{$$ = $1;}}
    | "(" pat ")"                   {{$$ = $2; }}
    | "(" pat_var ":" pat_var ")"   {{$$ = {astType:"head-tail-match", head:$2,tail:$4};}}
    | list_pat                      {{$$ = $1;}}
    | conid                         {{$$ = {astType:"data-match", id: $1, members: []};}}
    | conid conlist                 {{$$ = {astType:"data-match", id: $1, members: $2};}}
    | lambda_pat                    {{$$ = $1;}}
    | varid "@" apat                {{$$ = {astType:"at-match", id: $1, pat:$3};}}
    ;

conlist
  : conlist pat_var   {{$1.push($2); $$ = $1;}}
  | pat_var           {{$$ = [$1];}}
  ;

list_pat // object
    : "[" list_pat_1_comma "]"  {{$$ = {astType:"list-match", list:$2}; }}
    | "[]"                      {{$$ = {astType:"list-match", list:[]}; }}
    ;
    
list_pat_1_comma // : [pat]
    : list_pat_1_comma "," apat         {{$1.push($3); $$ = $1; }}
    | apat                              {{$$ = [$1]; }}
    ;

pat_var
  : varid         {{$$ = $1;}}
  | wildcard      {{$$ = $1;}}
  ;

wildcard
  : '_'           {{$$ = {astType:"wildcard", id: $1, pos: @$}; }}
  ;
    
lambda_pat
  : "\" lambda_args "->"       {{$$ = {astType:"lambda-pat", numArgs:$2.length}; }}
  ;

lambda_args
  : lambda_args wildcard     {{$1.push($2); $$ = $1;}}
  | wildcard                 {{$$ = [$1];}}
  ;

////////////////////////////////////////////////////////////////////////////////
// Literals

literal  // : object
    : integer {{$$ = {astType: "float-lit", value: Number($1), pos: @$};}}
    | string-lit {{$$ = {astType: "string-lit", value: ($1), pos: @$};}}
    | char {{$$ = {astType: "char-lit", value: $1, pos: @$};}}
    | float {{$$ = {astType: "float-lit", value: Number($1), pos: @$};}}
    | True {{$$ = {astType: "boolean-lit", value: true, pos: @$};}}
    | False {{$$ = {astType: "boolean-lit", value: false, pos: @$};}}
    ;

////////////////////////////////////////////////////////////////////////////////
