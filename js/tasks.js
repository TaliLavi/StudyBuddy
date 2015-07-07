// CREATE NEW TASK
function createTask(subjectId) {

    // REGISTER DOM ELEMENTS
    var titleField = $('#taskTitle');
    var descriptionField = $('#taskDescription');

    // GET FIELD VALUES
    var title = titleField.val();
    var description = descriptionField.val();

    // SET DEFAULT VALUES (FOR SIMPLISITY AT THIS STAGE OF DEVELOPMENT)
    var assigned_date = "16/06/24";
    var time_estimation = 30;
    var creation_date = $.now();
    var status_change_date = creation_date;

    // PUSH THEM TO DB
    pushNewTask(subjectId, title, description, assigned_date, time_estimation, creation_date, status_change_date);

    // CLEAR INPUT FIELDS
    titleField.val('');
    descriptionField.val('');

    //// REFRESH SUBJECTS DISPLAY TO INCLUDE THE ONE THAT WAS JUST CREATED
    //fetchActiveTasks();
}

// DISPLAY TASKS ON SUBJECTS PAGE
function displayTasksSubjectsPage(subjectKey, tasksDict) {
    // CLEAR CURRENT DISPLAY OF Tasks
    var subject_div_id = "#" + subjectKey;
    $(subject_div_id).text('');

    if (tasksDict !== null) {
        $.each(tasksDict, function(taskKey, taskData){
            // Append tasks to appropriate subjects on Subjects Page.
            $(subject_div_id).append('<li class="taskCard">' + taskData.title + '</li>');


        })
    }
}

// DISPLAY TASKS ON BOTTOM PANEL
function displayTasksBottomPanel(subjectKey, tasksDict) {
    if (tasksDict !== null) {
        // append tasks to the taskList div
        $.each(tasksDict, function(taskKey, taskData){
            // Append tasks to bottom panel.
            //$('#tasksList').append(
            //    //todo: maybe I should make use of the existing "taskCard" class instead of the new "task" class I've create?
            //    '<div class="task">' + taskData.title + '</div>');

            //Creates a task card div
            var taskCard = $("<li></li>").addClass("taskCard").addClass(subjectKey).html(taskData.title);
            //Appends it to the list
            $('#tasksList').append(taskCard);
        })
    }
    // show tasks div
    $('#tasksDiv').show();
}


function prepareTasksDiv(subjectName, subjectKey) {
    // hide subjects div to allow room for tasks
    $('#subjectsList').hide();
    // append a back button
    $('#panelControls').append('<button id="back" onclick="backToSubjects()">Back to view all subjects</button><br><br>');
    // append subjectKey to indicate whith subject these tasks belond to
    $('#panelControls').append('<div>Here are you tasks for <strong>' + subjectName + '</strong></div><br>');
    fetchActiveTasks(subjectKey, displayTasksBottomPanel);
}


function backToSubjects() {
    $('#tasksDiv').hide();
    $('#panelControls').text('');
    $('#tasksList').text('');
    $('#subjectsList').show();
}