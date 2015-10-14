//GLOBAL VARIABLES
var cachedSessionTimes = null;
var sessionType = 'study_session';
var numOfStudySessions = 0;


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
        togglePlayPause();
        $('#stopButton').prop('disabled', false);
        $('#stopButton').removeClass('stopped');

        setTimer(subjectId, weekDate, taskId);

        // pause timer
    } else {
        togglePlayPause();
    }
}

function switchToNextSession(subjectId, weekDate, taskId) {
    playTone();
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