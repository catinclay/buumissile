// Simple class example

function Cloud() {
		this.color = "rgba(0,0,255,0.2)";
		this.width = 10 + Math.random()*100;
		this.height = 10 + Math.random()*100;
		this.x = Math.random()*(300 + theCanvasWidth + this.width) - theCanvasWidth/2 - this.width;
		this.y = Math.random()*(300 + theCanvasHeight + this.height) - theCanvasHeight/2 - this.height;
}

//The function below returns a Boolean value representing whether the point with the coordinates supplied "hits" the particle.

//A function for drawing the particle.

Cloud.prototype.move = function(speed, degree) {
	this.x += speed * Math.cos(degree+Math.PI/2);
	this.y -= speed * Math.sin(degree+Math.PI/2);
}

Cloud.prototype.outOfBound = function(theCanvasWidth, theCanvasHeight) {
	var widthBound = theCanvasWidth + 200;
	var heightBound = theCanvasHeight + 200;
	return (this.x + this.width < - widthBound/2 || this.x - this.width > widthBound/2
		|| this.y + this.height < -heightBound/2 || this.y - this.height > heightBound/2);
}

Cloud.prototype.reLocate = function(theCanvasWidth, theCanvasHeight) {
	this.width = 10 + Math.random()*100;
	this.height = 10 + Math.random()*100;
	var offsetX = 100 + theCanvasWidth/2 + this.width/2;
	var offsetY = 100 +theCanvasHeight/2 + this.height/2;
	if(Math.random() > 0.5){
		this.x = Math.random()*300 + offsetX;
		if(Math.random() > 0.5){ this.x *= -1; }
		this.y = Math.random()*theCanvasHeight - theCanvasHeight/2;
	}else{
		this.y = Math.random()*300 + offsetY;
		if(Math.random() > 0.5){ this.y *= -1;}
		this.x = Math.random()*theCanvasWidth - theCanvasWidth/2;
	}
	
}

Cloud.prototype.drawToContext = function(theContext) {
	theContext.fillStyle = this.color;
	theContext.fillRect(this.x - this.width, this.y - this.height, 2*this.width, 2*this.height);
}