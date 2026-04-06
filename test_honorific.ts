import { convertToTeineigo } from "./src/lib/honorificRules";
import * as fs from 'fs';

const testCases = [
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

let out = "";
try {
  testCases.forEach(text => {
    out += `IN: ${text}\n`;
    out += `OUT: ${convertToTeineigo(text)}\n`;
  });
  console.log("Success");
} catch (e: any) {
  out += `ERROR: ${e.message}\n${e.stack}`;
  console.log("Error caught");
}
fs.writeFileSync('test_error.txt', out, 'utf8');
