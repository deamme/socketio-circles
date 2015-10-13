var canvas = document.getElementById("canvas");

//Set size
var width = 500;
var height = 500;
canvas.setAttribute("width",width);
canvas.setAttribute("height",height);

//Set context
var context = canvas.getContext("2d");

//Public variables
var TAU = 2*Math.PI;
var players = [];
var playerID;
var playerRadius = 20;
//var playerColor = "#333333";
var backgroundColor = "#CCCCCC";

document.addEventListener("keydown", function(e) {
	var deltaX = 0, deltaY = 0;

	if (e.keyCode === 37)
		deltaX--;
	if (e.keyCode === 38)
		deltaY--;
	if (e.keyCode === 39)
		deltaX++;
	if (e.keyCode === 40)
		deltaY++;

	players.forEach(function(element, index) {
        if (element.id === socket.id) {
            players[index].x += deltaX;
            players[index].y += deltaY;
            socket.emit('positionUpdate', {x: players[index].x, y: players[index].y});
        }
    });

    draw();
}, false);

drawPlayer = function(player){
	context.beginPath();
	context.arc(player.x,player.y,playerRadius,0,TAU);
	context.fillStyle = player.color;
	context.fill();
}

draw = function(){
	//Draw background
	context.fillStyle = backgroundColor;
	context.fillRect(0,0,width,height);

	//Draw players
	players.forEach(function(player) {
        drawPlayer(player);
    });
}

var socket = io.connect();

socket.on('update', function(players) {
	window.players = players;
	draw();
});
