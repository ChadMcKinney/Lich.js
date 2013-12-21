//require Parser/Lexeme.js



Lich.Parser.preL = function(input) {
	var column = 1;
	var line = 1;
	var newBlock = false;
	var newLine = false;
	var inString = false;
	var result = [];
	
	var mkToken = function (tok, lin, col) {
	    var thing = new Token(tok.val,lin,col,tok.typ);
	    if (tok.qual !== undefined)
	        thing.qual = tok.qual;
	    return thing; 
	}
	
	//If the first lexeme of a module is not { or module, then it is preceded 
	//by {n} where n is the indentation of the lexeme
	if (input[0].val === "†" || input[0].val === "module"){
//        result.push(new Token(input[0].val,line,column,input[0].typ));
        result.push(mkToken(input[0],line,column));
	    column += input[0].val.length;
	} else if (isWhite(input[0].val)) {
	    var lim = countvalues(input[0].val, "\n");
	    if (lim) {
	        line += lim;
	        column = 1;
	    }
	    if (input[1].val !== "†" && input[1].val !== "module") {
	        newBlock = true;
	    } 
	    try {
	        column += howLongWS(input[0].val,column);
	    }
	    catch (err) {
	        //err.message.concat
	        Lich.post("In program: \n\n" + Lich.showAST(input));
	        throw err;
	    }
	} else {
	    result.push(new Ind(column, line, BLOCKIND()));
	    column += input[0].val.length;
//	    result.push(new Token(input[0].val,line,column,input[0].typ));
	    result.push(mkToken(input[0],line,column));
	}
    
	for (var i = 1; i < input.length; i++) {

		if (isWhite(input[i].val) && !this.inString) {
		//input[i] is whitespace
		    var rows = countvalues(input[i].val,"\n");
            line += rows; // increase line number by the number of newlines
			if (rows > 0) {
			//if there was a newline, reset column count and indicate that a
			//newLine token is needed.
			    column = 1; 
                newLine = true;
			} 
			try {
			    column += howLongWS(input[i].val,column);
			} catch (err) {
			    //err.message.concat
			    Lich.post("In program: \n\n" + Lich.showAST(input));
	            throw err;
			}
		} else {
		//input[i] is a lexeme
		    if (newBlock) {
                if (input[i].val !== "†" && input[i+1])
		            result.push(new Ind(column, line, BLOCKIND()));
		        newBlock = false;
		        newLine = false;
		    } else if (newLine) {
		        result.push(new Ind(column, line, ROWIND()));
		        newLine = false;
		    }
//		    result.push(new Token(input[i].val,line,column,input[i].typ));
            result.push(mkToken(input[i],line,column));
		    column += input[i].val.length;
		    if (input[i].val === "where" || 
		        input[i].val === "let" ||
		        input[i].val === "do" ||
		        input[i].val === "of") {
		        newBlock = true;
//		        document.writeln("<br> newblock was set because of " + input[i].val)
		    }
		        

		}
	}
	
	return result;
}

//boolean check whether input::String is Whitespace.
function isWhite(input) {
	var res;

	if(input.match(/\"/))
		return false;

	if (input instanceof Array) 
		res = input.match(/\s/);
	else
		res = input.match(/\s/);
	if (res) 
		return true;
	else
		return false;			
}

//compute how long a piece of whitespace is
function howLongWS(ws, indent) {
	var sum = 0;
	for (var i = 0; i < ws.length; i++) {
		var c = ws.charAt(i);
		switch (c) {
		case ' ':
			sum ++;
			break;
		case '\t':
			do {sum++;} while ((sum + indent)%8 != 1 );
			break;
	    case '\n':
	        sum = 0;
	        break;
	    case '\r'://ignore carriage return
	        break;
		default:
			throw new Error("Whitespace contained something that is not a newline or tab! Erroneous character code: " + ws.charCodeAt(i) + "in string: " + ws);
		}
	}
	return sum;
}

//count the occurrences of que in arr
function countvalues(arr,que) {
	var i = arr.length;
	var j = 0;
	
	while( i-- ) {
		if (arr[i] === que)
		j++;
	}
	
	return j;
}
