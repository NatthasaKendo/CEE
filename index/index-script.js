// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyCmIN_eGfPuTFaJk336JWA3WLDYtqrH1WI",
    authDomain: "tspk-cee-2021.firebaseapp.com",
    projectId: "tspk-cee-2021",
    storageBucket: "tspk-cee-2021.appspot.com",
    messagingSenderId: "291245415103",
    appId: "1:291245415103:web:c00d44912ad9c86e9f840a",
    measurementId: "G-RGMWM4R3HK"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//firebase.analytics();

const db = firebase.firestore();
//const test_name_ref = db.collection("test_name");

var currentProfile = "default" + Math.floor((Math.random() * 4) + 1);

$( document ).ready(function() {
    $("#helpButton").hover(function(){
        $("#helpButton img").css("filter", "invert(100%)");
    },function(){
        $("#helpButton img").css("filter", "invert(0%)");
    })
});

async function createRoom() {
    var hostName = $("#host-name").val();
    if (hostName == "" || hostName == null) {
        alert("Name cannot be blank.")
    } else {
        console.log("Creating room with id:");
        const roomID = generateRoomId();
        var data = { answer: [], name: [], profile_pic: [], question: "", round: 0, roundMax: 0, timer: 0, score: [], gameState: 0, chosenCard: 0, cardOrder: "", blank: 0, timerStop: 0, player: 0 };
        db.collection("roomID").doc(roomID).set(data).then(() => {
            addMember(hostName, roomID);
        })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });;
        console.log("Created Room with ID:" + roomID.toString())
    }
}


async function joinRoom() {
    var playerName = $("#player-name").val();
    if (playerName == "" || playerName == null) {
        alert("Name cannot be blank.")
    } else {
        var roomID = $("#room-id").val();
        console.log(roomID);
        if (playerName != null && playerName != "") {
            addMember(playerName, roomID);
        }
    }
}

async function addMember(name, roomID) {
    console.log("Adding member...");

    var docRef = db.collection("roomID").doc(roomID);
    var data;
    await docRef.get().then(async (doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            data = doc.data();
            console.log("Returning data" + data);
            return data;
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            alert("Room doesn't exist.");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
    //console.log("data " + data);
    var nameList = data.name;
    //console.log("nameList " + nameList);
    if(data.round != 0){
        alert("Cannot join a room that alredy started.")
    }else if (checkNameExist(name, nameList)) {
        alert("Name already exists.");
    } else if (!(checkNameExist(name, nameList))) {
        data.answer.push("");
        data.name.push(name);
        console.log(currentProfile);
        data.profile_pic.push(currentProfile);
        data.score.push(0);
        data.player += 1;
        //console.log(data.name);
        db.collection("roomID").doc(roomID).set(data).then(() => {
            console.log("Document successfully overwritten!");
            console.log("Added member as host with name: " + name);
            change_page("../joining-room/joining-room.html" + "?name=" + name + "&roomID=" + roomID);
        })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    }

}

function checkNameExist(newName, namesInData) {
    for (i = 0; i < namesInData.length; i++) {
        if (newName == namesInData[i]) return true;
    } return false;
}

function generateRoomId() {
    var id = "";
    for (i = 0; i < 4; i++) {
        var random = Math.floor(Math.random() * 10);
        id += random.toString();
    }
    console.log(id);
    return id;
}

function createRoomPopUp() {
    updateProfile("#host-image");
    var x = document.getElementById("id02");
    if (window.getComputedStyle(x).display === "none") {
        x.style.display = "flex";
    }
    else {
        x.style.display = "none";
    }
}

function joinRoomPopUp() {
    updateProfile("#player-image");
    var x = document.getElementById("id01");
    if (window.getComputedStyle(x).display === "none") {
        x.style.display = "flex";
    }
    else {
        x.style.display = "none";
    }
}

function helpPopUp() {
    var x = document.getElementById("id03");
    if (window.getComputedStyle(x).display === "none") {
        x.style.display = "flex";
    }
    else {
        x.style.display = "none";
    }
}

var updatingHostProfileStatus = false;
var updatingPlayerProfileStatus = false;

async function uploadProfilePicture(id) {
    //console.log("Ran uploadProfilePicture(id)")
    if (id == "image-upload-host") updatingHostProfileStatus = true;
    if (id == "image-upload-player") updatingPlayerProfileStatus = true;
    var file = document.getElementById(id).files[0];
    if (file != "" && file != null) {
        if (currentProfile.slice(0, 7) == "default" || currentProfile == "" || currentProfile == null) {
            var imageName = generateId(10);
            currentProfile = "randomize-" + imageName;
        }
        console.log(file);
        //Declare Variables
        console.log(currentProfile);
        // Create a root reference
        var storageRef = firebase.storage().ref();
        // Create a reference to 'images/mountains.jpg'
        var imageRef = storageRef.child('profile_pictures/' + currentProfile + '.jpg');
        imageRef.put(file).then((snapshot) => {
            console.log('Uploaded a blob or file named: ' + currentProfile + " !");
            updateProfile("#" + id.slice(13, id.length) + "-image");
        });
    } else alert("No image selected");
}

function deleteProfilePicture(imageName) {
    console.log("Delete picture with name: " + imageName);
    // Create a reference to the file to delete
    var storageRef = firebase.storage().ref();
    var imageRef = storageRef.child('profile_pictures/' + imageName + '.jpg');
    // Delete the file
    imageRef.delete().then(() => {
        // File deleted successfully
        console.log("Deleted profile picture of " + imageName)
    }).catch((error) => {
        // Uh-oh, an error occurred!
    });
}

function updateProfile(id) {
    var storageRef = firebase.storage().ref();
    storageRef.child('profile_pictures/' + currentProfile + '.jpg').getDownloadURL().then(function (url) {
        console.log(url);
        nudeCheckSendRequest(id, url);
    }).catch(function (error) {
    });
}

var loadFile = function (event) {
    var output = document.getElementById('output');
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function () {
        URL.revokeObjectURL(output.src) // free memory
    }
};

function change_page(fileNameInDotHtml) {
    window.location.href = fileNameInDotHtml;
}

function dec2hex(dec) {
    return dec.toString(16).padStart(2, "0")
}

function generateId(len) {
    var arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
}

async function nudeCheckSendRequest(id, url) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            // document.getElementById("display").innerHTML = JSON.parse(
            //     xhr.response
            // ).output.nsfw_score;
            result = JSON.parse(xhr.response).output;
            console.log(result);
            if (result.detections.length > 0) {
                alert("Profile Picture cannot contain nudity.")
                console.log("lewd");
                deleteProfile()
                document.getElementById("image-upload-host").value = null;
                document.getElementById("image-upload-player").value = null;
                updatingHostProfileStatus = false;
                updatingPlayerProfileStatus = false;
                document.getElementById("profile-status-host").innerHTML = "";
                document.getElementById("profile-status-player").innerHTML = "";
            }
            else if (result.detections.length <= 0) {
                console.log("safe");
                //document.getElementById("profile-status-host").innerHTML = "Profile picture updated.";
                if (currentProfile.slice(0, 7) != "default") {
                    if (id.slice(0, 5) == "#host") {
                        updatingHostProfileStatus = false;
                        document.getElementById("profile-status-host").innerHTML = "Profile picture updated.";
                    }
                    else if (id.slice(0, 5) == "#play") {
                        updatingPlayerProfileStatus = false;
                        document.getElementById("profile-status-player").innerHTML = "Profile picture updated.";
                    }
                    updatingProfileStatus = false;
                }
                $(id).attr("src", url);
            };
        }
    };

    xhr.open("POST", "https://api.deepai.org/api/nsfw-detector");
    xhr.setRequestHeader("api-key", "3478a5dd-416e-49f2-9310-876a3ec18b31");
    xhr.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded"
    );
    var imageUrl = encodeURI(url);
    var param = "image=" + imageUrl;
    xhr.send(param);
}

var audio = document.getElementById("song");
audio.volume = 0.2;

function deleteProfile() {
    // Create a reference to the file to delete
    var storageRef = firebase.storage().ref();
    var imageRef = storageRef.child('profile_pictures/' + currentProfile + '.jpg');

    // Delete the file
    imageRef.delete().then(() => {
        // File deleted successfully
        console.log("Deleted profile picture of " + currentProfile);
    }).catch((error) => {
        // Uh-oh, an error occurred!
    });
}

var waiting_count = 1;
setInterval(function () {
    var text = "Updating profile picture ";
    var text_with_dot = text + (".".repeat(waiting_count));
    if (updatingHostProfileStatus)
        document.getElementById("profile-status-host").innerHTML = text_with_dot;
    if (updatingPlayerProfileStatus)
        document.getElementById("profile-status-player").innerHTML = text_with_dot;
    waiting_count++;
    if (waiting_count == 4) waiting_count = 1;
}, 1000);

function blockSpecialChar(id) {
    console.log("Keypress");
    var name = $(id).val();
    console.log(name);
    var newname = "";
    for(i=0;i<name.length;i++){
        var c = name[i];
        console.log("Character is '" + c + "'");
        if(!(('a'<c && c<'z') || ('A'<c && c<'Z') || ('0'<c && c<'9'))){
            console.log("Wrong character");
            $("#special-charater-alert").css("display","block");
        }else   newname += c;
    }
    $(id).val(newname);
}

$( "#player-name" ).on('input propertychange',function(e) {
    var name = $(this).val();
    var newname = "";
    console.log(name);
    for(i=0;i<name.length;i++){
        var c = name[i];
        console.log("Character is '" + c + "'");
        if(!(('a'<c && c<'z') || ('A'<c && c<'Z') || ('0'<c && c<'9'))){
            console.log("Wrong character");
            $("#player-special-charater-alert").css("display","block");
        }else newname += c;
    }
    $(this).val(newname);
});

$( "#host-name" ).on('input propertychange',function(e) {
    var name = $(this).val();
    var newname = "";
    console.log(name);
    $("#host-special-charater-alert").css("display","none");
    for(i=0;i<name.length;i++){
        var c = name[i];
        console.log("Character is '" + c + "'");
        if(!(('a'<c && c<'z') || ('A'<c && c<'Z') || ('0'<c && c<'9'))){
            console.log("Wrong character");
            $("#host-special-charater-alert").css("display","block");
        }else   newname += c;
    }
    $(this).val(newname);
});