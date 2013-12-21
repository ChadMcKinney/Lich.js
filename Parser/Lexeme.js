function Token (v, r, c, t) {
    this.val = v;
    this.row = r;
    this.col = c;
    this.typ = t;
    
    this.toString = function() {
        var q = (this.qual !== undefined)? this.qual : "undefined"; 
        return ("[ val: " + this.val + ", row: " + this.row + ", col: " + this.col + ", typ: " + this.typ + ", qual: " + q + "]");
    }
}

function Ind (c, r, b) {
    this.col = c;
    this.row = r;
    this.isBlock = b;
    this.toString = function() {
        if (b)
            return ("†" + this.col + "‡");
        else
            return ("<" + this.col + ">");
    }
}

//constant functions for readability
function BLOCKIND() {return true;}
function ROWIND() {return false;}
