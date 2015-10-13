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
    player.x = randomMinMax(0,width);
    player.y = randomMinMax(0,height);
    player.id = socketID;

    return player;
}

io.on('connection', function (socket) {
    players.push(spawnPlayer(socket.id));
    socket.emit('updatePlayers', players);
    socket.broadcast.emit('updatePlayers', players);
    console.log(players);
    socket.on('disconnect', function() {
        players.forEach(function(element, index) {
            if (element.id === socket.id) {
                players.splice(index, 1);
            }
        });
        socket.emit('deletePlayer', players);
        socket.broadcast.emit('deletePlayer', players);
        console.log(players);
    });
});

server.listen(3000);