// CREATE NEW TASK
function createTask(subjectId) {

    // REGISTER DOM ELEMENTS
    var titleField = $('#taskTitle');
    var descriptionField = $('#taskDescription');

    // GET FIELD VALUES
    var title = titleField.val();
    var description = descriptionField.val();

    // SET DEFAULT VALUES (FOR SIMPLISITY AT THIS STAGE OF DEVELOPMENT)
    var assigned_date = "16/06/24";
    var time_estimation = 30;
    var creation_date = $.now();
    var status_change_date = creation_date;

    // PUSH THEM TO DB
    pushNewTask(subjectId, title, description, assigned_date, time_estimation, creation_date, status_change_date);

    // CLEAR INPUT FIELDS
    titleField.val('');
    descriptionField.val('');

    //// REFRESH SUBJECTS DISPLAY TO INCLUDE THE ONE THAT WAS JUST CREATED
    //fetchActiveTasks();
};
