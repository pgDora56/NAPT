# NAPT

NQA2 Automatically Paste Tool

Automatically paste and send the copied song information etc. at the time of questioning in NQA2

--> [Japanese Manual](https://gist.github.com/pgDora56/73510be80f6a1370fcd353b6f0ca1959)

## Setup

### Method 1: Chrome Extension (Recommended)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the folder containing `manifest.json` and `content_script.js`
6. The extension is now installed and will automatically run on NQA2 pages

### Method 2: Tampermonkey UserScript

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser
2. Click [napt.user.js](https://github.com/pgDora56/NAPT/raw/master/napt.user.js)

If you want to update this script, you only click [napt.user.js](https://github.com/pgDora56/NAPT/raw/master/napt.user.js).

## Usage 

The title bar color changes to darkblue(player)/sienna(provider) when this script is running.

Clicking title(`Nagaya Quiz Arena 2 with NAPT`), You can go back and forth between `player` and `provider`.

You can set original hot keys and use some special setting.

### Key Operation
All operation is moved from keydown. When you are player, you can only use swap(`[` and `]`).

|Key|Operation|
|-|-|
|Space|Paste from clipboard & Send that data for chat|
|Q|Correct|
|W|Wrong|
|E|Through|
|Shift+R|Go to next game in same rule|
|A|Select all player|
|F|Increase player's freeze count to max(9) after select player|
|Alt+R|Score fix - Pseudo NY rule|
|[|Swap flavor and flavor-sub1|
|]|Swap flavor and flavor-sub2|

## Operation confirmed environment

* Chrome 
* Chromium browser 

Firefox is not ready.....

## LICENSE 

[MIT](LICENSE)
