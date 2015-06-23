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
    fetchAllSubjects(getActiveUser());
};

// DISPLAY SUBJECTS INFORMATION
function displayAllSubjects(subjects) {
    // CLEAR CURRENT DISPLAY OF SUBJECTS
    $('#allSubjectsDiv').text('');

    subjects.forEach(function (subject){
        $('<div/>').text(subject.name + ' : ' + subject.colour).appendTo($('#allSubjectsDiv'));
        $('#allSubjectsDiv')[0].scrollTop = $('#allSubjectsDiv')[0].scrollHeight;
    })
};


// RETRIEVE AND DISPLAY ALL SUBJECTS INFORMATION INSTANTLY WHEN PAGE FINISHES LOADING
$(document).ready(function(){
    fetchAllSubjects(getActiveUser());
});