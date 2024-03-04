// Target class (position and width)
class Target
{
  constructor(x, y, w, l, id)
  {
    this.x      = x;
    this.y      = y;
    this.width  = w;
    this.label  = l;
    this.id     = id;
  }
  
  // Checks if a mouse click took place
  // within the target
  clicked(mouse_x, mouse_y)
  {
    return dist(this.x - this.width/2, this.y - this.width/2, mouse_x, mouse_y) < this.width / 2;
  }
  
  // Draws the target (i.e., a circle)
  // and its label
  draw(r, g, b) {
    // Draw target
    fill(color(r, g, b));
    rect(this.x -5/4*this.width, this.y - this.width, this.width*3, this.width + this.width/2);
    //circle(this.x, this.y, this.width);
    
    // Draw label
    textFont("Arial", 18);
    fill(color(255,255,255));
    textAlign(CENTER);
    text(this.label, this.x - this.width/1.5, this.y - this.width/2);
  }
}
