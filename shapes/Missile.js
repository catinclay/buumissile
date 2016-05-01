// Simple class example
function Missile(image, speed, rotateRate, signImage, theCanvasWidth, theCanvasHeight) {
		// this.color = "rgba(0,0,255,0.2)";
		// this.width = 10 + Math.random()*100;
		// this.height = 10 + Math.random()*100;
		// this.x = Math.random()*(300 + theCanvasWidth + this.width) - theCanvasWidth/2 - this.width;
		// this.y = Math.random()*(300 + theCanvasHeight + this.height) - theCanvasHeight/2 - this.height;
		this.image = image;
		this.signImage = signImage;
		var offsetX = 10 + theCanvasWidth/2 + this.image.width/2;
		var offsetY = 10 +theCanvasHeight/2 + this.image.height/2;
		if(Math.random() > 0.5){
			this.x = Math.random()*500 + offsetX;
			if(Math.random() > 0.5){ this.x *= -1; }
			this.y = Math.random()*theCanvasHeight - theCanvasHeight/2;
		}else{
			this.y = Math.random()*500 + offsetY;
			if(Math.random() > 0.5){ this.y *= -1;}
			this.x = Math.random()*theCanvasWidth - theCanvasWidth/2;
		}
		this.angle = 1.8;
		this.speed = speed;
		this.rotateRate = rotateRate;
		this.theCanvasWidth = theCanvasWidth;
		this.theCanvasHeight = theCanvasHeight;
		this.radius = this.image.width*0.75;
		this.isExploding = false;
		this.a = 0.8;
		this.shouldDestroy = false;
		//this.explodingColor = "rgba(255,0,0,"+ this.a+ ")";
}

//The function below returns a Boolean value representing whether the point with the coordinates supplied "hits" the particle.

//A function for drawing the particle.

Missile.prototype.move = function(speed, degree) {
	this.x += speed * Math.cos(degree+Math.PI/2) - Math.cos(this.angle+Math.PI/2)*this.speed;
	this.y -= speed * Math.sin(degree+Math.PI/2) - Math.sin(this.angle+Math.PI/2)*this.speed;
}

Missile.prototype.outOfBound = function(){
	return (this.x + this.image.width/2 < - this.theCanvasWidth/2 || this.x - this.image.width/2 > this.theCanvasWidth/2
		|| this.y + this.image.height/2 < -this.theCanvasHeight/2 || this.y - this.image.height/2 > this.theCanvasHeight/2);
}

Missile.prototype.hit = function(posX, posY){
	var dx = this.x - posX;
	var dy = this.y - posY;
	
	return(dx*dx + dy*dy < this.radius*this.radius);
}

Missile.prototype.explode = function(posX, posY){
	// console.log(this.a);
	if(!this.isExploding){
		this.radius *= 2;
		this.speed = 0;
		this.rotateRate = 0;
		this.isExploding = true;
		this.explodeTimer = setInterval(this.onExplodeTick, 1000/30, this);
	}
}

Missile.prototype.onExplodeTick = function(that){
	// console.log(explodeTimer);
	// console.log(that.a);
	if(that.a > 0){
		// console.log(that.a);
		that.a -= 0.04;
	}else{
		that.radius = 0;
		clearInterval(that.explodeTimer);
		that.shouldDestroy = true;
	}
}

// Missile.prototype.reLocate = function(theCanvasWidth, theCanvasHeight) {
// 	this.width = 10 + Math.random()*100;
// 	this.height = 10 + Math.random()*100;
// 	var offsetX = 100 + theCanvasWidth/2 + this.width/2;
// 	var offsetY = 100 +theCanvasHeight/2 + this.height/2;
// 	if(Math.random() > 0.5){
// 		this.x = Math.random()*300 + offsetX;
// 		if(Math.random() > 0.5){ this.x *= -1; }
// 		this.y = Math.random()*theCanvasHeight - theCanvasHeight/2;
// 	}else{
// 		this.y = Math.random()*300 + offsetY;
// 		if(Math.random() > 0.5){ this.y *= -1;}
// 		this.x = Math.random()*theCanvasWidth - theCanvasWidth/2;
// 	}
	
// }

Missile.prototype.drawToContext = function(theContext) {
	if(this.isExploding){
		theContext.fillStyle = "rgba(255,0,0,"+ this.a+ ")";;
		theContext.beginPath();
		theContext.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
		theContext.closePath();
		theContext.fill();
		return;
	}

	if(this.outOfBound()){
		// console.log(this.x +" " + this.y);
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
		//theContext.rotate(this.angle*Math.PI/180);

	    theContext.save();

	    // move to the center of the canvas
	    theContext.translate(this.x,this.y);

	    // rotate the canvas to the specified degrees
	    theContext.rotate(-this.angle);

	    // draw the image
	    // since the context is rotated, the image will be rotated also
	  	theContext.drawImage(this.image
							, -this.image.width/2
							, -this.image.height/2);

	    // we’re done with the rotating so restore the unrotated context
	    theContext.restore();
	}
}

Missile.prototype.rotateToward = function(posX, posY) {
	this.targetDegree = Math.atan2(posX - this.x, posY - this.y);

	var tempTD = this.targetDegree > 0 ? this.targetDegree : 2 * Math.PI + this.targetDegree;
	var tempCD = this.angle > 0 ? this.angle : 2 * Math.PI + this.angle;
	// console.log(this.angle);
	if(Math.abs(tempTD - tempCD) < this.rotateRate){
		this.angle = this.targetDegree;
		return;
	}
	
	if(tempCD > tempTD){
		tempTD = tempTD + 2 * Math.PI;
	}

	if(tempTD - tempCD < Math.PI){
		this.angle += this.rotateRate;
	} else {
		this.angle -= this.rotateRate;
	}


	if(this.angle > 2 * Math.PI){
		this.angle -= 2 * Math.PI;
	}else if(this.angle < 0){
		this.angle += 2 * Math.PI;
	}
	
}