//GLOBAL VARIABLES

var $monday = $("#monday");
var $tuesday = $("#tuesday");
var $wednesday = $("#wednesday");
var $thursday = $("#thursday");
var $friday = $("#friday");
var $saturday = $("#saturday");

var $english = $("#english");
var $french = $("#french");
var $history = $("#history");
var $geography = $("#geography");
var $maths = $("#maths");
var $biology = $("#biology");

var englishClass = "english";
var frenchClass = "french";
var historyClass = "history";
var geographyClass = "geography";
var mathsClass = "maths";
var biologyClass = "biology";

var label = 1;

//var shadow1 = "0 1px 3px  0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.6)";    //shadow1 is the normal box shadow on the tiles
//var shadow2 = "0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 2px 2px 0 rgba(0, 0, 0, 0.2)";    //shadow2 is the bigger shadow for when tiles are being moved




//Make these things happen each time the page finishes loading
function preparePage() {
    //set up drag and drop for each list
    $(".list").each(function(i, list){
        Sortable.create(list, {group: "stuff", onEnd: sayHi, animation: 400, ghostClass: "sortable-ghost"});
    })
}

//===========================================================================================================
    //CREATE A TILE
//===========================================================================================================
var dayList;


function addTile(){
    var subjectInput = document.getElementById("subjectInput").value;
    var userInput = document.getElementById("taskInput").value;                             //gets user input of form
    var newTile = $("<li></li>").addClass("tile").addClass(subjectInput).html(userInput);   //Creates a new tile div
    dayList.append(newTile);                                                                //Appends it to the list
    $('.modal-bg').fadeOut();                                                               //Fade out the greyed background
    $('#modal').fadeOut();                                                                  //Fade out the modal window
}


function openAddTask(list){
    document.getElementById("taskInput").value = null;
    $('#modal').css('display','block');                             //Makes the modal window display
    $('.modal-bg').fadeIn();                                        //Fades in the greyed-out background
    dayList = list;
}

$('#close').click(function(){                                       //When the x button on modal is pressed
    $('.modal-bg').fadeOut();                                       //Fade out the greyed background
    $('#modal').fadeOut();                                          //Fade out the modal window
    return false;
});

function addTileSubject(subjectList, subjectClass){
    var newTile = $("<li></li>").addClass("tile").addClass(subjectClass);
    subjectList.append(newTile);
}

//===========================================================================================================
//SHOW SUBJECTS
//===========================================================================================================

function showSubjects(){
    $("#subjectsContainer").css("display","block");
}

//===========================================================================================================
//GETTING TASKS FROM STUDYBUDDY FIREBASE TO CREATE TILES ON LOAD
//===========================================================================================================

//
//// DISPLAY TASKS INFORMATION
//function displayAllTasks(tasks) {
//    // CLEAR CURRENT DISPLAY OF SUBJECTS
//    $('#allTasksDiv').text('');
//
//    tasks.forEach(function (task){
//        $('<div/>').text(task.name + ' : ' + task.description).appendTo($('#allTasksDiv'));
//        $('#allTasksDiv')[0].scrollTop = $('#allTasksDiv')[0].scrollHeight;
//    })
//};
//
//FIREBASE_ROOT = "https://studybuddyapp.firebaseio.com";
//
//// RETRIEVE AND DISPLAY ALL SUBJECTS INFORMATION UPON REQUEST
//function fetchAllTasks(userId) {
//    var subjectsRef = new Firebase(FIREBASE_ROOT + '/Users/' + userId + '/Subjects');
//    var tasks = [];
//
//    subjectsRef.once("value", function(snapshot) {
//        if (snapshot.numChildren() > 0) {
//            $.each(snapshot.val(), function(snapshot){
//
//                if (snapshot.numChildren() > 0) {
//
//                }
//
//                //tasks.push(value)
//            });
//        }
//        displayAllTasks(tasks);
//    });
//}





//===========================================================================================================
//TRYING OUT FIREBASE (RÓISIN)
//===========================================================================================================

new Firebase('https://shining-inferno-9814.firebaseio.com/');       //REFERENCES ROISIN'S FIREBASE DATABASE


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

//HELLO!
