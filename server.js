var express = require("express");

var app = express();

app.use(express.static("public"));

var server = require("http").Server(app);
var io = require("socket.io")(server);

var players = {};

var width = 650;
var height = 650;

randomMinMax = function(min, max) {
    return Math.random() * (max - min) + min;
}

//Converts hrtime from format [seconds,nanos] to milliseconds.
hrtimeToMillis = function(hrtime) {
    return (hrtime[0] * 1000) + (hrtime[1] / 1000000);
}

/**
 * //Code from answer to SO-question on url http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
hslToRgb = function(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t){
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    var rHex = Math.floor(r * 256).toString(16);
    var gHex = Math.floor(g * 256).toString(16);
    var bHex = Math.floor(b * 256).toString(16);

    if (rHex.length == 1) rHex = "0" + rHex;
    if (gHex.length == 1) gHex = "0" + gHex;
    if (bHex.length == 1) bHex = "0" + bHex;

    return ("#" + rHex + gHex + bHex);
    //return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

getRandomColor = function() {
	return hslToRgb(Math.random(),0.75,0.6);

/** Old color function:
 *    var colorHex = Math.floor(Math.random() * (Math.pow(16, 6) - 1)).toString(16); //16^6=256^3
 *    while (colorHex.length < 6) { //Pads colorHex with zeros.
 *        colorHex = "0" + colorHex;
 *    }
 *    return ("#" + colorHex);
 */
}

initPlayer = function(socketID) {
    var player = {};

    player.x = Math.random() * width;
    player.y = Math.random() * height;
    player.deltaX = 0;
    player.deltaY = 0;
    player.lastMillis = hrtimeToMillis(process.hrtime());
    player.color = getRandomColor();

    return player;
}

io.on("connection", function(socket) {
    var clientIP = socket.request.connection.remoteAddress;
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
