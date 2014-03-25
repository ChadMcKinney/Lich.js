//LichServer.js
var url = require("url"),
    path = require("path"),
    app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    port = 80

app.listen(port);

function handler(request, response) {
    var uri = url.parse(request.url).pathname, 
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

var User = function(name, address)
{
    this.name = name;
    this.address = address;
}

var users = new Array();

//Setup websocket code
io.sockets.on('connection', function (socket) {
    var address = socket.handshake.address;
    console.log("New connection from " + address.address + ":" + address.port);

    socket.on('Typing', function (id, text) {
        io.sockets.emit('TypingClient',id, text);
    });

    socket.on('BroadcastCode', function (data) {
        socket.broadcast.emit('BroadcastCodeClient',data);
    });

    socket.on('BroadcastNetEval', function (data) {
        io.sockets.emit('BroadcastCodeClient',data);
    });

    socket.on('StateSync', function (state) {
        io.sockets.emit('StateSyncClient',state);
    });

    socket.on('Chat', function (data) {
        io.sockets.emit('ChatClient',data);
    });

    socket.on('Login',function (name){
        socket.emit('LoginClient');
    });

	socket.on('CursorPos',function(name,x,y){
		io.sockets.emit('CursorPosClient',name,x,y);
	});

    socket.on('LoginInfo', function(name)
    {
        loginInfo(name,address,socket);
    });

    socket.on('disconnect',function()
    {
        disconnect(socket,address);
    });

    socket.on('ReadFile',function(fileName)
    {
        fs.readFile("./Pieces/"+fileName+".lich", 'utf8', function(err, data) {
            try
            {
                if(err) throw err;
            }
            catch(err)
            {
                console.log("couldn't load file: " + fileName);
                console.log(err.message);
            }
        
            socket.emit('ReadFileClient',data);
        });    
    });

    socket.on('CompileLib',function(libName)
    {
        fs.readFile("./Pieces/"+libName+".lich", 'utf8', function(err, data) {
            try
            {
                if(err) throw err;
            }
            catch(err)
            {
                console.log("couldn't load file: " + libName);
                console.log(err.message);
            }
        
            socket.emit('CompileLibClient',data);
        });    
    });
});

function loginInfo(name,address,socket)
{
    console.log("Login information received for: " + name);

    var newUser = new User(name,address);

    if(!containsUsersWithThatName(newUser))
    {
        users.push(newUser);
        io.sockets.emit('CurrentUsers',users);
        printUsers();
    }
    else
    {
        socket.emit('NameTaken');
    }
}

function disconnect(socket,address)
{
    var usersToDelete = [];

    for (var i=0;i<users.length;i++)
    { 
        if(users[i].address == address)
        {
            usersToDelete.push(users[i]);
            console.log("Disconnecting user:" + users[i].name + " - " + users[i].address.address + ":" + users[i].address.port);
        }
    }

    for(i=0;i<usersToDelete.length;i++)
    {
        if( users.indexOf(usersToDelete[i]) > -1)
        {
            remove(users,usersToDelete[i]);
        }
    }

    io.sockets.emit('CurrentUsers',users);
    printUsers();
}

function containsUsersWithThatName(user)
{
    for (var i=0;i<users.length;i++)
    { 
        if(users[i].name == user.name)
        {
            return true;
        }
    }   

    return false;
}

function printUsers()
{
    console.log("CurrentUsers:[\n");
    for (var i=0;i<users.length;i++)
    { 
        console.log("   " + users[i].name + " - " + users[i].address.address + ":" + users[i].address.port + ",\n");
    }
    console.log("];\n");
}

function remove(arr, item) {
    for(var i = arr.length; i--;) {
        if(arr[i] === item) {
            arr.splice(i, 1);
        }
    }
}



console.log("Server running on port:" + port);
