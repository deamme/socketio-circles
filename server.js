var express = require("express");

var app = express();

app.use(express.static('public'));

app.get('/test', function(req,res){
	res.sendFile(__dirname+'/public/test.html');
});

var server = require('http').Server(app);
var io = require('socket.io')(server);

var players = [];

var width = 500;
var height = 500;

randomMinMax = function(min, max){
    return Math.random() * (max - min) + min;
}

spawnPlayer = function(socketID){
    var player = {};
    var hex = (random() * (Math.pow(16,6) - 1)).toString(16);
    while(hex.length < 6){
    	hex = "0" + hex;
    }
    player.color = "#" + hex;
    player.x = random() * width;
    player.y = random() * height;
    player.id = socketID;

    return player;
}

io.on('connection', function (socket) {
    var player = spawnPlayer(socket.id);
    players.push(player);
    socket.emit('update', players);
    socket.broadcast.emit('update', players);
    console.log(players);
    socket.on('disconnect', function() {
        players.forEach(function(element, index) {
            if (element.id === socket.id) {
                players.splice(index, 1);
            }
        });
        socket.emit('update', players);
        socket.broadcast.emit('update', players);
        console.log(players);
    });
    socket.on('positionUpdate', function(position) {
        players.forEach(function(element, index) {
            if (element.id === socket.id) {
                players[index].x = position.x;
                players[index].y = position.y;
                socket.broadcast.emit('update', players);
            }
        });
    });
});

server.listen(3000);