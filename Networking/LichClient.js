//LichClient.js

var socket;

function connectToWebSocketServer()
{
	socket = io.connect('http://localhost');
	
	socket.on('BroadcastCodeClient', receivedLichCode);

	webSocketTest();
}

function broadcastLichCode(code)
{
	socket.emit('BroadcastCode',code);
}

function receivedLichCode(code)
{
	console.log(code);
}

function webSocketTest()
{
	broadcastLichCode("myTestFunc 10 20");
}