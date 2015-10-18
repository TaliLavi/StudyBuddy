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

//Create html for task element and append it to the list
function createAndAppendTaskElement(listSelector, subjectKey, subjectDict, taskKey, taskData, isDone) {
    // create html for active/done task on subject page
    if (listSelector === "#tasksFor" + subjectKey || listSelector === "#completedTasksFor" + subjectKey) {
        var taskHtml = createTodoTaskHtml(subjectKey, subjectDict, taskKey, taskData);
        $(taskHtml).appendTo(listSelector);
        setClickForTodoTask(taskKey);
        // create html for active/done assigned task in the calendar OR for unassigned task in the footer
    } else {
        var taskHtml = createCardTaskHtml(subjectKey, subjectDict, taskKey, taskData, isDone);
        setClickForCardTask(listSelector, subjectKey, taskKey, taskData, taskHtml);
    }
}

function createCardTaskHtml(subjectKey, subjectDict, taskKey, taskData, isDone) {
    //create html for done task in the calendar
    if (isDone !== undefined) {
        var taskHtml = '<li data-subjectId="' + subjectKey + '" data-taskId="' + taskKey + '">' +
                            '<div class ="cardTask ' + subjectKey + ' ' + subjectDict.main_colour + ' doneTask">' +
                                '<span class="cardText">' + taskData.title + '</span>' +
                            '</div>' +
                        '</li>';
    //create html for active task in the calendar OR for unassigned task in the footer
    } else {
        var taskHtml = '<li data-subjectId="' + subjectKey + '" data-taskId="' + taskKey + '">' +
                           '<div class ="cardTask ' + subjectKey + ' ' + subjectDict.main_colour + '">' +
                                '<span class="cardText">' + taskData.title + '</span>' +
                           '</div>' +
                       '</li>';
    }

    return taskHtml;
}

function setClickForCardTask(listSelector, subjectKey, taskKey, taskData, taskHtml) {
    var startOfRelevantWeek = startOfWeek(taskData.assigned_date);
    // append card to list
    var task = $(taskHtml).appendTo(listSelector);
    // listen to click events
    task.on("click", function () {
        displayTask(subjectKey, startOfRelevantWeek, taskKey);
    });
}

function createTodoTaskHtml(subjectKey, subjectDict, taskKey, taskData) {
    if (taskData.assigned_date === "") {
        var taskAssignedDate = "Set a date";
    } else {
        var taskAssignedDate = taskData.assigned_date;
    }

    var taskHtml = '<div class="accordion-section" data-subjectId="' + subjectKey + '" data-taskId="' + taskKey + '">' +
                        '<a class="accordion-section-title" id="accordionTitle' + taskKey + '" href="#accordion' + taskKey + '">' +
                            '<span class="' + subjectDict.colour_scheme + '">' + taskData.title + '</span>' +
                            '<span class="' + subjectDict.colour_scheme + '">' + taskAssignedDate + '</span>' +
                        '</a>' +
                        '<div id="accordion' + taskKey + '" class="accordion-section-content">' +
                            '<div>' +
                                '<p>' + taskData.description +'</p>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<br/>';

    return taskHtml;
}

function setClickForTodoTask(taskKey) {
    $('#accordionTitle' + taskKey).click(function(e) {
        // Grab current anchor value
        var currentAttrValue = $(this).attr('href');

        if($(e.target).is('.active') || $(e.target).parent().is('.active')) {
            close_accordion_section();
        } else {
            close_accordion_section();

            // Add active class to section title
            $(this).addClass('active');
            // Open up the hidden content panel
            $('.accordion ' + currentAttrValue).slideDown(300).addClass('open');
        }

        e.preventDefault();
    });
}

// collapse accordion
function close_accordion_section() {
    $('.accordion .accordion-section-title').removeClass('active');
    $('.accordion .accordion-section-content').slideUp(300).removeClass('open');
}

// APPEND NEWLY CREATED OR UPDATED TASK TO ALL RELEVANT PLACES IN THE DOM
function appendTask(subjectId, subjectData, taskKey, taskData) {
    // APPEND TASK TO SUBJECTS PAGE
    var subjectDiv = '#tasksFor' + subjectId;
    createAndAppendTaskElement(subjectDiv, subjectId, subjectData, taskKey, taskData);
    // IF TASK IS UNASSIGNED, APPEND IT TO THE FOOTER
    if (taskData.assigned_date === "") {
        var subjectDiv = '#unassignedTasksList';
        createAndAppendTaskElement(subjectDiv, subjectId, subjectData, taskKey, taskData);
        // IF TASK'S WEEK IS IN THE DOM, APPEND TASK TO THE CALENDAR
    } else if ($('#calendarWrapper').children($('#week' + startOfWeek(taskData.assigned_date))).length > 0) {
        var subjectDiv = '#' + taskData.assigned_date;
        createAndAppendTaskElement(subjectDiv, subjectId, subjectData, taskKey, taskData);
    }
}

// APPEND TASK TO ALL RELEVANT PLACES IN THE DOM AND CLOSE MODAL
function postCreateTask(subjectKey, subjectData, taskKey, taskData) {
    appendTask(subjectKey, subjectData, taskKey, taskData);
    closeModalWindow();
}

// DISPLAY TASKS ON SUBJECTS PAGE
function displayTasksInSubjectsPage(subjectKey, subjectDict, tasksDict) {
    // CLEAR CURRENT DISPLAY OF TASKS
    var subjectDiv = "#tasksFor" + subjectKey;
    $(subjectDiv).text('');

    if (tasksDict !== null) {
        $.each(tasksDict, function(taskKey, taskData){
            //Appends the task card html to appropriate subjects on Subjects Page.
            createAndAppendTaskElement(subjectDiv, subjectKey, subjectDict, taskKey, taskData);
        })
    }
}

// DISPLAY COMPLETED TASKS PER SUBJECT ON SUBJECTS PAGE
function displayCompletedTasks(subjectKey, subjectDict, tasksDict) {
    // CLEAR CURRENT DISPLAY OF TASKS
    var subjectDiv = "#completedTasksFor" + subjectKey;
    $(subjectDiv).text('');

    if (tasksDict !== null) {
        $.each(tasksDict, function(taskKey, taskData){
            //Appends the task card html to appropriate subjects on Subjects Page.
            createAndAppendTaskElement(subjectDiv, subjectKey, subjectDict, taskKey, taskData);
        })
    }
}

function fetchAndDisplayCompletedTasks(subjectId) {
    // get the Completed Tasks Button that belongs to the relevant subject
    var completedTasksButton = $('.completedTasksButton', $('#subjectArea' + subjectId))

    if (completedTasksButton.hasClass('closed')) {
        fetchDoneTasksPerSubject(subjectId, displayCompletedTasks);
        completedTasksButton.addClass('open');
        completedTasksButton.removeClass('closed');
        completedTasksButton.text('Hide completed tasks');
    } else {
        $('#completedTasksFor' + subjectId).text('');
        completedTasksButton.addClass('closed');
        completedTasksButton.removeClass('open');
        completedTasksButton.text('Show completed tasks');
    }
}

// DISPLAY TASKS ON BOTTOM PANEL
function displayTasksInBottomPanel(subjectKey, subjectDict, tasksDict) {
    if (tasksDict !== null) {
        // append tasks to the footer div
        $.each(tasksDict, function(taskKey, taskData){
            var subjectDiv = '#unassignedTasksList';
            createAndAppendTaskElement(subjectDiv, subjectKey, subjectDict, taskKey, taskData);
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
                createAndAppendTaskElement('#'+ taskData.assigned_date, subjectKey, subjectDict, taskKey, taskData);
            }
        })
    }
}

function displayTasksForWeekAndSubject(subjectKey, subjectDict, tasksDict, isDone) {
    if (tasksDict !== null) {
        if (isDone !== undefined) {
            // append done tasks to the calendar
            $.each(tasksDict, function(taskKey, taskData){
                createAndAppendTaskElement('#'+ taskData.assigned_date, subjectKey, subjectDict, taskKey, taskData, 'done');
            })
        } else {
            // append active tasks to the calendar
            $.each(tasksDict, function(taskKey, taskData){
                createAndAppendTaskElement('#'+ taskData.assigned_date, subjectKey, subjectDict, taskKey, taskData);
            })
        }
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

function markAsDone(taskId) {
    var today = Date.today().toString('yyyy-MM-dd');

    // if in footer, prepend to calendar for today (this will automatically also remove the task from footer)
    $('#unassignedTasksList li[data-taskid="' + taskId + '"]').prependTo('#' + today);

    // apply class doneTask
    $('.dayList li[data-taskid="' + taskId + '"] div').addClass("doneTask");

    // in subject's page, remove from list (no need to append to complete b/c the button fetches each time anew)
    $('.subjectArea li[data-taskid="' + taskId + '"] div').remove();
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