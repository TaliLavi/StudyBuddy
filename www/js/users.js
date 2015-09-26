// CREATE NEW USER
function createUser() {

    // REGISTER DOM ELEMENTS
    var emailField = $('#emailInput');
    var firstNameField = $('#firstNameInput');
    var lastNameField = $('#lastNameInput');

    // GET FIELD VALUES
    var firstName = firstNameField.val();
    var lastName = lastNameField.val();
    var email = emailField.val();

    // SET DEFAULT TIME INTERVALS
    var studySessionMinutes = 25;
    var shortBreakMinutes = 5;
    var longBreakMinutes = 15;

    // PUSH THEM TO DB
    pushNewUser(firstName, lastName, email, studySessionMinutes, shortBreakMinutes, longBreakMinutes);
    // CLEAR INPUT FIELDS
    firstNameField.val('');
    lastNameField.val('');
    emailField.val('');

    // REFRESH USERS DISPLAY TO INCLUDE THE ONE THAT WAS JUST CREATED
    fetchActiveUsers(displayAllUsers);
};

// DISPLAY USERS INFORMATION
function displayAllUsers(users) {
    // CLEAR CURRENT DISPLAY OF USERS
    $('#allUsersDiv').text('');

    users.forEach(function (user){
        $('<div/>').text(user.email).prepend($('<strong/>').text(user.first_name + ' ' + user.last_name + ': ')).appendTo($('#allUsersDiv'));
    })
};


// RETRIEVE AND DISPLAY ALL USERS INFORMATION INSTANTLY WHEN PAGE FINISHES LOADING
$(document).ready(function(){
    fetchActiveUsers(displayAllUsers);
});