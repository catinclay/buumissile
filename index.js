var theCanvas = document.getElementById("mainCanvas");
// if(screen.width < 400){
// 	theCanvas.width *=2;
// 	theCanvas.height *=2;
// }
var theCanvasHeight = theCanvas.height; 
var theCanvasWidth = theCanvas.width;
var gameOverLabel = document.getElementById("gameOverLabel");
var restartButton = document.getElementById("restartButton");
var scoreLabel = document.getElementById("scoreLabel");
var context = theCanvas.getContext("2d");
context.translate(theCanvasWidth/2,theCanvasHeight/2);
var g_myFirebaseRef = new Firebase("https://fiery-inferno-8152.firebaseio.com/");
var failedSound = new Audio('sounds/faildSound.mp3');
var comboSounds = [
	new Audio('sounds/combo1.mp3'),
	new Audio('sounds/combo2.mp3'),
	new Audio('sounds/combo3.mp3'),
	new Audio('sounds/combo4.mp3'),
	new Audio('sounds/combo5.mp3'),
	new Audio('sounds/combo6.mp3'),
	new Audio('sounds/combo7.mp3'),
	new Audio('sounds/combo8.mp3')
];
failedSound.volume = .2;
for(se in comboSounds){
	se.volume = 1;
}

var flightImage = new Image();
var missileImage = new Image();
var missileSignImage = new Image();
var gasImage = new Image();
var gasSignImage = new Image();
var myFlight;
var targetX;
var targetY;
var speed;
var defaultSpeed;
var turboSpeed;
var clouds;
var cloudsCount = 8;
var missiles;
var missileSpeed = 6.5;
var missileRotateRate = 0.06;
var hp;
var hpDecreaseRate;
var timer;
var time;
var stime;
var gases;
var initCount = 0;
var isTurbo;
var score;
var missilePeriod;
var missileAddPeriod;
var isGamePlaying;
var isGameOver;
var lastLeadScore = 9999999;



function init(){
	clearInterval(timer);
	timer = undefined;
	isGamePlaying = false;
	isGameOver = false;
	theCanvas.style.display = "block";
	drawScreen();
	addListeners(theCanvas, {
		inputUp: inputUpListener,
		inputDown: inputDownListener,
		inputMove: inputMoveListener
	});
	g_myFirebaseRef.child("Scores").once("value",function(snapshot){
		var scArray = snapshot.val();
		scArray.sort(function(a, b){
			return b.score - a.score;
		});
		var lastLeadIndex = Math.min(9, scArray.length-1);
		lastLeadScore = scArray[lastLeadIndex].score;
		var top = -theCanvasHeight/3;
		var left = -theCanvasHeight/4;
		var offset = theCanvasHeight/15;
		// console.log(scArray);
		for(var i = 0; i <Math.min(scArray.length, 10); i++ ){
			context.font = "25px Comic Sans MS";
			context.fillStyle = "black";
			context.textAlign = "left";
			var sc = scArray[i].score;
			var nm = scArray[i].name;
			context.fillText(sc,left, top);
			context.fillText(nm,left+2*offset, top);
			top += offset;
		}
		context.font = "40px Comic Sans MS";
		context.fillStyle = "red";
		context.textAlign = "center";
		context.fillText("Start", 0 , theCanvasHeight/3);
	});
}


function initGame(){
	restartButton.style.display = "none";
	gameOverLabel.style.display = "none";
	scoreLabel.style.display = "none";
	score = 0;
	initClouds();
	initFlight();
	initMissile();
	initGas();
	time = 0;
	stime = 0;
	gamePlaying = true;
	isGameOver =false;
	if(!timer){
		timer = setInterval(onTimerTick, 1000/30);
	}

}

function initClouds(){
	clouds = [];
	var i;
	for(i = 0; i < cloudsCount; ++i){
		clouds.push(new Cloud());
	}
}

function initFlight(){
	myFlight = new Flight(0,0,flightImage);
	targetX = 0;
	targetY = 1;
	defaultSpeed = 5;
	turboSpeed = 7.5;
	speed = defaultSpeed;
	hp = 100;
	hpDecreaseRate = 0.1;
	isTurbo = false;
}

function initMissile() {
	missiles = [];
	missilePeriod = 3000;
	missileAddPeriod = 100;
	var i;
	missiles.push(new Missile(missileImage, missileSpeed, missileRotateRate, missileSignImage, theCanvasWidth,theCanvasHeight));
}

function initGas(){
	gases = [];
	gases.push(new Gas(gasImage, gasSignImage, theCanvasWidth, theCanvasHeight));
}

function gameOver(){
	speed = 0;
	isGameOver = true;
	isGamePlaying = false;

	g_myFirebaseRef.child("Scores").once("value",function(snapshot){
		var index = snapshot.val().length;	
		if(score > lastLeadScore){
			var userName = prompt("Awesome! What's your name?", "Guest");
		
			var updateRef = g_myFirebaseRef.child("Scores/"+index);
			var json = {
				name : userName,
				score : score,
			}
			updateRef.update(json);
		}
	});

	// theCanvas.style.display = "none";
	// gameOverLabel.style.display = "block";
	// restartButton.style.display = "block";
	// scoreLabel.innerHTML = index;
	// scoreLabel.style.display = "block";
	// clearInterval(timer);
}


function inputDownListener(touchX, touchY){
	touchX-= theCanvasWidth/2;
	touchY-= theCanvasHeight/2;
	if(touchY > theCanvasHeight/3.5){
		// console.log("googo");
		if(!isGamePlaying && !isGameOver){
			// isGamePlaying = true;
			// console.log("googo!!!");
			Promise.all(loadPromises).then(initGame);
		}
	}
	if(isGameOver){
		init();
	}
}

function inputMoveListener(touchX, touchY){
	touchX-= theCanvasWidth/2;
	touchY-= theCanvasHeight/2;
	targetX = touchX;
	targetY = touchY;
}

function inputUpListener(touchX, touchY){
	touchX-= theCanvasWidth/2;
	touchY-= theCanvasHeight/2;
	// speed = defaultSpeed;
	// isTurbo = false;
}



function drawScreen() {
	context.fillStyle = "#FFFFFF";
	context.fillRect(-theCanvasWidth/2,-theCanvasHeight/2,theCanvasWidth,theCanvasHeight);
}

function drawFlight() {
	myFlight.rotateToward(targetX, targetY);
	myFlight.drawToContext(context, hp);
}

function drawClouds() {
	var i;
	for(i = 0; i < clouds.length; ++i){
		clouds[i].move(speed, myFlight.getDegree());
		if(clouds[i].outOfBound(theCanvasWidth, theCanvasHeight)){
			clouds[i].reLocate(theCanvasWidth, theCanvasHeight);
		}
		clouds[i].drawToContext(context);
	}
}

function drawMissiles() {
	var i;
	for(i = 0; i < missiles.length; ++i){
		missiles[i].move(speed, myFlight.getDegree());
		if(hp > 0){
			missiles[i].rotateToward(0, 0);
		}
		missiles[i].drawToContext(context);
		if(hp > 0 && !missiles[i].isExploding && missiles[i].hit(0,0)){
			hp-= 10;
			missiles[i].explode();
		}
		var j;
		for(j = i+1; j < missiles.length; ++j){
			if(missiles[i].hit(missiles[j].x,missiles[j].y)){
				missiles[i].explode();
				missiles[j].explode();
			}
		}
	}
	for(i = missiles.length-1; i >= 0; --i){
		if(missiles[i].shouldDestroy){
			missiles.splice(i, 1);
		}
	}
	// console.log(missiles.length);
}

function drawGases() {
	var i;
	for(i = 0; i < gases.length; ++i){
		gases[i].move(speed, myFlight.getDegree());
		gases[i].drawToContext(context);
		if(gases[i].hit(0,0)){
			// console.log("eat");
			gases[i] = new Gas(gasImage, gasSignImage, theCanvasWidth, theCanvasHeight);
			hp=Math.min(100, hp+20);
		}
	}
}

function writeScore(){
	context.font = "30px Comic Sans MS";
	context.fillStyle = "black";
	context.textAlign = "left";
	context.fillText(score,-theCanvasWidth/2.2,-theCanvasHeight/2.3);
}

function writeGameOver(){
	context.font = "40px Comic Sans MS";
	context.fillStyle = "red";
	context.textAlign = "center";
	context.fillText("Game Over", 0 , 0);
	context.font = "20px Comic Sans MS";
	context.fillText("press to try again", 0 , theCanvasHeight/4);
}

function onTimerTick(){
	hp -= hpDecreaseRate;
	drawScreen();
	drawClouds();
	drawMissiles();
	drawGases();
	drawFlight();
	writeScore();
	if(isTurbo){
		hp -= hpDecreaseRate*7;
	}
	if(hp <= 0){ 
		if(!isGameOver){
			gameOver();
		}
		writeGameOver();
	}else{
		time += 1000/30;
		if(time >= missilePeriod){
			time -= missilePeriod;
			missiles.push(new Missile(missileImage, missileSpeed, missileRotateRate, missileSignImage, theCanvasWidth,theCanvasHeight));
			if(missilePeriod>1000){
				missilePeriod -= missileAddPeriod;
			}
		}
		stime += 1000/30;
		if(stime >= 100){
			stime-=100;
			score+=1;
		}
	}
}

// HACK: Consider reconstuct this to class.
function addListeners(canvas, handler){
	canvas.addEventListener('mousedown', _mouseDownListener, false);
	canvas.addEventListener('touchstart', _touchDownListener, false);
	window.addEventListener('mousemove', _mouseMoveListener, false);
	window.addEventListener('touchmove', _touchMoveListener, false);
	window.addEventListener('mouseup', _mouseUpListener, false);
	window.addEventListener('touchend', _touchUpListener, false);

	function _mouseDownListener(evt){
		var bRect = canvas.getBoundingClientRect();
		var touchX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
		var touchY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);
		handler.inputDown(touchX, touchY);
	}

	function _touchDownListener(evt){
		evt.preventDefault();
		evt.stopPropagation();
		var bRect = canvas.getBoundingClientRect();
		var touches = evt.changedTouches;
		var touchX = (touches[0].pageX - bRect.left)*(canvas.width/bRect.width);
		var touchY = (touches[0].pageY - bRect.top)*(canvas.height/bRect.height);
		handler.inputDown(touchX, touchY);
	}

	function _mouseMoveListener(evt){
		var bRect = canvas.getBoundingClientRect();
		var touchX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
		var touchY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);
		handler.inputMove(touchX, touchY);
	}

	function _touchMoveListener(evt){
		evt.preventDefault();	evt.stopPropagation();
		var bRect = canvas.getBoundingClientRect();
		var touches = evt.changedTouches;
		var touchX = (touches[0].pageX - bRect.left)*(canvas.width/bRect.width);
		var touchY = (touches[0].pageY - bRect.top)*(canvas.height/bRect.height);
		handler.inputMove(touchX, touchY);
	}

	function _mouseUpListener(evt){
		var bRect = canvas.getBoundingClientRect();
		var touchX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
		var touchY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);
		handler.inputUp(touchX, touchY);
	}

	function _touchUpListener(evt){
		evt.preventDefault();	evt.stopPropagation();
		var bRect = canvas.getBoundingClientRect();
		var touches = evt.changedTouches;
		var touchX = (touches[0].pageX - bRect.left)*(canvas.width/bRect.width);
		var touchY = (touches[0].pageY - bRect.top)*(canvas.height/bRect.height);
		handler.inputUp(touchX, touchY);
	}
}





function loadImage(image, src) {
	image.src = src;
	return new Promise(function(resolve, reject){
		image.onload = resolve;
		image.onerror = reject;
	});
}

var loadPromises = [
	loadImage(missileImage, "shapes/img/missileIcon.png"),
	loadImage(missileSignImage, "shapes/img/missile-sign.png"),
	loadImage(flightImage, "shapes/img/flightIcon.png"),
	loadImage(gasImage, "shapes/img/gasIcon.png"),
	loadImage(gasSignImage, "shapes/img/gasIcon-sign.png")
];

// 

init();
