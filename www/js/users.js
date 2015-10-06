function prepareSignUp() {
    // GET FIELD VALUES
    var email = $('#signUpEmailInput').val();
    var password = $('#signUpPasswordInput').val();
    var firstName = $('#firstNameInput').val();
    var lastName = $('#lastNameInput').val();

    signUpUser(firstName, lastName, email, password);

    // CLEAR INPUT FIELDS
    $('#logInPasswordInput').val('');
}


function prepareLogIn() {
    // GET FIELD VALUES
    var email = $('#logInEmailInput').val();
    var password = $('#logInPasswordInput').val();

    logInUser(email, password);

    // CLEAR INPUT FIELDS
    $('#logInPasswordInput').val('');
}


// CREATE NEW USER
function createUser(firstName, lastName, email, password, uid) {
    var newUser = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        // SET DEFAULT TIME INTERVALS
        study_session_minutes: 25,
        short_break_minutes: 5,
        long_break_minutes: 15
    };

    // LOG-IN THE USER, AND AFTERWARDS PUSH THEM TO DB
    logInUser(email, password, function() {
        saveNewUser(newUser, uid);
    });
};
