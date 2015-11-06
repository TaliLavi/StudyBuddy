var ruzoDoneTimeline = new TimelineMax({paused:true});



function animateRuzoDone() {



    ruzoDoneTimeline.to("#eyesOpenMouthClosedDone", 1, {
        rotation    :   "0",
    }) ;

    ruzoDoneTimeline.to("#doneCircle", 2, {
        height          :   400,
        width           :   400,
        ease            :   Back.easeOut.config(2), y: 0

    });

    ruzoDoneTimeline.to("#tailDoneRuzo2", 2, {
        x               :   "22",
        y               :   "-13",
        rotation        :   "90",
        transformOrigin :   "80% 80%",
        ease            :   Back.easeOut.config(1), y: 0
    }, "-=1.75") ;

    console.log("ruzoDoneTimeline should be prepared");
    ruzoDoneTimeline.play();
}

function restartRuzoDone(){
    ruzoDoneTimeline.restart();
}