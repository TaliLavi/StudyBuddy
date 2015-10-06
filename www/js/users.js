// CREATE NEW USER
function createUser() {
    // GET FIELD VALUES
    var firstName = $('#firstNameInput').val();
    var lastName = $('#lastNameInput').val();
    var email = $('#emailInput').val();

    // SET DEFAULT TIME INTERVALS
    var studySessionMinutes = 25;
    var shortBreakMinutes = 5;
    var longBreakMinutes = 15;

    // PUSH THEM TO DB
    pushNewUser(firstName, lastName, email, studySessionMinutes, shortBreakMinutes, longBreakMinutes);
    // CLEAR INPUT FIELDS
    $('#firstNameInput').val('');
    $('#lastNameInput').val('');
    $('#emailInput').val('');
};

function prepareLogIn() {
    // GET FIELD VALUES
    var email = $('#logInEmailInput').val();
    var password = $('#logInPasswordInput').val();

    logInUser(email, password);

    // CLEAR INPUT FIELDS
    $('#logInPasswordInput').val('');
}

function prepareSignUp() {
    // GET FIELD VALUES
    var email = $('#signUpEmailInput').val();
    var password = $('#signUpPasswordInput').val();
    var fullName = $('#fullNameInput').val();

    signUpUser(fullName, email, password);

    // CLEAR INPUT FIELDS
    $('#logInEmailInput').val('');
    $('#logInPasswordInput').val('');
}
