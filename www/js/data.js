//GLOBAL VARIABLES
var FIREBASE_REF = new Firebase("https://studybuddyapp.firebaseio.com");
var dataCache = {
    sessionTimes: null,
    barChart: null,
    username: null
}


// Do this on errors from firebase
function firebaseErrorFrom(funcName) {
    return function(err) {
        console.error("Firebase error received in " + funcName + ":", err);
    }
}

//=====================================================================
//                              AUTHENTICATION
//=====================================================================

// Sign up a new user
function signUpUser(username, email, password) {
    var ref = FIREBASE_REF;
    ref.createUser({
        email: email,
        password: password
    }, function (error, userData) {
        if (error) {
            console.error("Error creating user:", error);
            if (error.code === "INVALID_EMAIL"){
                $('#signUpEmailErrorMessage').text("Oops! This doesn't look like an email address.");
                $('#signUpEmailErrorTriangle').show();
            }
            if (error.code === "EMAIL_TAKEN"){
                $('#signUpEmailErrorMessage').text('This email address is already in use.');
                $('#signUpEmailErrorTriangle').show();
            }
        } else {
            createUser(username, email, password, userData.uid);
        }
    });
}

// Log in existing user
function logInUser(email, password, signUpCallback) {
    var ref = FIREBASE_REF;

    ref.authWithPassword({
        email    : email,
        password : password
    }, function(error) {
        if (error) {
            console.error("Error logging-in user:", error);
            console.error("Login Failed!", error);
            if (error.code === "INVALID_USER"){
                $('#logInEmailErrorMessage').text('The specified user does not exist.');
                $('#loginEmailErrorTriangle').show();
            }
            if (error.code === "INVALID_EMAIL"){
                $('#logInEmailErrorMessage').text("Oops! This isn't an email address.");
                $('#loginEmailErrorTriangle').show();
            }
            if (error.code === "INVALID_PASSWORD"){
                $('#logInPasswordErrorMessage').text('Oops, wrong password.');
                $('#loginPasswordErrorTriangle').show();
            }
        } else {
            // attach an event handler to sign out, in case of session timeout
            ref.offAuth(AuthChangeHandler);
            ref.onAuth(AuthChangeHandler);

            if (signUpCallback !== undefined) {
                signUpCallback(goToLogin);
            } else {
                goToLogin();
            }
        }
    });
}

// GET THE CURRENT LOGGED-IN USER
function getLoggedInUser(suppressError) {
    var alreadyAuthenticated = FIREBASE_REF.getAuth();
    if (alreadyAuthenticated) {
        return alreadyAuthenticated.uid;
    } else {
        if (!suppressError) {
            console.error("No user logged in.");
        }
    }
}

function signOut() {
    FIREBASE_REF.unauth();
    location.reload();
}

// We use this to sign the user out of the ui, if authentication expired
function AuthChangeHandler(uid) {
    if (uid === null) {
        signOut();
    }
}

//=====================================================================
//                              USERS
//=====================================================================

// ADD NEW USER TO THE DB
function saveNewUser(newUser, uid, callback) {
    // CREATE REFERENCES TO FIREBASE
    var newUserRef = FIREBASE_REF.child('/Users/active/' + uid);
    var onboardingSubjectsRef = FIREBASE_REF.child('/Subjects/active/' + uid);
    var onboardingTasksRef = FIREBASE_REF.child('/Tasks/' + uid);

    //SAVE USER AND ONBOARDING DATA TO FIREBASE
    newUserRef.set(newUser, function() {
        onboardingSubjectsRef.set(getOnboardingSubjects(), function() {
            onboardingTasksRef.set(getOnboardingTasks(), callback);
        });
    });
}

function fetchUsername(heatmapSnapshot) {
    if (dataCache.username !== null) {
        currentStreak(heatmapSnapshot);
    } else {
        var usernameRef = FIREBASE_REF.child('/Users/active/' + getLoggedInUser() + '/username');
        usernameRef.once("value", function(snapshot) {
            var usernameInfo = snapshot.val();
            dataCache.username = usernameInfo;
            currentStreak(heatmapSnapshot);
        }, firebaseErrorFrom('fetchUsername'));
    }
}

//=====================================================================
//                              SUBJECTS
//=====================================================================

// ADD NEW SUBJECT TO THE DB
function pushNewSubject(name, colour_scheme, is_deleted) {
    // CREATE A REFERENCE TO FIREBASE
    // In case this is the first subject to be pushed, this will create a new Subjects/active node.
    var subjectsRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser());

    //SAVE DATA TO FIREBASE
    // I generated a reference to a new location (i.e. assigned the push into a
    // variable (newSubjectRef)), although it is not necessary, so that we could in the future
    // get the unique ID generated by push() by doing newSubjectRef.key();
    var newSubjectRef =  subjectsRef.push({
        name: name,
        colour_scheme: colour_scheme,
        is_deleted: is_deleted
    });
};

// RETRIEVE AND RUNS CALLBACK FUNCTION ON ALL SUBJECTS' INFORMATION UPON REQUEST
function fetchActiveSubjects(isNewSubjectJustCreated, callback) {
    var subjectsRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser());
    subjectsRef.once("value", function(snapshot) {
        callback(snapshot.val(), isNewSubjectJustCreated);
    }, firebaseErrorFrom('fetchActiveSubjects'));
}

// RETRIEVE AND RUNS CALLBACK FUNCTION ON ALL SUBJECTS' INFORMATION UPON REQUEST
function fetchAnActiveSubject(subjectId, callback) {
    var subjectRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
    subjectRef.once("value", function(snapshot) {
        callback(snapshot.val());
    }, firebaseErrorFrom('fetchAnActiveSubject'));
}

// UPDATE SUBJECT'S NAME
function changeSubjectName(subjectId, newName){
    var subjectRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser() + "/" + subjectId);
    subjectRef.update({
        "name": newName
    });
};


// UPDATE SUBJECT'S COLOUR
function updateSubjectColour(subjectId, newColour){
    var subjectRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser() + "/" + subjectId);
    subjectRef.update({
        "colour_scheme": newColour
    });
}


// MOVE SUBJECT TO DELETED
function deleteSubject(subjectId) {
    var oldRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser() + "/" + subjectId);
    var newRef = FIREBASE_REF.child('/Subjects/deleted/' + getLoggedInUser() + "/" + subjectId);
    oldRef.once('value', function(snapshot)  {
        newRef.set(snapshot.val());
        oldRef.remove();
    }, firebaseErrorFrom('deleteSubject'));
}


//=====================================================================
//                              TASKS
//=====================================================================


// ADD NEW TASK TO THE DB
function saveNewTask(subjectId, weekDate, newTask, postSaveCallback) {
    // CREATE A REFERENCE TO FIREBASE
    // In case this is the first task to be pushed, this will create a new Tasks/active node.
    var tasksRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + weekDate);
    //SAVE DATA TO FIREBASE
    var newTaskRef =  tasksRef.push(newTask);

    // FETCH SUBJECT'S DATA AND PERFORM POST SAVE ACTIONS
    var subjectRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
    subjectRef.once("value", function(subjectSnapshot) {
        newTaskRef.once('value', function(newTask)  {
            postSaveCallback(subjectId, subjectSnapshot.val(), newTask.key(), newTask.val());
        }, firebaseErrorFrom('saveNewTask'));
    }, firebaseErrorFrom('saveNewTask'));
};


// RETRIEVE AND RUNS CALLBACK FUNCTION ON ALL TASKS
function fetchActiveTasks(perSubjectCallback) {
    var activeTasksRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/active');
    activeTasksRef.once("value", function(subjects) {
        if (subjects.val() !== null) {
            subjects.forEach(function(subject) {
                var subjectId = subject.key();
                var subjectTasksDict = {};
                subject.forEach(function(week) {
                    var weekTaskData = week.val();
                    $.extend(subjectTasksDict, weekTaskData);
                });
                var subjectRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
                subjectRef.once("value", function(subjectSnapshot) {
                    perSubjectCallback(subjectId, subjectSnapshot.val(), subjectTasksDict);
                }, firebaseErrorFrom('fetchActiveTasks'));
            });
        }
    }, firebaseErrorFrom('fetchActiveTasks'));
}

function fetchDoneTasksPerSubject(subjectId, callback) {
    var doneTasksPerSubjectRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/done/' + subjectId);
    doneTasksPerSubjectRef.once("value", function(weeks) {
        if (weeks.val() !== null) {
            var tasksDict = {};
            weeks.forEach(function(week) {
                var tasksPerWeek = week.val();
                $.extend(tasksDict, tasksPerWeek);
            });
            var subjectRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
            subjectRef.once("value", function(subjectSnapshot) {
                callback(subjectId, subjectSnapshot.val(), tasksDict);
            }, firebaseErrorFrom('fetchDoneTasksPerSubject'));
        }
    }, firebaseErrorFrom('fetchDoneTasksPerSubject'));
}

function fetchTasksByWeek(startOfWeek, perSubjectCallback) {
    var doneTasksRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/done');
    doneTasksRef.once("value", function(subjects) {
        if (subjects.val() !== null) {
            subjects.forEach(function(subject) {
                if (subject.hasChild(startOfWeek)) {
                    var subjectId = subject.key();
                    var weekTasksDict = subject.val()[startOfWeek];
                    var subjectRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
                    subjectRef.once("value", function(subjectSnapshot) {
                        var isDone = true;
                        perSubjectCallback(subjectId, subjectSnapshot.val(), weekTasksDict, isDone);
                    }, firebaseErrorFrom('fetchTasksByWeek'));
                }
            });
        }
    }, firebaseErrorFrom('fetchTasksByWeek'));
    var activeTasksRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/active');
    activeTasksRef.once("value", function(subjects) {
        if (subjects.val() !== null) {
            subjects.forEach(function(subject) {
                if (subject.hasChild(startOfWeek)) {
                    var subjectId = subject.key();
                    var weekTasksDict = subject.val()[startOfWeek];
                    var subjectRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
                    subjectRef.once("value", function(subjectSnapshot) {
                        perSubjectCallback(subjectId, subjectSnapshot.val(), weekTasksDict);
                    }, firebaseErrorFrom('fetchTasksByWeek'));
                }
            });
        }
    }, firebaseErrorFrom('fetchTasksByWeek'));
}

// RETRIEVE AND RUNS CALLBACK FUNCTION ON ALL UNASSIGNED TASKS
function fetchAllUnassignedActiveTasks(perUnassignedSubjectCallback) {
    var activeTasksRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/active');
    activeTasksRef.once("value", function(subjects) {
        if (subjects.val() !== null) {
            subjects.forEach(function(subject) {
                var subjectId = subject.key();

                if (subject.hasChild('no_assigned_date')) {
                    var unassignedTasksDict = subject.val()['no_assigned_date'];
                    var subjectRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
                    subjectRef.once("value", function(subjectSnapshot) {
                        perUnassignedSubjectCallback(subjectId, subjectSnapshot.val(), unassignedTasksDict);
                    }, firebaseErrorFrom('fetchAllUnassignedActiveTasks'));
                }
            });
        }
    }, firebaseErrorFrom('fetchAllUnassignedActiveTasks'));
}

// RETRIEVE AND RUNS CALLBACK FUNCTION ON A SINGLE TASK
function fetchSingleTask(subjectId, weekDate, taskId, isDone, callback) {
    var taskRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/' + (isDone? "done" : "active") + '/' + subjectId + '/' + weekDate + '/' + taskId);
    taskRef.once("value", function(snapshot) {
        callback(subjectId, taskId, snapshot.val(), isDone);
    }, firebaseErrorFrom('fetchSingleTask'));
}

function updateTask(subjectId, taskId, oldWeekDate, originalTaskDetails, updatedTaskDetail, postUpdateCallback) {
    var newWeekDate = startOfWeek(updatedTaskDetail.assigned_date);
    var oldTaskRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + oldWeekDate + '/' + taskId);
    var newTaskRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + newWeekDate + '/' + taskId);

    // if we don't need to change the week, then the update is straightforward
    if (newWeekDate === oldWeekDate) {
        oldTaskRef.update(updatedTaskDetail);
    } else { // since we need to change the week, we need to move the task to a new location in the database
        oldTaskRef.once('value', function(snapshot)  {
            var oldTaskDict = snapshot.val();
            // the extend method would update oldTaskDict with the data stored in updatedTaskDetails.
            var combinedTaskDict = $.extend(oldTaskDict, updatedTaskDetail);
            newTaskRef.update(combinedTaskDict);
            oldTaskRef.remove();
        }, firebaseErrorFrom('updateTask'));
    }

    // POST UPDATE: FETCH SUBJECT'S DATA AND PERFORM POST UPDATE ACTIONS
    var subjectRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
    subjectRef.once('value', function(subjectSnapshot) {
        newTaskRef.once('value', function(updatedTask)  {
            postUpdateCallback(subjectId, subjectSnapshot.val(), taskId, originalTaskDetails, updatedTask.val());
        }, firebaseErrorFrom('updateTask'));
    }, firebaseErrorFrom('updateTask'));
}

function updateTaskDate(subjectId, taskId, oldWeekDate, updatedDate, postUpdateCallback) {
    var newWeekDate = startOfWeek(updatedDate.assigned_date);
    var oldTaskRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + oldWeekDate + '/' + taskId);
    var newTaskRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + newWeekDate + '/' + taskId);

    // if we don't need to change the week, then the update is straightforward
    if (newWeekDate === oldWeekDate) {
        oldTaskRef.update(updatedDate);
        oldTaskRef.once('value', function(updatedTask)  {
            postUpdateCallback(subjectId, taskId, updatedTask.val());
        }, firebaseErrorFrom('updateTask'));
    } else { // since we need to change the week, we need to move the task to a new location in the database
        oldTaskRef.once('value', function(snapshot)  {
            var oldTaskDict = snapshot.val();
            // the extend method would update oldTaskDict with the data stored in updatedTaskDetails.
            var combinedTaskDict = $.extend(oldTaskDict, updatedDate);
            newTaskRef.update(combinedTaskDict);
            oldTaskRef.remove();
            postUpdateCallback(subjectId, taskId, combinedTaskDict);
        }, firebaseErrorFrom('updateTask'));
    }
}

// DELETE TASKS WHICH ARE EITHER DONE OR ACTIVE FOR SUBJECT
function deletesTasksOfStatusPerSubject(subjectId, status) {
    var activeTasksPerSubjectRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/' + status + '/' + subjectId);
    activeTasksPerSubjectRef.once("value", function(weeks) {
        if (weeks.val() !== null) {
            weeks.forEach(function(week) {
                week.forEach(function(task) {
                    moveTaskToDeleted(subjectId, week.key(), task.key(), status);
                })
            });
        }
    }, firebaseErrorFrom('deletesTasksOfStatusPerSubject'));
}

// DELETE ALL ACTIVE AND DONE TASKS FOR SUBJECT
function deleteTasksPerSubject(subjectId) {
    deletesTasksOfStatusPerSubject(subjectId, 'active');
    deletesTasksOfStatusPerSubject(subjectId, 'done');
}

// MOVE ACTIVE TASK TO DELETED
function moveActiveTaskToDeleted(subjectId, weekDate, taskId) {
    moveTaskToDeleted(subjectId, weekDate, taskId, 'active');
}

function moveTaskToDeleted(subjectId, weekDate, taskId, status) {
    var oldRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/' + status + '/' + subjectId + '/' + weekDate + '/' + taskId);
    var newRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/deleted/' + subjectId + '/' + weekDate + '/' + taskId);
    oldRef.once('value', function(snapshot)  {
        newRef.set(snapshot.val());
        oldRef.remove();
        removeCardFromDOM(taskId);
        removeToDoTaskFromDOM(taskId);
    }, firebaseErrorFrom('moveTaskToDeleted'));
}

// MOVE TASK TO DONE
function moveTaskToDone(subjectId, taskId, originalDate) {
    var today = formatDate(new Date());
    var currentWeekMonday = startOfWeek(today);
    var oldRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + originalDate + '/' + taskId);
    var newRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/done/' + subjectId + '/' + currentWeekMonday + '/' + taskId);
    oldRef.once('value', function(snapshot)  {
        // update task's assigned date to be today's
        var taskDetails = snapshot.val();
        taskDetails.assigned_date = today;
        newRef.set(taskDetails);
        oldRef.remove();
    }, firebaseErrorFrom('moveTaskToDone'));
}

//=====================================================================
//                              TIME
//=====================================================================

function fetchTimeIntervals(callback) {
    if (dataCache.sessionTimes !== null) {
        callback(dataCache.sessionTimes);
    } else {
        var timeIntervalsRef = FIREBASE_REF.child('/Users/active/' + getLoggedInUser());
        timeIntervalsRef.once("value", function (snapshot) {
            var sessionTimes = snapshot.val()
            dataCache.sessionTimes = {
                study_session: sessionTimes.study_session_seconds,
                short_break: sessionTimes.short_break_seconds,
                long_break: sessionTimes.long_break_seconds
            }
            callback(dataCache.sessionTimes);
        }, firebaseErrorFrom('fetchTimeIntervals'));
    }
}

// UPDATE TIME INTERVALS FOR TIMER
function updateTimeIntervals(workSession, shortBreak, longBreak) {
    var timeIntervalRef = FIREBASE_REF.child('/Users/active/' + getLoggedInUser());
    timeIntervalRef.update({
        "study_session_seconds": parseInt(workSession),
        "short_break_seconds": parseInt(shortBreak),
        "long_break_seconds": parseInt(longBreak)
    });
    // invalidate the cache
    dataCache.sessionTimes = null;
}

function incrementNumOfBreaks(subjectId, weekDate, taskId) {
    incrementNumOfBreaksForTask(subjectId, weekDate, taskId);
    incrementNumOfBreaksForDate();
}

function incrementNumOfBreaksForTask(subjectId, weekDate, taskId) {
    var tasksBreakRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + weekDate + '/' + taskId + '/number_of_breaks');
    tasksBreakRef.once("value", function(snapshot) {
        var newNum = snapshot.val() + 1;
        tasksBreakRef.set(newNum);
    }, firebaseErrorFrom('incrementNumOfBreaksForTask'));
}

function incrementNumOfBreaksForDate() {
    var todaysDate = formatDate(new Date());
    var tasksBreakRef = FIREBASE_REF.child('/Heatmap/' + getLoggedInUser() + '/' + todaysDate + '/number_of_breaks');
    tasksBreakRef.once("value", function(snapshot) {
        var newNum = snapshot.val() + 1;
        tasksBreakRef.set(newNum);
    }, firebaseErrorFrom('incrementNumOfBreaksForDate'));
}

function updateTimeStudied(subjectId, weekDate, taskId, timeToLog, callback) {
    updateTimeStudiedForTask(subjectId, weekDate, taskId, timeToLog, callback);
    updateTimeStudiedForDate(timeToLog);
}

function updateTimeStudiedForTask(subjectId, weekDate, taskId, additionalTimeStudied, callback) {
    var totalSecondsStudiedPerTaskRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + weekDate + '/' + taskId + '/total_seconds_studied');
    totalSecondsStudiedPerTaskRef.once("value", function(snapshot) {
        var newTotalTime = snapshot.val() + additionalTimeStudied;
        totalSecondsStudiedPerTaskRef.set(newTotalTime);
        if (callback !== undefined) {
            callback(subjectId, weekDate, taskId);
        }
    }, firebaseErrorFrom('updateTimeStudiedForTask'));
}

function updateTimeStudiedForDate(additionalTimeStudied) {
    var todaysDate = formatDate(new Date());
    var totalSecondsStudiedPerDateRef = FIREBASE_REF.child('/Heatmap/' + getLoggedInUser() + '/' + todaysDate + '/time_studied');
    totalSecondsStudiedPerDateRef.once("value", function(snapshot) {
        var newTotalTime = snapshot.val() + additionalTimeStudied;
        totalSecondsStudiedPerDateRef.set(newTotalTime);
    }, firebaseErrorFrom('updateTimeStudiedForDate'));
}

function fetchTimeStudiedForTask(subjectId, weekDate, taskId, isDone, callback) {
    var totalSecondsStudiedPerTaskRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/' + (isDone? "done" : "active") + '/' + subjectId + '/' + weekDate + '/' + taskId + '/total_seconds_studied');
    totalSecondsStudiedPerTaskRef.once("value", function(snapshot) {
        var totalTimeStudied = snapshot.val();
        callback(totalTimeStudied, isDone);
    }, firebaseErrorFrom('fetchTimeStudiedForTask'));
}

//=====================================================================
//                              STATS
//=====================================================================

// RETRIEVE ALL DONE TASKS AND SUBJECTS AND RUN CALLBACK FUNCTION
// if renewcache set to true, go to the database. Otherwise, use cached data.
function fetchAllDoneTasks(callback, renewCache) {
    if (renewCache === undefined) {
        renewCache = false;
    }
    if (!renewCache && dataCache.barChart !== null) {
        callback(dataCache.barChart.subjects, dataCache.barChart.doneTasks);
    } else {
        var doneTasksRef = FIREBASE_REF.child('/Tasks/' + getLoggedInUser() + '/done');
        doneTasksRef.once("value", function(doneTasksSnapshot) {
            var subjectRef = FIREBASE_REF.child('/Subjects/active/' + getLoggedInUser());
            subjectRef.once("value", function(subjectsSnapshot) {
                dataCache.barChart = {
                    subjects: subjectsSnapshot.val(),
                    doneTasks: doneTasksSnapshot.val()
                }
                callback(dataCache.barChart.subjects, dataCache.barChart.doneTasks);
            }, firebaseErrorFrom('fetchAllDoneTasks'));
        }, firebaseErrorFrom('fetchAllDoneTasks'));
    }
}


function fetchHeatmapData(callback) {
    var heatmapRef = FIREBASE_REF.child('/Heatmap/' + getLoggedInUser());
    heatmapRef.once("value", function(heatmapSnapshot) {
        callback(heatmapSnapshot.val());
    }, firebaseErrorFrom('fetchHeatmapData'))
}


////////////////////////////////////////////Function for populating heatmap////////////////////////////////////////
//////////////////////////////////////////////TO BE DELETED////////////////////////////////////////////////////////


function doctorHeatmap(date, time){
    var subjectRef = FIREBASE_REF.child('/Heatmap/' + getLoggedInUser() + "/" + date);
    subjectRef.update({
        "time_studied": time
    });
}


doctorHeatmap('2015-12-05', 10000);

//[1500, 3600, 7200, 10800]
