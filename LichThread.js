/* 
    Lich.js - JavaScript audio/visual live coding language
    Copyright (C) 2012 Chad McKinney

	http://chadmckinneyaudio.com/
	seppukuzombie@gmail.com

	All rights reserved.
	
	This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301  USA
*/

// LichThread.js

importScripts('Soliton.js');
compileLich();
LichVM.thread = 'worker'; // Not the main thread
LichVM.sleep = 0;

function post(message)
{
	this.postMessage({ print: message });
}

this.addEventListener("message", 
	function(event)
	{
		var threadFunc = deserializeLichObject(event.data.function);
		LichVM.push(threadFunc);
		LichVM.push(LichVM.get("call"));
		LichVM.interpretStack();
		LichVM.printState();
		this.close();
	},
	false
);