
function preparePage() {
     //Instantiate FastClick on the body, for eliminating the 300ms delay between a physical tap and the firing of a click event on mobile browsers
    $(function() {
        FastClick.attach(document.body);
    });

    $('#navBar').show();

    prepareCalendar();
    prepareCalendarSlider();
    // set nav buttons
    prepareNavigation();

    // toggle the bottom Subjects Panel
    $("#flip").click(function(){
        $("#footer").slideToggle("fast");
    });
    // hide tasksDiv in the bottom panel
    $('#tasksDiv').hide();


    // RETRIEVE AND DISPLAY ALL SUBJECTS INFORMATION INSTANTLY WHEN PAGE FINISHES LOADING
    fetchActiveSubjects(false, displayActiveSubjects);

    // fetch and append all unassigned active tasks to footer
    fetchAllUnassignedActiveTasks(displayTasksInBottomPanel)

    // pre-cache session times for pomodoro timer
    fetchTimeIntervals(function(){});

    // display time intervals in the Settings menu
    fetchTimeIntervals(displayTimeIntervals);

    // prepare Ruzo animations
    prepareDoneRuzo();
    prepareSwitchToShortBreakTL();
    prepareSwitchToLongBreakTL();
    prepareSwitchToSecondShortBreakTL();

    blurOnEnter($('#titleInput'));
    blurOnEnter($('#titleInput'));
    //setTimeout(function(){
    //    navigator.splashscreen.hide();
    //}, 2000);
    //console.log("This is after splash screen is hidden");
}

//===========================================================================================================
//NAVIGATION PANEL
//===========================================================================================================

// show and hide different pages
function switchToPage(selectedPageName) {
    var pageIds = {
        "calendar": {"pageId": "#calendarPage", "highlightId": "#weekHighlight", "buttonId": "#calendarButton"},
        "subjects": {"pageId": "#subjectsPage", "highlightId": "#subjectsHighlight", "buttonId": "#subjectsButton"},
        "progress": {"pageId": "#profilePage", "highlightId": "#progressHighlight", "buttonId": "#progressButton"}
    }

    // hide everything
    $.each(pageIds, function(pageName, pageDict){
        $(pageDict.pageId).hide();
        $(pageDict.highlightId).hide();
        $(pageDict.buttonId).prop("disabled", false);
    });

    // only show current page
    $(pageIds[selectedPageName].pageId).show();
    // only show current highlight
    $(pageIds[selectedPageName].highlightId).show();
    // only disable current nav button
    $(pageIds[selectedPageName].buttonId).prop("disabled", true);
}

function showSubjectsPage() {
    switchToPage("subjects");
}

function showCalendarPage() {
    switchToPage("calendar");
}

function showProgressPage() {
    switchToPage("progress");

    var renewCache = true;
    fetchAndDisplayProgressForLast7Days(renewCache);
    // draw the heat-map inside the progress page (in #cal-heatmap)
    drawHeatmap();

    fetchHeatmapData(fetchUsername);

    // display adaptive feedback for the heatmap
    fetchHeatmapData(function(heatmapSnapshot) {

        var timestring = isBestMonth(heatmapSnapshot);

        if (timestring !== undefined) {
            $('#heatmapMessage').text('This is your best month so far, with ' + timestring + ' studied.');
        } else {
            // choose randomly which feedback to display
            if (Math.random() > 0.5) {
                timestring = timeThisMonth(heatmapSnapshot);
                $('#heatmapMessage').text('You\'ve spent ' + timestring + ' studying since the start of this month.');
            } else {
                var bestDay = findBestWeekDay(heatmapSnapshot);
                $('#heatmapMessage').text('Looks like ' + bestDay + ' is normally your most productive day.');
            }
        }
    });
}

function prepareNavigation() {
     // hide signup & login pages, reveal app pages and start the app on the calendar page
    $('#signUpPage').hide();
    $('#logInPage').hide();
    $('#appPages').show();
    switchToPage("calendar");
}

function goToLogin() {
    if(navigator.onLine === false){
        $('#noInternetPage').css("display", "block");
    } else {
        //navigator.splashscreen.hide();
        prepareLoginRuzo();
        // when clicking enter while on password field, if email field isn't empty, attempt to login
        executeOnEnter($('#logInPasswordInput'), prepareLogIn);
        // when clicking enter while on password field, if email field isn't empty, attempt to signup
        executeOnEnter($('#confirmPasswordInput'), prepareSignUp);

        var suppressError = true;
        if (getLoggedInUser(suppressError)) {
            preparePage();
        } else {
            showSignUp();
        }
    }
}

function showSignUp() {
    $('#appPages').hide();
    $('#logInPage').hide();
    $('#signUpPage').show();
}

function showLogIn() {
    $('#appPages').hide();
    $('#signUpPage').hide();
    $('#logInPage').show();
}

//Make these things happen each time the page finishes loading
function isMobile() {
    return screen.width < 1000;
}

function applySortable(selector) {
    var sortableOptions = {
        group: "tasks",
        ghostClass: "sortable-ghost",
        onAdd: dragTask,
        onChoose: pickupCard,
        forceFallback: true,
        fallbackClass: "dragged-item",
        filter: ".doneTask"
    }
    if (isMobile()) {
        //set up drag and drop for each list, with delay to imitate long-press
        sortableOptions['delay'] = 100;
    }
    $(selector).each(function (i, list) {
        Sortable.create(list, sortableOptions);
    });
}

function pickupCard() {
    navigator.vibrate(100);
    // NEXT LINE IS FOR TESTING, DELETE WHEN DONE TESTING
    playPop();
}

// when card is dragged-and-dropped in Sortable
function dragTask(evt) {
    var subjectId = evt.item.dataset.subjectid;
    var taskId = evt.item.dataset.taskid;

    var oldAssignedDate = evt.from.id;
    var oldWeekDate = startOfWeek(oldAssignedDate);
    var newAssignedDate = evt.item.parentElement.id;

    if (newAssignedDate === "unassignedTasksList") {
        var updatedTaskDetail = {assigned_date: ""};
    } else {
        var updatedTaskDetail = {assigned_date: newAssignedDate};
    }

    updateTaskDate(subjectId, taskId, oldWeekDate, updatedTaskDetail, updateTaskFields);
}

function blurOnEnter(element) {
    element.keyup(function(event){
        if (event.keyCode === 13) {
            element.blur();
        }
    });
}

function executeOnEnter(element, callback) {
    element.keyup(function(event){
        if (event.keyCode === 13) {
            callback();
        }
    });
}

//===========================================================================================================
//CREATE CALENDAR
//===========================================================================================================

function createHtmlForWeekOf(mondayOfCurrentWeek) {
    // Append current week's days to #dayColumns
    var daysHtml = "";
    for (var i = 0; i < 7; i++) {
        var currentDate = new Date(mondayOfCurrentWeek);
        currentDate.setDate(currentDate.getDate() + i)
        var currentDateTitle = formatDate(currentDate, 'd MMM');
        var currentDay = formatDate(currentDate, 'ddd');

        // Append day
        daysHtml += '<div class="col dayColumn">' +
            '<div class="dayDateDiv"><span class="dayHeadingOnCalendar">' + currentDay + '</span>' +
            '<span class="dateOnCalendarDay">' + currentDateTitle +'</span></div>' +
            '<button class="addTaskFromCalendar needsclick" onclick="openAddTaskDialog(\'' +
            formatDate(currentDate) + '\');">Add a task...</button>' +
            '<ul class="sortable-task-list dayList" id="' + formatDate(currentDate) + '"></ul>' +
            '</div>';
    }

    var weekHtml =  '<div class="week">' +
        '<div class="section group" id="week' + mondayOfCurrentWeek + '">' +
        daysHtml +
        '</div>' +
        '</div>'
    return weekHtml;
}

function prepareCalendar() {
    var mondayOfPrevWeek = startOfWeek(new Date(), -7);
    var mondayOfCurrentWeek = startOfWeek(new Date());
    var mondayOfNextWeek = startOfWeek(new Date(), 7);

    $('#calendarWrapper').append(createHtmlForWeekOf(mondayOfPrevWeek));
    $('#calendarWrapper').append(createHtmlForWeekOf(mondayOfCurrentWeek));
    $('#calendarWrapper').append(createHtmlForWeekOf(mondayOfNextWeek));

    applySortable(".sortable-task-list");

    // Display current week's dates
    var firstDateOfCurrentWeek = $('#dayColumns div:first-child ul').attr('id')
    var lastDateOfCurrentWeek = $('#dayColumns div:last-child ul').attr('id')
    $('#currentWeekDates').append(firstDateOfCurrentWeek + ' - ' + lastDateOfCurrentWeek);

    fetchTasksByWeek(mondayOfPrevWeek, displayTasksForWeekAndSubject);
    fetchTasksByWeek(mondayOfCurrentWeek, displayTasksForWeekAndSubject);
    fetchTasksByWeek(mondayOfNextWeek, displayTasksForWeekAndSubject);
}



//===========================================================================================================
//OPEN A TASK CARD
//===========================================================================================================

function fillInTaskDetails(subjectId, taskId, taskDetails, isDone) {

    if (taskDetails.title.length> 25){
        $('#cardTitle').css("line-height", "1.4em").css("margin-bottom", "10px");
    } else {
        $('#cardTitle').css("margin-bottom", "0px").css("line-height", ".8em");
    }

    $('#timeStudiedWrapper').show();

    $('#taskSubject').val(subjectId);
    $('#cardTitle').val(taskDetails.title);
    $('#cardDescription').val(taskDetails.description);

    var weekDate = startOfWeek(taskDetails.assigned_date);
    $('#cardAssignedDate').data('date', taskDetails.assigned_date);
    $('#cardAssignedDate').val(taskDetails.assigned_date);

    $('#taskModal').addClass('displayed');

    // Clear old onclick handlers and set new ones
    $('#deleteTask').off("click");
    $('#deleteTask').on("click", function(){displayAreYouSureDeleteTask();});
    $('#confirmDeleteTaskButton').off("click");
    $('#confirmDeleteTaskButton').on("click", function(){closeTaskModal(subjectId, weekDate, taskId, taskDetails, moveActiveTaskToDeleted);});
    $('#noDeleteTaskButton').off("click");
    $('#noDeleteTaskButton').on("click", function(){hideAreYouSureDeleteTask();});
    $('#completeTask').off("click");
    $('#completeTask').on("click", function(){closeTaskModal(subjectId, weekDate, taskId, taskDetails, markAsDone);});
    $('#playPauseButton').off("click");
    $('#playPauseButton').on("click", function(){playPauseTimer(subjectId, weekDate, taskId);});
    $('#stopButton').off("click");
    $('#stopButton').on("click", function(){stopTimer(subjectId, weekDate, taskId);});
    $('#closeTaskModal').off("click");
    $('#closeTaskModalDone').off("click");

    showTaskModal(subjectId, isDone);

    fetchTimeStudiedForTask(subjectId, weekDate, taskId, isDone, displayTimeStudiedForTask);

    if (isDone) {
        $('#timeStudiedWrapper').hide();
        // prevent user from changing assigned date
        $('#cardAssignedDate').attr('disabled', true);
        $('#closeTaskModalDone').on("click", closeModalWindow);
        // set event handler for closing the modal when user clicks outside modal
        setCloseWhenClickingOutside($('#taskModal'), function() {closeTaskModal(subjectId, weekDate, taskId, taskDetails);});
    } else {
        // enable user to edit assigned date
        $('#cardAssignedDate').attr('disabled', false);
        $('#closeTaskModal').on("click", function(){closeTaskModal(subjectId, weekDate, taskId, taskDetails, function(){submitTaskChanges(subjectId, weekDate, taskId, taskDetails);})});
        // set event handler for closing the modal when user clicks outside modal, and submit the task changes when closing the modal window
        setCloseWhenClickingOutside($('#taskModal'), function() {
            closeTaskModalAndSubmit(subjectId, weekDate, taskId, taskDetails);
        });
    }
}

function closeTaskModalAndSubmit(subjectId, weekDate, taskId, taskDetails){
    closeTaskModal(subjectId, weekDate, taskId, taskDetails,  function(){
        submitTaskChanges(subjectId, weekDate, taskId, taskDetails);
    });
}

function showTaskModal(subjectId, isDone) {
    // change heading's background to main colour, and left side's background to secondary colour
    fetchAnActiveSubject(subjectId, function(subjectDict) {
        $('#taskCardHeadingDiv, #leftSideTaskCard, #completeTask').addClass(subjectDict.colour_scheme);
    });


    // hide both divs and then only show the relevant one depending if task is done or not.
    $('#doneTaskInfo').hide();
    $('#pomodoroDiv').hide();
    $('#deleteTask').show();
    $('#completeTask').show();
    if (isDone) {
        $('#doneTaskInfo').show();
        $('#deleteTask').hide();
        $('#completeTask').hide();
    } else {
        $('#pomodoroDiv').show();
    }

    //Makes the modal window display
    $('#taskModal').css('display','block');
    //Fades in the greyed-out background
    $('#taskModalBG').show();
    $('#calendarPage').addClass('frostedGlass');
    $('#iPadStatusBar').addClass('frostedGlass');
    $('#subjectsPage').addClass('frostedGlass');
    $('#navBar').addClass('frostedGlass');
}

function formatTimeString(totalSeconds) {
    var hours = Math.floor(totalSeconds/3600);
    var minutes = Math.ceil((totalSeconds - hours*3600)/60);
    var hoursString = "";
    var minutesString = "";

    if (hours !== 0) {
        if (hours === 1) {
            hoursString = hours + " hour ";
        } else {
            hoursString = hours + " hours ";
        }
    }

    if (minutes !== 0) {
        if (minutes === 1) {
            minutesString = minutes + " minute ";
        } else {
            minutesString = minutes + " minutes ";
        }
    }

    var and = true;
    if (hours === 0 || minutes === 0) {
        and = false;
    }

    var timeString = hoursString + (and? "and " : "") + minutesString

    return timeString;
}

function displayTimeStudiedForTask(totalSecondsStudied, isDone) {
    $('#totalTimeStudiedActiveTask').val('');
    var timeString = formatTimeString(totalSecondsStudied);

    if (isDone) {
        if (totalSecondsStudied === null) {
            $('#totalTimeStudiedDoneTask').text("Well done on completing this task!");
        } else {
            $('#totalTimeStudiedDoneTask').text("You spent " + timeString + "on this task. Good work!");
        }
    } else {
        if (totalSecondsStudied !== null) {
            $('#totalTimeStudiedActiveTask').val(timeString);
        } else {
            $('#totalTimeStudiedActiveTask').val("No time yet!");
        }
    }
}

//===========================================================================================================
//CREATE A TASK CARD
//===========================================================================================================
var dayList;

function openAddTaskDialog(date){
    //Automatically fill the assigned date
    $('#assignedDateInput').val(date);
    //Makes the modal window display
    $('#addTaskModal').css('display','block');
    $('#calendarPage').addClass('frostedGlass');
    $('#iPadStatusBar').addClass('frostedGlass');
    $('#navBar').addClass('frostedGlass');
    //Fades in the greyed-out background
    $('#addTaskModalBG').show();
    // Clear any old onclick handler
    $('#submitNewTask').off("click");
    // Set the new onclick handler
    $('#submitNewTask').on("click", createTask);

    setCloseWhenClickingOutside($('#addTaskModal'), closeModalWindow);
}


//===========================================================================================================
// CLOSING MODAL WINDOWS
//===========================================================================================================

// FOR HIDING AND RESETING MODALS
function closeModalWindow() {
    // prevent document from continuing to listen to clicks outside the modal container.
    if (isMobile()) {
        $(document).off('touchend');
    } else {
        $(document).off('mouseup');
    }

    $('#taskModal').removeClass('displayed');
    $('#calendarPage').removeClass('frostedGlass');
    $('#iPadStatusBar').removeClass('frostedGlass');
    $('#navBar').removeClass('frostedGlass');
    $('#subjectsPage').removeClass('frostedGlass');
    //Hide the greyed background
    $('.modal-bg').hide();
    //Hide the modal window
    $('.modal').hide();

    // Clear input fields
    $('.inputField').val('');

    // ******************** FOR COLOUR PICKERS ********************
    // Clear colour message
    $('.colourMessage').text('');
    // remove selection of colour from colour picker in the Add a Subject modal.
    $('.colourOption').removeClass('chosenColour');

    // ******************** FOR ADD TASK MODAL ********************
    // Reset select value to default
    $('#subjectInput option').prop('selected', function() {
        // Reset select value to default
        return this.defaultSelected;
    });

    // ******************** FOR TASK MODAL ********************
    // remove all classes from #taskCardHeadingDiv & #leftSideTaskCard and then restore the the ones needed for future colour change
    $('#taskCardHeadingDiv, #leftSideTaskCard, #completeTask').removeClass();
    $('#taskCardHeadingDiv').addClass('mainColour');
    $('#leftSideTaskCard').addClass('secondaryColour');
    hideAreYouSureDeleteTask();

    // ******************** FOR SETTINGS MENU ********************
    $('#settingsMenu').hide();
}


// FOR CLOSING THE TASK DETAILS MODAL
function closeTaskModal(subjectId, weekDate, taskId, originalTaskDetails, callback) {
    closeModalWindow();

    // if timer is currently not stopped (meaning it's either playing or paused), stop the timer.
    if (!$('#stopButton').hasClass('stopped')) {
        stopTimer(subjectId, weekDate, taskId, callback);
    // else, if a callback func (such as moveActiveTaskToDeleted) was passed, execute it
    } else {
        if (callback !== undefined) {
            callback(subjectId, weekDate, taskId, originalTaskDetails);
        }
    }
}

// set event handler for closing the modal when user clicks outside modal.
function setCloseWhenClickingOutside(modalWindow, callback) {
    var eventType = isMobile()? "touchend" : "mouseup";
    $(document).off(eventType);
    $(document).on(eventType, function (event) {
        // if the target of the click isn't the modal window, nor a descendant of the modal window
        if (!modalWindow.is(event.target) && modalWindow.has(event.target).length === 0) {
            callback();
        }
    });
}

// set event handler for closing the areYouSureModal modal when user clicks outside modal.
function setCloseWhenClickingOutsideForAreYouSureModal() {
    var eventType = isMobile()? "touchend" : "mouseup";
    $(document).off(eventType);
    $(document).on(eventType, function (event) {
        // if the target of the click isn't the modal window, nor a descendant of the modal window
        if (!$('#areYouSureModal').is(event.target) && $('#areYouSureModal').has(event.target).length === 0) {
            closeModalWindow();
        }
    });
}

//===========================================================================================================
// SETTINGS MENU
//===========================================================================================================

function showSettingsMenu() {
    if ($('#settingsMenu').css('display') === 'none') {
        // position colour palette menu next to the editColour button
        var buttonOffset = $('#settingsButton').offset();
        $('#settingsMenu').css('left', buttonOffset.left - 136);
        $('#settingsMenu').css('top',buttonOffset.top + 98);
        setCloseWhenClickingOutside($('#settingsMenu, #settingsButton'), closeModalWindow);
        $('#settingsButtons').css("display", "block");
        $('#longBreakSettings').css("display", "none");
        $('#shortBreakSettings').css("display", "none");
        $('#studySessionSettings').css("display", "none");
        $('#backButtonSettings').css("display", "none");
        $('#settingsMenu').show();
    } else {
        $('#settingsMenu').hide();
    }
}

function openStudySessionSettings(){
    $('#settingsButtons').css("display", "none");
    $('#studySessionSettings').css("display", "block");
    $('#backButtonSettings').css("display", "block");
}

function openShortBreakSettings(){
    $('#settingsButtons').css("display", "none");
    $('#shortBreakSettings').css("display", "block");
    $('#backButtonSettings').css("display", "block");
}

function openLongBreakSettings(){
    $('#settingsButtons').css("display", "none");
    $('#longBreakSettings').css("display", "block");
    $('#backButtonSettings').css("display", "block");
}

function backToSettings(){
    $('#settingsButtons').css("display", "block");
    $('#longBreakSettings').css("display", "none");
    $('#shortBreakSettings').css("display", "none");
    $('#studySessionSettings').css("display", "none");
    $('#backButtonSettings').css("display", "none");
    changeTimeIntervals();
}

function increaseStudySessionLength(){
    var studySessInput = parseInt($('#workIntervalInput').val());
    $('#workIntervalInput').val(studySessInput +1);
    changeTimeIntervals();
}

function decreaseStudySessionLength(){
    var studySessInput = parseInt($('#workIntervalInput').val());
    if(studySessInput>=2){
        $('#workIntervalInput').val(studySessInput -1);
        changeTimeIntervals();
    } else{
        $('#workIntervalInput').val(studySessInput);
    }
}

function increaseShortBreakLength(){
    var shortBreakInput = parseInt($('#shortBreakIntervalInput').val());
    $('#shortBreakIntervalInput').val(shortBreakInput + 1);
    changeTimeIntervals();
}

function decreaseShortBreakLength(){
    var shortBreakInput = parseInt($('#shortBreakIntervalInput').val());
    if(shortBreakInput>=2){
        $('#shortBreakIntervalInput').val(shortBreakInput - 1);
        changeTimeIntervals();
    }else{
        $('#shortBreakIntervalInput').val(shortBreakInput);
    }
}

function increaseLongBreakLength(){
    var longBreakInput = parseInt($('#longBreakIntervalInput').val());
    $('#longBreakIntervalInput').val(longBreakInput + 1);
    changeTimeIntervals();
}

function decreaseLongBreakLength(){
    var longBreakInput = parseInt($('#longBreakIntervalInput').val());
    if(longBreakInput>=2){
        $('#longBreakIntervalInput').val(longBreakInput - 1);
        changeTimeIntervals();
    } else {
        $('#longBreakIntervalInput').val(longBreakInput);
    }
}

function changeTimeIntervals() {
    var workSession = $('#workIntervalInput').val();
    var shortBreak = $('#shortBreakIntervalInput').val();
    var longBreak = $('#longBreakIntervalInput').val();

    if(isNaN(workSession)|| workSession<=1){            //If the user enters something that's not a number, or that's less than one
        workSession = 1                                 //Make workSession eqaul to one
        $('#workIntervalInput').val(workSession);       //and display this in the input field
    }else{                                              //Otherwise
        workSession = workSession;                      //Make workSession be what it originally was (the user's input)
    }

    if(isNaN(shortBreak)|| shortBreak<=1){              //Same logic as above
        shortBreak = 1;
        $('#shortBreakIntervalInput').val(shortBreak);
    }else{
        shortBreak = shortBreak;
    }

    if(isNaN(longBreak)|| longBreak<=1){                //Same logic as above
        longBreak = 1;
        $('#longBreakIntervalInput').val(longBreak);
    }else{
        longBreak = longBreak;
    }

    $('#studySessionLengthDisplay').html(workSession + " minutes");     //Changes the html on the settings menu to reflect the new times
    $('#shortBreakLengthDisplay').html(shortBreak + " minutes");
    $('#longBreakLengthDisplay').html(longBreak + " minutes");
    updateTimeIntervals(workSession*60, shortBreak*60, longBreak*60);
    prepareHourGlass();
}

function displayTimeIntervals(sessionTimes) {
    $('#studySessionLengthDisplay').html(sessionTimes.study_session/60 + " minutes");
    $('#shortBreakLengthDisplay').html(sessionTimes.short_break/60 + " minutes");
    $('#longBreakLengthDisplay').html(sessionTimes.long_break/60 + " minutes");
    $('#workIntervalInput').val(sessionTimes.study_session/60);
    $('#shortBreakIntervalInput').val(sessionTimes.short_break/60);
    $('#longBreakIntervalInput').val(sessionTimes.long_break/60);
}


//===========================================================================================================
// CREATE A NEW SUBJECT
//===========================================================================================================

function openAddSubjectDialog(){
    // indicate which colours are already in use
    markUsedColours();

    $('#submitNewSubject').text("Add Subject");
    //Makes the modal window display
    $('#addSubjectModal').css('display','block');
    //Fades in the greyed-out background
    $('#addSubjectModalBG').show();
    //Add frosted glass to all areas visible in the background
    $('#subjectsPage').addClass('frostedGlass');
    $('#iPadStatusBar').addClass('frostedGlass');
    $('#navBar').addClass('frostedGlass')
    // Clear any old onclick handler
    $('#submitNewSubject').off("click");
    // Set the new onclick handler
    $('#submitNewSubject').on("click", createSubject);

    setCloseWhenClickingOutside($('#addSubjectModal'), closeModalWindow);
}


//===========================================================================================================
// ARE YOU SURE MODAL FOR DELETING A SUBJECT
//===========================================================================================================

function displayAreYouSureModal(subjectId){
    // set event handler for closing the modal when user clicks outside modal
    setCloseWhenClickingOutsideForAreYouSureModal();
    $('#confirmDeleteSubjectButton').off('click');
    // set click event for confirmation button
    $('#confirmDeleteSubjectButton').on('click', function() {
        deleteSubjectAndTasks(subjectId);
        closeModalWindow();
    });
    //Makes the modal window display
    $('#areYouSureModal').css('display','block');
    //Fades in the greyed-out background
    $('#areYouSureModalBG').show();
    $('#iPadStatusBar').addClass('frostedGlass');
    $('#subjectsPage').addClass('frostedGlass');
    $('#navBar').addClass('frostedGlass');
}

//===========================================================================================================
// ARE YOU SURE MODAL FOR DELETING A TASK
//===========================================================================================================

function displayAreYouSureDeleteTask(){
    //Makes the modal window display
    $('#deleteTaskModal').css('display','block');
    //Fades in the greyed-out background
}

function hideAreYouSureDeleteTask(){
    //Makes the modal window display
    $('#deleteTaskModal').css('display','none');
    //Fades in the greyed-out background
}

