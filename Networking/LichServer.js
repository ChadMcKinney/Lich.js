//LichServer.js
var url = require("url"),
    path = require("path"),
    app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    port = 80

app.listen(port);

function handler(request, response) {
  var 
        uri = url.parse(request.url).pathname, 
        filename = path.join(process.cwd(), uri);

    fs.exists = fs.exists || require('path').exists;
    fs.existsSync = fs.existsSync || require('path').existsSync;

    fs.exists(filename, function(exists) 
    {
        if(!exists) 
        {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }
 
        if (fs.statSync(filename).isDirectory()) 
            filename += '/Lich.html';
 
        fs.readFile(filename, "binary", function(err, file) 
        {
            if(err) 
            {        
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }
 
            response.writeHead(200);
            response.write(file, "binary");
            response.end();
        });
    });
}

//Setup websocket code
io.sockets.on('connection', function (socket) {

    socket.on('BroadcastCode', function (data) {
        io.sockets.emit('BroadcastCodeClient',data);
    });

});

console.log("Server running on port:" + port);