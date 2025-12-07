
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Check, AlertCircle, Shield, X } from 'lucide-react';
import { Logo } from './Logo';
import { StorageService } from '../services/storageService';

interface LoginProps {
  onLogin: (user: User) => void;
}

// Google Client ID
const GOOGLE_CLIENT_ID = "1029411846084-2jidcvnmiumb0ajqdm3fcot1rvmaldr6.apps.googleusercontent.com";

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false); // Toggle Mode
  const [error, setError] = useState('');
  
  // Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<{user: User, pass?: string, type: 'google' | 'email'} | null>(null);

  // Refs for Google Button
  const googleButtonWrapperRef = useRef<HTMLDivElement>(null);

  // Robust JWT Parsing
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("JWT Parse Error", e);
      return null;
    }
  };

  const handleGoogleResponse = async (response: any) => {
    setError('');
    if (response.credential) {
      const payload = parseJwt(response.credential);
      if (payload) {
        const googleUser: User = {
          name: payload.name || "משתמש Google",
          email: payload.email,
          avatarUrl: payload.picture || null, 
        };

        setIsLoading(true);

        if (isRegister) {
            // Register Flow with Google
            const exists = await StorageService.userExists(googleUser.email);
            if (exists) {
                setError("החשבון כבר קיים במערכת. אנא בצע התחברות.");
                setIsLoading(false);
                return;
            }

            setPendingUser({ user: googleUser, type: 'google' });
            setShowTermsModal(true);
            setIsLoading(false);
        } else {
            // Login Flow with Google
            const result = await StorageService.loginUser(googleUser.email, undefined, true);
            setIsLoading(false);

            if (result.success && result.user) {
                onLogin(result.user);
            } else {
                setError(result.message || "התחברות נכשלה");
            }
        }
      } else {
        setError('נכשל בפענוח נתוני התחברות מגוגל');
      }
    }
  };

  useEffect(() => {
    let intervalId: any;

    const renderGoogleButton = () => {
      // Check if SDK loaded and wrapper exists
      if (window.google && window.google.accounts && googleButtonWrapperRef.current) {
        try {
            // Clear any existing button to prevent duplicates or stale state
            googleButtonWrapperRef.current.innerHTML = '';

            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
                auto_select: false, // Force user interaction
                cancel_on_tap_outside: true,
                ux_mode: 'popup',
            });
            
            // Calculate width to fit container (approx 350px for max-w-[420px] minus padding)
            const btnWidth = Math.min(window.innerWidth - 80, 350);

            window.google.accounts.id.renderButton(
                googleButtonWrapperRef.current,
                { 
                    theme: "filled_blue", // Ensure visibility on white bg
                    size: "large", 
                    shape: "pill", 
                    type: "standard", 
                    text: isRegister ? "signup_with" : "signin_with", // Strictly "Sign up with" or "Sign in with"
                    width: btnWidth,
                    logo_alignment: "left"
                } 
            );
            
            // If successful, we can clear interval
            if (intervalId) clearInterval(intervalId);

        } catch (e) {
            console.error("Google button render error", e);
        }
      }
    };

    // Attempt to render immediately
    renderGoogleButton();

    // Retry every 500ms in case script loads slowly (async)
    intervalId = setInterval(renderGoogleButton, 500);

    // Cleanup
    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [isRegister]); // Re-run when switching between Login/Register to update text

  const handleEmailAuth = async () => {
    setError('');
    if (!email || !password) {
      setError('נא למלא אימייל וסיסמה');
      return;
    }

    setIsLoading(true);

    if (isRegister) {
      // REGISTER FLOW
      if (!name) {
        setError('נא למלא שם מלא');
        setIsLoading(false);
        return;
      }
      
      const exists = await StorageService.userExists(email);
      if (exists) {
          setError("האימייל הזה כבר רשום. נא לעבור להתחברות.");
          setIsLoading(false);
          return;
      }

      setPendingUser({ user: { name, email, avatarUrl: null }, pass: password, type: 'email' });
      setShowTermsModal(true);
      setIsLoading(false);

    } else {
      // LOGIN FLOW
      const result = await StorageService.loginUser(email, password, false);
      setIsLoading(false);
      
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(result.message || "שגיאה בהתחברות");
      }
    }
  };

  const acceptTermsAndLogin = async () => {
    if (!pendingUser) return;
    
    setIsLoading(true);
    
    // Perform Registration
    const result = await StorageService.registerUser(pendingUser.user, pendingUser.pass);
    
    setIsLoading(false);
    setShowTermsModal(false);

    if (result.success) {
        onLogin(pendingUser.user);
    } else {
        setError(result.message || "הרשמה נכשלה");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#f8fafc]">
      
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] w-full max-w-[420px] flex flex-col items-center gap-6 relative z-10 animate-fade-in shadow-soft border border-white/80">
        
        <div className="flex flex-col items-center gap-2 relative mb-2">
            <div className="relative animate-float">
                <Logo size={80} />
            </div>
            <div className="text-center">
                <h1 className="text-3xl font-black text-gray-800 tracking-tight mt-2">
                אייבן קוד
                </h1>
                <p className="text-gray-500 text-sm mt-1">ארכיטקטורת ענן מאובטחת</p>
            </div>
        </div>

        {/* Toggle Login/Register */}
        <div className="flex bg-gray-100/70 p-1.5 rounded-full w-full relative">
          <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out ${isRegister ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`}></div>
          <button 
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-full z-10 transition-colors duration-300 ${!isRegister ? 'text-blue-600' : 'text-gray-500'}`}
          >
            התחברות
          </button>
          <button 
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-full z-10 transition-colors duration-300 ${isRegister ? 'text-blue-600' : 'text-gray-500'}`}
          >
            הרשמה
          </button>
        </div>

        <div className="w-full space-y-3">
          {isRegister && (
             <input
               type="text"
               placeholder="שם מלא"
               value={name}
               onChange={(e) => setName(e.target.value)}
               className="w-full bg-white/60 border border-gray-200 rounded-2xl px-5 py-3 text-gray-800 focus:border-blue-500 focus:bg-white transition-all text-right text-sm"
               dir="rtl"
             />
          )}
          
          <input
            type="email"
            placeholder="כתובת אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/60 border border-gray-200 rounded-2xl px-5 py-3 text-gray-800 focus:border-blue-500 focus:bg-white transition-all text-right text-sm"
            dir="rtl"
          />
          
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/60 border border-gray-200 rounded-2xl px-5 py-3 text-gray-800 focus:border-blue-500 focus:bg-white transition-all text-right text-sm"
            dir="rtl"
          />

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-xs font-bold justify-end bg-red-50 p-2 rounded-lg border border-red-100 animate-fade-in">
              <span>{error}</span>
              <AlertCircle size={14} />
            </div>
          )}

          <button
            onClick={handleEmailAuth}
            disabled={isLoading}
            className="w-full py-3.5 rounded-full font-bold shadow-lg transition-all mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:-translate-y-0.5 shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "מתקשר לשרת..." : (isRegister ? "צור חשבון חדש" : "כניסה למערכת")}
          </button>
        </div>

        <div className="relative flex py-1 items-center w-full">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">או {isRegister ? 'הירשם' : 'התחבר'} באמצעות</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Google Button Container */}
        <div className="w-full flex justify-center">
            <div 
                ref={googleButtonWrapperRef} 
                className="transition-transform hover:scale-[1.02]"
                style={{ minHeight: '44px' }}
            >
                {/* Button is rendered here by GIS */}
            </div>
        </div>
      </div>

      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative flex flex-col max-h-[90vh]">
            <button 
                onClick={() => setShowTermsModal(false)}
                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
            >
                <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4 text-blue-600">
                <Shield size={32} />
                <h2 className="text-2xl font-black">תנאי שימוש והסרת אחריות</h2>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2 mb-6 space-y-4 text-sm text-gray-600 leading-relaxed text-right" dir="rtl">
                <p className="font-bold">אנא קרא/י בעיון את התנאים הבאים לפני השימוש באתר:</p>
                <p>1. <span className="font-bold">מהות השירות:</span> האתר "אייבן קוד" הוא כלי עזר מבוסס בינה מלאכותית (Gemini 3 Pro) ליצירת קוד.</p>
                <p>2. <span className="font-bold">הסרת אחריות מוחלטת:</span> בעלי האתר, מפתחיו והחברה המפעילה אינם אחראים לכל נזק, ישיר או עקיף, שייגרם כתוצאה משימוש באתר. המשתמש מוותר בזאת על כל זכות תביעה.</p>
                <p>3. <span className="font-bold">אחריות הבוט:</span> הבוט מופעל ע"י Gemini 3 Pro של גוגל. החברה לא תישא באחריות על תוכן פוגעני או שגוי.</p>
                
                <p className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-blue-800 font-medium">
                    בלחיצה על "אשר והמשך", הנך מאשר/ת את הסכמתך המלאה לתנאים.
                </p>
            </div>

            <button
                onClick={acceptTermsAndLogin}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <span>יוצר משתמש...</span>
                ) : (
                    <>
                        <Check size={20} />
                        <span>אשר והמשך</span>
                    </>
                )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
