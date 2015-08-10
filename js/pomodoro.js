/**
 * Created by roisinokeeffe on 27/07/2015.
 */

var userWorkLength;
var userShortBreakLength;
var userLongBreakLength;

var timerVar;                           //Needs global variable so clearInterval can reference it
var start;                              //Declare variable for start time
var secsElapsed;                        //Declare variable for elapsed secs
var minsElapsed;                        //Declare variable for elapsed mins

var totalSecs       = 0;                //Declare variable to hold total amount of seconds. It is added to as seconds elapse, and
                                        //retained through pause and play.

var workSecsLeft;                       //sets amount of seconds in work session. Counts down from this number.
var workMinsLeft;                       //Amount of minutes in workSecsLeft
var workPlaying     = false;            //Boolean. False = timer paused. True = timer running

var shortBreakSecsLeft;                 //sets amount of seconds in break session. Counts down from this number.
var shortBreakMinsLeft;                 //Amount of minutes in breakSecsLeft

var longBreakSecsLeft;
var longBreakMinsLeft;

var workSessionCount = 0;

var subjectIdForPomo;
var taskIdForPomo;


//Variables for accessing HTML elements
var tone                = document.getElementById("tone");
var secondsClock        = document.getElementById("secsDiv");
var minutesClock        = document.getElementById("minsDiv");
var wholeClock          = document.getElementById("clock");
var playPauseButton     = document.getElementById("playPause");
var stopButton          = document.getElementById("stop");
var skipBreakButton     = document.getElementById("skipBreak");
var sessRecord          = document.getElementById("timeRecord")

//===============================================================================================================================
//Function  getTimeSettings() Gets user input from input form (on submit).
// This code needs to be replaced by code to get settings from database.
//===============================================================================================================================

function resetTimeSettings(){
    workSecsLeft    = userWorkLength;
    workMinsLeft    = workSecsLeft/60;
    shortBreakSecsLeft   = userShortBreakLength;
    shortBreakMinsLeft   = shortBreakSecsLeft/60;
    workPlaying = false;
    workButtons();
    minutesClock.innerHTML="00";
    secondsClock.innerHTML ="00";
}

//===============================================================================================================================
//FIREBASE STUFF
//===============================================================================================================================
var FIREBASE_ROOT = "https://studybuddyapp.firebaseio.com";

//This function will get the current active user and return their user id.
//Currently hardoded to return Alice's user ID (for development)
function getActiveUser() {
    // TODO: implement authentication
    return "-JsqE8CQ9Dg7LE0OKQ2P";
}

//Although the time is stored in the database as minutes, they are used as seconds here for quick testing
var userStudyMins = new Firebase(FIREBASE_ROOT +'/Users/active/' + getActiveUser() + '/study_session_minutes');
var userShortBreakMins = new Firebase(FIREBASE_ROOT +'/Users/active/' + getActiveUser() + '/short_break_minutes');
var userLongBreakMins = new Firebase(FIREBASE_ROOT +'/Users/active/' + getActiveUser() + '/long_break_minutes');

//Getting user settings for length of work session from database. (Update automatically on change).
userStudyMins.on("value", function(snapshot) {
    workSecsLeft    = snapshot.val();           //Sets workSecsLeft to value stored in database
    workMinsLeft    = workSecsLeft/60;          //Calculates minutes left
    userWorkLength  = snapshot.val();           //Sets global variable userWorkLength as value in database
});

//Getting user settings for length of short break session from database. (Update automatically on change)
userShortBreakMins.on("value", function(snapshot) {
    shortBreakSecsLeft=snapshot.val();                  //Sets breakSecsLeft to value stored in database
    shortBreakMinsLeft   = shortBreakSecsLeft/60;       //Calculates minutes left
    userShortBreakLength  = snapshot.val();             //Sets global variable userBreakLength as value in database
});

//Getting user settings for length of long break session from database. (Update automatically on change)
userLongBreakMins.on("value", function(snapshot){
    longBreakSecsLeft = snapshot.val();                 //Sets longBreakSecsLeft to value stored in database
    longBreakMinsLeft = longBreakSecsLeft/60;           //Calculates minutes left
    userLongBreakLength = snapshot.val();               //Sets global variable userLongBreakLength as value in database
});

// Sets work session and short and long break lengths in database. Called when submit is pressed on form.
function saveToDatabase(){
    var workInput = document.getElementById("workInput").value;                     //Gets value entered on form
    var shortBreakInput = document.getElementById("shortBreakInput").value;         //Gets value entered on form
    var longBreakInput = document.getElementById("longBreakInput").value;           //Gets value entered on form
    userStudyMins.set(workInput);                                               //Puts into database
    userShortBreakMins.set(shortBreakInput);                                    //Puts into database
    userLongBreakMins.set(longBreakInput);                                      //Puts into database
}// end of function saveToDatabase()

//===============================================================================================================================
//Function myTimer - Timer counts down minutes and seconds of session, and calls function to end session at end.
//===============================================================================================================================

function myTimer(secsLeft, minsLeft, endSessionFunction){

    var time = new Date().getTime() - start;                        //Gets amount of milliseconds that have passed since start
    secsElapsed = Math.floor(time / 1000);                          //Rounds number to a second
    minsElapsed = (Math.floor(time / 1000)/60);                     //Converts to minutes to show amount of minutes that have passed
    var secsDisplay = (secsLeft -(secsElapsed))%60;                 //Seconds left, minus seconds elapsed. Displays remainder after divided by 60.
    var minsDisplay = Math.floor( minsLeft -(minsElapsed));         //Displays starting amount of mins, minus mins elapsed.

    if (secsDisplay<10){                                            //Checks if secsDisplay is single digit
        secondsClock.innerHTML = "0"+secsDisplay;                   //Adds zero before if single
    }else{
        secondsClock.innerHTML = secsDisplay;                       //Displays normally if not.
    }
    if (minsDisplay<10){                                            //Checks if minsDisplay is single digit
        minutesClock.innerHTML = "0"+minsDisplay;                   //Adds zero before it if single
    }else{
        minutesClock.innerHTML = minsDisplay;                       //Displays normally if not.
    }

    if(minsDisplay<=0 && secsDisplay<=0){                           //if minutes and seconds are at zero (if time is up)
        minsDisplay==0;
        secsDisplay==0;
        endSessionFunction();                                       //Calls endWorkSession function
    }
}//end of function myTimer()

//===============================================================================================================================
//Function playWorkTimer starts the myTimer. It's called when play or resume is pressed.
//===============================================================================================================================

function playWorkTimer(){
    secsElapsed=0;                                          //Resets seconds elapsed variable to zero before it starts
    start = new Date().getTime();                           //Return the number of milliseconds since midnight 1970/01/01
    timerVar = window.setInterval(function(){ myTimer(workSecsLeft, workMinsLeft, endWorkSession) }, 100);    //Runs timer
    workPlaying = true;                                     //Sets workPlaying boolean to true
    wholeClock.className="working";                         //Gives clock class of working (Changes colour to red)
}//end of function playWorkTimer()


//===============================================================================================================================
//Function playShortBreakTimer starts the myTimer. It's called when play or resume is pressed.
//===============================================================================================================================

function playShortBreakTimer(){
    start = new Date().getTime();                   //Return the number of milliseconds since midnight 1970/01/01
    timerVar = window.setInterval(function(){ myTimer(shortBreakSecsLeft, shortBreakMinsLeft, endBreakSession) }, 100);    //Runs timer
    wholeClock.className="break";                   //Gives clock class of break (Changes colour to blue)
    breakButtons();                                 //Hides play/Pause & stop buttons, shows skip break
}//end of function playBreakTimer()

//===============================================================================================================================
//Function playLongBreakTimer starts the myTimer. It's called when play or resume is pressed.
//===============================================================================================================================

function playLongBreakTimer(){
    start = new Date().getTime();                   //Return the number of milliseconds since midnight 1970/01/01
    timerVar = window.setInterval(function(){ myTimer(longBreakSecsLeft, longBreakMinsLeft, endBreakSession) }, 100);    //Runs timer
    wholeClock.className="longBreak";                   //Gives clock class of break (Changes colour to blue)
    breakButtons();                                 //Hides play/Pause & stop buttons, shows skip break
}//end of function playBreakTimer()


//===============================================================================================================================
//Function pauses timer. Called when pause is pressed.
//===============================================================================================================================
function pauseTimer(){
    workSecsLeft = workSecsLeft -(secsElapsed);         //Updates amount of secs left in timer (global variable) to new amount
    workMinsLeft = workMinsLeft -(minsElapsed);         //Updates amount of mins left in timer (global variable) to new amount
    clearInterval(timerVar);                            //stops the timer from running
    totalSecs = totalSecs + secsElapsed;                //Updates the total seconds count global variable to add on seconds just elapsed
    workPlaying = false;                                //Changes workPlaying boolean to false
    wholeClock.className="none";                        //Gives clock class of none (Changes colour to grey)
}//end of function pauseTimer()

//===============================================================================================================================
//Function playPause() checks whether play or pause was pressed on toggle button, and runs appropriate function
//===============================================================================================================================

function playPause(){                                       //Runs when play/pause button is pressed
    if(workPlaying){                                        //If already Playing
        pauseTimer();                                       //Pause timer
        playPauseButton.innerHTML="  Play  ";               //Make play/pause button show play
    }else{                                                  //If not workPlaying
        playWorkTimer();                                    //Play the work timer
        playPauseButton.innerHTML="  Pause ";               //Make play/pause button show pause
    }
}//end of function playPause()

//===============================================================================================================================
//Function stopTimer() called when stop button is pressed
//===============================================================================================================================

function stopTimer(){
    clearInterval(timerVar);                            //Stops timer running

    if(workPlaying){                                    //if the timer had been workPlaying when button pressed,
        totalSecs = totalSecs + secsElapsed;            //the last seconds elapsed need to be added onto total seconds
        sessRecord.innerHTML="Seconds worked: "+totalSecs+"<br>"+"Subject ID:"+subjectIdForPomo+"<br>"+"Task ID: "+taskIdForPomo;
    } else {                                            //if the player had been paused, the seconds would have already been added on.
        sessRecord.innerHTML="Seconds worked: "+totalSecs+"<br>"+"Subject ID: "+subjectIdForPomo+"<br>"+"Task ID: "+taskIdForPomo;
    }

    playPauseButton.className="hide";       //Hides play/pause button
    stopButton.className="hide";            //Hides stop button


}//end of function stopTimer()

//===============================================================================================================================
//Function displayTotalSeconds() displays all seconds spent working in HTML. Called when work session is stopped or ends.
//This code needs to be adapted to send the numbers to the database instead of putting in HTML.
//===============================================================================================================================
//function displayTotalSeconds(){
//    var prevSecs = parseInt(totalSecondRecord.innerHTML);       //Gets contents of html, converts to integer, sets as variable
//    var newTotal = totalSecs + prevSecs;                        //Adds the total seconds of this session to total number stored in html
//    totalSecondRecord.innerHTML= newTotal;                      //Updates html to contain new total
//}//end of function displayTotalSeconds

//===============================================================================================================================
//Function endWorkSession() called when work timer runs down.
//===============================================================================================================================

function endWorkSession(){
    clearInterval(timerVar);                                        //Stops timer
    totalSecs = totalSecs + secsElapsed;                            //the last seconds elapsed are added onto total seconds
    sessRecord.innerHTML="Seconds worked: "+totalSecs+"<br>"+"Subject ID:"+subjectIdForPomo+"<br>"+"Task ID: "+taskIdForPomo;
    totalSecs = 0;                                                  //Resets total seconds
    if(workSessionCount == 3){                                      //If workSessionCount is 3, there have been four work sessions (only updates at end of session)
        playLongBreakTimer();                                       //Start a long break
        workSessionCount = 0;                                       //Resets workSessionCount
    }else{
        playShortBreakTimer();                                      //Start short break
        workSessionCount++;                                         //Increases work sessionCount by one
    }
    playTone();                                                     //Plays tone
}//end of function endWorkSession()



//===============================================================================================================================
//Function endBreakSession runs when break session is finished. It starts work session, and hides "Skip Break" button
//===============================================================================================================================

function endBreakSession(){
    resetTimeSettings();                            //Resets time settings left to original amount
    secsElapsed = 0;                                //Resets seconds elapsed
    clearInterval(timerVar);                        //Stops timer
    playWorkTimer();                                //Starts work timer
    playTone();                                     //Plays tone
    var date = Date.today().toString('yyyy-MM-dd');
    updateNumberOfBreaks(getActiveUser(), subjectIdForPomo, taskIdForPomo, date);
}//end of function endBreakSession()

//===============================================================================================================================
//Function skipBreak runs 'SkipBreak' button pressed. It starts work session, and hides "Skip Break" button
//===============================================================================================================================

function skipBreak(){
    resetTimeSettings();                            //Resets time settings left to original amount
    secsElapsed = 0;                                //Resets seconds elapsed
    clearInterval(timerVar);                        //Stops break timer
    playWorkTimer();                                //Plays work timer
}//end of function skipBreak()

//===============================================================================================================================
//Function playTone runs when work session ends and when break session ends
//===============================================================================================================================

function playTone(){
    tone.play();
}//end of function playTone

//===============================================================================================================================
//Functions to display correct buttons.
//===============================================================================================================================

function breakButtons(){
    skipBreakButton.className="show";
    playPauseButton.className="hide";
    stopButton.className="hide";
}

function workButtons(){
    skipBreakButton.className="hide";
    stopButton.className="show";
    playPauseButton.className="show";
    playPauseButton.innerHTML="Play"
}


//===============================================================================================================================
//Updating Time and Breaks
//===============================================================================================================================

function updateNumberOfBreaks(userId, subjectId, taskId, date) {
    updateNumOfBreaksForTask(userId, subjectId, taskId, addOne);
    updateNumOfBreaksForDate(date, userId, addOne);
}


function addOne(numOfBreaks, tasksBreakRef) {
    console.log(numOfBreaks);
    numOfBreaks += 1;
    console.log(numOfBreaks);
    tasksBreakRef.set(numOfBreaks);
}
