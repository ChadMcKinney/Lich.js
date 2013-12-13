
// Initial header code


/*
	Default template driver for JS/CC generated parsers running as
	browser-based JavaScript/ECMAScript applications.
	
	WARNING: 	This parser template will not run as console and has lesser
				features for debugging than the console derivates for the
				various JavaScript platforms.
	
	Features:
	- Parser trace messages
	- Integrated panic-mode error recovery
	
	Written 2007, 2008 by Jan Max Meyer, J.M.K S.F. Software Technologies
	
	This is in the public domain.
*/

var web_dbg_withtrace		= false;
var web_dbg_string			= new String();

function __webdbg_print( text )
{
	web_dbg_string += text + "\n";
}

function __weblex( info )
{
	var state		= 0;
	var match		= -1;
	var match_pos	= 0;
	var start		= 0;
	var pos			= info.offset + 1;

	do
	{
		pos--;
		state = 0;
		match = -2;
		start = pos;

		if( info.src.length <= start )
			return 47;

		do
		{

switch( state )
{
	case 0:
		if( ( info.src.charCodeAt( pos ) >= 9 && info.src.charCodeAt( pos ) <= 10 ) || info.src.charCodeAt( pos ) == 13 || info.src.charCodeAt( pos ) == 32 ) state = 1;
		else if( info.src.charCodeAt( pos ) == 37 ) state = 2;
		else if( info.src.charCodeAt( pos ) == 40 ) state = 3;
		else if( info.src.charCodeAt( pos ) == 41 ) state = 4;
		else if( info.src.charCodeAt( pos ) == 42 ) state = 5;
		else if( info.src.charCodeAt( pos ) == 43 ) state = 6;
		else if( info.src.charCodeAt( pos ) == 44 ) state = 7;
		else if( info.src.charCodeAt( pos ) == 45 ) state = 8;
		else if( info.src.charCodeAt( pos ) == 46 ) state = 9;
		else if( info.src.charCodeAt( pos ) == 47 ) state = 10;
		else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 11;
		else if( info.src.charCodeAt( pos ) == 58 ) state = 12;
		else if( info.src.charCodeAt( pos ) == 60 ) state = 13;
		else if( info.src.charCodeAt( pos ) == 61 ) state = 14;
		else if( info.src.charCodeAt( pos ) == 62 ) state = 15;
		else if( ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 103 && info.src.charCodeAt( pos ) <= 104 ) || ( info.src.charCodeAt( pos ) >= 106 && info.src.charCodeAt( pos ) <= 115 ) || ( info.src.charCodeAt( pos ) >= 117 && info.src.charCodeAt( pos ) <= 118 ) || ( info.src.charCodeAt( pos ) >= 120 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 91 ) state = 17;
		else if( info.src.charCodeAt( pos ) == 93 ) state = 18;
		else if( info.src.charCodeAt( pos ) == 94 ) state = 19;
		else if( info.src.charCodeAt( pos ) == 95 ) state = 20;
		else if( info.src.charCodeAt( pos ) == 220 ) state = 21;
		else if( info.src.charCodeAt( pos ) == 34 ) state = 41;
		else if( info.src.charCodeAt( pos ) == 105 ) state = 43;
		else if( info.src.charCodeAt( pos ) == 123 ) state = 44;
		else if( info.src.charCodeAt( pos ) == 126 ) state = 47;
		else if( info.src.charCodeAt( pos ) == 101 ) state = 59;
		else if( info.src.charCodeAt( pos ) == 116 ) state = 60;
		else if( info.src.charCodeAt( pos ) == 102 ) state = 63;
		else if( info.src.charCodeAt( pos ) == 119 ) state = 64;
		else state = -1;
		break;

	case 1:
		state = -1;
		match = 1;
		match_pos = pos;
		break;

	case 2:
		state = -1;
		match = 36;
		match_pos = pos;
		break;

	case 3:
		state = -1;
		match = 2;
		match_pos = pos;
		break;

	case 4:
		state = -1;
		match = 3;
		match_pos = pos;
		break;

	case 5:
		if( info.src.charCodeAt( pos ) == 42 ) state = 23;
		else state = -1;
		match = 37;
		match_pos = pos;
		break;

	case 6:
		if( info.src.charCodeAt( pos ) == 43 ) state = 24;
		else state = -1;
		match = 34;
		match_pos = pos;
		break;

	case 7:
		state = -1;
		match = 7;
		match_pos = pos;
		break;

	case 8:
		if( info.src.charCodeAt( pos ) == 62 ) state = 25;
		else if( info.src.charCodeAt( pos ) == 45 ) state = 42;
		else state = -1;
		match = 35;
		match_pos = pos;
		break;

	case 9:
		if( info.src.charCodeAt( pos ) == 46 ) state = 26;
		else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 27;
		else state = -1;
		match = 8;
		match_pos = pos;
		break;

	case 10:
		if( info.src.charCodeAt( pos ) == 61 ) state = 28;
		else state = -1;
		match = 38;
		match_pos = pos;
		break;

	case 11:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 11;
		else if( info.src.charCodeAt( pos ) == 46 ) state = 27;
		else state = -1;
		match = 26;
		match_pos = pos;
		break;

	case 12:
		state = -1;
		match = 14;
		match_pos = pos;
		break;

	case 13:
		if( info.src.charCodeAt( pos ) == 61 ) state = 29;
		else state = -1;
		match = 33;
		match_pos = pos;
		break;

	case 14:
		if( info.src.charCodeAt( pos ) == 61 ) state = 30;
		else if( info.src.charCodeAt( pos ) == 62 ) state = 31;
		else state = -1;
		match = 6;
		match_pos = pos;
		break;

	case 15:
		if( info.src.charCodeAt( pos ) == 61 ) state = 32;
		else if( info.src.charCodeAt( pos ) == 62 ) state = 33;
		else state = -1;
		match = 32;
		match_pos = pos;
		break;

	case 16:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 17:
		state = -1;
		match = 4;
		match_pos = pos;
		break;

	case 18:
		state = -1;
		match = 5;
		match_pos = pos;
		break;

	case 19:
		state = -1;
		match = 39;
		match_pos = pos;
		break;

	case 20:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else state = -1;
		match = 16;
		match_pos = pos;
		break;

	case 21:
		state = -1;
		match = 15;
		match_pos = pos;
		break;

	case 22:
		if( info.src.charCodeAt( pos ) == 34 ) state = 41;
		else state = -1;
		match = 25;
		match_pos = pos;
		break;

	case 23:
		state = -1;
		match = 40;
		match_pos = pos;
		break;

	case 24:
		state = -1;
		match = 17;
		match_pos = pos;
		break;

	case 25:
		state = -1;
		match = 13;
		match_pos = pos;
		break;

	case 26:
		state = -1;
		match = 9;
		match_pos = pos;
		break;

	case 27:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 27;
		else state = -1;
		match = 27;
		match_pos = pos;
		break;

	case 28:
		state = -1;
		match = 29;
		match_pos = pos;
		break;

	case 29:
		state = -1;
		match = 30;
		match_pos = pos;
		break;

	case 30:
		state = -1;
		match = 28;
		match_pos = pos;
		break;

	case 31:
		state = -1;
		match = 11;
		match_pos = pos;
		break;

	case 32:
		state = -1;
		match = 31;
		match_pos = pos;
		break;

	case 33:
		state = -1;
		match = 10;
		match_pos = pos;
		break;

	case 34:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else state = -1;
		match = 19;
		match_pos = pos;
		break;

	case 35:
		state = -1;
		match = 12;
		match_pos = pos;
		break;

	case 36:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else state = -1;
		match = 21;
		match_pos = pos;
		break;

	case 37:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 38:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else state = -1;
		match = 22;
		match_pos = pos;
		break;

	case 39:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else state = -1;
		match = 23;
		match_pos = pos;
		break;

	case 40:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else state = -1;
		match = 18;
		match_pos = pos;
		break;

	case 41:
		if( info.src.charCodeAt( pos ) == 34 ) state = 22;
		else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 33 ) || ( info.src.charCodeAt( pos ) >= 35 && info.src.charCodeAt( pos ) <= 254 ) ) state = 41;
		else state = -1;
		break;

	case 42:
		if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 254 ) ) state = 42;
		else state = -1;
		match = 1;
		match_pos = pos;
		break;

	case 43:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 101 ) || ( info.src.charCodeAt( pos ) >= 103 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 102 ) state = 34;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 44:
		if( info.src.charCodeAt( pos ) == 45 ) state = 49;
		else state = -1;
		break;

	case 45:
		if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 44 ) || ( info.src.charCodeAt( pos ) >= 46 && info.src.charCodeAt( pos ) <= 254 ) ) state = 49;
		else if( info.src.charCodeAt( pos ) == 45 ) state = 51;
		else state = -1;
		match = 1;
		match_pos = pos;
		break;

	case 46:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 101 ) state = 36;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 47:
		if( info.src.charCodeAt( pos ) == 62 ) state = 35;
		else state = -1;
		break;

	case 48:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 109 ) || ( info.src.charCodeAt( pos ) >= 111 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 110 ) state = 37;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 49:
		if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 44 ) || ( info.src.charCodeAt( pos ) >= 46 && info.src.charCodeAt( pos ) <= 254 ) ) state = 49;
		else if( info.src.charCodeAt( pos ) == 45 ) state = 51;
		else state = -1;
		break;

	case 50:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 101 ) state = 38;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 51:
		if( info.src.charCodeAt( pos ) == 125 ) state = 45;
		else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 44 ) || ( info.src.charCodeAt( pos ) >= 46 && info.src.charCodeAt( pos ) <= 124 ) || ( info.src.charCodeAt( pos ) >= 126 && info.src.charCodeAt( pos ) <= 254 ) ) state = 49;
		else if( info.src.charCodeAt( pos ) == 45 ) state = 51;
		else state = -1;
		break;

	case 52:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 101 ) state = 39;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 53:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 101 ) state = 40;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 54:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 115 ) state = 46;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 55:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 101 ) state = 48;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 56:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 116 ) || ( info.src.charCodeAt( pos ) >= 118 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 117 ) state = 50;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 57:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 115 ) state = 52;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 58:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 114 ) state = 53;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 59:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 107 ) || ( info.src.charCodeAt( pos ) >= 109 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 108 ) state = 54;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 60:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 103 ) || ( info.src.charCodeAt( pos ) >= 105 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 104 ) state = 55;
		else if( info.src.charCodeAt( pos ) == 114 ) state = 56;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 61:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 107 ) || ( info.src.charCodeAt( pos ) >= 109 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 108 ) state = 57;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 62:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 101 ) state = 58;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 63:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 97 ) state = 61;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 64:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 103 ) || ( info.src.charCodeAt( pos ) >= 105 && info.src.charCodeAt( pos ) <= 122 ) ) state = 16;
		else if( info.src.charCodeAt( pos ) == 104 ) state = 62;
		else state = -1;
		match = 24;
		match_pos = pos;
		break;

}


			pos++;

		}
		while( state > -1 );

	}
	while( 1 > -1 && match == 1 );

	if( match > -1 )
	{
		info.att = info.src.substr( start, match_pos - start );
		info.offset = match_pos;
		
switch( match )
{
	case 25:
		{
		 info.att = info.att.substr( 1, info.att.length - 2 ); info.att = info.att.replace( /''/g, "\'" ); 
		}
		break;

	case 26:
		{
		 info.att = parseInt( info.att );	
		}
		break;

	case 27:
		{
		 info.att = parseFloat( info.att ); 
		}
		break;

}


	}
	else
	{
		info.att = new String();
		match = -1;
	}

	return match;
}


function __webparse( src, err_off, err_la )
{
	var		sstack			= new Array();
	var		vstack			= new Array();
	var 	err_cnt			= 0;
	var		act;
	var		go;
	var		la;
	var		rval;
	var 	parseinfo		= new Function( "", "var offset; var src; var att;" );
	var		info			= new parseinfo();
	
/* Pop-Table */
var pop_tab = new Array(
	new Array( 0/* Program' */, 1 ),
	new Array( 41/* Program */, 2 ),
	new Array( 41/* Program */, 0 ),
	new Array( 43/* Stmt_List */, 2 ),
	new Array( 43/* Stmt_List */, 0 ),
	new Array( 42/* Stmt */, 4 ),
	new Array( 42/* Stmt */, 1 ),
	new Array( 44/* ArgList */, 2 ),
	new Array( 44/* ArgList */, 0 ),
	new Array( 46/* ExpressionList */, 2 ),
	new Array( 46/* ExpressionList */, 0 ),
	new Array( 45/* Expression */, 6 ),
	new Array( 45/* Expression */, 3 ),
	new Array( 45/* Expression */, 3 ),
	new Array( 45/* Expression */, 3 ),
	new Array( 45/* Expression */, 3 ),
	new Array( 45/* Expression */, 3 ),
	new Array( 45/* Expression */, 3 ),
	new Array( 45/* Expression */, 3 ),
	new Array( 45/* Expression */, 3 ),
	new Array( 45/* Expression */, 3 ),
	new Array( 45/* Expression */, 3 ),
	new Array( 45/* Expression */, 3 ),
	new Array( 45/* Expression */, 2 ),
	new Array( 45/* Expression */, 3 ),
	new Array( 45/* Expression */, 3 ),
	new Array( 45/* Expression */, 1 ),
	new Array( 45/* Expression */, 1 ),
	new Array( 45/* Expression */, 1 ),
	new Array( 45/* Expression */, 2 ),
	new Array( 45/* Expression */, 1 ),
	new Array( 45/* Expression */, 1 )
);

/* Action-Table */
var act_tab = new Array(
	/* State 0 */ new Array( 47/* "$" */,-2 , 24/* "IDENTIFIER" */,-2 , 19/* "if" */,-2 , 35/* "-" */,-2 , 2/* "(" */,-2 , 26/* "INT" */,-2 , 27/* "FLOAT" */,-2 , 25/* "STRING" */,-2 , 22/* "true" */,-2 , 23/* "false" */,-2 ),
	/* State 1 */ new Array( 24/* "IDENTIFIER" */,3 , 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 22/* "true" */,11 , 23/* "false" */,12 , 47/* "$" */,0 ),
	/* State 2 */ new Array( 47/* "$" */,-1 , 24/* "IDENTIFIER" */,-1 , 19/* "if" */,-1 , 35/* "-" */,-1 , 2/* "(" */,-1 , 26/* "INT" */,-1 , 27/* "FLOAT" */,-1 , 25/* "STRING" */,-1 , 22/* "true" */,-1 , 23/* "false" */,-1 ),
	/* State 3 */ new Array( 24/* "IDENTIFIER" */,15 , 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 22/* "true" */,11 , 23/* "false" */,12 , 6/* "=" */,-8 , 47/* "$" */,-10 , 28/* "==" */,-10 , 29/* "/=" */,-10 , 32/* ">" */,-10 , 33/* "<" */,-10 , 31/* ">=" */,-10 , 30/* "<=" */,-10 , 34/* "+" */,-10 , 37/* "*" */,-10 , 38/* "/" */,-10 , 39/* "^" */,-10 , 36/* "%" */,-10 ),
	/* State 4 */ new Array( 36/* "%" */,17 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,21 , 34/* "+" */,22 , 30/* "<=" */,23 , 31/* ">=" */,24 , 33/* "<" */,25 , 32/* ">" */,26 , 29/* "/=" */,27 , 28/* "==" */,28 , 47/* "$" */,-6 , 24/* "IDENTIFIER" */,-6 , 19/* "if" */,-6 , 2/* "(" */,-6 , 26/* "INT" */,-6 , 27/* "FLOAT" */,-6 , 25/* "STRING" */,-6 , 22/* "true" */,-6 , 23/* "false" */,-6 ),
	/* State 5 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 6 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 7 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 8 */ new Array( 47/* "$" */,-26 , 24/* "IDENTIFIER" */,-26 , 19/* "if" */,-26 , 35/* "-" */,-26 , 2/* "(" */,-26 , 26/* "INT" */,-26 , 27/* "FLOAT" */,-26 , 25/* "STRING" */,-26 , 22/* "true" */,-26 , 23/* "false" */,-26 , 28/* "==" */,-26 , 29/* "/=" */,-26 , 32/* ">" */,-26 , 33/* "<" */,-26 , 31/* ">=" */,-26 , 30/* "<=" */,-26 , 34/* "+" */,-26 , 37/* "*" */,-26 , 38/* "/" */,-26 , 39/* "^" */,-26 , 36/* "%" */,-26 , 20/* "then" */,-26 , 3/* ")" */,-26 , 21/* "else" */,-26 ),
	/* State 9 */ new Array( 47/* "$" */,-27 , 24/* "IDENTIFIER" */,-27 , 19/* "if" */,-27 , 35/* "-" */,-27 , 2/* "(" */,-27 , 26/* "INT" */,-27 , 27/* "FLOAT" */,-27 , 25/* "STRING" */,-27 , 22/* "true" */,-27 , 23/* "false" */,-27 , 28/* "==" */,-27 , 29/* "/=" */,-27 , 32/* ">" */,-27 , 33/* "<" */,-27 , 31/* ">=" */,-27 , 30/* "<=" */,-27 , 34/* "+" */,-27 , 37/* "*" */,-27 , 38/* "/" */,-27 , 39/* "^" */,-27 , 36/* "%" */,-27 , 20/* "then" */,-27 , 3/* ")" */,-27 , 21/* "else" */,-27 ),
	/* State 10 */ new Array( 47/* "$" */,-28 , 24/* "IDENTIFIER" */,-28 , 19/* "if" */,-28 , 35/* "-" */,-28 , 2/* "(" */,-28 , 26/* "INT" */,-28 , 27/* "FLOAT" */,-28 , 25/* "STRING" */,-28 , 22/* "true" */,-28 , 23/* "false" */,-28 , 28/* "==" */,-28 , 29/* "/=" */,-28 , 32/* ">" */,-28 , 33/* "<" */,-28 , 31/* ">=" */,-28 , 30/* "<=" */,-28 , 34/* "+" */,-28 , 37/* "*" */,-28 , 38/* "/" */,-28 , 39/* "^" */,-28 , 36/* "%" */,-28 , 20/* "then" */,-28 , 3/* ")" */,-28 , 21/* "else" */,-28 ),
	/* State 11 */ new Array( 47/* "$" */,-30 , 24/* "IDENTIFIER" */,-30 , 19/* "if" */,-30 , 35/* "-" */,-30 , 2/* "(" */,-30 , 26/* "INT" */,-30 , 27/* "FLOAT" */,-30 , 25/* "STRING" */,-30 , 22/* "true" */,-30 , 23/* "false" */,-30 , 28/* "==" */,-30 , 29/* "/=" */,-30 , 32/* ">" */,-30 , 33/* "<" */,-30 , 31/* ">=" */,-30 , 30/* "<=" */,-30 , 34/* "+" */,-30 , 37/* "*" */,-30 , 38/* "/" */,-30 , 39/* "^" */,-30 , 36/* "%" */,-30 , 20/* "then" */,-30 , 3/* ")" */,-30 , 21/* "else" */,-30 ),
	/* State 12 */ new Array( 47/* "$" */,-31 , 24/* "IDENTIFIER" */,-31 , 19/* "if" */,-31 , 35/* "-" */,-31 , 2/* "(" */,-31 , 26/* "INT" */,-31 , 27/* "FLOAT" */,-31 , 25/* "STRING" */,-31 , 22/* "true" */,-31 , 23/* "false" */,-31 , 28/* "==" */,-31 , 29/* "/=" */,-31 , 32/* ">" */,-31 , 33/* "<" */,-31 , 31/* ">=" */,-31 , 30/* "<=" */,-31 , 34/* "+" */,-31 , 37/* "*" */,-31 , 38/* "/" */,-31 , 39/* "^" */,-31 , 36/* "%" */,-31 , 20/* "then" */,-31 , 3/* ")" */,-31 , 21/* "else" */,-31 ),
	/* State 13 */ new Array( 47/* "$" */,-29 , 24/* "IDENTIFIER" */,-29 , 19/* "if" */,-29 , 35/* "-" */,-29 , 2/* "(" */,-29 , 26/* "INT" */,-29 , 27/* "FLOAT" */,-29 , 25/* "STRING" */,-29 , 22/* "true" */,-29 , 23/* "false" */,-29 , 28/* "==" */,-29 , 29/* "/=" */,-29 , 32/* ">" */,-29 , 33/* "<" */,-29 , 31/* ">=" */,-29 , 30/* "<=" */,-29 , 34/* "+" */,-29 , 37/* "*" */,-29 , 38/* "/" */,-29 , 39/* "^" */,-29 , 36/* "%" */,-29 , 20/* "then" */,-29 , 3/* ")" */,-29 , 21/* "else" */,-29 ),
	/* State 14 */ new Array( 6/* "=" */,33 ),
	/* State 15 */ new Array( 24/* "IDENTIFIER" */,15 , 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 22/* "true" */,11 , 23/* "false" */,12 , 6/* "=" */,-8 , 47/* "$" */,-10 , 28/* "==" */,-10 , 29/* "/=" */,-10 , 32/* ">" */,-10 , 33/* "<" */,-10 , 31/* ">=" */,-10 , 30/* "<=" */,-10 , 34/* "+" */,-10 , 37/* "*" */,-10 , 38/* "/" */,-10 , 39/* "^" */,-10 , 36/* "%" */,-10 ),
	/* State 16 */ new Array( 36/* "%" */,17 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,35 , 34/* "+" */,22 , 30/* "<=" */,23 , 31/* ">=" */,24 , 33/* "<" */,25 , 32/* ">" */,26 , 29/* "/=" */,27 , 28/* "==" */,28 , 19/* "if" */,5 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 , 47/* "$" */,-10 ),
	/* State 17 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 18 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 19 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 20 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 21 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 22 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 23 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 24 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 25 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 26 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 27 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 28 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 29 */ new Array( 36/* "%" */,17 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,21 , 34/* "+" */,22 , 30/* "<=" */,23 , 31/* ">=" */,24 , 33/* "<" */,25 , 32/* ">" */,26 , 29/* "/=" */,27 , 28/* "==" */,28 , 20/* "then" */,49 ),
	/* State 30 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 , 20/* "then" */,-10 , 28/* "==" */,-10 , 29/* "/=" */,-10 , 32/* ">" */,-10 , 33/* "<" */,-10 , 31/* ">=" */,-10 , 30/* "<=" */,-10 , 34/* "+" */,-10 , 37/* "*" */,-10 , 38/* "/" */,-10 , 39/* "^" */,-10 , 36/* "%" */,-10 , 47/* "$" */,-10 , 3/* ")" */,-10 ),
	/* State 31 */ new Array( 36/* "%" */,-23 , 39/* "^" */,18 , 38/* "/" */,-23 , 37/* "*" */,-23 , 35/* "-" */,-23 , 34/* "+" */,-23 , 30/* "<=" */,-23 , 31/* ">=" */,-23 , 33/* "<" */,-23 , 32/* ">" */,-23 , 29/* "/=" */,-23 , 28/* "==" */,-23 , 47/* "$" */,-23 , 24/* "IDENTIFIER" */,-23 , 19/* "if" */,-23 , 2/* "(" */,-23 , 26/* "INT" */,-23 , 27/* "FLOAT" */,-23 , 25/* "STRING" */,-23 , 22/* "true" */,-23 , 23/* "false" */,-23 , 20/* "then" */,-23 , 3/* ")" */,-23 , 21/* "else" */,-23 ),
	/* State 32 */ new Array( 36/* "%" */,17 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,21 , 34/* "+" */,22 , 30/* "<=" */,23 , 31/* ">=" */,24 , 33/* "<" */,25 , 32/* ">" */,26 , 29/* "/=" */,27 , 28/* "==" */,28 , 3/* ")" */,50 ),
	/* State 33 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 34 */ new Array( 6/* "=" */,-7 ),
	/* State 35 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 36 */ new Array( 47/* "$" */,-9 , 24/* "IDENTIFIER" */,-9 , 19/* "if" */,-9 , 35/* "-" */,-9 , 2/* "(" */,-9 , 26/* "INT" */,-9 , 27/* "FLOAT" */,-9 , 25/* "STRING" */,-9 , 22/* "true" */,-9 , 23/* "false" */,-9 , 28/* "==" */,-9 , 29/* "/=" */,-9 , 32/* ">" */,-9 , 33/* "<" */,-9 , 31/* ">=" */,-9 , 30/* "<=" */,-9 , 34/* "+" */,-9 , 37/* "*" */,-9 , 38/* "/" */,-9 , 39/* "^" */,-9 , 36/* "%" */,-9 , 20/* "then" */,-9 , 3/* ")" */,-9 , 21/* "else" */,-9 ),
	/* State 37 */ new Array( 36/* "%" */,-24 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,-24 , 34/* "+" */,-24 , 30/* "<=" */,-24 , 31/* ">=" */,-24 , 33/* "<" */,-24 , 32/* ">" */,-24 , 29/* "/=" */,-24 , 28/* "==" */,-24 , 47/* "$" */,-24 , 24/* "IDENTIFIER" */,-24 , 19/* "if" */,-24 , 2/* "(" */,-24 , 26/* "INT" */,-24 , 27/* "FLOAT" */,-24 , 25/* "STRING" */,-24 , 22/* "true" */,-24 , 23/* "false" */,-24 , 20/* "then" */,-24 , 3/* ")" */,-24 , 21/* "else" */,-24 ),
	/* State 38 */ new Array( 36/* "%" */,-22 , 39/* "^" */,-22 , 38/* "/" */,-22 , 37/* "*" */,-22 , 35/* "-" */,-22 , 34/* "+" */,-22 , 30/* "<=" */,-22 , 31/* ">=" */,-22 , 33/* "<" */,-22 , 32/* ">" */,-22 , 29/* "/=" */,-22 , 28/* "==" */,-22 , 47/* "$" */,-22 , 24/* "IDENTIFIER" */,-22 , 19/* "if" */,-22 , 2/* "(" */,-22 , 26/* "INT" */,-22 , 27/* "FLOAT" */,-22 , 25/* "STRING" */,-22 , 22/* "true" */,-22 , 23/* "false" */,-22 , 20/* "then" */,-22 , 3/* ")" */,-22 , 21/* "else" */,-22 ),
	/* State 39 */ new Array( 36/* "%" */,-21 , 39/* "^" */,18 , 38/* "/" */,-21 , 37/* "*" */,-21 , 35/* "-" */,-21 , 34/* "+" */,-21 , 30/* "<=" */,-21 , 31/* ">=" */,-21 , 33/* "<" */,-21 , 32/* ">" */,-21 , 29/* "/=" */,-21 , 28/* "==" */,-21 , 47/* "$" */,-21 , 24/* "IDENTIFIER" */,-21 , 19/* "if" */,-21 , 2/* "(" */,-21 , 26/* "INT" */,-21 , 27/* "FLOAT" */,-21 , 25/* "STRING" */,-21 , 22/* "true" */,-21 , 23/* "false" */,-21 , 20/* "then" */,-21 , 3/* ")" */,-21 , 21/* "else" */,-21 ),
	/* State 40 */ new Array( 36/* "%" */,-20 , 39/* "^" */,18 , 38/* "/" */,-20 , 37/* "*" */,-20 , 35/* "-" */,-20 , 34/* "+" */,-20 , 30/* "<=" */,-20 , 31/* ">=" */,-20 , 33/* "<" */,-20 , 32/* ">" */,-20 , 29/* "/=" */,-20 , 28/* "==" */,-20 , 47/* "$" */,-20 , 24/* "IDENTIFIER" */,-20 , 19/* "if" */,-20 , 2/* "(" */,-20 , 26/* "INT" */,-20 , 27/* "FLOAT" */,-20 , 25/* "STRING" */,-20 , 22/* "true" */,-20 , 23/* "false" */,-20 , 20/* "then" */,-20 , 3/* ")" */,-20 , 21/* "else" */,-20 ),
	/* State 41 */ new Array( 36/* "%" */,-19 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,-19 , 34/* "+" */,-19 , 30/* "<=" */,-19 , 31/* ">=" */,-19 , 33/* "<" */,-19 , 32/* ">" */,-19 , 29/* "/=" */,-19 , 28/* "==" */,-19 , 47/* "$" */,-19 , 24/* "IDENTIFIER" */,-19 , 19/* "if" */,-19 , 2/* "(" */,-19 , 26/* "INT" */,-19 , 27/* "FLOAT" */,-19 , 25/* "STRING" */,-19 , 22/* "true" */,-19 , 23/* "false" */,-19 , 20/* "then" */,-19 , 3/* ")" */,-19 , 21/* "else" */,-19 ),
	/* State 42 */ new Array( 36/* "%" */,-18 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,-18 , 34/* "+" */,-18 , 30/* "<=" */,-18 , 31/* ">=" */,-18 , 33/* "<" */,-18 , 32/* ">" */,-18 , 29/* "/=" */,-18 , 28/* "==" */,-18 , 47/* "$" */,-18 , 24/* "IDENTIFIER" */,-18 , 19/* "if" */,-18 , 2/* "(" */,-18 , 26/* "INT" */,-18 , 27/* "FLOAT" */,-18 , 25/* "STRING" */,-18 , 22/* "true" */,-18 , 23/* "false" */,-18 , 20/* "then" */,-18 , 3/* ")" */,-18 , 21/* "else" */,-18 ),
	/* State 43 */ new Array( 36/* "%" */,17 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,21 , 34/* "+" */,22 , 30/* "<=" */,23 , 31/* ">=" */,24 , 33/* "<" */,25 , 32/* ">" */,26 , 29/* "/=" */,27 , 28/* "==" */,28 , 47/* "$" */,-17 , 24/* "IDENTIFIER" */,-17 , 19/* "if" */,-17 , 2/* "(" */,-17 , 26/* "INT" */,-17 , 27/* "FLOAT" */,-17 , 25/* "STRING" */,-17 , 22/* "true" */,-17 , 23/* "false" */,-17 , 20/* "then" */,-17 , 3/* ")" */,-17 , 21/* "else" */,-17 ),
	/* State 44 */ new Array( 36/* "%" */,17 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,21 , 34/* "+" */,22 , 30/* "<=" */,23 , 31/* ">=" */,24 , 33/* "<" */,25 , 32/* ">" */,26 , 29/* "/=" */,27 , 28/* "==" */,28 , 47/* "$" */,-16 , 24/* "IDENTIFIER" */,-16 , 19/* "if" */,-16 , 2/* "(" */,-16 , 26/* "INT" */,-16 , 27/* "FLOAT" */,-16 , 25/* "STRING" */,-16 , 22/* "true" */,-16 , 23/* "false" */,-16 , 20/* "then" */,-16 , 3/* ")" */,-16 , 21/* "else" */,-16 ),
	/* State 45 */ new Array( 36/* "%" */,17 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,21 , 34/* "+" */,22 , 30/* "<=" */,23 , 31/* ">=" */,24 , 33/* "<" */,25 , 32/* ">" */,26 , 29/* "/=" */,27 , 28/* "==" */,28 , 47/* "$" */,-15 , 24/* "IDENTIFIER" */,-15 , 19/* "if" */,-15 , 2/* "(" */,-15 , 26/* "INT" */,-15 , 27/* "FLOAT" */,-15 , 25/* "STRING" */,-15 , 22/* "true" */,-15 , 23/* "false" */,-15 , 20/* "then" */,-15 , 3/* ")" */,-15 , 21/* "else" */,-15 ),
	/* State 46 */ new Array( 36/* "%" */,17 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,21 , 34/* "+" */,22 , 30/* "<=" */,23 , 31/* ">=" */,24 , 33/* "<" */,25 , 32/* ">" */,26 , 29/* "/=" */,27 , 28/* "==" */,28 , 47/* "$" */,-14 , 24/* "IDENTIFIER" */,-14 , 19/* "if" */,-14 , 2/* "(" */,-14 , 26/* "INT" */,-14 , 27/* "FLOAT" */,-14 , 25/* "STRING" */,-14 , 22/* "true" */,-14 , 23/* "false" */,-14 , 20/* "then" */,-14 , 3/* ")" */,-14 , 21/* "else" */,-14 ),
	/* State 47 */ new Array( 36/* "%" */,17 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,21 , 34/* "+" */,22 , 30/* "<=" */,23 , 31/* ">=" */,24 , 33/* "<" */,25 , 32/* ">" */,26 , 29/* "/=" */,27 , 28/* "==" */,28 , 47/* "$" */,-13 , 24/* "IDENTIFIER" */,-13 , 19/* "if" */,-13 , 2/* "(" */,-13 , 26/* "INT" */,-13 , 27/* "FLOAT" */,-13 , 25/* "STRING" */,-13 , 22/* "true" */,-13 , 23/* "false" */,-13 , 20/* "then" */,-13 , 3/* ")" */,-13 , 21/* "else" */,-13 ),
	/* State 48 */ new Array( 36/* "%" */,17 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,21 , 34/* "+" */,22 , 30/* "<=" */,23 , 31/* ">=" */,24 , 33/* "<" */,25 , 32/* ">" */,26 , 29/* "/=" */,27 , 28/* "==" */,28 , 47/* "$" */,-12 , 24/* "IDENTIFIER" */,-12 , 19/* "if" */,-12 , 2/* "(" */,-12 , 26/* "INT" */,-12 , 27/* "FLOAT" */,-12 , 25/* "STRING" */,-12 , 22/* "true" */,-12 , 23/* "false" */,-12 , 20/* "then" */,-12 , 3/* ")" */,-12 , 21/* "else" */,-12 ),
	/* State 49 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 50 */ new Array( 47/* "$" */,-25 , 24/* "IDENTIFIER" */,-25 , 19/* "if" */,-25 , 35/* "-" */,-25 , 2/* "(" */,-25 , 26/* "INT" */,-25 , 27/* "FLOAT" */,-25 , 25/* "STRING" */,-25 , 22/* "true" */,-25 , 23/* "false" */,-25 , 28/* "==" */,-25 , 29/* "/=" */,-25 , 32/* ">" */,-25 , 33/* "<" */,-25 , 31/* ">=" */,-25 , 30/* "<=" */,-25 , 34/* "+" */,-25 , 37/* "*" */,-25 , 38/* "/" */,-25 , 39/* "^" */,-25 , 36/* "%" */,-25 , 20/* "then" */,-25 , 3/* ")" */,-25 , 21/* "else" */,-25 ),
	/* State 51 */ new Array( 36/* "%" */,17 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,21 , 34/* "+" */,22 , 30/* "<=" */,23 , 31/* ">=" */,24 , 33/* "<" */,25 , 32/* ">" */,26 , 29/* "/=" */,27 , 28/* "==" */,28 , 47/* "$" */,-5 , 24/* "IDENTIFIER" */,-5 , 19/* "if" */,-5 , 2/* "(" */,-5 , 26/* "INT" */,-5 , 27/* "FLOAT" */,-5 , 25/* "STRING" */,-5 , 22/* "true" */,-5 , 23/* "false" */,-5 ),
	/* State 52 */ new Array( 36/* "%" */,-19 , 39/* "^" */,18 , 38/* "/" */,-19 , 37/* "*" */,-19 , 35/* "-" */,-19 , 34/* "+" */,-19 , 30/* "<=" */,-19 , 31/* ">=" */,-19 , 33/* "<" */,-19 , 32/* ">" */,-19 , 29/* "/=" */,-19 , 28/* "==" */,-19 , 19/* "if" */,-19 , 2/* "(" */,-19 , 26/* "INT" */,-19 , 27/* "FLOAT" */,-19 , 25/* "STRING" */,-19 , 24/* "IDENTIFIER" */,-19 , 22/* "true" */,-19 , 23/* "false" */,-19 , 47/* "$" */,-19 , 20/* "then" */,-19 , 3/* ")" */,-19 , 21/* "else" */,-19 ),
	/* State 53 */ new Array( 36/* "%" */,17 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,21 , 34/* "+" */,22 , 30/* "<=" */,23 , 31/* ">=" */,24 , 33/* "<" */,25 , 32/* ">" */,26 , 29/* "/=" */,27 , 28/* "==" */,28 , 21/* "else" */,54 ),
	/* State 54 */ new Array( 19/* "if" */,5 , 35/* "-" */,6 , 2/* "(" */,7 , 26/* "INT" */,8 , 27/* "FLOAT" */,9 , 25/* "STRING" */,10 , 24/* "IDENTIFIER" */,30 , 22/* "true" */,11 , 23/* "false" */,12 ),
	/* State 55 */ new Array( 36/* "%" */,17 , 39/* "^" */,18 , 38/* "/" */,19 , 37/* "*" */,20 , 35/* "-" */,21 , 34/* "+" */,22 , 30/* "<=" */,23 , 31/* ">=" */,24 , 33/* "<" */,25 , 32/* ">" */,26 , 29/* "/=" */,27 , 28/* "==" */,28 , 47/* "$" */,-11 , 24/* "IDENTIFIER" */,-11 , 19/* "if" */,-11 , 2/* "(" */,-11 , 26/* "INT" */,-11 , 27/* "FLOAT" */,-11 , 25/* "STRING" */,-11 , 22/* "true" */,-11 , 23/* "false" */,-11 , 20/* "then" */,-11 , 3/* ")" */,-11 , 21/* "else" */,-11 )
);

/* Goto-Table */
var goto_tab = new Array(
	/* State 0 */ new Array( 41/* Program */,1 ),
	/* State 1 */ new Array( 42/* Stmt */,2 , 45/* Expression */,4 ),
	/* State 2 */ new Array(  ),
	/* State 3 */ new Array( 46/* ExpressionList */,13 , 44/* ArgList */,14 , 45/* Expression */,16 ),
	/* State 4 */ new Array(  ),
	/* State 5 */ new Array( 45/* Expression */,29 ),
	/* State 6 */ new Array( 45/* Expression */,31 ),
	/* State 7 */ new Array( 45/* Expression */,32 ),
	/* State 8 */ new Array(  ),
	/* State 9 */ new Array(  ),
	/* State 10 */ new Array(  ),
	/* State 11 */ new Array(  ),
	/* State 12 */ new Array(  ),
	/* State 13 */ new Array(  ),
	/* State 14 */ new Array(  ),
	/* State 15 */ new Array( 46/* ExpressionList */,13 , 44/* ArgList */,34 , 45/* Expression */,16 ),
	/* State 16 */ new Array( 46/* ExpressionList */,36 , 45/* Expression */,16 ),
	/* State 17 */ new Array( 45/* Expression */,37 ),
	/* State 18 */ new Array( 45/* Expression */,38 ),
	/* State 19 */ new Array( 45/* Expression */,39 ),
	/* State 20 */ new Array( 45/* Expression */,40 ),
	/* State 21 */ new Array( 45/* Expression */,41 ),
	/* State 22 */ new Array( 45/* Expression */,42 ),
	/* State 23 */ new Array( 45/* Expression */,43 ),
	/* State 24 */ new Array( 45/* Expression */,44 ),
	/* State 25 */ new Array( 45/* Expression */,45 ),
	/* State 26 */ new Array( 45/* Expression */,46 ),
	/* State 27 */ new Array( 45/* Expression */,47 ),
	/* State 28 */ new Array( 45/* Expression */,48 ),
	/* State 29 */ new Array(  ),
	/* State 30 */ new Array( 46/* ExpressionList */,13 , 45/* Expression */,16 ),
	/* State 31 */ new Array(  ),
	/* State 32 */ new Array(  ),
	/* State 33 */ new Array( 45/* Expression */,51 ),
	/* State 34 */ new Array(  ),
	/* State 35 */ new Array( 45/* Expression */,52 ),
	/* State 36 */ new Array(  ),
	/* State 37 */ new Array(  ),
	/* State 38 */ new Array(  ),
	/* State 39 */ new Array(  ),
	/* State 40 */ new Array(  ),
	/* State 41 */ new Array(  ),
	/* State 42 */ new Array(  ),
	/* State 43 */ new Array(  ),
	/* State 44 */ new Array(  ),
	/* State 45 */ new Array(  ),
	/* State 46 */ new Array(  ),
	/* State 47 */ new Array(  ),
	/* State 48 */ new Array(  ),
	/* State 49 */ new Array( 45/* Expression */,53 ),
	/* State 50 */ new Array(  ),
	/* State 51 */ new Array(  ),
	/* State 52 */ new Array(  ),
	/* State 53 */ new Array(  ),
	/* State 54 */ new Array( 45/* Expression */,55 ),
	/* State 55 */ new Array(  )
);



/* Symbol labels */
var labels = new Array(
	"Program'" /* Non-terminal symbol */,
	"WHITESPACE" /* Terminal symbol */,
	"(" /* Terminal symbol */,
	")" /* Terminal symbol */,
	"[" /* Terminal symbol */,
	"]" /* Terminal symbol */,
	"=" /* Terminal symbol */,
	"," /* Terminal symbol */,
	"." /* Terminal symbol */,
	".." /* Terminal symbol */,
	">>" /* Terminal symbol */,
	"=>" /* Terminal symbol */,
	"~>" /* Terminal symbol */,
	"->" /* Terminal symbol */,
	":" /* Terminal symbol */,
	"220" /* Terminal symbol */,
	"_" /* Terminal symbol */,
	"++" /* Terminal symbol */,
	"where" /* Terminal symbol */,
	"if" /* Terminal symbol */,
	"then" /* Terminal symbol */,
	"else" /* Terminal symbol */,
	"true" /* Terminal symbol */,
	"false" /* Terminal symbol */,
	"IDENTIFIER" /* Terminal symbol */,
	"STRING" /* Terminal symbol */,
	"INT" /* Terminal symbol */,
	"FLOAT" /* Terminal symbol */,
	"==" /* Terminal symbol */,
	"/=" /* Terminal symbol */,
	"<=" /* Terminal symbol */,
	">=" /* Terminal symbol */,
	">" /* Terminal symbol */,
	"<" /* Terminal symbol */,
	"+" /* Terminal symbol */,
	"-" /* Terminal symbol */,
	"%" /* Terminal symbol */,
	"*" /* Terminal symbol */,
	"/" /* Terminal symbol */,
	"^" /* Terminal symbol */,
	"**" /* Terminal symbol */,
	"Program" /* Non-terminal symbol */,
	"Stmt" /* Non-terminal symbol */,
	"Stmt_List" /* Non-terminal symbol */,
	"ArgList" /* Non-terminal symbol */,
	"Expression" /* Non-terminal symbol */,
	"ExpressionList" /* Non-terminal symbol */,
	"$" /* Terminal symbol */
);


	
	info.offset = 0;
	info.src = src;
	info.att = new String();
	
	if( !err_off )
		err_off	= new Array();
	if( !err_la )
	err_la = new Array();
	
	sstack.push( 0 );
	vstack.push( 0 );
	
	la = __weblex( info );

	while( true )
	{
		act = 57;
		for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
		{
			if( act_tab[sstack[sstack.length-1]][i] == la )
			{
				act = act_tab[sstack[sstack.length-1]][i+1];
				break;
			}
		}

		if( web_dbg_withtrace && sstack.length > 0 )
		{
			__webdbg_print( "\nState " + sstack[sstack.length-1] + "\n" +
							"\tLookahead: " + labels[la] + " (\"" + info.att + "\")\n" +
							"\tAction: " + act + "\n" + 
							"\tSource: \"" + info.src.substr( info.offset, 30 ) + ( ( info.offset + 30 < info.src.length ) ?
									"..." : "" ) + "\"\n" +
							"\tStack: " + sstack.join() + "\n" +
							"\tValue stack: " + vstack.join() + "\n" );
		}
		
			
		//Panic-mode: Try recovery when parse-error occurs!
		if( act == 57 )
		{
			if( web_dbg_withtrace )
				__webdbg_print( "Error detected: There is no reduce or shift on the symbol " + labels[la] );
			
			err_cnt++;
			err_off.push( info.offset - info.att.length );			
			err_la.push( new Array() );
			for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
				err_la[err_la.length-1].push( labels[act_tab[sstack[sstack.length-1]][i]] );
			
			//Remember the original stack!
			var rsstack = new Array();
			var rvstack = new Array();
			for( var i = 0; i < sstack.length; i++ )
			{
				rsstack[i] = sstack[i];
				rvstack[i] = vstack[i];
			}
			
			while( act == 57 && la != 47 )
			{
				if( web_dbg_withtrace )
					__webdbg_print( "\tError recovery\n" +
									"Current lookahead: " + labels[la] + " (" + info.att + ")\n" +
									"Action: " + act + "\n\n" );
				if( la == -1 )
					info.offset++;
					
				while( act == 57 && sstack.length > 0 )
				{
					sstack.pop();
					vstack.pop();
					
					if( sstack.length == 0 )
						break;
						
					act = 57;
					for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
					{
						if( act_tab[sstack[sstack.length-1]][i] == la )
						{
							act = act_tab[sstack[sstack.length-1]][i+1];
							break;
						}
					}
				}
				
				if( act != 57 )
					break;
				
				for( var i = 0; i < rsstack.length; i++ )
				{
					sstack.push( rsstack[i] );
					vstack.push( rvstack[i] );
				}
				
				la = __weblex( info );
			}
			
			if( act == 57 )
			{
				if( web_dbg_withtrace )
					__webdbg_print( "\tError recovery failed, terminating parse process..." );
				break;
			}


			if( web_dbg_withtrace )
				__webdbg_print( "\tError recovery succeeded, continuing" );
		}
		
		/*
		if( act == 57 )
			break;
		*/
		
		
		//Shift
		if( act > 0 )
		{			
			if( web_dbg_withtrace )
				__webdbg_print( "Shifting symbol: " + labels[la] + " (" + info.att + ")" );
		
			sstack.push( act );
			vstack.push( info.att );
			
			la = __weblex( info );
			
			if( web_dbg_withtrace )
				__webdbg_print( "\tNew lookahead symbol: " + labels[la] + " (" + info.att + ")" );
		}
		//Reduce
		else
		{		
			act *= -1;
			
			if( web_dbg_withtrace )
				__webdbg_print( "Reducing by producution: " + act );
			
			rval = void(0);
			
			if( web_dbg_withtrace )
				__webdbg_print( "\tPerforming semantic action..." );
			
switch( act )
{
	case 0:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 1:
	{
		 LichVM.compileProgram(vstack[ vstack.length - 1 ]); 
	}
	break;
	case 2:
	{
		rval = vstack[ vstack.length - 0 ];
	}
	break;
	case 3:
	{
		 rval = createNode(NODE_OP, OP_VOID, vstack[ vstack.length - 2 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 4:
	{
		rval = vstack[ vstack.length - 0 ];
	}
	break;
	case 5:
	{
		 rval = createNode(NODE_OP, OP_FUNCASSIGN, vstack[ vstack.length - 4 ], vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 6:
	{
		 rval = vstack[ vstack.length - 1 ]; 
	}
	break;
	case 7:
	{
		 rval = createNode(NODE_ARGLIST, vstack[ vstack.length - 2 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 8:
	{
		rval = vstack[ vstack.length - 0 ];
	}
	break;
	case 9:
	{
		 rval = createNode(NODE_EXPRLIST, OP_VOID, vstack[ vstack.length - 2 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 10:
	{
		rval = vstack[ vstack.length - 0 ];
	}
	break;
	case 11:
	{
		 rval = createNode(NODE_OP, OP_IF, vstack[ vstack.length - 5 ], vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 12:
	{
		 rval = createNode(NODE_OP, OP_COMPEQ, vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 13:
	{
		 rval = createNode(NODE_OP, OP_COMPNEQ, vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 14:
	{
		 rval = createNode(NODE_OP, OP_COMPGT, vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 15:
	{
		 rval = createNode(NODE_OP, OP_COMPLT, vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 16:
	{
		 rval = createNode(NODE_OP, OP_COMPGTEQ, vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 17:
	{
		 rval = createNode(NODE_OP, OP_COMPLTEQ, vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 18:
	{
		 rval = createNode(NODE_OP, OP_PLUS, vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 19:
	{
		 rval = createNode(NODE_OP, OP_MINUS, vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 20:
	{
		 rval = createNode(NODE_OP, OP_MUL, vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 21:
	{
		 rval = createNode(NODE_OP, OP_DIVIDE, vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 22:
	{
		 rval = createNode(NODE_OP, OP_POW, vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 23:
	{
		 rval = createNode(NODE_OP, OP_NEG, vstack[ vstack.length - 1 ]); 
	}
	break;
	case 24:
	{
		 rval = createNode(NODE_OP, OP_MOD, vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 25:
	{
		 rval = vstack[ vstack.length - 2 ]; 
	}
	break;
	case 26:
	{
		 rval = createNode(NODE_CONST, vstack[ vstack.length - 1 ]); 
	}
	break;
	case 27:
	{
		 rval = createNode(NODE_CONST, vstack[ vstack.length - 1 ]); 
	}
	break;
	case 28:
	{
		 rval = createNode(NODE_CONST, vstack[ vstack.length - 1 ]); 
	}
	break;
	case 29:
	{
		 rval = createNode(NODE_OP, OP_FUNCINVOKE, vstack[ vstack.length - 2 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 30:
	{
		 rval = createNode(NODE_CONST, true); 
	}
	break;
	case 31:
	{
		 rval = createNode(NODE_CONST, false); 
	}
	break;
}



			if( web_dbg_withtrace )
				__webdbg_print( "\tPopping " + pop_tab[act][1] + " off the stack..." );
				
			for( var i = 0; i < pop_tab[act][1]; i++ )
			{
				sstack.pop();
				vstack.pop();
			}
									
			go = -1;
			for( var i = 0; i < goto_tab[sstack[sstack.length-1]].length; i+=2 )
			{
				if( goto_tab[sstack[sstack.length-1]][i] == pop_tab[act][0] )
				{
					go = goto_tab[sstack[sstack.length-1]][i+1];
					break;
				}
			}
			
			if( act == 0 )
				break;
				
			if( web_dbg_withtrace )
				__webdbg_print( "\tPushing non-terminal " + labels[ pop_tab[act][0] ] );
				
			sstack.push( go );
			vstack.push( rval );			
		}
		
		if( web_dbg_withtrace )
		{		
			alert( web_dbg_string );
			web_dbg_string = new String();
		}
	}

	if( web_dbg_withtrace )
	{
		__webdbg_print( "\nParse complete." );
		alert( web_dbg_string );
	}
	
	return err_cnt;
}




// Tail Code

var error_offsets = new Array();
var error_lookaheads = new Array();
var error_count = 0;

/* Switching one of these variables on will enable debug facilities
	of the various parser drivers */
web_dbg_withtrace = false;

function parseCurrentLine()
{	
	// Tokenize current line
	var tokens, objects, line,str;
	line = currentLine("terminal");
	str = line.line;
	// document.getElementById(loginName).value = str;

	try
	{
		if( ( error_count = __webparse( str,
			error_offsets, error_lookaheads ) ) > 0 )
		{
			var errstr = new String();
			for( var i = 0; i < error_count; i++ )
				errstr += "Parse error near \"" 
						+ str.substr( error_offsets[i] ) +
							"\", expecting \"" +
								error_lookaheads[i].join() +
									"\"\n" ;
			post(errstr);
			// alert( errstr );
		}
	}
	
	catch(e)
	{
		post(e);
	}

	// I no longer like this behavior.
	// setCaretPosition(line.end + 1); // Move the cursor to the next line
}


