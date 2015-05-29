
//Make these things happen each time the page finishes loading
function preparePage() {
    //set up drag and drop for each list
    $(".list-of-cards").each(function(i, list){
        Sortable.create(list, {group: "stuff", onEnd: sayHi, animation: 200});
    })
}

function sayHi() {
    console.log("Hi!")
}