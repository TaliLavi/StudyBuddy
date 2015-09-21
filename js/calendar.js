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
        fetchActiveTasksByWeek(mondayOfNewWeek, displayTasksForWeekAndSubject);
        $('#control_next').attr('disabled', true);
        moveSlide(1, function() {
            $('#control_next').attr('disabled', false);
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
        fetchActiveTasksByWeek(mondayOfNewWeek, displayTasksForWeekAndSubject);
        $('#control_prev').attr('disabled', true);
        moveSlide(-1, function() {
            $('#control_prev').attr('disabled', false);
        });
        createCalendarHeading();
    });//end of prev click function
}

function createCalendarHeading() {
    // extract the displayed week's monday from the week's id.
    var displayedmonday = $('.week:nth-child(2)>div').attr('id').slice('week'.length);

    // get previous week's monday and this week's monday
    if (Date.today().is().monday()) {
        // if today happens to be a Monday, go to last monday
        var previousWeekMonday = Date.today().last().monday().toString('yyyy-MM-dd');
        // if today happens to be a Monday, save it as this week's monday
        var currentWeekMonday = Date.today().toString('yyyy-MM-dd');
    } else {
        // else, grab the date for that week's Monday, and go back 7 days to the previous monday
        var previousWeekMonday = Date.today().last().monday().addDays(-7).toString('yyyy-MM-dd');
        // else, go to last monday
        var currentWeekMonday = Date.today().last().monday().toString('yyyy-MM-dd');
    }

    var nextWeekMonday = Date.today().next().monday().toString('yyyy-MM-dd');

    //console.log("displayedmonday is: " + displayedmonday + ". currentWeekMonday is: " + currentWeekMonday + ". previousWeekMonday is: " + previousWeekMonday + ". nextWeekMonday is: " + nextWeekMonday);

    if (displayedmonday === currentWeekMonday) {
        $('#weekHeadingOnCalendar').text('THIS WEEK');
    } else if (displayedmonday === previousWeekMonday) {
        $('#weekHeadingOnCalendar').text('LAST WEEK');
    } else if (displayedmonday === nextWeekMonday) {
        $('#weekHeadingOnCalendar').text('NEXT WEEK');
    } else {
        var displayedSunday = Date.parse(displayedmonday).addDays(6).toString('yyyy-MM-dd');
        $('#weekHeadingOnCalendar').text(displayedmonday + ' - ' + displayedSunday);
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

