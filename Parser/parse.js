//require Parser/tokenize.js
//        Parser/preL.js
//        Parser/iterL.js
//        Parser/parser.js
         
Lich.ParseError = function(msg,pos){
  this.msg = msg;
  this.pos = pos;
};

Lich.ParseError.prototype.toString = function(){
  return this.msg;
};
 
Lich.parse = function(input) {
    // var z = Lich.Parser.tokenize.parse(input);
    if(typeof Lich.Lexer === "undefined")
    {
      Lich.Lexer = LichParser.lexer;
      Lich.Lexer.yy = LichParser.yy;
      Lich.Lexer.EOF = 1; //End of File

      Lich.Lexer.yy.parseError = function (str, hash) {
        if (Lich.Lexer.yy.lexer.debugArr !== undefined)
            console.log("parse error happened, lexer has so far returned:  " + Lich.Lexer.yy.lexer.debugArr)
        if (!Lich.Lexer.yy.lexer.parseError()) {
            throw new Lich.ParseError(str + " expected: " + hash.expected +
                                 "  Lexer returned: " + Lich.Lexer.yy.lexer.recent,
                                  Lich.Lexer.yy.lexer.yylloc);
        }
      }
    }

    LichParser.lexer = new iterL();
    Lich.Lexer.setInput(input);
    var x = new Array();
    var token;

    while(true)
    {
      token = Lich.Lexer.lex();
      // Lich.post("Lich.Lexer.lex() = " + token.typ);
      if(token == Lich.Lexer.EOF)
        break;

      x.push(token);
    }

    x.pop(); // Remove trailing EOF

    /*
    for(var i = 0; i < x.length; ++i)
    {
      Lich.post("Jison lexer["+i+"] = { val: " + x[i].val + ", typ: " + x[i].typ + "}");
    }
    

    for(var i = 0; i < z.length; ++i)
    {
      Lich.post("Peg lexer["+i+"] = { val: " + z[i].val + ", typ: " + z[i].typ + "}");
      // Lich.post("Peg lexer["+i+"].length = " + typeof z[i].length);
    }*/

    var y = Lich.Parser.preL(x);
    //Lich.post("Lich.Parser.preL(x) = " + y);
    /*
    LichParser.lexer = new iterL();

    LichParser.yy.parseError = function (str, hash) {
        if (LichParser.yy.lexer.debugArr !== undefined)
            console.log("parse error happened, lexer has so far returned:  " + LichParser.yy.lexer.debugArr)
        if (!LichParser.yy.lexer.parseError()) {
            throw new Lich.ParseError(str + " expected: " + hash.expected +
                                 "  Lexer returned: " + LichParser.yy.lexer.recent,
                                  LichParser.yy.lexer.yylloc);
        } 
    }*/
    
    return LichParser.parse(y);
}

