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
    // Reset select value to default
    $('#subjectInput option').prop('selected', function() {
        return this.defaultSelected;
    });


    // REFRESH TASKS DISPLAY TO INCLUDE THE ONE THAT WAS JUST CREATED
    fetchActiveTasks(displayTasksInSubjectsPage);
    fetchActiveTasks(displayTasksInCalendar, clearCalendarTasks);
}


// DISPLAY TASKS ON SUBJECTS PAGE
function displayTasksInSubjectsPage(subjectKey, tasksDict) {
    // CLEAR CURRENT DISPLAY OF Tasks
    var subject_div_id = "#" + subjectKey;
    $(subject_div_id).text('');

    if (tasksDict !== null) {
        $.each(tasksDict, function(taskKey, taskData){
            // Append tasks to appropriate subjects on Subjects Page.
            $(subject_div_id).append('<li class ="taskCard ' + subjectKey + '" onclick="displayTask(\'' + subjectKey + '\', \'' + taskKey + '\');"' +
                ' data-subjectId=\'' + subjectKey + '\' data-taskId=\'' + taskKey + '\'>' + taskData.title + '</li>');
        })
    }
}

// DISPLAY TASKS ON BOTTOM PANEL
function displayTasksInBottomPanel(subjectKey, tasksDict) {
    if (tasksDict !== null) {
        // append tasks to the taskList div
        $.each(tasksDict, function(taskKey, taskData){
            // only append tasks that don't have an assigned_date
            if (taskData.assigned_date == "") {
                //Creates a task card div
                var taskCard = '<li class ="taskCard ' + subjectKey + '" onclick="displayTask(\'' + subjectKey + '\', \'' + taskKey + '\');"' +
                    ' data-subjectId=\'' + subjectKey + '\' data-taskId=\'' + taskKey + '\'>' + taskData.title + '</li>';

                //Appends it to the list
                $('#tasksList').append(taskCard);
            }
        })
    }
    // show tasks div
    $('#tasksDiv').show();
}

function clearCalendarTasks() {
    $('.dayList').text('');
}


function displayTasksInCalendar(subjectKey, tasksDict) {
    if (tasksDict !== null) {
        // append tasks to the calendar
        $.each(tasksDict, function(taskKey, taskData){
            // checks whether there is an assigned date, and if so, whether it is currently displayed in the DOM
            if (whetherDateIsDisplayed(taskData.assigned_date)) {
                //Creates a task card div
                var taskCard = '<li class ="taskCard ' + subjectKey + '" onclick="displayTask(\'' + subjectKey + '\', \'' + taskKey + '\');"' +
                    ' data-subjectId=\'' + subjectKey + '\' data-taskId=\'' + taskKey + '\'>' + taskData.title + '</li>';

                //Appends it to the date
                $('#'+ taskData.assigned_date).append(taskCard);
            }
        })
    }
}

// checks whether date is displayed in DOM
function whetherDateIsDisplayed(date) {
    return date !== null && "2016-02-01" <= date && date <= "2016-02-07" ;
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

