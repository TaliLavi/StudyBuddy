function generateNumOfDoneTasksGraph(doneTasks, subjects) {
    //console.log('doneTasks are:', doneTasks);
    //console.log('subjects are:', subjects);

    var doneTasksPerSubject = doneTasksPerSubjectDawnOfTime(doneTasks);
    console.log(doneTasksPerSubject);
}

function doneTasksPerSubjectDawnOfTime(subjects) {
    var totalDoneTasksInEachSubject = {};
    $.each(subjects, function(subjectId, weeks) {
        var totalDoneTasksPerSubject = null;
        $.each(weeks, function(week, tasksDict) {
            totalDoneTasksPerSubject += Object.keys(tasksDict).length;
        });
        totalDoneTasksInEachSubject[subjectId.toString()] = totalDoneTasksPerSubject;
    });
    return totalDoneTasksInEachSubject;
}

