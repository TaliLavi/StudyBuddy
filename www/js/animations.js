var ruzoDoneTimeline = new TimelineMax({paused:true});



function animateRuzoDone() {

    ruzoDoneTimeline.to("#eyesClosedMouthClosedDone",0, {
        opacity:0
    }, "+=.5") ;

    ruzoDoneTimeline.to("#eyesOpenMouthClosedDone", 1, {
        rotation    :   "0",
    }) ;


    ruzoDoneTimeline.to("#eyesClosedMouthClosedDone", 1, {
        rotation    :   "0",
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
        display         :   "table",
    }, "-=1.10");

    ruzoDoneTimeline.to("#tailDoneRuzo2", 2, {
        x               :   "22",
        y               :   "-13",
        rotation        :   "90",
        transformOrigin :   "80% 80%",
        ease            :   Back.easeOut.config(1), y: 0
    }, "-=1") ;

    console.log("ruzoDoneTimeline should be prepared");
    ruzoDoneTimeline.play();
}

function restartRuzoDone(){
    ruzoDoneTimeline.restart();
}