// CREATE NEW USER
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
    pushNewSubject(name, colour, studySessionMinutes, shortBreakMinutes, longBreakMinutes);

    // CLEAR INPUT FIELDS
    nameField.val('');
    colourField.val('');

    // REFRESH SUBJECTS DISPLAY TO INCLUDE THE ONE THAT WAS JUST CREATED
    fetchAllSubjects();
};

// DISPLAY SUBJECTS INFORMATION
function displayAllSubjects(subjects) {
    // CLEAR CURRENT DISPLAY OF SUBJECTS
    $('#allSubjectsDiv').text('');

    subjects.forEach(function (subject){
        $('<div/>').text(subject.name).appendTo($('#allSubjectsDiv'));
        $('#allSubjectsDiv')[0].scrollTop = $('#allSubjectsDiv')[0].scrollHeight;
    })
};
