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
const dbs = firebase.storage();
//const test_name_ref = db.collection("test_name");


async function sendToFirebaseStorage() {
    //Declare Variables
    var name = document.getElementById("name").value;
    var roomID = document.getElementById("roomID").value;
    var imageName = roomID + "-" + name;
    // Check nudes
    //nude_check();
    // Create a root reference
    var storageRef = firebase.storage().ref();
    // Create a reference to 'images/mountains.jpg'
    var imageRef = storageRef.child('profile_pictures/' + imageName + '.jpg');
    var file = document.getElementById("file").files[0];
    imageRef.put(file).then((snapshot) => {
        console.log('Uploaded a blob or file named: ' + imageName + " !");
    });
}

function deleteProfile() {
    // Create a reference to the file to delete
    var name = document.getElementById("name").value;
    var roomID = document.getElementById("roomID").value;
    var imageName = roomID + "-" + name;
    var storageRef = firebase.storage().ref();
    var imageRef = storageRef.child('profile_pictures/' + imageName + '.jpg');

    // Delete the file
    imageRef.delete().then(() => {
        // File deleted successfully
        console.log("Deleted profile picture of " + name + " of Room ID " + roomID)
    }).catch((error) => {
        // Uh-oh, an error occurred!
    });
}

async function updateProfile() {
    var name = document.getElementById("name").value;
    var roomID = document.getElementById("roomID").value;
    var imageName = roomID + "-" + name;
    var storageRef = firebase.storage().ref();
    storageRef.child('profile_pictures/' + imageName + '.jpg').getDownloadURL().then(async url => {
        nudeCheckSendRequest(url);
        // console.log(result);
        // if (result == "safe") {
        //     console.log("safe");
        //     var test = url;
        //     document.getElementById("profile_image").src = test;
        // }
        // else if (result == "lewd") {
        //     console.log("lewd");
        //     document.getElementById("lewd").innerHTML = "That's lewd";
        // }

    }).catch(error => {
        console.log(error);
    });

}

// AI Stuffs
async function nudeCheckSendRequest(url) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            // document.getElementById("display").innerHTML = JSON.parse(
            //     xhr.response
            // ).output.nsfw_score;
            result = JSON.parse(xhr.response).output;
            console.log(result);
            if (result.detections.length > 0) {
                console.log("lewd");
                document.getElementById("lewd").innerHTML = "That's lewd";
            }
            else if (result.detections.length <= 0) {
                console.log("safe");
                var test = url;
                document.getElementById("profile_image").src = test;
                document.getElementById("lewd").innerHTML = "That's safe"
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
