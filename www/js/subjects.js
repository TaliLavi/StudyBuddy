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
    pushNewSubject(name, colour, is_deleted);

    // CLOSE THE ADD SUBJECT DIALOG
    //Fade out the greyed background
    $('.modal-bg').fadeOut();
    //Fade out the modal window
    $('#addSubjectModal').fadeOut();


    // CLEAR INPUT FIELDS ON THE ADD SUBJECT DIALOG
    nameInput.val('');
    colourInput.val('');

    // REFRESH SUBJECTS DISPLAY TO INCLUDE THE ONE THAT WAS JUST CREATED
    fetchActiveSubjects(displayActiveSubjects);
}

// DISPLAY SUBJECTS INFORMATION
function displayActiveSubjects(allSubjectsDict) {

    // Clear current display of subjects
    $('#subjectFilters').text('');
    $('#subjectsList').text('');
    $('#subjectInput').text('');
    $('#subjectInput').append('<option selected="true" disabled="disabled">Choose Subject</option>');
    $('#taskSubject').append('<option selected="true" disabled="disabled">Choose Subject</option>');

    // Populate Subjects Page with subjects and tasks.
    if (allSubjectsDict !== null) {
        $('#subjectFilters').append('<button class="subject" id="allUnassigendTasks" onclick="filterTasksInFooter(\'allUnassigendTasks\')">All</button>');

        $.each(allSubjectsDict, function(subjectKey, subjectData){
            // Populate Subject Footer with subjects names.
            var button_id = "subject" + subjectKey;
            var onclick_handler = "filterTasksInFooter('" + subjectKey + "')";
            $('#subjectFilters').append('<button class="subject" id="' + button_id + '"' +
                'onclick="' + onclick_handler + '">' +
                subjectData.name + '</button>'
            );


            // create a div for each subject and append it to subjectsList
            $('#subjectsList').append(
                '<div class="subjectName" onclick="viewSubjectArea(\'' + subjectKey + '\')">' + subjectData.name + '</div>'
            );
            $('#tasksPerSubject').append(
                '<div class="subjectArea" id="subjectArea' + subjectKey + '">' +
                '<h4>' + subjectData.name + '</h4>' +
                '<button type="button" class ="addTaskFromSubject" onclick="openAddTaskDialog(\'' + subjectKey + '\', this);">Add Task</button>' +
                '<ul id="tasksFor' + subjectKey + '"></ul>' +
                '<button type="button" class="completedTasksButton closed" onclick="fetchAndDisplayCompletedTasks(\'' +
                subjectKey + '\');">Show completed tasks</button>' +
                '<ul id="completedTasksFor' + subjectKey + '"></ul>' +
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

        // fetch and append all active tasks.
        // We're running this inside the callback to make sure subjects DOM elements have been prepared.
        fetchActiveTasks(displayTasksInSubjectsPage);
    }
}

function viewSubjectArea(subjectKey) {
    $('.subjectArea').hide();
    $('#subjectArea' + subjectKey).show();
}