/**
 * generate_test_cases.mjs
 * 
 * 色々な会話のパーツ（主語、スラング、動詞、形容詞、文末など）を組み合わせて、
 * 1000個の「超フランクな日本語のテストケース」を自動生成し、JSONとして保存するスクリプト。
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

// --- 会話の構成パーツ ---

const subjects = ['俺', '僕', 'あたし', '自分', 'お前', 'あいつ', 'みんな', ''];
const adverbs = ['マジで', 'ガチで', 'めっちゃ', 'すげえ', 'ぶっちゃけ', 'とりあえず', 'やっぱ', '案外', 'ワンチャン', ''];
const adjectives = ['やばい', 'だるい', 'うざい', 'えぐい', 'キモい', '美味しい', 'クソ', 'アホ', '天才'];
const adjectiveEnds = ['じゃね？', 'だよね', 'なんだが', 'なんだけど', 'かな', 'じゃん', ''];

// 五段活用
const godanVerbs = ['走', '帰', '知', '切', '喋', '入', '行く', '泳ぐ', '出す', '待つ', '死ぬ', '呼ぶ', '飲む', '帰る'];
const godanEnds = ['る', 'った', 'らない', 'らなかった', 'ってる', 'ってない', 'っちゃった', 'らなきゃ', 'ればいい'];

// 一段活用
const ichidanVerbs = ['食べ', '見', '起き', '寝', '続け', '変え', '教え'];
const ichidanEnds = ['る', 'た', 'ない', 'なかった', 'てる', 'てない', 'ちゃう', 'なきゃ', 'ればいい'];

// する・くる
const irregulars = ['する', 'した', 'しない', 'しなかった', 'してる', 'してない', 'しちゃう', 'しなきゃ', 
                    'くる', 'きた', 'こない', 'こなかった', 'きてる', 'きてない'];

const verbFollowups = ['んだけど', 'からさ', 'し', 'が', 'けど', 'んで', ''];
const finalEnds = ['www', '草', '泣', '！', '？', '。', ''];

// フレーズ単体のスラングや煽り
const standaloneSlangs = [
  'おいこらてめえ', 'ふざけんな', 'だまれ', 'うっせぇ', '草', 'ぴえん', '詰んだ',
  'ちな', 'あーなる', 'なるへそ', 'りょ', 'それな', 'ほんこれ'
];


const generated = new Set(); // 重複排除用
const cases = [];

// ヘルパー：ランダム抽出
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 1. 動詞ベースの文章を生成
while (cases.length < 500) {
  let s = pick(subjects);
  let adv = pick(adverbs);
  let v = '';
  
  // 動詞のタイプをランダム決定
  const r = Math.random();
  if (r < 0.4) {
    let base = pick(godanVerbs);
    if (base.endsWith('く')||base.endsWith('ぐ')||base.endsWith('す')||base.endsWith('つ')||base.endsWith('ぬ')||base.endsWith('ぶ')||base.endsWith('む')||base.endsWith('る')) {
       // そのまま使うと面倒なので今回は簡略化してベースを固定
       base = '行';
    }
    v = base + pick(godanEnds);
  } else if (r < 0.8) {
    v = pick(ichidanVerbs) + pick(ichidanEnds);
  } else {
    v = (Math.random() < 0.5 ? '勉強' : '') + pick(irregulars);
  }

  let follow = pick(verbFollowups);
  let end = pick(finalEnds);

  let sentence = `${s}${s?'は':''}${adv}${v}${follow}${end}`;
  if (sentence.length > 2 && !generated.has(sentence)) {
    generated.add(sentence);
    cases.push(sentence);
  }
}

// 2. 形容詞ベースの文章を生成
while (cases.length < 800) {
  let s = pick(subjects);
  let adv = pick(adverbs);
  let adj = pick(adjectives);
  let end1 = pick(adjectiveEnds);
  let end2 = pick(finalEnds);

  // 「うざくね？」などの変化球
  if (Math.random() < 0.3 && adj.endsWith('い')) {
      adj = adj.slice(0, -1) + 'くね';
      end1 = '？';
  }

  let sentence = `${s}${s?'って':''}${adv}${adj}${end1}${end2}`;
  if (sentence.length > 2 && !generated.has(sentence)) {
    generated.add(sentence);
    cases.push(sentence);
  }
}

// 3. スラング・接続詞などの特殊パターンを生成
while (cases.length < 1000) {
  let sl = pick(standaloneSlangs);
  let adv = pick(adverbs);
  let end = pick(finalEnds);
  
  let sentence = `${adv}${sl}${end}`;
  if (sentence.length > 2 && !generated.has(sentence)) {
    generated.add(sentence);
    cases.push(sentence);
  }
}

// ランダムにシャッフル
cases.sort(() => Math.random() - 0.5);

// 保存処理
const outputPath = join(__dir, 'test_cases.json');
writeFileSync(outputPath, JSON.stringify(cases, null, 2), 'utf-8');

console.log(`✅ 1000個のテストケースを生成し、${outputPath} に保存しました！`);
