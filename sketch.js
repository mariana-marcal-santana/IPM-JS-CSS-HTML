// Bake-off #2 -- Seleção em Interfaces Densas
// IPM 2023-24, Período 3
// Entrega: até às 23h59, dois dias úteis antes do sexto lab (via Fenix)
// Bake-off: durante os laboratórios da semana de 18 de Março

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER        = 23;      // Add your group number here as an integer (e.g., 2, 3)
const RECORD_TO_FIREBASE  = true;  // Set to 'true' to record user results to Firebase

// Pixel density and setup variables (DO NOT CHANGE!)
let PPI, PPCM;
const NUM_OF_TRIALS       = 12;     // The numbers of trials (i.e., target selections) to be completed
let continue_button;
let legendas;                       // The item list from the "legendas" CSV

// Metrics (DO NOT CHANGE!)
let testStartTime, testEndTime;     // time between the start and end of one attempt (8 trials)
let hits 			      = 0;      // number of successful selections
let misses 			      = 0;      // number of missed selections (used to calculate accuracy)
let database;                       // Firebase DB  

// Study control parameters (DO NOT CHANGE!)
let draw_targets          = false;  // used to control what to show in draw()
let trials;                         // contains the order of targets that activate in the test
let current_trial         = 0;      // the current trial number (indexes into trials array above)
let attempt               = 0;      // users complete each test twice to account for practice (attemps 0 and 1)

// Target list and layout variables
let targets               = [];
const GRID_ROWS           = 8;      // We divide our 80 targets in a 8x10 grid
const GRID_COLUMNS        = 10;     // We divide our 80 targets in a 8x10 grid


var image ;
// Ensures important data is loaded before the program starts
function preload()
{
  // id,name,...
  legendas = loadTable('legendas.csv', 'csv', 'header');
}

// Runs once at the start
function setup()
{
  createCanvas(windowWidth, windowHeight);    // window size in px before we go into fullScreen()
  frameRate(60);             // frame rate (DO NOT CHANGE!)
  image = document.createElement("img");
  image.src = "image.jpeg";
  image.style.width = "600px";
  image.style.position = "absolute";
  image.style.left = "20px";
  image.style.top = "200px";
  document.body.appendChild(image);

  time_text = createDiv("The timer only begins after the first click!");
  time_text.id('main_text');
  time_text.position(170,140);

  text_alert = createDiv("Please take your time analyzing the interface's layout below!");
  text_alert.id('main_text');
  text_alert.position(120,170);

  randomizeTrials();         // randomize the trial order at the start of execution
  drawUserIDScreen();        // draws the user start-up screen (student ID and display size)
  
}

// Runs every frame and redraws the screen
function draw()
{
  if (draw_targets && attempt < 2)
  {     

    // The user is interacting with the 6x3 target grid
    background(color(0,0,0));        // sets background to black
    
    // Print trial count at the top left-corner of the canvas
    textFont("Arial", 16);
    fill(color(255,255,255));
    textAlign(LEFT);
    text("Trial " + (current_trial + 1) + " of " + trials.length, 50, 20);
      
    // Draw all targets
	for (var i = 0; i < legendas.getRowCount(); i++) {
      if (i <= 26) { targets[i].draw(155, 0, 0); }
      else if (i <= 37) { targets[i].draw(255, 165, 0); } 
      else if (i <= 40) { targets[i].draw(200, 200, 0); }
      else if (i <= 49) { targets[i].draw(0, 155, 0); }
      else if (i <= 50) { targets[i].draw(0, 100, 0); }
      else if (i <= 51) { targets[i].draw(0, 50, 230); }
      else if (i <= 55) { targets[i].draw(90, 90, 230); } 
      else if (i <= 68) { targets[i].draw(126, 90, 155); } 
      else if (i <= 78) { targets[i].draw(200, 100, 200); }
      else if (i <= 79) { targets[i].draw(150, 120, 210); }

    } 
   
    // Draws the target label to be selected in the current trial. We include 
    // a black rectangle behind the trial label for optimal contrast in case 
    // you change the background colour of the sketch (DO NOT CHANGE THESE!)
    fill(color(0,0,0));  
    rect(0, height - 40, width, 40);
 
    textFont("Arial", 20); 
    fill(color(255,255,255)); 
    textAlign(CENTER); 
    text(legendas.getString(trials[current_trial],1), width/2, height - 20);
  }
}

// Print and save results at the end of 54 trials
function printAndSavePerformance()
{
  // DO NOT CHANGE THESE! 
  let accuracy			= parseFloat(hits * 100) / parseFloat(hits + misses);
  let test_time         = (testEndTime - testStartTime) / 1000;
  let time_per_target   = nf((test_time) / parseFloat(hits + misses), 0, 3);
  let penalty           = constrain((((parseFloat(95) - (parseFloat(hits * 100) / parseFloat(hits + misses))) * 0.2)), 0, 100);
  let target_w_penalty	= nf(((test_time) / parseFloat(hits + misses) + penalty), 0, 3);
  let timestamp         = day() + "/" + month() + "/" + year() + "  " + hour() + ":" + minute() + ":" + second();
  
  textFont("Arial", 18);
  background(color(0,0,0));   // clears screen
  fill(color(255,255,255));   // set text fill color to white
  textAlign(LEFT);
  text(timestamp, 10, 20);    // display time on screen (top-left corner)
  
  textAlign(CENTER);
  text("Attempt " + (attempt + 1) + " out of 2 completed!", width/2, 60); 
  text("Hits: " + hits, width/2, 100);
  text("Misses: " + misses, width/2, 120);
  text("Accuracy: " + accuracy + "%", width/2, 140);
  text("Total time taken: " + test_time + "s", width/2, 160);
  text("Average time per target: " + time_per_target + "s", width/2, 180);
  text("Average time for each target (+ penalty): " + target_w_penalty + "s", width/2, 220);

  // Saves results (DO NOT CHANGE!)
  let attempt_data = 
  {
        project_from:       GROUP_NUMBER,
        assessed_by:        student_ID,
        test_completed_by:  timestamp,
        attempt:            attempt,
        hits:               hits,
        misses:             misses,
        accuracy:           accuracy,
        attempt_duration:   test_time,
        time_per_target:    time_per_target,
        target_w_penalty:   target_w_penalty,
  }
  
  // Sends data to DB (DO NOT CHANGE!)
  if (RECORD_TO_FIREBASE)
  {
    // Access the Firebase DB
    if (attempt === 0)
    {
      firebase.initializeApp(firebaseConfig);
      database = firebase.database();
    }
    
    // Adds user performance results
    let db_ref = database.ref('G' + GROUP_NUMBER);
    db_ref.push(attempt_data);
  }
}

// Mouse button was pressed - lets test to see if hit was in the correct target
function mousePressed() 
{
  // Only look for mouse releases during the actual test
  // (i.e., during target selections)
  if (draw_targets)
  {
    for (var i = 0; i < legendas.getRowCount(); i++)
    {
      // Check if the user clicked over one of the targets
      if (targets[i].clicked(mouseX, mouseY)) 
      {
        // Highlight the target
        targets[i].highlighted = true;
        
        // Checks if it was the correct target
        if (targets[i].id === trials[current_trial] + 1) hits++;
        else misses++;
         
        current_trial++;              // Move on to the next trial/target
        break;
      }

    }
    
    // Check if the user has completed all trials
    if (current_trial === NUM_OF_TRIALS)
    {
      testEndTime = millis();
      draw_targets = false;          // Stop showing targets and the user performance results
      printAndSavePerformance();     // Print the user's results on-screen and send these to the DB
      attempt++;                      
      
      // If there's an attempt to go create a button to start this
      if (attempt < 2)
      {
        continue_button = createButton('START 2ND ATTEMPT');
        continue_button.mouseReleased(continueTest);
        continue_button.position(width/2 - continue_button.size().width/2, height/2 - continue_button.size().height/2);
      }
    }
    // Check if this was the first selection in an attempt
    else if (current_trial === 1) testStartTime = millis(); 
  }
}

// Evoked after the user starts its second (and last) attempt
function continueTest()
{
  // Re-randomize the trial order
  randomizeTrials();
  for (var i = 0; i < legendas.getRowCount(); i++)
    {
        // Remove Highlight from the target
        targets[i].highlighted = false;
    }
  // Resets performance variables
  hits = 0;
  misses = 0;
  
  current_trial = 0;
  continue_button.remove();
  
  // Shows the targets again
  draw_targets = true; 
}

// Creates and positions the UI targets
function createTargets(target_size, horizontal_gap, vertical_gap)
{
  // Define the margins between targets by dividing the white space 
  // for the number of targets minus one
  h_margin = (horizontal_gap / (GRID_COLUMNS*6/5 -1) )*0.05;
  v_margin = vertical_gap / (GRID_ROWS - 1)/3;
  
  var XsYs = [];
  var labelsIds = [];
  
  var r=0;
  var c=0;

  // Set targets in a 8 x 10 grid
  for (r = 0; r < GRID_ROWS; r++) {
    
    for (c = 0; c < GRID_COLUMNS; c++) {
      
      // Find the appropriate label and ID for this target
      let legendas_index = c + GRID_COLUMNS * r;
      let target_id = legendas.getNum(legendas_index, 0);  
      let target_label = legendas.getString(legendas_index, 1); 
      
      labelsIds.push({label : target_label, id : target_id});
      //XsYs.push({x : target_x, y : target_y});

    }  
  }
  
   ///*
   var i=0;
  
          for (r = 0; r < 3; r++) {

              for ( c = 0; c < 9; c++) {
              
              //a
                let target_x = (h_margin + target_size*1.3) * c ; 
                 
                let target_y = (v_margin + target_size) * r + target_size/2;
                
                
                if (i <= 26){XsYs.push({x : target_x, y : target_y});
                            i++;}
              
              }
            }
            for (r = 0; r < 2; r++) {

              for (c = 0; c < 6; c++) {
              
              //e
                let target_x = (h_margin + target_size*1.3) * c ; 
                 
                let target_y = (v_margin + target_size) * r + width*0.220;
                
                if (i <= 37){XsYs.push({x : target_x, y : target_y});
                i++;}
              
              }
            }
            for (r = 0; r < 1; r++) {

                for (c = 0; c < 4; c++) {

              //h
                      let target_x = (h_margin + target_size*1.3) * c +  width*0.747; 

                      let target_y = (v_margin + target_size) * r + target_size/2;
                      
                      if (i <= 40){XsYs.push({x : target_x, y : target_y});
                i++;}
              
              }
            }                 
              for (r = 0; r < 2; r++) {

                    for (c = 0; c < 5; c++) {

            //i
                      let target_x = (h_margin + target_size*1.3) * c ; 

                      let target_y = (v_margin + target_size) * r + width*0.36;
                      
                      if (i <= 49){XsYs.push({x : target_x, y : target_y});
                      i++;}
              
              }
            }
          for ( r = 0; r < 1; r++) {

                    for (c = 0; c < 1; c++) {

              //l
                      let target_x = (h_margin + target_size*1.3) * c +  width*0.747; 

                      let target_y = (v_margin + target_size) * r + width*0.12;
                      
                      if (i <= 50){XsYs.push({x : target_x, y : target_y});
                i++;}
              
              }
            } 
      for ( r = 0; r < 1; r++) {

                    for ( c = 0; c < 1; c++) {
            //n

                      let target_x = (h_margin + target_size*1.3) * c +  width*0.83; 

                      let target_y = (v_margin + target_size) * r + width*0.12;
                      
                      if (i <= 51){XsYs.push({x : target_x, y : target_y});
                i++;}
              
              }
            }
    for ( r = 0; r < 2; r++) {

          for ( c = 0; c < 2; c++) {

              //o
                      let target_x = (h_margin + target_size*1.3) * c + width*0.35  ; 

                      let target_y = (v_margin + target_size) * r + width*0.425  ;
                      
                      if (i <= 55){XsYs.push({x : target_x, y : target_y});
                i++;}
              
              }
            } 
            for ( r = 0; r < 3; r++) {

                    for ( c = 0; c < 5; c++) {

                //r
                      let target_x = (h_margin + target_size*1.3) * c + width*0.55; 

                      let target_y =(v_margin + target_size) * r + width*0.220;
                      
                      if (i <= 68){XsYs.push({x : target_x, y : target_y});
                i++;}
              
              }
            } 
                 for (r = 0; r < 2; r++) {

                    for ( c = 0; c < 5; c++) {
              //u

                      let target_x = (h_margin + target_size*1.3) * c + width*0.55 ; 

                      let target_y = (v_margin + target_size) * r + width*0.425 ;
                      
                      if (i <= 78){XsYs.push({x : target_x, y : target_y});
                i++;}
              
              }
            } 
                  //y
                      let target_x = width*0.91; 

                      let target_y = width*0.12;
                      
                      XsYs.push({x : target_x, y : target_y});
 
  // Sort the array of labels and ids by alphabetical order of label
  labelsIds.sort((a, b) => a.label.localeCompare(b.label));
  
  // Adds targets to the main target list
  for (i = 0; i < labelsIds.length; i++) {
    let target = new Target(XsYs[i].x + target_size*1.5, XsYs[i].y + 70, target_size, labelsIds[i].label, labelsIds[i].id);
    targets.push(target);
  }

}


// Is invoked when the canvas is resized (e.g., when we go fullscreen)
function windowResized() 
{
  if (fullscreen())
  {
    text_alert.remove();
    time_text.remove();
    document.body.removeChild(image);
    resizeCanvas(windowWidth, windowHeight);

    
    // DO NOT CHANGE THE NEXT THREE LINES!
    let display        = new Display({ diagonal: display_size }, window.screen);
    PPI                = display.ppi;                      // calculates pixels per inch
    PPCM               = PPI / 2.54;                       // calculates pixels per cm
  
    // Make your decisions in 'cm', so that targets have the same size for all participants
    // Below we find out out white space we can have between 2 cm targets
    let screen_width   = display.width * 2.54;             // screen width
    let screen_height  = display.height * 2.54;            // screen height
    let target_size    = 1.8;                                // sets the target size (will be converted to cm when passed to createTargets)
    let horizontal_gap = screen_width - target_size * GRID_COLUMNS;// empty space in cm across the x-axis (based on 10 targets per row)
    let vertical_gap   = screen_height - target_size * GRID_ROWS;  // empty space in cm across the y-axis (based on 8 targets per column)

    // Creates and positions the UI targets according to the white space defined above (in cm!)
    // 80 represent some margins around the display (e.g., for text)
    createTargets(target_size * PPCM, horizontal_gap * PPCM - 80, vertical_gap * PPCM - 80);

    // Starts drawing targets immediately after we go fullscreen
    draw_targets = true;
  }
}
