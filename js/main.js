
//Make these things happen each time the page finishes loading
function preparePage() {
    createCalendar();
    // set nav buttons
    $("#profileButton").click(function(){
        displayPage("#profilePage", "#profileButton")
    });
    $("#calendarButton").click(function(){
        displayPage("#calendarPage", "#calendarButton")
    });
    $("#subjectsButton").click(function(){
        displayPage("#subjectsPage", "#subjectsButton")
    });
    // start the app on the calendar page
    displayPage("#calendarPage", "#calendarButton")
    // toggle the bottom Subjects Panel
    $("#flip").click(function(){
        $("#subjectsPanel").slideToggle("slow");
    });
    // hide tasksDiv in the bottom panel
    $('#tasksDiv').hide();

    // RETRIEVE AND DISPLAY ALL SUBJECTS INFORMATION INSTANTLY WHEN PAGE FINISHES LOADING
    fetchActiveSubjects(getActiveUser(), displayActiveSubjects);
    // fetch and append all active tasks
    fetchActiveTasks(displayTasksInSubjectsPage);

    //set up drag and drop for each list
    $(".sortable-task-list").each(function(i, list){
        Sortable.create(list, {
            group: "tasks",
            animation: 400,
            ghostClass: "sortable-ghost",
            onAdd: moveTask
        });
    });
}


function moveTask(evt) {
    var newAssignedDate = evt.item.parentElement.id;
    var subjectId = evt.item.dataset.subjectid;
    var taskId = evt.item.dataset.taskid;

    if (newAssignedDate === "tasksList") {
        updateAssignedDate(subjectId, taskId, "");
    } else {
        updateAssignedDate(subjectId, taskId, newAssignedDate);
    }
}



//===========================================================================================================
    //NAVIGATION PANEL
//===========================================================================================================


// show and hide different pages
var pageIds = ["#calendarPage", "#subjectsPage", "#profilePage"]
var buttonIds = ["#calendarButton", "#subjectsButton", "#profileButton"]
function displayPage(pageId, buttonId) {
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



//===========================================================================================================
//CREATE CALENDAR
//===========================================================================================================

function createCalendar() {
    for (var i = 0; i < 7; i++) {
        var currentDate = Date.parse('last monday').addDays(i);
        var currentDateFormatted = currentDate.toString('yyyy-MM-dd');
        var currentDay = currentDate.toString('dddd');
        // Append day
        $('#dayColumns').append('<div class="col dayColumn"><h4>' + currentDay + '</h4><div>' + currentDateFormatted +
            '</div><button class="addTaskFromDate" onclick="openAddTaskDialog(\'' +
            currentDateFormatted + '\', this);">Add Task</button><ul class="sortable-task-list dayList" id="' + currentDateFormatted + '"></ul></div>');
    }

    // Display current week's dates
    var firstDateOfCurrentWeek = $('#dayColumns div:first-child ul').attr('id')
    var lastDateOfCurrentWeek = $('#dayColumns div:last-child ul').attr('id')
    $('#currentWeekDates').append(firstDateOfCurrentWeek + ' - ' + lastDateOfCurrentWeek);

    fetchActiveTasks(displayTasksInCalendar);
}





//===========================================================================================================
//OPEN A TASK CARD
//===========================================================================================================

function displayTask(subjectId, taskId) {
    fetchCertainTasks(subjectId, taskId, fillInTaskDetails);
    //Makes the modal window display
    $('#taskModal').css('display','block');
    //Fades in the greyed-out background
    $('#taskModalBG').fadeIn();
}

// I chose to pass taskId because once we'd implement task editing, we'll need it.
function fillInTaskDetails(subjectId, taskId, taskDetails) {
    $('#taskSubject').val(subjectId);
    $('#taskTitle').val(taskDetails.title);
    $('#taskDescription').val(taskDetails.description);
    $('#taskTimeEstimation').val(taskDetails.time_estimation);
    $('#taskAssignedDate').val(taskDetails.assigned_date);
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





