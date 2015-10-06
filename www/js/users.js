function prepareSignUp() {
    // GET FIELD VALUES
    var firstName = $('#firstNameInput').val();
    var lastName = $('#lastNameInput').val();
    var email = $('#signUpEmailInput').val();
    var password = $('#signUpPasswordInput').val();
    var confirmedPassword = $('#confirmPasswordInput').val();

    if (password !== confirmedPassword) {
        $('#signUpPasswordErrorMessage').text('The passwords must be identical.');
    } else {
        // CLEAR ERROR MESSAGE FIELDS
        $('#signUpPasswordInput').val('');
        $('#confirmPasswordInput').val('');
        $('#signUpEmailErrorMessage').text('');
        $('#signUpPasswordErrorMessage').text('');
        signUpUser(firstName, lastName, email, password);
    }
}


function prepareLogIn() {
    // GET FIELD VALUES
    var email = $('#logInEmailInput').val();
    var password = $('#logInPasswordInput').val();

    // CLEAR INPUT FIELDS
    $('#logInPasswordInput').val('');
    $('#logInEmailErrorMessage').text('');
    $('#logInPasswordErrorMessage').text('');

    logInUser(email, password);
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
