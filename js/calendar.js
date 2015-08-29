jQuery(document).ready(function () {
    prepareCalendarSlider();
});//end of document.ready function


function prepareCalendarSlider() {
    var SLIDE_DURATION = 400;
    var INITIAL_SLIDE = 3;

    var nextSlideNumber = 1;
    var prevSlideNumber = -1;

    var slideCount = $('.week').length;                                                         //Get amount of slides
    var slideWidth = $('.week').width();                                                        //Store width of slide as a variable
    var slideHeight = $('.week').height();                                                      //Store height of slide as a variable
    var wrapperWidth = slideCount * slideWidth;                                                 //Make the wrapper wide enough to accommodate all the weeks
    $('#calendarSlider').css({width: slideWidth, height: slideHeight});                                 // make the slider (viewport) as high and as wide as a single week
    $('#calendarWrapper').css({width: wrapperWidth, marginLeft: -(INITIAL_SLIDE - 1) * slideWidth});    // and shift wrapper according to INITIAL_SLIDE

    function moveSlide(howMany, completeCallback) {
        var parsedLeft = getLeftPositionWrapper();                                                  //Get current position of wrapper
        $('#calendarWrapper').animate({left: (parsedLeft - howMany*slideWidth)},
                                      {duration: SLIDE_DURATION, complete: completeCallback} );                    //take slidewidth away from current left position, and animate to this position
        var parsedMarginLeft = getLeftMarginWrapper();                                              //Get current left margin of wrapper
        $('#calendarWrapper').css({width: wrapperWidth, marginLeft: (parsedMarginLeft + howMany*slideWidth)});      //Increase it by the width of a slide
    };//end of moveSlide function

    $('#control_next').click(function () {
        var newSlideHTML = "<div class = 'week'>"+ nextSlideNumber +"</div>";
        var toRemove = $('#calendarWrapper').find('div').first();
        toRemove.remove();
        $("#calendarWrapper").append(newSlideHTML);
        nextSlideNumber ++;

        $('#control_next').attr('disabled', true);
        moveSlide(1, function() {
            $('#control_next').attr('disabled', false);
        });
    });//end of next click function

    $('#control_prev').click(function () {
        var newSlideHTML = "<div class = 'week'>"+ prevSlideNumber +"</div>";
        var toRemove = $('#calendarWrapper').find('div').last();
        toRemove.remove();
        $("#calendarWrapper").prepend(newSlideHTML);
        prevSlideNumber --;

        $('#control_prev').attr('disabled', true);
        moveSlide(-1, function() {
            $('#control_prev').attr('disabled', false);
        });
    });//end of prev click function
}

function getLeftPositionWrapper(){
    var element = document.getElementById("calendarWrapper");
    var style = window.getComputedStyle(element);
    var left = style.getPropertyValue('left');                  //Get current left position of wrapper
    var parsedLeft = parseInt(left);                            //parse into number
    console.log("Wrapper Left Position : "+ parsedLeft);
    return parsedLeft;
}

function getLeftMarginWrapper(){
    var wrap = document.getElementById('calendarWrapper');
    var style = window.getComputedStyle(wrap);
    var marginLeft = style.getPropertyValue('margin-left');     //Get current left margin of wrapper
    var parsedMarginLeft = parseInt(marginLeft);                //Parse into a number
    console.log("Margin Left Wrapper : "+ parsedMarginLeft);
    return parsedMarginLeft;
}


