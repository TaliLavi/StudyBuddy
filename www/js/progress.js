/*===================================================================================================================*/
/* BAR CHART */
/*===================================================================================================================*/

// Constants
BAR_CHART_MARGIN_TOP = 50;
BAR_CHART_MARGIN_BOTTOM = 30;
BAR_CHART_MARGIN_RIGHT = 20;
BAR_CHART_MARGIN_LEFT = 20;

function switchToBarGraphRange(selectedRangeName) {
    var rangeButtonIds = {
        "dawnTime": "#dawnTimeButton",
        "lastWeek": "#lastWeekButton",
        "lastMonth": "#lastMonthButton"
    }

    $.each(rangeButtonIds, function(name, id){
        if (name === selectedRangeName) {
            $(id).removeClass("unSelectedBarGraphButton").addClass("selectedBarGraphButton");
        } else {
            $(id).removeClass("selectedBarGraphButton").addClass("unSelectedBarGraphButton");
        }
    });

    $("#chart").text(""); // clear previous chart contents
    $('#doneTasksMessage').text(""); // clear previous feedback message
}

function totalTasksDoneInPeriod(subjectsHistogram) {
    var taskSum = 0;
    subjectsHistogram.forEach(function(subjectDict) {
        taskSum += subjectDict.doneTasks;
    });
    return taskSum;
}

function mostTasksPerSubject(subjectsHistogram) {
    var maxTasks = 0;
    subjectsHistogram.forEach(function(subjectDict) {
        if (subjectDict.doneTasks > maxTasks) {
            maxTasks = subjectDict.doneTasks;
        }
    });
    return maxTasks;
}

function subjectsWithThisManyTasks(subjectsHistogram, taskNum) {
    var subjectNames = [];
    subjectsHistogram.forEach(function(subjectDict) {
        if (subjectDict.doneTasks === taskNum) {
            subjectNames.push(subjectDict.subject);
        }
    });
    return subjectNames;
}

// return a string with commas between all elements, except for an "and" before the last item
function arrayToPrettyList(array) {
    if (array.length === 0) {
        return "";
    } else if (array.length === 1) {
        return array[0];
    } else {
        return array.slice(0,-1).join(", ") + " and " + array.slice(-1)[0];
    }
}

// returns a function to filter for dates only between minDaysAgo and maxDaysAgo
function filterForPastDays(minDaysAgo, maxDaysAgo) {
    return function(date) {
        // calculate number of days since taskDate.
        // rounding to overcome timezone differences, which otherwise result in getting decimal numbers.
        var days = Math.round((new Date() - new Date(date)) / (1000*60*60*24));

        // return whether it's been less than a week
        return minDaysAgo <= days && days <= maxDaysAgo;
    };
}

function tasksPerSubject(doneTasks, subjects, dateFilterCallback) {
    var graphData = [];
    var tasks = doneTasks;
    $.each(subjects, function (subjectId, subjectDict) {
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
    return graphData;
}

// generate graph and progress for ALL of the done tasks
function fetchAndDisplayProgressSinceDawnOfTime(renewCache) {
    switchToBarGraphRange("dawnTime");
    fetchAllDoneTasks(function(subjects, doneTasks) {
        var doneTasksData = doneTasks;
        if (doneTasks === null) {
            doneTasksData = {};
        };
        var subjectsHistogram = tasksPerSubject(doneTasksData, subjects, function() {return true;});
        drawBarGraph(subjectsHistogram);

        var maxTasks = mostTasksPerSubject(subjectsHistogram);
        if (maxTasks === 0) {
            $('#doneTasksMessage').text("You haven't completed any tasks yet. Like, ever. Get working.");
        } else {
            var bestSubjects = subjectsWithThisManyTasks(subjectsHistogram, maxTasks);
            $('#doneTasksMessage').text("Well done on " + arrayToPrettyList(bestSubjects) + "!");
        }
    }, renewCache);
}

// based on number of tasks done this week, return a string describing your awesomeness
function weekDegreeOfAwesomeness(tasksDone) {
    var awesomenessZeroToNine = [
        "No tasks done yet. Can't wait to see what you get up to this week!",
        "I know you can do more this week!",
        "I know you can do a bit more this week!",
        "Good job, keep it up!",
        "Very good work this week!",
        "Great job, keep up the hard work!",
        "Excellent work this week!",
        "Super job, you're really getting a lot done!",
        "You should be really proud!",
        "Amazing work!"
    ]

    if (tasksDone < 10) {
        return awesomenessZeroToNine[tasksDone];
    }
    return "Incredible work!!!";
}

// generate graph and progress for tasks in last 7 days (7*24 hours)
function fetchAndDisplayProgressForLast7Days(renewCache) {
    switchToBarGraphRange("lastWeek");
    fetchAllDoneTasks(function(subjects, doneTasks) {
        var doneTasksData = doneTasks;
        if (doneTasks === null) {
            doneTasksData = {};
        };
        var subjectsHistogramThisWeek = tasksPerSubject(doneTasksData, subjects, filterForPastDays(0, 7));
        var subjectsHistogramLastWeek = tasksPerSubject(doneTasksData, subjects, filterForPastDays(8, 14));
        drawBarGraph(subjectsHistogramThisWeek);

        // choose randomly which feedback to display
        if (Math.random() > 0.5) {
            // number of tasks feedback
            var sumTasksThisWeek = totalTasksDoneInPeriod(subjectsHistogramThisWeek);
            var sumTasksLastWeek = totalTasksDoneInPeriod(subjectsHistogramLastWeek);
            var awesomenessString = weekDegreeOfAwesomeness(sumTasksThisWeek);
            if (sumTasksThisWeek === 0) {
                $('#doneTasksMessage').text("No tasks done yet. Can't wait to see what you get up to this week!");
            } else if (sumTasksThisWeek > sumTasksLastWeek){
                $('#doneTasksMessage').text("You've done " + sumTasksThisWeek + " tasks this week. " + awesomenessString + " That's " + (sumTasksThisWeek - sumTasksLastWeek) + " more than last week.");
            } else{
                $('#doneTasksMessage').text("You've done " + sumTasksThisWeek + " tasks this week. " + awesomenessString);
            }
        } else {
            // best subjects feedback
            var maxTasks = mostTasksPerSubject(subjectsHistogramThisWeek);
            if (maxTasks === 0) {
                $('#doneTasksMessage').text("No tasks done yet. Can't wait to see what you get up to this week!");
            } else {
                var bestSubjects = subjectsWithThisManyTasks(subjectsHistogramThisWeek, maxTasks);
                if (bestSubjects.length === 1) {
                    var untouchedSubjects = subjectsWithThisManyTasks(subjectsHistogramThisWeek, 0);
                    if (untouchedSubjects.length === 0) {
                        $('#doneTasksMessage').text("You're doing awesome on " + bestSubjects[0] + " and you have no untouched subjects, hooray!");
                    } else if (untouchedSubjects.length >= subjectsHistogramThisWeek.length/2) {
                        $('#doneTasksMessage').text("Well done on " + bestSubjects[0] + ", but you should really start paying attention to other subjects as well");
                    } else {
                        $('#doneTasksMessage').text("Well done on " + bestSubjects[0] + ", but you haven't yet put any effort into some of your other subjects this week.");
                    }
                } else {
                    $('#doneTasksMessage').text("Well done on " + arrayToPrettyList(bestSubjects) + "!");
                }
            }
        }
    }, renewCache);
}

// generate graph and progress for tasks in last month (30 days)
function fetchAndDisplayProgressForLastMonth(renewCache) {
    switchToBarGraphRange("lastMonth");
    fetchAllDoneTasks(function(subjects, doneTasks) {
        var doneTasksData = doneTasks;
        if (doneTasks === null) {
            doneTasksData = {};
        };
        var subjectsHistogramThisMonth = tasksPerSubject(doneTasksData, subjects, filterForPastDays(0, 30));
        var subjectsHistogramLastMonth = tasksPerSubject(doneTasksData, subjects, filterForPastDays(31, 60));
        drawBarGraph(subjectsHistogramThisMonth);

        // choose randomly which feedback to display
        if (Math.random() > 0.5) {
            // number of tasks feedback
            var sumTasksThisMonth = totalTasksDoneInPeriod(subjectsHistogramThisMonth);
            var sumTasksLastMonth = totalTasksDoneInPeriod(subjectsHistogramLastMonth);
            if (sumTasksThisMonth === 0) {
                $('#doneTasksMessage').text("You haven't completed any tasks yet this month. Get working.");
            } else if (sumTasksThisMonth > sumTasksLastMonth){
                $('#doneTasksMessage').text("Awesome, you've completed " + (sumTasksThisMonth - sumTasksLastMonth) + " more tasks this month than last month. Keep up the great work!");
            } else if (sumTasksThisMonth === sumTasksLastMonth){
                $('#doneTasksMessage').text("You've completed the same number of tasks this month as last month (" + sumTasksThisMonth + "). Why not try for one more?");
            } else if (sumTasksThisMonth === sumTasksLastMonth - 1){
                $('#doneTasksMessage').text("If you just complete one more task, you'll do as well as last month. Go for it!");
            } else{
                $('#doneTasksMessage').text("You're lagging behind last month's effort by " + (sumTasksLastMonth - sumTasksThisMonth) + " tasks. Work a little harder, it'll be worth it.");
            }
        } else {
            // best subjects feedback
            var maxTasks = mostTasksPerSubject(subjectsHistogramThisMonth);
            if (maxTasks === 0) {
                $('#doneTasksMessage').text("You haven't completed any tasks yet this month. Get working.");
            } else {
                var bestSubjects = subjectsWithThisManyTasks(subjectsHistogramThisMonth, maxTasks);
                if (bestSubjects.length === 1) {
                    var untouchedSubjects = subjectsWithThisManyTasks(subjectsHistogramThisMonth, 0);
                    if (untouchedSubjects.length === 0) {
                        $('#doneTasksMessage').text("You're doing awesome on " + bestSubjects[0] + " and you have no untouched subjects, hooray!");
                    } else if (untouchedSubjects.length <= 3) {
                        $('#doneTasksMessage').text("Well done on " + bestSubjects[0] + ", but you haven't put any effort into "
                                                    + arrayToPrettyList(untouchedSubjects) + ". Perhaps you should spread the love around.");
                    } else { // more than 3 untouched subjects
                        $('#doneTasksMessage').text("Well done on " + bestSubjects[0] + ", but don't forget to pay attention to your other subjects too");
                    }
                } else {
                    $('#doneTasksMessage').text("Well done on " + arrayToPrettyList(bestSubjects) + "!");
                }
            }
        }
    }, renewCache);
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
        .delay(function() { return 1800; })
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
            cellSize: 12.5,
            start: new Date(2015, 8, 1),
            data: heatmapData,
            cellRadius: 2,
            itemName: ["second", "seconds"],
            displayLegend: false
        });
    })
    if (isMobile()) {
        //show the days of the week initials
        $('#dayInitials').css("display", "block");
    } else {
        //hide the day of the week initials
        $('#dayInitials').css("display", "none");
    }
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
    if (heatmapSnapshot !== null) {
        var previousDate;
        var longestStreak = 1;
        var currentStreak = 1;
        var inRecordStreak = true;

        $.each(heatmapSnapshot, function(date){
            if (isConsecutiveDays(previousDate, date)) {
                currentStreak += 1;
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                    inRecordStreak = true;
                }
            } else {
                currentStreak = 1;
                inRecordStreak = false;
            }

            previousDate = date;
        });
        $('#currentStreak').text(currentStreak);

        if (currentStreak === longestStreak) {
            if (inRecordStreak) {
                $('#streakMessage').text('Well done, that\'s a new record!');
            } else {
                $('#streakMessage').text('That\'s your personal best');
            }
        } else {
            $('#streakMessage').text('Keep it up, ' + dataCache.username + '! Your longest ever study streak is ' + longestStreak + ' days.');
        }

        $('#streakSection').show();
    };
}

function isBestMonth(heatmapSnapshot) {
    var previousDate = new Date("1900-01-01");
    var mostTimeStudiedInMonth = 0;
    var timeStudiedThisMonth = 0;
    $.each(heatmapSnapshot, function(dateKey, dateData){
        if (isSameMonth(previousDate, dateKey)) {
            timeStudiedThisMonth += dateData.time_studied;
        } else {
            timeStudiedThisMonth = dateData.time_studied;
        }
        if (timeStudiedThisMonth > mostTimeStudiedInMonth) {
            mostTimeStudiedInMonth = timeStudiedThisMonth;
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