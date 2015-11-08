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
    $('#subjectInput').append('<option selected="true" disabled="disabled">Choose a Subject</option>');
    $('#taskSubject').append('<option selected="true" disabled="disabled">Choose a Subject</option>');

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
            var boxLength = (subjectData.name.length)+1;
            // In subjects page, create a subjectArea for each subject. This is where tasks for that subject would eventually appear.
            $('#tasksPerSubject').append(
                '<div class="subjectArea secondaryColour ' + subjectData.colour_scheme + '" id="subjectArea' + subjectKey + '">' +
                    '<input id="subjectNameTitle' + subjectKey + '" class="subjectHeaderOnSubjectPage" size="'+ boxLength +'"  value="' + subjectData.name + '" data-subject-name="' + subjectData.name + '">' +
                    '<p class ="tasksHeaderOnSubjectPage">Tasks</p>'+
                    '<div class="editColour ' + subjectData.colour_scheme + ' mainColour" data-subjectid="' + subjectKey + '" data-colour-scheme="' + subjectData.colour_scheme + '"></div>' +
                    '<img src="img/binIcon.png" class="binIcon">'+
                    '<img src="img/pencilIcon.png" class="pencilIcon" onclick="focusOnTitle(\'' + subjectKey + '\')">'+
                    '<div class="bulkWrapper">' +
                        '<input class="bulkText" type="textbox" placeholder="Add a new task..." data-subjectid="' + subjectKey + '" maxlength="45">' +
                        '<button class="bulkSubmit ' + subjectData.colour_scheme + '" onclick="createTaskFromSubjectPage(\'' + subjectKey + '\')">Add Task</button>' +
                    '</div>' +
                    '<div class="todoWrapper" id="tasksFor' + subjectKey + '"></div>' +
                    '<button type="button" class="completedTasksButton closed" onclick="fetchAndDisplayCompletedTasks(\'' +
                    subjectKey + '\');">Show completed tasks</button>' +
                    '<div class="todoWrapper complete" id="completedTasksFor' + subjectKey + '"></div>' +
                '</div>'
            );

            // edit subject's name on input field's blur
            $('.subjectHeaderOnSubjectPage').blur(function(){
                editSubjectName(subjectKey);
            });

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
            var subjectId = $(this).data('subjectid');
            // if this click will make #colourPalette visible:
            if ($('#colourPalette').is(':hidden')) {
                // select this subject's colour by default
                var subjectColour = $(this).data('colour-scheme');
                var subjectColourDiv = $("#colourPalette").find('[data-colour-scheme="' + subjectColour + '"]');
                subjectColourDiv.addClass('chosenColour');
                // position colour palette menu next to the editColour button
                //var offset = $(this).offset();
                //var positionEditColour = $('.editColour').offset().left;
                ////console.log(positionEditColour);
                //var leftPositionPalette = positionEditColour - 110;
                //$('#colourPalette').css('left', leftPositionPalette);
                //$('#colourPalette').css('top',offset.top + 80);

                setCloseWhenClickingOutside($('#colourPalette'));

                $('#changeColourButton').on("click", function(){
                    changeSubjectColour(subjectId);
                });

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

function editSubjectName(subjectId) {
    var originalName = $('#subjectNameTitle' + subjectId).data('subject-name');
    var newName = $('#subjectNameTitle' + subjectId).val();
    if (originalName !== newName) {
        // change in the database
        changeSubjectName(subjectId, newName);
        // change data attribute to new name
        $('#subjectNameTitle' + subjectId).data('subject-name', newName);
        // change subject title on subject area
        $('#subjectNameTitle' + subjectId).val(newName);
        // change subject name in subjects left panel
        $('#subjectName' + subjectId).text(newName);
        // change subject name in the "add new task" drop down menu
        $('#subjectInput option[value="'+ subjectId + '"]').text(newName);
    }
}

function focusOnTitle(subjectId) {
    // focus on title's input field
    $('#subjectNameTitle' + subjectId).focus();
    // Select input field contents
    //$('#subjectNameTitle' + subjectId).select();
}


function hideColourPalette() {
    // prevent document from continueing to listen to clicks outside the modal container.
    if (isMobile()) {
        $(document).off('touchend');
    } else {
        $(document).off('mouseup');
    }
    // Clear old onclick handler
    $('#changeColourButton').off("click");
    // hide and clear colourPalette
    $('#colourPalette').hide().css("height", 210);
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
        //Put the tween animation here
        TweenMax.to($('#colourPalette'),.2, {height:280, ease:"Bounce.easeOut"});
        $('.colourMessage').text('You\'re already using this colour for ' + subjectName + ', is that okay?');
        $('#submitNewSubject').html("Okay, &nbsp; Add Subject");
    } else {
        TweenMax.to($('#colourPalette'),.2, {height:210, ease:"Bounce.easeOut"});
        $('.colourMessage').text('');
        $('#submitNewSubject').text("Add Subject");
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
                    $(this).data('subject-name', subjectName);
                }
            });
        }
    });
}


function changeSubjectColour(subjectId) {
    var newColour = $('.chosenColour').data('colour-scheme');
    // update datbase
    updateSubjectColour(subjectId, newColour);

    // if it wasn't already a used colour, make to be one now.
    if (!$('.chosenColour').hasClass('usedColour')) {
        $('.chosenColour').addClass('usedColour');
    }

    // change colour picker button's background colour and data attribute
    var editColourButton = $('#subjectArea' + subjectId).find('.editColour');
    $(editColourButton).removeClassPrefix('theme');
    $(editColourButton).addClass(newColour);
    $(editColourButton).data('colour-scheme', newColour);
    // change font colour for subject's name on left panel
    $('#subjectName' + subjectId).removeClassPrefix('theme');
    $('#subjectName' + subjectId).addClass(newColour);
    // change background colour for subject area
    $('#subjectArea' + subjectId).removeClassPrefix('theme');
    $('#subjectArea' + subjectId).addClass(newColour);
    // change font colour for the add a task button in subject page
    $('#subjectArea' + subjectId).find('.bulkSubmit').removeClassPrefix('theme');
    $('#subjectArea' + subjectId).find('.bulkSubmit').addClass(newColour);
    // change text colour on tasks in subject area
    var titleElements = $('#tasksFor' + subjectId).find('span');
    titleElements.removeClassPrefix('theme');
    titleElements.addClass(newColour);
    // change cards colour in the calendar
    var cards = $('.sortable-task-list').find('[data-subjectid="' + subjectId + '"] > div');
    cards.removeClassPrefix('theme');
    cards.addClass(newColour);

    // hide colour picker widget
    hideColourPalette();
}

