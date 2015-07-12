//var shadow1 = "0 1px 3px  0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.6)";    //shadow1 is the normal box shadow on the tiles
//var shadow2 = "0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 2px 2px 0 rgba(0, 0, 0, 0.2)";    //shadow2 is the bigger shadow for when tiles are being moved

function moveTask(evt) {
    var oldListId = evt.from.id;
    var newListId = evt.item.parentElement.id;
    console.log('oldList to newList:', [oldListId, newListId]);

    var oldList = evt.from;
    var newList = evt.item.parentElement;

    if($(oldList).hasClass('dayList') && $(newList).hasClass('dayList')) {
        console.log('Yes');

    } else {
        console.log('No');
    }
}


//Make these things happen each time the page finishes loading
//TODO: Combine this and the $(document).ready functions below in a single place.
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

$(document).ready(function(){
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
});


$(document).ready(function(){
    // toggle the bottom Subjects Panel
    $("#flip").click(function(){
        $("#subjectsPanel").slideToggle("slow");
    });
    // hide tasksDiv in the bottom panel
    $('#tasksDiv').hide();
});





//===========================================================================================================
    //CREATE A TASK CARD
//===========================================================================================================
var dayList;


function addTask(date){
    //gets user input of form
    var subjectInput = $('#subjectInput').val();
    var userInput = $('#taskInput').val();
    //Creates a new task card div
    var newTaskCard = $('<li></li>').addClass('taskCard').attr('id', subjectInput).html(userInput);
    //Appends it to the list
    $('#'+date).append(newTaskCard);
    //Fade out the greyed background
    $('.modal-bg').fadeOut();
    //Fade out the modal window
    $('#modalTask').fadeOut();
}

function addTaskDialog(date){
    //Clear the fields of the modal window
    $('#taskInput').val('');
    //Makes the modal window display
    $('#modalTask').css('display','block');
    //Fades in the greyed-out background
    $('#taskModalBG').fadeIn();
    // Clear any old onclick handler
    $('#submitTask').off("click");
    // Set the new onclick handler
    $('#submitTask').on("click", function(){addTask(date)});
}


//===========================================================================================================
//CANCELLING ANY MODAL WINDOW WITHOUT ADDING ANYTHING
//===========================================================================================================

$('.closeX').click(function(){                                       //When the x button on modal is pressed
    $('.modal-bg').fadeOut();                                       //Fade out the greyed background
    $('.modal').fadeOut();                                          //Fade out the modal window
    return false;
});

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



