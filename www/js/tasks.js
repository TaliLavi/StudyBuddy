// GET THE DATE FOR MONDAY OF DATE'S WEEK
// TODO: verify that date is written in an acceptable form (I know '06-Sep-2015' and '09-06-2015' are good).
function startOfWeek(dateString, offsetDays) {
    var date = Date.parse(dateString);
    if (date === null) {
        return 'no_assigned_date';
    }
    if (offsetDays !== undefined) {
        date.addDays(offsetDays);
    }
    if (date.is().monday()) {
        // if the assigned date happens to be a Monday, grab it
        return date.toString('yyyy-MM-dd');
    }
    // else, grab the date for that week's Monday
    return date.prev().monday().toString('yyyy-MM-dd');
}


// CREATE NEW TASK
function createTask() {
    var subjectId = $('#subjectInput').val();
    var now = $.now();
    var newTask = {
        title: $('#titleInput').val(),
        description: $('#descriptionInput').val(),
        assigned_date: $('#assignedDateInput').val(),
        time_estimation: $('#timeEstimationInput').val(),
        creation_date: now,
        status_change_date: now
    }
    var mondayOfRelevantWeek = startOfWeek(newTask.assigned_date);
    // PUSH THEM TO DB
    saveNewTask(subjectId, mondayOfRelevantWeek, newTask, postCreateTask);
}

// UPDATE TASK DETAILS
function updateTask(taskId, oldTaskDict) {
    var subjectId = $('#taskSubject').val();
    var updatedTask = {
        title: $('#taskTitle').val(),
        description: $('#taskDescription').val(),
        assigned_date: $('#taskAssignedDate').val(),
        time_estimation: $('#taskTimeEstimation').val()
    }
    saveUpdatedTask(subjectId, oldTaskDict, taskId, updatedTask, updateTaskInDOM);
}

// if the title or assigned date of the task got updated, change the DOM accordingly
function updateTaskInDOM(subjectId, subjectData, oldTaskDict, taskKey, newTaskDict){
    if (oldTaskDict.assigned_date !== newTaskDict.assigned_date || oldTaskDict.title !== newTaskDict.title) {
        removeTaskFromDOM(taskKey);
        appendTask(subjectId, subjectData, taskKey, newTaskDict);
    }
}


//Create html for task element, append it to the list and apply hammer on it
function createTaskElement(listSelector, subjectKey, subjectDict, taskKey, taskData) {
    var cardHtml = '<li data-subjectId="' + subjectKey + '" data-taskId="' + taskKey + '">' +
        '<div class ="taskCard ' + subjectKey + ' ' + subjectDict.colour + '">' + taskData.title +
        '</div></li>';

    var startOfRelevantWeek = startOfWeek(taskData.assigned_date);
    if (screen.width < 1000) {
        // if viewed from mobile, append card to list, apply hammer.js, and listen to touch events
        var taskCard = $(cardHtml).appendTo(listSelector).hammer();
        taskCard.on('tap', function (ev) {
            console.log(ev.type + ' gesture on "' + taskData.title + '" detected.');
            displayTask(subjectKey, startOfRelevantWeek, taskKey);
        });
        taskCard.on('press', function (ev) {
            console.log(ev.type + ' gesture on "' + taskData.title + '" detected.');
        });
    } else {
        // if viewed from desktop, append card to list and listen to click events
        var taskCard = $(cardHtml).appendTo(listSelector);
        taskCard.on("click", function () {
            displayTask(subjectKey, startOfRelevantWeek, taskKey);
        });
    }
}

// APPEND NEWLY CREATED OR UPDATED TASK TO ALL RELEVANT PLACES IN THE DOM
function appendTask(subjectId, subjectData, taskKey, taskData) {
    // APPEND TASK TO SUBJECTS PAGE
    var subjectDiv = '#' + subjectId;
    createTaskElement(subjectDiv, subjectId, subjectData, taskKey, taskData);
    // IF TASK IS UNASSIGNED, APPEND IT TO THE FOOTER
    if (taskData.assigned_date === "") {
        var subjectDiv = '#unassignedTasksList';
        createTaskElement(subjectDiv, subjectId, subjectData, taskKey, taskData);
        // IF TASK'S WEEK IS IN THE DOM, APPEND TASK TO THE CALENDAR
    } else if ($('#calendarWrapper').children($('#week' + startOfWeek(taskData.assigned_date))).length > 0) {
        var subjectDiv = '#' + taskData.assigned_date;
        createTaskElement(subjectDiv, subjectId, subjectData, taskKey, taskData);
    }
}

// APPEND TASK TO ALL RELEVANT PLACES IN THE DOM AND CLOSE MODAL
function postCreateTask(subjectKey, subjectData, taskKey, taskData) {
    appendTask(subjectKey, subjectData, taskKey, taskData);
    closeModalWindow();
}

// DISPLAY TASKS ON SUBJECTS PAGE
function displayTasksInSubjectsPage(subjectKey, subjectDict, tasksDict) {
    // CLEAR CURRENT DISPLAY OF Tasks
    var subject_div_id = "#" + subjectKey;
    $(subject_div_id).text('');

    if (tasksDict !== null) {
        $.each(tasksDict, function(taskKey, taskData){
            //Appends the task card html to appropriate subjects on Subjects Page.
            createTaskElement(subject_div_id, subjectKey, subjectDict, taskKey, taskData);
        })
    }
}

// DISPLAY TASKS ON BOTTOM PANEL
function displayTasksInBottomPanel(subjectKey, subjectDict, tasksDict) {
    if (tasksDict !== null) {
        // append tasks to the footer div
        $.each(tasksDict, function(taskKey, taskData){
            var subjectDiv = '#unassignedTasksList';
            createTaskElement(subjectDiv, subjectKey, subjectDict, taskKey, taskData);
            applySortable(subjectDiv);
        })
    }
}

function displayTasksInCalendar(subjectKey, subjectDict, tasksDict) {
    if (tasksDict !== null) {
        var thisWeeksMonday = Date.parse('last monday');
        var nextWeeksMonday = Date.parse('next monday');
        // append tasks to the calendar
        $.each(tasksDict, function(taskKey, taskData){
            // checks whether there is an assigned date, and if so, whether it is currently displayed in the DOM
            if (whetherDateIsDisplayed(taskData.assigned_date, thisWeeksMonday, nextWeeksMonday)) {
                createTaskElement('#'+ taskData.assigned_date, subjectKey, subjectDict, taskKey, taskData);
            }
        })
    }
}

function displayTasksForWeekAndSubject(subjectKey, subjectDict, tasksDict) {
    if (tasksDict !== null) {
        // append tasks to the calendar
        $.each(tasksDict, function(taskKey, taskData){
            createTaskElement('#'+ taskData.assigned_date, subjectKey, subjectDict, taskKey, taskData);
        })
    }
}

// checks whether date is displayed in DOM
function whetherDateIsDisplayed(dateString, thisWeeksMonday, nextWeeksMonday) {
    var date = Date.parse(dateString);
    return date !== null && thisWeeksMonday <= date && date < nextWeeksMonday;
}

function removeTaskFromDOM(taskId) {
    // get task by its data attribute and remove it from the DOM
    $('li[data-taskid="' + taskId + '"]').remove();
}

function filterTasksInFooter(subjectKey) {
    $('#unassignedMessage').hide();
    if (subjectKey === "allUnassigendTasks") {
        $("#unassignedTasksList li").show();
    } else {
        // select all footer <li>s which do not belong to this subject, and hide them
        $('#unassignedTasksList li:not([data-subjectid="' + subjectKey + '"])').hide();
        // show only this subject's <li>s
        $('#unassignedTasksList li[data-subjectid="' + subjectKey + '"]').show();
        // if there are no unassigned tasks for a certain subject, display a message
        if ($('#unassignedTasksList li[data-subjectid="' + subjectKey + '"]').length === 0) {
            $('#unassignedMessage').show();
        }
    }
}