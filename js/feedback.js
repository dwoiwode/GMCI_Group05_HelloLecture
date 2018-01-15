
var counter=0;
function addFeedbackfield(button){
        if(counter==0) {
            var feld = document.createElement('input');
            var sendButton = document.createElement('button');
            sendButton.innerText = "send Feedback";

            sendButton.addEventListener("click", function () {
                feld.value = "";
                location.href='feedback_response.html'
            });

            var form = document.getElementById('feedback_window');

            form.appendChild(feld);
            form.appendChild(sendButton);
            counter=counter+1;
            button.style.backgroundColor="Green";
        }


}