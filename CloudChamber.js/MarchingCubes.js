// Marching Cubes translation by Chad McKinney
// seppukuzombie@gmail.com
// www.chadmckinney.com
// www.glitchlich.com
//
// A translation of Cory Bloyd's C++ implementation found here: http://paulbourke.net/geometry/polygonise/
// This single file (as opposed to the rest of Lich.js), is public domain
// requires THREE.js

// Marching Cubes namespace
MarchingCubes = {}

// Positions list, relative to vertex0, of each ot he 8 vertices of a cube
MarchingCubes.vertexOffset = [
	new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 1, 1, 0 ), new THREE.Vector3( 0, 1, 0 ), 
	new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 1, 0, 1 ), new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 0, 1, 1 )
];

// lists the index of the endpoint vertices for each of the 12 edges of the cube
MarchingCubes.edgeConnection = [
	[ 0, 1 ], [ 1, 2 ], [ 2, 3 ], [ 3, 0 ],
	[ 4, 5 ], [ 5, 6 ], [ 6, 7 ], [ 7, 4 ],
	[ 0, 4 ], [ 1, 5 ], [ 2, 6 ], [ 3, 7 ]
];

// a2fEdgeDirection lists the direction vector(vertex1-vertex0) for each edge in the cube
MarchingCubes.edgeDirection = [
	new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3(-1, 0, 0 ), new THREE.Vector3( 0, -1, 0 ),
	new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3(-1, 0, 0 ), new THREE.Vector3( 0, -1, 0 ),
	new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0,  0, 1 )
];

// Lists the index of the endpoint vertices for each of the 6 edges of the tetrahedron
MarchingCubes.tetrahedronEdgeConnection = [
	[ 0, 1 ], [ 1, 2 ], [ 2, 0 ],
	[ 0, 3 ], [ 1, 3 ], [ 2, 3 ]
];

// lists the index of vertices from a cube that made up each of the six tetrahedrons within the cube
MarchingCubes.tetrahedronsInACube = [
	[ 0, 5, 1, 6 ],
	[ 0, 1, 2, 6 ],
	[ 0, 2, 3, 6 ],
	[ 0, 3, 7, 6 ],
	[ 0, 7, 4, 6 ],
	[ 0, 4, 5, 6 ]
];

// Variables
MarchingCubes.dataSetSize = 4;
MarchingCubes.stepSize = 1 / MarchingCubes.dataSetSize;
MarchingCubes.targetValue = 48;
MarchingCubes.time = 0;
MarchingCubes.sourcePoint = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
MarchingCubes.spin = false;
MarchingCubes.move = true;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MarchingCubes.march is the main interface for external use
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
MarchingCubes.march = function(mesh, targetValue) // targetValue should be within 1 - 1000
{
	MarchingCubes.triangles = new Array();

	// MarchingCubes.targetValue = targetValue;
	// MarchingCubes.dataSetSize = 16;
	// MarchingCubes.stepSize = 1 / MarchingCubes.dataSetSize;
	var stepSize = 1 / MarchingCubes.dataSetSize;

	MarchingCubes.setTime(Math.random() * 10000);

	for(var x = 0; x < MarchingCubes.dataSetSize; ++x)
	{
		for(var y = 0; y < MarchingCubes.dataSetSize; ++y)
		{
			for(z = 0; z < MarchingCubes.dataSetSize; ++z)
			{
				MarchingCubes.marchCube1(new THREE.Vector3(x, y, z).multiplyScalar(stepSize), stepSize);
			}
		}
	}

	return MarchingCubes.triangles;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

MarchingCubes.getOffset = function(value1, value2, valueDesired)
{
	var delta = value2 - value1;

	if(delta == 0)
		return 0.5;
	else
		return (valueDesired - value1) / delta;
}

MarchingCubes.normalizeVector = function(vector)
{
	var result = new THREE.Vector3(0, 0, 0);

	if(vector.length() == 0)
	{
		return vector;
	}

	else
	{
		var scale = 1 / vector.length();
		return vector.multiplyScalar(scale);
	}
}

MarchingCubes.setTime = function(newTime)
{
	var offset, sourceNum;

	for(sourceNum = 0; sourceNum < 3; ++sourceNum)
	{
		MarchingCubes.sourcePoint[sourceNum] = new THREE.Vector3(0.5, 0.5, 0.5);
	}

	MarchingCubes.time = newTime;
	offset = 1 + Math.sin(MarchingCubes.time);
	MarchingCubes.sourcePoint[0].setX(MarchingCubes.sourcePoint[0].x  * offset);
	MarchingCubes.sourcePoint[1].setY(MarchingCubes.sourcePoint[1].y  * offset);
	MarchingCubes.sourcePoint[2].setZ(MarchingCubes.sourcePoint[2].z  * offset);
}

// sample1 finds the distance of the vector from three moving points
MarchingCubes.sample1 = function(vector)
{
	var result = 0;

	var xyz1 = vector.sub(MarchingCubes.sourcePoint[0]);
	result += 0.5 / ((xyz1.x * xyz1.x) + (xyz1.y * xyz1.y) + (xyz1.z * xyz1.z));

	var xyz2 = vector.sub(MarchingCubes.sourcePoint[1]);
	result += 1.0 / ((xyz2.x * xyz2.x) + (xyz2.y * xyz2.y) + (xyz2.z * xyz2.z));

	var xyz3 = vector.sub(MarchingCubes.sourcePoint[2]);
	result += 1.5 / ((xyz3.x * xyz3.x) + (xyz3.y * xyz3.y) + (xyz3.z * xyz3.z));

	return result;
}

// sample2 finds the distance of the vector from three moving lines
MarchingCubes.sample2 = function(vector)
{
	var result = 0;

	var x1 = vector.x - MarchingCubes.sourcePoint[0].x;
	var y1 = vector.y - MarchingCubes.sourcePoint[0].y;
	result += 0.5 / ((x1 * x1) + (y1 * y1));

	var x2 = vector.x - MarchingCubes.sourcePoint[1].x;
	var z1 = vector.z - MarchingCubes.sourcePoint[1].z;
	result += 0.75 / ((x2 * x2) + (z1 * z1));

	var y2 = vector.y - MarchingCubes.sourcePoint[2].y;
	var z2 = vector.z - MarchingCubes.sourcePoint[2].z;
	result += 1.0 / ((y2 * y2) + (z2 * z2));

	return result;
}

// sample3 defines a height field by plugging the distance from the center into the sin and cos functions
MarchingCubes.sample3 = function(vector)
{
	var height = 20 * (MarchingCubes.time + Math.sqrt( ((0.5 - vector.x) * (0.5 - vector.x)) + ((0.5 - vector.y) * (0.5 - vector.y)) ));
	height = 1.5 + 0.1 * (Math.sin(height) + Math.cos(height));
	return (height - vector.z) * 50;
}

// getNormal() finds the gradient of the scalar field at a point
// This gradient can be used as a very accurate vertx normal for lighting calculations
MarchingCubes.getNormal = function(vector)
{
	return MarchingCubes.normalizeVector(
		new THREE.Vector3(
			MarchingCubes.sample1(vector.x - 0.01, vector.y, vector.z) - MarchingCubes.sample1(vector.x + 0.01, vector.y, vector.z),
			MarchingCubes.sample1(vector.x, vector.y - 0.01, vector.z) - MarchingCubes.sample1(vector.x, vector.y + 0.01, vector.z),
			MarchingCubes.sample1(vector.x, vector.y, vector.z - 0.01) - MarchingCubes.sample1(vector.x, vector.y, vector.z + 0.01)
		)
	);
}

// performs the Marching Cubes algorithm on a single cube
MarchingCubes.marchCube1 = function(vector, scale)
{
	var corner, vertex, vertexTest, edge, triangle, flagIndex, edgeFlags;
	var offset, invOffset, value;
	var cubeValue = new Array(8);
	var edgeVertex = new Array(12);
	var edgeNorm = new Array(12);
	offset = invOffset = value = 0;

	// DEMO DATA GENERATION
	// Make a local copy of the values at the cube's corner
	for(vertex = 0; vertex < 8; ++vertex)
	{
		cubeValue[vertex] = Math.random() * MarchingCubes.targetValue * 4 - (MarchingCubes.targetValue);
		/*
		cubeValue[vertex] = MarchingCubes.sample1(new THREE.Vector3(
			vector.x + MarchingCubes.vertexOffset[vertex].x * scale,
			vector.y + MarchingCubes.vertexOffset[vertex].y * scale,
			vector.z + MarchingCubes.vertexOffset[vertex].z * scale
		));*/
	}

	// Find which vertices are inside of the surface and which are outside
	flagIndex = 0;
	for(vertexTest = 0; vertexTest < 8; ++vertexTest)
	{
		if(cubeValue[vertexTest] <= MarchingCubes.targetValue)
			flagIndex |= 1 << vertexTest;
	}

	// Find which vertices are intersected by the surface
	edgeFlags = MarchingCubes.cubeEdgeFlags[flagIndex];

	// If the cube is entirely inside or outside the surface, then there will be no intersections
	if(edgeFlags == 0)
		return;

	// Find the point of intersection of the surface with each edge
	// Then find the normal to the surface at those points
	for(edge = 0; edge < 12; ++edge)
	{
		// if there is an intersection on this edge
		if(edgeFlags & (1 << edge))
		{
			offset = MarchingCubes.getOffset(
				cubeValue[MarchingCubes.edgeConnection[edge][0]], 
				cubeValue[MarchingCubes.edgeConnection[edge][1]],
				MarchingCubes.targetValue
			);

			edgeVertex[edge] = new THREE.Vector3(
				vector.x + ((MarchingCubes.vertexOffset[MarchingCubes.edgeConnection[edge][0]][0] + (offset * MarchingCubes.edgeDirection[edge][0])) * scale),
				vector.y + ((MarchingCubes.vertexOffset[MarchingCubes.edgeConnection[edge][0]][1] + (offset * MarchingCubes.edgeDirection[edge][1])) * scale),
				vector.z + ((MarchingCubes.vertexOffset[MarchingCubes.edgeConnection[edge][0]][2] + (offset * MarchingCubes.edgeDirection[edge][2])) * scale)
			);

			// edgeNorm[edge] = MarchingCubes.getNormal(MarchingCubes.edgeConnection[edge]);
		}
	}

    // collect the triangles that were found, there can be up to 5 per cube
    for(triangle = 0; triangle < 5; ++triangle)
    {
    	if(MarchingCubes.triangleConnectionTable[flagIndex][3 * triangle] < 0)
    		break;

    	for(corner = 0; corner < 3; ++corner)
    	{
    		vertex = MarchingCubes.triangleConnectionTable[flagIndex][3 * triangle + corner];
    		
    		if(vertex > -1)
    		{
    			// CloudChamber.print("> -1");
    			MarchingCubes.triangles.push(edgeVertex[vertex]);
    		}

    		else
    		{
    			// CloudChamber.print("-1");
    		}	
    	}
    }
}

// March Tetrahedron performs the marching tetrahedrons algorithm on a single tetrahedron
MarchingCubes.marchTetrahedron = function(tetrahedronPosition, tetrahedronValue)
{
	var edge, vert0, vert1, edgeFlags, triangle, corner, vertex, flagIndex;
	var offset, invOffset, value;
	var edgeVertex = new Array(6);
	var edgeNorm = new Array(6);

	edge = vert0 = vert1 = edgeFlags = triangle = corner = vertex = flagIndex = offset, invOffset, value = 0;

	// find which vertices are inside of the surface and which are outside
	for(vertex = 0; vertex < 4; ++vertex)
	{
		if(tetrahedronValue[vertex] <= MarchingCubes.targetValue)
			flagIndex |= 1 << vertex;
	}

	// find which edges are intersected by the surface
	edgeFlags = MarchingCubes.tetrahedronEdgeFlags[flagIndex];

	// If the tetrahedron is entirely inside or outside of the surface, then there will be no intersections
	if(edgeFlags == 0)
		return;

	// Find the point of intersection of the surface with each edge
	// Then find the normal to the surface at those points
	for(edge = 0; edge < 6; ++edge)
	{
		// if there is an intersection on this edge
		if(edgeFlags & (1 << edge))
		{
			vert0 = MarchingCubes.tetrahedronEdgeConnection[edge][0];
			vert1 = MarchingCubes.tetrahedronEdgeConnection[edge][1];
			
			offset = MarchingCubes.getOffset(
				tetrahedronValue[vert0],
				tetrahedronValue[vert1],
				MarchingCubes.targetValue
			);

			invOffset = 1 - offset;

			edgeVertex[edge] = new THREE.Vector3(
				(invOffset * tetrahedronPosition[vert0].x) + (offset * tetrahedronPosition[vert1].x),
				(invOffset * tetrahedronPosition[vert0].y) + (offset * tetrahedronPosition[vert1].y),
				(invOffset * tetrahedronPosition[vert0].z) + (offset * tetrahedronPosition[vert1].z)
			)
		}
	}

    // collect the triangles that were found, there can be up to 2 per tetrahedron
    for(triangle = 0; triangle < 2; ++triangle)
    {
    	if(MarchingCubes.tetrahedronTriangles[flagIndex][3 * triangle] < 0)
    		break;

    	for(corner = 0; corner < 3; ++corner)
    	{
    		vertex = MarchingCubes.tetrahedronTriangles[flagIndex][3 * triangle + corner];
    		
    		if(vertex > -1)
    			MarchingCubes.triangles.push(edgeVertex[vertex]);
    	}
    }
}

// marchCube2 performs the marching tetrahedrons algorithm on a single cube by making six calls to marchTetradhedron
MarchingCubes.marchCube2 = function(vector, scale)
{
	var vertex, tetrahedron, vertexInACube;
	var cubePosition = new Array(8);
	var cubeValue = new Array(8);
	var tetrahedronPosition = new Array(4);
	var tetrahedronValue = new Array(4);

	// make a local copy of the cube's corner positions
	for(vertex = 0; vertex < 8; ++vertex)
	{
		cubePosition[vertex] = new THREE.Vector3(
			vector.x + (MarchingCubes.vertexOffset[vertex].x * scale),
			vector.y + (MarchingCubes.vertexOffset[vertex].y * scale),
			vector.z + (MarchingCubes.vertexOffset[vertex].z * scale)
		);
	}

	// Make a local copy of the cube's corner values
	for(vertex = 0; vertex < 8; ++vertex)
	{
		cubeValue[vertex] = MarchingCubes.sample1(cubePosition[vertex]);
	}

	for(tetrahedron = 0; tetrahedron < 6; ++tetrahedron)
	{
		for(vertex = 0; vertex < 4; ++vertex)
		{
			vertexInACube = MarchingCubes.tetrahedronsInACube[tetrahedron][vertex];
			tetrahedronPosition[vertex] = cubePosition[vertexInACube];
			tetrahedronValue[vertex] = cubeValue[vertexInACube];
		}

		MarchingCubes.triangles = MarchingCubes.marchTetradhedron(tetrahedronPosition, tetrahedronValue);
	}
}

// For any edge, if one vertex is inside of the surface and the other is outside of the surface
//  then the edge intersects the surface
// For each of the 4 vertices of the tetrahedron can be two possible states : either inside or outside of the surface
// For any tetrahedron the are 2^4=16 possible sets of vertex states
// This table lists the edges intersected by the surface for all 16 possible vertex states
// There are 6 edges.  For each entry in the table, if edge #n is intersected, then bit #n is set to 1

MarchingCubes.tetrahedronEdgeFlags = [ 0x00, 0x0d, 0x13, 0x1e, 0x26, 0x2b, 0x35, 0x38, 0x38, 0x35, 0x2b, 0x26, 0x1e, 0x13, 0x0d, 0x00 ];

// For each of the possible vertex states listed in tetrahedronEdgeFlags there is a specific triangulation
// of the edge intersection points.  tetrahedronTriangles lists all of them in the form of
// 0-2 edge triples with the list terminated by the invalid value -1.
MarchingCubes.tetrahedronTriangles = [
	[ -1, -1, -1, -1, -1, -1, -1 ],
    [  0,  3,  2, -1, -1, -1, -1 ],
    [  0,  1,  4, -1, -1, -1, -1 ],
    [  1,  4,  2,  2,  4,  3, -1 ],

    [  1,  2,  5, -1, -1, -1, -1 ],
    [  0,  3,  5,  0,  5,  1, -1 ],
    [  0,  2,  5,  0,  5,  4, -1 ],
    [  5,  4,  3, -1, -1, -1, -1 ],

    [  3,  4,  5, -1, -1, -1, -1 ],
    [  4,  5,  0,  5,  2,  0, -1 ],
    [  1,  5,  0,  5,  3,  0, -1 ],
    [  5,  2,  1, -1, -1, -1, -1 ],

    [  3,  4,  2,  2,  4,  1, -1 ],
    [  4,  1,  0, -1, -1, -1, -1 ],
    [  2,  3,  0, -1, -1, -1, -1 ],
    [ -1, -1, -1, -1, -1, -1, -1 ]
];

// For any edge, if one vertex is inside of the surface and the other is outside of the surface
//  then the edge intersects the surface
// For each of the 8 vertices of the cube can be two possible states : either inside or outside of the surface
// For any cube the are 2^8=256 possible sets of vertex states
// This table lists the edges intersected by the surface for all 256 possible vertex states
// There are 12 edges.  For each entry in the table, if edge #n is intersected, then bit #n is set to 1

MarchingCubes.cubeEdgeFlags = [
    0x000, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c, 0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00, 
    0x190, 0x099, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c, 0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90, 
    0x230, 0x339, 0x033, 0x13a, 0x636, 0x73f, 0x435, 0x53c, 0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30, 
    0x3a0, 0x2a9, 0x1a3, 0x0aa, 0x7a6, 0x6af, 0x5a5, 0x4ac, 0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0, 
    0x460, 0x569, 0x663, 0x76a, 0x066, 0x16f, 0x265, 0x36c, 0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60, 
    0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0x0ff, 0x3f5, 0x2fc, 0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0, 
    0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x055, 0x15c, 0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950, 
    0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0x0cc, 0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0, 
    0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc, 0x0cc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0, 
    0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c, 0x15c, 0x055, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650, 
    0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc, 0x2fc, 0x3f5, 0x0ff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0, 
    0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c, 0x36c, 0x265, 0x16f, 0x066, 0x76a, 0x663, 0x569, 0x460, 
    0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac, 0x4ac, 0x5a5, 0x6af, 0x7a6, 0x0aa, 0x1a3, 0x2a9, 0x3a0, 
    0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c, 0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x033, 0x339, 0x230, 
    0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c, 0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x099, 0x190, 
    0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c, 0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x000
];

//  For each of the possible vertex states listed in cubeEdgeFlags there is a specific triangulation
//  of the edge intersection points.  triangleConnectionTable lists all of them in the form of
//  0-5 edge triples with the list terminated by the invalid value -1.
//  For example: triangleConnectionTable[3] list the 2 triangles formed when corner[0] 
//  and corner[1] are inside of the surface, but the rest of the cube is not.
//
//  "I found this table in an example program someone wrote long ago.  It was probably generated by hand"

MarchingCubes.triangleConnectionTable = [
    [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1 ],
    [ 2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1 ],
    [ 8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1 ],
    [ 4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1 ],
    [ 3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1 ],
    [ 4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1 ],
    [ 4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1 ],
    [ 5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1 ],
    [ 2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1 ],
    [ 9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1 ],
    [ 2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1 ],
    [ 10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1 ],
    [ 4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1 ],
    [ 5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1 ],
    [ 5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1 ],
    [ 10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1 ],
    [ 8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1 ],
    [ 2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1 ],
    [ 7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1 ],
    [ 2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1 ],
    [ 11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1 ],
    [ 5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1 ],
    [ 11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1 ],
    [ 11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1 ],
    [ 5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1 ],
    [ 2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1 ],
    [ 5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1 ],
    [ 6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1 ],
    [ 3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1 ],
    [ 6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1 ],
    [ 5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1 ],
    [ 10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1 ],
    [ 6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1 ],
    [ 8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1 ],
    [ 7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1 ],
    [ 3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1 ],
    [ 5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1 ],
    [ 0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1 ],
    [ 9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1 ],
    [ 8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1 ],
    [ 5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1 ],
    [ 0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1 ],
    [ 6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1 ],
    [ 10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1 ],
    [ 10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1 ],
    [ 8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1 ],
    [ 1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1 ],
    [ 0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1 ],
    [ 10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1 ],
    [ 3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1 ],
    [ 6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1 ],
    [ 9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1 ],
    [ 8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1 ],
    [ 3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1 ],
    [ 6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1 ],
    [ 10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1 ],
    [ 10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1 ],
    [ 2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1 ],
    [ 7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1 ],
    [ 7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1 ],
    [ 2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1 ],
    [ 1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1 ],
    [ 11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1 ],
    [ 8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1 ],
    [ 0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1 ],
    [ 7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1 ],
    [ 10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1 ],
    [ 2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1 ],
    [ 6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1 ],
    [ 7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1 ],
    [ 2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1 ],
    [ 10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1 ],
    [ 10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1 ],
    [ 0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1 ],
    [ 7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1 ],
    [ 6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1 ],
    [ 8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1 ],
    [ 6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1 ],
    [ 4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1 ],
    [ 10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1 ],
    [ 8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1 ],
    [ 1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1 ],
    [ 8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1 ],
    [ 10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1 ],
    [ 4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1 ],
    [ 10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1 ],
    [ 5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1 ],
    [ 11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1 ],
    [ 9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1 ],
    [ 6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1 ],
    [ 7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1 ],
    [ 3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1 ],
    [ 7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1 ],
    [ 3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1 ],
    [ 6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1 ],
    [ 9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1 ],
    [ 1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1 ],
    [ 4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1 ],
    [ 7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1 ],
    [ 6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1 ],
    [ 0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1 ],
    [ 6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1 ],
    [ 0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1 ],
    [ 11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1 ],
    [ 6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1 ],
    [ 5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1 ],
    [ 9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1 ],
    [ 1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1 ],
    [ 10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1 ],
    [ 0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1 ],
    [ 5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1 ],
    [ 10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1 ],
    [ 11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1 ],
    [ 9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1 ],
    [ 7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1 ],
    [ 2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1 ],
    [ 8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1 ],
    [ 9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1 ],
    [ 9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1 ],
    [ 1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1 ],
    [ 5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1 ],
    [ 0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1 ],
    [ 10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1 ],
    [ 2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1 ],
    [ 0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1 ],
    [ 0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1 ],
    [ 9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1 ],
    [ 5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1 ],
    [ 5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1 ],
    [ 8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1 ],
    [ 9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1 ],
    [ 1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1 ],
    [ 3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1 ],
    [ 4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1 ],
    [ 9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1 ],
    [ 11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1 ],
    [ 11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1 ],
    [ 2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1 ],
    [ 9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1 ],
    [ 3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1 ],
    [ 1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1 ],
    [ 4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1 ],
    [ 4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1 ],
    [ 0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1 ],
    [ 9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1 ],
    [ 1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ 0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ]
];