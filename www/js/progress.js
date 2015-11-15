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

function isConsecutiveDays(firstDay, secondDay) {
    var firstDayParsed = Date.parse(firstDay);
    var secondDayParsed = Date.parse(secondDay);

    var dayDurationInEpochTime = 86400000;
    return secondDayParsed - firstDayParsed <= dayDurationInEpochTime;
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
    $('#currentStreak').text('current streak is: ' + currentStreak);
    $('#longestStreak').text('longest streak is: ' + longestStreak);
}

var dataForExperiment =
    {
    "2015-08-10" : {"number_of_breaks" : 23, "time_studied" : 57},
    "2015-08-11" : {"number_of_breaks" : 10,"time_studied" : 143},
    "2015-08-12" : {"number_of_breaks" : 19,"time_studied" : 398},
    "2015-08-13" : {"number_of_breaks" : 4,"time_studied" : 36},
    "2015-08-14" : {"time_studied" : 3},
    "2015-08-16" : {"number_of_breaks" : 11,"time_studied" : 141},
    "2015-08-17" : {"number_of_breaks" : 2,"time_studied" : 28},
    "2015-08-19" : {
        "number_of_breaks" : 9,
        "time_studied" : 57
    },
    "2015-08-31" : {
        "number_of_breaks" : 1,
        "time_studied" : 28
    },
    "2015-09-07" : {
        "number_of_breaks" : 1,
        "time_studied" : 22
    },
    "2015-09-14" : {
        "time_studied" : 6
    },
    "2015-09-15" : {
        "number_of_breaks" : 1,
        "time_studied" : 10
    },
    "2015-09-19" : {
        "number_of_breaks" : 1,
        "time_studied" : 10
    },
    "2015-09-27" : {
        "time_studied" : 1
    },
    "2015-09-28" : {
        "time_studied" : 1
    },
    "2015-09-29" : {
        "number_of_breaks" : 8,
        "time_studied" : 74
    },
    "2015-09-30" : {
        "number_of_breaks" : 4,
        "time_studied" : 52
    },
    "2015-10-01" : {
        "time_studied" : 10
    },
    "2015-10-02" : {
        "number_of_breaks" : 1,
        "time_studied" : 13
    },
    "2015-10-11" : {
        "number_of_breaks" : 166,
        "time_studied" : 0
    },
    "2015-10-14" : {
        "number_of_breaks" : 30,
        "time_studied" : 263
    },
    "2015-10-19" : {
        "number_of_breaks" : 5,
        "time_studied" : 700
    },
    "2015-10-20" : {
        "number_of_breaks" : 16,
        "time_studied" : 1945
    },
    "2015-10-21" : {
        "number_of_breaks" : 6,
        "time_studied" : 148
    },
    "2015-10-22" : {
        "number_of_breaks" : 1,
        "time_studied" : 30
    },
    "2015-10-23" : {
        "number_of_breaks" : 29,
        "time_studied" : 410
    },
    "2015-10-24" : {
        "number_of_breaks" : 5,
        "time_studied" : 63
    },
    "2015-10-25" : {
        "time_studied" : 12
    },
    "2015-10-26" : {
        "time_studied" : 1
    },
    "2015-10-27" : {
        "time_studied" : 10
    },
    "2015-10-28" : {
        "number_of_breaks" : 13,
        "time_studied" : 190
    },
    "2015-10-29" : {
        "number_of_breaks" : 63,
        "time_studied" : 1424
    },
    "2015-10-30" : {
        "time_studied" : 169
    },
    "2015-11-01" : {
        "time_studied" : 9
    },
    "2015-11-02" : {
        "time_studied" : 62
    },
    "2015-11-03" : {
        "number_of_breaks" : 6,
        "time_studied" : 45
    },
    "2015-11-04" : {
        "time_studied" : 36
    },
    "2015-11-05" : {
        "time_studied" : 30
    },
    "2015-11-06" : {
        "time_studied" : 45
    },
    "2015-11-07" : {
        "time_studied" : 36
    },
    "2015-11-08" : {
        "number_of_breaks" : 5,
        "time_studied" : 10
    },
    "2015-11-09" : {
        "number_of_breaks" : 7,
        "time_studied" : 131
    },
    "2015-11-13" : {
        "number_of_breaks" : 7,
        "time_studied" : 131
    }
};