/**
 * src/lib/honorificRules.ts
 *
 * 敬語変換エンジン（外部インターフェース）
 *
 * 内部は Lexer → Parser → Generator の3フェーズ・パイプラインで動作する。
 *   1. tokenize(text)   : 入力文字列をトークン配列に分割（lexer.ts）
 *   2. transform(tokens): トークン配列を丁寧語に変換（parser.ts）
 *   3. join('')         : transform 内部でトークンを結合して最終文字列を返す
 *
 * 外部からの呼び出し方は変わらない:
 *   import { convertToTeineigo } from '@/lib/honorificRules';
 *   const polite = convertToTeineigo('俺が走る。'); // → "私が走ります。"
 *
 * ── 旧実装との違い ──────────────────────────────────────────────────────
 * 旧実装は正規表現による全文一括置換を繰り返し、二重変換を防ぐために
 * __DESU__ / __MASU__ 等のプレースホルダーが必要だった。
 * 新実装ではトークン単位で変換するため、プレースホルダーは一切不要。
 * ────────────────────────────────────────────────────────────────────────
 */

import { tokenize } from './lexer';
import { transform } from './parser';

export function convertToTeineigo(text: string): string {
  // フェーズ1: 字句解析（文字列 → Token[]）
  const tokens = tokenize(text);

  // フェーズ2 + 3: 変換・結合（Token[] → 丁寧語文字列）
  return transform(tokens);
}
