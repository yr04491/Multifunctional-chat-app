/**
 * test_lexer.mjs
 *
 * Phase 2 動作確認スクリプト
 * 「俺が走る。」が正しいToken配列に分割されることを検証する。
 *
 * 実行: node --experimental-vm-modules test_lexer.mjs
 * ※ Next.jsのESM環境を模倣するためMJS形式で記述
 */

// dictionary.json を直接読み込んでLexerロジックを再現（TSビルドなしで検証）
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dict = JSON.parse(readFileSync(join(__dirname, 'src/lib/dictionary.json'), 'utf8'));

// --- 辞書エントリの前処理 ---
const lexicon = [
  ...dict.slang.filter(e => e.surface).map(e => ({ surface: e.surface, pos: 'slang', replacement: e.replacement })),
  ...dict.pronouns.filter(e => e.surface).map(e => ({ surface: e.surface, pos: 'pronoun', replacement: e.replacement })),
  ...dict.verbLexicon.filter(e => e.surface).map(e => ({
    surface: e.surface, pos: 'verb', stem: e.stem, conjugationType: e.conjugationType, masuForm: e.masuForm
  })),
  ...dict.conjunctions.filter(e => e.surface).map(e => ({ surface: e.surface, pos: 'conjunction', replacement: e.replacement })),
].sort((a, b) => b.surface.length - a.surface.length);

const PARTICLE_LIST = [
  'ばかり','ごろ','から','まで','より','だけ','ほど','など',
  'は','が','を','に','で','も','と','や','の','か','よ','ね','わ','さ','ぞ','ぜ','な',
].sort((a, b) => b.length - a.length);

const PUNCTUATION = new Set(['。','、','！','？','!','?','…','・','\n','\r']);

function getCharType(char) {
  const c = char.charCodeAt(0);
  if ((c >= 0x4E00 && c <= 0x9FFF) || (c >= 0x3400 && c <= 0x4DBF)) return 'kanji';
  if (c >= 0x3041 && c <= 0x309F) return 'hiragana';
  if (c >= 0x30A1 && c <= 0x30FF) return 'katakana';
  if ((c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A) || (c >= 0x30 && c <= 0x39)) return 'latin';
  return 'unknown';
}

function tokenize(text) {
  const tokens = [];
  let pos = 0;
  while (pos < text.length) {
    const remaining = text.slice(pos);
    let matched = false;
    for (const entry of lexicon) {
      if (remaining.startsWith(entry.surface)) {
        tokens.push({ surface: entry.surface, pos: entry.pos, replacement: entry.replacement, stem: entry.stem, conjugationType: entry.conjugationType });
        pos += entry.surface.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    let pm = false;
    for (const p of PARTICLE_LIST) {
      if (remaining.startsWith(p)) {
        tokens.push({ surface: p, pos: 'particle' });
        pos += p.length;
        pm = true;
        break;
      }
    }
    if (pm) continue;
    if (PUNCTUATION.has(remaining[0])) {
      tokens.push({ surface: remaining[0], pos: 'punctuation' });
      pos++; continue;
    }
    if (remaining[0] === ' ' || remaining[0] === '　') {
      tokens.push({ surface: remaining[0], pos: 'unknown' });
      pos++; continue;
    }
    const ft = getCharType(remaining[0]);
    let end = 1;
    while (end < remaining.length) {
      const ch = remaining[end];
      if (PUNCTUATION.has(ch) || ch === ' ' || ch === '　') break;
      if (getCharType(ch) !== ft) break;
      const fh = remaining.slice(end);
      if (lexicon.some(e => fh.startsWith(e.surface))) break;
      if (PARTICLE_LIST.some(p => fh.startsWith(p))) break;
      end++;
    }
    tokens.push({ surface: remaining.slice(0, end), pos: ft });
    pos += end;
  }
  return tokens;
}

// --- テスト実行 ---
const testCases = [
  {
    input: '俺が走る。',
    expected: [
      { surface: '俺',  pos: 'pronoun',     replacement: '私' },
      { surface: 'が',  pos: 'particle' },
      { surface: '走る',pos: 'verb',        conjugationType: 'godan_ru', stem: '走' },
      { surface: '。',  pos: 'punctuation' },
    ]
  },
  {
    input: 'マジでやばい',
    expected: [
      { surface: 'マジで', pos: 'slang', replacement: '本当に' },
      { surface: 'やばい', pos: 'slang', replacement: '大変な状態です' },
    ]
  },
  {
    input: 'リンゴを食べる。',
    expected: [
      { surface: 'リンゴ', pos: 'katakana' },
      { surface: 'を',     pos: 'particle' },
      { surface: '食べる', pos: 'verb', conjugationType: 'ichidan', stem: '食べ' },
      { surface: '。',     pos: 'punctuation' },
    ]
  },
  {
    input: '早く走るが、すぐ疲れる。',
    expected: [
      { surface: '早',   pos: 'kanji' },
      { surface: 'く',   pos: 'hiragana' },
      { surface: '走る', pos: 'verb', conjugationType: 'godan_ru', stem: '走' },
      { surface: 'が',   pos: 'particle' },
      { surface: '、',   pos: 'punctuation' },
      { surface: 'すぐ', pos: 'hiragana' },
      { surface: '疲れる', pos: 'verb', conjugationType: 'ichidan', stem: '疲れ' },
      { surface: '。',   pos: 'punctuation' },
    ]
  }
];

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const result = tokenize(tc.input);
  let ok = result.length === tc.expected.length;
  if (ok) {
    for (let i = 0; i < tc.expected.length; i++) {
      const got = result[i];
      const exp = tc.expected[i];
      if (got.surface !== exp.surface || got.pos !== exp.pos) { ok = false; break; }
      if (exp.conjugationType && got.conjugationType !== exp.conjugationType) { ok = false; break; }
      if (exp.replacement && got.replacement !== exp.replacement) { ok = false; break; }
    }
  }
  if (ok) {
    console.log(`✅ PASS: "${tc.input}"`);
    passed++;
  } else {
    console.log(`❌ FAIL: "${tc.input}"`);
    console.log('   Expected:', JSON.stringify(tc.expected.map(e => e.surface + '(' + e.pos + ')')));
    console.log('   Got:     ', JSON.stringify(result.map(e => e.surface + '(' + e.pos + ')')));
    failed++;
  }
}

console.log(`\n結果: ${passed}/${passed + failed} passed`);
