
import React, { useState, useRef, useEffect } from 'react';
import { User, Message, AppSettings, AccessibilityState, HistoryItem } from '../types';
import { generateResponse } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { ChatMessage } from './ChatMessage';
import { Preview } from './Preview';
import { Logo } from './Logo';
import { 
  Send, Code, Settings, LogOut, MessageSquare, History, Accessibility,
  Eye, Copy, Download, Sparkles, Type, Moon, Check, Zap, PlusCircle, Activity, Move, MousePointer,
  Maximize, Minimize, RotateCcw, FileText, X, GitCommit, Cloud, CloudLightning
} from 'lucide-react';

// --- SUB-COMPONENTS ---

const SidebarIcon = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
    <div className="group relative flex items-center justify-center w-full">
        <button 
            onClick={onClick}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-blue-500' : 'bg-white text-gray-400 border-gray-200 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-400'}`}
        >
            {icon}
        </button>
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 pointer-events-none whitespace-nowrap z-50 shadow-xl">
            {label}
        </span>
    </div>
);

const ActionButton = ({ icon, label, onClick, active = false }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold border ${active ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
    >
        {icon}
        <span className="hidden xl:inline">{label}</span>
    </button>
);

const ProfileScreen = ({ user }: { user: User }) => (
    <div className="w-full h-full bg-white rounded-[2.5rem] p-10 flex flex-col gap-8 overflow-y-auto animate-fade-in">
        <h2 className="text-3xl font-black text-gray-800">פרופיל משתמש</h2>
        <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-100">
            <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center text-4xl font-bold text-blue-600 border border-blue-100 overflow-hidden">
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    user.name.charAt(0)
                )}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
                <p className="text-gray-500">{user.email}</p>
                <div className="flex items-center gap-2 mt-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold w-fit">
                    <Cloud size={14} />
                    <span>מחובר לאחסון מאובטח</span>
                </div>
            </div>
        </div>
    </div>
);

const SettingsScreen = ({ settings, onUpdate }: { settings: AppSettings, onUpdate: (s: Partial<AppSettings>) => void }) => (
    <div className="w-full h-full bg-white rounded-[2.5rem] p-10 flex flex-col gap-6 overflow-y-auto animate-fade-in">
        <h2 className="text-3xl font-black text-gray-800">הגדרות בוט</h2>
        
        <div className="space-y-6">
            <div className="p-5 border border-gray-100 rounded-2xl">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-purple-500"/>
                    מודל בינה מלאכותית
                </h4>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                     <button 
                        onClick={() => onUpdate({ model: 'gemini-3-pro-preview' })}
                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${settings.model === 'gemini-3-pro-preview' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}
                     >
                        Gemini 3 Pro
                     </button>
                     <button 
                        onClick={() => onUpdate({ model: 'gemini-2.5-flash' })}
                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${settings.model === 'gemini-2.5-flash' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                     >
                        Gemini 2.5 Flash
                     </button>
                </div>
            </div>

            <div className="p-5 border border-gray-100 rounded-2xl">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Code size={18} className="text-blue-500"/>
                    שפת פיתוח מועדפת
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    {['html', 'javascript', 'python', 'react'].map(lang => (
                        <button
                            key={lang}
                            onClick={() => onUpdate({ language: lang as any })}
                            className={`py-3 px-4 rounded-xl border font-bold text-sm text-left capitalize flex justify-between items-center transition-all ${settings.language === lang ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            {lang}
                            {settings.language === lang && <Check size={16} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const AccessibilityScreen = ({ state, onUpdate, onReset }: { state: AccessibilityState, onUpdate: (s: Partial<AccessibilityState>) => void, onReset: () => void }) => {
    const [showDeclaration, setShowDeclaration] = useState(false);

    return (
        <div className="w-full h-full bg-white rounded-[2.5rem] p-10 flex flex-col gap-6 overflow-y-auto animate-fade-in relative">
            <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-black text-gray-800">נגישות</h2>
                 <div className="flex gap-2">
                     <button 
                        onClick={() => setShowDeclaration(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                     >
                        <FileText size={16} />
                        הצהרת נגישות
                     </button>
                     <button 
                        onClick={onReset}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors"
                     >
                        <RotateCcw size={16} />
                        איפוס הגדרות
                     </button>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Font Size */}
                 <div className="p-5 border border-gray-100 rounded-2xl flex flex-col justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-xl"><Type /></div>
                        <div>
                            <h4 className="font-bold">גודל טקסט</h4>
                            <p className="text-sm text-gray-400">הגדל את הגופן במערכת</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => onUpdate({ fontSizeScale: 1 })} className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold ${state.fontSizeScale === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>רגיל</button>
                        <button onClick={() => onUpdate({ fontSizeScale: 1.1 })} className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold ${state.fontSizeScale === 1.1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>גדול</button>
                        <button onClick={() => onUpdate({ fontSizeScale: 1.25 })} className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold ${state.fontSizeScale === 1.25 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>ענק</button>
                    </div>
                 </div>
                 
                 {/* High Contrast */}
                 <div className="p-5 border border-gray-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-xl"><Moon /></div>
                        <div>
                            <h4 className="font-bold">ניגודיות גבוהה</h4>
                            <p className="text-sm text-gray-400">חידוד צבעים לראייה</p>
                        </div>
                    </div>
                     <button 
                        onClick={() => onUpdate({ highContrast: !state.highContrast })}
                        className={`w-12 h-6 rounded-full relative transition-colors ${state.highContrast ? 'bg-blue-600' : 'bg-gray-300'}`}
                     >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${state.highContrast ? 'left-1' : 'right-1'}`}></div>
                     </button>
                 </div>

                 {/* Reduced Motion */}
                 <div className="p-5 border border-gray-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-xl"><Move /></div>
                        <div>
                            <h4 className="font-bold">הפחתת תנועה</h4>
                            <p className="text-sm text-gray-400">ביטול אנימציות</p>
                        </div>
                    </div>
                     <button 
                        onClick={() => onUpdate({ reducedMotion: !state.reducedMotion })}
                        className={`w-12 h-6 rounded-full relative transition-colors ${state.reducedMotion ? 'bg-blue-600' : 'bg-gray-300'}`}
                     >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${state.reducedMotion ? 'left-1' : 'right-1'}`}></div>
                     </button>
                 </div>

                 {/* Dyslexic Font */}
                 <div className="p-5 border border-gray-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-xl"><Activity /></div>
                        <div>
                            <h4 className="font-bold">גופן קריא</h4>
                            <p className="text-sm text-gray-400">סיוע לדיסלקציה</p>
                        </div>
                    </div>
                     <button 
                        onClick={() => onUpdate({ dyslexicFont: !state.dyslexicFont })}
                        className={`w-12 h-6 rounded-full relative transition-colors ${state.dyslexicFont ? 'bg-blue-600' : 'bg-gray-300'}`}
                     >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${state.dyslexicFont ? 'left-1' : 'right-1'}`}></div>
                     </button>
                 </div>

                 {/* Reading Guide */}
                 <div className="p-5 border border-gray-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-xl"><MousePointer /></div>
                        <div>
                            <h4 className="font-bold">סרגל קריאה</h4>
                            <p className="text-sm text-gray-400">קו מנחה לעכבר</p>
                        </div>
                    </div>
                     <button 
                        onClick={() => onUpdate({ readingGuide: !state.readingGuide })}
                        className={`w-12 h-6 rounded-full relative transition-colors ${state.readingGuide ? 'bg-blue-600' : 'bg-gray-300'}`}
                     >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${state.readingGuide ? 'left-1' : 'right-1'}`}></div>
                     </button>
                 </div>
            </div>

            {/* Accessibility Declaration Modal */}
            {showDeclaration && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative border border-gray-100 flex flex-col max-h-[80vh]">
                        <button 
                            onClick={() => setShowDeclaration(false)}
                            className="absolute top-4 left-4 p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6 text-blue-600">
                             <FileText size={28} />
                             <h3 className="text-2xl font-black">הצהרת נגישות</h3>
                        </div>

                        <div className="overflow-y-auto space-y-4 text-sm leading-relaxed text-gray-600 px-1">
                            <p className="font-bold text-gray-800">מחויבות לנגישות</p>
                            <p>אתר אייבן קוד רואה חשיבות עליונה בהנגשת שירותיו לאנשים עם מוגבלויות. אנו פועלים בהתאם לתקן הישראלי ת"י 5568 ברמה AA.</p>
                            
                            <p className="font-bold text-gray-800">התאמות שבוצעו באתר:</p>
                            <ul className="list-disc list-inside space-y-1 marker:text-blue-500">
                                <li>תמיכה בשינוי גודל טקסט</li>
                                <li>אפשרות לניגודיות גבוהה</li>
                                <li>עצירת אנימציות ותנועה</li>
                                <li>גופן מותאם לדיסלקציה</li>
                                <li>סרגל קריאה מנחה</li>
                                <li>ניווט מקלדת מלא</li>
                            </ul>

                            <p className="font-bold text-gray-800">יצירת קשר</p>
                            <p>אם נתקלתם בבעיה או שיש לכם הצעה לשיפור, נשמח לשמוע מכם.</p>
                        </div>

                        <button 
                            onClick={() => setShowDeclaration(false)}
                            className="w-full mt-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                        >
                            סגור
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const HistoryScreen = ({ history, onLoad, onNewChat }: { history: HistoryItem[], onLoad: (item: HistoryItem) => void, onNewChat: () => void }) => (
    <div className="w-full h-full bg-white rounded-[2.5rem] p-10 flex flex-col gap-6 overflow-y-auto animate-fade-in">
        <div className="flex justify-between items-center">
             <h2 className="text-3xl font-black text-gray-800">היסטוריית פרויקטים</h2>
        </div>
        
        <div className="space-y-4">
            {/* Start New Chat Card */}
            <div 
                onClick={onNewChat}
                className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 cursor-pointer hover:-translate-y-1 transition-all flex justify-between items-center group text-white"
            >
                <div>
                    <h3 className="font-bold text-lg">התחל פרויקט חדש</h3>
                    <p className="text-blue-100 text-sm opacity-90">צור פרויקט חדש</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <PlusCircle size={24} />
                </div>
            </div>

            {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-4 py-10">
                    <History size={64} opacity={0.2} />
                    <p>אין עדיין היסטוריה שמורה</p>
                </div>
            ) : (
                history.map((item) => (
                    <div 
                        key={item.id} 
                        onClick={() => onLoad(item)}
                        className="p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-blue-200 cursor-pointer transition-all flex justify-between items-center group"
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                {item.version > 1 && (
                                    <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-100">
                                        <GitCommit size={10} />
                                        v{item.version}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-4 mt-1 text-xs text-gray-400 font-mono">
                                <span>{new Date(item.timestamp).toLocaleDateString('he-IL')}</span>
                                <span>{new Date(item.timestamp).toLocaleTimeString('he-IL')}</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center text-gray-400 group-hover:text-blue-600">
                             <Zap size={18} />
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

// --- MAIN DASHBOARD COMPONENT ---

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type ViewState = 'chat' | 'profile' | 'settings' | 'accessibility' | 'history';
type PreviewMode = 'preview' | 'code';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  // --- STATE ---
  const [activeView, setActiveView] = useState<ViewState>('chat');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingText, setLoadingText] = useState("מעבד בקשה...");
  
  // Real Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>({
    model: 'gemini-3-pro-preview',
    language: 'html'
  });

  // Real Accessibility State
  const defaultAccessibility: AccessibilityState = {
    highContrast: false,
    fontSizeScale: 1,
    reducedMotion: false,
    dyslexicFont: false,
    readingGuide: false
  };

  const [accessibility, setAccessibility] = useState<AccessibilityState>(defaultAccessibility);

  // Data State
  const initialMessage: Message = {
      id: '1',
      role: 'model',
      text: `שלום ${user.name}! אני אייבן קוד.\nבאיזה שפה נכתוב היום? (ברירת מחדל: HTML)`,
      timestamp: Date.now()
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [previewContent, setPreviewContent] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isSavedToCloud, setIsSavedToCloud] = useState(true);
  
  // UI State
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const readingGuideRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---

  // Load User Data from Storage Service on Mount
  useEffect(() => {
    // History
    const savedHistory = StorageService.getUserHistory(user.email);
    setHistory(savedHistory);

    // Settings
    const savedSettings = StorageService.getUserSettings(user.email);
    if (savedSettings) setAppSettings(savedSettings);

    // Accessibility
    const savedAccess = StorageService.getUserAccessibility(user.email);
    if (savedAccess) setAccessibility(savedAccess);

  }, [user.email]);

  // Typing Text Rotation
  useEffect(() => {
    if (!isTyping) return;
    const texts = ["מנתח בקשה...", "מתכנן ארכיטקטורה...", "כותב קוד...", "מבצע אופטימיזציה...", "בודק תקינות..."];
    let i = 0;
    const interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, [isTyping]);

  // Apply Accessibility
  useEffect(() => {
    const root = document.documentElement;
    
    // Contrast & Scale
    root.style.filter = accessibility.highContrast ? 'contrast(1.25) saturate(1.1)' : 'none';
    root.style.fontSize = `${16 * accessibility.fontSizeScale}px`;
    
    // Motion
    if (accessibility.reducedMotion) {
        root.style.scrollBehavior = 'auto';
        document.body.classList.add('reduce-motion');
    } else {
        root.style.scrollBehavior = 'smooth';
        document.body.classList.remove('reduce-motion');
    }

    // Font
    if (accessibility.dyslexicFont) {
        document.body.style.fontFamily = 'Comic Sans MS, "Chalkboard SE", sans-serif';
    } else {
        document.body.style.fontFamily = ''; // Revert to Tailwind default
    }

    // Reading Guide
    const handleMouseMove = (e: MouseEvent) => {
        if (readingGuideRef.current && accessibility.readingGuide) {
            readingGuideRef.current.style.top = `${e.clientY}px`;
        }
    };

    if (accessibility.readingGuide) {
        window.addEventListener('mousemove', handleMouseMove);
    } else {
        window.removeEventListener('mousemove', handleMouseMove);
    }

    // Save Preference Logic
    StorageService.save(user.email, 'accessibility', accessibility);

    return () => window.removeEventListener('mousemove', handleMouseMove);

  }, [accessibility, user.email]);

  // Save Settings when changed
  useEffect(() => {
    StorageService.saveUserSettings(user.email, appSettings);
  }, [appSettings, user.email]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeView === 'chat') scrollToBottom();
  }, [messages, activeView, isTyping]);

  // --- HANDLERS ---

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);
    setLoadingText("מתחיל לעבוד...");
    setIsSavedToCloud(false); // Changed state to unsaved

    // Call API with Settings
    const response = await generateResponse(messages, inputValue, appSettings);

    const newBotMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response.text, // Text only
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newBotMessage]);
    
    // Update Code Window ONLY if code was returned
    if (response.code) {
      setPreviewContent(response.code);
      setPreviewMode('preview'); // Auto switch to preview to show changes
      saveToHistory(response.code, [...messages, newUserMessage, newBotMessage]);
    }
    
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const saveToHistory = (code: string, currentMsgs: Message[]) => {
    setIsSavedToCloud(false);
    
    let updatedHistory: HistoryItem[];

    if (currentProjectId) {
        // Update existing item logic
        updatedHistory = history.map(item => {
            if (item.id === currentProjectId) {
                return {
                    ...item,
                    timestamp: Date.now(),
                    messages: currentMsgs,
                    code: code,
                    version: (item.version || 1) + 1
                };
            }
            return item;
        });
        
        // Move updated item to top
        const updatedItem = updatedHistory.find(i => i.id === currentProjectId);
        const otherItems = updatedHistory.filter(i => i.id !== currentProjectId);
        if (updatedItem) {
            updatedHistory = [updatedItem, ...otherItems];
        }

    } else {
        // New Item logic
        const newId = Date.now().toString();
        const newItem: HistoryItem = {
            id: newId,
            timestamp: Date.now(),
            title: `פרויקט ${new Date().toLocaleDateString('he-IL')} - ${new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`,
            messages: currentMsgs,
            code: code,
            version: 1
        };
        updatedHistory = [newItem, ...history];
        setCurrentProjectId(newId);
    }
    
    const limitedHistory = updatedHistory.slice(0, 50); // Keep last 50
    setHistory(limitedHistory);
    
    // USE STORAGE SERVICE
    StorageService.saveUserHistory(user.email, limitedHistory);
    
    // Simulate Cloud Sync Delay
    setTimeout(() => {
        setIsSavedToCloud(true);
    }, 1200);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setMessages(item.messages);
    setPreviewContent(item.code);
    setCurrentProjectId(item.id); // Set active project ID
    setActiveView('chat');
  };

  const startNewChat = () => {
    setMessages([initialMessage]);
    setPreviewContent('');
    setCurrentProjectId(null); // Reset active project
    setActiveView('chat');
  };

  // Actions
  const copyToClipboard = () => {
    if (previewContent) {
        navigator.clipboard.writeText(previewContent);
        alert('הקוד הועתק ללוח!');
    }
  };

  const downloadCode = () => {
    if (!previewContent) return;
    
    // User requested to embed specific API key into downloaded files automatically
    const USER_API_KEY = "AIzaSyACNoSZCE1klwD-fXtyJtf7pwKMD_LFgbA";
    
    let contentToSave = previewContent;
    
    // Auto-replace common placeholders with the real key
    contentToSave = contentToSave
        .replace(/YOUR_API_KEY/g, USER_API_KEY)
        .replace(/API_KEY_HERE/g, USER_API_KEY)
        .replace(/<YOUR_API_KEY>/g, USER_API_KEY)
        .replace(/process\.env\.API_KEY/g, `"${USER_API_KEY}"`);

    const ext = appSettings.language === 'python' ? 'py' : appSettings.language === 'javascript' ? 'js' : 'html';
    const blob = new Blob([contentToSave], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ivan_code_v${history.find(h => h.id === currentProjectId)?.version || 1}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- RENDERERS ---

  const renderContentArea = () => {
    if (activeView === 'profile') return <ProfileScreen user={user} />;
    
    if (activeView === 'settings') return (
      <SettingsScreen 
        settings={appSettings} 
        onUpdate={(s) => setAppSettings(prev => ({ ...prev, ...s }))} 
      />
    );
    
    if (activeView === 'accessibility') return (
      <AccessibilityScreen 
        state={accessibility} 
        onUpdate={(s) => setAccessibility(prev => ({ ...prev, ...s }))}
        onReset={() => setAccessibility(defaultAccessibility)}
      />
    );
    
    if (activeView === 'history') return (
       <HistoryScreen history={history} onLoad={loadHistoryItem} onNewChat={startNewChat} />
    );

    // Default: Preview/Code View
    // IMPORTANT: Only render this layout if there is previewContent
    if (!previewContent) return null; 

    return (
      <div className={`flex flex-col bg-white overflow-hidden transition-all duration-300 animate-fade-in ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative h-full rounded-[2.5rem] border border-gray-200 shadow-sm'}`}>
        
        {/* Unified Toolbar */}
        <div className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-100 flex-shrink-0">
             
             {/* Right Side (Start in RTL): Action Buttons */}
             <div className="flex items-center gap-3">
                 <ActionButton icon={<Copy size={16} />} label="העתק" onClick={copyToClipboard} />
                 <ActionButton icon={<Download size={16} />} label="שמור" onClick={downloadCode} />
                 <div className="w-px h-6 bg-gray-100 mx-1"></div>
                 <ActionButton 
                    icon={isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />} 
                    label={isFullscreen ? "מזער" : "הגדל"} 
                    onClick={() => setIsFullscreen(!isFullscreen)} 
                    active={isFullscreen}
                />
             </div>

             {/* Center: View Switcher */}
             <div className="bg-gray-100 p-1 rounded-xl flex">
                 <button 
                    onClick={() => setPreviewMode('preview')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${previewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    <Eye size={14} />
                    <span>תצוגה</span>
                 </button>
                 <button 
                    onClick={() => setPreviewMode('code')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${previewMode === 'code' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    <Code size={14} />
                    <span>קוד</span>
                 </button>
             </div>
             
             {/* Left Side: Cloud Status */}
             <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                {isSavedToCloud ? (
                    <>
                        <span className="hidden sm:inline">נשמר ב-Drive</span>
                        <div className="bg-green-100 p-1.5 rounded-full text-green-600"><Check size={12} /></div>
                    </>
                ) : (
                    <>
                        <span className="hidden sm:inline">שומר...</span>
                        <div className="bg-gray-100 p-1.5 rounded-full text-gray-400 animate-pulse"><CloudLightning size={12} /></div>
                    </>
                )}
             </div> 
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-50/50 overflow-hidden relative">
           <Preview content={previewContent} mode={previewMode} />
        </div>
      </div>
    );
  };

  // Logic for Chat container width
  const isSplitView = activeView === 'chat' && !!previewContent;
  const isChatOnly = activeView === 'chat' && !previewContent;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] text-right" dir="rtl">
      
      {/* Reading Guide Line */}
      {accessibility.readingGuide && (
        <div 
            ref={readingGuideRef}
            className="fixed left-0 right-0 h-1 bg-yellow-400/50 pointer-events-none z-[100]"
            style={{ top: '-10px' }}
        ></div>
      )}

      {/* Sidebar - Updated: Profile at top with IMAGE */}
      <aside className="w-[88px] bg-white border-l border-gray-200 flex flex-col items-center py-6 z-30 shadow-sm shrink-0 gap-6">
        
        {/* Profile Avatar as Top Element */}
        <div 
            className="flex flex-col items-center gap-1 group cursor-pointer hover:scale-105 transition-transform" 
            onClick={() => setActiveView('profile')}
            title="פרופיל משתמש"
        >
             <div className={`w-14 h-14 rounded-full p-0.5 transition-all border-2 ${activeView === 'profile' ? 'border-blue-500 bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30' : 'border-gray-200 bg-transparent hover:bg-gray-100'}`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center text-blue-600 font-bold text-2xl">
                    {user.avatarUrl ? (
                         <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        user.name.charAt(0)
                    )}
                </div>
             </div>
        </div>

        <div className="w-10 h-px bg-gray-100"></div>

        <div className="flex flex-col gap-4 w-full px-2 items-center">
            <SidebarIcon icon={<MessageSquare size={24} />} label="צ'אט" active={activeView === 'chat'} onClick={() => setActiveView('chat')} />
            <SidebarIcon icon={<History size={24} />} label="היסטוריה" active={activeView === 'history'} onClick={() => setActiveView('history')} />
        </div>

        <div className="mt-auto flex flex-col gap-4 w-full px-2 items-center">
             <SidebarIcon icon={<Accessibility size={24} />} label="נגישות" active={activeView === 'accessibility'} onClick={() => setActiveView('accessibility')} />
             <SidebarIcon icon={<Settings size={24} />} label="הגדרות" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
            <div className="w-10 h-px bg-gray-100 my-1"></div>
            <button onClick={onLogout} className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-100 transition-all" title="התנתק"><LogOut size={22} /></button>
        </div>
      </aside>

      {/* Main Layout */}
      <main className="flex-1 flex gap-6 p-6 overflow-hidden relative">
        
        {/* Left: Dynamic Content (Preview, Settings, History, etc.) */}
        {/* If ChatOnly, we hide this div entirely */}
        {!isChatOnly && (
            <div className={`h-full flex flex-col transition-all duration-500 ease-in-out ${isSplitView ? 'flex-[2]' : 'flex-1 w-full'}`}>
                {renderContentArea()}
            </div>
        )}

        {/* Right: Chat */}
        {activeView === 'chat' && (
            <section className={`
                flex flex-col bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-lg shadow-blue-500/5 relative overflow-hidden animate-fade-in transition-all duration-500
                ${isChatOnly ? 'w-full max-w-4xl mx-auto' : 'flex-1 min-w-[400px] max-w-[450px]'}
            `}>
                 
                 <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-md">
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight">אייבן קוד</h2>
                        {isChatOnly && <p className="text-sm text-gray-400">התחל לכתוב כדי ליצור קוד...</p>}
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Logo size={24} />
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} userAvatar={user.avatarUrl} />
                    ))}
                    {isTyping && (
                        <div className="flex justify-start w-full px-2">
                             <div className="px-4 py-3 rounded-2xl rounded-tr-none bg-white border border-gray-100 shadow-sm flex gap-3 items-center">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                                <span className="text-xs text-blue-400 font-medium min-w-[80px] animate-pulse">
                                    {loadingText}
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                 </div>

                 <div className="p-4 bg-white border-t border-gray-100">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-[20px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative flex items-end gap-2 bg-white rounded-[18px] border border-gray-200 p-2 shadow-sm focus-within:shadow-md focus-within:border-blue-200 transition-all">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="תאר לי מה תרצה לבנות..."
                                className="w-full bg-transparent border-none rounded-xl pl-2 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-0 resize-none text-sm leading-relaxed text-right min-h-[50px] max-h-[120px]"
                                dir="rtl"
                                rows={1}
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isTyping}
                                className="p-3 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 transition-all duration-300"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                 </div>
            </section>
        )}
      </main>
    </div>
  );
};
