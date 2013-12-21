var iterL = function() {
    this.stack = []; //the stack of layout contexts
    this.input = []; //the list of tokens generated by tokenize.js, reversed
    this.emptyBlock = false; //sets whether the current block will be an empty block
    this.recent; //the last returned token
    this.previous; // the previously returned token
    this.yytext = ""; //contains the source text that represents the current token
    this.yylineno = 0; //contains the lineno of the current token
    this.yyleng = 0; //contains the indentation of the current token
    this.yyname = ""; //contains the name (token-type) of the current token
    this.pErr = false; //contains info on whether the parser has returned an error message
    this.hadAnError = false;
    var debugging = false;
    var troublemaker;
    if(debugging) this.debugArr = [];
    
    //set the lexer's input, required by the JISON scanner API
    this.setInput = function(inp) {
//        document.writeln("<p>lexer initiated: " + inp + "</p>")
        this.input = inp.reverse();
    }
    
    this.lex = function() {
//        document.writeln("<p>lexer called, last returned: " + this.recent + "<br>previously returned: " + this. previous + "</p>")
        if (this.hadAnError){
            this.hadAnError = false;
            this.pErr = false;            
            this.updRecent(troublemaker);
            return this.yyname;
           
        }
        var x = peek(this.input);
        if (this.emptyBlock)
            return (new Token("‡",x.row,x.col,"‡"));
        if (this.input.length <= 0) {
            if (this.stack.length <= 0) {
                this.updRecent(new Token("EOF",Number.POSITIVE_INFINITY,
                                Number.POSITIVE_INFINITY,"EOF"));
                return this.yyname;//TODO: what kind of message does parser want at EOF?
            } else {
                if (peek(this.stack) > 0) {
                    this.updRecent(new Token("‡", Number.POSITIVE_INFINITY, 
                              Number.POSITIVE_INFINITY, "‡"));
                    this.stack.pop();
                    return this.yyname;
                } else {
                    throw new Error("Error: Unmatched { at EOF!");
                }
            }
        }        
            
        //creative use of ternary op to somewhat emulate a pattern match over
        //an array of different Object types.
        var what = (x instanceof Ind && x.isBlock)? "BI":
               (x instanceof Ind && !x.isBlock)? "RI":
               (x instanceof Token && x.val == "†")? "OB":
               (x instanceof Token && x.val == "‡")? "CB":
               (x instanceof Token)? "T":
               "ERR";
//        if (this.pErr) 
//            document.writeln("<p>lexer: pErr and token is: " + what);
        switch(what){
        
            //current element is BLOCKIND
            case "BI":
            //L ({n} : ts) [] = { : (L ts [n]) if n > 0 (Note 1)
                if (this.stack.length === 0) {
                    if (x.col > 0) {
                        this.input.pop();
                        this.stack.push(x.col);
                        this.updRecent(new Token("†",x.row,x.col,"†"));
                        return this.yyname;
                    } else {
                        throw new Error("Layout error at row " + x.row + ", col " + x.col);
                    }
            //L ({n} : ts) (m : ms) = { : (L ts (n : m : ms)) if n > m (Note 1)
                } else if (x.col > peek(this.stack)) {
                    this.stack.push(x.col);
                    this.input.pop();
                    this.updRecent(new Token("†",x.row,x.col,"†"));
                    return this.yyname;
            //L {fn} : ts) ms = { : } : (L (< n >: ts) ms) (Note 2)
                } else {
                    this.emptyBlock = true;
                    this.input.pop();
                    this.input.push(new Ind(x.col, x.row, ROWIND()));
                    this.updRecent(new Token("†",x.row,x.col,"†"));
                    return this.yyname;
                    //replace the BLOCKIND with a ROWIND
                }
            break;
            //current element is ROWIND
            case "RI":
            //L (< n >: ts) (m : ms) = ; : (L ts (m : ms)) if m = n
                if (this.stack.length > 0 && x.col === peek(this.stack)) {
                    this.input.pop();
                    this.updRecent(new Token(";",x.row,x.col,";"));
                    return this.yyname;
            //L (< n >: ts) (m : ms) = } : (L (< n >: ts) ms) if n < m
                } else if (this.stack.length > 0 && x.col < peek(this.stack)) {
                    this.stack.pop();
//                    this.input.pop();
                    this.updRecent(new Token("‡",x.row,x.col,"‡"));
                    return this.yyname;
            //L (< n >: ts) ms = L ts ms
                } else {
                    this.input.pop();
                    return this.lex();
                }
            break;
            //current element is a Token "†"
            case "OB":
            //L ({ : ts) ms = { : (L ts (0 : ms)) (Note 4)
                this.input.pop();
                this.stack.push(0);
                this.updRecent(x);
                return this.yyname;
            break;
            //current element is a Token "‡"
            case "CB":
            //L (} : ts) (0 : ms) = } : (L ts ms) (Note 3)
                if (peek(this.stack) === 0) {
                    this.input.pop();
                    this.stack.pop();
                    this.updRecent(x);
                    return this.yyname;
                } else {
                    throw new Error("Layout error at row " + x.row + ", col " + x.col);
                }
            break;
            //current element is any other Token
            case "T":
            //L (t : ts) (m : ms) = } : (L (t : ts) ms) if m= = 0 and parse-error(t)
                if (this.stack.length > 0 && peek(this.stack) !== 0 && this.pErr) {
//                    document.writeln("<p>parseError alternative reached in lexer</p>");
                    this.stack.pop();
                    this.pErr = false;
                    this.hadAnError = true;
//                    document.writeln("<p>recent is now: " + this.recent + "</p>");
                    troublemaker = this.recent;
                    this.updRecent(new Token("‡",x.row,x.col,"‡"),"ERROR");
//                    document.writeln("<p>recent is now: " + this.recent + "</p>");
                    return this.yyname;
            //L (t : ts) ms = t : (L ts ms)
                } else {
                    this.input.pop();
                    this.updRecent(x);
                    return this.yyname;
                }
            break;
            //current element is something else
            case "ERR":
            break;
           
            default:
            throw new Error("Something is srsly wrong with var what.");
        }
    }
    
    this.parseError = function() {
//        document.writeln("<p>calling parseError from lexer. stack is: " + this.stack + "<br>");
        if (this.stack.length > 0 && peek(this.stack) !== 0) {
            this.pErr = true;
            if(debugging)console.log("calling parseError from lexer. stack is: " + this.stack + "\n" + "returning: true");
            return true;
        } else {
            if(debugging)console.log("calling parseError from lexer. stack is: " + this.stack + "\n" + "returning: false");
        return false;
        }
    }
    
    this.updRecent = function(token, sender) {
        if (token instanceof Token) {
//            document.writeln("<p>updating recent: " + token + "</p>");
            this.previous = this.recent;
            this.recent = token;
            this.yytext = token.val;
            this.yylineno = token.row;
            this.yyleng = token.val.length;
            this.yyname = token.typ;
            this.yylloc = {first_line: token.row, first_column: token.col, 
                           last_line: token.row, last_column: token.col + token.val.length};
            if(debugging)console.log("lexer returning token: " + this.recent + sender );
            if(debugging)this.debugArr.push(this.recent.val);
        } else {//TODO: replace alerts by proper error handling!
            throw new Error("There should be no elems not of type Token in input for lexer!");
        }
        
    }
}

function peek(arr){
    return arr[arr.length-1];
}
