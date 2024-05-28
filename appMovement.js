var nameApp = document.getElementById("nameApp");
var texteditium = document.getElementById("textedithide");
var teIcon = document.getElementById("textEditIcon");
var finder = document.getElementById("finder");
finder.addEventListener("mousedown", function(e) {
    nameApp.innerHTML = "Finder";
});
function hideTextedit() {
    var textedittab = document.getElementById("textedit");
    textedittab.classList.toggle("changedHide");
    // alert(tab.className);
    /* if (tab.className === "changedHide") {
        tab.classList.toggle("hide");
    } */
}
texteditium.addEventListener("mousedown", function(e) {
    hideTextedit();
});
// for TextEdit
teIcon.addEventListener("mousedown", function(e) {
    hideTextedit();
    nameApp.innerHTML = "TextEdit";
});
var chromium = document.getElementById("chromehide");
var chromeIcon = document.getElementById("googleIcon");
function hideChrome() {
    var tab = document.getElementById("tab");
    tab.classList.toggle("changedHide");
    // alert(tab.className);
    /* if (tab.className === "changedHide") {
        tab.classList.toggle("hide");
    } */
}
chromium.addEventListener("mousedown", function(e) {
    hideChrome();
});
chromeIcon.addEventListener("mousedown", function(e) {
    hideChrome();
    nameApp.innerHTML = "Chrome";
});
// Make the DIV element draggable:
dragElement(document.getElementById("tab"), document.getElementById("safeguard"));
// dragElement(document.getElementById("textedit"));
    function dragElement(elmnt, pull) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (pull) {
            // if present, the header is where you move the DIV from:
            pull.onmousedown = dragMouseDown;
        }
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop + e.clientY)/2.6 + "px";
            elmnt.style.left = (elmnt.offsetLeft + e.clientX)/2.6 + "px";
        }
        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
            // pos3 = pos1 - e.clientX;
            // pos4 = pos2 - e.clientY; // was in elementDrag
            pos1 = pos3;
            pos2 = pos4;
        }
    }
dragElement(document.getElementById("textedit"), document.getElementById("safeguard1"));
dragElement(document.getElementById("asdf"), document.getElemenntById("wutt"));
var webpage1 = document.getElementById("webpageUp");
var webpage2 = document.getElementById("webpageUp2");
function changeTabs() {
    webpage1.classList.toggle("grapes");
    webpage2.classList.toggle("apples");
}
document.addEventListener("dblclick", function(e) {
    nameApp.innerHTML = "Finder";
});
var asdfd = document.getElementById("asdfd");
var eee = document.getElementById("eee");
function hideSys() {
    var asdf = document.getElementById("asdf");
    asdf.classList.toggle("changedHide");
}
eee.addEventListener("mousedown", function(e) {
    hideSys();
});
asdfd.addEventListener("mousedown", function(e) {
    hideSys();
    nameApp.innerHTML = "System Preferences";
});
greenButton = document.getElementById("greenButtonChrome");
function fullScreen() {
    tab.style.width = "100%";
    tab.style.width = "100%";
}
