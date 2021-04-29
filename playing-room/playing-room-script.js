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
var chosenCard1 = "";
var chosenCard2 = "";
var chosenCard3 = "";
var isJudge = false;
var blank = 0;
var answer = [];

db.collection("roomID").doc(roomID).onSnapshot((doc) => {
    console.log("Current data: ", doc.data());
    refreshRoom();
});

async function refreshRoom() {
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

    $("#judge-choosing-black-card").css("display", "none");
    $("#player-waiting").css("display", "none");
    $("#judge-waiting").css("display", "none");
    $("#player-choosing").css("display", "none");
    $("#waiting").css("display", "none");
    $("#next-round").css("display", "none");
    $("#card-list").css("display", "none");
    $("#result-player-list").css("display", "none");
    $("#back-to-index").css("display", "none");

    // gameState = 0 --> judge choose question card
    //           = 1 --> player choose answer card
    //           = 2 --> judge choosing the answer card
    //           = 3 --> end of round

    if (data.gameState == 0) {
        if (!isGenerated) {
            resetVar();
            await generatePlayerData();
            console.log("generate at stage " + 0);
            isGenerated = true;
        }
        if (isJudge) {
            $("#judge-choosing-black-card").css("display", "block");
            if (cardCount == 0) await generateBlackCard();
        } else {
            $("#player-waiting").css("display", "block");
        }
    } if (data.gameState == 1) {
        if (isGenerated) {
            console.log("isGenerated =" + isGenerated);
            generateQuestionCard();
            isGenerated = false;
        }
        if (isJudge) {
            $("#judge-waiting").css("display", "block");
        } else {
            $("#white-card-option-1").css("display", "none");
            $("#white-card-option-2").css("display", "none");
            $("#white-card-option-3").css("display", "none");
            $("#player-choosing").css("display", "block");
            await generateBlank();
            if (cardCount == 0) generateWhiteCard();
            if(blank >= 1)  $("#white-card-option-1").css("display", "block");
            if(blank >= 2)  $("#white-card-option-2").css("display", "block");
            if(blank >= 3)  $("#white-card-option-3").css("display", "block");
        }
    } else if (data.gameState == 2) {
        $("#card-list").css("display", "block");
        if (isJudge) {
            if (data.cardOrder == "" || data.cardOrder == null) generateCardOrder();
        } 
        generateChoosingCard();
    } else if (data.gameState == 3) {
        $("#card-list").css("display", "block");
        await generatePlayerData();
        generateChoosingCard();
    }
}

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

async function generateBlackCard() {
    var docRef = db.collection("data").doc("card");
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
    var usedCard = [];
    for (i = 0; i < 3; i++) {
        var index = Math.floor((Math.random() * data.black.length));
        while (usedCard.includes(index)) index = Math.floor((Math.random() * data.black.length));
        usedCard.push(index);
        $("#black-card-option").find("tr:last").before("<tr><td id='black-card-" + (i + 1) + "' class=''>" + data.black[index] + "</td><td><button type='button' onclick='chooseBlackCard(" + (i + 1) + ")'>Choose</button></td></tr>");
        cardCount += 1;
    }
}

function addBlackCard() {
    if($("#add-black-card").val() != null && $("#add-black-card").val() != ""){
        cardCount += 1;
        $("#black-card-option").find("tr:last").before("<tr><td id='black-card-" + cardCount + "' class=''>" + $("#add-black-card").val() + "</td><td><button type='button' onclick='chooseBlackCard(" + cardCount + ")'>Choose</button></td></tr>");
    }else{
        alert("Question cannot be blank.");
    }
}

async function chooseBlackCard(cardNumber) {
    console.log("----------------------------------------------------------------------");
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
    console.log("This is the card added :" + $("#black-card-" + cardNumber).text());
    data.question = $("#black-card-" + cardNumber).text();
    if(cardNumber > 3)  data.blank = $("#blank option:selected").val();
    else data.blank = countBlank(data.question);
    if(data.blank == 0) data.blank = 1;
    await db.collection("roomID").doc(roomID).set(data).then(() => {
        console.log("Document successfully overwritten!");
    })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    changeState();
}

async function generateQuestionCard() {
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
    $("#black-card").html(data.question);
}

async function generatePlayerData() {
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
    var judge = (data.round - 1) % playerCount;
    console.log(data.name[judge]);
    console.log(player);
    $("#round").text("Round: " + data.round);
    $("#player-count").html(playerCount);
    $("#player-list").html("<tr><th></th><th>Player</th><th></th><th>Score</th></tr>");
    for (i = 0; i < playerCount; i++) {
        var markup = "";
        var profileURL = data.profile_pic[i];
        var name = data.name[i];
        if (name == player) playerSlot = i;
        var judgeState = (i == judge) ? "(Judge)" : "";
        var score = data.score[i];
        var tempURL = "";
        var storageRef = firebase.storage().ref();
        await storageRef.child('profile_pictures/' + profileURL + '.jpg').getDownloadURL().then(function (url) {
            tempURL = url;
        }).catch(function (error) {
        });
        markup += "<tr><td><img src='" + tempURL + "' class='profile-container'></td><td>" + name + "</td><td>" + judgeState + "</td><td>" + score + "</td></tr>";
        $("#player-list").append(markup);
        console.log("Added player " + name + " successfully");
    }
    if (data.name[judge] == player) isJudge = true;
    console.log(isJudge);
}

async function changeState() {
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
        console.log("Error getting document:", errors);
    });
    data.gameState = (data.gameState + 1) % 4;
    await db.collection("roomID").doc(roomID).set(data).then(() => {
        console.log("Document successfully overwritten!");
    })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    console.log("Game State: " + data.gameState);
}

async function generateBlank(){
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
    blank = data.blank;
}

async function generateWhiteCard() {
    var docRef = db.collection("data").doc("card");
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
    var usedCard = [];
    if(blank >= 1 && cardCount == 0){
        console.log("Generate Cards 1 -----------------")
        for (i = 0; i < 3; i++) {
            var index = Math.floor((Math.random() * data.white.length));
            while (usedCard.includes(index)) index = Math.floor((Math.random() * data.black.length));
            usedCard.push(index);
            cardCount += 1;
            var cardTemp = 1 + ',"t",' + cardCount;
            $("#white-card-option-1").find("tr:last").before("<tr><td id='card-" + cardCount + "' class=''>" + data.white[index] + "</td><td><button type='button' onclick='chooseCard(" + cardTemp + ")'>Choose</button></td></tr>");
        }
        index = Math.floor((Math.random() * 3)+1);
        chooseCard(1, "t", index);
        console.log("Choose Card 1 : " + index);
    }
    if(blank >= 2 && cardCount == 3){
        for (i = 0; i < 3; i++) {
            console.log("Generate Cards 2 -----------------")
            var index = Math.floor((Math.random() * data.white.length));
            while (usedCard.includes(index)) index = Math.floor((Math.random() * data.black.length));
            usedCard.push(index);
            cardCount += 1;
            var cardTemp = 2 + ',"t",' + cardCount;
            $("#white-card-option-2").find("tr:last").before("<tr><td id='card-" + cardCount + "' class=''>" + data.white[index] + "</td><td><button type='button' onclick='chooseCard(" + cardTemp + ")'>Choose</button></td></tr>");
        }
        index = Math.floor((Math.random() * 3)+4);
        chooseCard(2, "t", index);
        console.log("Choose Card 2 : " + index);
    }
    if(blank >= 3 && cardCount == 6){
        console.log("Generate Cards 3 -----------------")
        for (i = 0; i < 3; i++) {
            var index = Math.floor((Math.random() * data.white.length));
            while (usedCard.includes(index)) index = Math.floor((Math.random() * data.black.length));
            usedCard.push(index);
            cardCount += 1;
            var cardTemp = 3 + ',"t",' + cardCount;
            $("#white-card-option-3").find("tr:last").before("<tr><td id='card-" + cardCount + "' class=''>" + data.white[index] + "</td><td><button type='button' onclick='chooseCard(" + cardTemp + ")'>Choose</button></td></tr>");
        }
        index = Math.floor((Math.random() * 3)+7);
        chooseCard(3, "t", index);
        console.log("Choose Card 3 : " + index);
    }
}

function addCard(blankNumber) {
    cardCount += 1;
    var cardTemp = blankNumber + ',"t",' + cardCount;
    $("#white-card-option-" + blankNumber).find("tr:last").before("<tr><td id='card-" + cardCount + "' class=''>" + $("#add-card-" + blankNumber).val() + "</td><td><button type='button' onclick='chooseCard(" + cardTemp + ")'>Choose</button></td></tr>");
    console.log("Added card with content :" + $("#add-card-" + blankNumber).val());
}

async function addPictureCard(blankNumber) {
    var file = document.getElementById("add-image-card-" + blankNumber).files[0];
    if (file != "" && file != null) {
        console.log(file);
        //Declare Variables
        cardCount += 1;
        var cardTemp = blankNumber + ',"p",' + cardCount;
        var imageName = "picture-card-" + generateId(10);
        $("#white-card-option-" + blankNumber).find("tr:last").before("<tr><td id='card-" + cardCount + "' class=''><img src='' id='picture-card-" + cardCount + "' alt='" + imageName + "' class='picture-card'></td><td><button type='button' onclick='chooseCard(" + cardTemp + ")'>Choose</button></td></tr>");
        // Create a root reference
        var storageRef = firebase.storage().ref();
        // Create a reference to 'images/mountains.jpg'
        var imageRef = storageRef.child('card_pictures/' + imageName + '.jpg');
        await imageRef.put(file).then((snapshot) => {
            console.log('Uploaded a blob or file named: ' + imageName + " !");
            uploadCardPicture("#picture-card-" + cardCount, imageName);
        });
    } else console.log("No image selected");
}

function chooseCard(blankNumber, cardType, cardNumber) {
    console.log("Switch Choose card : " + blankNumber);
    switch(blankNumber) {
        case 1 :    $(chosenCard1).removeClass("choosing"); break;
        case 2 :    $(chosenCard2).removeClass("choosing"); break;
        case 3 :    $(chosenCard3).removeClass("choosing"); break;
    }
    var cardID = "#";
    if (cardType == "t") cardID += "card-" + cardNumber;
    else cardID += "picture-card-" + cardNumber;
    switch(blankNumber) {
        case 1 :    chosenCard1 = cardID;   break;
        case 2 :    chosenCard2 = cardID;   break;
        case 3 :    chosenCard3 = cardID;   break;
    }
    $(cardID).addClass("choosing");
    sendChosenCard(blankNumber, cardType);
}

async function sendChosenCard(blankNumber, cardType) {
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
    if (cardType == "t"){
        switch(blankNumber){
            case 1 : answer[0] = $(chosenCard1).text(); break;
            case 2 : answer[1] = $(chosenCard2).text(); break;
            case 3 : answer[2] = $(chosenCard3).text(); break;
        }
    }else{
        switch(blankNumber){
            case 1 : answer[0] = $(chosenCard1).attr("alt");    break;
            case 2 : answer[1] = $(chosenCard2).attr("alt");    break;
            case 3 : answer[2] = $(chosenCard3).attr("alt");    break;
        }
    }
    console.log(answer);
    data.answer[playerSlot] = answer.join(", ");
    console.log(data.answer[playerSlot]);
    console.log(player + " chosen the card " + data.answer[playerSlot]);
    await db.collection("roomID").doc(roomID).set(data).then(() => {
        console.log("Document successfully overwritten!");
    })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
}

function uploadCardPicture(id, imageName) {
    var storageRef = firebase.storage().ref();
    storageRef.child('card_pictures/' + imageName + '.jpg').getDownloadURL().then(function (url) {
        console.log(url);
        $(id).attr("src", url);
    }).catch(function (error) {
    });
}

async function generateCardOrder() {
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
    for (i = 0; i < data.name.length; i++) {
        var number = Math.floor(Math.random() * (data.name.length));
        while (temp.includes(number)) number = Math.floor(Math.random() * (data.name.length));
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

async function generateChoosingCard() {
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
    for (i = 0; i < data.cardOrder.length; i++) {
        if ((data.round - 1) % data.cardOrder.length == data.cardOrder[i]) continue;
        var slot = data.cardOrder[i];
        var answerData = data.answer[slot].split(", ");
        var markup = "<tr id='player-card-" + slot + "' class=''></tr>";
        $("#card-list").append(markup);
        for(i=0;i<answerData.length;i++){
            var answer = answerData[i];
            var isPicture = (answer.length == 23 && answer.slice(0, 13) == "picture-card-") ? true : false;
            markup = "";
            console.log(isPicture);
            console.log(answer);
            if(i!=0)    markup += "<td>, </td>";
            markup += "<td>";
            if (isPicture) {
                console.log("------------Picture Card here------------");
                markup += "<img src='' id='picture-card-" + slot + "' alt='" + answer + "' class='picture-card'></img></td>";
            } else markup += answer + "</td>";
            $("#player-card-" + slot).append(markup);
            if (isPicture) uploadCardPicture("#picture-card-" + slot, answer);
        }
        markup = "";
        if (isJudge && data.gameState != 3) {
            console.log("This is judge.")
            markup += "<td><button type='button' onclick='judgeChoose(" + slot + ")'>Choose</button></td></tr>";
        } else if (data.gameState == 3) {
            console.log("Chosen card is " + data.chosenCard);
            console.log("Winner is " + data.name[data.chosenCard]);
            if (data.chosenCard == slot) markup += "<td class='winner'>" + data.name[slot] + "</td></tr>";
            else markup += "<td class='loser'>" + data.name[slot] + "</td></tr>";
            if (isJudge && data.round != data.roundMax) $("#next-round").css("display", "block");
            if (data.round == data.roundMax){
                generateFinalResult();
                $("#player-list").css("display", "none");
                $(".modal").css("display","flex");
                $(".modal").css("justify-content","center");
                $(".modal").css("align-items","center");
                $(".modal").css("flex-direction","column");
            }
        }
        $("#player-card-" + slot).append(markup);
    }
}

async function generateFinalResult() {
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
    $("#result-player-list").html("<tr><td>Final Result</td></tr><tr><th></th><th>Place</th><th>Player</th><th></th><th>Score</th></tr>");
    var playerScore = [];
    for (i = 0; i < data.name.length; i++) {
        playerScore.push({ score: data.score[i], name: data.name[i] });
    }
    playerScore.sort(function (a, b) { return b.score - a.score });
    var place = 1;
    for (i = 0; i < data.name.length; i++) {
        var tempURL = "";
        var profileURL = data.profile_pic[i];
        var storageRef = firebase.storage().ref();
        await storageRef.child('profile_pictures/' + profileURL + '.jpg').getDownloadURL().then(function (url) {
            tempURL = url;
        }).catch(function (error) {
        });
        console.log((playerScore[i]).name + "   ->   " + (playerScore[i]).score);
        if (i != 0 && (playerScore[i - 1]).score == (playerScore[i]).score) {
            $("#result-player-list").append("<tr><td><img src='" + tempURL + "' class='profile-container'></td><td>" + (place - 1) + "</td><td>" + (playerScore[i]).name + "</td><td>" + (playerScore[i]).score + "</td></tr>");
        } else {
            $("#result-player-list").append("<tr><td><img src='" + tempURL + "' class='profile-container'></td><td>" + (i + 1) + "</td><td>" + (playerScore[i]).name + "</td><td>" + (playerScore[i]).score + "</td></tr>");
            place += 1;
        }
    }
    $("#player-list").css("display", "none");
    $("#result-player-list").css("display", "block");
    $("#back-to-index").css("display", "block");
}

async function judgeChoose(cardNumber) {
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
    data.gameState = 3;
    await db.collection("roomID").doc(roomID).set(data).then(() => {
        console.log("Document successfully overwritten!");
    })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
}

async function resetVar() {
    cardCount = 0;
    chosenCard1 = "";
    chosenCard2 = "";
    chosenCard3 = "";
    isJudge = false;
    $("#black-card-option").html('<table id = "black-card-option"><tr><td><input id="add-black-card" type="text"> (There are  <select id="blank"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select> blank(s) in this question.) </td><td><button type="button" onclick="addBlackCard()">Add Question Card</button></td></tr>');
    $("#white-card-option-1").html('<tr><td>1st Blank</td></tr><tr><td><input id="add-card-1" type="text"></td><td><button type="button" onclick="addCard(1)">Add Card</button></td><td>or</td><td><input type="file" id="add-image-card-1" accept="image/*"></td><td><button type="button" onclick="addPictureCard(1)">Add Picture as a Card</button></td></tr>');
    $("#white-card-option-2").html('<tr><td>2nd Blank</td></tr><tr><td><input id="add-card-2" type="text"></td><td><button type="button" onclick="addCard(2)">Add Card</button></td><td>or</td><td><input type="file" id="add-image-card-2" accept="image/*"></td><td><button type="button" onclick="addPictureCard(2)">Add Picture as a Card</button></td></tr>');
    $("#white-card-option-3").html('<tr><td>3rd Blank</td></tr><tr><td><input id="add-card-3" type="text"></td><td><button type="button" onclick="addCard(3)">Add Card</button></td><td>or</td><td><input type="file" id="add-image-card-3" accept="image/*"></td><td><button type="button" onclick="addPictureCard(3)">Add Picture as a Card</button></td></tr>');
    $("#card-list").html("");
    $("#black-card").html("");
}

async function nextRound() {
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

function dec2hex(dec) {
    return dec.toString(16).padStart(2, "0")
}

function generateId(len) {
    var arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
}

function countBlank(text) {
    var blank = "____";
    var array = text.split(blank)
    console.log(array)
    console.log(array.length - 1)
    return array.length - 1
}