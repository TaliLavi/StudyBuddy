// CREATE NEW SUBJECT
function createSubject() {

    // GET FIELD VALUES
    var name = $('#nameInput').val();
    var colour_scheme = $('.chosenColour').data('colour-scheme');

    // SET DEFAULT VALUES
    var is_deleted = 0;

    // PUSH THEM TO DB
    pushNewSubject(name, colour_scheme, is_deleted);

    // CLOSE THE ADD SUBJECT DIALOG
    closeModalWindow();

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


            // In subjects page, create a button (div) for each subject
            $('#subjectsList').append(
                '<div id="subjectName' + subjectKey + '" class="subjectName ' + subjectData.colour_scheme + '" ' +
                'onclick="viewSubjectArea(\'' + subjectKey + '\')">' + subjectData.name + '</div>'
            );
            // In subjects page, create a subjectArea for each subject. This is where tasks for that subject would eventually appear.
            $('#tasksPerSubject').append(
                '<div class="subjectArea secondaryColour ' + subjectData.colour_scheme + '" id="subjectArea' + subjectKey + '">' +
                    '<p class="subjectHeaderOnSubjectPage">' + subjectData.name + '</p>' +
                    '<div class="editColour ' + subjectData.colour_scheme + ' mainColour" data-colour-scheme="' + subjectData.colour_scheme + '"></div>' +
                    '<button type="button" class ="addTaskFromSubject" onclick="openAddTaskDialog(\'' + subjectKey + '\', this);">Add Task</button>' +
                    '<div class="accordion" id="tasksFor' + subjectKey + '"></div>' +
                    '<button type="button" class="completedTasksButton closed" onclick="fetchAndDisplayCompletedTasks(\'' +
                    subjectKey + '\');">Show completed tasks</button>' +
                    '<div class="accordion" id="completedTasksFor' + subjectKey + '"></div>' +
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

        $('.editColour').click(function () {
            // if this click will make #colourPalette visible:
            if ($('#colourPalette').is(':hidden')) {
                // select this subject's colour by default
                var subjectColour = $(this).data('colour-scheme');
                var subjectColourDiv = $("#colourPalette").find('[data-colour-scheme="' + subjectColour + '"]');
                $(subjectColourDiv).addClass('chosenColour');
                // position colour palette menu next to the editColour button
                var offset = $(this).offset();
                $('#colourPalette').css('left',offset.left + 50);
                $('#colourPalette').css('top',offset.top + 50);
                $("#colourPalette").css("position", "absolute");

                closeWhenClickingOutside($('#colourPalette'));

                // display #colourPalette
                $('#colourPalette').show();
            // if this click will make #colourPalette hidden:
            } else {
                // hide and clear colourPalette
                $('.colourMessage').text('');
                $('.colourOption').removeClass('chosenColour');
                // hide #colourPalette
                $('#colourPalette').hide();
            }
        });

        // fetch and append all active tasks.
        // We're running this inside the callback to make sure subjects DOM elements have been prepared.
        fetchActiveTasks(displayTasksInSubjectsPage);
    }
}

function hideColourPalette() {
    // prevent document from continueing to listen to clicks outside the modal container.
    if (isMobile()) {
        $(document).off('touchend');
    } else {
        $(document).off('mouseup');
    }
    // hide and clear colourPalette
    $('#colourPalette').hide();
    $('.colourMessage').text('');
    $('.colourOption').removeClass('chosenColour');
}

function viewSubjectArea(subjectKey) {

    // remove active class for clearing colour background
    $('.subjectName').removeClass('active');
    $('#subjectName' + subjectKey).addClass('active');

    $('.subjectArea').hide();
    $('#subjectArea' + subjectKey).show();
}

function setSubjectColour(clickedColour) {
    $('.colourOption').removeClass('chosenColour');
    $(clickedColour).addClass('chosenColour');
    if ($(clickedColour).hasClass('usedColour')) {
        var subjectName = $(clickedColour).data('subject-name');
        $('.colourMessage').text('Just letting you know, you\'re already using this colour for ' + subjectName);
    } else {
        $('.colourMessage').text('');
    }
}

// RETRIEVE ALL SUBJECTS' COLOUR-SCHEMES
function checkIsColourInUse() {
    fetchActiveSubjects(function(subjectsDict) {
        if (subjectsDict !== null) {
            // we're creating an object instead of an array for easier lookup
            var colourSchemesDict = {};
            $.each(subjectsDict, function(subjectKey, subjectData) {
                // we are setting the value to the subject's name, for retaining the option to display it in error message
                colourSchemesDict[subjectData.colour_scheme] = subjectData.name;
            });
            $('.colourOption').each(function() {
                var colour = $(this).data('colour-scheme');
                // if colour is already in use, set its div with .usedColour
                if (colourSchemesDict[colour]) {
                    $(this).addClass('usedColour');
                    var subjectName = (colourSchemesDict[colour]);
                    $(this).attr('data-subject-name', subjectName);
                }
            });
        }
    });
}
