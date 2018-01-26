function addFeedbackfield(button) {
    var field = document.getElementById("feedBack_field");
    field.style.visibility = "visible";
    var btn = document.getElementById("feedback_btn");
    btn.style.visibility = "visible";
	
	var pos_emj = document.getElementById("positive_emj");
	var neg_emj = document.getElementById("negative_emj");

    if (button.value === "Positive") {
        button.style.backgroundColor = "Green";
        document.getElementById("negative_btn").style.backgroundColor = "#00A8CF";
		
		pos_emj.style.visibility = "visible";
		neg_emj.style.visibility = "hidden";
    }
    else {
        button.style.backgroundColor = "Darkred";
        document.getElementById("positive_btn").style.backgroundColor = "#00A8CF";
		
		neg_emj.style.visibility = "visible";
		pos_emj.style.visibility = "hidden";
	}

}
