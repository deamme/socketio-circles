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
var lastMillis = performance.now();
var deltaDivisor = 100;
var bKeyUp, bKeyDown, bKeyLeft, bKeyRight;

document.addEventListener("keydown", function(e) {
	switch(e.keyCode){
	case (37):
		bKeyLeft = true;
		break;
	case (38):
		bKeyUp = true;
		break;
	case (39):
		bKeyRight = true;
		break;
	case (40):
		bKeyDown = true;
		break;
	}
}, false);

document.addEventListener("keyup", function(e) {
	switch(e.keyCode){
	case (37):
		bKeyLeft = false;
		break;
	case (38):
		bKeyUp = false;
		break;
	case (39):
		bKeyRight = false;
		break;
	case (40):
		bKeyDown = false;
		break;
	}
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
});

//Game loop
(gameLoop = function() {
	var deltaX = 0, deltaY = 0;

	if (bKeyLeft)
		deltaX--;
	if (bKeyUp)
		deltaY--;
	if (bKeyRight)
		deltaX++;
	if (bKeyDown)
		deltaY++;

	if (deltaX != 0 && deltaY != 0){
		players.forEach(function(element, index) {
    	    if (element.id === socket.id) {
    	    	var delta = performance.now() - lastMillis;
    	        players[index].x += deltaX * (delta/deltaDivisor);
    	        players[index].y += deltaY * (delta/deltaDivisor);
    	        socket.emit('positionUpdate', {x: players[index].x, y: players[index].y});
    	        lastMillis = lastMillis + delta;
    	    }
    	});
	}

	draw();

	window.requestAnimationFrame(gameLoop);
})();
