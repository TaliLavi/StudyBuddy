var $monday = $("#monday");
var $tuesday = $("#tuesday");
var $wednesday = $("#wednesday");
var $thursday = $("#thursday");
var $friday = $("#friday");
var $saturday = $("#saturday");


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

function sayHi() {
    console.log("Hi!")
}

//===========================================================================================================
    //CREATE A TILE
//===========================================================================================================
var dayList;


function addTile(){
    var userInput = document.getElementById("taskInput").value;     //gets user input of form
    var newTile = $("<li></li>").addClass("tile").html(userInput);  //Creates a new tile div
    dayList.append(newTile);                                        //Appends it to the list
    $('.modal-bg').fadeOut();                                       //Fade out the greyed background
    $('#modal').fadeOut();                                          //Fade out the modal window
}


function openAddTask(list){
    $('#modal').css('display','block');                             //Makes the modal window display
    $('.modal-bg').fadeIn();                                        //Fades in the greyed-out background
    dayList = list;
}

$('#close').click(function(){                                       //When the x button on modal is pressed
    $('.modal-bg').fadeOut();                                       //Fade out the greyed background
    $('#modal').fadeOut();                                          //Fade out the modal window
    return false;
});

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

