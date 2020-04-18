// ==UserScript==
// @name         NAPT - NQA2 AutoPaste & Send Tool
// @namespace    https://github.com/pgDora56
// @version      0.1
// @description  Automatically paste and send the copied song information etc. at the time of questioning in NQA2
// @author   Dora F.
// @match    https://powami.herokuapp.com/nqa2/*/provider
// @license		 MIT License
// @grant        none
// ==/UserScript==

function pasteAndSend(){
    var chatbox = document.querySelector(".chat-box");
    if(navigator.clipboard){
        navigator.clipboard.readText()
            .then(function(text){
            chatbox.value = text;
        });
    }
    setTimeout(function() {
        document.querySelector('.ui.blue.icon.submit.button').click();
    },500);
}

var cb = document.getElementById("openboards-button");
cb.onclick = pasteAndSend;
