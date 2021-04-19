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
var cardCount = 0;
getUrlVars();

db.collection("roomID").doc(roomID).onSnapshot((doc) => {
    console.log("Current data: ", doc.data());
    //refreshRoom();
});

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    player = vars["name"];
    roomID = vars["roomID"];
    console.log(player);
    console.log(roomID);
}

async function initializeRoom(){
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
    var playerCount = data.name.length;
    var judge = (data.round-1)%playerCount
    $("#player-count").html(playerCount);
    $("#player-list").html("<tr><th></th><th>Player</th><th></th><th>Score</th></tr>");
    for(i=0 ; i<playerCount ; i++){
        var profileURL = data.profile_pic[i];
        var name = data.name[i];
        var judgeState = (i==judge)?   "(Judge)" : "";
        var score = data.score[i];
        var tempURL = ""
        var storageRef = firebase.storage().ref();
        await storageRef.child('profile_pictures/' + profileURL + '.jpg').getDownloadURL().then(function (url) {
            tempURL = url;
        }).catch(function (error) {
        });
        $("#player-list").append("<tr><td><img src='" + tempURL + "' class='profile-container'></td><td>"+name+"</td><td>"+judgeState+"</td><td>"+score+"</td></tr>");
    }
    if(data.name[judge]==player){
        $("#player-choosing").css("display","none");
    }else{
        $("#judge-waiting").css("display","none");
        generateCard();
    }
    console.log(data.name[judge]);
    console.log(player);
}

function generateCard(){
    for(i=0;i<3;i++){
        $("#white-card-option").find("tr:last").before("<tr><td id='card-'" +i+"'>Suppose to generate some card here-" + i + "</td><td><button id='choose-card-"+i+"'type='button' onclick='chooseCard(this)'>Choose</button></td></tr>");
    }
    cardCount = 3;
}

function addCard(){
    cardCount += 1;
    $("#white-card-option").find("tr:last").before("<tr><tdid='card-'" +cardCount+"'>" + $("#add-card").val() + "</td><td><button id='choose-card-"+cardCount+"'type='button' onclick='chooseCard(this)'>Choose</button></td></tr>");
    console.log("Added carnd with content :" + $("#add-card").val());
}

async function chooseCard(button){
    console.log($(button).attr("id"));
    var cardID = $(button).attr("id").slice(7,$(button).attr("id").length);
    console.log(cardID);
}

async function check(){
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
    console.log(data.round);
}
