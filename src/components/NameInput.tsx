"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function NameInput({ onJoin }: { onJoin: (name: string) => void }) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm rounded-[24px] bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl border border-zinc-800/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome</h1>
          <p className="text-zinc-400 text-sm">Enter your name to join the chat room</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your nickname..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-5 py-3.5 text-white placeholder-zinc-500 transition-all focus:border-indigo-500 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              autoFocus
              maxLength={20}
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Join Chat
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
