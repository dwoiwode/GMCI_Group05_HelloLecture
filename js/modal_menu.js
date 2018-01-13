/* show and hide modal menu*/

var modal = document.getElementById('menu');
var btn = document.getElementById("menu-btn");

btn.onclick = function() {
    modal.style.display = "grid";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};
