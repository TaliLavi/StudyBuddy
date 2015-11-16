function prepareCalendarSlider() {
    var SLIDE_DURATION = 400;
    var INITIAL_SLIDE = 2;

    var slideCount = $('.week').length;                                                         //Get amount of slides
    var slideWidth = $('.week').width();                                                        //Store width of slide as a variable
    var slideHeight = $('.week').height();                                                      //Store height of slide as a variable                                                      //Store height of slide as a variable
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
        var latestWeekDate = $('.week:last>div').attr('id').slice('week'.length);
        var mondayOfNewWeek = startOfWeek(latestWeekDate, 7);
        var newWeekHTML = createHtmlForWeekOf(mondayOfNewWeek);
        $('#calendarWrapper>div:first').remove();
        $("#calendarWrapper").append(newWeekHTML);
        applySortable("#week" + mondayOfNewWeek + " .sortable-task-list");
        fetchTasksByWeek(mondayOfNewWeek, displayTasksForWeekAndSubject);
        $('#control_next').attr('disabled', true);
        $('#control_prev').attr('disabled', true);
        moveSlide(1, function() {
            $('#control_next').attr('disabled', false);
            $('#control_prev').attr('disabled', false);
        });
        createCalendarHeading();
    });//end of next click function

    $('#control_prev').click(function () {
        var earliestWeekDate = $('.week:first>div').attr('id').slice('week'.length);
        var mondayOfNewWeek = startOfWeek(earliestWeekDate, -7);
        var newWeekHTML = createHtmlForWeekOf(mondayOfNewWeek);
        $('#calendarWrapper>div:last').remove();
        $("#calendarWrapper").prepend(newWeekHTML);
        applySortable("#week" + mondayOfNewWeek + " .sortable-task-list");
        fetchTasksByWeek(mondayOfNewWeek, displayTasksForWeekAndSubject);
        $('#control_prev').attr('disabled', true);
        $('#control_next').attr('disabled', true);
        moveSlide(-1, function() {
            $('#control_prev').attr('disabled', false);
            $('#control_next').attr('disabled', false);
        });
        createCalendarHeading();
    });//end of prev click function
}

function createCalendarHeading() {

    // extract the displayed week's monday from the week's id.
    var displayedmonday = new Date($('.week:nth-child(2)>div').attr('id').slice('week'.length));
    var currentWeekMonday = startOfWeek(new Date());

    // get number of weeks between displayed week and current week.
    // rounding to overcome timezone differences, which otherwise result in getting decimal numbers.
    var numOfWeeks = Math.round((Date.parse(displayedmonday) - Date.parse(currentWeekMonday)) / (1000*60*60*24*7));

    if (numOfWeeks === 0) {
        $('#weekHeadingOnCalendar').text('THIS WEEK');
    } else if (numOfWeeks === -1) {
        $('#weekHeadingOnCalendar').text('LAST WEEK');
    } else if (numOfWeeks === 1) {
        $('#weekHeadingOnCalendar').text('NEXT WEEK');
    } else if (numOfWeeks > 1) {
        $('#weekHeadingOnCalendar').text(numOfWeeks + ' WEEKS TIME');
    } else {
        $('#weekHeadingOnCalendar').text(-1*numOfWeeks + ' WEEKS AGO');
    }
}


function getLeftPositionWrapper(){
    var element = document.getElementById("calendarWrapper");
    var style = window.getComputedStyle(element);
    var left = style.getPropertyValue('left');                  //Get current left position of wrapper
    var parsedLeft = parseInt(left);                            //parse into number
    return parsedLeft;
}

function getLeftMarginWrapper(){
    var wrap = document.getElementById('calendarWrapper');
    var style = window.getComputedStyle(wrap);
    var marginLeft = style.getPropertyValue('margin-left');     //Get current left margin of wrapper
    var parsedMarginLeft = parseInt(marginLeft);                //Parse into a number
    return parsedMarginLeft;
}

