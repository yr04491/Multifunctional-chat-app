"use client";

import { LoginScreen } from "@/components/LoginScreen";
import { ChatInterface } from "@/components/ChatInterface";
import { useAuth } from "@/lib/useAuth";

export default function Home() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  // マウント中または認証状態の確認中はローディング画面を表示
  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950 font-sans text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-indigo-500"></div>
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  // 未ログイン時はログイン画面（Google）を表示
  if (!user) {
    return <LoginScreen onLogin={signInWithGoogle} />;
  }

  // ログイン済みならチャット画面を表示して User オブジェクトを渡す
  return <ChatInterface currentUser={user} onLeave={signOut} />;
}

