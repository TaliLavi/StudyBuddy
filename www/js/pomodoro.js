//GLOBAL VARIABLES
var cachedSessionTimes = null;
var sessionType = 'study_session';
var numOfStudySessions = 0;


//===============================================================================================================================
//Hourglass animation
//===============================================================================================================================

//var hourGlassTL = new TimelineMax({ paused:true, autoRemoveChildren:true, smoothChildTiming: true});
var workTL = new TimelineMax({ paused:true});



function prepareHourGlass() {
    console.log(cachedSessionTimes.study_session);
    //
    //
    //workTL.to($('#topTriangleWork'), (((workSessionLength/), {borderLeft:"44px solid rgba(0,0,0,0)", borderRight:"44px solid rgba(0,0,0,0)", borderTop:"66px solid rgba(149,202,173,1)"});     //20 mins left
    //workTL.to($('#topTriangleWork'), (((workSessionLength/100)*20)), {borderLeft:"36px solid rgba(0,0,0,0)", borderRight:"36px solid rgba(0,0,0,0)", borderTop:"55px solid rgba(149,202,173,1)"});     //15 mins left
    //workTL.to($('#topTriangleWork'), (((workSessionLength/100)*20)), {borderLeft:"27px solid rgba(0,0,0,0)", borderRight:"27px solid rgba(0,0,0,0)", borderTop:"41px solid rgba(149,202,173,1)"});     //10 mins left
    //workTL.to($('#topTriangleWork'), (((workSessionLength/100)*20)), {borderLeft:"17px solid rgba(0,0,0,0)", borderRight:"17px solid rgba(0,0,0,0)", borderTop:"27px solid rgba(149,202,173,1)"});     //5 mins left
    //workTL.to($('#topTriangleWork'), (((workSessionLength/100)*16)), {borderLeft:"6px solid rgba(0,0,0,0)", borderRight:"6px solid rgba(0,0,0,0)", borderTop:"10px solid rgba(149,202,173,1)"});      //1 min left
    workTL.to($('#topTriangleWork'), (cachedSessionTimes.study_session), {borderLeft:"0px solid rgba(0,0,0,0)", borderRight:"0px solid rgba(0,0,0,0)", borderTop:"0px solid rgba(149,202,173,1)"});             //at zero
    ////
    //////
    //workTL.to($('#bottomTriangleWork'), (((workSessionLength/100)*20)), {borderLeft:"30px solid rgba(0,0,0,0)", borderRight:"30px solid rgba(0,0,0,0)", borderBottom:"15px solid rgba(149,202,173,1)"}, "-=150");     //20 mins left
    //workTL.to($('#bottomTriangleWork'), (((workSessionLength/100)*20)), {borderLeft:"36px solid rgba(0,0,0,0)", borderRight:"36px solid rgba(0,0,0,0)", borderBottom:"24px solid rgba(149,202,173,1)"}, "-=120");     //15 mins left
    //workTL.to($('#bottomTriangleWork'), (((workSessionLength/100)*20)), {borderLeft:"30px solid rgba(0,0,0,0)", borderRight:"30px solid rgba(0,0,0,0)", borderbottom:"35px solid rgba(149,202,173,1)"}, "-=90");     //10 mins left
    //workTL.to($('#bottomTriangleWork'), (((workSessionLength/100)*20)), {borderLeft:"50px solid rgba(0,0,0,0)", borderRight:"50px solid rgba(0,0,0,0)", borderBottom:"40px solid rgba(149,202,173,1)"}, "-=60");     //5 mins let
    //workTL.to($('#bottomTriangleWork'), (((workSessionLength/100)*16)), {borderLeft:"50px solid rgba(0,0,0,0)", borderRight:"50px solid rgba(0,0,0,0)", borderBottom:"70px solid rgba(149,202,173,1)"}, "-=30");      //1 min left
    workTL.to($('#bottomTriangleWork'), (cachedSessionTimes.study_session), {borderLeft:"50px solid rgba(0,0,0,0)", borderRight:"50px solid rgba(0,0,0,0)", borderBottom:"75px solid rgba(149,202,173,1)"}, "-="+cachedSessionTimes.study_session);      //at zero

}// end of prepareHourGlass

//===============================================================================================================================
//POMODORO TIMER
//===============================================================================================================================


function timer(duration, update, complete) {
    INTERVAL_SIZE = 100;
    var start = new Date().getTime();
    // first run
    update(duration);
    // the reason to place the setInterval() method in a var, is so that we could later access it and clear it.
    var interval = setInterval(function() {
        var remainingTime = duration-Math.floor((new Date().getTime()-start)/1000);
        if(remainingTime > 0) {
            // interval run
            var continueTimer = update(remainingTime);
            // to be used to stop the timer early (for pausing)
            if (!continueTimer) {
                clearInterval(interval);
            }
        } else {
            // final run
            update(0);
            clearInterval(interval);
            complete();
        }
    }, INTERVAL_SIZE);
}


function getSessionDuration(callback) {
    // check to see if timer was on pause, and set duration accordingly
    if ($('#timerDisplay').text() === '00:00'){
        fetchTimeIntervals(function(sessionTimes) {
            var duration = sessionTimes[sessionType];
            callback(duration);
            prepareHourGlass();
        });
    } else {
        var duration = convertDisplayedTimeToSeconds();
        callback(duration);
    }

}

function convertDisplayedTimeToSeconds() {
    var minutesDisplayed = parseInt($('#timerDisplay').text().split(':')[0]);
    var secondsDisplayed = parseInt($('#timerDisplay').text().split(':')[1]);
    var totalSeconds = minutesDisplayed*60 + secondsDisplayed;
    return totalSeconds;
}


function setTimer(subjectId, weekDate, taskId) {
    getSessionDuration(function(duration) {
        timer(
            // seconds
            duration,
            // called every step to update the visible countdown
            function(remainingTime) {
                // if stop pressed
                if ($('#stopButton').hasClass('stopped')) {
                    resetTimerDisplay();
                    return false;
                    // if play pressed
                } else if (!$('#playPauseButton').hasClass('notPlaying')) {
                    var remainingTimeFormatted = (new Date).clearTime().addSeconds(remainingTime).toString('mm:ss');
                    $('#timerDisplay').text(remainingTimeFormatted);
                    return true;
                    // if pause pressed
                } else {
                    return false;
                }
            },
            // what to do after
            function() {
                // change to following session type
                switchToNextSession(subjectId, weekDate, taskId);
            }
        );
    })
}


function playPauseTimer(subjectId, weekDate, taskId) {
    // play timer
    if ($('#playPauseButton').hasClass('notPlaying')) {
        // start animation
        workTL.play();
        togglePlayPause();
        $('#stopButton').prop('disabled', false);
        $('#stopButton').removeClass('stopped');

        setTimer(subjectId, weekDate, taskId);

        // pause timer
    } else {
        // pause animation
        workTL.pause();
        togglePlayPause();
    }
}

function switchToNextSession(subjectId, weekDate, taskId) {
    playTone();
    // restart animation
    //workTL.restart();
    // reset animation ready for next time
    workTL.pause(0);
    if (sessionType === 'study_session') {
        // increase num of study sessions by one
        numOfStudySessions += 1;


        // switch to short_break
        if (numOfStudySessions < 4) {
            // change to short_break
            sessionType = 'short_break';
            // switch to long_break
        } else {
            // change to long_break
            sessionType = 'long_break';
            // reset count of study sessions
            numOfStudySessions = 0;
        }

        var timeToLog = cachedSessionTimes.study_session;
        updateTimeStudied(subjectId, weekDate, taskId, timeToLog);

    } else {
        incrementNumOfBreaks(subjectId, weekDate, taskId);

        // change to study_session
        sessionType = 'study_session';
        workTL.play();
    }
    setTimer(subjectId, weekDate, taskId);
}

function playTone() {
    $('#tone').get(0).play();
}

function togglePlayPause() {
    if ($('#playPauseButton').hasClass('notPlaying')) {
        $('#playPauseButton').removeClass('notPlaying');
        $('#playPauseButton').text('Pause');
    } else {
        $('#playPauseButton').addClass('notPlaying');
        $('#playPauseButton').text('Play');
    }
}

function stopTimer(subjectId, weekDate, taskId, callback) {
    $('#stopButton').prop('disabled', true);
    $('#stopButton').addClass('stopped');
    // stop animation
    workTL.pause(0);
    if (sessionType === 'study_session') {
        // TODO: don't get data directly from cached object
        var timeToLog = cachedSessionTimes.study_session - convertDisplayedTimeToSeconds();
        updateTimeStudied(subjectId, weekDate, taskId, timeToLog, callback);
    }

    resetTimerDisplay();

    if (!$('#playPauseButton').hasClass('notPlaying')) {
        togglePlayPause();
    }
    sessionType = 'study_session';
}

function resetTimerDisplay() {
    $('#timerDisplay').text('00:00');
}




