// Setup and Initialization of Game

let video;
let pose = {};
let options = {
  detectionType: "single"
};
let detectedBody = false;

let targets = []; // class for game logic
let cnv;
let music; //music for game

let score = 0; //score variable

let charactergif; //disco gif that will be displayed onscreen during the game
let charactergif1; //2nd disco gif that will be displayed onscreen during the game

let bckgrnd; //variable for game background
let startmusic; //music for the startpage
let gameOverBRONZE; //bronze medal background
let gameOverSILVER; // silver medal background
let gameOverGOLD; // gold medal background

let gameMode = "INTRO"; //declare stages of game

let star; //target image
let rainbowstar; //target image for bonus points

let startTime = 295000; //total time of game/song
let timeStamp = 0;
let timeRemaining = startTime;

// Load all assets
function preload() {
  //preloading all images/music
  bckgrnd = loadImage(
    "assets/moveandmatchdiscoSCORE.png"
  );
  charactergif = createImg(
    "assets/dance1.gif"
  );
  charactergif1 = createImg(
    "assets/girldancer.gif"
  );
  // allows loading of gifs
  introscrn = loadImage(
    "assets/startscrn.png"
  );
  music = loadSound(
    "assets/music.mp3"
  );
  startmusic = loadSound(
    "assets/startmusic.mp3"
  );

  star = loadImage(
    "assets/star.png"
  );

  rainbowstar = loadImage(
    "assets/rainbowstar.png"
  );

  gameOverBRONZE = loadImage(
    "assets/gameOverScreenBRONZE.png"
  );

  gameOverSILVER = loadImage(
    "assets/gameOverScreenSILVER.png"
  );

  gameOverGOLD = loadImage(
    "assets/gameOverScreenGOLD.png"
  );
}

function setup() {
  createCanvas(1200, 650);
  video = createCapture(VIDEO);
  video.size(width / 2, height / 2); //set the dimensions of video to half the canvas size
  video.hide(); //hide the video element--

  if (gameMode === "INTRO") {
    startmusic.setVolume(0.1);
    startmusic.play(); //play start music at intro
  }

  const poseNet = ml5.poseNet(video, options, modelReady);
  poseNet.on("pose", gotResults);
  noStroke();

  //timeStamp = millis();
}

function modelReady() {
  console.log("The model has loaded and is ready for use!");
}

function draw() {
  if (gameMode === "INTRO") {
    image(introscrn, 0, 0);
    //hiding gifs from start screen
    charactergif.hide();
    charactergif1.hide();
  } 
  else if (gameMode === "GAMEPLAY") {
    image(bckgrnd, 0, 0, width, height);
    //showing gifs in gameplay
    charactergif.show();
    charactergif1.show();
    textAlign(CENTER, CENTER);
    //display gif
    charactergif.position(-70, 215);
    charactergif1.position(800, 210);

    /* We can still load the video content into our canvas 
    by displaying each frame as an image */
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 340, 160);
    pop();

    if (frameCount % 60 === 0) {
      // if framecount is 60, add a new target
      addTarget();
    }

    if (detectedBody) {
      /*
     There are 17 bodypose landmarks:
        leftAnkle
        leftEar
        leftElbow
        leftEye
        leftHip
        leftKnee
        leftShoulder
        leftWrist
        nose
        rightAnkle
        rightEar
        rightElbow
        rightEye
        rightHip
        rightKnee
        rightShoulder
        rightWrist
    */
      /*
      Note: you might see some 'flicker'. This is partially dependent on light quality. 
      You can filter this a bit by using the 'confidence' value in the JSON to only find 
      the feature if there is a high confidence that it has been detected.
    */

      fill(101, 168, 237);

      let leftWristX = width - pose.leftWrist.x - 340; //detecting left wrist x co ord
      let leftWristY = pose.leftWrist.y + 160; //detecting left wrist y co ord
      ellipse(leftWristX, leftWristY, 40, 40); //creating circle for left wrist

      let rightWristX = width - pose.rightWrist.x - 340; //detecting right wrist x co ord
      let rightWristY = pose.rightWrist.y + 160; //detecting right wrist y co ord
      ellipse(rightWristX, rightWristY, 40, 40); //creating circle for right wrist

      for (let i = 0; i < targets.length; i++) {
        targets[i].display(); //display target
        targets[i].timer(); //start individual target timer
        if (
          targets[i].checkCollision(leftWristX, leftWristY) === true || //check if either wrist collides with target
          targets[i].checkCollision(rightWristX, rightWristY) === true
        ) 
        {
          if (targets[i].type === 0) {
            //if so check what type of target it is
            //normal target = add 5 points and disappear
            score = score + 5;
            targets[i].isActive = false;
          } else if (targets[i].type === 1) {
            //bonus target = add 10 points and disappear
            score = score + 10;
            targets[i].isActive = false;
          }
        }
        if (targets[i].isActive === false) {
          //if target disappears, remove from array to save space
          targets.splice(i, 1);
        }
      }
    }
    fill(255);
    textSize(100);
    text(score, 100, 150); //display score

    let timeRemaining = round((startTime - (millis() - timestamp)) / 1000); //display remaining time in seconds
    if (timeRemaining > 0) {
      text(timeRemaining, 1100, 75); //show the timer, counting down in seconds
    } else {
      //if timer is up, change game stage
      gameMode = "GAMEOVER";
    }

    if (millis() - timestamp > startTime) {
      timestamp = millis();
    }
  } 
  else if (gameMode === "GAMEOVER") { //if game stage is at game over, change screen to ending screen + hide gifs
    charactergif.hide();
    charactergif1.hide();
    ending(score);
  }
}

function mousePressed() {
  if (gameMode === "INTRO") {
    //gameinitialisation when mouse is pressed
    gameMode = "GAMEPLAY";
    startmusic.stop();
    music.setVolume(0.1);
    music.play();
    timestamp = millis();
  } 
  else {
  }
}

function addTarget() {
  //function to add new target
  let t = new Brain(
    floor(random(0, 1)),
    random(340, 700),
    random(200, 500),
    100,
    2000
  );
  targets.push(t);
}

function gotResults(results, err) {
  //check for errors
  if (err) {
    console.log(err);
    return;
  }

  console.log(results);
  for (let i = 0; i < results.length; i++) {
    //check body pose is detected
    pose = results[i].pose;
    detectedBody = true;
  }
}

function ending(score) {
  //function to award medals at the end of the game
  if (score <= 300) {
    image(gameOverBRONZE, 0, 0, width, height);
  } 
  else if (score <= 500) {
    image(gameOverSILVER, 0, 0, width, height);
  } 
  else if (score <= 1000) {
    image(gameOverGOLD, 0, 0, width, height);
  }
}
