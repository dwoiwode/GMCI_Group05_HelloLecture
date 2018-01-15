
function addAccordionEventListener(accordion) {
    accordion.addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
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

