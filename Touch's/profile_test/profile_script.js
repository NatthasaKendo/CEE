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


function sendToFirebaseStorage() {
    //Declare Variables
    var name = document.getElementById("name").value;
    var roomID = document.getElementById("roomID").value;
    var imageName = roomID + "-" + name;
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

function updateProfile() {
    var name = document.getElementById("name").value;
    var roomID = document.getElementById("roomID").value;
    var imageName = roomID + "-" + name;
    var storageRef = firebase.storage().ref();
    storageRef.child('profile_pictures/' + imageName + '.jpg').getDownloadURL().then(function (url) {
        var test = url;
        document.getElementById("profile_image").src = test;
    }).catch(function (error) {

    });

}