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

drawPlayer = function(player){
	context.arc(player.x,player.y,playerRadius,0,TAU);
	context.fillStyle = "#444444";
	context.fill();
}

draw = function(){
	//fillRect();
	for (player in players) {
		drawPlayer(player);
	}
}

var socket = io.connect();

socket.on('newPlayer', function(player) {
	players.push(player);
	draw();
});
