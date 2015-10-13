var express = require("express");

var app = express();

app.use(express.static('public'));

app.get('/test', function(req,res){
	res.sendFile(__dirname+'/public/test.html');
});

var server = require('http').Server(app);
var io = require('socket.io')(server);

var players = [];

randomMinMax = function(min, max){
    return Math.random() * (max - min) + min;
}

spawnPlayer = function(){
    var player;

    player.x = randomMinMax(0,width);
    player.y = randomMinMax(0,height);

    return player;
}

io.on('connection', function (socket) {
    players.push(spawnPlayer());
    console.log(players);
});

server.listen(3000);