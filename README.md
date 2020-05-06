# NAPT

NQA2 Automatically Paste Tool

Automatically paste and send the copied song information etc. at the time of questioning in NQA2

## Setup

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser
2. Click [napt.user.js](https://github.com/pgDora56/NAPT/raw/master/napt.user.js)

If you want to update this script, you only click [napt.user.js](https://github.com/pgDora56/NAPT/raw/master/napt.user.js).

## Usage 

The title bar color changes to darkblue(player)/sienna(provider) when this script is running.

Clicking title(`Nagaya Quiz Arena 2 with NAPT`), You can go back and forth between `player` and `provider`.

All operation is moved from keydown. When you are player, you can only use swap(`[` and `]`).

|Key|Operation|
|-|-|
|Space|Paste from clipboard & Send that data for chat|
|Q|Correct|
|W|Wrong|
|E|Through|
|Shift+R|Go to next game in same rule|
|F|Increase player's freeze count to max(9) after select player|
|Alt+R|Score fix - Pseudo NY rule|
|[|Swap flavor and flavor-sub1|
|]|Swap flavor and flavor-sub2|

And you can set original hot keys.

## Operation confirmed environment

* Chrome 
* Chromium browser 

Firefox is not ready.....

## LICENSE 

MIT
