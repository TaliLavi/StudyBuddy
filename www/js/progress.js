/*===================================================================================================================*/
/* BAR CHART */
/*===================================================================================================================*/

// Constants
BAR_CHART_MARGIN_TOP = 50;
BAR_CHART_MARGIN_BOTTOM = 30;
BAR_CHART_MARGIN_RIGHT = 20;
BAR_CHART_MARGIN_LEFT = 20;

function generateBarGraph(subjects, doneTasks, dateFilterCallback) {
    var graphData = [];
    var tasks = doneTasks;
    $.each(subjects, function(subjectId, subjectDict) {
        var subjectName = subjectDict.name;
        var colourclass = subjectDict.colour_scheme;
        var weeks = tasks[subjectId];
        var doneTasks = 0;
        if (weeks !== undefined) {
            $.each(weeks, function (week, tasksDict) {
                if (tasksDict !== undefined) {
                    $.each(tasksDict, function (days, taskDict) {
                        if (dateFilterCallback(taskDict.assigned_date)) {
                            doneTasks += 1;
                        }
                    });
                }
            });
        }
        graphData.push({subject: subjectName, doneTasks: doneTasks, colourClass: colourclass});
    });
    drawBarGraph(graphData);
    bestSubjectsFeedback(graphData);
}

// generate graph for ALL of the done tasks
function fetchAndDisplayBarGraphSinceDawnOfTime(renewCache) {
    $("#dawnTimeButton").css("backgroundColor", "#31A9A8");
    $("#lastWeekButton").css("backgroundColor", "rgb(149,202,173)");
    $("#lastMonthButton").css("backgroundColor", "rgb(149,202,173)");
    $("#chart").text(""); // clear previous contents
    fetchAllDoneTasks(generateBarGraphSinceDawnOfTime, renewCache);
}
function generateBarGraphSinceDawnOfTime(subjects, doneTasks) {
    generateBarGraph(subjects, doneTasks, function() {return true;});
}

// generate graph for tasks in last 7 days (7*24 hours)
function fetchAndDisplayBarGraphForLast7Days(renewCache) {
    $("#chart").text(""); // clear previous contents
    $("#dawnTimeButton").css("backgroundColor", "rgb(149,202,173)");
    $("#lastWeekButton").css("backgroundColor", "#31A9A8");
    $("#lastMonthButton").css("backgroundColor", "rgb(149,202,173)");
    $("#chart").html(""); // clear previous contents
    fetchAllDoneTasks(generateBarGraphForLast7Days, renewCache);
}
function generateBarGraphForLast7Days(subjects, doneTasks) {
    generateBarGraph(subjects, doneTasks, function(taskDate) {
        // calculate number of days since taskDate.
        // rounding to overcome timezone differences, which otherwise result in getting decimal numbers.
        var days = Math.round((new Date() - new Date(taskDate)) / (1000*60*60*24));

        // return whether it's been less than a week
        return days <= 7;
    });
}

// generate graph for tasks in last month (30 days)
function fetchAndDisplayBarGraphForLastMonth(renewCache) {
    $("#dawnTimeButton").css("backgroundColor", "rgb(149,202,173)");
    $("#lastWeekButton").css("backgroundColor", "rgb(149,202,173)");
    $("#lastMonthButton").css("backgroundColor", "#31A9A8");
    $("#chart").text(""); // clear previous contents
    fetchAllDoneTasks(generateBarGraphForLastMonth, renewCache);
}
function generateBarGraphForLastMonth(subjects, doneTasks) {
    generateBarGraph(subjects, doneTasks, function(taskDate) {
        // calculate number of days since taskDate.
        // rounding to overcome timezone differences, which otherwise result in getting decimal numbers.
        var days = Math.round((new Date() - new Date(taskDate)) / (1000*60*60*24));

        // return whether it's been less than a month
        return days <= 30;
    });
}

// find subject with biggest number of done tasks
function bestSubjectsFeedback(subjectsDict) {

    var max = {};
    for (var i = 0; i < subjectsDict.length; i++) {
        if (subjectsDict[i].doneTasks > (max.doneTasks || 0))
            max = subjectsDict[i];
    };

    $('#subjectsThisWeekMessage').text('Great job with ' + max.subject + '!');
}

function drawBarGraph(data) {
    var margin = {top: BAR_CHART_MARGIN_TOP, bottom: BAR_CHART_MARGIN_BOTTOM,
                  left: BAR_CHART_MARGIN_LEFT, right: BAR_CHART_MARGIN_RIGHT},
        width = $('#chart').attr('width') - margin.left - margin.right,
        height = $('#chart').attr('height') - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var svg = d3.select("#chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d) { return d.subject; }));
    y.domain([0, d3.max(data, function(d) { return d.doneTasks; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", function(d) { return "bar " + d.colourClass;})
        .attr("x", function(d) { return x(d.subject); })
        .attr("width", x.rangeBand())
        .attr("y", height)
        .attr("height", 0)
        .transition()
            .delay(function(d, i) { return i * 100; })
            .duration(1000)
            .attr("y", function(d) { return y(d.doneTasks); })
            .attr("height", function(d) { return height - y(d.doneTasks); });

    // height offset of text from top of bar
    var textOffset = 5;
    svg.selectAll("text.bar")
        .data(data)
        .enter().append("text")
        .attr("class", "bar-text")
        .attr("text-anchor", "middle")
        .attr("x", function(d) { return x(d.subject) + x.rangeBand()/2; }) // we divide by 2 to put the text on the bar's centre
        .attr("y", function(d) { return y(d.doneTasks) - textOffset; })
        .transition()
        .delay(function() { return 2300; })
            .text(function(d) { return d.doneTasks; });
}

/*===================================================================================================================*/
/* HEATMAP */
/*===================================================================================================================*/

function drawHeatmap(){
    $('#cal-heatmap').html("");
    fetchHeatmapData(function(heatmapSnapshot) {
        var heatmapData = prepareHeatmapData(heatmapSnapshot);
        var cal = new CalHeatMap();
        cal.init({
            itemSelector: "#cal-heatmap",
            domain: "month",
            domainGutter: 1,
            domainMargin: 0,
            subDomain: "day",
            range: 12,
            cellSize: 12,
            start: new Date(2015, 8, 1),
            data: heatmapData,
            cellRadius: 2,
            domainDynamicDimension: false,
            displayLegend: false
        });
    })
}

function prepareHeatmapData(heatmapSnapshot) {
    var dataSet = {};
    if (heatmapSnapshot !== null) {
        $.each(heatmapSnapshot, function(date, timeDict){
            var timestamp = Math.round(Date.parse(date)/1000);
            var value = timeDict.time_studied;
            dataSet[timestamp] = value;
        })
    }
    return dataSet
}

function isConsecutiveDays(date1, date2) {
    date1 = new Date(date1);
    date2 = new Date(date2);

    var dayDurationInEpochTime = 86400000;
    return date2 - date1 <= dayDurationInEpochTime;
}

function isSameMonth(date1, date2) {
    date1 = new Date(date1);
    date2 = new Date(date2);

    return (date1.getFullYear() === date2.getFullYear()) && (date1.getMonth() === date2.getMonth())
}

function currentStreak(heatmapSnapshot) {
    var previousDate;
    var longestStreak = 0;
    var currentStreak = 1;

    $.each(heatmapSnapshot, function(date){
        if (isConsecutiveDays(previousDate, date)) {
            currentStreak += 1;
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }
        } else {
            currentStreak = 1;
        }

        previousDate = date;
    });
    //$('#currentStreak').text('current streak is: ' + currentStreak);
    //$('#longestStreak').text('longest streak is: ' + longestStreak);
}

function isBestMonth(heatmapSnapshot) {
    var previousDate = new Date("1900-01-01");
    var bestDate = previousDate;
    var mostTimeStudiedInMonth = 0;
    var timeStudiedThisMonth = 0;
    $.each(heatmapSnapshot, function(dateKey, dateData){
        if (isSameMonth(previousDate, dateKey)) {
            timeStudiedThisMonth += dateData.time_studied;
            if (timeStudiedThisMonth > mostTimeStudiedInMonth) {
                mostTimeStudiedInMonth = timeStudiedThisMonth;
                bestDate = dateKey;
            }
        } else {
            timeStudiedThisMonth = 0;
        }
        previousDate = dateKey;
    });
    if (timeStudiedThisMonth >= mostTimeStudiedInMonth) {
        var timestring = formatTimeString(timeStudiedThisMonth);
        return timestring;
    }
}

function timeThisMonth(heatmapSnapshot) {
    var previousDate = new Date("1900-01-01");
    var timeStudiedThisMonth = 0;
    $.each(heatmapSnapshot, function(dateKey, dateData){
        if (isSameMonth(previousDate, dateKey)) {
            timeStudiedThisMonth += dateData.time_studied;
        } else {
            timeStudiedThisMonth = 0;
        }
        previousDate = dateKey;
    });
    var timestring = formatTimeString(timeStudiedThisMonth);
    return timestring;
}

function findBestWeekDay(heatmapSnapshot) {
    var timesPerWeekDay = [0, 0, 0, 0, 0, 0, 0];
    $.each(heatmapSnapshot, function(date){
        var formattedDate = new Date(date)
        timesPerWeekDay[formattedDate.getDay()] += 1;
    });
    var bestDayNum = timesPerWeekDay.indexOf(Math.max.apply(Math, timesPerWeekDay));
    return formatWeekDay(bestDayNum);
}