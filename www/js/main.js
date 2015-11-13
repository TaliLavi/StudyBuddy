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

    // indicate which colours are already in use
    checkIsColourInUse();

    // prepare Done Ruzo animation
    prepareDoneRuzo();

    blurOnEnter($('#titleInput'));
    blurOnEnter($('#titleInput'));
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
        setCloseWhenClickingOutside($('#taskModal'), subjectId, weekDate, taskId, taskDetails);
    } else {
        // enable user to edit assigned date
        $('#cardAssignedDate').attr('disabled', false);
        $('#closeTaskModal').on("click", function(){closeTaskModal(subjectId, weekDate, taskId, taskDetails, function(){submitTaskChanges(subjectId, weekDate, taskId, taskDetails);})});
        // set event handler for closing the modal when user clicks outside modal, and submit the task changes when closing the modal window
        setCloseWhenClickingOutside($('#taskModal'), subjectId, weekDate, taskId, taskDetails, function(){submitTaskChanges(subjectId, weekDate, taskId, taskDetails);});
    }

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


function openAddTaskDialog(data){
    //Automatically fill the assigned date
    $('#assignedDateInput').val(data);
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

    setCloseWhenClickingOutside($('#addTaskModal'));
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
    //Fade out the greyed background
    $('.modal-bg').hide();
    //Fade out the modal window
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
function setCloseWhenClickingOutside(modalWindow, subjectId, weekDate, taskId, taskDetails, callback) {
    var eventType = isMobile()? "touchend" : "mouseup";
    $(document).off(eventType);
    $(document).on(eventType, function (event) {
        // if the target of the click isn't the modal window, nor a descendant of the modal window
        if (!modalWindow.is(event.target) && modalWindow.has(event.target).length === 0) {
            // if the modal window we're closing is the task modal
            if ($('#taskModal').hasClass('displayed')) {
                closeTaskModal(subjectId, weekDate, taskId, taskDetails, callback);
            // if the modal window we're closing is the colour picker widget
            } else if (modalWindow[0].id === "colourPalette") {
                hideColourPalette();
            // if the modal window we're closing is either the Add Task or the Add Subject modals
            } else {
                closeModalWindow();
            }
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
// CREATE A NEW SUBJECT
//===========================================================================================================

function openAddSubjectDialog(){
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

    setCloseWhenClickingOutside($('#addSubjectModal'));
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