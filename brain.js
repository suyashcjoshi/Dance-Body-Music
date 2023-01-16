class Brain {
    //initialising class
    constructor(type, x, y, size, timeLimit) {
      this.type = type;
      this.x = x;
      this.y = y;
      this.size = size;
      this.timeStamp = millis();
      this.timeLimit = timeLimit;
      this.currTime = 0;
      this.isActive = true;
    }
  
    display() {
      //setting display of target
      noFill();
      if (this.isActive) {
        if (this.type === 0) {
          image(star, this.x, this.y);
        } else {
          image(rainbowstar, this.x, this.y);
        }
      }
    }
  
    checkCollision(px, py) {
      //setting check collisions method
      let distance = dist(this.x, this.y, px, py);
      if (distance < this.size / 2 && this.isActive) {
        return true;
      } else {
        return false;
      }
    }
  
    timer() {
      //setting timer method
      if (this.currTime < this.timeLimit) {
        this.currTime = millis() - this.timeStamp;
      } else {
        this.isActive = false;
      }
    }
  }
  