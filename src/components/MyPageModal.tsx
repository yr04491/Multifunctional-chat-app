import { useState, useEffect } from "react";
import { X, Save, User as UserIcon } from "lucide-react";
import { THEMES, ThemeKey } from "@/lib/constants";
import { PRESET_AVATARS, useUserProfile } from "@/lib/useUserProfile";
import type { User } from "firebase/auth";

type MyPageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeKey;
  currentUser: User;
};

export function MyPageModal({ isOpen, onClose, currentTheme, currentUser }: MyPageModalProps) {
  const { profile, updateProfile } = useUserProfile(currentUser);
  
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // プロフィールが読み込まれたら初期値をセット
  useEffect(() => {
    if (profile) {
      setName(profile.displayName);
      setSelectedAvatar(profile.avatar);
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const t = THEMES[currentTheme];

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await updateProfile(name.trim(), selectedAvatar);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 ${t.modalOverlay}`}>
      <div className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col ${t.modalBg}`}>
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${t.headerText}`}>
            <UserIcon className={`h-5 w-5 ${t.accentText}`} />
            マイページ
          </h3>
          <button onClick={onClose} className={`transition-colors ${t.headerButton}`}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${t.modalSubLabel}`}>
              チャットでの表示名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-transparent transition-all font-semibold ${t.sysMessage ? "border-zinc-700/50" : ""}`}
              style={{ color: t.modalLabel ? undefined : "inherit" }}
              placeholder="あなたの名前"
              maxLength={20}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${t.modalSubLabel}`}>
              アイコンを選択
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AVATARS.map((avatarUrl) => (
                <button
                  key={avatarUrl}
                  onClick={() => setSelectedAvatar(avatarUrl)}
                  className={`relative p-2 rounded-2xl flex items-center justify-center transition-all border-2 overflow-hidden bg-white/5 ${
                    selectedAvatar === avatarUrl 
                      ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105" 
                      : "border-transparent hover:border-gray-500/50"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarUrl} alt="Avatar" className="w-16 h-16 object-contain drop-shadow-md" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-black/10 dark:border-white/10 shrink-0">
            <button 
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${t.modalConfirmBtn}`}
            >
              {isSaving ? "保存中..." : (
                <>
                  <Save className="w-4 h-4" />
                  保存して閉じる
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
