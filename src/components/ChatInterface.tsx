"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Edit2, Check, LogOut, Globe, Loader2, Settings } from "lucide-react";
import { useChat, Message } from "@/lib/useChat";
import type { User } from "firebase/auth";
import { translateText } from "@/app/actions/translate";
import { THEMES, ThemeKey } from "@/lib/constants";
import { OptionsModal } from "./OptionsModal";

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

  // 時空カオス（遅延受信）機能
  const [isDelayEnabled, setIsDelayEnabled] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [now, setNow] = useState(() => new Date());

  // 1秒ごとに現在時刻を更新（遅延メッセージの解禁チェック用）
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
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
      toBase,
      isDelayEnabled ? (delayMinutes === -1 ? Math.floor(Math.random() * 180) + 1 : delayMinutes) : 0
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
        {(() => {
          // 送信者のnfilteredMessages：全メッセージをsentAt順（Firestoreの順）
          // 受信者のnfilteredMessages：revealAtを過ぎまで非表示、表示タイミングはrevealAtベースでソート
          const displayMessages = messages
            .filter(msg => {
              const isMine = msg.uid === currentUser.uid;
              if (isMine) return true; // 自分のメッセージは常に表示
              // 相手のメッセージ：revealAtが現在時刻を過ぎたものだけ表示
              return msg.revealAt ? msg.revealAt <= now : true;
            })
            .map(msg => ({
              ...msg,
              // 自分のメッセージ：sentAtで並べる、相手のメッセージ：revealAtで並べる
              sortKey: msg.uid === currentUser.uid
                ? (msg.timestamp?.getTime() ?? 0)
                : (msg.revealAt?.getTime() ?? msg.timestamp?.getTime() ?? 0)
            }))
            .sort((a, b) => a.sortKey - b.sortKey);

          return displayMessages.map((msg) => {
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
        });
        })()}
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

      {/* 総合オプションモーダル（別ファイルへ分離） */}
      <OptionsModal 
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        isTranslationEnabled={isTranslationEnabled}
        setIsTranslationEnabled={setIsTranslationEnabled}
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        isNumberConversionEnabled={isNumberConversionEnabled}
        setIsNumberConversionEnabled={setIsNumberConversionEnabled}
        fromBase={fromBase}
        setFromBase={setFromBase}
        toBase={toBase}
        setToBase={setToBase}
        isDelayEnabled={isDelayEnabled}
        setIsDelayEnabled={setIsDelayEnabled}
        delayMinutes={delayMinutes}
        setDelayMinutes={setDelayMinutes}
      />
    </div>
  );
}
