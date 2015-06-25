// CREATE NEW CHECKLIST ITEM
function createChecklistItem(currentSubject, currentTask) {

    // REGISTER DOM ELEMENTS
    var checklistItemField = $('#checklistItem');

    // GET FIELD VALUES
    var checklistItemText = checklistItemField.val();

    // SET DEFAULT VALUES (FOR SIMPLISITY AT THIS STAGE OF DEVELOPMENT)
    var is_complete = "0";

    // PUSH THEM TO DB
    pushNewChecklistItem(getActiveUser(), currentSubject, currentTask, checklistItemText, is_complete);

    // CLEAR INPUT FIELDS
    checklistItemField.val('');
};

