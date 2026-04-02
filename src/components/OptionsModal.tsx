import { Settings, X, Globe, Hash, Clock } from "lucide-react";
import { THEMES, LANGUAGES, ThemeKey } from "@/lib/constants";

const DELAY_OPTIONS = [
  { value: 0, label: "なし" },
  { value: 1, label: "1分" },
  { value: 5, label: "5分" },
  { value: 10, label: "10分" },
  { value: 15, label: "15分" },
  { value: 30, label: "30分" },
  { value: 45, label: "45分" },
  { value: 60, label: "1時間" },
  { value: 120, label: "2時間" },
  { value: 180, label: "3時間" },
  { value: -1, label: "🎲 ランダム" },
];

type OptionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // Theme
  currentTheme: ThemeKey;
  setCurrentTheme: (theme: ThemeKey) => void;
  // Translation
  isTranslationEnabled: boolean;
  setIsTranslationEnabled: (enabled: boolean) => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  // Number Conversion
  isNumberConversionEnabled: boolean;
  setIsNumberConversionEnabled: (enabled: boolean) => void;
  fromBase: number;
  setFromBase: (base: number) => void;
  toBase: number;
  setToBase: (base: number) => void;
  // Delay
  isDelayEnabled: boolean;
  setIsDelayEnabled: (enabled: boolean) => void;
  delayMinutes: number;
  setDelayMinutes: (minutes: number) => void;
};

export function OptionsModal({
  isOpen,
  onClose,
  currentTheme,
  setCurrentTheme,
  isTranslationEnabled,
  setIsTranslationEnabled,
  targetLanguage,
  setTargetLanguage,
  isNumberConversionEnabled,
  setIsNumberConversionEnabled,
  fromBase,
  setFromBase,
  toBase,
  setToBase,
  isDelayEnabled,
  setIsDelayEnabled,
  delayMinutes,
  setDelayMinutes,
}: OptionsModalProps) {
  if (!isOpen) return null;

  const t = THEMES[currentTheme];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 ${t.modalOverlay}`}>
      <div className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl animate-in zoom-in-95 duration-200 ${t.modalBg}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${t.headerText}`}>
            <Settings className={`h-5 w-5 ${t.accentText}`} />
            総合オプション
          </h3>
          <button onClick={onClose} className={`transition-colors ${t.headerButton}`}>
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

          {/* セクション4: 時空カオス（遅延受信） */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${t.modalSubLabel}`}>
             <Clock className="h-3 w-3" /> 時空カオス（遅延受信）機能
            </h4>
            
            <div className={`flex items-center justify-between p-3 rounded-lg border mb-3 ${t.modalSectionBg}`}>
              <span className={`text-sm font-medium ${t.modalLabel}`}>機能を有効にする</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isDelayEnabled} onChange={(e) => setIsDelayEnabled(e.target.checked)} />
                <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${t.toggleBg}`}></div>
              </label>
            </div>

            <div className={`transition-all duration-300 ${isDelayEnabled ? "opacity-100" : "opacity-50 pointer-events-none grayscale"}`}>
              <label className={`block text-xs font-medium mb-1.5 ${t.modalSubLabel}`}>遅延時間（相手に届くまで）</label>
              <div className="grid grid-cols-3 gap-2">
                {DELAY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDelayMinutes(opt.value)}
                    className={`p-2 rounded-lg text-xs transition-all border whitespace-nowrap ${
                      delayMinutes === opt.value
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

          <button 
            onClick={onClose}
            className={`w-full mt-2 py-2.5 rounded-lg transition-all active:scale-95 ${t.modalConfirmBtn}`}
          >
            完了して閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
