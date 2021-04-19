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

var currentProfile;

async function createRoom() {
    var hostName = $("#host-name").val();
    if (hostName != null && hostName != "") {
        console.log("Creating room with id:");
        const roomID = generateRoomId();
        var data = { answer: [], name: [], profile_pic: [], question: "", round: 0, score: [], isJudging: false };
        db.collection("roomID").doc(roomID).set(data).then(() => {
            addMember(hostName, roomID);
        })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });;
        console.log("Created Room with ID:" + roomID.toString())
    }
}

async function joinRoom(){
    var playerName = $("#player-name").val();
    var roomID = $("#room-id").val();
    console.log(roomID);
    if(playerName != null && playerName != ""){
        addMember(playerName, roomID);
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
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
    //console.log("data " + data);
    var nameList = data.name;
    //console.log("nameList " + nameList);
    if (checkNameExist(name, nameList)) {
        console.log("Name already exists.");
    } else if (!(checkNameExist(name, nameList))) {
        data.answer.push("");
        data.name.push(name);
        console.log(currentProfile);
        data.profile_pic.push(currentProfile);
        data.score.push(0);
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
    var x = document.getElementById("id02");
    if (window.getComputedStyle(x).display === "none") {
        x.style.display = "flex";
    }
    else {
        x.style.display = "none";
    }
}

function joinRoomPopUp() {
    var x = document.getElementById("id01");
    if (window.getComputedStyle(x).display === "none") {
        x.style.display = "flex";
    }
    else {
        x.style.display = "none";
    }
}

async function uploadProfilePicture(id){
    if(currentProfile == "" || currentProfile == null){
        var imageName = generateId(10);
        currentProfile = "randomize-"+imageName;
    }
    var file = document.getElementById(id).files[0];
    if(file != "" && file != null){
        console.log(file);
        //Declare Variables
        console.log(currentProfile);
        // Create a root reference
        var storageRef = firebase.storage().ref();
        // Create a reference to 'images/mountains.jpg'
        var imageRef = storageRef.child('profile_pictures/' + currentProfile + '.jpg');
        imageRef.put(file).then((snapshot) => {
            console.log('Uploaded a blob or file named: ' + currentProfile + " !");
            updateProfile("#"+id.slice(13,id.length)+"-image");
        });
    }else    console.log("No image selected");
}

function deleteProfilePicture(imageName) {
    console.log("Delete picture with name: "+imageName);
    // Create a reference to the file to delete
    var storageRef = firebase.storage().ref();
    var imageRef = storageRef.child('profile_pictures/' + imageName + '.jpg');
    // Delete the file
    imageRef.delete().then(() => {
        // File deleted successfully
        console.log("Deleted profile picture of "+imageName)
    }).catch((error) => {
        // Uh-oh, an error occurred!
    });
}

function updateProfile(id) {
    var storageRef = firebase.storage().ref();
    storageRef.child('profile_pictures/' + currentProfile + '.jpg').getDownloadURL().then(function (url) {
        console.log(url);
        $(id).attr("src",url);
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

function dec2hex (dec) {
    return dec.toString(16).padStart(2, "0")
}

function generateId (len) {
    var arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
}