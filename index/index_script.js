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

function addName() {
    console.log("Add name");
    const name = document.getElementById('name').value;
    console.log(name);
    db.collection("test_name").add({
        name: name,
    })
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });

}

function createRoom(hostName) {
    console.log("Create room");
    const id = generateRoomId();
    console.log(id);
    var data = { answer: [], name: [], profile_pic: [], question: "", round: 0, score: [] };
    db.collection("roomID").doc(id).set(data);
    console.log("Created Room with ID:" + id.toString())
    addMember(hostName, id);

}

function addMember(name, roomID) {
    console.log("Add member");
    var data = db.collection("roomID").doc(roomID).get();
    var nameList = data[name];
    if (checkNameExist(name, nameist)) {
        console.log("Name already exists.");
    } else if (!(checkNameExist(name, nameist))) {
        data[answer].push("");
        data[name].push(name);
        data[profile_pic].push("");
        data[score].push(0);
        db.collection("roomID").doc(roomID).set(data).then(() => {
            console.log("Document successfully overwritten!");
            console.log("Added member as host with name: " + name);
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

$(document).ready(function () {
    /*For Jquery Script */

    $("#join-btn").on({
        mouseenter: function () {
            $("#join-room").show();
        },
        mouseleave: function () {
            $("#join-room").hide();
        },
    })

})