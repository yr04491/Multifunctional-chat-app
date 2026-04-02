"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Edit2, Check, X, LogOut } from "lucide-react";
import { useChat, Message } from "@/lib/useChat";
import type { User } from "firebase/auth";

export function ChatInterface({ currentUser, onLeave }: { currentUser: User; onLeave: () => void }) {
  const { messages, sendMessage, editMessage } = useChat();
  const [newMessage, setNewMessage] = useState("");
  
  // 編集用の状態管理
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージ追加時に自動で下までスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage(newMessage.trim(), currentUser.uid, currentUser.displayName || "User", currentUser.photoURL);
    setNewMessage("");
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
        <button
          onClick={onLeave}
          className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 rounded-lg p-2 text-xs sm:text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-rose-400"
        >
          <LogOut className="h-4 w-4 sm:h-4 sm:w-4 transition-transform group-hover:-translate-x-1" />
          <span>Exit</span>
        </button>
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
                      <p className="leading-relaxed break-words whitespace-pre-wrap text-sm md:text-base">{msg.text}</p>
                      
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
            disabled={!newMessage.trim()}
            className="group flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-indigo-600 outline-none text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed focus-visible:ring-4 ring-indigo-500/30"
          >
            <Send className="h-5 w-5 ml-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
