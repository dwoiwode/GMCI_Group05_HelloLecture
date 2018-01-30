
function addAccordionEventListener(accordion) {
    accordion.addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        console.log(panel);
		if(this.classList[1] == "active") {
			this.style.backgroundImage = "url('../emoji/arrow_up.png')";
			this.style.backgroundRepeat = "no-repeat";
			this.style.transition = "false";
		} else {
			this.style.backgroundImage = "url('../emoji/arrow_down.png')";
		}
        if (panel.style.maxHeight){
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    });
}

function setActive(accordion) {
    accordion.classList.toggle("active",true);
    var panel = accordion.nextElementSibling;
    panel.style.maxHeight = panel.scrollHeight + "px";
}


