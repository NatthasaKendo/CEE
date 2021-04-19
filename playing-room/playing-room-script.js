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
var playerSlot = 0;
getUrlVars();

var isGenerated = false;
var cardCount = 0;
var chosenCard = "";
var isJudge = false;

db.collection("roomID").doc(roomID).onSnapshot((doc) => {
    console.log("Current data: ", doc.data());
    refreshRoom();
});

async function refreshRoom(){
    // Get data from firebase
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
    $("#judge-waiting").css("display","none");
    $("#player-choosing").css("display","none");
    $("#judging").css("display","none");
    $("#waiting").css("display","none");
    $("#next-round").css("display","none");
    $("#card-list").css("display","none");
    if(data.gameState==0){
        if(!isGenerated){
            resetVar();
            await generatePlayerData();
            console.log("generate at stage " + 0);
            isGenerated = true;
        }
        if(isJudge) $("#judge-waiting").css("display","block");
        else{
            $("#player-choosing").css("display","block");
            if(cardCount == 0) generateCard();
        }
    }else if(data.gameState==1){
        $("#card-list").css("display","block");
        if(isJudge){
            if(data.cardOrder == "" || data.cardOrder == null)  generateCardOrder();
            generateChoosingCard();
            $("#judging").css("display", "block");
        }else{
            generateChoosingCard();
        }
    }else if(data.gameState == 2){
        $("#card-list").css("display","block");
        isGenerated = false;
        await generatePlayerData();
        generateChoosingCard();
    }
}

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

async function generatePlayerData(){
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
    var judge = (data.round-1)%playerCount;
    console.log(data.name[judge]);
    console.log(player);
    $("#round").text("Round: "+data.round);
    $("#player-count").html(playerCount);
    $("#player-list").html("<tr><th></th><th>Player</th><th></th><th>Score</th></tr>");
    for(i=0 ; i<playerCount ; i++){
        var markup = "";
        var profileURL = data.profile_pic[i];
        var name = data.name[i];
        if(name == player)  playerSlot = i;
        var judgeState = (i==judge)?   "(Judge)" : "";
        var score = data.score[i];
        var tempURL = "";
        var storageRef = firebase.storage().ref();
        await storageRef.child('profile_pictures/' + profileURL + '.jpg').getDownloadURL().then(function (url) {
            tempURL = url;
        }).catch(function (error) {
        });
        markup += "<tr><td><img src='" + tempURL + "' class='profile-container'></td><td>"+name+"</td><td>"+judgeState+"</td><td>"+score+"</td></tr>";
        $("#player-list").append(markup);
        console.log("Added player " + name + " successfully");
    }
    if (data.name[judge] == player) isJudge = true;
    console.log(isJudge);
}

async function startJudging(){
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
    data.gameState = 1;
    await db.collection("roomID").doc(roomID).set(data).then(() => {
        console.log("Document successfully overwritten!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

function generateCard(){
    for(i=0;i<3;i++){
        $("#white-card-option").find("tr:last").before("<tr><td id='card-" +(i+1)+"' class=''>Suppose to generate some card here-" + (i+1) + "</td><td><button 'type='button' onclick='chooseCard("+(i+1)+")'>Choose</button></td></tr>");
    }
    cardCount = 3;
}

function addCard(){
    cardCount += 1;
    $("#white-card-option").find("tr:last").before("<tr><td id='card-" +cardCount+"' class=''>" + $("#add-card").val() + "</td><td><button type='button' onclick='chooseCard("+cardCount+")'>Choose</button></td></tr>");
    console.log("Added card with content :" + $("#add-card").val());
    $("#add-card").val("");
}

function chooseCard(cardNumber){
    $(chosenCard).removeClass("choosing");
    var cardID = "#card-" + cardNumber;
    chosenCard = cardID;
    $(cardID).addClass("choosing");
    sendChosenCard();
}

async function sendChosenCard(){
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
    data.answer[playerSlot] = $(chosenCard).text();
    console.log(player + " chosen the card "+data.answer[playerSlot]);
    await db.collection("roomID").doc(roomID).set(data).then(() => {
        console.log("Document successfully overwritten!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

async function generateCardOrder(){
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
    var temp = ""
    for(i=0;i<data.name.length;i++){
        var number = Math.floor(Math.random() * (data.name.length));
        while(temp.includes(number))    number = Math.floor(Math.random() * (data.name.length));
        temp += number;
    }
    data.cardOrder = temp;
    console.log("Cards will gnerate in this order: " + data.cardOrder);
    await db.collection("roomID").doc(roomID).set(data).then(() => {
        console.log("Document successfully overwritten!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

async function generateChoosingCard(){
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
    console.log(data.answer);
    $("#card-list").html("");
    for(i=0;i<data.cardOrder.length;i++){
        if((data.round-1)%data.cardOrder.length == data.cardOrder[i])   continue;
        var markup = "<tr><td id='card-" +data.cardOrder[i]+"' class=''>" + data.answer[data.cardOrder[i]] + "</td>";
        if(isJudge && data.gameState != 2){
            markup += "<td><button type='button' onclick='judgeChoose(" + data.cardOrder[i] + ")'>Choose</button></td></tr>";
        }else if(data.gameState == 2){
            console.log("Chosen card is " + data.chosenCard);
            console.log("Winner is " + data.name[data.chosenCard]);
            if(data.chosenCard == data.cardOrder[i])    markup += "<td class='winner'>" + data.name[data.cardOrder[i]] + "</td></tr>";
            else    markup += "<td class='loser'>" + data.name[data.cardOrder[i]] + "</td></tr>";
            if(isJudge) $("#next-round").css("display","block");
        }
        $("#card-list").append(markup);
    }
}

async function judgeChoose(cardNumber){
    console.log("You choosing the card number " + cardNumber);
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
    data.chosenCard = cardNumber;
    data.score[cardNumber] += 1;
    data.gameState = 2;
    await db.collection("roomID").doc(roomID).set(data).then(() => {
        console.log("Document successfully overwritten!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

async function resetVar(){
    cardCount = 0;
    chosenCard = "";
    isJudge = false;
    $("#white-card-option").html("<tr><td><input id='add-card' type='text'></td><td><button type='button' onclick='addCard()'>Add Card</button></td></tr>");
    $("card-list").html("");
}

async function nextRound(){
    console.log("-----------------Next Round-----------------");
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
    data.gameState = 0;
    data.round += 1
    await db.collection("roomID").doc(roomID).set(data).then(() => {
        console.log("Document successfully overwritten!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}