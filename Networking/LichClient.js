//LichClient.js

var socket;

function connectToWebSocketServer()
{
	socket = io.connect('http://173.203.102.166:80');
	
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