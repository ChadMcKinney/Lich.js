/* 
    CloudChamber.js - JavaScript WebGL framework
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

#ifdef GL_ES
precision highp float;
#endif

uniform mat4 mvpMatrix;   // A constant representing the combined model/view/projection matrix.

attribute vec4 position;  // Per-vertex position information we will pass in.
attribute vec4 color;     // Per-vertex color information we will pass in.

varying vec4 vColor;       // This will be passed into the fragment shader.

void main()                 // The entry point for our vertex shader.
{
    vColor = color;      // Pass the color through to the fragment shader.
		  					// It will be interpolated across the triangle.

	// gl_Position is a special variable used to store the final position.
	// Multiply the vertex by the matrix to get the final point in normalized screen coordinates.
	gl_Position = mvpMatrix * position;
}
