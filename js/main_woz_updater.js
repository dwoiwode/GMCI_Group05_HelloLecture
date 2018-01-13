/*
XMLHttpRequest:
https://en.wikipedia.org/wiki/XMLHttpRequest

CouchDB:
http://guide.couchdb.org/draft/tour.html
https://wiki.apache.org/couchdb/HTTP_Document_API
http://docs.couchdb.org/en/1.6.1/config/intro.html
http://docs.couchdb.org/en/1.6.1/config/http.html#cross-origin-resource-sharing
http://docs.couchdb.org/en/1.6.1/intro/curl.html

HTML(5):
http://www.w3schools.com/html/default.asp
http://www.w3schools.com/jsref/default.asp

Local HTTP server (not strictly needed):
python -m SimpleHTTPServer 8080

CouchDB configuration (Mac OS X):
~/Library/Application Support/CouchDB/etc/couchdb/local.ini
/Applications/Apache CouchDB.app/Contents/Resources/couchdbx-core/etc/couchdb/local.ini
CouchDB configuration (Windows):
C:\Program Files (x86)\Apache Software Foundation\CouchDB\etc\couchdb\local.ini
start/stop/restart: Control Panel --> Services --> Apache CouchDB

[httpd]
enable_cors = true
bind_address = 0.0.0.0
[cors]
origins = *
*/

var request = new XMLHttpRequest();

request.onreadystatechange = function () {
    // console.log("onreadystatechange: " + request2.readyState + ", " +  request2.status);
    // console.log(request2.responseText);
    if (request.readyState == 4) {
        if (request.status == 200) {
            var response = JSON.parse(request.responseText);
            updateHandler[response._id](response);
        }
        if (request.status == 404) {
            console.log("not found: " + request.responseText);
        }
    }
};

function get(variable) {
    // console.log("get " + variable);
    request.open("GET", dburl + variable, false);
    request.send();
}

function update() {
    for (var name in updateHandler) {
        // console.log("updating " + name);
        get(name);
    }
}

// request2 updates at a fixed interval (ms)
var intervalID = setInterval(update, 1000);

///////////////////////////////////////////////////////////////////////////////
// your code below

var dbname = "gmci_hello_lecture";
var dburl = "http://127.0.0.1:5984/" + dbname + "/";
var updateHandler = {
    "questions": updateQuestions
    //"surveys" : updateSurvey
};
function createNewQuestion(question, questionContainer) {
    var singleQuestion = document.createElement("div");
    singleQuestion.className = "singleQuestion";
    singleQuestion.id = getQuestionID(question);
    var newAccordion = document.createElement("button");
    newAccordion.className = "accordion";
    newAccordion.innerText = question.text + " (" + question.upvotes + ")";
    addAccordionEventListener(newAccordion);
    var newPanel = document.createElement("div");
    newPanel.className = "panel";
    newPanel.innerHTML = "<p>This is the answer</p>";

    singleQuestion.appendChild(newAccordion);
    singleQuestion.appendChild(newPanel);
    questionContainer.appendChild(singleQuestion);
    return singleQuestion;
}
function getQuestionID(question) {
    return "question_" + question.text.replace(" ", "_");
}

function updateQuestions(response) {
    /**
     * Updates shown Questions including order
     */
    console.log("Update Questions got called");
    console.log(response);
    questionContainer = document.getElementById("questionsContainer");
    questionContainer.innerHTML = "";
    currentQuestions = questionContainer.getElementsByClassName("singleQuestion");
    for (var i = 0; i < response.questionArray.length; i++) {
        var question = response.questionArray[i];
        var questionID = getQuestionID(question);
        thisQuestion = document.getElementById(questionID);
        thisQuestion = thisQuestion ? thisQuestion : createNewQuestion(question, questionContainer);
        thisAccordion = thisQuestion.getElementsByClassName("accordion")[0];
        thisPanel = thisQuestion.getElementsByClassName("panel")[0];
    }
    // response.questionArray = response.questionArray ? response.questionArray: [];
}


/*function updateSurvey(response) {
    /!**
     * Updates shown Survey results
     *!/
}*/



