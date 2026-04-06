"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToTeineigo = convertToTeineigo;
function convertToTeineigo(text) {
    var result = text;
    // ============================================
    // 1. 文末判定マーカー
    // ============================================
    var end = "(。|？|！|\\?|\\!|\\n|$|ね|よ|が|わ|さ|ぞ|ぜ|かしら|か|な)";
    // ============================================
    // 2. 超大規模なスラング・口語フレーズ一括置換（最優先で実行）
    // ============================================
    var phraseRules = [
        // --- 強調・感嘆 ---
        { pattern: /(マジで|まじで|ガチで|がちで|ほんとに|ホントに)/g, replacement: "本当に" },
        { pattern: /(マジだ|まじだ|ガチだ|がちだ)/g, replacement: "本当__DESU__" },
        { pattern: /(マジ|ガチ|まじ|がち)/g, replacement: "本当に" },
        { pattern: /(めちゃめちゃ|めちゃくちゃ|めっちゃ|むっちゃ|めちゃ|凄く|すげえ|超|激|バリ|えげつなく|パねえ|半端ない)/g, replacement: "大変" },
        // --- 呼びかけ・罵倒系 ---
        { pattern: /(おいこらてめえ|おいこらてめぇ|おいこら|オイコラ|おい、こら)(、| |　|！|\\!|$)/g, replacement: "誠に恐れ入り__MASU__が$2" },
        { pattern: /^(おい|オイ|なあ|なぁ)(、| |　|！|\\!|$)/g, replacement: "あの$2" },
        { pattern: /^(こら|コラ)(、| |　|！|\\!|$)/g, replacement: "少々よろしいでしょうか$2" },
        // --- コミュニケーション・フィラー ---
        { pattern: /(ぶっちゃけ|ぶっちゃける|ぶっちゃけた話)/g, replacement: "率直に申し上げ__MASU__と" },
        { pattern: /(てか|つーか|っつーか)/g, replacement: "と言い__MASU__か、" },
        { pattern: /(やっぱ|やっぱり|結局のところ)/g, replacement: "やはり" },
        { pattern: /(とりあえず|とりま)/g, replacement: "まずは" },
        { pattern: /(なるはやで|なる早で)/g, replacement: "可能な限り早く" },
        { pattern: /(ワンチャン)/g, replacement: "もしかすると" },
        { pattern: /(あーね|あーなる)/g, replacement: "なるほど、承知いたし__MASHITA__" },
        { pattern: /(了解|りょ|りょうかい)/g, replacement: "承知いたし__MASHITA__" },
        { pattern: /(ってか)/g, replacement: "と言い__MASU__か" },
        { pattern: /(っていうか|ていうか|ちゅうか)/g, replacement: "と言い__MASU__か" },
        { pattern: /(なんか|なーんか)/g, replacement: "なんとなく" },
        { pattern: /(どうせ|どーせ)/g, replacement: "いずれにせよ" },
        { pattern: /(しょーがない|しょうがない|仕方ない|しゃあない)/g, replacement: "致し方あり__MASEN__" },
        { pattern: /(いいんだけど)/g, replacement: "よろしいの__DESU__が" },
        { pattern: /(だめだ|ダメだ|だめなんだけど|ダメなんだけど)/g, replacement: "いけ__MASEN__" },
        { pattern: /(それな)/g, replacement: "おっしゃる通り__DESU__" },
        { pattern: /(ちな|ちなみに)/g, replacement: "ちなみに" },
        { pattern: /(みたいな|みたいな感じ)/g, replacement: "のような" },
        // --- 連語（文末系） ---
        { pattern: /(やばいんだけど|ヤバいんだけど)/g, replacement: "大変なの__DESU__が" },
        { pattern: /(じゃない？|じゃない\?|じゃね？|じゃね\?)/g, replacement: "ではない__DESHOU__か？" },
        { pattern: /(っしょ|でしょ)(。|？|！|\?|\!|\n|$|ね|よ|)/g, replacement: "__DESHOU__か$2" },
        { pattern: /(んじゃん)(。|？|！|\?|\!|\n|$|ね|よ|)/g, replacement: "の__DEWAARIMASEN__か$2" },
        { pattern: /(じゃん)(。|？|！|\?|\!|\n|$|ね|よ|)/g, replacement: "__DEWAARIMASEN__か$2" },
        { pattern: /(んだけど|のだけど)(、|。|？|！|\?|\!|\n|$|ね|よ|)/g, replacement: "の__DESU__が$2" },
        { pattern: /(んだけど|のだけど)ね/g, replacement: "なの__DESU__が、" },
        { pattern: /(なんだよね|んだよね)/g, replacement: "の__DESU__よね" },
        { pattern: /(なんだが|んだが)/g, replacement: "の__DESU__が" },
        { pattern: /(なんだよ|んだよ)/g, replacement: "の__DESU__よ" },
        { pattern: /(なんだ|んだ)(。|？|！|\?|\!|\n|$)/g, replacement: "の__DESU__$2" },
    ];
    // ============================================
    // 3. 代名詞・人称・キャラ特有語の変換
    // ============================================
    var pronounRules = [
        { pattern: /(俺|僕|あたし|自分|わし|ワイ)(ら|たち)?/g, replacement: "私$2" },
        { pattern: /(お前|おまえ|あんた|君|おめえ|きみ|てめえ|てめぇ)(ら|たち)?/g, replacement: "あなた$2" },
        { pattern: /(こいつ)(ら|たち)?/g, replacement: "この方$2" },
        { pattern: /(そいつ)(ら|たち)?/g, replacement: "その方$2" },
        { pattern: /(あいつ)(ら|たち)?/g, replacement: "あの方$2" },
        { pattern: /(どいつ)/g, replacement: "どなた" },
        { pattern: /(誰|だれ)/g, replacement: "どなた" },
    ];
    // ============================================
    // 4. 接続詞・助詞の変換
    // ============================================
    var conjunctionRules = [
        { pattern: /(だけど|でも)(、| |　|$)/g, replacement: "__DESU__が$2" },
        { pattern: /(だから)(、| |　|$)/g, replacement: "__DESU__ので$2" },
        { pattern: /(なんで)(、| |　|？|\?|$)/g, replacement: "なぜ$2" },
        { pattern: /(なんで)(だろ|だろう)/g, replacement: "なぜ__DESHOU__" },
        { pattern: /(だし)(、| |。|？|！|\?|\!|\n|$)/g, replacement: "__DESU__し$2" },
        { pattern: /(からさ|からね)/g, replacement: "から__DESU__" },
        { pattern: /(から)(。|？|！|\?|\!|\n|$)/g, replacement: "から__DESU__$2" },
    ];
    // ============================================
    // 5. 形容詞・口語的な形容詞（ヤバい、ウザい等）の巨大辞書
    // ============================================
    var adjectiveSlangRules = [
        // 強烈なマイナス言葉
        { pattern: /(あほ|アホ)(だろ|だろう|でしょ)(。|？|！|\?|\!|\n|$)/g, replacement: "あほ__DESHOU__か$3" },
        { pattern: /(バカ|ばか|あほ|アホ)(。|？|！|\?|\!|\n|$)/g, replacement: "愚か__DESU__$2" },
        { pattern: /(ウザい|うざい|うぜえ)(。|？|！|\?|\!|\n|$)/g, replacement: "煩わしい__DESU__$2" },
        { pattern: /(キモい|きもい|きしょい|気持ち悪い)(。|？|！|\?|\!|\n|$)/g, replacement: "不快__DESU__$2" },
        { pattern: /(だるい|ダルい|だりぃ)(。|？|！|\?|\!|\n|$)/g, replacement: "億劫__DESU__$2" },
        { pattern: /(エグい|えぐい|えぐ)(。|？|！|\?|\!|\n|$)/g, replacement: "凄まじい__DESU__$2" },
        // プラス・中間言葉
        { pattern: /(やばい|ヤバい|ヤバすぎる|やばすぎる)(。|？|！|\?|\!|\n|$)/g, replacement: "大変な状態__DESU__$2" },
        { pattern: /(うまい|ウマい|美味い|美味しい)(。|？|！|\?|\!|\n|$)/g, replacement: "美味しい__DESU__$2" },
        { pattern: /(デカい|でかい)(。|？|！|\?|\!|\n|$)/g, replacement: "大きい__DESU__$2" },
        { pattern: /(むずい|ムズい|難しい)(。|？|！|\?|\!|\n|$)/g, replacement: "難しい__DESU__$2" },
        { pattern: /(良い|いい|よい)(。|？|！|\?|\!|\n|$)/g, replacement: "良い__DESU__$2" },
        // 一般のい形容詞 (過去形処理の前に実行)
        { pattern: /(ない)(。|？|！|\?|\!|\n|$|ね|よ|が)/g, replacement: "ない__DESU__$2" },
        { pattern: /([ぁ-ん|一-龥])い(。|？|！|\?|\!|\n|$|ね|よ|が)/g, replacement: "$1い__DESU__$2" },
    ];
    // ============================================
    // 6. 過去形・形容詞の変形 (動詞ルールの前に移動!)
    // ============================================
    var pastTenseRules = [
        { pattern: new RegExp("(\u306A\u304B\u3063\u305F)".concat(end), "g"), replacement: "なかった__DESU__$2" },
        { pattern: new RegExp("(\u304B\u3063\u305F)".concat(end), "g"), replacement: "かった__DESU__$2" },
    ];
    // ============================================
    // 7. 補助動詞・動詞的連語（〜しとく、〜なきゃ）
    // ============================================
    var verbAuxRules = [
        { pattern: /(ちゃう)(。|？|！|\?|\!|\n|$|ね|よ|が|わ)/g, replacement: "てしまい__MASU__$2" },
        { pattern: /(ちゃった)(。|？|！|\?|\!|\n|$|ね|よ|が|わ)/g, replacement: "てしまい__MASHITA__$2" },
        { pattern: /(とくね|ておくね)/g, replacement: "ておき__MASU__ね" },
        { pattern: /(とく|ておく)/g, replacement: "ておき__MASU__" },
        { pattern: /(なきゃ|なくちゃ)/g, replacement: "なければなり__MASEN__" },
        { pattern: /(してる|している)(。|？|！|\?|\!|\n|$|ね|よ|が|わ)/g, replacement: "してい__MASU__$2" },
        { pattern: /(してた|していた)(。|？|！|\?|\!|\n|$|ね|よ|が|わ)/g, replacement: "してい__MASHITA__$2" },
        { pattern: /(してない|していない)(。|？|！|\?|\!|\n|$|ね|よ|が|わ)/g, replacement: "してい__MASEN__$2" },
        { pattern: /(しない)(。|？|！|\?|\!|\n|$|ね|よ|が|わ)/g, replacement: "し__MASEN__$2" },
        { pattern: /(こない|来ない)(。|？|！|\?|\!|\n|$|ね|よ|が|わ)/g, replacement: "き__MASEN__$2" },
        { pattern: /(なさい)(。|？|！|\?|\!|\n|$|ね|よ|が|わ)/g, replacement: "なさってくだ__SAI__$2" },
        { pattern: /(てね)(。|？|！|\?|\!|\n|$|ね|よ|が|わ)/g, replacement: "てくだ__SAI__ね$2" },
        { pattern: /(てよ)(。|？|！|\?|\!|\n|$|ね|よ|が|わ)/g, replacement: "てくだ__SAI__$2" },
        { pattern: /(て)(。|？|！|\?|\!|\n|$|ね|よ|が|わ)/g, replacement: "てくだ__SAI__$2" },
    ];
    // ============================================
    // 8. 一般動詞の精密活用メタヒューリスティクス
    // ============================================
    var verbRules = [
        { pattern: new RegExp("(\u78BA\u8A8D|\u9023\u7D61|\u5831\u544A|\u76F8\u8AC7|\u5BFE\u5FDC|\u6E96\u5099|\u52C9\u5F37|\u4ED5\u4E8B|\u904B\u52D5)\u3059\u308B".concat(end), "g"), replacement: "$1し__MASU__$2" },
        { pattern: new RegExp("\u3059\u308B".concat(end), "g"), replacement: "し__MASU__$1" },
        { pattern: new RegExp("\u3057\u305F".concat(end), "g"), replacement: "し__MASHITA__$1" },
        { pattern: new RegExp("\u304F\u308B".concat(end), "g"), replacement: "き__MASU__$1" },
        { pattern: new RegExp("\u304D\u305F".concat(end), "g"), replacement: "き__MASHITA__$1" },
        // 過去形・完了形 (五段・一段)
        { pattern: new RegExp("\u3093\u3060".concat(end), "g"), replacement: "み__MASHITA__$1" },
        { pattern: new RegExp("\u3044\u3060".concat(end), "g"), replacement: "ぎ__MASHITA__$1" },
        { pattern: new RegExp("\u3044\u305F".concat(end), "g"), replacement: "き__MASHITA__$1" },
        { pattern: new RegExp("\u3063\u305F".concat(end), "g"), replacement: "り__MASHITA__$1" },
        { pattern: new RegExp("\u3057\u305F".concat(end), "g"), replacement: "し__MASHITA__$1" },
        { pattern: new RegExp("\u305F".concat(end), "g"), replacement: "__MASHITA__$1" },
        // 一段動詞（る）の修正・最適化
        { pattern: new RegExp("([\u3044\u304D\u3057\u3061\u306B\u3072\u307F\u308A\u3048\u3051\u305B\u3066\u306D\u3078\u3081\u308C\u3079\u3067])\u308B".concat(end), "g"), replacement: "$1__MASU__$2" },
        { pattern: new RegExp("\u308B".concat(end), "g"), replacement: "り__MASU__$1" },
        // 五段動詞（う段）
        { pattern: new RegExp("\u3046".concat(end), "g"), replacement: "い__MASU__$1" },
        { pattern: new RegExp("\u304F".concat(end), "g"), replacement: "き__MASU__$1" },
        { pattern: new RegExp("\u3050".concat(end), "g"), replacement: "ぎ__MASU__$1" },
        { pattern: new RegExp("\u3059".concat(end), "g"), replacement: "し__MASU__$1" },
        { pattern: new RegExp("\u3064".concat(end), "g"), replacement: "ち__MASU__$1" },
        { pattern: new RegExp("\u306C".concat(end), "g"), replacement: "に__MASU__$1" },
        { pattern: new RegExp("\u3076".concat(end), "g"), replacement: "び__MASU__$1" },
        { pattern: new RegExp("\u3080".concat(end), "g"), replacement: "み__MASU__$1" },
    ];
    // ============================================
    // 9. 文末断定・特殊形（一時プレースホルダー化）
    // ============================================
    var specialPhrases = [
        { pattern: new RegExp("(\u3058\u3083\u306A\u3044\u304B|\u3067\u306F\u306A\u3044\u304B)".concat(end), "g"), replacement: "__DEWAARIMASEN__か$2" },
        { pattern: new RegExp("(\u3067\u306F\u306A\u3044)".concat(end), "g"), replacement: "__DEWAARIMASEN__$2" },
        { pattern: new RegExp("(\u3058\u3083\u306A\u3044)".concat(end), "g"), replacement: "__DEWAARIMASEN__$2" },
        { pattern: new RegExp("(\u3060\u3063\u305F)".concat(end), "g"), replacement: "__DESHITA__$2" },
        { pattern: new RegExp("(\u3067\u3042\u308B)(\u304B|)".concat(end), "g"), replacement: "__DESU__$2$3" },
        { pattern: new RegExp("(\u3060\u308D|\u3060\u308D\u3046)(\u304B)".concat(end), "g"), replacement: "__DESHOU__か$3" },
        { pattern: new RegExp("(\u3060\u308D|\u3060\u308D\u3046)(\uFF1F|\\?)".concat(end), "g"), replacement: "__DESHOU__か$3" },
        { pattern: new RegExp("(\u3060\u308D|\u3060\u308D\u3046)".concat(end), "g"), replacement: "__DESHOU__$2" },
        { pattern: new RegExp("(\u304B\u306A)".concat(end), "g"), replacement: "__DESHOU__か$2" },
        { pattern: new RegExp("(\u3060\u306D)".concat(end), "g"), replacement: "__DESU__ね$2" },
        { pattern: new RegExp("(\u3060\u3088)".concat(end), "g"), replacement: "__DESU__よ$2" },
        { pattern: new RegExp("\u3060".concat(end), "g"), replacement: "__DESU__$1" },
    ];
    // ============================================
    // ルールの順次適用（順番が命）
    // ============================================
    var allRuleSets = [
        phraseRules,
        pronounRules,
        conjunctionRules,
        adjectiveSlangRules,
        pastTenseRules, // 繰り上げられた過去形ルール
        verbAuxRules,
        verbRules,
        specialPhrases
    ];
    allRuleSets.forEach(function (rules) {
        rules.forEach(function (_a) {
            var pattern = _a.pattern, replacement = _a.replacement;
            result = result.replace(pattern, replacement);
        });
    });
    // ============================================
    // 10. プレースホルダーの正しい日本語へのリストア
    // ============================================
    result = result.replace(/__DEWAARIMASEN__/g, "ではありません");
    result = result.replace(/__DESHOU__/g, "でしょう");
    result = result.replace(/__DESHITA__/g, "でした");
    result = result.replace(/__DESUKA__/g, "ですか");
    result = result.replace(/__DESU__/g, "です");
    result = result.replace(/__MASHITA__/g, "ました");
    result = result.replace(/__MASEN__/g, "ません");
    result = result.replace(/__MASU__/g, "ます");
    result = result.replace(/__SAI__/g, "さい");
    return result;
}
