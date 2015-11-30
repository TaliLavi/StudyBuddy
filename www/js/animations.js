var ruzoDoneTimeline = new TimelineMax({paused:true });

function prepareDoneRuzo() {
    ruzoDoneTimeline.to("#eyesClosedMouthClosedDone",0, {
        opacity:0
    }, "+=.5") ;

    ruzoDoneTimeline.to("#eyesOpenMouthClosedDone", 1, {
        rotation    :   "0",
        transformOrigin :   "50% 50%",
    }) ;

    ruzoDoneTimeline.to("#eyesClosedMouthClosedDone", 1, {
        rotation    :   "0",
        transformOrigin :   "50% 50%",
    }, "-=1") ;

    ruzoDoneTimeline.to("#eyesOpenMouthOpenDone",0, {
        opacity:1
    }) ;


    ruzoDoneTimeline.to("#doneCircle", 1, {
        height          :   400,
        width           :   400,
        ease            :   Back.easeOut.config(2), y: 0

    }, "-=1");

    ruzoDoneTimeline.to("#doneMessageCircle", 1, {
        height          :   220,
        width           :   220,
        ease            :   Back.easeOut.config(2), y: 0,
        display         :   "table"
    }, "-=1.10");

    ruzoDoneTimeline.to("#tailDoneRuzo2", 2, {
        x               :   "22",
        y               :   "-13",
        rotation        :   "90",
        transformOrigin :   "80% 80%",
        ease            :   Back.easeOut.config(1), y: 0
    }, "-=1") ;

    ruzoDoneTimeline.to("#doneMessageCircle", 1, {
        opacity         :   0,
    });

    ruzoDoneTimeline.to("#doneRuzoFox", 1, {
        opacity         :   0,
    }, "-=1");

    ruzoDoneTimeline.to("#doneCircle", 1, {
        height          :   20,
        width           :   20,
        ease            :   Back.easeOut.config(2), y: 0

    }, "-=1");

    ruzoDoneTimeline.to("#doneRuzoDiv", 0, {
            display         :   "none"
        }
    )
}

function playRuzoDone() {
    ruzoDoneTimeline.pause(0);
    $('#doneRuzoDiv').css('display', 'block');
    ruzoDoneTimeline.play();
}


var ruzoLoginTimeline = new TimelineMax({paused:true });

function prepareLoginRuzo(){

    ruzoLoginTimeline.to("#headLoginRuzo", 0, {
        opacity: 0
    })

    ruzoLoginTimeline.to("#tailLoginRuzo",.3, {
        rotation        :   "-120",
        transformOrigin :   "50% 20%",
        ease            :   Power3.easeInOut, y: 0
    })
}

function playRuzoLoginHide() {
    console.log("This is inside the function playRuzoLoginHide");
    ruzoLoginTimeline.play();
}

function playRuzoLoginShow() {
    ruzoLoginTimeline.reverse(0);
}