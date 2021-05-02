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

var player = "";
var roomID = "";
getUrlVars();

db.collection("roomID").doc(roomID).onSnapshot((doc) => {
    console.log("Current data: ", doc.data());
    refreshRoom();
});

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    player = vars["name"];
    roomID = vars["roomID"];
    console.log(player);
    console.log(roomID);
}

async function refreshRoom() {
    $("#room-id").html(roomID)
    var docRef = db.collection("roomID").doc(roomID);
    var data;
    var host = false;
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
    if(data != null){
        var playerCount = data.name.length;
        $("#player-count").html(playerCount);
        $("#player-list").html("");
        for (i = 0; i < playerCount; i++) {
            var profileURL = data.profile_pic[i];
            var name = data.name[i];
            if (i == 0) {
                name += " (host)"
            }
            var tempURL = ""
            var storageRef = firebase.storage().ref();
            await storageRef.child('profile_pictures/' + profileURL + '.jpg').getDownloadURL().then(function (url) {
                tempURL = url;
            }).catch(function (error) {
            });
            $("#player-list").append("<tr><td><img src='" + tempURL + "' class='profile-container'></td><td>" + name + "</td></tr>");
        }
        console.log(data.name[0])
        console.log(player)
        if (data.name[0] == player) host = true;
        if (host) {
            $("#host-joining-room").css("display", "block");
        } else {
            $("#player-joining-room").css("display", "block");
        }
        console.log(data.round);
        if ((!host) && data.round == 1) {
            change_page();
        }
    }
}

async function startGame() {
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
    if ($("#round-max").val() > 0) {
        data.round = 1;
        data.roundMax = $("#round-max").val() * data.name.length;
        console.log(data.round);
        db.collection("roomID").doc(roomID).set(data).then(() => {
            console.log("Document successfully overwritten!");
            console.log("Round: 1");
            change_page();
        })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    } else alert("Round must be at least 1.")

}

async function leaveRoom(){
    console.log("Leaving room...");

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
    var idx = 0;
    for(i=0;i<data.name.length;i++){
        if(data.name[i]==player){
            idx = i;
            break;
        }
    }
    if(data.name.length==1)  deleteRoom();
    else{
        data.answer.splice(idx, 1);
        data.name.splice(idx, 1);
        data.profile_pic.splice(idx, 1);
        data.score.splice(idx, 1);
        db.collection("roomID").doc(roomID).set(data).then(() => {
            console.log("Document successfully overwritten!");
            console.log("Player " + player + " has leave the room.");
            window.location.href = "../index/index.html";
        })
        .catch((error) => {
                console.error("Error writing document: ", error);
        });
    }
}

var loadFile = function (event) {
    var output = document.getElementById('output');
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function () {
        URL.revokeObjectURL(output.src) // free memory
    }
};

async function deleteRoom() {
    db.collection("roomID").doc(roomID).delete().then(() => {
        console.log("Document " + roomID + " successfully deleted!");
        window.location.href = "../index/index.html";
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
}

function change_page() {
    console.log("test");
    window.location.href = "../playing-room/playing-room.html" + "?name=" + player + "&roomID=" + roomID;
}

var waiting_count = 1;
setInterval(function () {
    var text = "Waiting for host to start ";
    var text_with_dot = text + (".".repeat(waiting_count));
    document.getElementById("waiting").innerHTML = text_with_dot;
    waiting_count++;
    if (waiting_count == 4) waiting_count = 1;
}, 1000);