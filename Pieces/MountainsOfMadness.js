//In The Darkness

//Runes of warding
//Traps / Curses
// One player, Multiple Monsters

var Tile = function(x,y,type)
{
	this.x = x;
	this.y = y;
	this.type = type;

	BLANK: 		0;
	WALL: 		1;
	DUNGEON: 	2;
	CAVE: 		3;
	LIBRARY: 	4;
	DARK: 		5;
	BRIDGE: 	6;
}

function initGame()
{
	var map = initMap(20,20);

	console.log( mapToString(map) );
}

function initMap(xSize, ySize)
{
	var map = [];

	for(x=0;x<xSize;x++)
	{
		var mapRow = [];
		for(y=0;y<ySize;y++)
		{
			mapRow.push(new Tile(x,y,Tile.BLANK));
		}

		map.push(mapRow);
	}

	return map;
}

function mapToString(map)
{
	var mapString = "map:\n";

	for(x=0;x<map.length;x++)
	{
		for(y=0;y<map[x].length;y++)
		{
			mapString = mapString.concat( tileToString(map[x][y]) );
			mapString = mapString.concat(" "); 
		}
		mapString =  mapString.concat("\n");
	}

	return mapString;
}

function tileToString(tile)
{
	switch(tile.type)
	{
		case Tile.BLANK:
  			return "_";
  		case Tile.WALL:
  			return "+";
		case Tile.DUNGEON:
  			return ".";
		case Tile.CAVE:
  			return "c";
  		case Tile.LIBRARY:
  			return "L";
  		case Tile.DARK:
  			return "?";
		default:
  			return "_";
  	}
}

/*
let blank     = "_"
let wall      = "+"
let dungeon   = "."
let cave      = ","
let library   = "L"
let dark      = "?"
let bridge    = "="

let tile x y t = [x,y,t]
let initMap xSize ySize = map (\x -> map (\y -> tile x y "_") (0..xSize)) (0..ySize)
let zorkMap = initMap 20 20
( zorkMap !! 0 ) !! 1
*/