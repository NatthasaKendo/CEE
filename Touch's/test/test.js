document.getElementById
function countBlank(text) {
    var blank = "____";
    var array = text.split(blank)
    console.log(array)
    console.log(array.length - 1)
    return array.length - 1
}