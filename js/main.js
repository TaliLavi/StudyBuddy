//var shadow1 = "0 1px 3px  0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.6)";    //shadow1 is the normal box shadow on the tiles
//var shadow2 = "0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 2px 2px 0 rgba(0, 0, 0, 0.2)";    //shadow2 is the bigger shadow for when tiles are being moved


//Make these things happen each time the page finishes loading
function preparePage() {
    //set up drag and drop for each list
    $(".sortable-task-list").each(function(i, list){
        Sortable.create(list, {
            group: "tasks",
            animation: 400,
            ghostClass: "sortable-ghost",
            onAdd: moveTask
        });
    });
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
    fetchActiveTasks(displayTasksInCalendar);
}


function moveTask(evt) {
    //var previousList = evt.from.id;
    var newAssignedDate = evt.item.parentElement.id;
    var subjectId = evt.item.dataset.subjectid;
    var taskId = evt.item.dataset.taskid;

    //console.log('oldAssignedDate to newAssignedDate:', [previousList, newAssignedDate]);


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
//ADD A NEW SUBJECT
//===========================================================================================================

function openAddSubject(){
    document.getElementById("subjectNameInput").value = null;       //Clear the name field of the modal window
    document.getElementById("subjectColourInput").value = null;     //Clear the colour field of the modal window
    $('#modalSubject').css('display','block');                      //Makes the modal window display
    $('#subjectModalBG').fadeIn();                                  //Fades in the greyed-out background
}

function addSubject(){
    var subjectName = document.getElementById("subjectNameInput").value;        //gets user input of form
    var subjectColour = document.getElementById("subjectColourInput").value;    //gets user input of form
    console.log(subjectName+" "+subjectColour);
    // put code to append new subject to div here
    //var newSubjectDiv = $("<div></div>").addClass("col-md-2");
    //$("#subjectsContainer").append(newSubjectDiv);
    $('.modal-bg').fadeOut();                                                   //Fade out the greyed background
    $('#modalSubject').fadeOut();                                               //Fade out the modal window
}



//===========================================================================================================
    //TWEENMAX FUNCTIONS TO CHANGE SIZE/OPACITY OF TILE AS IT IS DRAGGED
//===========================================================================================================
//
//function shrink(element){
//    TweenMax.to(element, 0.2, {     //This TweenMax gives the dragTile its shadow and change in size
//        autoAlpha : 0.75,
//        boxShadow : shadow2,
//        scale     : 0.95,
//    });
//}
//
//function grow(element){
//    TweenMax.to(element, 0.2, {
//        autoAlpha : 1,
//        boxShadow: shadow1,
//        scale     : 1,
//    });
//}



