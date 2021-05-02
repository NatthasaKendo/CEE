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
var timerStop = 0;

var timeout1;
var timeout2;

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
    $("#timer-1").css("display", "none");
    $("#timer-2").css("display", "none");

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
            $("#judge-choosing-black-card").css("display", "flex");
            if (cardCount == 0) await generateBlackCard();
        } else {
            $("#player-waiting").css("display", "flex");
        }
    } if (data.gameState == 1) {
        if (isGenerated) {
            console.log("isGenerated =" + isGenerated);
            timeout1 = setInterval(countDown1, 1000);
            await generateQuestionCard();
            await getTimerStop();
            //setTime();
            isGenerated = false;
        }
        if (isJudge) {
            $("#judge-waiting").css("display", "flex");
        } else {
            $("#white-card-option-1").css("display", "none");
            $("#white-card-option-2").css("display", "none");
            $("#white-card-option-3").css("display", "none");
            $("#player-choosing").css("display", "flex");
            await generateBlank();
            if (cardCount == 0) generateWhiteCard();
            if (blank >= 1) $("#white-card-option-1").css("display", "flex");
            if (blank >= 2) $("#white-card-option-2").css("display", "flex");
            if (blank >= 3) $("#white-card-option-3").css("display", "flex");
        }
        $("#timer-1").css("display", "flex");
    } else if (data.gameState == 2) {
        $("#card-list").css("display", "flex");
        if (isJudge) {
            if (data.cardOrder == "" || data.cardOrder == null) generateCardOrder();
        } 
        console.log(2);
        await generateChoosingCard();
        isGenerated = true;
    } else if (data.gameState == 3) {
        console.log(3);
        if(isGenerated){
            await generatePlayerData();
            await generateQuestionCard();
            await generateChoosingCard();
            isGenerated = false;
        }
        if(data.round != data.roundMax){
            timeout2 = setInterval(countDown2, 1000);
            await getTimerStop();
            $("#timer-2").css("display", "flex");
            $("#next-round").css("display", "flex");
        }else{
            generateFinalResult();
            $("#player-list").css("display", "none");
            $("#result-player-list").css("display", "flex");
            $("#back-to-index").css("display", "flex");
            $(".modal").css("display", "flex");
            $(".modal").css("justify-content", "center");
            $(".modal").css("align-items", "center");
            $(".modal").css("flex-direction", "column");
        }
        $("#card-list").css("display", "flex");
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

async function getTimerStop() {
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
    timerStop = data.timerStop;
}

function countDown1() {
    setTime1(Math.max(0, timerStop - Date.now()));
    if (timerStop <= Date.now()) {
        clearInterval(timeout1);
        if (isJudge) changeState();
    }
}

function setTime1(remaining) {
    var minutes = "00" + Math.floor(remaining / 60000);
    var seconds = "00" + Math.round(remaining / 1000);
    console.log("1 ------ " + minutes + seconds);
    if (minutes != "" && minutes != null && minutes != "00NaN" && seconds != "" && seconds != null && seconds != "00NaN") $("#timer-1").text(minutes.slice(minutes.length - 2, minutes.length) + ':' + seconds.slice(seconds.length - 2, seconds.length));
}

function countDown2() {
    setTime2(Math.max(0, timerStop - Date.now()));
    if (timerStop <= Date.now()) {
        clearInterval(timeout2);
        if (isJudge) nextRound();
    }
}

async function buttonNextStage(){
    clearInterval(timeout1);
    clearInterval(timeout2);
    await changeState();
}

function setTime2(remaining) {
    var seconds = Math.round(remaining / 1000);
    console.log("2 ------ " + seconds);
    if (seconds != "" && seconds != null && seconds != "00NaN") $("#timer-2").text(seconds);
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
        $("#black-card-option").find("div:last").before("<div id='black-card-" + (i + 1) + "' class='black-card'><div>" + data.black[index] + "</div><button type='button' onclick='chooseBlackCard(" + (i + 1) + ")'>Choose</button></div>");
        cardCount += 1;
    }
}

function choosePlayersBlackCard() {
    if ($("#add-black-card").val() != null && $("#add-black-card").val() != "") {
        chooseBlackCard(-1);
    } else {
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
    if (cardNumber < 0) {
        console.log("This is the card added :" + $("#add-black-card").val());
        data.question = $("#add-black-card").val();
    } else {
        console.log("This is the card added :" + $("#black-card-" + cardNumber).find("div:first").text());
        data.question = $("#black-card-" + cardNumber).find("div:first").text();
    }
    data.timerStop = Date.now() + 60000;
    if (cardNumber < 0) data.blank = $("#blank option:selected").val();
    else data.blank = countBlank(data.question);
    if (data.blank == 0) data.blank = 1;
    await db.collection("roomID").doc(roomID).set(data).then(() => {
        console.log("Document successfully overwritten!");
    })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    await changeState();
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

async function generateBlank() {
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
    if (blank >= 1 && cardCount == 0) {
        console.log("Generate Cards 1 -----------------")
        for (i = 0; i < 3; i++) {
            var index = Math.floor((Math.random() * data.white.length));
            while (usedCard.includes(index)) index = Math.floor((Math.random() * data.black.length));
            usedCard.push(index);
            cardCount += 1;
            var cardTemp = 1 + ',"t",' + cardCount;
            $("#white-card-option-1").find("div:first").before("<div id='card-" + cardCount + "' class='white-card'><div>" + data.white[index] + "</div><button type='button' onclick='chooseCard(" + cardTemp + ")'>Choose</button></div>");
        }
        index = Math.floor((Math.random() * 3) + 1);
        chooseCard(1, "t", index);
        console.log("Choose Card 1 : " + index);
    }
    if (blank >= 2 && cardCount == 3) {
        for (i = 0; i < 3; i++) {
            console.log("Generate Cards 2 -----------------")
            var index = Math.floor((Math.random() * data.white.length));
            while (usedCard.includes(index)) index = Math.floor((Math.random() * data.black.length));
            usedCard.push(index);
            cardCount += 1;
            var cardTemp = 2 + ',"t",' + cardCount;
            $("#white-card-option-2").find("div:first").before("<div id='card-" + cardCount + "' class='white-card'><div>" + data.white[index] + "</div><button type='button' onclick='chooseCard(" + cardTemp + ")'>Choose</button></div>");
        }
        index = Math.floor((Math.random() * 3) + 6);
        chooseCard(2, "t", index);
        console.log("Choose Card 2 : " + index);
    }
    if (blank >= 3 && cardCount == 6) {
        console.log("Generate Cards 3 -----------------")
        for (i = 0; i < 3; i++) {
            var index = Math.floor((Math.random() * data.white.length));
            while (usedCard.includes(index)) index = Math.floor((Math.random() * data.black.length));
            usedCard.push(index);
            cardCount += 1;
            var cardTemp = 3 + ',"t",' + cardCount;
            $("#white-card-option-3").find("div:first").before("<div id='card-" + cardCount + "' class='white-card'><div>" + data.white[index] + "</div><button type='button' onclick='chooseCard(" + cardTemp + ")'>Choose</button></></div>");
        }
        index = Math.floor((Math.random() * 3) + 11);
        chooseCard(3, "t", index);
        console.log("Choose Card 3 : " + index);
    }
}

async function addPictureCard(cardNumber) {
    var file = document.getElementById("add-image-card-" + cardNumber).files[0];
    if (file != "" && file != null) {
        console.log(file);
        var imageName = "picture-card-" + generateId(10);
        // Create a root reference
        var storageRef = firebase.storage().ref();
        // Create a reference to 'images/mountains.jpg'
        var imageRef = storageRef.child('card_pictures/' + imageName + '.jpg');
        await imageRef.put(file).then((snapshot) => {
            console.log('Uploaded a blob or file named: ' + imageName + " !");
            updatePictureCard(imageName, cardNumber);
        });
    } else console.log("No image selected");
}

function updatePictureCard(imageName, cardNumber) {
    var storageRef = firebase.storage().ref();
    storageRef.child('card_pictures/' + imageName + '.jpg').getDownloadURL().then(function (url) {
        console.log(url);
        nudeCheckSendRequest(cardNumber, imageName, url);
    }).catch(function (error) {
    });
}

function chooseCard(blankNumber, cardType, cardNumber) {
    console.log("Switch Choose card : " + blankNumber);
    switch (blankNumber) {
        case 1: $(chosenCard1).removeClass("choosing"); break;
        case 2: $(chosenCard2).removeClass("choosing"); break;
        case 3: $(chosenCard3).removeClass("choosing"); break;
    }
    var cardID = "#";
    if (cardType == "t") cardID += "card-" + cardNumber;
    else if (cardType == "p") cardID += "picture-card-" + cardNumber;
    else cardID += "text-card-" + cardNumber;
    switch (blankNumber) {
        case 1: chosenCard1 = cardID; break;
        case 2: chosenCard2 = cardID; break;
        case 3: chosenCard3 = cardID; break;
    }
    $("#card-" + cardNumber).addClass("choosing");
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
    if (cardType == "t") {
        switch (blankNumber) {
            case 1: answer[0] = $(chosenCard1).find("div:first").text(); break;
            case 2: answer[1] = $(chosenCard2).find("div:first").text(); break;
            case 3: answer[2] = $(chosenCard3).find("div:first").text(); break;
        }
    } else if (cardType == "b") {
        switch (blankNumber) {
            case 1: answer[0] = $(chosenCard1).val(); break;
            case 2: answer[1] = $(chosenCard2).val(); break;
            case 3: answer[2] = $(chosenCard3).val(); break;
        }
    } else {
        switch (blankNumber) {
            case 1: answer[0] = $(chosenCard1).attr("alt"); break;
            case 2: answer[1] = $(chosenCard2).attr("alt"); break;
            case 3: answer[2] = $(chosenCard3).attr("alt"); break;
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
        var markup = "<div id='player-card-" + slot + "' class='White-card'></div>";
        $("#card-list").append(markup);
        console.log(answerData);
        for(i=0;i<answerData.length;i++){
            var answer = answerData[i];
            var isPicture = (answer.length == 23 && answer.slice(0, 13) == "picture-card-") ? true : false;
            markup = "";
            console.log(isPicture);
            console.log(answer);
            if (i != 0) markup += ", ";
            if (isPicture) {
                console.log("------------Picture Card here------------");
                markup += "<img src='' id='picture-card-" + slot + "' alt='" + answer + "' class='picture-card'></img></div>";
            } else markup += answer;
            $("#player-card-" + slot).append(markup);
            if (isPicture) uploadCardPicture("#picture-card-" + slot, answer);
        }
        markup = "";
        if (isJudge && data.gameState != 3) {
            console.log("This is judge.")
            markup += "<button type='button' onclick='judgeChoose(" + slot + ")'>Choose</button>";
        } else if (data.gameState == 3) {
            console.log("Chosen card is " + data.chosenCard);
            console.log("Winner is " + data.name[data.chosenCard]);
            if (data.chosenCard == slot) markup += "<div class='winner'>" + data.name[slot] + "</div>";
            else markup += "<div class='loser'>" + data.name[slot] + "</div>";
        }
        $("#player-card-" + slot).append(markup);
    }
}

async function uploadCardPicture(id, imageName) {
    var storageRef = firebase.storage().ref();
    storageRef.child('card_pictures/' + imageName + '.jpg').getDownloadURL().then(function (url) {
        console.log(url);
        $(id).attr("src", url);
        $(id).attr("alt", imageName);
    }).catch(function (error) {
    });
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
    data.timerStop = Date.now() + 5000;
    await db.collection("roomID").doc(roomID).set(data).then(() => {
        console.log("Document successfully overwritten!");
    })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
}

function resetVar() {
    clearInterval(timeout1);
    clearInterval(timeout2);
    cardCount = 0;
    chosenCard1 = "";
    chosenCard2 = "";
    chosenCard3 = "";
    isJudge = false;
    tempB = ",'b',";
    tempP = ",'p',";
    $("#black-card-option").html('<div class="black-card" id="black-card-add">Type your own question<input id="add-black-card" type="text">There are<select id="blank"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select>blank(s) in this question.<button type="button" onclick="choosePlayersBlackCard()">Choose</button></div>');
    $("#white-card-option-1").html('1st Blank<div class="white-card">Type your own card<input id="text-card-4" type="text"><button type="button" onclick="chooseCard(1' + tempB + '4)">Choose</button></div><div class="white-card">Upload picture as a card<img id="picture-card-5" src="" alt=""><input type="file" id="add-image-card-5" accept="image/*" onchange="addPictureCard(5)"><button type="button" onclick="chooseCard(1' + tempP + '5)">Choose</button></div>');
    $("#white-card-option-2").html('2nd Blank<div class="white-card">Type your own card<input id="text-card-9" type="text"><button type="button" onclick="chooseCard(2' + tempB + '9)">Choose</button></div><div class="white-card">Upload picture as a card<img id="picture-card-10" src="" alt=""><input type="file" id="add-image-card-10" accept="image/*" onchange="addPictureCard(10)"><button type="button" onclick="chooseCard(2' + tempP + '10)">Choose</button></div>');
    $("#white-card-option-3").html('3rd Blank<div class="white-card">Type your own card<input id="text-card-14" type="text"><button type="button" onclick="chooseCard(3' + tempB + '14)">Choose</button></div><div class="white-card">Upload picture as a card<img id="picture-card-15" src="" alt=""><input type="file" id="add-image-card-15" accept="image/*" onchange="addPictureCard(15)"><button type="button" onclick="chooseCard(3' + tempP + '15)">Choose</button></div>');
    $("#card-list").html("");
    $("#black-card").html("");
    $("#timer-1").text("01:00");
    $("#timer-2").text("5");
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
    data.cardOrder = ""
    for(i=0;i<data.answer.length;i++)   data.answer[i] = "";
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

async function backToIndex() {
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
    for (i = 0; i < data.name.length; i++) {
        if (data.name[i] == player) {
            idx = i;
            break;
        }
    }
    if (data.player == 1) deleteRoom();
    else {
        data.player -= 1;
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

async function deleteRoom() {
    db.collection("roomID").doc(roomID).delete().then(() => {
        console.log("Document " + roomID + " successfully deleted!");
        window.location.href = "../index/index.html";
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
}

function countBlank(text) {
    var blank = "____";
    var array = text.split(blank)
    console.log(array)
    console.log(array.length - 1)
    return array.length - 1
}

async function nudeCheckSendRequest(cardNumber, imageName, url) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            result = JSON.parse(xhr.response).output;
            console.log(result);
            if (result.detections.length > 0) {
                alert("Card Picture cannot contain nudity.")
                console.log("lewd");
                deleteProfile();
                $("#add-image-card-" + cardNumber).val() = null;
            }
            else if (result.detections.length <= 0) {
                console.log("safe");
                newID = "#picture-card-" + cardNumber;
                $(newID).attr("src", url);
                $(newID).attr("alt", imageName);
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

function deleteProfile() {
    // Create a reference to the file to delete
    var storageRef = firebase.storage().ref();
    var imageRef = storageRef.child('card_pictures/' + currentProfile + '.jpg');

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
    var text1 = "Waiting for judge to choose black card ";
    var text2 = "Waiting for other player to choose the card ";
    var text1_with_dot = text1 + (".".repeat(waiting_count));
    var text2_with_dot = text2 + (".".repeat(waiting_count));
    document.getElementById("player-waiting").innerHTML = text1_with_dot;
    document.getElementById("judge-waiting-p").innerHTML = text2_with_dot;
    waiting_count++;
    if (waiting_count == 4) waiting_count = 1;
}, 500);