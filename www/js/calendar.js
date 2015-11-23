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


// Date helper functions:
// GET THE DATE FOR MONDAY OF DATE'S WEEK
function startOfWeek(dateString, offsetDays) {
    if (isNaN(Date.parse(dateString))) {
        return 'no_assigned_date';
    }

    var date = new Date(dateString);

    if (offsetDays !== undefined) {
        date.setDate(date.getDate() + offsetDays);
    }

    // go to this/previous monday (getDay() of monday is 1)
    var daysSinceMonday = (date.getDay()+7-1)%7;
    date.setDate(date.getDate() - daysSinceMonday);

    return formatDate(date);
}

// Poor-man's (library-less) date formatter. Default is YYYY-MM-DD
function formatDate(dateString, formatString) {
    var date = new Date(dateString);
    var dd = date.getDate();
    if (dd < 10) {dd = "0" + dd};
    var mm = date.getMonth() + 1; //Months are zero based
    if (mm < 10) {mm = "0" + mm};
    var yyyy = date.getFullYear();

    var shortMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    var longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var shortDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    if (formatString === "yyyy-mm-dd" || formatString === undefined) {
        return yyyy + "-" + mm + "-" + dd;
    }
    if (formatString === "ddd") {
        return shortDays[date.getDay()];
    }
    if (formatString === "d MMM") {
        return date.getDate() + " " + shortMonths[date.getMonth()];
    }
    if (formatString === "Month yyyy") {
        return longMonths[date.getMonth()] + " " + yyyy;
    }
    console.error("Unknown formatString passed to formatDate:", formatString);
}

function formatWeekDay(weekDayNum) {
    var weekdays =  ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekdays[weekDayNum];
}

function formatTime(seconds) {
    var ss = seconds%60;
    if (ss < 10) {ss = "0" + ss};
    var mm = Math.floor(seconds/60);
    if (mm < 10) {mm = "0" + mm};

    return mm + ":" + ss;
}
