var express = require("express");

var app = express();

app.use(express.static("public"));

app.get("/test", function(req, res) {
    res.sendFile(__dirname + "/public/test.html");
});

var server = require("http").Server(app);
var io = require("socket.io")(server);

var players = {};

var width = 500;
var height = 500;

randomMinMax = function(min, max) {
    return Math.random() * (max - min) + min;
}

//Converts hrtime from format [seconds,nanos] to milliseconds.
hrtimeToMillis = function(hrtime) {
    return (hrtime[0] * 1000) + (hrtime[1] / 1000000);
}

initPlayer = function(socketID) {
    var player = {};

    player.x = Math.random() * width;
    player.y = Math.random() * height;
    player.deltaX = 0;
    player.deltaY = 0;
    player.lastMillis = hrtimeToMillis(process.hrtime());

    var colorHex = Math.floor(Math.random() * (Math.pow(16, 6) - 1)).toString(16);
    while (colorHex.length < 6) { //Pads colorHex with zeros.
        colorHex = "0" + colorHex;
    }
    player.color = "#" + colorHex;

    return player;
}

io.on("connection", function(socket) {
    var player = initPlayer(socket.id);
    socket.broadcast.emit("playerConnected", socket.id, player);

    players[socket.id] = player;
    socket.emit("playerList", players);

    console.log("Players:");
    console.log(players);

    socket.on("serverSync", function() {
        socket.emit("serverSync", process.hrtime());
    });

    socket.on("positionUpdate", function(player) {
        players[socket.id].x = player.x;
        players[socket.id].y = player.y;
        players[socket.id].lastMillis = player.lastMillis;
        players[socket.id].deltaX = player.deltaX;
        players[socket.id].deltaY = player.deltaY;
        socket.broadcast.emit("positionUpdate", socket.id, players[socket.id]);
    });

    socket.on("disconnect", function() {
        delete players[socket.id];
        socket.broadcast.emit("playerDisconnected", socket.id);
        console.log(players);
    });
});

server.listen(3000);