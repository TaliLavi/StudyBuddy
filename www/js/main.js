var timeAppWasLoaded;
var timeCardsAppearOnCalendar;

var timeCardWasClicked;
var timeColoursGotDisplayedInTaskModal;

function preparePage() {
     //Instantiate FastClick on the body, for eliminating the 300ms delay between a physical tap and the firing of a click event on mobile browsers
    $(function() {
        FastClick.attach(document.body);
    });

    // FOR TESTING, DELETE WHEN DONE TESTING
    $('body').on("touchstart", function(){
        console.log('touchstart detected');
        }
    );

    // FOR TESTING, DELETE WHEN DONE TESTING
    $('body').on("touchend", function(){
            console.log('touchend detected');
        }
    );

    $('#navBar').show();

    timeAppWasLoaded = $.now();
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
    prepareSwitchToWorkTL();

    blurOnEnter($('#titleInput'));
    blurOnEnter($('#titleInput'));

    //// FOR TESTING, DELETE WHEN DONE TESTING
    //$('#settingsMenu').on("click", function(){
    //        console.log('touchend detected');
    //    }
    //);
}


//===========================================================================================================
//NAVIGATION PANEL
//===========================================================================================================

// show and hide different pages
var pageIds = ["#calendarPage", "#subjectsPage", "#profilePage"];
var buttonIds = ["#calendarButton", "#subjectsButton", "#progressButton"];


function prepareNavigation() {
    $("#progressButton").click(function(){
        switchToPage("#profilePage", "#progressButton");
        $('#subjectsHighlight').hide();
        $('#weekHighlight').hide();
        $('#progressHighlight').show();
        var renewCache = true;
        fetchAndDisplayBarGraphSinceDawnOfTime(renewCache);
        // draw the heat-map inside the progress page (in #cal-heatmap)
        drawHeatmap();
        fetchHeatmapData(currentStreak);
    });
    $("#calendarButton").click(function(){
        switchToPage("#calendarPage", "#calendarButton");
        $('#subjectsHighlight').hide();
        $('#progressHighlight').hide();
        $('#weekHighlight').show();
    });
    $("#subjectsButton").click(function(){
        switchToPage("#subjectsPage", "#subjectsButton");
        $('#progressHighlight').hide();
        $('#subjectsHighlight').show();
        $('#weekHighlight').hide();
    });
    // hide signup & login pages, reveal app pages and start the app on the calendar page
    $('#signUpPage').hide();
    $('#logInPage').hide();
    $('#appPages').show();
    switchToPage("#calendarPage", "#calendarButton");
}

function goToLogin() {
    prepareLoginRuzo();
    // when clicking enter while on password field, if email field isn't empty, attempt to login
    executeOnEnter($('#logInPasswordInput'), prepareLogIn);
    // when clicking enter while on password field, if email field isn't empty, attempt to signup
    executeOnEnter($('#confirmPasswordInput'), prepareSignUp);

    var suppressError = true;
    if (getLoggedInUser(suppressError)) {
        preparePage();
    } else {
        displayLogin();
    }
}

function displayLogin() {
    $('#appPages').hide();
    $('#signUpPage').hide();
    $('#logInPage').show();
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


function switchToPage(pageId, buttonId) {

    // hide all pages
    pageIds.forEach(function(id){
        $(id).hide();
    })
    // enable all nav buttons
    buttonIds.forEach(function(id){
        $(id).prop("disabled", false);
    })
    // only show current page
    $(pageId).show();
    // only disable current nav button
    $(buttonId).prop("disabled", true);
}


//Make these things happen each time the page finishes loading
function isMobile() {
    return screen.width < 1000;
}

function applySortable(selector) {
    var sortableOptions = {
        group: "tasks",
        //animation: 1000,
        ghostClass: "sortable-ghost",
        onStart: inTheAir,
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
    console.log('Sortable: Delay is over, card is effectively picked up and should be movable now');
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

function inTheAir(evt) {
    //add stuff if needed.
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
        //console.log("The tile has more than 30 characters");
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
    $('#deleteTask').on("click", function(){closeTaskModal(subjectId, weekDate, taskId, taskDetails, moveActiveTaskToDeleted);});
    $('#completeTask').off("click");
    $('#completeTask').on("click", function(){closeTaskModal(subjectId, weekDate, taskId, taskDetails, markAsDone);});
    $('#playPauseButton').off("click");
    $('#playPauseButton').on("click", function(){playPauseTimer(subjectId, weekDate, taskId);});
    $('#stopButton').off("click");
    $('#stopButton').on("click", function(){stopTimer(subjectId, weekDate, taskId);});
    $('#closeTaskModal').off("click");
    $('#closeTaskModalDone').off("click");

    //console.log("This is the last thing that happens in fillInTaskDetails before the showTaskModal function is called.");
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
        timeColoursGotDisplayedInTaskModal = $.now();
        console.log('It took ' + (timeColoursGotDisplayedInTaskModal-timeCardWasClicked) + ' millisecond from clicking the on card for the colours to appear.');
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

function displayTimeStudiedForTask(totalSecondsStudied, isDone) {
    $('#totalTimeStudiedActiveTask').val('');
    var hours = Math.floor(totalSecondsStudied/3600);
    var minutes = Math.ceil((totalSecondsStudied - hours*3600)/60);
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

    if (isDone) {
        if (totalSecondsStudied === null) {
            $('#totalTimeStudiedDoneTask').text("Well done on completing this task!");
        } else {
            $('#totalTimeStudiedDoneTask').text("You spent " + hoursString + (and? "and " : "") + minutesString + "on this task. Good work!");
        }
    } else {
        if (totalSecondsStudied !== null) {
            $('#totalTimeStudiedActiveTask').val(hoursString + (and? "and " : "") + minutesString);
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
    updateTimeIntervals(workSession, shortBreak, longBreak);
}

function displayTimeIntervals(sessionTimes) {
    $('#studySessionLengthDisplay').html(sessionTimes.study_session + " minutes");
    $('#shortBreakLengthDisplay').html(sessionTimes.short_break + " minutes");
    $('#longBreakLengthDisplay').html(sessionTimes.long_break + " minutes");
    $('#workIntervalInput').val(sessionTimes.study_session);
    $('#shortBreakIntervalInput').val(sessionTimes.short_break);
    $('#longBreakIntervalInput').val(sessionTimes.long_break);
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

//Helper functions:
// GET THE DATE FOR MONDAY OF DATE'S WEEK
function startOfWeek(dateString, offsetDays) {
    if (isNaN(Date.parse(dateString))) {
        return 'no_assigned_date';
    }

    var date = new Date(dateString);

    if (offsetDays !== undefined) {
        date.setDate(date.getDate() + offsetDays);
    }

    // go to this/previous monday (getDay() of monday is 1)
    var daysSinceMonday = (date.getDay()+7-1)%7;
    date.setDate(date.getDate() - daysSinceMonday);

    return formatDate(date);
}

// Poor-man's (library-less) date formatter. Default is YYYY-MM-DD
function formatDate(dateString, formatString) {
    var date = new Date(dateString);
    var dd = date.getDate();
    if (dd < 10) {dd = "0" + dd};
    var mm = date.getMonth() + 1; //Months are zero based
    if (mm < 10) {mm = "0" + mm};
    var yyyy = date.getFullYear();

    var shortMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    var shortDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    if (formatString === "yyyy-mm-dd" || formatString === undefined) {
        return yyyy + "-" + mm + "-" + dd;
    }
    if (formatString === "ddd") {
        return shortDays[date.getDay()];
    }
    if (formatString === "d MMM") {
        return date.getDate() + " " + shortMonths[date.getMonth()];
    }

    console.error("Unknown formatString passed to formatDate:", formatString);
}

function formatTime(seconds) {
    var ss = seconds%60;
    if (ss < 10) {ss = "0" + ss};
    var mm = Math.floor(seconds/60);
    if (mm < 10) {mm = "0" + mm};

    return mm + ":" + ss;
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

