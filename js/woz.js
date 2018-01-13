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
    console.log("onreadystatechange: " + request2.readyState + ", " + request2.status);
    console.log(request2.responseText);
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
    console.log("set::name = " + name);
    console.log("set::GET = " + dburl + name);
    request2.open("GET", dburl + name, false);
    request2.send();
}

function put(response, message) {
    console.log("put::response = " + response);
    console.log("put::message = " + message);
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

///////////////////////////////////////////////////////////////////////////////
// your code below

var dbname = "gmci_hello_lecture";
var dburl = "http://127.0.0.1:5984/" + dbname + "/";
var setHandler = {
    "questions": setQuestion,
    //"surveys": setSurvey,
};

// Question
function setQuestion(response) {

    questionArray = response.questionArray ? response.questionArray : [];
    var newQuestionText = document.getElementById("newQuestion").value;
    console.log("Lenght of questions: " + questionArray.length);
    for (var i=0;i<questionArray.length; i++) {
        var question = questionArray[i];
        if (question.text === newQuestionText) {
            return;
        }
    }
    var newQuestion = {text: newQuestionText, upvotes: 0, responses: {}};
    questionArray.push(newQuestion);
    // TODO: Sort questions by upvotes
    put(response, {"questionArray":response.questionArray});
}

function setSurvey(response) {
}

function mytext(response) {
    // Old functions
    var src = getCheckedRadio("animalImage");
    var width = parseInt(document.getElementById("animalWidth").value);
    put(response, {"src": src, "width": width});


    var value = response.value ? response.value : 0;
    // console.log(value);
    put(response, {"value": value + 1});

    var checked = document.getElementById("showCounter").checked;
    // console.log(checked);
    put(response, {"checked": checked});

    var value = document.getElementById("mytext").value;
//  console.log("mytext::value = " + value);
    put(response, {"value": value});
}
