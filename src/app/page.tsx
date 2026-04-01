"use client";

import { useState, useEffect } from "react";
import { NameInput } from "@/components/NameInput";
import { ChatInterface } from "@/components/ChatInterface";

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 初回レンダリング後にlocalStorageから名前を復元する
  useEffect(() => {
    const saved = localStorage.getItem("chat_username");
    if (saved) {
      setUserName(saved);
    }
    setIsMounted(true);
  }, []);

  // ハイドレーションエラーを防止するため、マウントが終わるまでは何も表示しない
  if (!isMounted) return <div className="min-h-screen bg-zinc-950"></div>;

  const handleJoin = (name: string) => {
    localStorage.setItem("chat_username", name);
    setUserName(name);
  };

  const handleLeave = () => {
    localStorage.removeItem("chat_username");
    setUserName(null);
  };

  if (!userName) {
    return <NameInput onJoin={handleJoin} />;
  }

  // チャット画面を表示
  return <ChatInterface currentUser={userName} onLeave={handleLeave} />;
}

