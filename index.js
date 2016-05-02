var theCanvas = document.getElementById("mainCanvas");
if(screen.width < 400){
	theCanvas.width *=2;
	theCanvas.height *=2;
}
var theCanvasHeight = theCanvas.height; 
var theCanvasWidth = theCanvas.width;
var gameOverLabel = document.getElementById("gameOverLabel");
var restartButton = document.getElementById("restartButton");
var scoreLabel = document.getElementById("scoreLabel");
var context = theCanvas.getContext("2d");
context.translate(theCanvasWidth/2,theCanvasHeight/2);

var failedSound = new Audio('sounds/faildSound.mp3');
var comboSounds = [new Audio('sounds/combo1.mp3'),
					new Audio('sounds/combo2.mp3'),
					new Audio('sounds/combo3.mp3'),
					new Audio('sounds/combo4.mp3'),
					new Audio('sounds/combo5.mp3'),
					new Audio('sounds/combo6.mp3'),
					new Audio('sounds/combo7.mp3'),
					new Audio('sounds/combo8.mp3')];
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
var clouds;
var cloudsCount = 8;
var missiles;
var missilesCount = 10;
var missileSpeed = 6.5;
var missileRotateRate = 0.07;
var hp;
var hpDecreaseRate;
var time = 0;
var gases;
var initCount = 0;



function init(){
	theCanvas.style.display = "block";
	restartButton.style.display = "none";
	gameOverLabel.style.display = "none";
	scoreLabel.style.display = "none";
	addListeners();
	initClouds();
	initFlight();
	initMissile();
	initGas();
	timer = setInterval(onTimerTick, 1000/30);

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
	speed = 5;
	hp = 100;
	hpDecreaseRate = 0.2;
}

function initMissile() {
	missiles = [];
	var i;
	// for(i = 0; i < missilesCount; ++i){
	missiles.push(new Missile(missileImage, missileSpeed, missileRotateRate, missileSignImage, theCanvasWidth,theCanvasHeight));
	// }
}

function initGas(){
	gases = [];
	gases.push(new Gas(gasImage, gasSignImage, theCanvasWidth, theCanvasHeight));
}

function gameOver(){
	// speed = 0;
	theCanvas.style.display = "none";
	gameOverLabel.style.display = "block";
	restartButton.style.display = "block";
	scoreLabel.innerHTML = index;
	scoreLabel.style.display = "block";
	clearInterval(timer);
}


function inputDownListener(touchX, touchY){
	touchX-= theCanvasWidth/2;
	touchY-= theCanvasHeight/2;

	// console.log(Math.atan2(touchX, touchY)/Math.PI);
	myFlight.printSomething();
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
			hp+=20;
		}
	}
}


function onTimerTick(){
	hp -= hpDecreaseRate;
	drawScreen();
	drawClouds();
	drawMissiles();
	drawGases();
	drawFlight();
	if(hp <= 0){ speed = 0;}
	time += 1000/30;
	if(time > 3000){
		time -= 3000;
		missiles.push(new Missile(missileImage, missileSpeed, missileRotateRate, missileSignImage, theCanvasWidth,theCanvasHeight));
	}
}


function addListeners(){
	theCanvas.addEventListener('mousedown', mouseDownListener, false);
	theCanvas.addEventListener('touchstart', touchDownListener, false);
	window.addEventListener('mousemove', mouseMoveListener, false);
	window.addEventListener('touchmove', touchMoveListener, false);
	window.addEventListener('mouseup', mouseUpListener, false);
	window.addEventListener('touchend', touchUpListener, false);
}



function mouseDownListener(evt){
	var bRect = theCanvas.getBoundingClientRect();
	touchX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
	touchY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
	inputDownListener(touchX, touchY);
}

function touchDownListener(evt){
	evt.preventDefault();	evt.stopPropagation();
	var bRect = theCanvas.getBoundingClientRect();
	var touches = evt.changedTouches;
	touchX = (touches[0].pageX - bRect.left)*(theCanvas.width/bRect.width);
	touchY = (touches[0].pageY - bRect.top)*(theCanvas.height/bRect.height);
	inputDownListener(touchX, touchY);
}

function mouseMoveListener(evt){
	var bRect = theCanvas.getBoundingClientRect();
	touchX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
	touchY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
	inputMoveListener(touchX, touchY);
}

function touchMoveListener(evt){
	evt.preventDefault();	evt.stopPropagation();
	var bRect = theCanvas.getBoundingClientRect();
	var touches = evt.changedTouches;
	touchX = (touches[0].pageX - bRect.left)*(theCanvas.width/bRect.width);
	touchY = (touches[0].pageY - bRect.top)*(theCanvas.height/bRect.height);
	inputMoveListener(touchX, touchY);
}

function mouseUpListener(evt){
	var bRect = theCanvas.getBoundingClientRect();
	touchX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
	touchY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
	inputUpListener(touchX, touchY);
}

function touchUpListener(evt){
	evt.preventDefault();	evt.stopPropagation();
	var bRect = theCanvas.getBoundingClientRect();
	var touches = evt.changedTouches;
	touchX = (touches[0].pageX - bRect.left)*(theCanvas.width/bRect.width);
	touchY = (touches[0].pageY - bRect.top)*(theCanvas.height/bRect.height);
	inputUpListener(touchX, touchY);
}



missileImage.src = "shapes/img/missileIcon.png";
missileSignImage.src = "shapes/img/missile-sign.png";
flightImage.src = "shapes/img/flightIcon.png";
gasImage.src = "shapes/img/gasIcon.png";
gasSignImage.src = "shapes/img/gasIcon-sign.png";
missileImage.onload = function() {
	initCount++;
	checkInit();
}
missileSignImage.onload = function() {
	initCount++;
	checkInit();
}
flightImage.onload = function() {
	initCount++;
	checkInit();
}
gasImage.onload = function() {
	initCount++;
	checkInit();
}
gasSignImage.onload = function() {
	initCount++;
	checkInit();
}

function checkInit(){
	if(initCount == 5){
		init();
	}
}