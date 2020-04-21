// ==UserScript==
// @name         NAPT - NQA2 AutoPaste & Send Tool
// @namespace    https://github.com/pgDora56
// @version      0.9
// @description  Auto paste for NQA2's chat-area & send, and more
// @author   Dora F.
// @match    https://powami.herokuapp.com/nqa2/*
// @license		 MIT License
// @grant        none
// @supportURL	https://github.com/pgDora56/NAPT/issues
// @updateURL	https://raw.githubusercontent.com/pgDora56/NAPT/master/napt.user.js
// ==/UserScript==

var i;
var body = document.querySelector("body");

document.querySelector(".ui.dividing.header").style.display = "none";
document.querySelector(".page-header").style = "background-color: sienna;";
document.querySelector("h1").innerHTML = "Nagaya Quiz Arena 2 with NAPT"
//
// Provider setting
var isProvider = window.location.href.slice(-8) == "provider";

var cb = document.getElementById("correct-button");
var wb = document.getElementById("wrong-button");
var tb = document.getElementById("through-button");
var chatbox = document.querySelector(".chat-box");

cb.innerHTML = "正解(Q)";
wb.innerHTML = "誤答(W)";
tb.innerHTML = "スルー(E)";

var INPUTS = ['INPUT', 'TEXTAREA'];
document.addEventListener('keydown', function (e) {
    // Key Down
    if (INPUTS.indexOf(e.target.tagName) == -1) { // Do not process when input texts
        var pressed = String.fromCharCode(e.which).toLowerCase();
        pressed = (e.shiftKey ? 'S' : '') + pressed;
        var num = pressed - "0";
        // console.log(pressed + " Push:" + num);

        if(pressed == "m"){
            chat("(o・∇・o)");
        }
        else if(pressed == "n"){
            chat("(*>△<)");
        }
        else if(pressed == "o") {
            chat("推");
        }
        else if(num > 0 && num <= 3) {
            var msg = "";
            for(var i = 0; i < num; i++) {
                msg += "推";
            }
            chat(msg);
        }
        else if(num >= 4 && num <= 9) {
            chat("推×" + num);
        }
        else if(pressed == "k") {
            chat("草");
        }
        else if(isProvider){
            if(pressed == "q"){
                cb.click();
            }
            else if(pressed == "w") {
                wb.click();
            }
            else if(pressed == "e") {
                tb.click();
            }
            else if(pressed == " ") {
                pasteAndSend();
            }
            else if(pressed == "Sr") {
                document.getElementById("show-rule-window").click();
                document.getElementById("rule-window").querySelector(".ui.positive.right.submit.button").click();
            }
            else if(pressed == "r") {
                nyRule();
            }
            else if(pressed == "f") {
                var freezeplus = document.querySelector(".player.selected").querySelector(".freeze-plus.ui.compact.icon.button");
                for(i = 0; i < 9; i++) {
                    freezeplus.click();
                }
            }
        }
    }
}, false);


function pasteAndSend(){
    var songdata = "No data";
    if(navigator.clipboard){
        navigator.clipboard.readText()
            .then(function(text){
            songdata = text;
        });
    }
    setTimeout(function() {
        send(songdata);
    },500);
}

function send(data) {
    var remain = "";
    if(data.length > 100){
        remain = data.slice(100);
        data = data.slice(0, 100);
    }
    chat(data);
    if(remain != "") send(remain);
}

function chat(comment) {
    chatbox.value = comment;
    document.querySelector('.ui.blue.icon.submit.button').click();
}

function nyRule() {
    var pls = document.querySelectorAll(".player");
    pls.forEach(pl => {
        var cele = pl.querySelector(".correct.score.ui.green.small.middle.aligned.statistic");
        var wele = pl.querySelector(".wrong.score.ui.red.small.middle.aligned.statistic");
        var cVal = cele.querySelector(".score-value").innerHTML;
        var wVal = wele.querySelector(".score-value").innerHTML;
        var cbut = pl.querySelector(".correct-minus.ui.icon.green.button");
        var wbut = pl.querySelector(".wrong-minus.ui.icon.red.button");
        while(cVal != 0 && wVal != 0) {
            cbut.click();
            wbut.click();
            cVal--;
            wVal--;
        }
    });
}
