// CREATE NEW TASK
function createTask() {

    // REGISTER DOM ELEMENTS
    var subjectInput = $('#subjectInput');
    var titleInput = $('#titleInput');
    var descriptionInput = $('#descriptionInput');
    var timeEstimationInput = $('#timeEstimationInput');
    var assignedDateInput = $('#assignedDateInput');

    // GET FIELD VALUES
    var subjectId = subjectInput.val();
    var title = titleInput.val();
    var description = descriptionInput.val();
    var time_estimation = timeEstimationInput.val();
    var assigned_date = assignedDateInput.val();


    // SET DEFAULT VALUES
    var creation_date = $.now();
    var status_change_date = creation_date;

    // PUSH THEM TO DB
    pushNewTask(subjectId, title, description, assigned_date, time_estimation, creation_date, status_change_date);

    // CLOSE THE ADD TASK DIALOG
    //Fade out the greyed background
    $('.modal-bg').fadeOut();
    //Fade out the modal window
    $('#addTaskModal').fadeOut();

    // CLEAR INPUT FIELDS ON THE ADD TASK DIALOG
    titleInput.val('');
    descriptionInput.val('');
    timeEstimationInput.val('');
    $('#subjectInput option').prop('selected', function() {
        return this.defaultSelected;                            // Reset select value to default
    });

    // REFRESH TASKS DISPLAY TO INCLUDE THE ONE THAT WAS JUST CREATED
    fetchActiveTasks(displayTasksInSubjectsPage);
    fetchActiveTasks(displayTasksInCalendar, clearCalendarTasks);
}//end of function createTask


//Create html for task element, append it to the list and apply hammer on it
function createTask(listSelector, subjectKey, subjectDict, taskKey, taskData) {
    var cardHtml = '<li class ="taskCard ' + subjectKey + ' ' + subjectDict.colour + '" ' +
        //'onclick="displayTask(\'' + subjectKey + '\', \'' + taskKey + '\');" ' +
        'data-subjectId="' + subjectKey + '" data-taskId="' + taskKey + '">' +
        taskData.title + '</li>';

    if ($.browser.mobile) {
        // if viewed from mobile, append card to list, apply hammer.js, and listen to touch events
        var taskCard = $(cardHtml).appendTo(listSelector).hammer();
        taskCard.on('tap', function (ev) {
            console.log(ev.type + ' gesture on "' + taskData.title + '" detected.');
            displayTask(subjectKey, taskKey);
        });
        taskCard.on('press', function (ev) {
            console.log(ev.type + ' gesture on "' + taskData.title + '" detected.');
        });
    } else {
        // if viewed from desktop, append card to list and listen to click events
        var taskCard = $(cardHtml).appendTo(listSelector);
        taskCard.on("click", function () {
            displayTask(subjectKey, taskKey);
        });
    }
}



// DISPLAY TASKS ON SUBJECTS PAGE
function displayTasksInSubjectsPage(subjectKey, subjectDict, tasksDict) {
    // CLEAR CURRENT DISPLAY OF Tasks
    var subject_div_id = "#" + subjectKey;
    $(subject_div_id).text('');

    if (tasksDict !== null) {
        $.each(tasksDict, function(taskKey, taskData){
            //Appends the task card html to appropriate subjects on Subjects Page.
            createTask(subject_div_id, subjectKey, subjectDict, taskKey, taskData);

        })
    }
}

// DISPLAY TASKS ON BOTTOM PANEL
function displayTasksInBottomPanel(subjectKey, subjectDict, tasksDict) {
    if (tasksDict !== null) {
        // append tasks to the taskList div
        $.each(tasksDict, function(taskKey, taskData){
            // only append tasks that don't have an assigned_date
            if (taskData.assigned_date == "") {
                //Appends the task card html to the date's list
                createTask('#tasksList', subjectKey, subjectDict, taskKey, taskData);
            }
        })
    }
    // show tasks div
    $('#tasksDiv').show();
}

function clearCalendarTasks() {
    $('.dayList').text('');
}


function displayTasksInCalendar(subjectKey, subjectDict, tasksDict) {
    if (tasksDict !== null) {
        var thisWeeksMonday = Date.parse('last monday');
        var nextWeeksMonday = Date.parse('next monday');
        // append tasks to the calendar
        $.each(tasksDict, function(taskKey, taskData){
            // checks whether there is an assigned date, and if so, whether it is currently displayed in the DOM
            if (whetherDateIsDisplayed(taskData.assigned_date, thisWeeksMonday, nextWeeksMonday)) {
                createTask('#'+ taskData.assigned_date, subjectKey, subjectDict, taskKey, taskData);
            }
        })
    }
}

// checks whether date is displayed in DOM
function whetherDateIsDisplayed(date_string, thisWeeksMonday, nextWeeksMonday) {
    var date = Date.parse(date_string);
    return date !== null && thisWeeksMonday <= date && date < nextWeeksMonday;
}

function prepareTasksDiv(subjectName, subjectKey) {
    // hide subjects div to allow room for tasks
    $('#subjectsList').hide();
    // append a back button
    $('#panelControls').append('<button id="back" onclick="backToSubjects()">Back to view all subjects</button><br><br>');
    // append subjectKey to indicate whith subject these tasks belond to
    $('#panelControls').append('<div>Here are your unscheduled tasks for <strong>' + subjectName + '</strong></div><br>');
    fetchActiveTasksBySubject(subjectKey, displayTasksInBottomPanel);
}


function backToSubjects() {
    $('#tasksDiv').hide();
    $('#panelControls').text('');
    $('#tasksList').text('');
    $('#subjectsList').show();
}

