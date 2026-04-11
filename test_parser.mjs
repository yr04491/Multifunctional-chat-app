/**
 * test_parser.mjs
 * Phase 3 エンドツーエンド確認スクリプト
 * Lexer → Parser → 最終出力まで通しで検証する
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const dict  = JSON.parse(readFileSync(join(__dir, 'src/lib/dictionary.json'), 'utf8'));

// ── Lexer (test_lexer.mjs と同一) ──────────────────────────
const lexicon = [
  ...dict.slang.filter(e=>e.surface).map(e=>({surface:e.surface,pos:'slang',replacement:e.replacement})),
  ...dict.pronouns.filter(e=>e.surface).map(e=>({surface:e.surface,pos:'pronoun',replacement:e.replacement})),
  ...dict.verbLexicon.filter(e=>e.surface).map(e=>({surface:e.surface,pos:'verb',stem:e.stem,conjugationType:e.conjugationType,masuForm:e.masuForm})),
  ...dict.conjunctions.filter(e=>e.surface).map(e=>({surface:e.surface,pos:'conjunction',replacement:e.replacement})),
].sort((a,b)=>b.surface.length-a.surface.length);

const PARTICLE_LIST=['ばかり','ごろ','から','まで','より','だけ','ほど','など','は','が','を','に','で','も','と','や','の','か','よ','ね','わ','さ','ぞ','ぜ','な'].sort((a,b)=>b.length-a.length);
const PUNCT=new Set(['。','、','！','？','!','?','…','・','\n','\r']);
function charType(c){const n=c.charCodeAt(0);if((n>=0x4E00&&n<=0x9FFF)||(n>=0x3400&&n<=0x4DBF))return'kanji';if(n>=0x3041&&n<=0x309F)return'hiragana';if(n>=0x30A1&&n<=0x30FF)return'katakana';if((n>=65&&n<=90)||(n>=97&&n<=122)||(n>=48&&n<=57))return'latin';return'unknown';}

function tokenize(text){
  const tokens=[];let pos=0;
  while(pos<text.length){
    const rem=text.slice(pos);
    let hit=false;
    for(const e of lexicon){if(rem.startsWith(e.surface)){tokens.push({surface:e.surface,pos:e.pos,replacement:e.replacement,stem:e.stem,conjugationType:e.conjugationType,masuForm:e.masuForm});pos+=e.surface.length;hit=true;break;}}
    if(hit)continue;
    let ph=false;
    for(const p of PARTICLE_LIST){if(rem.startsWith(p)){tokens.push({surface:p,pos:'particle'});pos+=p.length;ph=true;break;}}
    if(ph)continue;
    if(PUNCT.has(rem[0])){tokens.push({surface:rem[0],pos:'punctuation'});pos++;continue;}
    if(rem[0]===' '||rem[0]==='　'){tokens.push({surface:rem[0],pos:'unknown'});pos++;continue;}
    const ft=charType(rem[0]);let end=1;
    while(end<rem.length){const ch=rem[end];if(PUNCT.has(ch)||ch===' '||ch==='　')break;if(charType(ch)!==ft)break;const fh=rem.slice(end);if(lexicon.some(e=>fh.startsWith(e.surface)))break;if(PARTICLE_LIST.some(p=>fh.startsWith(p)))break;end++;}
    tokens.push({surface:rem.slice(0,end),pos:ft});pos+=end;
  }
  return tokens;
}

// ── Parser ──────────────────────────────────────────────────
const SF_PARTICLES=new Set(['ね','よ','わ','さ','ぞ','ぜ','な','か','が']);
function sentenceEnd(next){if(!next)return true;if(next.pos==='punctuation')return true;if(next.pos==='particle'&&SF_PARTICLES.has(next.surface))return true;return false;}
function conjugate(t){switch(t.conjugationType){case'godan_ru':return(t.stem??'')+'ります';case'ichidan':return(t.stem??'')+'ます';case'suru':return'いたします';case'suru_kango':return t.masuForm??((t.stem??'')+'いたします');case'kuru':return t.masuForm??'参ります';default:return t.surface;}}

const RULES=[
  [/していない$/,'していません'],[/していた$/,'していました'],[/している$/,'しています'],
  [/してない$/,'していません'],[/してた$/,'していました'],[/してる$/,'しています'],
  [/ていない$/,'ていません'],[/ていた$/,'ていました'],[/ている$/,'ています'],
  [/てない$/,'ていません'],[/てた$/,'ていました'],[/てる$/,'ています'],
  [/しない$/,'いたしません'],[/こない$/,'参りません'],[/なさい$/,'なさってください'],
  [/ちゃった$/,'てしまいました'],[/ちゃう$/,'てしまいます'],
  [/なくちゃ$/,'なければなりません'],[/なきゃ$/,'なければなりません'],
  [/ておくね$/,'ておきますね'],[/とくね$/,'ておきますね'],[/ておく$/,'ておきます'],[/とく$/,'ておきます'],
  [/てね$/,'てくださいね'],[/てよ$/,'てください'],
  [/じゃないか$/,'ではありませんか'],[/ではないか$/,'ではありませんか'],
  [/じゃない$/,'ではありません'],[/ではない$/,'ではありません'],
  [/くない$/,'くないです'],[/ない$/,'ないです'],
  [/なかった$/,'なかったです'],[/かった$/,'かったです'],
  [/くる$/,'参ります'],[/する$/,'いたします'],[/きた$/,'参りました'],[/だった$/,'でした'],
  [/した$/,'しました'],[/んだ$/,'みました'],[/いだ$/,'ぎました'],[/いた$/,'きました'],
  [/った$/,'りました'],[/た$/,'ました'],
  [/だろう$/,'でしょう'],[/だろ$/,'でしょう'],[/かな$/,'でしょうか'],
  [/じゃん$/,'ではありませんか'],[/だね$/,'ですね'],[/だよ$/,'ですよ'],[/である$/,'です'],[/だ$/,'です'],
  [/([いきしちにひみりえけせてねへめれべで])る$/,'$1ます'],
  [/る$/,'ります'],[/う$/,'います'],[/く$/,'きます'],[/ぐ$/,'ぎます'],
  [/す$/,'します'],[/つ$/,'ちます'],[/ぬ$/,'にます'],[/ぶ$/,'びます'],[/む$/,'みます'],
  [/い$/,'いです'],
];
const AUX=[[/なきゃ/,'なければなりません'],[/なくちゃ/,'なければなりません'],[/ちゃった/,'てしまいました'],[/ちゃう/,'てしまいます']];
function applyRules(s){for(const[p,r]of RULES){if(p.test(s))return s.replace(p,r);}return s;}
function applyAux(s){for(const[p,r]of AUX){if(p.test(s))return s.replace(p,r);}return s;}

function transform(tokens){
  return tokens.map((t,i)=>{
    const next=tokens[i+1];const atEnd=sentenceEnd(next);
    switch(t.pos){
      case'slang':case'pronoun':case'conjunction':return t.replacement??t.surface;
      case'verb':return atEnd?conjugate(t):t.surface;
      case'hiragana':return atEnd?applyRules(t.surface):applyAux(t.surface);
      default:return t.surface;
    }
  }).join('');
}

function run(text){return transform(tokenize(text));}

// ── テストケース ────────────────────────────────────────────
const cases=[
  // 既知バグの修正確認
  {i:'早く走るが、すぐ疲れる。', e:'早く走りますが、すぐ疲れます。', label:'⭐ バグ修正: 走る→走ります'},
  {i:'帰る。',                  e:'帰ります。',                    label:'⭐ バグ修正: 帰る→帰ります'},
  // 基本変換
  {i:'俺が走る。',              e:'私が走ります。',                label:'代名詞+動詞'},
  {i:'リンゴを食べる。',        e:'リンゴを食べます。',            label:'食べる(ichidan)'},
  {i:'明日行くね。',            e:'明日行きますね。',              label:'行く+ね'},
  {i:'それは高かった。',        e:'それは高かったです。',          label:'形容詞過去形'},
  {i:'彼は学生ではない。',      e:'彼は学生ではありません。',      label:'否定形'},
  {i:'昨日お寿司を食べた',      e:'昨日お寿司を食べました',        label:'一段動詞過去(食べた)'},
  // スラング
  {i:'マジでやばい',            contains:'本当に',                 label:'スラング: マジで'},
  {i:'とりあえず俺はいく',      contains:'まずは私は',             label:'スラング+代名詞'},
];

let pass=0,fail=0;
for(const c of cases){
  const got=run(c.i);
  let ok=false;
  if(c.e)       ok=got===c.e;
  else if(c.contains) ok=got.includes(c.contains);
  console.log(`${ok?'✅':'❌'} ${c.label}`);
  console.log(`   IN : ${c.i}`);
  console.log(`   OUT: ${got}`);
  if(!ok&&c.e)console.log(`   EXP: ${c.e}`);
  console.log();
  ok?pass++:fail++;
}
console.log(`結果: ${pass}/${pass+fail} passed`);
