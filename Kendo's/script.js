function joinRoom() {
    var x = document.getElementById("id01");
    if(window.getComputedStyle(x).display === "none") {
        x.style.display = "flex";
    }
    else{
        x.style.display = "none";
    }
}