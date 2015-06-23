// SAVE DB ROOT AS GLOBAL VARIABLE
FIREBASE_ROOT = "https://studybuddyapp.firebaseio.com";

// ADD NEW USER TO THE DB
function pushNewUser(first_name, last_name, email, study_session_minutes, short_break_minutes, long_break_minutes) {
    // CREATE A REFERENCE TO FIREBASE
    var usersRef = new Firebase(FIREBASE_ROOT + '/Users');

    //SAVE DATA TO FIREBASE
    var newUserRef =  usersRef.push({
        first_name:first_name,
        last_name:last_name,
        email:email,
        study_session_minutes:study_session_minutes,
        short_break_minutes:short_break_minutes,
        long_break_minutes:long_break_minutes,
        // SET A FALSY VALUE (0) UNTIL WE HAVE ACTUAL DATA TO THROW INTO "Subjects"
        // (MEANING UNTIL THE USER CREATES THEIR OWN SUBJECTS).
        // ONCE THE USER CREATES A SUBJECT, A PUSH COMMEND SUCH AS
        // subjectsRef.push({title: "Irish"}); WILL OVERIDE THE FALSY VALUE.
        Subjects:0
    });
};

// RETRIEVE AND DISPLAY ALL USERS INFORMATION UPON REQUEST
function fetchAllUsers() {
    var usersRef = new Firebase(FIREBASE_ROOT + '/Users');
    var users = [];
    // WE CAN ALWAYS ADD .limitToLast(10) TO usersRef IF WE'D WANT TO DISPLAY JUST THE FIRST 10 USERS.
    usersRef.once("value", function(snapshot) {
        $.each(snapshot.val(), function(key, value){
            users.push(value)
        });
        displayAllUsers(users);
    });
}

// RETRIEVE AND DISPLAY ALL USERS INFORMATION INSTANTLY WHEN PAGE FINISHES LOADING
$(document).ready(function(){
    var usersRef = new Firebase(FIREBASE_ROOT + '/Users');
    var users = [];
    usersRef.once("value", function(snapshot) {
        $.each(snapshot.val(), function(key, value){
            users.push(value)
        });
        displayAllUsers(users);
    });
});


