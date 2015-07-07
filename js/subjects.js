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

    // Clear current display of subjects
    $('#subjectsDiv').text('');
    $('#subjectInput').text('');
    $('#subjectInput').append('<option selected="true" disabled="disabled">Choose Subject</option>');

    // Populate Subjects Page with subjects and tasks.
    if (subjectDict !== null) {
        $.each(subjectDict, function(subjectKey, subjectData){

            // Populate Subject Footer with subjects names.
            $('#subjectsList').append(
                '<button class="subject" id="subject' + subjectKey + '" onclick="fetchActiveTasks(\'' + subjectKey + '\', displayTasksBottomPanel);">'
                + subjectData.name + '</button>'
            );

            // create a div for each subject and append it to subjectsDiv
            $('#subjectsDiv').append(
                '<div class="col-md-2">' +
                    '<h4>' + subjectData.name + '</h4>' +
                    '<div id="addTileEnglish" class ="button" onclick="addTileSubject(\'' + subjectData.name + '\');">Add Tile</div>' +
                    '<ul class="list" id="' + subjectKey + '"></ul>' +
                '</div>'
            );

            // Create an option for each subject and append to the drop down menu on the Add Task modal window.
            $('#subjectInput').append(
                '<option value="' + subjectKey + '">' + subjectData.name +'</option>'
            )

            // By calling fetchActiveTasks() within the callback, we guarantee that it will run only after the subject's div has been created.
            fetchActiveTasks(subjectKey, displayTasksSubjectsPage);
        })
    }
}

// RETRIEVE AND DISPLAY ALL SUBJECTS INFORMATION INSTANTLY WHEN PAGE FINISHES LOADING
$(document).ready(function(){
    fetchActiveSubjects(getActiveUser(), displayActiveSubjects);
});