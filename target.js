// Target class (position and width)
class Target
{
  constructor(x, y, w, l, id, highlighted)
  {
    this.x      = x;
    this.y      = y;
    this.width  = w; 
    this.label  = l;
    this.id     = id;
    this.highlighted = false;
  }
  
  // Checks if a mouse click took place
  // within the target
  clicked(mouse_x, mouse_y)
  {  
    
    // Calculate the boundaries of the square
    let leftBound = this.x- 11/8*this.width;
    let rightBound = this.x - 11/8*this.width + this.width*1.3;
    let topBound = this.y - this.width;
    let bottomBound = this.y - this.width+ this.width;

  // Check if the mouse position is within the boundaries
  return mouse_x > leftBound && mouse_x < rightBound && mouse_y > topBound && mouse_y < bottomBound;
  }
  
  // Draws the target (i.e., a circle)
  // and its label
  draw(r, g, b) {
    if (this.highlighted) 
    {
      
      // Draw target
    fill(color(r, g, b, 150));
    rect(this.x - 11/8*this.width, this.y - this.width, this.width*1.33, this.width);
    }
    else{
    // Draw target
    fill(color(r, g, b));
    rect(this.x - 11/8*this.width, this.y - this.width, this.width*1.33, this.width);
    //circle(this.x, this.y, this.width);
    }
    // Draw label
    textFont("Arial", 16);
    textStyle(BOLD);
    fill(color(255,255,255));
    textAlign(CENTER);
    text(this.label, this.x - this.width/1.4, this.y - this.width/5);

    textSize(27);
    text(this.label.substring(0,3),this.x-this.width/1.5 , this.y-this.width/1.8);
  }
}
