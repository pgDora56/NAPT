/// ==UserScript==
// @name         NAPT - NQA2 AutoPaste & Send Tool
// @namespace    https://github.com/pgDora56
// @version      1.1.1
// @description  Auto paste for NQA2's chat-area & send, and more
// @author   Dora F.
// @match    https://powami.herokuapp.com/nqa2/*
// @license		 MIT License
// @grant        GM_setValue, GM_getValue
// @supportURL	https://github.com/pgDora56/NAPT/issues
// @updateURL	https://raw.githubusercontent.com/pgDora56/NAPT/master/napt.user.js
// ==/UserScript==

var i, movelink;
var hotkeyBox = null;
var hotkeylines = [];
var body = document.querySelector("body");
const defhotkey = "m:(o・∇・o)\nn:(*>△<)\nk:草";
var config = document.getElementById("config-window");
config.querySelector(".ui.form").insertAdjacentHTML('beforeend','<div class="ui dividing header">NAPT\'s Hotkey</div>'+
                                                    '<p>現状、アルファベットのみ対応しています(小文字で指定してください)。複数指定した場合は最初に指定されたものが適用されます。</p>'+
                                                    '<p>q,w,eのキーなど、正誤判定者で使用するHotkeyと同じ文字を指定した場合は両方の挙動がなされますので注意して設定してください。</p>'+
                                                    '<p>個数に制限はありませんが、多く設定しすぎると送信までの処理時間が長くなる可能性があります。</p>'+
                                                    '<div class="field"><textarea id="napt-hotkey">' + defhotkey + '</textarea></div>');
hotkeyBox = document.getElementById("napt-hotkey");
importHotkey();
refreshHotkey();

//
// Provider setting
var isProvider = window.location.href.slice(-8) == "provider";
var barcolor = isProvider ? "sienna" : "darkblue";
document.querySelector(".ui.dividing.header").style.display = "none";
document.querySelector(".page-header").style = "background-color: " + barcolor + ";";

if(isProvider){
    movelink = window.location.href.slice(0, -8) + "player";
}
else{
    movelink = window.location.href.slice(0, -6) + "provider";
}
document.querySelector("h1").innerHTML = "<a href='" + movelink + "'>" + "Nagaya Quiz Arena 2 with NAPT</a>";

var cb = document.getElementById("correct-button");
var wb = document.getElementById("wrong-button");
var tb = document.getElementById("through-button");
var consoleApply = config.querySelector(".ui.positive.right.submit.button");
var chatbox = document.querySelector(".chat-box");

cb.innerHTML = "正解(Q)";
wb.innerHTML = "誤答(W)";
tb.innerHTML = "スルー(E)";
consoleApply.addEventListener("click", refreshHotkey);

var INPUTS = ['INPUT', 'TEXTAREA'];
document.addEventListener('keydown', function (e) {
    // Key Down
    if (INPUTS.indexOf(e.target.tagName) == -1) { // Do not process when input texts
        var pressed = String.fromCharCode(e.which).toLowerCase();
        pressed = (e.altKey ? 'A' : '') + (e.shiftKey ? 'S' : '') + pressed;
        var num = pressed - "0";

        if(num > 0 && num <= 2) {
            var msg = "";
            for(var i = 0; i < num; i++) {
                msg += "推";
            }
            chat(msg);
        }
        else if(num >= 3 && num <= 9) {
            chat("推×" + num);
        }
        else{
            var match = hotkeylines.filter(line => line.key == pressed);
            if(match.length > 0){
                chat(match[0].content);
            }
        }

        if(isProvider){
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
            else if(pressed == "Ar") {
                nyRule();
            }
            else if(pressed == "f") {
                var freezeplus = document.querySelector(".player.selected").querySelector(".freeze-plus.ui.compact.icon.button");
                for(i = 0; i < 9; i++) {
                    freezeplus.click();
                }
            }
            // else if(pressed == "z") {
            //     var wroplus = document.querySelector(".player.selected").querySelector(".wrong-plus.ui.icon.red.button");
            //     for(i = 0; i < 41700; i++) {
            //         wroplus.click();
            //     }
            // }
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

function refreshHotkey() {
    var puretext = new DOMParser().parseFromString(hotkeyBox.value, 'text/html').documentElement.textContent;
    hotkeylines = puretext.split('\n')
      .filter(line => line.length > 2)
      .filter(line => line.slice(1,2) == ":")
      .map(line => ({
          key: line.slice(0,1),
          content: line.slice(2),
      }));
    exportHotkey();
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
        while(cVal > 0 && wVal > 0) {
            cbut.click();
            wbut.click();
            cVal--;
            wVal--;
        }
    });
}


// Data Translate to local(for hotkey settings) ========================================================
function importHotkey() {
    var value = window.localStorage.getItem("hotkey");
    if(value != null){ hotkeyBox.value = value; }
    else{ hotkeyBox.value = defhotkey; }
}

function exportHotkey() {
    window.localStorage.setItem("hotkey", hotkeyBox.value);
}

