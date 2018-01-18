function addFeedbackfield(button) {
    var field = document.getElementById("feedBack_field");
    field.style.visibility = "visible";
    var btn = document.getElementById("feedback_btn");
    btn.style.visibility = "visible";

    if (button.value === "Positive") {
        button.style.backgroundColor = "Green";
        document.getElementById("negative_btn").style.backgroundColor = "#00A8CF";

    }
    else {
        button.style.backgroundColor = "Darkred";
        document.getElementById("positive_btn").style.backgroundColor = "#00A8CF";
    }

}
