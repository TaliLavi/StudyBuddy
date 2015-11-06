var ruzoDoneTimeline = new TimelineMax({paused:true});



function animateRuzoDone() {



    //ruzoDoneTimeline.to("#eyesOpenMouthClosedDone", 1, {
    //    rotation    :   "5",
    //}) ;

    ruzoDoneTimeline.to("#doneCircle", 2, {
        scaleX          :   20,
        scaleY          :   20,
        ease            :   Back.easeOut.config(2), y: 0
    });

    //ruzoDoneTimeline.to("#tailDoneRuzo2", 2, {
    //    bottom          :   "-22px",
    //    right           :   "-13px",
    //    rotation        :   "90",
    //    transformOrigin :   "80% 80%",
    //    ease            :   Back.easeOut.config(1), y: 0
    //}, "-=1.75") ;

    console.log("ruzoDoneTimeline should be prepared");
    ruzoDoneTimeline.play();
}