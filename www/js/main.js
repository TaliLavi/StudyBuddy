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

    // prepare hour glass timer animation
    //prepareHourGlass();
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
    });
    $("#subjectsButton").click(function(){
        switchToPage("#subjectsPage", "#subjectsButton");
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
function applySortable(selector) {
    if (screen.width < 1000) {
        //set up drag and drop for each list, with delay to imitate long-press
        $(selector).each(function (i, list) {
            Sortable.create(list, {
                group: "tasks",
                animation: 800,
                ghostClass: "sortable-ghost",
                onStart: inTheAir,
                onAdd: moveTask,
                forceFallback: true,
                fallbackClass: "dragged-item",
                delay: 200
            });
        });
    } else {
        //set up drag and drop for each list
        $(selector).each(function (i, list) {
            Sortable.create(list, {
                group: "tasks",
                animation: 400,
                ghostClass: "sortable-ghost",
                onStart: inTheAir,
                onAdd: moveTask,
                forceFallback: true,
                fallbackClass: "dragged-item"
            });
        });
    }
}

// when task is moved...
function moveTask(evt) {
    var oldAssignedDate = evt.from.id;
    var newAssignedDate = evt.item.parentElement.id;
    var subjectId = evt.item.dataset.subjectid;
    var taskId = evt.item.dataset.taskid;
    var oldTaskDetails = {assigned_date: oldAssignedDate};
    if (newAssignedDate === "unassignedTasksList") {
        var updatedTaskDetails = {assigned_date: ""};
    } else {
        var updatedTaskDetails = {assigned_date: newAssignedDate};
    }
    saveUpdatedTask(subjectId, oldTaskDetails, taskId, updatedTaskDetails);
}

function inTheAir(evt) {
    //  // horibble flash effect
    //$(evt.item).fadeIn(100).fadeOut(100).fadeIn(100);

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
        var suffix = currentDate.getOrdinal();
        var suffixPlaceHolder = currentDate.toString('dxxx MMM');
        var currentDateTitle = suffixPlaceHolder.replace("xxx", suffix);

        var currentDay = currentDate.toString('dddd');
        // Append day
        daysHtml += '<div class="col dayColumn">' +
            '<p class="dayHeadingOnCalendar">' + currentDay + '</p>' +
            '<div class="dateOnCalendarDay">' + currentDateTitle +'</div>' +
            '<button class="addTaskFromDate" onclick="openAddTaskDialog(\'' +
            currentDateFormatted + '\', this);">Add Task</button>' +
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

function displayTask(subjectId, assigned_date, taskId) {
    fetchSingleTask(subjectId, assigned_date, taskId, fillInTaskDetails);
    $('#taskModal').css('display','block');                     //Makes the modal window display
    $('#taskModalBG').fadeIn();                                 //Fades in the greyed-out background
}

function fillInTaskDetails(subjectId, assigned_date, taskId, taskDetails) {
    $('#taskSubject').val(subjectId);
    $('#taskTitle').val(taskDetails.title);
    $('#taskDescription').val(taskDetails.description);
    $('#taskTimeEstimation').val(taskDetails.time_estimation);
    $('#taskAssignedDate').val(taskDetails.assigned_date);
    var weekDate = startOfWeek(taskDetails.assigned_date)
    // Clear any old onclick handler
    $('#deleteTask').off("click");
    $('#updateTask').off("click");
    $('#deleteTask').on("click", function(){
        deleteTask(subjectId, weekDate, taskId);
    });
    $('#updateTask').on("click", function(){
        updateTask(taskId, taskDetails);
    });
    $('#completeTask').on("click", function(){
        completeTask(subjectId, weekDate, taskId);
    });
}


//===========================================================================================================
//CREATE A TASK CARD
//===========================================================================================================
var dayList;


function openAddTaskDialog(data, dateOrSubject){

    if ($(dateOrSubject).hasClass('addTaskFromDate')) {
        //Automatically fill the assigned date
        $('#assignedDateInput').val(data);
    } else if ($(dateOrSubject).hasClass('addTaskFromSubject')) {
        //Automatically select the subject
        $('#subjectInput').val(data);
    }

    //Makes the modal window display
    $('#addTaskModal').css('display','block');
    //Fades in the greyed-out background
    $('#addTaskModalBG').fadeIn();
    // Clear any old onclick handler
    $('#submitNewTask').off("click");
    // Set the new onclick handler
    $('#submitNewTask').on("click", function(){createTask()});
}


//===========================================================================================================
//CANCELLING ANY MODAL WINDOW WITHOUT ADDING ANYTHING
//===========================================================================================================

function closeModalWindow() {
    //Fade out the greyed background
    $('.modal-bg').fadeOut();
    //Fade out the modal window
    $('.modal').fadeOut();
    // Clear input fields
    $('.inputField').val('');
    // Reset select value to default
    $('#subjectInput option').prop('selected', function() {
        // Reset select value to default
        return this.defaultSelected;
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
    // Clear any old onclick handler
    $('#submitNewSubject').off("click");
    // Set the new onclick handler
    $('#submitNewSubject').on("click", function(){createSubject()});

}