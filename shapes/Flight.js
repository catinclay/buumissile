// Simple class example

function Flight(posX, posY, image) {
		this.x = posX;
		this.y = posY;
		this.image = image;
		this.angle = 0;
		this.rotateRate = 0.15;
		this.targetDegree = 0;
		this.radius = this.image.width/2*1.2;
}

//The function below returns a Boolean value representing whether the point with the coordinates supplied "hits" the particle.
// SimpleSquareParticle.prototype.hitTest = function(hitX,hitY) {
// 	return((hitX > this.x - this.radius)&&(hitX < this.x + this.radius)&&(hitY > this.y - this.radius)&&(hitY < this.y + this.radius));
// }

//A function for drawing the particle.
Flight.prototype.drawToContext = function(theContext, hp) {
	//theContext.rotate(this.angle*Math.PI/180);
	if(hp > 0){
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

	    theContext.beginPath();
	    theContext.strokeStyle = "rgba(" + Math.floor(255*(80-hp)/100) + "," + Math.floor(255*((hp-20)/100)) + ",0,0.8)";
	    theContext.lineWidth = 3;
	    theContext.arc(0,0,this.radius,1.5 * Math.PI, (1.5 - 2 * hp/100) * Math.PI, true);
	    theContext.stroke();
    }

}

Flight.prototype.rotateToward = function(posX, posY) {
	this.targetDegree = Math.atan2(posX, posY);

	var tempTD = this.targetDegree > 0 ? this.targetDegree : 2 * Math.PI + this.targetDegree;
	var tempCD = this.angle > 0 ? this.angle : 2 * Math.PI + this.angle;
	// console.log(this.angle);
	if(Math.abs(tempTD - tempCD) < this.rotateRate || Math.abs(tempTD - (tempCD+2*Math.PI)) < this.rotateRate
		|| Math.abs(tempTD - tempCD+2*Math.PI) < this.rotateRate){
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

Flight.prototype.getDegree = function() {
	return this.angle;
}

Flight.prototype.printSomething = function() {
	console.log(this.targetDegree - this.angle);
}