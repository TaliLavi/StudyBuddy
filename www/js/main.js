function preparePage() {
    prepareCalendar();
    prepareCalendarSlider();
    // set nav buttons
    prepareNavigation();

    // toggle the bottom Subjects Panel
    $("#flip").click(function(){
        $("#footer").slideToggle("slow");
    });
    // hide tasksDiv in the bottom panel
    $('#tasksDiv').hide();

    // show the default message in the subjects page
    $('#defaultSubjectAreaMessage').show();

    // RETRIEVE AND DISPLAY ALL SUBJECTS INFORMATION INSTANTLY WHEN PAGE FINISHES LOADING
    fetchActiveSubjects(displayActiveSubjects);

    // fetch and append all unassigned active tasks to footer
    fetchAllUnassignedActiveTasks(displayTasksInBottomPanel)

    // pre-cache session times for pomodoro timer
    fetchTimeIntervals(function(){});

    // indicate which colours are already in use
    checkIsColourInUse();
}


//===========================================================================================================
//NAVIGATION PANEL
//===========================================================================================================

// show and hide different pages
var pageIds = ["#calendarPage", "#subjectsPage", "#profilePage"];
var buttonIds = ["#calendarButton", "#subjectsButton", "#profileButton"];


function prepareNavigation() {
    $("#profileButton").click(function(){
        switchToPage("#profilePage", "#profileButton");
    });
    $("#calendarButton").click(function(){
        switchToPage("#calendarPage", "#calendarButton");
        $('#subjectsHighlight').hide();
        $('#weekHighlight').show();
    });
    $("#subjectsButton").click(function(){
        switchToPage("#subjectsPage", "#subjectsButton");
        $('#subjectsHighlight').show();
        $('#weekHighlight').hide();
    });
    // hide signup & login pages, reveal app pages and start the app on the calendar page
    $('#signUpPage').hide();
    $('#logInPage').hide();
    $('#appPages').show();
    switchToPage("#calendarPage", "#calendarButton");
}


function hideAppContent() {
    $('#appPages').hide();
    $('#signUpPage').hide();
}

function showSignUp() {
    $('#logInPage').hide();
    $('#signUpPage').show();
}

function showLogIn() {
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
        onPickup: pickupCard,
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

function pickupCard(evt) {
    navigator.vibrate(100);
    //console.log("Picked up", evt, evt.oldIndex);
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

    updateTask(subjectId, taskId, oldWeekDate, updatedTaskDetail, updateTaskFields);
}

function inTheAir(evt) {
    //add stuff if needed.
}


//===========================================================================================================
//CREATE CALENDAR
//===========================================================================================================

function createHtmlForWeekOf(mondayOfCurrentWeek) {
    // Append current week's days to #dayColumns
    var daysHtml = "";
    for (var i = 0; i < 7; i++) {
        var currentDate = Date.parse(mondayOfCurrentWeek).addDays(i);
        var currentDateFormatted = currentDate.toString('yyyy-MM-dd');
        // date.js doesn't add the suffix for a days (e.g. 16th, 1st), so I made use of the getOrdinal() methos.
        //var suffix = currentDate.getOrdinal();
        var spacePlaceHolder = currentDate.toString('dxxx MMM');
        var currentDateTitle = spacePlaceHolder.replace("xxx", " ");

        var currentDay = currentDate.toString('ddd');
        // Append day
        daysHtml += '<div class="col dayColumn">' +
            '<div class="dayDateDiv"><span class="dayHeadingOnCalendar">' + currentDay + '</span>' +
            '<span class="dateOnCalendarDay">' + currentDateTitle +'</span></div>' +
            '<button class="addTaskFromCalendar" onclick="openAddTaskDialog(\'' +
            currentDateFormatted + '\');">Add a task...</button>' +
            '<ul class="sortable-task-list dayList" id="' + currentDateFormatted + '"></ul>' +
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
    var mondayOfPrevWeek = startOfWeek(Date.today().toString('yyyy-MM-dd'), -7);
    var mondayOfCurrentWeek = startOfWeek(Date.today().toString('yyyy-MM-dd'));
    var mondayOfNextWeek = startOfWeek(Date.today().toString('yyyy-MM-dd'), 7);

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

function fillInActiveTaskDetails(subjectId, taskId, taskDetails) {
    $('#taskSubject').val(subjectId);
    $('#cardTitle').val(taskDetails.title);
    $('#cardDescription').val(taskDetails.description);
    $('#cardAssignedDate').val(taskDetails.assigned_date);
    var weekDate = startOfWeek(taskDetails.assigned_date);

    $('#cardAssignedDate').data('date', taskDetails.assigned_date);

    // get title and description textareas be the right size to fit their contents.
    autoGrow(document.getElementById("cardDescription"));
    autoGrow(document.getElementById("cardTitle"));

    $('#taskModal').addClass('displayed');

    // Clear old onclick handlers and set new ones
    $('#deleteTask').off("click");
    $('#deleteTask').on("click", function(){closeTaskModal(subjectId, weekDate, taskId, moveTaskToDeleted);});
    $('#completeTask').off("click");
    $('#completeTask').on("click", function(){closeTaskModal(subjectId, weekDate, taskId, markAsDone);});
    $('#playPauseButton').off("click");
    $('#playPauseButton').on("click", function(){playPauseTimer(subjectId, weekDate, taskId);});
    $('#stopButton').off("click");
    $('#stopButton').on("click", function(){stopTimer(subjectId, weekDate, taskId);});
    $('#closeTaskModal').off("click");
    $('#closeTaskModal').on("click", function(){closeTaskModal(subjectId, weekDate, taskId, function(){submitTaskChanges(subjectId, weekDate, taskId);})});

    showTaskModal(subjectId);

    // set event handler for closing the modal when user clicks outside modal, and submit the task changes when closing the modal window
    setCloseWhenClickingOutside($('#taskModal'), subjectId, weekDate, taskId, function(){submitTaskChanges(subjectId, weekDate, taskId);});
}

function showTaskModal(subjectId) {
    // change heading's background to main colour, and left side's background to secondary colour
    fetchAnActiveSubject(subjectId, function(subjectDict) {
        $('#taskCardHeadingDiv, #leftDivTaskCard').addClass(subjectDict.colour_scheme);
    });

    //Makes the modal window display
    $('#taskModal').css('display','block');
    //Fades in the greyed-out background
    $('#taskModalBG').fadeIn();
    $('#calendarPage').addClass('frostedGlass');
    $('#iPadStatusBar').addClass('frostedGlass');
    $('#navBar').addClass('frostedGlass');
}

function autoGrow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
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
    $('#addTaskModalBG').fadeIn();
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
    // remove all classes from #taskCardHeadingDiv & #leftDivTaskCard and then restore the the ones needed for future colour change
    $('#taskCardHeadingDiv, #leftDivTaskCard').removeClass();
    $('#taskCardHeadingDiv').addClass('mainColour');
    $('#leftDivTaskCard').addClass('secondaryColour');

    $('#calendarPage').removeClass('frostedGlass');
    $('#iPadStatusBar').removeClass('frostedGlass');
    $('#navBar').removeClass('frostedGlass');
    $('#subjectsPage').removeClass('frostedGlass');
    //Fade out the greyed background
    $('.modal-bg').fadeOut();
    //Fade out the modal window
    $('.modal').fadeOut();

    // Clear input fields
    $('.inputField').val('');
    // Clear colour message
    $('.colourMessage').text('');
    // remove selection of colour from colour picker in the Add a Subject modal.
    $('.colourOption').removeClass('chosenColour');
    // Reset select value to default
    $('#subjectInput option').prop('selected', function() {
        // Reset select value to default
        return this.defaultSelected;
    });
}


// FOR CLOSING THE TASK DETAILS MODAL
function closeTaskModal(subjectId, weekDate, taskId, callback) {
    closeModalWindow();

    // if timer is currently not stopped (meaning it's either playing or paused), stop the timer.
    if (!$('#stopButton').hasClass('stopped')) {
        stopTimer(subjectId, weekDate, taskId, callback);
        // else, if a callback func (such as moveTaskToDeleted) was passed, execute it
    } else {
        if (callback !== undefined) {
            callback(subjectId, weekDate, taskId);
        }
    }
}

// set event handler for closing the modal when user clicks outside modal.
function setCloseWhenClickingOutside(modalWindow, subjectId, weekDate, taskId, callback) {
    var eventType = isMobile()? "touchend" : "mouseup";
    $(document).off(eventType);
    $(document).on(eventType, function (event) {
        // if the target of the click isn't the modal window, nor a descendant of the modal window
        if (!modalWindow.is(event.target) && modalWindow.has(event.target).length === 0) {
            // if the modal window we're closing is the task modal
            if ($('#taskModal').hasClass('displayed')) {
                closeTaskModal(subjectId, weekDate, taskId, callback);
                $('#taskModal').removeClass('displayed')
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


//===========================================================================================================
// CREATE A NEW SUBJECT
//===========================================================================================================

function openAddSubjectDialog(){
    //Makes the modal window display
    $('#addSubjectModal').css('display','block');
    //Fades in the greyed-out background
    $('#addSubjectModalBG').fadeIn();
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
//
