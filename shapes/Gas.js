// Simple class example

function Gas(image, signImage, theCanvasWidth, theCanvasHeight) {
		this.image = image;
		this.signImage = signImage;
		var offsetX = 10 + theCanvasWidth/2 + this.image.width/2;
		var offsetY = 10 +theCanvasHeight/2 + this.image.height/2;
		if(Math.random() > 0.5){
			this.x = Math.random()*250 + offsetX;
			if(Math.random() > 0.5){ this.x *= -1; }
			this.y = Math.random()*theCanvasHeight - theCanvasHeight/2;
		}else{
			this.y = Math.random()*250 + offsetY;
			if(Math.random() > 0.5){ this.y *= -1;}
			this.x = Math.random()*theCanvasWidth - theCanvasWidth/2;
		}
		this.radius = this.image.width;
		this.theCanvasWidth  = theCanvasWidth;
		this.theCanvasHeight = theCanvasHeight;
}

Gas.prototype.hit = function(posX, posY){
	var dx = this.x - posX;
	var dy = this.y - posY;
	
	return(dx*dx + dy*dy < this.radius*this.radius);
}

//The function below returns a Boolean value representing whether the point with the coordinates supplied "hits" the particle.

//A function for drawing the particle.

Gas.prototype.move = function(speed, degree) {
	// return;
	this.x += speed * Math.cos(degree+Math.PI/2);
	this.y -= speed * Math.sin(degree+Math.PI/2);
}

Gas.prototype.outOfBound = function(){
	return (this.x + this.image.width/2 < - this.theCanvasWidth/2 || this.x - this.image.width/2 > this.theCanvasWidth/2
		|| this.y + this.image.height/2 < -this.theCanvasHeight/2 || this.y - this.image.height/2 > this.theCanvasHeight/2);
}

Gas.prototype.drawToContext = function(theContext) {
	if(this.outOfBound()){	
		var outX;
		var outY;
		if(this.x + this.image.width/2 < - this.theCanvasWidth/2) {
			outX = - theCanvasWidth/2;
		} else if(this.x - this.image.width/2 > this.theCanvasWidth/2){
			outX = theCanvasWidth/2 - this.signImage.width;
		} else {
			outX = this.x;
		}

		if(this.y + this.image.height/2 < -this.theCanvasHeight/2) {
			outY = - theCanvasHeight/2 ;
		} else if(this.y - this.image.height/2 > this.theCanvasHeight/2){
			outY = theCanvasHeight/2 - this.signImage.height;
		} else {
			outY = this.y;
		}
		theContext.drawImage(this.signImage
							, outX, outY
							, this.signImage.width
							, this.signImage.height);
	} else {
	  	theContext.drawImage(this.image
	  						, this.x, this.y
							, -this.image.width*3/4
							, -this.image.height*3/4);
	}
}