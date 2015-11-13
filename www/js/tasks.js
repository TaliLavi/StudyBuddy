// CREATE NEW TASK
function createTask() {
    // create a new task only if a title was written and a subject was chosen
    if ($('#titleInput').val() && $('#subjectInput').val() !== null) {
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
}

// CREATE NEW TASK FROM SUBJECT PAGE
function createTaskFromSubjectPage(subjectId) {
    var taskTitle = $('.bulkText').filter('[data-subjectid="' + subjectId + '"]').val();
    // create a new task only if a title was written
    if (taskTitle) {
        var taskDescription = "";
        var now = $.now();

        var newTask = {
            title: taskTitle,
            description: taskDescription,
            assigned_date: "",
            creation_date: now,
            status_change_date: now
        }
        var mondayOfRelevantWeek = startOfWeek(newTask.assigned_date);
        // PUSH THEM TO DB
        saveNewTask(subjectId, mondayOfRelevantWeek, newTask, postCreateTask);

        // CLEAR TEXT FIELDS
        $('.bulkText').filter('[data-subjectid="' + subjectId + '"]').val('');
    }
}

//=====================================================================
//                       UPDATING TASK DETAILS
//=====================================================================

function submitTaskChanges(subjectId, oldWeekDate, taskId, originalTaskDetails) {
    var updatedTask = {
        title: $('#cardTitle').val(),
        description: $('#cardDescription').val(),
        assigned_date: $('#cardAssignedDate').val()
    }

    // Update task only if a change in title, description or date was made.
     if (originalTaskDetails.title !== updatedTask.title || originalTaskDetails.description !== updatedTask.description || originalTaskDetails.assigned_date !== updatedTask.assigned_date) {
         updateTask(subjectId, taskId, oldWeekDate, originalTaskDetails, updatedTask, updateTaskFieldsAndMoveCard);
     }
}

// if any of the task's details got changed, change the DOM accordingly
function updateTaskFields(subjectId, taskId, taskData){
    var newWeekDate = startOfWeek(taskData.assigned_date);
    $('#cardAssignedDate').data('date', newWeekDate);
    // change the description of the todotask.
    var choppedTaskDesc = threeDots(taskData.description, 38);
    $('#todoDescriptionFor' + taskId).text(choppedTaskDesc);
    // change the title of the todotask.
    var choppedTaskTitle = threeDots(taskData.title, 28);
    $('#todoTitleFor' + taskId).text(choppedTaskTitle);
    // change the title of the card.
    $('li[data-taskid="' + taskId + '"] > div > span').text(taskData.title);
    // change the date data attribute of the card task
    $('li[data-taskid="' + taskId + '"]').data('task-date', taskData.assigned_date);
    // change the date of the todotask.
    var cardAssignedDate;
    if (taskData.assigned_date === "") {
        cardAssignedDate = "Set a date";
    } else {
        cardAssignedDate = formatDate(taskData.assigned_date, 'd MMM');
    }
    $('#todoAssignedDateFor' + taskId).text(cardAssignedDate);

    setClickForCardTask(subjectId, taskId);
}

function updateTaskFieldsAndMoveCard(subjectId, subjectData, taskId, originalTask, updatedTask){
    console.log('updatedTask in updateTaskFieldsAndMoveCard() is:', updatedTask)
    updateTaskFields(subjectId, taskId, updatedTask);
    // remove and append task in the DOM only if the task's date was changed
    if (originalTask.assigned_date !== updatedTask.assigned_date) {
        setClickForTodoTask(subjectId, taskId, updatedTask, false)
        removeCardFromDOM(taskId);
        appendCard(subjectId, subjectData, taskId, updatedTask);
    }
}

//Create html for task element and append it to the list
function createAndAppendTaskElement(listSelector, subjectKey, subjectDict, taskKey, taskData, isDone) {
    // create html for active/done task on subject page
    if (listSelector === "#tasksFor" + subjectKey || listSelector === "#completedTasksFor" + subjectKey) {
        var taskHtml = createTodoTaskHtml(subjectKey, subjectDict, taskKey, taskData, isDone);
        $(taskHtml).appendTo(listSelector);
        setClickForTodoTask(subjectKey, taskKey, taskData, isDone);
        // create html for active/done assigned task in the calendar OR for unassigned task in the footer
    } else {
        var taskHtml = createCardTaskHtml(subjectKey, subjectDict, taskKey, taskData, isDone);
        // append card to list
        $(taskHtml).appendTo(listSelector);
        setClickForCardTask(subjectKey, taskKey);
    }
}

function createCardTaskHtml(subjectKey, subjectDict, taskKey, taskData, isDone) {
    var taskDate;
    if (taskData.assigned_date === ""){
        taskDate = "no_assigned_date";
    } else {
        taskDate = taskData.assigned_date;
    }
    //create html for done task in the calendar
    if (isDone !== undefined) {
        var taskHtml = '<li data-subjectId="' + subjectKey + '" data-taskId="' + taskKey + '" data-task-date="' + taskDate + '">' +
                            '<div class ="cardTask ' + subjectKey + ' ' + subjectDict.colour_scheme + ' mainColour doneTask">' +
                                '<span class="cardText">' + taskData.title + '</span>' +
                            '</div>' +
                        '</li>';
    //create html for active task in the calendar OR for unassigned task in the footer
    } else {
        var taskHtml = '<li data-subjectId="' + subjectKey + '" data-taskId="' + taskKey + '" data-task-date="' + taskDate + '">' +
                            '<div class ="cardTask ' + subjectKey + ' ' + subjectDict.colour_scheme + ' mainColour">' +
                                '<span class="cardText">' + taskData.title + '</span>' +
                            '</div>' +
                        '</li>';
    }

    return taskHtml;
}

function setClickForCardTask(subjectKey, taskKey) {
    // Clear old onclick handler and set new one
    $('li[data-taskid="' + taskKey + '"]').off("click");
    $('li[data-taskid="' + taskKey + '"]').on("click", function () {
        var startOfRelevantWeek = startOfWeek($('li[data-taskid="' + taskKey + '"]').data('task-date'));
        var isDone = $('.sortable-task-list').find('li[data-taskid="' + taskKey + '"] > div').hasClass('doneTask');
        fetchSingleTask(subjectKey, startOfRelevantWeek, taskKey, isDone, fillInTaskDetails);
        timeCardWasClicked = $.now();
    });
}

function createTodoTaskHtml(subjectKey, subjectDict, taskKey, taskData) {
    if (taskData.assigned_date === "") {
        var cardAssignedDate = "Set a date";
    } else {
        var cardAssignedDate = formatDate(taskData.assigned_date, 'd MMM');
    }

    var choppedTaskTitle = threeDots(taskData.title, 28);
    var choppedTaskDesc = threeDots(taskData.description, 38);

    var taskHtml = '<div id="todoTaskFor' + taskKey + '" class="todoTask ' + subjectDict.colour_scheme + '" data-subjectId="' + subjectKey + '" data-taskId="' + taskKey + '">' +
        '<span id="todoTitleFor' + taskKey + '" class= "todoTitle ' + subjectDict.colour_scheme +'">'+ choppedTaskTitle +'</span>' +
        '<span id="todoDescriptionFor' + taskKey + '" class=" todoDescription ' + subjectDict.colour_scheme +'">' + choppedTaskDesc + '</span>' +
        '<span id="todoAssignedDateFor' + taskKey + '" class=" todoDate ' + subjectDict.colour_scheme + '">' + cardAssignedDate +'</span>'+
        '</div>' +
        '<br/>';

    return taskHtml;
}

function threeDots(userInputString, numOfCharacters) {
    var choppedString;
    if(userInputString.length > numOfCharacters){
        choppedString =userInputString.substring(0, numOfCharacters)+"...";
    }else{
        choppedString = userInputString;
    }
    return choppedString;
}

function setClickForTodoTask(subjectKey, taskKey, taskData, isDone) {
    $('#todoTaskFor' + taskKey).off('click');
    $('#todoTaskFor' + taskKey).on('click', function() {
        var startOfRelevantWeek = startOfWeek(taskData.assigned_date);
        fetchSingleTask(subjectKey, startOfRelevantWeek, taskKey, isDone, fillInTaskDetails);
    });
}

// APPEND NEWLY CREATED OR UPDATED TASK TO CALENDAR OR FOOTER
function appendCard(subjectId, subjectData, taskKey, taskData) {
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

// APPEND TASK TO SUBJECTS PAGE
function appendTodoTask(subjectKey, subjectData, taskKey, taskData) {
    var subjectDiv = '#tasksFor' + subjectKey;
    createAndAppendTaskElement(subjectDiv, subjectKey, subjectData, taskKey, taskData);
}

// APPEND TASK TO ALL RELEVANT PLACES IN THE DOM AND CLOSE MODAL
function postCreateTask(subjectKey, subjectData, taskKey, taskData) {
    appendTodoTask(subjectKey, subjectData, taskKey, taskData);
    appendCard(subjectKey, subjectData, taskKey, taskData);
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

    var isDone = true;

    if (tasksDict !== null) {
        $.each(tasksDict, function(taskKey, taskData){
            //Appends the task card html to appropriate subjects on Subjects Page.
            createAndAppendTaskElement(subjectDiv, subjectKey, subjectDict, taskKey, taskData, isDone);
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
        var subjectDiv = '#unassignedTasksList';
        $.each(tasksDict, function(taskKey, taskData){
            createAndAppendTaskElement(subjectDiv, subjectKey, subjectDict, taskKey, taskData);
        })
        applySortable(subjectDiv);
    }
}

function displayTasksInCalendar(subjectKey, subjectDict, tasksDict) {
    if (tasksDict !== null) {
        var thisWeeksMonday = startOfWeek(new Date());
        var nextWeeksMonday = startOfWeek(new Date(), 7);
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
                createAndAppendTaskElement('#'+ taskData.assigned_date, subjectKey, subjectDict, taskKey, taskData, isDone);
            })
        } else {
            // append active tasks to the calendar
            $.each(tasksDict, function(taskKey, taskData){
                createAndAppendTaskElement('#'+ taskData.assigned_date, subjectKey, subjectDict, taskKey, taskData);
            })
        }
        timeCardsAppearOnCalendar = $.now();
        //console.log('It took ' + (timeCardsAppearOnCalendar-timeAppWasLoaded) + ' millisecond from opening the app for the cards to appear in the calendar.');
    }
}

// checks whether date is displayed in DOM
function whetherDateIsDisplayed(dateString, thisWeeksMonday, nextWeeksMonday) {
    var date = Date.parse(dateString);
    return date !== null && thisWeeksMonday <= date && date < nextWeeksMonday;
}

function removeCardFromDOM(taskId) {
    // get card task by its data attribute and remove it from the DOM
    $('li[data-taskid="' + taskId + '"]').remove();
}

function removeToDoTaskFromDOM(taskId) {
    // we are checking to see whether the todotask exists in the DOM, because there is in some cases a chance for a
    // risk condition with removeSubjectFromDOM().
    if ($('#todoTaskFor' + taskId)) {
        // get todotask and the <br> tag which is after it and remove them from the DOM
        $('#todoTaskFor' + taskId).next("br").remove();
        $('#todoTaskFor' + taskId).remove();
    }
}

function markAsDone(subjectId, originalDate, taskId) {
    var today = formatDate(new Date());

    // if in footer, prepend to calendar for today (this will automatically also remove the task from footer)
    $('#unassignedTasksList li[data-taskid="' + taskId + '"]').prependTo('#' + today);
    // change card's task-date data attribute
    $('li[data-taskid="' + taskId + '"]').data('task-date', today);

    // apply class doneTask
    $('.dayList li[data-taskid="' + taskId + '"] div').addClass("doneTask");

    // in subject's page, remove from list (no need to append to complete b/c the button fetches each time anew)
    $('.todoWrapper div[data-taskid="' + taskId + '"]').next().remove();
    $('.todoWrapper div[data-taskid="' + taskId + '"]').remove();

    playRuzoDone();
    moveTaskToDone(subjectId, taskId, originalDate);
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

function playPop() {
    $('#popSound').get(0).play();
}