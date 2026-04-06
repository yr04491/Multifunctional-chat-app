"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var honorificRules_1 = require("./src/lib/honorificRules");
var fs = require("fs");
var testCases = [
    "マジでぶっちゃけお前やばいんだけど",
    "てかお前あほだろ",
    "マジでガチでめちゃくちゃキモいんだけど",
    "とりあえず俺はいくわ",
    "あいつバカじゃね？",
    "それな、しょーがないからやっとくね",
    "明日行くね。",
    "それは高かった。",
    "ゲームで遊ぶよ",
    "彼らは学生ではない。",
    "リンゴを食べる。",
    "明日はいかない。",
    "おいこらてめえ",
    "おい、なにしてる"
];
var out = "";
try {
    testCases.forEach(function (text) {
        out += "IN: ".concat(text, "\n");
        out += "OUT: ".concat((0, honorificRules_1.convertToTeineigo)(text), "\n");
    });
    console.log("Success");
}
catch (e) {
    out += "ERROR: ".concat(e.message, "\n").concat(e.stack);
    console.log("Error caught");
}
fs.writeFileSync('test_error.txt', out, 'utf8');
