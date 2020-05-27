/// ==UserScript==
// @name         NAPT - NQA2 AutoPaste & Send Tool
// @namespace    https://github.com/pgDora56
// @version      1.5.0
// @description  Auto paste for NQA2's chat-area & send, and more
// @author   Dora F.
// @match    https://powami.herokuapp.com/nqa2/*
// @license		 MIT License
// @grant        GM_setValue, GM_getValue
// @supportURL	https://github.com/pgDora56/NAPT/issues
// @updateURL	https://raw.githubusercontent.com/pgDora56/NAPT/master/napt.user.js
// ==/UserScript==

var debug_mode = false;

var i, movelink;
var hotkeyBox = null;
var hotkeylines = []; var playerHotkeylines = [];
var body = document.querySelector("body");
const defhotkey = "m:(o・∇・o)\nn:(*>△<)\nk:草";
var config = document.getElementById("config-window");
var goConfigButton = document.getElementById("show-config-window");
var flavors;

//
// Provider setting
var isProvider = (window.location.href.slice(-8) == "provider" || window.location.href.slice(-9) == "provider?" );
var displayRank = window.location.href.slice(-1) == "?";
var barcolor = isProvider ? "sienna" : "darkblue";

//
// Element Definition
var cb = document.getElementById("correct-button");
var wb = document.getElementById("wrong-button");
var tb = document.getElementById("through-button")
var consoleApply = config.querySelector(".ui.positive.right.submit.button");
var chatbox = document.querySelector(".chat-box");
var score = [];

initialization();
var INPUTS = ['INPUT', 'TEXTAREA'];
document.addEventListener('keydown', function (e) {
    // Key Down
    if (INPUTS.indexOf(e.target.tagName) == -1) { // Do not process when input text
        updateScoreData(); // なんか押されたらRankを更新させる
        var pressed = String.fromCharCode(e.which).toLowerCase();
        var keycode = e.which;
        pressed = (e.altKey ? 'A' : '') + (e.shiftKey ? 'S' : '') + pressed;
        if(debug_mode) console.log("Key Press: " + pressed + ", Key Code: " + keycode);
        var num = keycode - 48;

        if(num >= 0 && num <= 2) {
            var msg = "";
            for(var i = 0; i < num; i++) {
                msg += "推";
            }
            if(num==0) msg = "推×10";
            chat(msg);
        }
        else if(num >= 3 && num <= 9) {
            chat("推×" + num);
        }
        else if(keycode == 219){
            // Push [
            flavorSwap(1);
        }
        else if(keycode == 221){
            // Push ]
            flavorSwap(2);
        }
        else{
            var match = [];
            if(!isProvider) {
                match = playerHotkeylines.filter(line => line.key == pressed);
            }
            if(match.length == 0) {
                match = hotkeylines.filter(line => line.key == pressed);
            }
            if(match.length > 0){
                if(match[0].content == "%board-correct%"){
                    var selected = document.getElementById("players").querySelectorAll('.player.selected');
                    chat("正誤判定＞正解者：" + selected.length + "人");
                    cb.click();
                }
                else chat(match[0].content);
            }
        }
//         if(pressed == "z"){
//             for(i = 0; i < 41700; i++) {
//                 chat("モチョカワイイネー");
//             }
//             chat("(*>△<)");
//         }

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
            else if(pressed == "a") {
                var players = document.getElementById("players").querySelectorAll('.player');
                players.forEach(pl => pl.click());
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
//             else if(pressed == "z") {
//                 var wroplus = document.querySelector(".player.selected").querySelector(".wrong-plus.ui.icon.red.button");
//                 for(i = 0; i < 41700; i++) {
//                     wroplus.click();
//                 }
//              }
        }
    }
}, false);

function initialization() {
    config.querySelector(".ui.form").insertAdjacentHTML('beforeend','<div class="ui dividing header">NAPT\'s Commands</div>'+
                                                        '<p>アルファベットの小文字で指定してください。複数指定した場合は最初に指定されたものが適用されます。</p>'+
                                                        '<p>AltとShiftの修飾キーが使用可能です。Altを使いたい場合はAを、Shiftを使いたい場合はSをアルファベットの前に付けてください。</p>' +
                                                        '<p>q,w,eのキーなど、正誤判定者で使用するHotkeyと同じ文字を指定した場合は両方の挙動がなされますので注意して設定してください。先頭に!をつけるとPlayer時のみに適用されるHotkeyとすることができます。</p>'+
                                                        '<p>個数に制限はありませんが、多く設定しすぎると送信までの処理時間が長くなる可能性があります。</p>'+
                                                        '<div class="field"><textarea id="napt-hotkey">' + defhotkey + '</textarea></div>\n');

    config.querySelector(".fields").insertAdjacentHTML('beforeend', '<div class="field"><label>flavor-sub1</label><input type="text" id="flavor1" maxlength="10"></div>'
                                                      +'<div class="field"><label>flavor-sub2</label><input type="text" id="flavor2" maxlength="10"></div>')
    //document.querySelector(".five.wide.column").insertAdjacentHTML('beforeend', '<div id="rank"></div>');
    if(displayRank){
        document.querySelector(".game-view.ui.divided.grid").insertAdjacentHTML('afterbegin', '<div class="two wide column"><div id="rank"></div></div>');
        document.querySelector(".eleven.wide.column").setAttribute("class", "nine wide column");
    }
    hotkeyBox = document.getElementById("napt-hotkey");
    importHotkey();
    refreshHotkey();

    document.querySelector(".ui.dividing.header").style.display = "none";
    document.querySelector(".page-header").style = "background-color: " + barcolor + ";";

    var link = window.location.href;
    if(displayRank) link = link.slice(0,-1);
    if(isProvider){
        movelink = link.slice(0, -8) + "player";
    }
    else{
        movelink = link.slice(0, -6) + "provider";
    }
    document.querySelector("h1").innerHTML = "<a href='" + movelink + (displayRank ? "?" : "" ) + "'>" + "Nagaya Quiz Arena 2 with NAPT</a>";
    cb.innerHTML = "正解(Q)";
    wb.innerHTML = "誤答(W)";
    tb.innerHTML = "スルー(E)";

    if(isProvider) {
        cb.addEventListener("click", checkThrough, false);
        tb.addEventListener("click", checkThrough, false);
    }
    consoleApply.addEventListener("click", function () {
        refreshHotkey();
        if(flavors == null) flavors = [config.querySelector(".name").value, config.querySelector(".flavor").value, document.getElementById("flavor1").value, document.getElementById("flavor2").value];
    });
    goConfigButton.addEventListener("click", function() {
        if(flavors != null){
            config.querySelector(".flavor").value = flavors[1];
            document.getElementById("flavor1").value = flavors[2];
            document.getElementById("flavor2").value = flavors[3];
        }
        flavors = null;
    });
}

// スルーアラート設定
var alertcount = 0; // 何回目のアラートかをカウント（キャンセル済みかを確認する）
var throughAlert = false;

function checkThrough(){
    if(!throughAlert) return;
    document.querySelector('.dimmable').style.backgroundColor = "white";
    alertcount++;
    var al = alertcount;
    setTimeout(function() {
        if(alertcount <= al) document.querySelector('.dimmable').style.backgroundColor = "yellow";
    },15000);
}


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
    // 特殊コマンドによる設定を初期化
    throughAlert = false;

    // 本チャン処理
    var puretext = new DOMParser().parseFromString(hotkeyBox.value, 'text/html').documentElement.textContent;

    var lines = puretext.split('\n').filter(line => line.indexOf(":") != -1);

    playerHotkeylines = [];
    hotkeylines = [];

    lines.forEach(line => {
        var len = line.length;
        var keyt = ""; var cont = "";
        var slicestart = (line.charAt(0)=="!") ? 1 : 0;

        for(i=slicestart;i<len;i++){
            if(line.charAt(i)==":"){
                keyt = line.slice(slicestart,i);
                cont = line.slice(i+1);
            }
        }
        if(keyt == ""){
            // 特殊コマンドの処理
            if(cont=="alert"){
               throughAlert = true;
            }
        }
        else{
            if(slicestart == 1){
                playerHotkeylines.push({
                    key: keyt,
                    content: cont,
                });
            }
            else{
                hotkeylines.push({
                    key: keyt,
                    content: cont,
                });
            }
        }
    });
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

function flavorSwap(id){
    var prevflavor = flavors[1];
    flavors[1] = flavors[id+1];
    flavors[id+1] = prevflavor;

    config.querySelector(".name").value = flavors[0];
    config.querySelector(".flavor").value = flavors[1];
    consoleApply.click();
}

function updateScoreData(){
    if(!displayRank) return;
    var players = document.getElementById("players").getElementsByClassName('player');
    score = [];

    // playerをすべて取得
    for(i=0;i<players.length;i++){
        var n = players[i].getElementsByClassName("name");
        var scores = players[i].getElementsByClassName("score-value");
        score.push([0,n[0].textContent, scores[0].textContent, scores[1].textContent]);
    }

    // Sort(丸数→罰数)
    score.sort(function(a,b){
        if(a[2] > b[2]) return -1;
        if(a[2] < b[2]) return 1;
        if(a[3] < b[3]) return -1;
        if(a[3] > b[3]) return 1;
        return 0;
    });

    // 順位を修正
    var rank = 1;
    score[0][0] = 1;
    for(i=1;i<score.length;i++){
       if(score[i-1][2] != score[i][2] || score[i-1][3] != score[i][3]){
           rank = i + 1;
       }
       score[i][0] = rank;
    }

    // HTML生成
    var text = '<table>';
    for(i=0;i<score.length;i++){
        text += "<tr><td>" + score[i][0] + ".</td><td>" + score[i][1] + "</td><td>:" + score[i][2] + "</td><td>-</td><td>" + score[i][3] + "</td></tr>";
    }
    text += "</table>";

    // HTML更新
    document.getElementById("rank").innerHTML = text;
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
