//GLOBAL VARIABLES
FIREBASE_ROOT = "https://studybuddyapp.firebaseio.com";
var LOGGED_IN_UID = null;

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
function signUpUser(firstName, lastName, email, password) {
    var ref = new Firebase(FIREBASE_ROOT);
    ref.createUser({
        email: email,
        password: password
    }, function (error, userData) {
        if (error) {
            console.error("Error creating user:", error);
            if (error.code === "INVALID_EMAIL"){
                $('#signUpEmailErrorMessage').text('This does not look like a valid email address.');
            }
            if (error.code === "EMAIL_TAKEN"){
                $('#signUpEmailErrorMessage').text('The specified email address is already in use.');
            }
        } else {
            LOGGED_IN_UID = userData.uid;
            createUser(firstName, lastName, email, password, LOGGED_IN_UID);
        }
    });
}

// Log in existing user
function logInUser(email, password, signUpCallback) {
    var ref = new Firebase(FIREBASE_ROOT);
    ref.authWithPassword({
        email    : email,
        password : password
    }, function(error, authData) {
        if (error) {
            console.error("Error logging-in user:", error);
            console.error("Login Failed!", error);
            if (error.code === "INVALID_USER"){
                $('#logInEmailErrorMessage').text('The specified user does not exist.');
            }
            if (error.code === "INVALID_EMAIL"){
                $('#logInEmailErrorMessage').text('This does not look like a valid email address.');
            }
            if (error.code === "INVALID_PASSWORD"){
                $('#logInPasswordErrorMessage').text('Oops, wrong password.');
            }
        } else {
            LOGGED_IN_UID = authData.uid;
            if (signUpCallback !== undefined) {
                signUpCallback();
            }
            preparePage();
        }
    });
}

// GET THE CURRENT LOGGED-IN USER
function getLoggedInUser() {
    if (LOGGED_IN_UID !== null) {
        return LOGGED_IN_UID;
    } else {
        console.error("No user logged in.");
    }
}


//=====================================================================
//                              USERS
//=====================================================================

// ADD NEW USER TO THE DB
function saveNewUser(newUser, uid, callback) {
    // CREATE A REFERENCE TO FIREBASE
    var newUserRef = new Firebase(FIREBASE_ROOT + '/Users/active/' + uid);

    //SAVE USER DATA TO FIREBASE
    newUserRef.set(newUser, function (error) {
        if (error !== null) {
            callback();
        }
    });
}

// MOVE USER TO DELETED
// TODO: decide how this works with the authentication functions
function deleteUser(userUID) {
    var oldRef = new Firebase(FIREBASE_ROOT + '/Users/active/' + userUID);
    var newRef = new Firebase(FIREBASE_ROOT + '/Users/deleted/' + userUID);
    oldRef.once('value', function(snapshot)  {
        newRef.set(snapshot.val());
        oldRef.remove();
    }, firebaseErrorFrom('deleteUser'));
}


//=====================================================================
//                              SUBJECTS
//=====================================================================

// ADD NEW SUBJECT TO THE DB
function pushNewSubject(name, colour_scheme, is_deleted) {
    // CREATE A REFERENCE TO FIREBASE
    // In case this is the first subject to be pushed, this will create a new Subjects/active node.
    var subjectsRef = new Firebase(FIREBASE_ROOT + '/Subjects/active/' + getLoggedInUser());

    //SAVE DATA TO FIREBASE
    // I generated a reference to a new location (e.i. assigned the push into a
    // variable (newSubjectRef)), although it is not necessary, so that we could in the future
    // get the unique ID generated by push() by doing newSubjectRef.key();
    var newSubjectRef =  subjectsRef.push({
        name: name,
        colour_scheme: colour_scheme,
        is_deleted: is_deleted
    });
};

// RETRIEVE AND RUNS CALLBACK FUNCTION ON ALL SUBJECTS' INFORMATION UPON REQUEST
function fetchActiveSubjects(callback) {
    var subjectsRef = new Firebase(FIREBASE_ROOT + '/Subjects/active/' + getLoggedInUser());
    subjectsRef.once("value", function(snapshot) {
        callback(snapshot.val());
    }, firebaseErrorFrom('fetchActiveSubjects'));
}

// RETRIEVE AND RUNS CALLBACK FUNCTION ON ALL SUBJECTS' INFORMATION UPON REQUEST
function fetchAnActiveSubject(subjectId, callback) {
    var subjectRef = new Firebase(FIREBASE_ROOT + '/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
    subjectRef.once("value", function(snapshot) {
        callback(snapshot.val());
    }, firebaseErrorFrom('fetchAnActiveSubject'));
}

// UPDATE SUBJECT'S NAME
function changeSubjectName(subjectId, newName){
    var subjectRef = new Firebase(FIREBASE_ROOT + '/Subjects/active/' + getLoggedInUser() + "/" + subjectId);
    subjectRef.update({
        "name": newName
    });
};


// UPDATE SUBJECT'S COLOUR
function updateSubjectColour(subjectId, newColour){
    var subjectRef = new Firebase(FIREBASE_ROOT + '/Subjects/active/' + getLoggedInUser() + "/" + subjectId);
    subjectRef.update({
        "colour_scheme": newColour
    });
}


// MOVE SUBJECT TO DELETED
function deleteSubject(subjectId) {
    var oldRef = new Firebase(FIREBASE_ROOT + '/Subjects/active/' + getLoggedInUser() + "/" + subjectId);
    var newRef = new Firebase(FIREBASE_ROOT + '/Subjects/deleted/' + getLoggedInUser() + "/" + subjectId);
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
    var tasksRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + weekDate);
    //SAVE DATA TO FIREBASE
    var newTaskRef =  tasksRef.push(newTask);

    // FETCH SUBJECT'S DATA AND PERFORM POST SAVE ACTIONS
    var subjectRef = new Firebase(FIREBASE_ROOT + '/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
    subjectRef.once("value", function(subjectSnapshot) {
        newTaskRef.once('value', function(newTask)  {
            postSaveCallback(subjectId, subjectSnapshot.val(), newTask.key(), newTask.val());
        }, firebaseErrorFrom('saveNewTask'));
    }, firebaseErrorFrom('saveNewTask'));
};


// RETRIEVE AND RUNS CALLBACK FUNCTION ON ALL TASKS
function fetchActiveTasks(perSubjectCallback) {
    var activeTasksRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/active');
    activeTasksRef.once("value", function(subjects) {
        if (subjects.val() !== null) {
            subjects.forEach(function(subject) {
                var subjectId = subject.key();
                var subjectTasksDict = {};
                subject.forEach(function(week) {
                    var weekTaskData = week.val();
                    $.extend(subjectTasksDict, weekTaskData);
                });
                var subjectRef = new Firebase(FIREBASE_ROOT + '/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
                subjectRef.once("value", function(subjectSnapshot) {
                    perSubjectCallback(subjectId, subjectSnapshot.val(), subjectTasksDict);
                }, firebaseErrorFrom('fetchActiveTasks'));
            });
        }
    }, firebaseErrorFrom('fetchActiveTasks'));
}

function fetchDoneTasksPerSubject(subjectId, callback) {
    var doneTasksPerSubjectRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/done/' + subjectId);
    doneTasksPerSubjectRef.once("value", function(weeks) {
        if (weeks.val() !== null) {
            var tasksDict = {};
            weeks.forEach(function(week) {
                var tasksPerWeek = week.val();
                $.extend(tasksDict, tasksPerWeek);
            });
            var subjectRef = new Firebase(FIREBASE_ROOT + '/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
            subjectRef.once("value", function(subjectSnapshot) {
                callback(subjectId, subjectSnapshot.val(), tasksDict);
            }, firebaseErrorFrom('fetchDoneTasksPerSubject'));
        }
    }, firebaseErrorFrom('fetchDoneTasksPerSubject'));
}

function fetchTasksByWeek(startOfWeek, perSubjectCallback) {
    var doneTasksRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/done');
    doneTasksRef.once("value", function(subjects) {
        if (subjects.val() !== null) {
            subjects.forEach(function(subject) {
                if (subject.hasChild(startOfWeek)) {
                    var subjectId = subject.key();
                    var weekTasksDict = subject.val()[startOfWeek];
                    var subjectRef = new Firebase(FIREBASE_ROOT + '/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
                    subjectRef.once("value", function(subjectSnapshot) {
                        perSubjectCallback(subjectId, subjectSnapshot.val(), weekTasksDict, 'done');
                    }, firebaseErrorFrom('fetchTasksByWeek'));
                }
            });
        }
    }, firebaseErrorFrom('fetchTasksByWeek'));
    var activeTasksRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/active');
    activeTasksRef.once("value", function(subjects) {
        if (subjects.val() !== null) {
            subjects.forEach(function(subject) {
                if (subject.hasChild(startOfWeek)) {
                    var subjectId = subject.key();
                    var weekTasksDict = subject.val()[startOfWeek];
                    var subjectRef = new Firebase(FIREBASE_ROOT + '/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
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
    var activeTasksRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/active');
    activeTasksRef.once("value", function(subjects) {
        if (subjects.val() !== null) {
            subjects.forEach(function(subject) {
                var subjectId = subject.key();

                if (subject.hasChild('no_assigned_date')) {
                    var unassignedTasksDict = subject.val()['no_assigned_date'];
                    var subjectRef = new Firebase(FIREBASE_ROOT + '/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
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
    var taskRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/' + (isDone? "done" : "active") + '/' + subjectId + '/' + weekDate + '/' + taskId);
    taskRef.once("value", function(snapshot) {
        callback(subjectId, taskId, snapshot.val());
    }, firebaseErrorFrom('fetchSingleTask'));
}


function updateTask(subjectId, taskId, oldWeekDate, updatedTaskDetail, whatToUpdate, postUpdateCallback) {

    // PREPARATION
    var oldTaskRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + oldWeekDate + '/' + taskId);

    // check if change is date
    if (whatToUpdate !== "assigned_date") {
        oldTaskRef.update(updatedTaskDetail);
    } else {
        // find new week date
        var newWeekDate = startOfWeek(updatedTaskDetail.assigned_date);
        var newTaskRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + newWeekDate + '/' + taskId);
        // check if the new assigned date still belongs to the same week as the old one
        if (newWeekDate === oldWeekDate) {
            oldTaskRef.update(updatedTaskDetail);
        } else {
            oldTaskRef.once('value', function(snapshot)  {
                var oldTaskDict = snapshot.val();
                // the extend method would update oldTaskDict with the data stored in updatedTaskDetails.
                var combinedTaskDict = $.extend(oldTaskDict, updatedTaskDetail);
                newTaskRef.update(combinedTaskDict);
                oldTaskRef.remove();
            }, firebaseErrorFrom('updateTask'));
        }
    }

    // TODO: turn the next lines into a function, to be called 3 times (after lines: 304, 311, 318)
    // POST UPDATE: FETCH SUBJECT'S DATA AND PERFORM POST UPDATE ACTIONS
    var subjectRef = new Firebase(FIREBASE_ROOT + '/Subjects/active/' + getLoggedInUser() + '/' + subjectId);
    subjectRef.once('value', function(subjectSnapshot) {
        newTaskRef.once('value', function(updatedTask)  {
            //postUpdateCallback(subjectId, subjectSnapshot.val(), updatedTask.key(), updatedTask.val(), newWeekDate);
        }, firebaseErrorFrom('updateTask'));
    }, firebaseErrorFrom('updateTask'));
}


// MOVE TASK TO DELETED
function moveTaskToDeleted(subjectId, weekDate, taskId) {
    var oldRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + weekDate + '/' + taskId);
    var newRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/deleted/' + subjectId + '/' + weekDate + '/' + taskId);
    oldRef.once('value', function(snapshot)  {
        newRef.set(snapshot.val());
        oldRef.remove();
        removeTaskFromDOM(taskId);
    }, firebaseErrorFrom('moveTaskToDeleted'));
}


// MOVE TASK TO DONE
function moveTaskToDone(subjectId, taskId, originalDate, currentWeekMonday) {
    var oldRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + originalDate + '/' + taskId);
    var newRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/done/' + subjectId + '/' + currentWeekMonday + '/' + taskId);
    oldRef.once('value', function(snapshot)  {
        newRef.set(snapshot.val());
        oldRef.remove();
    }, firebaseErrorFrom('moveTaskToDone'));
}

//=====================================================================
//                              TIME
//=====================================================================

function fetchTimeIntervals(callback) {
    if (cachedSessionTimes !== null) {
        callback(cachedSessionTimes);
        workSessionLength = cachedSessionTimes.study_session;
    } else {
        var timeIntervalsRef = new Firebase(FIREBASE_ROOT +'/Users/active/' + getLoggedInUser());
        timeIntervalsRef.once("value", function (snapshot) {
            var sessionTimes = snapshot.val()
            cachedSessionTimes = {
                study_session: sessionTimes.study_session_seconds,
                short_break: sessionTimes.short_break_seconds,
                long_break: sessionTimes.long_break_seconds
            }
            callback(cachedSessionTimes);
            workSessionLength = cachedSessionTimes.study_session;
        });
    }

}

function incrementNumOfBreaks(subjectId, weekDate, taskId) {
    incrementNumOfBreaksForTask(subjectId, weekDate, taskId);
    incrementNumOfBreaksForDate();
}

function incrementNumOfBreaksForTask(subjectId, weekDate, taskId) {
    var tasksBreakRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + weekDate + '/' + taskId + '/number_of_breaks');
    tasksBreakRef.once("value", function(snapshot) {
        var newNum = snapshot.val() + 1;
        tasksBreakRef.set(newNum);
    }, firebaseErrorFrom('incrementNumOfBreaksForTask'));
}

function incrementNumOfBreaksForDate() {
    var todaysDate = Date.today().toString('yyyy-MM-dd');
    var tasksBreakRef = new Firebase(FIREBASE_ROOT + '/heatmap_dates/' + todaysDate + '/' + getLoggedInUser() + '/number_of_breaks');
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
    var totalSecondsStudiedPerTaskRef = new Firebase(FIREBASE_ROOT + '/Tasks/' + getLoggedInUser() + '/active/' + subjectId + '/' + weekDate + '/' + taskId + '/total_seconds_studied');
    totalSecondsStudiedPerTaskRef.once("value", function(snapshot) {
        var newTotalTime = snapshot.val() + additionalTimeStudied;
        totalSecondsStudiedPerTaskRef.set(newTotalTime);
        if (callback !== undefined) {
            callback(subjectId, weekDate, taskId);
        }
    }, firebaseErrorFrom('updateTimeStudiedForTask'));
}

function updateTimeStudiedForDate(additionalTimeStudied) {
    var todaysDate = Date.today().toString('yyyy-MM-dd');
    var totalSecondsStudiedPerDateRef = new Firebase(FIREBASE_ROOT + '/heatmap_dates/' + todaysDate + '/' + getLoggedInUser() + '/time_studied');
    totalSecondsStudiedPerDateRef.once("value", function(snapshot) {
        var newTotalTime = snapshot.val() + additionalTimeStudied;
        totalSecondsStudiedPerDateRef.set(newTotalTime);
    }, firebaseErrorFrom('updateTimeStudiedForDate'));
}