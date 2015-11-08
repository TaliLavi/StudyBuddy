//GLOBAL VARIABLES
TIMER_INTERVAL_SIZE = 100;
var sessionType = 'study_session';
var numOfStudySessions = 0;


//===============================================================================================================================
//Hourglass animation
//===============================================================================================================================

//var hourGlassTL = new TimelineMax({ paused:true, autoRemoveChildren:true, smoothChildTiming: true});
var workTL = new TimelineMax({paused:true});

workTL.yoyo( false ); //sets yoyo to false

function prepareHourGlass() {
    fetchTimeIntervals(function(sessionTimes) {
        workTL.to($('#topTriangleWork'), (sessionTimes.study_session/100*20), {borderLeft:"44px solid rgba(0,0,0,0)", borderRight:"44px solid rgba(0,0,0,0)", borderTop:"66px solid rgba(149,202,173,1)", ease: Power0.easeNone});     //20 mins left
        workTL.to($('#topTriangleWork'), (sessionTimes.study_session/100*20), {borderLeft:"36px solid rgba(0,0,0,0)", borderRight:"36px solid rgba(0,0,0,0)", borderTop:"55px solid rgba(149,202,173,1)", ease: Power0.easeNone});     //15 mins left
        workTL.to($('#topTriangleWork'), (sessionTimes.study_session/100*20), {borderLeft:"27px solid rgba(0,0,0,0)", borderRight:"27px solid rgba(0,0,0,0)", borderTop:"41px solid rgba(149,202,173,1)", ease: Power0.easeNone});     //10 mins left
        workTL.to($('#topTriangleWork'), (sessionTimes.study_session/100*20), {borderLeft:"17px solid rgba(0,0,0,0)", borderRight:"17px solid rgba(0,0,0,0)", borderTop:"27px solid rgba(149,202,173,1)", ease: Power0.easeNone});     //5 mins left
        workTL.to($('#topTriangleWork'), (sessionTimes.study_session/100*16), {borderLeft:"6px solid rgba(0,0,0,0)", borderRight:"6px solid rgba(0,0,0,0)", borderTop:"10px solid rgba(149,202,173,1)", ease: Power0.easeNone});      //1 min left
        workTL.to($('#topTriangleWork'), (sessionTimes.study_session/100*4), {borderLeft:"0px solid rgba(0,0,0,0)", borderRight:"0px solid rgba(0,0,0,0)", borderTop:"0px solid rgba(149,202,173,1)", ease: Power0.easeNone});             //at zero
        ////
        workTL.to($('#bottomTriangleWork'), (sessionTimes.study_session/100*20), {borderLeft:"30px solid rgba(0,0,0,0)", borderRight:"30px solid rgba(0,0,0,0)", borderBottom:"15px solid rgba(149,202,173,1)", ease: Power0.easeNone}, "-="+sessionTimes.study_session);     //20 mins left
        workTL.to($('#bottomTriangleWork'), (sessionTimes.study_session/100*20), {borderLeft:"36px solid rgba(0,0,0,0)", borderRight:"36px solid rgba(0,0,0,0)", borderBottom:"30px solid rgba(149,202,173,1)", ease: Power0.easeNone}, "-="+sessionTimes.study_session/100*80);     //15 mins left
        workTL.to($('#bottomTriangleWork'), (sessionTimes.study_session/100*20), {borderLeft:"40px solid rgba(0,0,0,0)", borderRight:"40px solid rgba(0,0,0,0)", borderbottom:"45px solid rgba(149,202,173,1)", ease: Power0.easeNone}, "-="+sessionTimes.study_session/100*60);     //10 mins left
        workTL.to($('#bottomTriangleWork'), (sessionTimes.study_session/100*20), {borderLeft:"45px solid rgba(0,0,0,0)", borderRight:"45px solid rgba(0,0,0,0)", borderBottom:"60px solid rgba(149,202,173,1)", ease: Power0.easeNone}, "-="+sessionTimes.study_session/100*40);     //5 mins let
        workTL.to($('#bottomTriangleWork'), (sessionTimes.study_session/100*16), {borderLeft:"50px solid rgba(0,0,0,0)", borderRight:"50px solid rgba(0,0,0,0)", borderBottom:"70px solid rgba(149,202,173,1)", ease: Power0.easeNone}, "-="+sessionTimes.study_session/100*16);      //1 min left
        workTL.to($('#bottomTriangleWork'), (sessionTimes.study_session/100*4), {borderLeft:"50px solid rgba(0,0,0,0)", borderRight:"50px solid rgba(0,0,0,0)", borderBottom:"75px solid rgba(149,202,173,1)", ease: Power0.easeNone}, "-="+sessionTimes.study_session/100*4);      //at zero
    });
}

//===============================================================================================================================
//POMODORO TIMER
//===============================================================================================================================


function timer(duration, update, complete) {
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
    }, TIMER_INTERVAL_SIZE);
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
                    var remainingTimeFormatted = formatTime(remainingTime);
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
    // reset animation ready for next time

    playTone();
    if (sessionType === 'study_session') {
        // increase num of study sessions by one
        numOfStudySessions += 1;


        // switch to short_break
        if (numOfStudySessions < 4) {
            // change to short_break
            sessionType = 'short_break';
            $('#sleepingRuzo').css('display','block');
            $('#sleepingRuzoPurple').css('display','none');
            $('#bottomContainer').css('display','none');
            $('#topContainer').css('display','none');
            workTL.pause(0);
            // switch to long_break
        } else {
            // change to long_break
            sessionType = 'long_break';
            // reset count of study sessions
            numOfStudySessions = 0;
            $('#sleepingRuzoPurple').css('display','block');
            $('#sleepingRuzo').css('display','none');
            $('#bottomContainer').css('display','none');
            $('#topContainer').css('display','none');
            workTL.pause(0);
        }

        fetchTimeIntervals(function(sessionTimes) {
            var timeToLog = sessionTimes.study_session;
            updateTimeStudied(subjectId, weekDate, taskId, timeToLog, function(subjectId, weekDate, taskId) {
                fetchTimeStudiedForTask(subjectId, weekDate, taskId, false, displayTimeStudiedForTask);
            });
        });

    } else {
        incrementNumOfBreaks(subjectId, weekDate, taskId);

        // change to study_session
        sessionType = 'study_session';
        $('#bottomContainer').css('display','block');
        $('#topContainer').css('display','block');
        $('#sleepingRuzoPurple').css('display','none');
        $('#sleepingRuzo').css('display','none');
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
        $('#playPauseButton').text('Resume');
    }
}

function stopTimer(subjectId, weekDate, taskId, callback) {
    $('#stopButton').prop('disabled', true);
    $('#stopButton').addClass('stopped');
    // stop animation
    workTL.pause(0);
    $('#sleepingRuzoPurple').css('display','none');
    $('#sleepingRuzo').css('display','none');
    $('#bottomContainer').css('display','block');
    $('#topContainer').css('display','block');

    //If stopped on a break get rid of ruzo.

    if (sessionType === 'study_session') {
        fetchTimeIntervals(function(sessionTimes) {
            var timeToLog = sessionTimes.study_session - convertDisplayedTimeToSeconds();
            updateTimeStudied(subjectId, weekDate, taskId, timeToLog, function (subjectId, weekDate, taskId) {
                // The callback we were passed (if any)
                if (callback !== undefined) {
                    callback(subjectId, weekDate, taskId);
                }
                // Also, in any event, run this function
                fetchTimeStudiedForTask(subjectId, weekDate, taskId, false, displayTimeStudiedForTask);
            });
        });
    }

    resetTimerDisplay();

    if (!$('#playPauseButton').hasClass('notPlaying')) {
        togglePlayPause();
    }
    sessionType = 'study_session';
    $('#playPauseButton').text('Start');
}

function resetTimerDisplay() {
    $('#timerDisplay').text('00:00');
}

$(".play-button").click(function() {
    $(this).toggleClass("paused");
});


