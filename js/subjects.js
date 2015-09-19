// CREATE NEW SUBJECT
function createSubject() {

    // REGISTER DOM ELEMENTS
    var nameInput = $('#nameInput');
    var colourInput = $('#colourInput');

    // GET FIELD VALUES
    var name = nameInput.val();
    var colour = colourInput.val();

    // SET DEFAULT VALUES
    var is_deleted = 0;

    // PUSH THEM TO DB
    pushNewSubject(getActiveUser(), name, colour, is_deleted);

    // CLOSE THE ADD SUBJECT DIALOG
    //Fade out the greyed background
    $('.modal-bg').fadeOut();
    //Fade out the modal window
    $('#addSubjectModal').fadeOut();


    // CLEAR INPUT FIELDS ON THE ADD SUBJECT DIALOG
    nameInput.val('');
    colourInput.val('');

    // REFRESH SUBJECTS DISPLAY TO INCLUDE THE ONE THAT WAS JUST CREATED
    fetchActiveSubjects(getActiveUser(), displayActiveSubjects);
}

// DISPLAY SUBJECTS INFORMATION
function displayActiveSubjects(subjectDict) {

    // Clear current display of subjects
    $('#subjectsList').text('');
    $('#subjectsDiv').text('');
    $('#subjectInput').text('');
    $('#subjectInput').append('<option selected="true" disabled="disabled">Choose Subject</option>');
    $('#taskSubject').append('<option selected="true" disabled="disabled">Choose Subject</option>');

    // Populate Subjects Page with subjects and tasks.
    if (subjectDict !== null) {
        $('#subjectsList').append('<button class="subject" id="allUnassigendTasks">All</button>');
        //$('#subjectsList').append('<button class="subject" id="allUnassigendTasks"' +
        //    'onclick="' + onclick_handler + '">All</button>');

        $.each(subjectDict, function(subjectKey, subjectData){

            // Populate Subject Footer with subjects names.
            var button_id = "subject" + subjectKey;
            var onclick_handler = "fetchUnassignedActiveTasksBySubject('" + subjectKey + "', displayTasksInBottomPanel)";
            $('#subjectsList').append('<button class="subject" id="' + button_id + '"' +
                'onclick="' + onclick_handler + '">' +
                subjectData.name + '</button>'
            );


            // create a div for each subject and append it to subjectsDiv
            $('#subjectsDiv').append(
                '<div class="col-md-2">' +
                    '<h4>' + subjectData.name + '</h4>' +
                    '<div class ="button addTaskFromSubject" onclick="openAddTaskDialog(\'' + subjectKey + '\', this);">Add Task</div>' +
                    '<ul class="list" id="' + subjectKey + '"></ul>' +
                '</div>'
            );

            // Create an option for each subject and append to the drop down menu on the Add Task modal window.
            $('#subjectInput').append(
                '<option value="' + subjectKey + '">' + subjectData.name +'</option>'
            );

            // Create an option for each subject and append to the drop down menu on the Task modal window.
            $('#taskSubject').append(
                '<option value="' + subjectKey + '">' + subjectData.name +'</option>'
            );
        })
        // By calling fetchActiveTasks() within the callback, we guarantee that it will run only after the subjects divs has been created.
        fetchActiveTasks(displayTasksInSubjectsPage);
    }
}