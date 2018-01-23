/*
Install:
--------
http://couchdb.apache.org download
    double click to start CouchDB server locally
configure CouchDB via: http://127.0.0.1:5984/_utils/#_config/couchdb@localhost
    add options enable_cors, bind_address, origins:
      [httpd] <-- section
        enable_cors = true
        bind_address = 0.0.0.0
      [cors] <-- section
        origins = *

Resources:
----------
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

var request2 = new XMLHttpRequest(); // TODO think up a better name

request2.onreadystatechange = function () {
    // console.log("onreadystatechange: " + request2.readyState + ", " + request2.status);
    // console.log(request2.responseText);
    if (request2.readyState === 4) {
        if (request2.status === 200) {
            var response = JSON.parse(request2.responseText);
            setHandler[response._id](response);
        }
        if (request2.status === 404) {
            var json = JSON.parse(request2.responseText);
            if (json.reason === "no_db_file") {
                createDB();
            } else {
                var url = request2.responseURL;
//              console.log(typeof(url));
                var i = url.lastIndexOf("/", url.length - 1);
                var name = url.substring(i + 1);
                setHandler[name]({"_id": name});
            }
        }
    }
};

function getCheckedRadio(name) {
    var options = document.getElementsByName(name);
    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (option.checked) {
            return option.value;
        }
    }
    return null;
}

function set(name) {
    //console.log("set::name = " + name);
    //console.log("set::GET = " + dburl + name);
    request2.open("GET", dburl + name, false);
    request2.send();
}

function put(response, message) {
    //console.log("put::response = " + response);
    //console.log("put::message = " + message);
    request2.open("PUT", dburl + response._id, false);
    request2.setRequestHeader("Content-type", "application/json");
    message["_id"] = response._id;
    if (response._rev) {
        message["_rev"] = response._rev;
    }
    var s = JSON.stringify(message);
//  console.log("put: " + s);
    request2.send(s);
}

function createDB() {
    request2.open("PUT", dburl, false);
    request2.send();
}

function reset() {

}

///////////////////////////////////////////////////////////////////////////////
// your code below

var dbname = "gmci_hello_lecture";
var dburl = "http://127.0.0.1:5984/" + dbname + "/";
var setHandler = {
    "questions": setQuestion,
    "surveys": setSurvey,
    "simulation": setSimulation
};


function setMarked(button, doc) {
    button.classList.add("marked");
    set(doc);
}

// Question
function setQuestion(response) {
    var actions = document.getElementsByClassName("marked");
    for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        action.classList.remove("marked");
        switch (action.className) {
            case "sendNewQuestionButton":
                addNewQuestion(response);
                break;
            case "sendReplyButton":
                addNewReply(action, response);
                break;
            case "increment up":
                upvote(action, response, 'human');
                break;
            default:
                action.classList.add("marked");
                return;
        }
    }
	
	// Bot upvotes random answers
	var botActions = document.getElementsByClassName("botMarked");
	/*if(botActions.length > 0) {
		upvote(botActions[0], response, 'bot');
		botActions[0].classList.remove("botMarked");
	}*/
	for (var i = 0; i < botActions.length; i++) {
        var bAction = botActions[i];

		bAction.classList.remove("botMarked");
        switch (bAction.className) {
			case "increment up":
				upvote(bAction, response, 'bot');
                break;
            /*case "sendNewQuestionButton":
                //addNewQuestion(response);
                break;
            case "sendReplyButton":
                //addNewReply(action, response);
                break;
            
            default:
                //action.classList.add("marked");
                break;*/
        }
    }
    
}

function addNewQuestion(response) {
    var questionArray = response.questionArray ? response.questionArray : [];
    var newQuestionText = document.getElementById("newQuestionText").value;
    //console.log("Lenght of questions: " + questionArray.length);
    for (var i = 0; i < questionArray.length; i++) {
        var question = questionArray[i];
        if (question.text === newQuestionText) {
            setActive(document.getElementById(getQuestionID(question)).getElementsByClassName("accordion")[0]);
            return;
        }
    }

    var newQuestion = {text: newQuestionText, upvotes: Math.floor(Math.random() * 100), responses: []};
    // var newQuestion = {text: newQuestionText, upvotes: 0, responses: {}};
    questionArray.push(newQuestion);
    questionArray.sort(function (a, b) {
        return b.upvotes - a.upvotes;
    });
    put(response, {"questionArray": questionArray});
}

function addNewReply(action, response) {
    var questionArray = response.questionArray;
    if (!questionArray) return;  // Cannot be empty when reply to question wanna be added
    var thisQuestionID = action.id.substring(0, action.id.length - 7);
    //console.log(thisQuestionID);
    var replyText = document.getElementById(thisQuestionID + "_INPUT").value;
    for (var i = 0; i < questionArray.length; i++) {  // Find right question
        var question = questionArray[i];
        if (getQuestionID(question) === thisQuestionID) {
            for (var j = 0; j < question.responses.length; j++) {  // Is question already in answers
                var resp = question.responses[j];
                if (resp[0] === replyText) {
                    resp[1] += 1;
                }
            }
            question.responses.push([replyText, 0]);
            question.responses.sort(function (a, b) {
                return b[1] - a[1];
            });
            break;
        }
    }
    put(response, {"questionArray": questionArray})
}

function upvote(action, response, type) {
    var answerID = action.id.substring(0, action.id.length - 8);
	if(type == 'human')
		action.onclick = null;
    var questionArray = response.questionArray ? response.questionArray : [];
    for (var i = 0; i < questionArray.length; i++) {
        var question = questionArray[i];
        for (var j = 0; j < question.responses.length; j++) {
            var answer = question.responses[j];
            if (getAnswerID(question, answer) === answerID) {
                question.responses[j][1] += 1;
				
				if(type == 'bot') {
					var rdVotes = Math.floor((Math.random() * 5) + 1); // from 1 to 5 upvotes by bot at the same time
					console.log("BOT has upvoted for " + action.id + ". Old: " + question.responses[j][1] + ", New: " + (question.responses[j][1]+rdVotes));
					question.responses[j][1] += rdVotes;
				}
				
				
                //console.log(questionArray[i].responses);
                questionArray[i].responses = question.responses.sort(function (a, b) {
                    return b[1] - a[1];
                });
                //console.log(questionArray[i].responses);
                put(response, {"questionArray": questionArray});
                return;
            }
        }
    }
}

// Surveys
function setSurvey(response) {
    var actions = document.getElementsByClassName("marked");
    for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        action.classList.remove("marked");
        switch (action.className) {
            case "addNewSurveyButton":
                addNewSurvey(response);
                break;
            case "choiceLabel":
                voteChoice(action, response);
                break;
            default:
                action.classList.add("marked");
                return;
        }
    }
}

function addNewSurvey(response) {
    var surveyArray = response.surveyArray ? response.surveyArray : [];
    var newSurveyName = "New beautiful Survey (" + surveyArray.length + ")";

    var newSurvey = {text: newSurveyName, state: 0, choices: {"Current Answer1": 0, "Current Answer2": 0}};
    surveyArray.push(newSurvey);
    put(response, {"surveyArray": surveyArray});
}

function voteChoice(action, response) {
    // curQuestionId global variable from woz updater
    var surveyArray = response.surveyArray;
    if (!surveyArray) return;  // Cannot be empty when reply to survey wanna be added

    var splittedID = action.id.split("_______");
    var thisSurveyID = splittedID[0];
    var thisChoice = splittedID[1];
    //console.log(thisSurveyID + "; " + thisChoice);
    for (var i = 0; i < surveyArray.length; i++) {  // Find right survey
        var survey = surveyArray[i];
        if (getSurveyID(survey) === thisSurveyID) {
            survey.choices[thisChoice] += 1;
            break;
        }
    }
    document.getElementById(thisSurveyID).classList.add("replaceable");
    put(response, {"surveyArray": surveyArray});
}

function setSimulation(response) {
    put(response, {
        "simulateSurvey": document.getElementById("surveyVotes").checked,
        "simulateQuestion": document.getElementById("questionVotes").checked,
        "simulateAnswer": document.getElementById("answerVotes").checked
    });
}
