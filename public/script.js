var canvas = document.getElementById("canvas");

//Set size
var WIDTH = 600;
var HEIGHT = 600;
canvas.setAttribute("width", WIDTH);
canvas.setAttribute("height", HEIGHT);

//Set context
var context = canvas.getContext("2d");

//Public variables
var MATH_TAU = 2 * Math.PI;
var players;
var RADIUS = 10;
var BACKGROUND_COLOR = "#EEEEEE";
var t_offset;
var DELTA_DIVISOR = 8;
var keyLeft = false,
	keyUp = false,
	keyRight = false,
	keyDown = false;
var lastDeltaX, lastDeltaY;
var SOCKET_ID;
var once = true;

//var counter = 0;

var socket = io.connect();

var requestAdmin = function(passphrase) {
	socket.emit("adminRequest", passphrase);
}

socket.on("adminRequestResponse", function (response) {
	if (response) {
		players[SOCKET_ID].admin = true;
	}
});

socket.on("connect", function() {
	SOCKET_ID = '/#' + socket.id;

	socket.on("playerList", function(playerList) {
		players = playerList;
	});

	socket.on("playerConnected", function(playerID, player) {
		players[playerID] = player;

		//console.log(player);
	});

	socket.on("positionUpdate", function(playerID, player) {
		players[playerID] = player;
	});

	socket.on("playerDisconnected", function(playerID) {
		delete players[playerID];
	});

	//Converts hrtime from format [seconds,nanos] to milliseconds.
	var hrtimeToMillis = function(hrtime) {
		return (hrtime[0] * 1000) + (hrtime[1] / 1000000);
	}

	//Syncronize client time to server time using Network Time Protocol pattern
	socket.on("serverSync", function(t1_t2) {
		var t3 = performance.now();
		t1_t2 = hrtimeToMillis(t1_t2);
		t_offset = ((t1_t2 - t0) + (t1_t2 - t3)) / 2;

		startGame();
	});

	var t0 = performance.now();
	socket.emit("serverSync");

	var toServerTime = function(millis) {
		return millis + t_offset;
	}

	var updateLastDeltas = function() {
		lastDeltaX = players[SOCKET_ID].deltaX;
		lastDeltaY = players[SOCKET_ID].deltaY;
	}

	var updateDeltas = function() {
		players[SOCKET_ID].deltaX = 0;
		players[SOCKET_ID].deltaY = 0;

		if (keyLeft) players[SOCKET_ID].deltaX = -1;
		if (keyUp) players[SOCKET_ID].deltaY = -1;
		if (keyRight) players[SOCKET_ID].deltaX = 1;
		if (keyDown) players[SOCKET_ID].deltaY = 1;
	}

	var deltasChanged = function() {
		return !(lastDeltaX === players[SOCKET_ID].deltaX && lastDeltaY === players[SOCKET_ID].deltaY);
	}

	var emitPositionUpdate = function() {
		socket.emit("positionUpdate", {
			x: players[SOCKET_ID].x,
			y: players[SOCKET_ID].y,
			lastMillis: players[SOCKET_ID].lastMillis,
			deltaX: players[SOCKET_ID].deltaX,
			deltaY: players[SOCKET_ID].deltaY
		});
		//console.log(++counter);
	}

	//Game loop
	var startGame = function() {
		//The following code sets undefined variables for the draw statement to function properly.
		players[SOCKET_ID].lastMillis = toServerTime(performance.now());
		players[SOCKET_ID].deltaX = 0;
		players[SOCKET_ID].deltaY = 0;

		addListeners();
		gameLoop();
	}

	var addListeners = function() {
		document.addEventListener("keydown", function(e) {
			updateLastDeltas();
			switch (e.keyCode) {
				case (37):
					keyLeft = true;
					break;
				case (38):
					keyUp = true;
					break;
				case (39):
					keyRight = true;
					break;
				case (40):
					keyDown = true;
					break;
			}
			updateDeltas();
			if (deltasChanged()) {
				players[SOCKET_ID].lastMillis = toServerTime(performance.now());
				emitPositionUpdate();
			}
		}, false);

		document.addEventListener("keyup", function(e) {
			updateLastDeltas();
			switch (e.keyCode) {
				case (37):
					keyLeft = false;
					break;
				case (38):
					keyUp = false;
					break;
				case (39):
					keyRight = false;
					break;
				case (40):
					keyDown = false;
					break;
			}
			updateDeltas();
			if (deltasChanged()) {
				players[SOCKET_ID].lastMillis = toServerTime(performance.now());
				emitPositionUpdate();
			}
		}, false);
	}

	var gameLoop = function() {
		//calculatePredictedPositions();
		draw();
		window.requestAnimationFrame(gameLoop);
	}

	var draw = function() {
		//Draw background
		context.fillStyle = BACKGROUND_COLOR;
		context.fillRect(0, 0, WIDTH, HEIGHT);

		//Draw players
		for (var playerID in players) {
			drawPlayer(playerID, players[playerID]);
		}
	}

	var drawPlayer = function(playerID, player) {
		var now = performance.now();

		var x = player.x + (player.deltaX * ((toServerTime(now) - player.lastMillis) / DELTA_DIVISOR));
		var y = player.y + (player.deltaY * ((toServerTime(now) - player.lastMillis) / DELTA_DIVISOR));

		if (x < RADIUS) x = RADIUS;
		if (y < RADIUS) y = RADIUS;
		if (x > WIDTH - RADIUS) x = WIDTH - RADIUS;
		if (y > HEIGHT - RADIUS) y = HEIGHT - RADIUS;

		if (playerID === SOCKET_ID) {
			player.x = x;
			player.y = y;
			player.lastMillis = toServerTime(now);
		}

		context.beginPath();
		context.arc(x, y, RADIUS, 0, MATH_TAU);
		if (players[playerID].admin) {
			context.strokeStyle = player.color;
			context.lineWidth = RADIUS/4;
			context.stroke();
		} else {
			context.fillStyle = player.color;
			context.fill();
		}
	}
});
