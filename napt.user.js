/// ==UserScript==
// @name         NAPT - NQA2 AutoPaste & Send Tool
// @namespace    https://github.com/pgDora56
// @version      1.8.0
// @description  Auto paste for NQA2's chat-area & send, and more
// @author   Dora F.
// @match    https://penpenpng.com/nqa2/*
// @license		 MIT License
// @grant GM_setValue
// @grant GM_getValue
// @supportURL	https://github.com/pgDora56/NAPT/issues
// @updateURL	https://raw.githubusercontent.com/pgDora56/NAPT/master/napt.user.js
// ==/UserScript==

var debug_mode = false;

var i, movelink;
var hotkeyBox = null; var gamepadKeycheck = null;
var hotkeylines = []; var playerHotkeylines = []; var gamepadShortcut = {};
var body = document.querySelector("body");
const defhotkey = "m:(o・∇・o)\nn:(*>△<)\nk:草";
var config = document.getElementById("config-window");
var goConfigButton = document.getElementById("show-config-window");
var flavors;

//
// Provider setting
var isProvider = (window.location.href.slice(-8) == "provider" || window.location.href.slice(-9) == "provider?" || window.location.href.slice(-14) == "provider?board");
var displayRank = window.location.href.slice(-1) == "?";
var easyBoard = window.location.href.slice(-6) == "?board";
if(easyBoard && !isProvider) {
    var boardsub = `<div id="board-window-sub" style="width:75%; margin:0 auto;"> <div class="content"> <div class="ui form"> <div class="field"> <textarea class="board" rows="2" maxlength="20"></textarea> </div> </div> </div> <div class="actions">  <div id="sub-submit" class="ui positive right submit button" style="width: 100%;"'> Submit </div> </div> </div>`
    //document.getElementById("board-window").remove();
    document.getElementById("show-board-window").remove();
    document.getElementById("controlbar").insertAdjacentHTML('beforebegin', boardsub);
}
var barcolor = isProvider ? "sienna" : "darkblue";


//
// Element Definition
var cb = document.getElementById("correct-button");
var wb = document.getElementById("wrong-button");
var tb = document.getElementById("through-button");
var sb = document.getElementById("slash-button");

var consoleApply = config.querySelector(".ui.positive.right.submit.button");
var chatbox = document.querySelector(".chat-box");
var mainboardArea = document.getElementById("board-window");
var subboardArea = document.getElementById("board-window-sub");
var score = [];

initialization();
window.addEventListener("load", onloadInitialization);

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
        } else { // player
            if(keycode == 13 && sb.textContent == "Standby") { // Push enter
                setTimeout(function() {
                    if (debug_mode) {
                        console.log("slash-button's class:", sb.className, sb.className == "ui orange big button");
                    }
                    if(sb.className == "ui orange big button") { // focusがあることを確認する
                        sb.dispatchEvent(new Event('mousedown'));
                    }
                }, 100);
            }
        }
    }
}, false);

var storedScore = [];

function scoreSave() {
    let pl = document.getElementById("players").querySelectorAll(".player");

    storedScore = [];

    pl.forEach((p) => {
        storedScore.push([p.getAttribute("id"), Number(p.querySelectorAll(".correct")[1].querySelector(".score-value").innerHTML), Number(p.querySelector(".wrong").querySelector(".score-value").innerHTML)]);
    });

    alert("スコアをセーブしました！");
}

function scoreRestore() {
    let result = confirm ('スコアをリストアしていいですか？');
    if (!result) {
        return;
    }
    storedScore.forEach((score) => {
        let pl = document.getElementById(score[0]);
        if(pl != undefined) {
            for(let i = 0; i < score[1]; i++) {
                if(Number(pl.querySelectorAll(".correct")[1].querySelector(".score-value").innerHTML) >= score[1]) {
                    break;
                }
                pl.querySelector(".correct-plus").click();
            }
            for(let j = 0; j < score[2]; j++) {
                if(Number(pl.querySelector(".wrong").querySelector(".score-value").innerHTML) >= score[2]) {
                    break;
                }
                pl.querySelector(".wrong-plus").click();
            }
        }
    });
}


function initialization() {
    config.querySelector(".ui.form").insertAdjacentHTML('beforeend','<div class="ui dividing header">NAPT\'s Commands</div>'+
                                                        '<p>アルファベットの小文字で指定してください。複数指定した場合は最初に指定されたものが適用されます。</p>'+
                                                        '<p>AltとShiftの修飾キーが使用可能です。Altを使いたい場合はAを、Shiftを使いたい場合はSをアルファベットの前に付けてください。</p>' +
                                                        '<p>q,w,eのキーなど、正誤判定者で使用するHotkeyと同じ文字を指定した場合は両方の挙動がなされますので注意して設定してください。先頭に!をつけるとPlayer時のみに適用されるHotkeyとすることができます。</p>'+
                                                        '<p>頭に数字を指定し、後ろ側にslash/correct/wrong/throughをつけるとそれぞれ、早押し/正解判定/誤答判定/スルー、のショートカットになります（`1:slash`と言った具合）。</p>'+
                                                        '<div class="field"><textarea id="napt-hotkey">' + defhotkey + '</textarea></div><div id="gamepad-check"></div>\n');

    config.querySelector(".fields").insertAdjacentHTML('beforeend', '<div class="field"><label>flavor-sub1</label><input type="text" id="flavor1" maxlength="10"></div>'
                                                       +'<div class="field"><label>flavor-sub2</label><input type="text" id="flavor2" maxlength="10"></div>')
    //document.querySelector(".five.wide.column").insertAdjacentHTML('beforeend', '<div id="rank"></div>');
    if(displayRank){
        document.querySelector(".game-view.ui.divided.grid").insertAdjacentHTML('afterbegin', '<div class="two wide column"><div id="rank"></div></div>');
        document.querySelector(".eleven.wide.column").setAttribute("class", "nine wide column");
    }


    hotkeyBox = document.getElementById("napt-hotkey");
    gamepadKeycheck = document.getElementById("gamepad-check");
    importHotkey();
    refreshHotkey();

    document.querySelector(".ui.dividing.header").style.display = "none";
    document.querySelector(".page-header").style = "background-color: " + barcolor + ";";

    var link = window.location.href;
    if(displayRank) link = link.slice(0,-1);
    if(isProvider){
        if(easyBoard) {
            movelink = link.slice(0, -14) + "player?board";
        } else {
            movelink = link.slice(0, -8) + "player";
        }
    }
    else{
        if(easyBoard) {
            movelink = link.slice(0, -12) + "provider?board";
        } else {
            movelink = link.slice(0, -6) + "provider";
        }
    }
    document.querySelector("h1").innerHTML = "<a id='toplink' href='" + movelink + (displayRank ? "?" : "" ) + "'>" + "Nagaya Quiz Arena 2 with NAPT</a>";
    cb.innerHTML = "正解(Q)";
    wb.innerHTML = "誤答(W)";
    tb.innerHTML = "スルー(E)";

    if(isProvider) {
        cb.addEventListener("click", checkThrough, false);
        tb.addEventListener("click", checkThrough, false);

        document.querySelector(".page-header").insertAdjacentHTML(
            "beforeend",
            '<div class="ui icon" data-tooltip="ScoreSave" data-position="bottom right"><i id="score-save" class="big icon download"></i></div><div class="ui icon" data-tooltip="ScoreRestore" data-position="bottom right"><i id="score-restore" class="big icon upload"></i></div>'
        );

        document.getElementById("score-save").addEventListener('click', scoreSave);
        document.getElementById("score-restore").addEventListener('click', scoreRestore);
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
    if(easyBoard){
        document.querySelector("#board-window-sub textarea.board").addEventListener("keydown", boardSendFromKey);
        document.getElementById("sub-submit").addEventListener("click", boardSend, false);
    }
}


function onloadInitialization() {
     // Standbyをわかりやすくする
    let css = `
#controlbar #slash-button.focus {
  background: darkgreen;
  box-shadow: none;
  animation: none;
}`;
    let style = document.createElement('style');
    style.innerHTML = css;
    document.head.append(style);
}

function boardSendFromKey(e){
    if(event.ctrlKey){
        if(e.keyCode === 13){
            boardSend();
            return false;
        }
    };
}

function boardSend(){
    mainboardArea.querySelector(".board").value = subboardArea.querySelector(".board").value;
    mainboardArea.querySelector(".submit.button").click();
    subboardArea.querySelector(".board").value = "";
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
                if (isNaN(keyt)) {
                    hotkeylines.push({
                        key: keyt,
                        content: cont,
                    });
                } else {
                    gamepadShortcut[keyt] = cont;
                }
            }
        }
    });
    if (debug_mode){
        console.log("playerHotkeylines: " + playerHotkeylines);
        console.log("gamepadShortcut: " + gamepadShortcut);
    }
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
        if(Number(a[2]) > Number(b[2])) return -1;
        if(Number(a[2]) < Number(b[2])) return 1;
        if(Number(a[3]) < Number(b[3])) return -1;
        if(Number(a[3]) > Number(b[3])) return 1;
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

///
/// Gamepad settings =====================================================
///

var haveEvents = 'ongamepadconnected' in window;
var controllers = {};
var buttonStatus = {};

function connecthandler(e) {
    addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
    controllers[gamepad.index] = gamepad;
    var status = [];

    for (var i = 0; i < gamepad.buttons.length; i++) {
        var val = gamepad.buttons[i];
        var pressed = val == 1.0;
        if (typeof(val) == "object") {
            pressed = val.pressed;
            val = val.value;
        }
        status.push(pressed);
    }
    buttonStatus[gamepad.index] = status;

    document.getElementById("toplink").innerHTML = "Nagaya Quiz Arena 2 with NAPT(GP:Active)";

    requestAnimationFrame(updateStatus);
}

function disconnecthandler(e) {
    removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
    var d = document.getElementById("controller" + gamepad.index);
    delete buttonStatus[gamepad.index];
    delete controllers[gamepad.index];
    console.log(controllers);
    if(Object.keys(controllers).length == 0) {
        document.getElementById("toplink").innerHTML = "Nagaya Quiz Arena 2 with NAPT";
    }
}

function updateStatus() {
    if (!haveEvents) {
        scangamepads();
    }

    var i = 0;
    var j;

    for (j in controllers) {
        var controller = controllers[j];
        var pushed = "";
        var changed = false;
        for (i = 0; i < controller.buttons.length; i++) {
            var val = controller.buttons[i];
            var pressed = val == 1.0;
            if (typeof(val) == "object") {
                pressed = val.pressed;
                val = val.value;
            }

            if ((pressed || buttonStatus[controller.index][i]) && !(pressed && buttonStatus[controller.index][i])) {
                if(pressed){
                    if(debug_mode) console.log("Button" + i + " is pushed");
                    if(gamepadShortcut[i]){
                        // Keyが存在
                        var sc = gamepadShortcut[i];
                        if(sc == "slash") {
                            sb.dispatchEvent(new Event("mousedown"));
                        } else if (sc == "correct") {
                            cb.click();
                        } else if (sc == "wrong") {
                            wb.click();
                        } else if (sc == "through") {
                            tb.click();
                        }
                    }
                } else {
                    if(debug_mode) console.log("Button" + i + " is released");
                }
                buttonStatus[controller.index][i] = pressed;
                changed = true;
            }

            if(pressed) {
                pushed += " Button" + i;
            }
        }
        if (changed) {
            if (pushed == ""){
                gamepadKeycheck.innerHTML = "No button pushed";
            } else {
                gamepadKeycheck.innerHTML = "Push: " + pushed;
            }
        }
    }

    requestAnimationFrame(updateStatus);
}

function scangamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    for (var i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            if (gamepads[i].index in controllers) {
                controllers[gamepads[i].index] = gamepads[i];
            } else {
                addgamepad(gamepads[i]);
            }
        }
    }
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

if (!haveEvents) {
    setInterval(scangamepads, 500);
}
