
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Trash2, Camera, User, Heart, Send, MoreHorizontal, 
  ChevronLeft, ChevronRight, Settings2, Copy, MessageCircle, 
  Share2, Target, X, Sparkles, Languages,
  BarChart3, Activity, Eye, Wand2, ChevronDown, Rocket, RefreshCw, EyeOff
} from 'lucide-react';
import { Mode, Platform, ContentModality, AccountType, GenerationParams, CaptionOption } from './types';
import { generateCaptions, applyMagicEnhance } from './services/geminiService';

const LANGUAGES = [
  { code: 'English', label: 'EN' },
  { code: 'Spanish', label: 'ES' },
  { code: 'French', label: 'FR' },
  { code: 'German', label: 'DE' },
  { code: 'Japanese', label: 'JP' },
];

const TRANSLATIONS: Record<string, any> = {
  English: {
    heroTitle: "Captoro",
    ctaUpload: "DROP MEDIA",
    ctaViralize: "GENERATE < 10S",
    platform: "PLATFORM",
    placeholder: "Context or keywords...",
    personalize: "PREFERENCES",
    save: "SAVE CONFIG",
    copy: "COPY TEXT",
    share: "SHARE",
    copied: "COPIED!",
    loading: ["SCANNING...", "ARCHITECTING...", "OPTIMIZING..."],
    yourProfile: "CREATOR ID",
    magicTitle: "VIRAL REALISM",
    applyingMagic: "ENHANCING...",
    magicApplyCta: "VIRALIZE IMAGE",
    whyItWorks: "AI INSIGHT",
    bestTime: "PEAK TIME",
    audience: "TARGET",
    viewOriginal: "HOLD TO SEE ORIGINAL",
    viewEnhanced: "VIEW ENHANCED"
  },
  Spanish: {
    heroTitle: "Captoro",
    ctaUpload: "SUBIR FOTO",
    ctaViralize: "GENERAR < 10S",
    platform: "PLATAFORMA",
    placeholder: "Detalles o palabras clave...",
    personalize: "PREFERENCIAS",
    save: "GUARDAR",
    copy: "COPIAR",
    share: "COMPARTIR",
    copied: "¡COPIADO!",
    loading: ["ESCANEANDO...", "CREANDO...", "OPTIMIZANDO..."],
    yourProfile: "ID DE CREADOR",
    magicTitle: "REALISMO VIRAL",
    applyingMagic: "MEJORANDO...",
    magicApplyCta: "VIRALIZAR IMAGEN",
    whyItWorks: "INSIGHT IA",
    bestTime: "HORA PICO",
    audience: "AUDIENCIA",
    viewOriginal: "MANTÉN PARA VER ORIGINAL",
    viewEnhanced: "VER MEJORADA"
  }
};

export default function App() {
  const [language, setLanguage] = useState<string>(localStorage.getItem('captoro_lang') || 'English');
  const [media, setMedia] = useState<string | null>(null);
  const [originalMedia, setOriginalMedia] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [idea, setIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [options, setOptions] = useState<CaptionOption[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profileName, setProfileName] = useState('CREATOR_X');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [commStyle, setCommStyle] = useState('Authentic, engaging, and modern');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const [params, setParams] = useState<Omit<GenerationParams, 'image' | 'idea' | 'language'>>({
    accountType: AccountType.CREATOR,
    platform: Platform.INSTAGRAM,
    modality: ContentModality.PHOTO,
    modes: [Mode.VIRAL],
    length: 5,
    emojiDensity: 5,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const t = (key: string) => TRANSLATIONS[language]?.[key] || TRANSLATIONS['English'][key];

  useEffect(() => {
    if (isLoading || isMagicLoading) {
      const interval = setInterval(() => {
        const loadingList = t('loading') || [];
        if (loadingList.length > 0) {
          setLoadingMsgIdx(prev => (prev + 1) % loadingList.length);
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isLoading, isMagicLoading, language]);

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const executeGeneration = async (currentMedia: string | null, currentIdea: string) => {
    if (!currentMedia && currentIdea.length < 3) return;
    setIsLoading(true);
    try {
      const results = await generateCaptions({ 
        ...params, 
        language, 
        image: currentMedia || undefined, 
        idea: currentIdea,
        communicationStyle: commStyle
      });
      setOptions(results || []);
      setActiveIdx(0);
    } catch (err) {
      notify("Engine Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => executeGeneration(media, idea);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => {
        const result = r.result as string;
        setMedia(result);
        setOriginalMedia(result);
        executeGeneration(result, idea);
      };
      r.readAsDataURL(file);
    }
  };

  const applyMagic = async (prompt: string) => {
    if (!originalMedia) return;
    setIsMagicLoading(true);
    try {
      const enhanced = await applyMagicEnhance(originalMedia, prompt);
      if (enhanced) {
        setMedia(enhanced);
        notify("TRANSFORMED");
      }
    } catch (e) {
      notify("Magic failed");
    } finally {
      setIsMagicLoading(false);
    }
  };

  const copyToClipboard = () => {
    const item = options[activeIdx];
    if (!item) return;
    const hashtags = (item.hashtags || []).map(h => `#${h.replace('#','')}`).join(' ');
    const content = `${item.text || ''}\n\n${hashtags}`;
    navigator.clipboard.writeText(content);
    notify(t('copied'));
  };

  const currentOption = options[activeIdx];
  const hasBeenEnhanced = media !== originalMedia;

  return (
    <div className="min-h-screen bg-[#070707] text-zinc-100 selection:bg-blue-500/30 flex flex-col">
      <style>{`
        .glass { background: rgba(10, 10, 10, 0.8); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .card-glass { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); }
        .insta-preview { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; white-space: pre-wrap; }
        .btn-primary { background: #fff; color: #000; transition: transform 0.1s; }
        .btn-primary:active { transform: scale(0.98); }
        
        .btn-viral {
          background: linear-gradient(90deg, #3b82f6, #a855f7, #3b82f6);
          background-size: 200% auto;
          color: white;
          animation: shine 3s linear infinite, pulse-viral 2s infinite;
          border: none;
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
        @keyframes pulse-viral {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }

        .scan-line {
          position: absolute;
          width: 100%;
          height: 4px;
          background: linear-gradient(to bottom, transparent, #3b82f6, transparent);
          box-shadow: 0 0 15px #3b82f6;
          animation: scan 1.5s linear infinite;
          z-index: 40;
        }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      {/* HEADER */}
      <nav className="fixed top-0 inset-x-0 z-50 glass px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">Captoro</h1>
          <span className="bg-blue-600 text-[9px] px-1.5 py-0.5 rounded font-black text-white uppercase tracking-tighter">Pro</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            {LANGUAGES.map(l => (
              <button 
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${language === l.code ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 relative"
          >
            <Settings2 className="w-5 h-5" />
            {profileName === 'CREATOR_X' && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse border-2 border-[#070707]" />
            )}
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto pt-24 pb-4 px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
        
        {/* INPUT COLUMN */}
        <div className="space-y-5">
          {!media ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square rounded-[2rem] border-2 border-dashed border-zinc-800 bg-zinc-900/40 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-500/50 transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-zinc-400">{t('ctaUpload')}</p>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFile} />
            </div>
          ) : (
            <div className="relative group rounded-[2rem] overflow-hidden border border-zinc-800 aspect-square shadow-2xl">
              <img 
                src={(isComparing && originalMedia) ? originalMedia : media} 
                className="w-full h-full object-cover transition-opacity duration-300" 
              />
              
              {isMagicLoading && (
                <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4">
                  <div className="scan-line" />
                  <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-blue-400">{t('applyingMagic')}</span>
                </div>
              )}

              {hasBeenEnhanced && !isMagicLoading && (
                <div className="absolute top-4 right-4 z-40">
                  <button 
                    onMouseDown={() => setIsComparing(true)}
                    onMouseUp={() => setIsComparing(false)}
                    onMouseLeave={() => setIsComparing(false)}
                    onTouchStart={() => setIsComparing(true)}
                    onTouchEnd={() => setIsComparing(false)}
                    className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black/80 transition-all active:scale-95 border border-white/10"
                  >
                    <Eye className="w-3 h-3" />
                    {t('viewOriginal')}
                  </button>
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white/10 rounded-full text-white backdrop-blur-md hover:bg-white/20"><RefreshCw className="w-5 h-5"/></button>
                <button onClick={() => {setMedia(null); setOriginalMedia(null); setOptions([]);}} className="p-3 bg-red-500/10 rounded-full text-white backdrop-blur-md hover:bg-red-500/30"><Trash2 className="w-5 h-5"/></button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{t('platform')}</label>
              <select 
                value={params.platform}
                onChange={(e) => setParams(p => ({ ...p, platform: e.target.value as Platform }))}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 font-bold text-sm"
              >
                {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">OBJECTIVE</label>
              <select 
                value={params.modes[0]}
                onChange={(e) => setParams(p => ({ ...p, modes: [e.target.value as Mode] }))}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 font-bold text-sm"
              >
                {Object.values(Mode).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <textarea 
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 min-h-[70px] font-medium text-sm focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-700"
          />

          <button 
            onClick={handleGenerate}
            disabled={isLoading || (!media && idea.length < 3)}
            className="w-full btn-primary py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-30"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : <Rocket className="w-5 h-5" />}
            {isLoading ? t('loading')[loadingMsgIdx] : t('ctaViralize')}
          </button>
        </div>

        {/* RESULTS COLUMN */}
        <div className="space-y-5">
          {options.length > 0 && currentOption ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5">
              <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl text-black">
                <div className="px-5 py-3 flex items-center justify-between border-b border-zinc-100">
                  <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
                      {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300"><User className="w-4 h-4" /></div>}
                    </div>
                    <div>
                      <span className="block text-xs font-bold leading-none group-hover:text-blue-600 transition-colors">
                        {profileName}
                      </span>
                      <span className="block text-[8px] text-zinc-400 font-bold uppercase tracking-tight mt-0.5">{params.platform}</span>
                    </div>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-zinc-300" />
                </div>

                <div className="aspect-square bg-zinc-50 relative">
                  <img src={(isComparing && originalMedia) ? originalMedia : media || ''} className="w-full h-full object-cover" />
                </div>

                <div className="p-5 space-y-3 insta-preview">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <Heart className="w-6 h-6 hover:fill-red-500 hover:text-red-500 cursor-pointer" />
                      <MessageCircle className="w-6 h-6" />
                      <Send className="w-6 h-6" />
                    </div>
                    <div className="flex gap-1">
                      {options.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all ${activeIdx === i ? 'bg-blue-600 w-4' : 'bg-zinc-200 w-1'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="relative group">
                    {options.length > 1 && (
                      <>
                        <button onClick={() => setActiveIdx(p => Math.max(0, p - 1))} className="absolute -left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={() => setActiveIdx(p => Math.min(options.length - 1, p + 1))} className="absolute -right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-4 h-4" /></button>
                      </>
                    )}
                    <p className="text-[14px] text-zinc-800 leading-snug">
                      <span className="font-bold mr-2">{profileName}</span>
                      {currentOption.text}
                    </p>
                    <div className="flex flex-wrap gap-x-2 mt-2">
                      {(currentOption.hashtags || []).map((h, i) => (
                        <span key={i} className="text-blue-600 font-semibold text-[13px]">#{h.replace('#','')}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={copyToClipboard}
                  className="bg-zinc-800 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all"
                >
                  <Copy className="w-4 h-4" /> {statusMessage === t('copied') ? 'COPIED!' : t('copy')}
                </button>
                <button className="bg-blue-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                  <Share2 className="w-4 h-4" /> {t('share')}
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'IMPACT', val: currentOption.metrics?.visualImpact ?? 0, icon: Eye },
                    { label: 'HOOK', val: currentOption.metrics?.hookStrength ?? 0, icon: Target },
                    { label: 'RETENTION', val: currentOption.metrics?.retentionRate ?? 0, icon: Activity },
                    { label: 'VIRAL', val: currentOption.metrics?.viralScore ?? 0, icon: BarChart3 }
                  ].map((m, i) => (
                    <div key={i} className="card-glass p-3 rounded-xl flex flex-col items-center">
                      <span className="text-[7px] font-bold text-zinc-500 uppercase mb-1">{m.label}</span>
                      <span className="text-lg font-black">{m.val}%</span>
                    </div>
                  ))}
                </div>

                {currentOption.magicEditSuggestions?.[0] && (
                  <div className="card-glass p-4 rounded-3xl flex items-center justify-between gap-6 border-blue-500/30 bg-blue-500/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-400">{t('magicTitle')}</h4>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">{currentOption.magicEditSuggestions[0].description}</p>
                    </div>
                    <button 
                      onClick={() => applyMagic(currentOption.magicEditSuggestions[0].visualPrompt)}
                      disabled={isMagicLoading}
                      className="btn-viral px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest relative z-10 whitespace-nowrap"
                    >
                      {t('magicApplyCta')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 opacity-10">
              <Target className="w-10 h-10" />
              <p className="text-[9px] font-black tracking-widest uppercase">READY FOR SCAN</p>
            </div>
          )}
        </div>
      </main>

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-md card-glass bg-zinc-900 p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight uppercase">{t('personalize')}</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full"><X className="w-5 h-5"/></button>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-5 p-5 rounded-xl bg-white/5 border border-white/5">
                <div 
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl bg-zinc-800 overflow-hidden cursor-pointer relative group flex items-center justify-center"
                >
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-zinc-600" />}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera className="w-4 h-4"/></div>
                </div>
                <div className="flex-1 space-y-1">
                   <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">CREATOR NAME</label>
                   <input 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-lg font-bold focus:ring-0 text-blue-500" 
                    placeholder="Enter Profile Name"
                   />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">VOICE STYLE</label>
                <textarea 
                  value={commStyle}
                  onChange={(e) => setCommStyle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 font-medium text-sm focus:ring-1 focus:ring-blue-500 transition-all min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">ACCOUNT</label>
                  <select 
                    value={params.accountType}
                    onChange={(e) => setParams(p => ({ ...p, accountType: e.target.value as AccountType }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-bold text-xs"
                  >
                    {Object.values(AccountType).map(at => <option key={at} value={at}>{at}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">INTENSITY</label>
                  <input 
                    type="range" min="1" max="10" 
                    value={params.length}
                    onChange={(e) => setParams(p => ({ ...p, length: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                  />
                </div>
              </div>

              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full btn-primary py-4 rounded-xl font-bold text-xs uppercase tracking-widest"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-2.5 bg-white text-black rounded-full font-bold text-[9px] uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          {statusMessage}
        </div>
      )}

      <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={(e) => {
        const f = e.target.files?.[0];
        if(f){ const r = new FileReader(); r.onloadend = () => setAvatar(r.result as string); r.readAsDataURL(f); }
      }} />

      <footer className="py-4 flex flex-col items-center opacity-10">
        <span className="text-[7px] font-bold uppercase tracking-[0.5em]">Captoro Fast • Velocity Enabled</span>
      </footer>
    </div>
  );
}
