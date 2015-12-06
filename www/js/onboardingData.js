ONBOARDING_SUBJECTS = {
    "-K3L6Z5hDkbUy8nkL_ZS" : {
        "colour_scheme" : "theme1Colour5",
        "is_deleted" : 0,
        "name" : "Introduction"
    },
    "-K3L6bogRzPyU974X9rL" : {
        "colour_scheme" : "theme1Colour7",
        "is_deleted" : 0,
        "name" : "Your Tasks"
    },
    "-K3L6eXNO1qN587xlUvW" : {
        "colour_scheme" : "theme1Colour11",
        "is_deleted" : 0,
        "name" : "Your Subjects"
    },
    "-K3LC23IdA-pZHVafUyy" : {
        "colour_scheme" : "theme1Colour1",
        "is_deleted" : 0,
        "name" : "Your Progress"
    }
};

ONBOARDING_TASKS = {
    "active" : {
        "-K3L6Z5hDkbUy8nkL_ZS" : {
            "$MONDAY" : {
                "-K3L7aIs8ZkxZ-HWdQpQ" : {
                    "assigned_date" : "$MONDAY",
                    "creation_date" : 1447775331647,
                    "description" : "Welcome, friend :) . Here is your first tip: organise your study into tasks like this one to help you plan your study.",
                    "status_change_date" : 1447775331647,
                    "title" : "Click me!"
                },
                "-K3LBBpNqnJR6ls9Hc3X" : {
                    "assigned_date" : "$TUESDAY",
                    "creation_date" : 1447776275875,
                    "description" : "In there are all the tasks you have created without a date - all ready to be dragged onto your timetable!",
                    "status_change_date" : 1447776275875,
                    "title" : "Click on 'Schedule Me' under the calendar!"
                }
            },
            "no_assigned_date" : {
                "-K3LFg64yrOTrRd23Yb1" : {
                    "assigned_date" : "",
                    "creation_date" : 1447777452560,
                    "description" : "This task is waiting to be scheduled. Go ahead, drag it onto the calendar!",
                    "status_change_date" : 1447777452560,
                    "title" : "This is a task for later"
                }
            }
        },
        "-K3L6bogRzPyU974X9rL" : {
            "$MONDAY" : {
                "-K3L7pe_GKTzdKaTKIjd" : {
                    "assigned_date" : "$WEDNESDAY",
                    "creation_date" : 1447775394543,
                    "description" : "When you want to study a task, start its timer. You'll have a 25 minutes study session, followed by a 5 minutes break.",
                    "status_change_date" : 1447775394543,
                    "title" : "Studying a task"
                },
                "-K3LHPYekpZ6xqel3iH8" : {
                    "assigned_date" : "$THURSDAY",
                    "creation_date" : 1447777904948,
                    "description" : "When you're finished studying a task, just click the 'Mark as Done' button below. Try it now and see what happens!",
                    "status_change_date" : 1447777904948,
                    "title" : "Finished a task?"
                }
            }
        },
        "-K3L6eXNO1qN587xlUvW" : {
            "$MONDAY" : {
                "-K3LANW8AfqdzCPIbC9j" : {
                    "assigned_date" : "$FRIDAY",
                    "creation_date" : 1447776061588,
                    "description" : "You can list all of your subjects in the subjects area. You can delete our example ones, or just change the names!",
                    "status_change_date" : 1447776061588,
                    "title" : "Add your own subjects"
                },
                "-K3LCZooatcSET3LXDkT" : {
                    "assigned_date" : "$SATURDAY",
                    "creation_date" : 1447776636285,
                    "description" : "You can use the subject area to make a list of everything you need to cover so that you don't miss a thing!",
                    "status_change_date" : 1447776636285,
                    "title" : "Big test coming up?"
                }
            }
        },
        "-K3LC23IdA-pZHVafUyy" : {
            "$MONDAY" : {
                "-K3LCReWpF7uVke4GoR0" : {
                    "assigned_date" : "$SUNDAY",
                    "creation_date" : 1447776602860,
                    "description" : "The progress area keeps track of how many tasks you have done, so that you can look back and feel proud!",
                    "status_change_date" : 1447776602860,
                    "title" : "Track your achievements!"
                }
            }
        }
    }
};

function getOnboardingSubjects(){
    return ONBOARDING_SUBJECTS;
}

// fill current dates into the ONBOARDING_TASKS
function getOnboardingTasks() {
    var onboardingTasksTemplate = JSON.stringify(ONBOARDING_TASKS);
    var weekStart = new Date(startOfWeek(new Date()));
    return JSON.parse(onboardingTasksTemplate.replace(/\$MONDAY/g,    formatDate(weekStart))
                                             .replace(/\$TUESDAY/g,   formatDate(new Date(weekStart).setDate(weekStart.getDate() + 1)))
                                             .replace(/\$WEDNESDAY/g, formatDate(new Date(weekStart).setDate(weekStart.getDate() + 2)))
                                             .replace(/\$THURSDAY/g,  formatDate(new Date(weekStart).setDate(weekStart.getDate() + 3)))
                                             .replace(/\$FRIDAY/g,    formatDate(new Date(weekStart).setDate(weekStart.getDate() + 4)))
                                             .replace(/\$SATURDAY/g,  formatDate(new Date(weekStart).setDate(weekStart.getDate() + 5)))
                                             .replace(/\$SUNDAY/g,    formatDate(new Date(weekStart).setDate(weekStart.getDate() + 6))));
}
