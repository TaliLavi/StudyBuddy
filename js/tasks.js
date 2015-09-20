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
    var mondayOfRelevantWeek = startOfWeek(assigned_date);

    // PUSH THEM TO DB
    pushNewTask(subjectId, mondayOfRelevantWeek, title, description, assigned_date, time_estimation, creation_date, status_change_date);

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
        // Reset select value to default
        return this.defaultSelected;
    });
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

// APPEND NEWLY CREATED TASK TO ALL RELEVANT PLACES IN THE DOM
function appendNewTask(subjectId, subjectData, taskKey, taskData, assigned_date) {
    // APPEND TASK TO SUBJECTS PAGE
    var subjectDiv = '#' + subjectId;
    createTaskElement(subjectDiv, subjectId, subjectData, taskKey, taskData);
    // IF TASK IS UNASSIGNED, APPEND IT TO THE FOOTER
    if (assigned_date === "") {
        var subjectDiv = '#unassignedTasksFor' + subjectId;
        createTaskElement(subjectDiv, subjectId, subjectData, taskKey, taskData);
        // IF TASK'S WEEK IS IN THE DOM, APPEND TASK TO THE CALENDAR
    } else if ($('#calendarWrapper').children($('#week' + startOfWeek(assigned_date))).length > 0) {
        var subjectDiv = '#' + assigned_date;
        createTaskElement(subjectDiv, subjectId, subjectData, taskKey, taskData);
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
            createTaskElement(subject_div_id, subjectKey, subjectDict, taskKey, taskData);

        })
    }
}

// DISPLAY TASKS ON BOTTOM PANEL
function displayTasksInBottomPanel(subjectKey, subjectDict, tasksDict) {
    if (tasksDict !== null) {
        // append tasks to the footer div
        $.each(tasksDict, function(taskKey, taskData){
            var subjectDiv = '#unassignedTasksFor' + subjectKey;
            createTaskElement(subjectDiv, subjectKey, subjectDict, taskKey, taskData);
            applySortable(subjectDiv);
        })
    }
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

function hideTask(taskId) {
    // get task by its data attribute
    $("ul").find("[data-taskid='" + taskId + "']").hide();
    console.log("hi");
}

function filterTasksInFooter(subjectKey) {
    if (subjectKey === "allUnassigendTasks") {
        $("#tasksDivs .col").show();
    } else {
        var divId = "#footerDivFor" + subjectKey;
        // select all footer divs which are not this subject's, and hide them
        $("#tasksDivs .col").not(divId).hide();
        // show only this subject's div
        $(divId).show();
    }
}