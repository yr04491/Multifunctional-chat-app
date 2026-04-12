import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// TS Node環境でも動くようにディレクトリ解決
const __dir = typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url));

// 実際のアプリで使われている敬語エンジンをインポート（そのまま利用）
import { convertToTeineigo } from './src/lib/honorificRules';

console.log("=== 敬語エンジン 一括評価スクリプト開始 ===");

// テストケースの読み込み
const jsonString = readFileSync(join(__dir, 'test_cases.json'), 'utf8');
const cases: string[] = JSON.parse(jsonString);

// Markdownテーブルの作成
let md = `# 敬語変換エンジン 一括テスト結果\n`;
md += `実行日時: ${new Date().toLocaleString('ja-JP')}\n\n`;
md += `| 入力 (カジュアル・スラング) | 出力 (丁寧語エンジン変換後) | 備考 |\n`;
md += `|---|---|---|\n`;

let processed = 0;

for (const text of cases) {
  // 最初に入れたコメント行を除外
  if (text.includes("_COMMENT:")) continue;

  const result = convertToTeineigo(text);
  md += `| ${text} | ${result} |  |\n`;
  processed++;
}

writeFileSync(join(__dir, 'evaluation_results.md'), md, 'utf8');
console.log(`✅ 処理完了！ ${processed}件のテキストを変換し、evaluation_results.md を作成しました。`);
