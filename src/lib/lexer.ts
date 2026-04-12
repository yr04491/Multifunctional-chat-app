/**
 * src/lib/lexer.ts
 *
 * Phase 2: Lexer（字句解析器）
 *
 * 入力文字列（日本語の口語文）を左から右にスキャンし、
 * Token オブジェクトの配列に分解する。
 *
 * アルゴリズム: 最長一致法（Longest Prefix Match）
 *   1. 辞書エントリ（スラング・代名詞・動詞・接続詞）を表面の長い順に試す
 *   2. 助詞リストを長い順に試す
 *   3. 句読点・文末記号を確認する
 *   4. どれにも該当しない場合は文字種（漢字・ひらがな等）の連続をまとめる
 */

import dictionaryData from './dictionary.json';

// ============================================================
// 型定義
// ============================================================

/** トークンの品詞タグ */
export type POS =
  | 'slang'        // スラング・口語（直接置換対象）
  | 'pronoun'      // 代名詞（直接置換対象）
  | 'verb'         // 動詞（活用情報付き）
  | 'conjunction'  // 接続詞・助詞（置換対象）
  | 'particle'     // 助詞（変換なし・文脈判定用）
  | 'punctuation'  // 句読点・文末記号
  | 'kanji'        // 未知の漢字列（変換なし）
  | 'hiragana'     // 未知のひらがな列
  | 'katakana'     // 未知のカタカナ列
  | 'latin'        // 英数字列
  | 'unknown';     // その他

/** 動詞の活用タイプ */
export type ConjugationType =
  | 'godan_ru'    // 五段活用・る例外（走る・帰る等）
  | 'ichidan'     // 一段活用（食べる・見る等）
  | 'suru'        // する（→ いたします）
  | 'suru_kango'  // 漢語＋する（確認する → 確認いたします）
  | 'kuru';       // くる（→ 参ります）

/** Lexer が生成するトークン */
export interface Token {
  /** 元の文字列（変換前） */
  surface: string;
  /** 品詞タグ */
  pos: POS;
  /** 直接置換文字列（slang / pronoun / conjunction のとき存在） */
  replacement?: string;
  /** 動詞の語幹（例: "走る" → "走"） */
  stem?: string;
  /** 動詞の活用タイプ */
  conjugationType?: ConjugationType;
  /** ます形（辞書に明示されている特殊動詞のみ） */
  masuForm?: string;
}

// ============================================================
// 辞書の前処理（モジュールロード時に1回だけ実行）
//
// dictionary.json の全エントリを surface の長さで降順ソートする。
// これにより、tokenize() は常に「一番長くマッチするエントリ」を
// 最初に発見できる（最長一致法の保証）。
// ============================================================

// JSON の各カテゴリのエントリ型（_comment キーを許容する）
type RawSlang = { surface?: string; replacement?: string; _comment?: string };
type RawPronoun = { surface?: string; replacement?: string; _comment?: string };
type RawVerb = {
  surface?: string; stem?: string; conjugationType?: string;
  masuForm?: string; _comment?: string; note?: string;
};
type RawConj = { surface?: string; replacement?: string; _comment?: string };

interface LexiconEntry {
  surface: string;
  pos: POS;
  replacement?: string;
  stem?: string;
  conjugationType?: ConjugationType;
  masuForm?: string;
}

const lexicon: LexiconEntry[] = [
  // スラング・口語フレーズ
  ...(dictionaryData.slang as RawSlang[])
    .filter((e): e is RawSlang & { surface: string } => typeof e.surface === 'string')
    .map(e => ({ surface: e.surface, pos: 'slang' as POS, replacement: e.replacement })),

  // 代名詞
  ...(dictionaryData.pronouns as RawPronoun[])
    .filter((e): e is RawPronoun & { surface: string } => typeof e.surface === 'string')
    .map(e => ({ surface: e.surface, pos: 'pronoun' as POS, replacement: e.replacement })),

  // 動詞辞書（godan_ru 例外・ichidan・suru・kuru）
  ...(dictionaryData.verbLexicon as RawVerb[])
    .filter((e): e is RawVerb & { surface: string } => typeof e.surface === 'string')
    .map(e => ({
      surface: e.surface,
      pos: 'verb' as POS,
      stem: e.stem,
      conjugationType: e.conjugationType as ConjugationType | undefined,
      masuForm: e.masuForm,
    })),

  // 接続詞・助詞（変換あり）
  ...(dictionaryData.conjunctions as RawConj[])
    .filter((e): e is RawConj & { surface: string } => typeof e.surface === 'string')
    .map(e => ({ surface: e.surface, pos: 'conjunction' as POS, replacement: e.replacement })),

// ↑ 最長一致を保証するため、surface の長さで降順ソート
].sort((a, b) => b.surface.length - a.surface.length);

// ============================================================
// 助詞リスト
//
// 文脈判定用（「次のトークンが助詞か」を Parser が判断するため）。
// 変換は行わない。長い助詞を先に並べて最長一致を保証する。
// MULTI_CHAR_HIRAGANA
// 「な」「で」のような1文字助詞で語句が不規則にちぎれるのを防ぐための固定ひらがな群。
// Lexerではこれらを無傷な1つの 'hiragana' トークンとして扱う。
const MULTI_CHAR_HIRAGANA: readonly string[] = [
  'なかった', 'なくて', 'ないです', 'ない', 'なので', 'なんだ', 
  'だけど', 'だから', 'ですから', 'です', 'でした', 'でしょう', 
  'ます', 'ました', 'ません'
].sort((a, b) => b.length - a.length);

// PARTICLE: 助詞（文脈の切れ目となるもの）
const PARTICLE_LIST: readonly string[] = [
  // 2文字以上の助詞（長い順）
  'ばかり', 'ごろ', 'から', 'まで', 'より', 'だけ', 'ほど', 'など',
  // 1文字の助詞（「か」は形容詞語幹への誤爆を防ぐため除外）
  'は', 'が', 'を', 'に', 'で', 'も', 'と', 'や', 'の',
  'よ', 'ね', 'わ', 'さ', 'ぞ', 'ぜ', 'な',
].sort((a, b) => b.length - a.length); // 長い順を保証

// ============================================================
// 句読点・文末記号セット
// ============================================================

const PUNCTUATION = new Set<string>([
  '。', '、', '！', '？', '!', '?', '…', '・', '\n', '\r',
]);

// ============================================================
// 文字種判定ユーティリティ
//
// 未知語を「漢字の連続」「ひらがなの連続」などにグルーピングするときに使う。
// ============================================================

type CharType = 'kanji' | 'hiragana' | 'katakana' | 'latin' | 'unknown';

function getCharType(char: string): CharType {
  const code = char.charCodeAt(0);
  // 漢字（CJK統合漢字 + 拡張A）
  if ((code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x3400 && code <= 0x4DBF)) return 'kanji';
  // ひらがな
  if (code >= 0x3041 && code <= 0x309F) return 'hiragana';
  // カタカナ
  if (code >= 0x30A1 && code <= 0x30FF) return 'katakana';
  // ASCII英数字
  if (
    (code >= 0x0041 && code <= 0x005A) ||
    (code >= 0x0061 && code <= 0x007A) ||
    (code >= 0x0030 && code <= 0x0039)
  ) return 'latin';
  return 'unknown';
}

// ============================================================
// tokenize(): Lexer 本体
//
// @param text - 変換前の日本語テキスト（口語）
// @returns    - Token オブジェクトの配列
//
// 処理の優先順位:
//   1. 辞書の最長一致（スラング・代名詞・動詞・接続詞）
//   2. 助詞リストの最長一致
//   3. 句読点・文末記号
//   4. 未知語（同じ文字種の連続をまとめる）
// ============================================================

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < text.length) {
    const remaining = text.slice(pos);

    // ──────────────────────────────────────────────────────
    // Step 1: 辞書の最長一致マッチ
    //
    // lexicon は surface の長さで降順ソート済みなので、
    // 最初にヒットしたエントリが常に最長一致になる。
    // ──────────────────────────────────────────────────────
    // 1. 辞書マッチ（最長一致）
    let hit = false;
    for (const entry of lexicon) {
      if (remaining.startsWith(entry.surface)) {
        tokens.push({
          surface: entry.surface,
          pos: entry.pos as POS,
          replacement: entry.replacement,
          stem: entry.stem,
          conjugationType: entry.conjugationType,
          masuForm: entry.masuForm,
        });
        pos += entry.surface.length;
        hit = true;
        break;
      }
    }
    if (hit) continue;

    // 2. ひらがな結合保護マッチ
    let hw = false;
    for (const w of MULTI_CHAR_HIRAGANA) {
      if (remaining.startsWith(w)) {
        tokens.push({ surface: w, pos: 'hiragana' });
        pos += w.length;
        hw = true;
        break;
      }
    }
    if (hw) continue;

    // 3. 助詞の最長一致マッチ
    let particleMatched = false;
    for (const p of PARTICLE_LIST) {
      if (remaining.startsWith(p)) {
        tokens.push({ surface: p, pos: 'particle' });
        pos += p.length;
        particleMatched = true;
        break;
      }
    }
    if (particleMatched) continue;

    // ──────────────────────────────────────────────────────
    // Step 3: 句読点・文末記号
    // ──────────────────────────────────────────────────────
    if (PUNCTUATION.has(remaining[0])) {
      tokens.push({ surface: remaining[0], pos: 'punctuation' });
      pos += 1;
      continue;
    }

    // ──────────────────────────────────────────────────────
    // Step 4: 空白（形を保ちつつ pass-through）
    // ──────────────────────────────────────────────────────
    if (remaining[0] === ' ' || remaining[0] === '　') {
      tokens.push({ surface: remaining[0], pos: 'unknown' });
      pos += 1;
      continue;
    }

    // ──────────────────────────────────────────────────────
    // Step 5: 未知語 — 同じ文字種の連続をひとまとめにする
    //
    // 「山田が走る」の "山田" のように辞書に載っていない固有名詞は
    // 漢字の連続として 1トークンにまとめる（変換は行わない）。
    // ──────────────────────────────────────────────────────
    const firstCharType = getCharType(remaining[0]);
    let end = 1;

    while (end < remaining.length) {
      const ch = remaining[end];

      // 句読点・空白で区切る
      if (PUNCTUATION.has(ch) || ch === ' ' || ch === '　') break;

      // 文字種が変わったら区切る
      if (getCharType(ch) !== firstCharType) break;

      // 辞書エントリまたは助詞がここから始まるなら区切る
      const fromHere = remaining.slice(end);
      if (lexicon.some(e => fromHere.startsWith(e.surface))) break;
      if (PARTICLE_LIST.some(p => fromHere.startsWith(p))) break;

      end++;
    }

    tokens.push({ surface: remaining.slice(0, end), pos: firstCharType });
    pos += end;
  }

  return tokens;
}
