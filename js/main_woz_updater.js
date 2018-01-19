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

/* Helper */
function setMarked(button, doc) {
    button.classList.add("marked");
    set(doc);
}

// TODO: Maybe use some kind of hash functions to generate IDs?
function getQuestionID(question) {
    return "question_" + question.text.replace(" ", "_");
}

function getAnswerID(question, answer) {
    return "answer_" + question.text.replace(" ", "_") + "_" + answer[0].replace(" ", "_");
}

function getSurveyID(survey) {
    return "survey_" + survey.text.replace(" ", "_");
}

/* create new Part */
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
    newAccordion.id = id + "_accordion";
    addAccordionEventListener(newAccordion);

    // Answer panel
    var newPanel = document.createElement("div");
    newPanel.className = "panel";
    newPanel.id = id + "_panel";
    newPanel.innerHTML = "";

    // Input field
    var newReplyInput = document.createElement("input");
    newReplyInput.type = "text";
    newReplyInput.id = id + "_INPUT";
    newReplyInput.style.width = "70%";
    newReplyInput.style.marginTop = "5px";
    newReplyInput.placeholder = "Your answer...";

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

function createNewAnswer(answer, answerID) {
    var answerContainer = document.createElement("div");
    answerContainer.className = "singleAnswer";
    answerContainer.id = answerID;

    var answerField = document.createElement("div");
    answerField.innerHTML = answer[0];

    // Vote button
    var vote = document.createElement("div");
    vote.className = "vote";

    var voteBtn = document.createElement("div");
    voteBtn.className = "increment up";
    voteBtn.id = answerID + "_voteBtn";
    voteBtn.onclick = function () {
        setMarked(voteBtn, "questions")
    };

    var count = document.createElement("div");
    count.className = "count";
    count.id = answerID + "_count";

    vote.appendChild(voteBtn);
    vote.appendChild(count);

    answerContainer.appendChild(answerField);
    answerContainer.appendChild(vote);

    return answerContainer;
}

function createNewSurvey(survey) {
    // Create Survey container
    var singleSurvey = document.createElement("div");
    singleSurvey.className = "singleSurvey";
    singleSurvey.id = getSurveyID(survey);

    // Create Survey button
    var newAccordion = document.createElement("button");
    newAccordion.className = "accordion";
    newAccordion.innerText = survey.text;
    addAccordionEventListener(newAccordion);

    // Create container for answers
    var newPanel = document.createElement("div");
    newPanel.className = "panel surveyPanel";

    for (var choice in survey.choices) {
        var newChoice = document.createElement("button");
        newChoice.innerHTML = choice;
        newChoice.className = "choiceLabel";
        newChoice.id = getSurveyID(survey) + "_______" + choice;
        newChoice.onclick = function () {
            setMarked(this, "surveys");
        };
        newChoice.style.width = "100%";
        newPanel.appendChild(newChoice);
        newPanel.appendChild(document.createElement("p"))
    }

    // Append
    singleSurvey.appendChild(newAccordion);
    singleSurvey.appendChild(newPanel);
    return singleSurvey;
}

/* Update Functions */
function updateQuestions(response) {
    /**
     * Updates shown Questions including order
     */
    var questionContainer = document.getElementById("questionsContainer");
    // questionContainer.innerHTML = "";
    response.questionArray = response.questionArray ? response.questionArray : [];
    document.getElementById("questionTabSelector").innerHTML = "Questions (" + response.questionArray.length + ")";
    // question
    for (var i = 0; i < response.questionArray.length; i++) {
        var question = response.questionArray[i];
        var questionID = getQuestionID(question);

        // Create new Question if not exists yet
        var thisQuestion = document.getElementById(questionID);
        var newQuestion = !thisQuestion;
        thisQuestion = thisQuestion ? thisQuestion : createNewQuestion(question);
        if (newQuestion) {
            questionContainer.appendChild(thisQuestion);
        }
        document.getElementById(questionID + "_accordion").innerHTML = question.text + " (Replies: " + question.responses.length + "; Upvotes: " + question.upvotes + ")";
        for (var k = 0; k < question.responses.length; k++) {
            // answers
            var answer = question.responses[k];
            var answerID = getAnswerID(question, answer);

            // Create new Answer if not exists yet
            var thisAnswer = document.getElementById(answerID);
            var newAnswer = !thisAnswer;
            thisAnswer = thisAnswer ? thisAnswer : createNewAnswer(answer, answerID);
            if (newAnswer) {
                document.getElementById(getQuestionID(question) + "_panel").appendChild(thisAnswer);
                // thisQuestion.children[1].appendChild(thisAnswer);
            }

            document.getElementById(answerID + "_count").innerHTML = answer[1];
        }

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
        thisSurvey.classList.remove("singleSurvey");
        switch (thisSurvey.className) {
            case "replaceable":
                replaceButtons(thisSurvey, response);
                thisSurvey.classList.remove("replaceable");
                thisSurvey.classList.add("updateable");
                break;
            case "updateable":
                updateButtons(thisSurvey, response);
                break;
        }
        thisSurvey.classList.add("singleSurvey");
        surveyContainer.appendChild(thisSurvey);
    }
}

/* Survey helper */
function replaceButtons(survey, response) {
    var surveyData = getSurveyData(survey, response);
    for (var choice in surveyData.choices) {
        document.getElementById(survey.id + "_______" + choice).onclick = null;
    }
    updateButtons(survey, response);
}

function updateButtons(survey, response) {
    var surveyData = getSurveyData(survey, response);
    var totalVotes = 0;
    for (var choice in surveyData.choices) {
        totalVotes += surveyData.choices[choice];
    }
    for (choice in surveyData.choices) {
        var newChoice = document.getElementById(survey.id + "_______" + choice);
        var newWidth = (surveyData.choices[choice] / totalVotes*100) + "%";
        newChoice.style.width = newWidth;
        newChoice.innerHTML = choice + " (" + Math.floor(surveyData.choices[choice] / totalVotes*10000)/100 + "%)";
    }

}

function getSurveyData(survey, response) {
    var surveyID = survey.id;
    for (var i = 0; i < response.surveyArray.length; i++) {
        if (getSurveyID(response.surveyArray[i]) === surveyID) {
            return response.surveyArray[i];
        }
    }
    console.log("Survey not found");
    return null;
}

/* Simulation */
function simulate(response) {
    if (response.simulateSurvey) {
        simulateSurveyParticipation(response);
    }
    if (response.simulateQuestion) {
        simulateQuestionUpvotes(response);
    }
    if (response.simulateAnswer) {
        simulateAnswerUpvotes(response)
    }
}

function simulateSurveyParticipation(response) {
    // TODO
}

function simulateQuestionUpvotes(response) {
    // TODO
}

function simulateAnswerUpvotes(response) {
    // TODO
}



