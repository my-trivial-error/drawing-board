var texteditium = document.getElementById("textedithide");
                    var teIcon = document.getElementById("textEditIcon");
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
                    teIcon.addEventListener("mousedown", function(e) {
                        hideTextedit();
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
                    });
// Make the DIV element draggable:
            dragElement(document.getElementById("tab"));
            function dragElement(elmnt) {
                var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
                if (document.getElementById("safeguard")) {
                    // if present, the header is where you move the DIV from:
                    document.getElementById("safeguard").onmousedown = dragMouseDown;
                } else {
                    // otherwise, move the DIV from anywhere inside the DIV:
                    elmnt.onmousedown = dragMouseDown;
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
                    elmnt.style.top = (elmnt.offsetTop - pos2)/2.2 + "px";
                    elmnt.style.left = (elmnt.offsetLeft - pos1)/2.2 + "px";
                }
                function closeDragElement() {
                    // stop moving when mouse button is released:
                    document.onmouseup = null;
                    document.onmousemove = null;
                    pos3 = pos1 + e.clientX;
                    pos4 = pos2 + e.clientY; // was in elementDrag
                    // pos3 = pos1;
                    // pos4 = pos2;
                }
            }
            
            // Make the DIV element draggable:
            dragElemen(document.getElementById("textedit"));
            function dragElemen(elmnt) {
                var pos11 = 0, pos21 = 0, pos31 = 0, pos41 = 0;
                if (document.getElementById("safeguard1")) {
                    // if present, the header is where you move the DIV from:
                    document.getElementById("safeguard1").onmousedown = dragMouseDow;
                } else {
                    // otherwise, move the DIV from anywhere inside the DIV:
                    elmnt.onmousedown = dragMouseDow;
                }
                function dragMouseDow(e) {
                    e = e || window.event;
                    e.preventDefault();
                    // get the mouse cursor position at startup:
                    pos31 = e.clientX;
                    pos41 = e.clientY;
                    document.onmouseup = closeDragElemen;
                    // call a function whenever the cursor moves:
                    document.onmousemove = elementDra;
                }
                function elementDra(e) {
                    e = e || window.event;
                    e.preventDefault();
                    // calculate the new cursor position:
                    pos11 = pos31 - e.clientX;
                    pos21 = pos41 - e.clientY;
                    // set the element's new position:
                    elmnt.style.top = (elmnt.offsetTop - pos21)/2.2 + "px";
                    elmnt.style.left = (elmnt.offsetLeft - pos11)/2.2 + "px";
                }
                function closeDragElemen() {
                    // stop moving when mouse button is released:
                    document.onmouseup = null;
                    document.onmousemove = null;
                    pos31 = pos11 + e.clientX;
                    pos41 = pos21 + e.clientY;
                    // pos31 = pos11;
                    // pos41 = pos21;
                }
            }
