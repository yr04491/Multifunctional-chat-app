"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Edit2, Check, X, LogOut, Globe, Languages, Loader2, Settings, Monitor, Moon, Sun, TreePine, Zap, Hash } from "lucide-react";
import { useChat, Message } from "@/lib/useChat";
import type { User } from "firebase/auth";
import { translateText } from "@/app/actions/translate";

const LANGUAGES = [
  { code: "en", name: "英語 🇺🇸" },
  { code: "ar", name: "アラビア語 🇸🇦" },
  { code: "ru", name: "ロシア語 🇷🇺" },
  { code: "hi", name: "ヒンディー語 🇮🇳" },
  { code: "zh", name: "中国語 🇨🇳" },
  { code: "ko", name: "韓国語 🇰🇷" },
  { code: "th", name: "タイ語 🇹🇭" }
];

const THEMES = {
  dark: {
    name: "ダーク",
    icon: Moon,
    appBg: "bg-zinc-950 text-white selection:bg-indigo-500/30",
    headerBg: "border-zinc-800 bg-zinc-900/60",
    headerText: "text-zinc-100",
    headerMuted: "text-indigo-400",
    headerIconBg: "from-indigo-600 to-violet-500 shadow-indigo-600/20 text-white",
    headerButton: "text-zinc-400 hover:bg-zinc-800 hover:text-rose-400",
    settingsBtnDefault: "bg-zinc-800/50 text-zinc-400 border-transparent hover:bg-zinc-800",
    settingsBtnActive: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]",
    sysMessage: "bg-zinc-800/60 text-zinc-400 border-zinc-700/50",
    messageMineBg: "bg-indigo-600 text-white shadow-indigo-900/10 hover:shadow-indigo-900/30 border-transparent",
    messageTheirsBg: "bg-zinc-800/90 text-zinc-100 shadow-zinc-900/50 border-zinc-700/50 hover:bg-zinc-800",
    messageAvatarDefault: "bg-zinc-800 text-zinc-400",
    messageSenderName: "text-zinc-500",
    editTextarea: "bg-black/20 border-indigo-400/50 text-white focus:ring-white/50",
    editBtnCancel: "hover:bg-white/10 text-white",
    editBtnSave: "bg-white text-indigo-600",
    backTranslateBtn: "text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20",
    timestampMine: "text-indigo-100",
    timestampTheirs: "text-zinc-400",
    inputWrapperBg: "border-zinc-800/60 bg-zinc-900/60",
    inputArea: "border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:bg-zinc-800 focus:ring-indigo-500/10",
    sendBtn: "bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-500/40 ring-indigo-500/30",
    modalOverlay: "bg-black/60",
    modalBg: "bg-zinc-900 border-zinc-700/50",
    modalSectionBg: "border-zinc-800 bg-zinc-950/50",
    modalLabel: "text-zinc-200",
    modalSubLabel: "text-zinc-400",
    toggleBg: "bg-zinc-700 peer-checked:bg-indigo-500",
    langBtnDefault: "bg-zinc-800/80 border-transparent text-zinc-300 hover:bg-zinc-700 hover:text-white",
    langBtnActive: "bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[inset_0_0_10px_rgba(99,102,241,0.2)]",
    modalConfirmBtn: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20",
    accentText: "text-indigo-400",
    optionsBtnIcon: "text-indigo-400"
  },
  light: {
    name: "ライト",
    icon: Sun,
    appBg: "bg-slate-50 text-slate-900 selection:bg-blue-500/30",
    headerBg: "border-slate-200 bg-white/80",
    headerText: "text-slate-900",
    headerMuted: "text-blue-500",
    headerIconBg: "from-blue-500 to-cyan-400 shadow-blue-500/20 text-white",
    headerButton: "text-slate-500 hover:bg-slate-100 hover:text-rose-500",
    settingsBtnDefault: "bg-white text-slate-500 border-slate-200 shadow-sm hover:bg-slate-50",
    settingsBtnActive: "bg-blue-50 text-blue-600 border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    sysMessage: "bg-slate-200/60 text-slate-500 border-slate-300/50",
    messageMineBg: "bg-blue-500 text-white shadow-blue-900/10 hover:shadow-blue-900/20 border-transparent",
    messageTheirsBg: "bg-white text-slate-800 shadow-sm border-slate-200 hover:bg-slate-50",
    messageAvatarDefault: "bg-slate-200 text-slate-600",
    messageSenderName: "text-slate-500",
    editTextarea: "bg-white border-blue-300 text-slate-900 focus:ring-blue-500/30",
    editBtnCancel: "text-slate-100 hover:bg-white/20",
    editBtnSave: "bg-white text-blue-600",
    backTranslateBtn: "text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100",
    timestampMine: "text-blue-100",
    timestampTheirs: "text-slate-400",
    inputWrapperBg: "border-slate-200 bg-white/60",
    inputArea: "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:ring-blue-500/20",
    sendBtn: "bg-blue-500 text-white shadow-blue-500/30 hover:bg-blue-600 hover:shadow-blue-600/40 ring-blue-500/30",
    modalOverlay: "bg-slate-900/40 backdrop-blur-sm",
    modalBg: "bg-white border-slate-200",
    modalSectionBg: "border-slate-200 bg-slate-50",
    modalLabel: "text-slate-800",
    modalSubLabel: "text-slate-500",
    toggleBg: "bg-slate-300 peer-checked:bg-blue-500",
    langBtnDefault: "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
    langBtnActive: "bg-blue-50 border-blue-400 text-blue-700 shadow-[inset_0_0_5px_rgba(59,130,246,0.1)]",
    modalConfirmBtn: "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20",
    accentText: "text-blue-500",
    optionsBtnIcon: "text-blue-500"
  },
  forest: {
    name: "フォレスト",
    icon: TreePine,
    appBg: "bg-[#0b1b15] text-emerald-50 selection:bg-emerald-500/30",
    headerBg: "border-emerald-900/50 bg-[#0f2920]/80",
    headerText: "text-emerald-50",
    headerMuted: "text-emerald-400",
    headerIconBg: "from-emerald-600 to-teal-500 shadow-emerald-900/30 text-white",
    headerButton: "text-emerald-500 hover:bg-[#113125] hover:text-rose-400",
    settingsBtnDefault: "bg-[#0f2920]/50 text-emerald-500 border-transparent hover:bg-[#113125]",
    settingsBtnActive: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    sysMessage: "bg-[#113125]/60 text-emerald-400/80 border-emerald-900/50",
    messageMineBg: "bg-emerald-700 text-white shadow-emerald-900/20 hover:shadow-emerald-900/40 border-transparent",
    messageTheirsBg: "bg-[#0f2920] text-emerald-50 shadow-black/20 border-emerald-900/60 hover:bg-[#113125]",
    messageAvatarDefault: "bg-[#113125] text-emerald-500",
    messageSenderName: "text-emerald-600",
    editTextarea: "bg-black/20 border-emerald-500/50 text-emerald-50 focus:ring-emerald-500/30",
    editBtnCancel: "hover:bg-emerald-900/50 text-white",
    editBtnSave: "bg-emerald-100 text-emerald-800",
    backTranslateBtn: "text-emerald-300 hover:text-emerald-200 bg-emerald-900/30 hover:bg-emerald-900/50",
    timestampMine: "text-emerald-200",
    timestampTheirs: "text-emerald-600/80",
    inputWrapperBg: "border-emerald-900/40 bg-[#0f2920]/60",
    inputArea: "border-emerald-900/50 bg-[#0b1b15] text-emerald-50 placeholder-emerald-700 focus:border-emerald-500 focus:bg-[#0b1b15] focus:ring-emerald-500/20",
    sendBtn: "bg-emerald-600 text-white shadow-emerald-900/30 hover:bg-emerald-500 hover:shadow-emerald-900/40 ring-emerald-500/30",
    modalOverlay: "bg-black/70",
    modalBg: "bg-[#0b1b15] border-emerald-900/50",
    modalSectionBg: "border-emerald-900/30 bg-[#07130e]",
    modalLabel: "text-emerald-100",
    modalSubLabel: "text-emerald-500",
    toggleBg: "bg-[#113125] peer-checked:bg-emerald-600",
    langBtnDefault: "bg-[#0f2920]/80 border-transparent text-emerald-400 hover:bg-[#113125] hover:text-emerald-200",
    langBtnActive: "bg-emerald-900/40 border-emerald-600 text-emerald-300 shadow-[inset_0_0_10px_rgba(16,185,129,0.15)]",
    modalConfirmBtn: "bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-900/20",
    accentText: "text-emerald-400",
    optionsBtnIcon: "text-emerald-400"
  },
  cyber: {
    name: "サイバー",
    icon: Zap,
    appBg: "bg-[#0a0515] text-pink-50 selection:bg-fuchsia-500/30 tracking-wide font-mono",
    headerBg: "border-fuchsia-900/50 bg-[#150a25]/80",
    headerText: "text-pink-50 font-bold",
    headerMuted: "text-cyan-400",
    headerIconBg: "from-fuchsia-600 to-cyan-500 shadow-[0_0_15px_rgba(192,38,211,0.5)] text-white",
    headerButton: "text-fuchsia-400/70 hover:bg-[#1f0a35] hover:text-cyan-300",
    settingsBtnDefault: "bg-[#1f0a35]/50 text-fuchsia-400/80 border-transparent hover:bg-[#2a0e4a]",
    settingsBtnActive: "bg-cyan-900/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
    sysMessage: "bg-[#1f0a35]/60 text-fuchsia-300/80 border-fuchsia-800/50",
    messageMineBg: "bg-fuchsia-800 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)] hover:shadow-[0_0_20px_rgba(192,38,211,0.6)] border-fuchsia-500/50",
    messageTheirsBg: "bg-[#150a25] text-cyan-50 shadow-[0_0_10px_rgba(6,182,212,0.1)] border-cyan-900/60 hover:bg-[#1d0e30]",
    messageAvatarDefault: "bg-[#1f0a35] text-cyan-500 border border-cyan-900",
    messageSenderName: "text-fuchsia-500",
    editTextarea: "bg-black/40 border-cyan-500/50 text-cyan-50 focus:ring-cyan-500/30",
    editBtnCancel: "hover:bg-fuchsia-900/50 text-white",
    editBtnSave: "bg-cyan-400 text-black font-extrabold",
    backTranslateBtn: "text-cyan-300 hover:text-cyan-100 bg-cyan-900/30 hover:bg-cyan-800/40 border border-cyan-900/50",
    timestampMine: "text-fuchsia-200",
    timestampTheirs: "text-cyan-600",
    inputWrapperBg: "border-fuchsia-900/40 bg-[#150a25]/60",
    inputArea: "border-fuchsia-900/50 bg-[#0a0515] text-pink-50 placeholder-fuchsia-800 focus:border-cyan-500 focus:bg-[#0a0515] focus:ring-cyan-500/20",
    sendBtn: "bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.7)] ring-cyan-500/30",
    modalOverlay: "bg-black/80 backdrop-blur-md",
    modalBg: "bg-[#150a25] border-cyan-500/30 shadow-[0_0_30px_rgba(192,38,211,0.2)]",
    modalSectionBg: "border-fuchsia-900/40 bg-[#0a0515]/80",
    modalLabel: "text-fuchsia-200",
    modalSubLabel: "text-fuchsia-500/80 text-xs",
    toggleBg: "bg-[#1f0a35] peer-checked:bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]",
    langBtnDefault: "bg-[#150a25] border-fuchsia-900/30 text-fuchsia-400 hover:bg-[#1f0a35] hover:text-cyan-300",
    langBtnActive: "bg-cyan-900/30 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]",
    modalConfirmBtn: "bg-fuchsia-700 hover:bg-fuchsia-600 text-white shadow-[0_0_20px_rgba(192,38,211,0.5)] font-bold tracking-widest",
    accentText: "text-cyan-400",
    optionsBtnIcon: "text-cyan-400 animate-pulse"
  }
};

type ThemeKey = keyof typeof THEMES;

export function ChatInterface({ currentUser, onLeave }: { currentUser: User; onLeave: () => void }) {
  const { messages, sendMessage, editMessage } = useChat();
  const [newMessage, setNewMessage] = useState("");
  
  // 編集用の状態管理
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  
  // 統合オプション機能用の状態管理
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>("dark");
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  
  const [isNumberConversionEnabled, setIsNumberConversionEnabled] = useState(false);
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(2);
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [backTranslations, setBackTranslations] = useState<Record<string, string>>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 現在のテーマ設定を取得
  const t = THEMES[currentTheme];

  // メッセージ追加時に自動で下までスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = newMessage.trim();
    if (!textToSend) return;

    let processedTranslated = null;

    if (isTranslationEnabled || isNumberConversionEnabled) {
      let currentText = textToSend;

      // 1. Language translation
      if (isTranslationEnabled) {
        setIsTranslating(true);
        try {
          currentText = await translateText(currentText, `ja|${targetLanguage}`);
        } catch (err) {
          console.error("Translation failed", err);
        } finally {
          setIsTranslating(false);
        }
      }

      // 2. Number Conversion
      if (isNumberConversionEnabled) {
        let regex = /\d+/g;
        if (fromBase === 2) regex = /[01]+/g;
        if (fromBase === 8) regex = /[0-7]+/g;
        if (fromBase === 16) regex = /[0-9A-Fa-f]+/g;

        currentText = currentText.replace(regex, (match) => {
          return parseInt(match, fromBase).toString(toBase).toUpperCase();
        });
      }

      processedTranslated = currentText;
    }

    await sendMessage(
      textToSend, 
      currentUser.uid, 
      currentUser.displayName || "User", 
      currentUser.photoURL,
      textToSend,
      processedTranslated,
      isTranslationEnabled,
      targetLanguage,
      isNumberConversionEnabled,
      toBase
    );
    setNewMessage("");
  };

  const handleFullDecode = async (
    msgId: string, 
    textToDecode: string, 
    isTransEnabled: boolean, 
    lang: string, 
    isNumConvEnabled: boolean, 
    base?: number
  ) => {
    setTranslatingId(msgId);
    try {
      let currentText = textToDecode;

      // 1. Revert Numbers
      if (isNumConvEnabled && base) {
        let regex = /\d+/g;
        if (base === 2) regex = /[01]+/g;
        if (base === 8) regex = /[0-7]+/g;
        if (base === 16) regex = /[0-9A-F]+/g;

        currentText = currentText.replace(regex, (match) => {
          const revert = parseInt(match, base).toString(10);
          return isNaN(Number(revert)) ? match : revert; 
        });
      }

      // 2. Revert Language Translation
      if (isTransEnabled) {
        currentText = await translateText(currentText, `${lang}|ja`);
      }

      setBackTranslations(prev => ({ ...prev, [msgId]: currentText }));
    } catch (err) {
      console.error(err);
    } finally {
      setTranslatingId(null);
    }
  };

  const startEditing = (msg: Message) => {
    setEditingId(msg.id);
    setEditText(msg.text);
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) {
      setEditingId(null);
      return;
    }
    await editMessage(id, editText.trim());
    setEditingId(null);
  };

  return (
    <div className={`flex h-[100dvh] flex-col transition-colors duration-500 font-sans ${t.appBg}`}>
      {/* ヘッダーエリア */}
      <header className={`flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6 backdrop-blur-md sticky top-0 z-10 transition-colors duration-500 ${t.headerBg}`}>
        <div className="flex items-center gap-3">
          {currentUser.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentUser.photoURL} alt="Profile" className={`h-10 w-10 rounded-full border object-cover shadow-lg ${t.headerBg}`} />
          ) : (
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr font-bold shadow-lg ${t.headerIconBg}`}>
              {(currentUser.displayName || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <span className={`block font-semibold leading-tight ${t.headerText}`}>{currentUser.displayName || "User"}</span>
            <span className={`block text-xs ${t.headerMuted}`}>Online</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsOptionModalOpen(true)}
            className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all border ${
              isOptionModalOpen || isTranslationEnabled
                ? t.settingsBtnActive
                : t.settingsBtnDefault
            }`}
          >
            <Settings className={`h-4 w-4 ${isTranslationEnabled ? t.optionsBtnIcon : ""}`} />
            <span className="hidden sm:inline">オプション</span>
          </button>
          
          <button
            onClick={onLeave}
            className={`group flex items-center gap-1 sm:gap-2 rounded-lg p-2 text-xs sm:text-sm font-medium transition-colors ${t.headerButton}`}
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* メッセージ一覧エリア */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 scroll-smooth scrollbar-thin scrollbar-thumb-zinc-700/50 scrollbar-track-transparent">
        {messages.map((msg) => {
          const isMine = msg.uid === currentUser.uid;
          const isSystem = msg.sender === "System";
          const isEditingThis = editingId === msg.id;

          // システムメッセージのデザイン
          if (isSystem) {
             return (
               <div key={msg.id} className="flex justify-center my-4">
                 <span className={`text-xs px-4 py-1.5 rounded-full border backdrop-blur-sm ${t.sysMessage}`}>
                   {msg.text}
                 </span>
               </div>
             );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col group/message animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMine ? "items-end" : "items-start"}`}
            >
              {/* アイコンと名前（相手の場合） */}
              {!isMine && (
                <div className="mb-1.5 ml-1 flex items-end gap-2">
                  {msg.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={msg.photoURL} alt={msg.sender} className={`h-6 w-6 rounded-full object-cover border ${t.headerBg}`} />
                  ) : (
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${t.messageAvatarDefault}`}>
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`text-xs font-semibold tracking-wide ${t.messageSenderName}`}>
                    {msg.sender}
                  </span>
                </div>
              )}

              <div className={`relative max-w-[85%] sm:max-w-[70%] flex items-center gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* 編集ボタン (Hoverで表示) */}
                {isMine && !isEditingThis && (
                  <button
                    onClick={() => startEditing(msg)}
                    className="p-2 rounded-full opacity-0 transition-all hover:bg-black/10 group-hover/message:opacity-100 flex-shrink-0 opacity-50"
                    title="Edit message"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}

                {/* 吹き出し本体 */}
                <div
                  className={`relative rounded-2xl px-5 py-3.5 shadow-md transition-all border ${
                    isMine
                      ? `rounded-tr-sm ${t.messageMineBg}`
                      : `rounded-tl-sm ${t.messageTheirsBg}`
                  }`}
                >
                  {isEditingThis ? (
                    <div className="flex flex-col gap-3 min-w-[200px] sm:min-w-[300px]">
                      <textarea
                        className={`w-full border rounded-lg px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 resize-none min-h-[60px] ${t.editTextarea}`}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            saveEdit(msg.id);
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end shrink-0">
                        <button onClick={() => setEditingId(null)} className={`px-3 py-1 text-xs rounded-md transition-colors ${t.editBtnCancel}`}>
                          キャンセル
                        </button>
                        <button onClick={() => saveEdit(msg.id)} className={`px-3 py-1 text-xs rounded-md font-bold transition-all hover:scale-105 active:scale-95 shadow ${t.editBtnSave}`}>
                           保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={`leading-relaxed break-words whitespace-pre-wrap text-sm md:text-base ${isMine ? "" : ""}`}>
                        {isMine ? msg.originalText : ((msg.isTranslationEnabled || msg.isNumberConversionEnabled) && msg.translatedText ? msg.translatedText : msg.originalText)}
                      </p>
                      
                      {/* 受信者側の再翻訳UI */}
                      {!isMine && (msg.isTranslationEnabled || msg.isNumberConversionEnabled) && msg.translatedText && (
                        <div className="mt-3 border-t border-black/10 pt-2 text-left">
                          {backTranslations[msg.id] ? (
                            <div className={`rounded-lg p-2.5 text-sm italic shadow-inner ${t.modalSectionBg}`}>
                              <span className={`text-xs block mb-1 not-italic font-bold ${t.accentText}`}>✨ 解読結果 ✨</span>
                              <span className="opacity-90">{backTranslations[msg.id]}</span>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleFullDecode(
                                msg.id, 
                                msg.translatedText!, 
                                msg.isTranslationEnabled, 
                                msg.translationLanguage || "en", 
                                msg.isNumberConversionEnabled, 
                                msg.numberBase
                              )}
                              disabled={translatingId === msg.id}
                              className={`flex items-center gap-1.5 text-xs transition-colors px-2.5 py-1.5 rounded-md ${t.backTranslateBtn}`}
                            >
                              {translatingId === msg.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Globe className="h-3 w-3" />
                              )}
                              元のメッセージに復号する🔍
                            </button>
                          )}
                        </div>
                      )}

                      {/* タイムスタンプ類 */}
                      <div className={`mt-2 flex items-center gap-1.5 text-[10px] md:text-xs font-medium opacity-80 ${isMine ? `justify-end ${t.timestampMine}` : t.timestampTheirs}`}>
                        {msg.isEdited && <span className="mr-1 italic tracking-wide">(edited)</span>}
                        <span>
                          {msg.timestamp ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "送信中..."}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* 入力フォームエリア */}
      <div className={`shrink-0 border-t p-3 sm:p-5 backdrop-blur-xl transition-colors duration-500 ${t.inputWrapperBg}`}>
        <form
          onSubmit={handleSend}
          className="mx-auto flex w-full max-w-4xl items-end gap-2 sm:gap-4 relative"
        >
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              // Shift+Enterで改行、Enterで送信
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Message..."
            rows={1}
            className={`flex-1 max-h-32 min-h-[52px] resize-none rounded-2xl border px-5 py-3.5 text-[15px] sm:text-base shadow-inner transition-all focus:outline-none focus:ring-4 scrollbar-thin ${t.inputArea}`}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isTranslating}
            className={`group flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full outline-none transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed focus-visible:ring-4 ${t.sendBtn}`}
          >
            {isTranslating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5 ml-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            )}
          </button>
        </form>
      </div>

      {/* 総合オプションモーダル */}
      {isOptionModalOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 ${t.modalOverlay}`}>
          <div className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl animate-in zoom-in-95 duration-200 ${t.modalBg}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${t.headerText}`}>
                <Settings className={`h-5 w-5 ${t.accentText}`} />
                総合オプション
              </h3>
              <button onClick={() => setIsOptionModalOpen(false)} className={`transition-colors ${t.headerButton}`}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              
              {/* セクション1: テーマ変更 */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${t.modalSubLabel}`}>🎨 見た目のテーマ</h4>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(THEMES) as ThemeKey[]).map(themeKey => {
                    const ThemeIcon = THEMES[themeKey].icon;
                    return (
                      <button
                        key={themeKey}
                        onClick={() => setCurrentTheme(themeKey)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                          currentTheme === themeKey
                            ? t.langBtnActive
                            : t.langBtnDefault
                        }`}
                      >
                        <ThemeIcon className={`h-5 w-5 ${currentTheme === themeKey ? t.accentText : ""}`} />
                        <span className="text-sm font-semibold">{THEMES[themeKey].name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* セクション2: すれ違い機能 */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${t.modalSubLabel}`}>
                 <Globe className="h-3 w-3" /> すれ違い翻訳機能
                </h4>
                
                <div className={`flex items-center justify-between p-3 rounded-lg border mb-3 ${t.modalSectionBg}`}>
                  <span className={`text-sm font-medium ${t.modalLabel}`}>機能を有効にする</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isTranslationEnabled} onChange={(e) => setIsTranslationEnabled(e.target.checked)} />
                    <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${t.toggleBg}`}></div>
                  </label>
                </div>

                <div className={`space-y-2 transition-all duration-300 ${isTranslationEnabled ? "opacity-100 h-auto" : "opacity-50 pointer-events-none grayscale"}`}>
                  <label className={`block text-xs font-medium ${t.modalSubLabel}`}>翻訳先の言語（すれ違い先）</label>
                  <div className="grid grid-cols-2 gap-2 max-h-[30vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-500/50">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => setTargetLanguage(lang.code)}
                        className={`p-2 rounded-lg text-sm transition-all border ${
                          targetLanguage === lang.code 
                            ? t.langBtnActive
                            : t.langBtnDefault
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* セクション3: 数字カオス変換 */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${t.modalSubLabel}`}>
                 <Hash className="h-3 w-3" /> 数字カオス変換機能
                </h4>
                
                <div className={`flex items-center justify-between p-3 rounded-lg border mb-3 ${t.modalSectionBg}`}>
                  <span className={`text-sm font-medium ${t.modalLabel}`}>機能を有効にする</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isNumberConversionEnabled} onChange={(e) => setIsNumberConversionEnabled(e.target.checked)} />
                    <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${t.toggleBg}`}></div>
                  </label>
                </div>

                <div className={`space-y-4 transition-all duration-300 ${isNumberConversionEnabled ? "opacity-100 h-auto" : "opacity-50 pointer-events-none grayscale"}`}>
                  
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${t.modalSubLabel}`}>抽出する進数（From）</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { base: 2, label: "2進数" },
                        { base: 8, label: "8進数" },
                        { base: 10, label: "10進数" },
                        { base: 16, label: "16進数" }
                      ].map(opt => (
                        <button
                          key={`from-${opt.base}`}
                          onClick={() => setFromBase(opt.base)}
                          className={`p-2 rounded-lg text-xs md:text-sm transition-all border whitespace-nowrap ${
                            fromBase === opt.base 
                              ? t.langBtnActive
                              : t.langBtnDefault
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${t.modalSubLabel}`}>変換先の進数（To）</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { base: 2, label: "2進数" },
                        { base: 8, label: "8進数" },
                        { base: 10, label: "10進数" },
                        { base: 16, label: "16進数" }
                      ].map(opt => (
                        <button
                          key={`to-${opt.base}`}
                          onClick={() => setToBase(opt.base)}
                          className={`p-2 rounded-lg text-xs md:text-sm transition-all border whitespace-nowrap ${
                            toBase === opt.base 
                              ? t.langBtnActive
                              : t.langBtnDefault
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              <button 
                onClick={() => setIsOptionModalOpen(false)}
                className={`w-full mt-2 py-2.5 rounded-lg transition-all active:scale-95 ${t.modalConfirmBtn}`}
              >
                完了して閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
