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
var playerRadius = 20;
var playerColor = "333333";
var backgroundColor = "CCCCCC"

drawPlayer = function(player){
	context.beginPath();
	context.arc(player.x,player.y,playerRadius,0,TAU);
	context.fillStyle = playerColor;
	context.fill();
	context.stroke();
}

draw = function(){
	//Draw background
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0,0,width,height);

	//Draw players
	for (player in players) {
		drawPlayer(player);
	}
}

var socket = io.connect();

socket.on('update', function(players) {
	window.players = players;
	draw();
});
