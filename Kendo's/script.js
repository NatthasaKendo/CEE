function joinRoom() {
    var x = document.getElementById("join-room");
    if(window.getComputedStyle(x).display === "none") {
        x.style.display = "block";
    }
    else{
        x.style.display = "none";
    }
}