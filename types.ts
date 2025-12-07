
export interface User {
  name: string;
  avatarUrl: string | null; // Allow null for initials only
  email: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ServiceResponse {
  text: string;
  code?: string;
}

export interface AppSettings {
  model: 'gemini-3-pro-preview' | 'gemini-2.5-flash';
  language: 'html' | 'javascript' | 'python' | 'react';
}

export interface AccessibilityState {
  highContrast: boolean;
  fontSizeScale: number; // 1 = 100%, 1.1 = 110%
  reducedMotion: boolean;
  dyslexicFont: boolean;
  readingGuide: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  title: string;
  messages: Message[];
  code: string;
  version: number; // Added version tracking
}

// Extend Window interface for Google GIS
declare global {
  interface Window {
    google: any;
  }
}
