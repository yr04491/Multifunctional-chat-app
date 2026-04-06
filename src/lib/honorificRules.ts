export function convertToTeineigo(text: string): string {
  let result = text;

  // ============================================
  // 1. 文末判定マーカー
  // ============================================
  const end = "(。|？|！|\\?|\\!|\\n|$|ね|よ|が|わ|さ|ぞ|ぜ|かしら|か|な)";

  // ============================================
  // 2. 超大規模なスラング・口語フレーズ一括置換（最優先で実行）
  // ============================================
  const phraseRules = [
    // --- 強調・感嘆・程度 ---
    { pattern: /(マジで|まじで|ガチで|がちで|ほんとに|ホントに)/g, replacement: "本当に" },
    { pattern: /(マジだ|まじだ|ガチだ|がちだ)/g, replacement: "本当__DESU__" },
    { pattern: /(マジ|ガチ|まじ|がち)/g, replacement: "本当に" },
    { pattern: /(めちゃめちゃ|めちゃくちゃ|めっちゃ|むっちゃ|めちゃ|凄く|すげえ|すげぇ|超|激|バリ|えげつなく|パねえ|パねぇ|半端ない|はんぱない|ハンパない|鬼)/g, replacement: "大変" },
    { pattern: /(だいぶ|かなり|わりと|割と|案外|意外と|思いのほか)/g, replacement: "思いのほか" },
    { pattern: /(わんさか|たくさん|いっぱい|腐るほど|山ほど|ゴマンと)/g, replacement: "数多く" },

    // --- 呼びかけ・罵倒・挑発系 ---
    { pattern: /(おいこらてめえ|おいこらてめぇ|おいこら|オイコラ|おい、こら)(、| |　|！|\\!|$)/g, replacement: "誠に恐れ入り__MASU__が$2" },
    { pattern: /^(おい|オイ|なあ|なぁ|あのさ|あのさぁ|あのね)(、| |　|！|\\!|$)/g, replacement: "あの$2" },
    { pattern: /^(こら|コラ)(、| |　|！|\\!|$)/g, replacement: "少々よろしいでしょうか$2" },
    { pattern: /(ふざけんな|ふざけるな)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "ご冗談はおやめくだ__SAI__$2" },
    { pattern: /(だまれ|黙れ)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "お静かに願え__MASU__でしょうか$2" },
    { pattern: /(うっせぇ|うっせえ|うるさい)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "些か騒がしいよう__DESU__$2" },
    
    // --- ネットスラング・若者言葉 ---
    { pattern: /(草|www|ｗｗｗ)(。|？|！|\\?|\\!|\\n|$| )/gi, replacement: "（笑）$2" },
    { pattern: /(ぴえん|ぱおん)(。|？|！|\\?|\\!|\\n|$| )/g, replacement: "（泣）$2" },
    { pattern: /(詰んだ|つんだ)(。|？|！|\\?|\\!|\\n|$|わ)/g, replacement: "途方に暮れ__MASHITA__$2" },
    { pattern: /(ちな|ちなみに)(、| |　|$)/g, replacement: "ちなみに$2" },
    { pattern: /(ディスる)/g, replacement: "批判する" },
    { pattern: /(ディスった)/g, replacement: "批判し__MASHITA__" },
    { pattern: /(バズる)/g, replacement: "話題になる" },
    { pattern: /(バズった)/g, replacement: "話題になり__MASHITA__" },
    { pattern: /(ググる)/g, replacement: "検索する" },
    { pattern: /(ググった)/g, replacement: "検索し__MASHITA__" },
    { pattern: /(ドヤる|ドヤ顔する)/g, replacement: "得意げにする" },
    { pattern: /(マウントとる|マウント取る)/g, replacement: "優位に立とうとする" },
    { pattern: /(チート)(な|の)/g, replacement: "非常に規格外$2" },
    { pattern: /(ポンコツ)/g, replacement: "ご愛嬌のある" },
    { pattern: /(ガチ恋|リア充|パリピ)/g, replacement: "充実した方" },
    { pattern: /(沼る|沼った|沼)/g, replacement: "深く傾倒する" },
    { pattern: /(てぇてぇ|尊い)/g, replacement: "至高__DESU__" },
    { pattern: /(わかりみ|つらみ)(が深い)?/g, replacement: "強く共感いたし__MASU__" },
    { pattern: /(やばたにえん|キャパい)/g, replacement: "大変な状況__DESU__" },
    { pattern: /(あざと|あざとい)/g, replacement: "魅力的__DESU__" },
    { pattern: /(ワンチャン)/g, replacement: "もしかすると" },
    { pattern: /(あーね|あーなる|なるへそ|なる)/g, replacement: "なるほど、承知いたし__MASHITA__" },
    { pattern: /(了解|りょ|りょうかい|おけ|オケ|おっけー|オッケー)/g, replacement: "承知いたし__MASHITA__" },
    { pattern: /(それな|ほんこれ)/g, replacement: "おっしゃる通り__DESU__" },

    // --- カタカナビジネス語・横文字 ---
    { pattern: /(さくっと|サクッと)/g, replacement: "手早く" },
    { pattern: /(ざっくり|ザックリ)(と)?/g, replacement: "大まかに" },
    { pattern: /(えいやで|エイヤで)/g, replacement: "思い切って" },
    { pattern: /(落とし所|落としどころ)/g, replacement: "妥協点" },
    { pattern: /(ケツ)(が|の|は)/g, replacement: "最終期限$2" },
    { pattern: /(巻き|まき)(で)/g, replacement: "急ぎ$2" },
    { pattern: /(リスケ)/g, replacement: "予定変更" },
    { pattern: /(ブレスト)/g, replacement: "意見交換" },
    { pattern: /(フィックス)(する)?/g, replacement: "確定" },
    { pattern: /(アグリー)(する)?/g, replacement: "同意" },
    { pattern: /(ペンディング)/g, replacement: "保留" },
    { pattern: /(エビデンス)/g, replacement: "根拠" },
    { pattern: /(コミット)(する)?/g, replacement: "約束" },
    { pattern: /(コンセンサス)/g, replacement: "合意" },
    { pattern: /(シナジー)/g, replacement: "相乗効果" },
    { pattern: /(ボトルネック|ネック)/g, replacement: "懸念点" },
    { pattern: /(デフォ|デフォルト)/g, replacement: "標準" },
    { pattern: /(マスト)/g, replacement: "必須" },
    { pattern: /(バッファ)/g, replacement: "余裕" },
    { pattern: /(タイト)(な|に)/g, replacement: "厳しい$2" },
    { pattern: /(なるはやで|なる早で|なるはや|なる早)/g, replacement: "可能な限り早く" },

    // --- コミュニケーション・フィラー・接続詞連語 ---
    { pattern: /(ぶっちゃけ|ぶっちゃける|ぶっちゃけた話)/g, replacement: "率直に申し上げ__MASU__と" },
    { pattern: /(てか|つーか|っつーか)/g, replacement: "と言い__MASU__か、" },
    { pattern: /(やっぱ|やっぱり|結局のところ)/g, replacement: "やはり" },
    { pattern: /(とりあえず|とりま)/g, replacement: "まずは" },
    { pattern: /(ってか)/g, replacement: "と言い__MASU__か" },
    { pattern: /(っていうか|ていうか|ちゅうか)/g, replacement: "と言い__MASU__か" },
    { pattern: /(なんか|なーんか)/g, replacement: "なんとなく" },
    { pattern: /(どうせ|どーせ)/g, replacement: "いずれにせよ" },
    { pattern: /(しょーがない|しょうがない|仕方ない|しゃあない|しゃーない)/g, replacement: "致し方あり__MASEN__" },
    { pattern: /(いいんだけど)/g, replacement: "よろしいの__DESU__が" },
    { pattern: /(だめだ|ダメだ|だめなんだけど|ダメなんだけど)/g, replacement: "いけ__MASEN__" },
    { pattern: /(みたいな|みたいな感じ)/g, replacement: "のような" },

    // --- 連語（文末系） ---
    { pattern: /(やばいんだけど|ヤバいんだけど)/g, replacement: "大変なの__DESU__が" },
    { pattern: /(じゃない？|じゃない\?|じゃね？|じゃね\?)/g, replacement: "ではない__DESHOU__か？" },
    { pattern: /(っしょ|でしょ)(。|？|！|\\?|\\!|\\n|$|ね|よ|)/g, replacement: "__DESHOU__か$2" },
    { pattern: /(んじゃん)(。|？|！|\\?|\\!|\\n|$|ね|よ|)/g, replacement: "の__DEWAARIMASEN__か$2" },
    { pattern: /(じゃん)(。|？|！|\\?|\\!|\\n|$|ね|よ|)/g, replacement: "__DEWAARIMASEN__か$2" },
    { pattern: /(んだけど|のだけど)(、|。|？|！|\\?|\\!|\\n|$|ね|よ|)/g, replacement: "の__DESU__が$2" },
    { pattern: /(んだけど|のだけど)ね/g, replacement: "なの__DESU__が、" },
    { pattern: /(なんだよね|んだよね)/g, replacement: "の__DESU__よね" },
    { pattern: /(なんだが|んだが)/g, replacement: "の__DESU__が" },
    { pattern: /(なんだよ|んだよ)/g, replacement: "の__DESU__よ" },
    { pattern: /(なんだ|んだ)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "の__DESU__$2" },
  ];

  // ============================================
  // 3. 代名詞・人称・キャラ特有語の変換
  // ============================================
  const pronounRules = [
    { pattern: /(俺|僕|あたし|自分|わし|ワイ)(ら|たち)/g, replacement: "私ども" },
    { pattern: /(俺|僕|あたし|自分|わし|ワイ)/g, replacement: "私" },
    { pattern: /(お前|おまえ|あんた|君|おめえ|きみ|てめえ|てめぇ|貴様)(ら|たち)/g, replacement: "皆様" },
    { pattern: /(お前|おまえ|あんた|君|おめえ|きみ|てめえ|てめぇ|貴様)/g, replacement: "あなた様" },
    { pattern: /(こいつ)(ら|たち)/g, replacement: "この方々" },
    { pattern: /(こいつ)/g, replacement: "こちらの方" },
    { pattern: /(そいつ)(ら|たち)/g, replacement: "その方々" },
    { pattern: /(そいつ)/g, replacement: "そちらの方" },
    { pattern: /(あいつ)(ら|たち)/g, replacement: "あの方々" },
    { pattern: /(あいつ)/g, replacement: "あちらの方" },
    { pattern: /(どいつ)/g, replacement: "どなた" },
    { pattern: /(誰|だれ)/g, replacement: "どなた様" },
    { pattern: /(みんな)/g, replacement: "皆様" },
  ];

  // ============================================
  // 4. 接続詞・助詞の変換
  // ============================================
  const conjunctionRules = [
    { pattern: /(だけど|でも)(、| |　|$)/g, replacement: "__DESU__が$2" },
    { pattern: /(だから)(、| |　|$)/g, replacement: "__DESU__ので$2" },
    { pattern: /(なんで)(、| |　|？|\\?|$)/g, replacement: "なぜ$2" },
    { pattern: /(なんで)(だろ|だろう)/g, replacement: "なぜ__DESHOU__" },
    { pattern: /(だし)(、| |。|？|！|\\?|\\!|\\n|$)/g, replacement: "__DESU__し$2" },
    { pattern: /(からさ|からね)/g, replacement: "から__DESU__" },
    { pattern: /(から)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "から__DESU__$2" },
  ];

  // ============================================
  // 5. 形容詞・口語的な形容詞（ヤバい、ウザい等）の巨大辞書
  // ============================================
  const adjectiveSlangRules = [
    // --- 強烈なマイナス言葉 ---
    { pattern: /(あほ|アホ|バカ|ばか)(だろ|だろう|でしょ)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "浅慮__DESHOU__か$3" },
    { pattern: /(バカ|ばか|あほ|アホ)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "浅慮__DESU__$2" },
    { pattern: /(ウザい|うざい|うぜえ|うぜぇ)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "煩わしい__DESU__$2" },
    { pattern: /(キモい|きもい|きしょい|気持ち悪い)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "不快に存じ__MASU__$2" },
    { pattern: /(だるい|ダルい|だりぃ)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "億劫__DESU__$2" },
    { pattern: /(エグい|えぐい|えぐ)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "凄まじい__DESU__$2" },
    { pattern: /(しょぼい|ショボい|ショボ)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "小規模__DESU__$2" },
    { pattern: /(ダサい|ださい|ダサ)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "あまり洗練されており__MASEN__$2" },
    { pattern: /(くそ|クソ)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "非常に残念__DESU__$2" },
    { pattern: /(ゴミ|ごみ)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "不要なもの__DESU__$2" },
    { pattern: /(雑魚|ざこ)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "経験不足__DESU__$2" },

    // --- プラス・中間言葉・若者形容詞 ---
    { pattern: /(エモい|えもい)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "感慨深い__DESU__$2" },
    { pattern: /(しんどい)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "非常に厳しい__DESU__$2" },
    { pattern: /(やばい|ヤバい|ヤバすぎる|やばすぎる)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "大変な状態__DESU__$2" },
    { pattern: /(うまい|ウマい|美味い|美味しい)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "非常に美味__DESU__$2" },
    { pattern: /(デカい|でかい)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "大きい__DESU__$2" },
    { pattern: /(むずい|ムズい|むずかしい|難しい)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "難しい__DESU__$2" },
    { pattern: /(良い|いい|よい)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "大変素晴らしい__DESU__$2" },

    // --- 一般のい形容詞 (過去形処理の前に実行) ---
    { pattern: /(ない)(。|？|！|\\?|\\!|\\n|$|ね|よ|が)/g, replacement: "ない__DESU__$2" },
    { pattern: /([ぁ-ん|一-龥])い(。|？|！|\\?|\\!|\\n|$|ね|よ|が)/g, replacement: "$1い__DESU__$2" },
  ];

  // ============================================
  // 6. 過去形・形容詞の変形 (動詞ルールの前に移動!)
  // ============================================
  const pastTenseRules = [
    { pattern: new RegExp(`(なかった)${end}`, "g"), replacement: "なかった__DESU__$2" },
    { pattern: new RegExp(`(かった)${end}`, "g"), replacement: "かった__DESU__$2" },
  ];

  // ============================================
  // 7. 補助動詞・動詞的連語（〜しとく、〜なきゃ）
  // ============================================
  const verbAuxRules = [
    { pattern: /(萎えた|なえた|萎え)(。|？|！|\\?|\\!|\\n|$)/g, replacement: "意気消沈いたし__MASHITA__$2" },
    { pattern: /(ちゃう)(。|？|！|\\?|\\!|\\n|$|ね|よ|が|わ)/g, replacement: "てしまい__MASU__$2" },
    { pattern: /(ちゃった)(。|？|！|\\?|\\!|\\n|$|ね|よ|が|わ)/g, replacement: "てしまい__MASHITA__$2" },
    { pattern: /(とくね|ておくね)/g, replacement: "ておき__MASU__ね" },
    { pattern: /(とく|ておく)/g, replacement: "ておき__MASU__" },
    { pattern: /(なきゃ|なくちゃ)/g, replacement: "なければなり__MASEN__" },
    { pattern: /(してる|している)(。|？|！|\\?|\\!|\\n|$|ね|よ|が|わ)/g, replacement: "してい__MASU__$2" },
    { pattern: /(してた|していた)(。|？|！|\\?|\\!|\\n|$|ね|よ|が|わ)/g, replacement: "してい__MASHITA__$2" },
    { pattern: /(してない|していない)(。|？|！|\\?|\\!|\\n|$|ね|よ|が|わ)/g, replacement: "してい__MASEN__$2" },
    { pattern: /(しない)(。|？|！|\\?|\\!|\\n|$|ね|よ|が|わ)/g, replacement: "いたし__MASEN__$2" },
    { pattern: /(こない|来ない)(。|？|！|\\?|\\!|\\n|$|ね|よ|が|わ)/g, replacement: "参り__MASEN__$2" },
    { pattern: /(なさい)(。|？|！|\\?|\\!|\\n|$|ね|よ|が|わ)/g, replacement: "なさってくだ__SAI__$2" },
    { pattern: /(てね)(。|？|！|\\?|\\!|\\n|$|ね|よ|が|わ)/g, replacement: "てくだ__SAI__ね$2" },
    { pattern: /(てよ)(。|？|！|\\?|\\!|\\n|$|ね|よ|が|わ)/g, replacement: "てくだ__SAI__$2" },
    { pattern: /(て)(。|？|！|\\?|\\!|\\n|$|ね|よ|が|わ)/g, replacement: "てくだ__SAI__$2" },
  ];

  // ============================================
  // 8. 一般動詞の精密活用メタヒューリスティクス
  // ============================================
  const verbRules = [
    { pattern: new RegExp(`(確認|連絡|報告|相談|対応|準備|勉強|仕事|運動|調整|検討)する${end}`, "g"), replacement: "$1いたし__MASU__$2" },
    { pattern: new RegExp(`する${end}`, "g"), replacement: "いたし__MASU__$1" },
    { pattern: new RegExp(`した${end}`, "g"), replacement: "いたし__MASHITA__$1" },
    { pattern: new RegExp(`くる${end}`, "g"), replacement: "参り__MASU__$1" },
    { pattern: new RegExp(`きた${end}`, "g"), replacement: "参り__MASHITA__$1" },
    
    // 過去形・完了形 (五段・一段)
    { pattern: new RegExp(`んだ${end}`, "g"), replacement: "み__MASHITA__$1" },
    { pattern: new RegExp(`いだ${end}`, "g"), replacement: "ぎ__MASHITA__$1" },
    { pattern: new RegExp(`いた${end}`, "g"), replacement: "き__MASHITA__$1" },
    { pattern: new RegExp(`った${end}`, "g"), replacement: "り__MASHITA__$1" },
    { pattern: new RegExp(`した${end}`, "g"), replacement: "し__MASHITA__$1" },
    { pattern: new RegExp(`た${end}`, "g"), replacement: "__MASHITA__$1" },
    
    // 一段動詞（る）の修正・最適化
    { pattern: new RegExp(`([いきしちにひみりえけせてねへめれべで])る${end}`, "g"), replacement: "$1__MASU__$2" },
    { pattern: new RegExp(`る${end}`, "g"), replacement: "り__MASU__$1" }, 
    
    // 五段動詞（う段）
    { pattern: new RegExp(`う${end}`, "g"), replacement: "い__MASU__$1" },
    { pattern: new RegExp(`く${end}`, "g"), replacement: "き__MASU__$1" },
    { pattern: new RegExp(`ぐ${end}`, "g"), replacement: "ぎ__MASU__$1" },
    { pattern: new RegExp(`す${end}`, "g"), replacement: "し__MASU__$1" },
    { pattern: new RegExp(`つ${end}`, "g"), replacement: "ち__MASU__$1" },
    { pattern: new RegExp(`ぬ${end}`, "g"), replacement: "に__MASU__$1" },
    { pattern: new RegExp(`ぶ${end}`, "g"), replacement: "び__MASU__$1" },
    { pattern: new RegExp(`む${end}`, "g"), replacement: "み__MASU__$1" },
  ];

  // ============================================
  // 9. 文末断定・特殊形（一時プレースホルダー化）
  // ============================================
  const specialPhrases = [
    { pattern: new RegExp(`(じゃないか|ではないか)${end}`, "g"), replacement: "__DEWAARIMASEN__か$2" },
    { pattern: new RegExp(`(ではない)${end}`, "g"), replacement: "__DEWAARIMASEN__$2" },
    { pattern: new RegExp(`(じゃない)${end}`, "g"), replacement: "__DEWAARIMASEN__$2" },
    { pattern: new RegExp(`(だった)${end}`, "g"), replacement: "__DESHITA__$2" },
    { pattern: new RegExp(`(である)(か|)${end}`, "g"), replacement: "__DESU__$2$3" },
    { pattern: new RegExp(`(だろ|だろう)(か)${end}`, "g"), replacement: "__DESHOU__か$3" },
    { pattern: new RegExp(`(だろ|だろう)(？|\\?)${end}`, "g"), replacement: "__DESHOU__か$3" },
    { pattern: new RegExp(`(だろ|だろう)${end}`, "g"), replacement: "__DESHOU__$2" },
    { pattern: new RegExp(`(かな)${end}`, "g"), replacement: "__DESHOU__か$2" },
    { pattern: new RegExp(`(だね)${end}`, "g"), replacement: "__DESU__ね$2" },
    { pattern: new RegExp(`(だよ)${end}`, "g"), replacement: "__DESU__よ$2" },
    { pattern: new RegExp(`だ${end}`, "g"), replacement: "__DESU__$1" },
  ];

  // ============================================
  // ルールの順次適用（順番が命）
  // ============================================
  const allRuleSets = [
    phraseRules,         
    pronounRules,        
    conjunctionRules,    
    adjectiveSlangRules, 
    pastTenseRules,      
    verbAuxRules,        
    verbRules,           
    specialPhrases       
  ];

  allRuleSets.forEach(rules => {
    rules.forEach(({ pattern, replacement }) => {
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
