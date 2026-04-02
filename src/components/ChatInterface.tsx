"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Edit2, Check, X, LogOut, Globe, Languages, Loader2 } from "lucide-react";
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

export function ChatInterface({ currentUser, onLeave }: { currentUser: User; onLeave: () => void }) {
  const { messages, sendMessage, editMessage } = useChat();
  const [newMessage, setNewMessage] = useState("");
  
  // 編集用の状態管理
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  
  // 翻訳機能用の状態管理
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [backTranslations, setBackTranslations] = useState<Record<string, string>>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージ追加時に自動で下までスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = newMessage.trim();
    if (!textToSend) return;

    let translated = null;
    if (isTranslationEnabled) {
      setIsTranslating(true);
      try {
        translated = await translateText(textToSend, `ja|${targetLanguage}`);
      } catch (err) {
        console.error("Translation failed", err);
      } finally {
        setIsTranslating(false);
      }
    }

    await sendMessage(
      textToSend, 
      currentUser.uid, 
      currentUser.displayName || "User", 
      currentUser.photoURL,
      textToSend,
      translated,
      isTranslationEnabled,
      targetLanguage
    );
    setNewMessage("");
  };

  const handleBackTranslate = async (msgId: string, textToTranslate: string, lang: string) => {
    setTranslatingId(msgId);
    try {
      const result = await translateText(textToTranslate, `${lang}|ja`);
      setBackTranslations(prev => ({ ...prev, [msgId]: result }));
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
    <div className="flex h-[100dvh] flex-col bg-zinc-950 font-sans text-white selection:bg-indigo-500/30">
      {/* ヘッダーエリア */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 sm:px-6 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {currentUser.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentUser.photoURL} alt="Profile" className="h-10 w-10 rounded-full border border-zinc-700 object-cover shadow-lg" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 font-bold text-white shadow-lg shadow-indigo-600/20">
              {(currentUser.displayName || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <span className="block font-semibold text-zinc-100 leading-tight">{currentUser.displayName || "User"}</span>
            <span className="block text-xs text-indigo-400">Online</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsOptionModalOpen(true)}
            className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              isTranslationEnabled 
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                : "bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800"
            }`}
          >
            <Globe className={`h-4 w-4 ${isTranslationEnabled ? "text-indigo-400 animate-pulse" : ""}`} />
            <span className="hidden sm:inline">すれ違い設定</span>
          </button>
          
          <button
            onClick={onLeave}
            className="group flex items-center gap-1 sm:gap-2 rounded-lg p-2 text-xs sm:text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-rose-400"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* メッセージ一覧エリア */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 scroll-smooth scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {messages.map((msg) => {
          const isMine = msg.uid === currentUser.uid;
          const isSystem = msg.sender === "System";
          const isEditingThis = editingId === msg.id;

          // システムメッセージのデザイン
          if (isSystem) {
             return (
               <div key={msg.id} className="flex justify-center my-4">
                 <span className="bg-zinc-800/60 text-zinc-400 text-xs px-4 py-1.5 rounded-full border border-zinc-700/50 backdrop-blur-sm">
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
                    <img src={msg.photoURL} alt={msg.sender} className="h-6 w-6 rounded-full object-cover border border-zinc-800" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold tracking-wide text-zinc-500">
                    {msg.sender}
                  </span>
                </div>
              )}

              <div className={`relative max-w-[85%] sm:max-w-[70%] flex items-center gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* 編集ボタン (Hoverで表示) */}
                {isMine && !isEditingThis && (
                  <button
                    onClick={() => startEditing(msg)}
                    className="p-2 rounded-full text-zinc-500 opacity-0 transition-all hover:bg-zinc-800 hover:text-indigo-400 group-hover/message:opacity-100 flex-shrink-0"
                    title="Edit message"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}

                {/* 吹き出し本体 */}
                <div
                  className={`relative rounded-2xl px-5 py-3.5 shadow-md transition-all ${
                    isMine
                      ? "rounded-tr-sm bg-indigo-600 text-white shadow-indigo-900/10 hover:shadow-indigo-900/30"
                      : "rounded-tl-sm bg-zinc-800/90 text-zinc-100 shadow-zinc-900/50 border border-zinc-700/50 hover:bg-zinc-800"
                  }`}
                >
                  {isEditingThis ? (
                    <div className="flex flex-col gap-3 min-w-[200px] sm:min-w-[300px]">
                      <textarea
                        className="w-full bg-black/20 border border-indigo-400/50 rounded-lg px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-white/50 resize-none min-h-[60px]"
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
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs hover:bg-white/10 rounded-md transition-colors">
                          キャンセル
                        </button>
                        <button onClick={() => saveEdit(msg.id)} className="px-3 py-1 text-xs bg-white text-indigo-600 rounded-md font-bold transition-all hover:scale-105 active:scale-95 shadow">
                           保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="leading-relaxed break-words whitespace-pre-wrap text-sm md:text-base">
                        {isMine ? msg.originalText : (msg.isTranslationEnabled && msg.translatedText ? msg.translatedText : msg.originalText)}
                      </p>
                      
                      {/* 受信者側の再翻訳UI */}
                      {!isMine && msg.isTranslationEnabled && msg.translatedText && (
                        <div className="mt-3 border-t border-zinc-700/50 pt-2">
                          {backTranslations[msg.id] ? (
                            <div className="bg-zinc-900/50 rounded-lg p-2.5 text-sm text-amber-200/90 italic shadow-inner">
                              <span className="text-xs text-amber-500/70 block mb-1 not-italic font-bold">✨ 再翻訳結果 ✨</span>
                              {backTranslations[msg.id]}
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleBackTranslate(msg.id, msg.translatedText!, msg.translationLanguage || "en")}
                              disabled={translatingId === msg.id}
                              className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-md"
                            >
                              {translatingId === msg.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Globe className="h-3 w-3" />
                              )}
                              日本語に翻訳🔍
                            </button>
                          )}
                        </div>
                      )}

                      {/* タイムスタンプ類 */}
                      <div className={`mt-2 flex items-center gap-1.5 text-[10px] md:text-xs font-medium opacity-60 ${isMine ? "justify-end text-indigo-100" : "text-zinc-400"}`}>
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
      <div className="shrink-0 border-t border-zinc-800/60 bg-zinc-900/60 p-3 sm:p-5 backdrop-blur-xl">
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
            className="flex-1 max-h-32 min-h-[52px] resize-none rounded-2xl border border-zinc-700 bg-zinc-900/80 px-5 py-3.5 text-[15px] sm:text-base text-zinc-100 placeholder-zinc-500 shadow-inner transition-all focus:border-indigo-500 focus:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 scrollbar-thin"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isTranslating}
            className="group flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-indigo-600 outline-none text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed focus-visible:ring-4 ring-indigo-500/30"
          >
            {isTranslating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5 ml-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            )}
          </button>
        </form>
      </div>

      {/* 言語選択モーダル */}
      {isOptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700/50 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-400" />
                すれ違いオプション
              </h3>
              <button onClick={() => setIsOptionModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-950/50">
                <span className="text-sm font-medium text-zinc-200">機能を有効にする</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isTranslationEnabled} onChange={(e) => setIsTranslationEnabled(e.target.checked)} />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>

              <div className={`space-y-2 transition-all duration-300 ${isTranslationEnabled ? "opacity-100 h-auto" : "opacity-50 pointer-events-none grayscale"}`}>
                <label className="block text-sm font-medium text-zinc-400">翻訳先の言語（すれ違い先）</label>
                <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setTargetLanguage(lang.code)}
                      className={`p-2.5 rounded-lg text-sm transition-all border ${
                        targetLanguage === lang.code 
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold shadow-inner" 
                          : "bg-zinc-800/80 border-transparent text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setIsOptionModalOpen(false)}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
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
