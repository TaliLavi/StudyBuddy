// CREATE NEW SUBJECT
function createSubject() {

    // REGISTER DOM ELEMENTS
    var nameField = $('#subjectName');
    var colourField = $('#subjectColour');

    // GET FIELD VALUES
    var name = nameField.val();
    var colour = colourField.val();

    // SET DEFAULT TIME INTERVALS
    var studySessionMinutes = 25;
    var shortBreakMinutes = 5;
    var longBreakMinutes = 15;

    // PUSH THEM TO DB
    pushNewSubject(getActiveUser(), name, colour, studySessionMinutes, shortBreakMinutes, longBreakMinutes);

    // CLEAR INPUT FIELDS
    nameField.val('');
    colourField.val('');

    // REFRESH SUBJECTS DISPLAY TO INCLUDE THE ONE THAT WAS JUST CREATED
    fetchActiveSubjects(getActiveUser(), displayActiveSubjects);
};

// DISPLAY SUBJECTS INFORMATION
function displayActiveSubjects(subjectDict) {
    // CLEAR CURRENT DISPLAY OF SUBJECTS
    $('#subjectsDiv').text('');
    if (subjectDict !== null) {
        $.each(subjectDict, function(subjectKey, subjectData){
            $('#subjectsDiv').append('<div id="' + subjectKey + '">' + subjectData.name + ' : ' + subjectData.colour + ' : ' + subjectKey +
                                        '<div id="tasks' + subjectKey + '"></div></div>');
            // By calling fetchActiveTasks() within the callback, we guarantee that it will run only after the subject's div has been created.
            fetchActiveTasks(subjectKey, displayActiveTasks);
        })
    }
}

// RETRIEVE AND DISPLAY ALL SUBJECTS INFORMATION INSTANTLY WHEN PAGE FINISHES LOADING
$(document).ready(function(){
    fetchActiveSubjects(getActiveUser(), displayActiveSubjects);
});