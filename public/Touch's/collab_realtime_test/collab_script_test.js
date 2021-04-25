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

db.collection("test_name").doc("point")
    .onSnapshot((doc) => {
        console.log("Current data: ", doc.data());
        updatePointToHtml(doc.data().point);
    });


function addPoint() {
    var docRef = db.collection("test_name").doc("point");

    docRef.get().then((doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            var oldPoint = doc.data().point;
            var newPoint = oldPoint + 1;
            docRef.set({ point: newPoint });
            updatePointToHtml(newPoint);
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

}

function resetPoint() {
    var docRef = db.collection("test_name").doc("point");
    docRef.set({ point: 0 });
    updatePointToHtml(0);

}

function updatePointToHtml(point) {
    document.getElementById("point").innerHTML = point.toString();
}