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
    if (request.readyState === 4) {
        if (request.status === 200) {
            var response = JSON.parse(request.responseText);
            updateHandler[response._id](response);
        }
        if (request.status === 404) {
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
console.log(intervalID);
///////////////////////////////////////////////////////////////////////////////
// your code below

var dbname = "gmci_hello_lecture";
var dburl = "http://127.0.0.1:5984/" + dbname + "/";
var updateHandler = {
    "questions": updateQuestions,
    "surveys": updateSurvey,
    "simulation": simulate
};

function createNewQuestion(question) {
    // Question object
    var singleQuestion = document.createElement("div");
    singleQuestion.className = "singleQuestion";
    var id = getQuestionID(question);
    singleQuestion.id = id;

    // Button with question as text
    var newAccordion = document.createElement("button");
    newAccordion.className = "accordion";
    newAccordion.innerText = question.text + " (" + question.upvotes + ")";
    addAccordionEventListener(newAccordion);

    // Answer panel
    var newPanel = document.createElement("div");
    newPanel.className = "panel";
    newPanel.innerHTML = "<p></p>";

    // Input field
    var newReplyInput = document.createElement("input");
    newReplyInput.type = "text";
    var inputId = id + "_INPUT";
    newReplyInput.id = inputId;

    //init answer button with class answer-btn
    var sendAnswerButton = document.createElement("Button");
    sendAnswerButton.className = "sendReplyButton";
    sendAnswerButton.innerHTML = "reply";
    sendAnswerButton.id = id + "_ACTION";
    sendAnswerButton.addEventListener("click", function () {
        setMarked(this, 'questions');
    });

    newPanel.appendChild(newReplyInput);
    newPanel.appendChild(sendAnswerButton);
    singleQuestion.appendChild(newAccordion);
    singleQuestion.appendChild(newPanel);

    return singleQuestion;
}

function setMarked(button, doc) {
    button.classList.add("marked");
    set(doc);
}


function createNewSurvey(survey) {
    var singleSurvey = document.createElement("div");
    singleSurvey.className = "singleSurvey";
    singleSurvey.id = getSurveyID(survey);
    var newAccordion = document.createElement("button");
    newAccordion.className = "accordion";
    newAccordion.innerText = survey.text;
    addAccordionEventListener(newAccordion);

    var newPanel = document.createElement("div");
    newPanel.className = "panel";
    newPanel.innerHTML = "<p>This are the responses</p>";

    singleSurvey.appendChild(newAccordion);
    singleSurvey.appendChild(newPanel);
    return singleSurvey;
}

function getQuestionID(question) {
    return "question_" + question.text.replace(" ", "_");
}

function getAnswerID(answer) {
    return "answer_" + answer[0].replace(" ", "_");
}

function getSurveyID(survey) {
    return "survey_" + survey.text.replace(" ", "_");
}

function updateQuestions(response) {
    /**
     * Updates shown Questions including order
     */
        // console.log("Update Questions got called");
        // console.log(response);
    var questionContainer = document.getElementById("questionsContainer");
    // questionContainer.innerHTML = "";
    response.questionArray = response.questionArray ? response.questionArray : [];
    document.getElementById("questionTabSelector").innerHTML = "Questions (" + response.questionArray.length + ")";
    for (var i = 0; i < response.questionArray.length; i++) {
        var question = response.questionArray[i];
        var questionID = getQuestionID(question);
        var thisQuestion = document.getElementById(questionID);




        thisQuestion = thisQuestion ? thisQuestion : createNewQuestion(question);

        for (var k = 0; k < question.responses.length; k++) {
            var answer = document.createElement("div");
            var vote = document.createElement("div");
            var voteBtn = document.createElement("button");
            voteBtn.innerHTML = "like";
            voteBtn.addEventListener("click", function () {
                alert("upvoted");
            });
            var answerContainer = document.createElement("div");
            answerContainer.appendChild(answer);
            answerContainer.appendChild(vote);
            answerContainer.appendChild(voteBtn);

            answerContainer.className = "answer-container";
            answer.className = "answer";
            vote.className = "vote";
            answer.innerHTML = question.responses[k][0];
            answerContainer.id = getAnswerID(question.responses[k]);
            vote.innerHTML = question.responses[k][1];

            if (document.getElementById(answerContainer.id) == null)
            thisQuestion.children[1].appendChild(answerContainer);
        }
        questionContainer.appendChild(thisQuestion);
    }

}

function updateSurvey(response) {
    /**
     * Updates shown Survey results
     */
    var surveyContainer = document.getElementById("surveysContainer");
    // questionContainer.innerHTML = "";
    response.surveyArray = response.surveyArray ? response.surveyArray : [createNewSurvey([{"text": "New epic survey " + Math.random()}])];
    document.getElementById("surveyTabSelector").innerHTML = "Surveys (" + response.surveyArray.length + ")";
    for (var i = 0; i < response.surveyArray.length; i++) {
        var survey = response.surveyArray[i];
        var surveyID = getSurveyID(survey);
        var thisSurvey = document.getElementById(surveyID);
        thisSurvey = thisSurvey ? thisSurvey : createNewSurvey(survey);
        surveyContainer.appendChild(thisSurvey);
    }
}

function simulate(response) {
    if (response.simulateSurvey) {
        simulateSurveyParticipation();
    }
    if (response.simulateQuestion) {
        simulateQuestionUpvotes();
    }
    if (response.simulateAnswer) {
        simulateAnswerUpvotes()
    }
}

function simulateSurveyParticipation() {
    // TODO
}

function simulateQuestionUpvotes() {
    // TODO
}

function simulateAnswerUpvotes() {
    // TODO
}



