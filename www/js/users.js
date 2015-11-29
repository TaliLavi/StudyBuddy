function prepareSignUp() {
    // GET FIELD VALUES
    var firstName = $('#firstNameInput').val();
    //var lastName = $('#lastNameInput').val();
    var lastName= "";
    var email = $('#signUpEmailInput').val();
    var password = $('#signUpPasswordInput').val();
    var confirmedPassword = $('#confirmPasswordInput').val();
    $('#signUpEmailErrorMessage').text('');
    $('#signUpPasswordErrorMessage').text('');
    $('#signUpEmailErrorTriangle').hide();
    $('#signUpPasswordErrorTriangle').hide();

    if (password !== confirmedPassword) {
        $('#signUpPasswordErrorMessage').text('The passwords must be identical.');
        $('#signUpPasswordErrorTriangle').show();
    } else {
        // password has to have a minimum of 6 characters
        if ($('#confirmPasswordInput').val().length >= 6) {
            signUpUser(firstName, lastName, email, password);
        } else {
            $('#signUpPasswordErrorMessage').text('The password must have at least 6 characters.');
            $('#signUpPasswordErrorTriangle').show();
        }
    }
}

function prepareLogIn() {

    // RUZO UNCOVERS EYES
    playRuzoLoginShow();

    // GET FIELD VALUES
    var email = $('#logInEmailInput').val();
    var password = $('#logInPasswordInput').val();

    // CLEAR ERROR MESSAGES
    $('#logInEmailErrorMessage').text('');
    $('#loginPasswordErrorTriangle').hide();
    $('#logInPasswordErrorMessage').text('');
    $('#loginEmailErrorTriangle').hide();

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
    logInUser(email, password, function(callback) {
        saveNewUser(newUser, uid, callback);
    });
};
