/**
 * src/lib/parser.ts
 *
 * Phase 3: Parser（構文評価・変換器）
 *
 * Lexer が生成した Token 配列を受け取り、
 * 文脈（前後のトークン）を見ながら丁寧語（です・ます調）に変換して
 * 最終文字列を返す。プレースホルダー（__DESU__ 等）は一切不要。
 */

import { Token, ConjugationType } from './lexer';

// ============================================================
// 文末判定
// 次のトークンが句読点・EOF・文末助詞のとき「文末」と判定する
// ============================================================

const SENTENCE_FINAL_PARTICLES = new Set(['ね', 'よ', 'わ', 'さ', 'ぞ', 'ぜ', 'か', 'が']);

function isSentenceEnd(next: Token | undefined): boolean {
  if (!next) return true;
  if (next.pos === 'punctuation') return true;
  if (next.pos === 'particle' && SENTENCE_FINAL_PARTICLES.has(next.surface)) return true;
  return false;
}

// ============================================================
// 動詞の活用（辞書に登録された動詞の丁寧語ます形を生成）
// ============================================================

function conjugateToMasu(token: Token): string {
  switch (token.conjugationType) {
    case 'godan_ru':   return (token.stem ?? '') + 'ります';      // 走る → 走ります ✅
    case 'ichidan':    return (token.stem ?? '') + 'ます';        // 食べる → 食べます ✅
    case 'suru':       return 'いたします';
    case 'suru_kango': return token.masuForm ?? ((token.stem ?? '') + 'いたします');
    case 'kuru':       return token.masuForm ?? '参ります';
    default:           return token.surface;
  }
}

// ============================================================
// ひらがなトークンへの文法ルール
//
// 辞書に登録されていない動詞の活用形・補助動詞・断定形など、
// ひらがな（文字種 = 'hiragana'）のトークンに対してパターンマッチする。
//
// ⚠ 優先順位が命 — 長いパターンを必ず先に書くこと。
// ============================================================

const GRAMMAR_RULES: Array<[RegExp, string]> = [

  // === 複合補助動詞（順番重要: 長いルールを先に） ===
  [/していない$/,   'していません'],
  [/していた$/,    'していました'],
  [/している$/,    'しています'],
  [/してない$/,    'していません'],
  [/してた$/,      'していました'],
  [/してる$/,      'しています'],
  [/ていない$/,    'ていません'],
  [/ていた$/,      'ていました'],
  [/ている$/,      'ています'],
  [/てない$/,      'ていません'],
  [/てた$/,        'ていました'],
  [/てる$/,        'ています'],
  [/でいない$/,    'でいません'],
  [/でいた$/,      'でいました'],
  [/でいる$/,      'でいます'],
  [/はいない$/,    'はいません'],
  [/しない$/,      'いたしません'],
  [/こない$/,      '参りません'],
  [/なさい$/,      'なさってください'],
  [/ちゃった$/,    'てしまいました'],
  [/ちゃう$/,      'てしまいます'],
  [/ておくね$/,    'ておきますね'],
  [/とくね$/,      'ておきますね'],
  [/ておく$/,      'ておきます'],
  [/とく$/,        'ておきます'],
  [/なくちゃ$/,    'なければなりません'],
  [/なきゃ$/,      'なければなりません'],
  [/てくださいね$/, 'てくださいね'],   // 既に丁寧語ならそのまま
  [/てね$/,        'てくださいね'],
  [/てよ$/,        'てください'],

  // === 打消 ===
  [/じゃないか$/,  'ではありませんか'],
  [/ではないか$/,  'ではありませんか'],
  [/じゃない$/,   'ではありません'],
  [/ではない$/,   'ではありません'],
  [/でない$/,     'でありません'],   // 追加
  [/くない$/,     'くないです'],
  [/ない$/,       'ないです'],

  // === 過去形（長いパターン優先） ===
  [/なかった$/,   'なかったです'],
  [/かった$/,     'かったです'],     // ← /った$/ より必ず前に
  [/くる$/,       '参ります'],
  [/する$/,       'いたします'],
  [/きた$/,       '参りました'],
  [/だった$/,     'でした'],     // ← /った$/ より必ず前に
  [/した$/,       'しました'],
  [/んだ$/,       'みました'],
  [/いだ$/,       'ぎました'],
  [/いた$/,       'きました'],
  [/った$/,       'りました'],
  [/た$/,         'ました'],

  // === 断定・推量 ===
  [/だろう$/,     'でしょう'],
  [/だろ$/,       'でしょう'],
  [/かな$/,       'でしょうか'],
  [/じゃん$/,     'ではありませんか'],
  [/だね$/,       'ですね'],
  [/だよ$/,       'ですよ'],
  [/である$/,     'です'],
  [/だ$/,         'です'],

  // === 現在形・終止形 ===
  // 一段動詞・および見た目で推測可能なもののみ残す（誤爆を防ぐため単文字ルールは廃止）
  [/([いきしちにひみりえけせてねへめれべで])る$/, '$1ます'],

  // === 形容詞 ===
  [/い$/,  'いです'],
];

// 文末以外でも適用する補助動詞ルール
const AUX_RULES_ALWAYS: Array<[RegExp, string]> = [
  [/なきゃ/, 'なければなりません'],
  [/なくちゃ/, 'なければなりません'],
  [/ちゃった/, 'てしまいました'],
  [/ちゃう/, 'てしまいます'],
];

function applyGrammarRules(surface: string): string {
  for (const [pattern, replacement] of GRAMMAR_RULES) {
    if (pattern.test(surface)) {
      return surface.replace(pattern, replacement);
    }
  }
  return surface;
}

function applyAuxRulesAlways(surface: string): string {
  for (const [pattern, replacement] of AUX_RULES_ALWAYS) {
    if (pattern.test(surface)) {
      return surface.replace(pattern, replacement);
    }
  }
  return surface;
}

// ============================================================
// transform(): Parser 本体
//
// @param tokens - tokenize() の出力
// @returns      - 丁寧語に変換された文字列
// ============================================================

export function transform(tokens: Token[]): string {
  const output: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const next  = tokens[i + 1];
    const atEnd = isSentenceEnd(next);

    switch (token.pos) {

      // 辞書からの直接置換（スラング・代名詞・接続詞）
      case 'slang':
      case 'pronoun':
      case 'conjunction':
        output.push(token.replacement ?? token.surface);
        break;

      // 動詞（辞書に登録されたもの）
      case 'verb':
        output.push(atEnd ? conjugateToMasu(token) : token.surface);
        break;

      // ひらがなグループ（動詞活用・補助動詞・断定形など）
      case 'hiragana':
        if (atEnd) {
          output.push(applyGrammarRules(token.surface));
        } else {
          output.push(applyAuxRulesAlways(token.surface));
        }
        break;

      // それ以外はそのまま出力（助詞・句読点・漢字・カタカナ・英数字）
      default:
        output.push(token.surface);
        break;
    }
  }

  return output.join('');
}
