import { HistoryItem, AppSettings, AccessibilityState, User } from "../types";

// Simulating a connection string/collection name
const DB_COLLECTION_USERS = "ivan_cloud_users_v1";
const DB_COLLECTION_DATA = "ivan_cloud_data_v1_";

// Helper to simulate network delay (Server latency)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const StorageService = {
  
  // --- AUTHENTICATION METHODS (Server Side Simulation) ---

  async registerUser(user: User, password?: string): Promise<{ success: boolean; message?: string }> {
    await delay(800); // Simulate server request

    const usersMap = this._getUsersMap();
    
    if (usersMap[user.email]) {
      return { success: false, message: "האימייל הזה כבר רשום במערכת. נסה להתחבר." };
    }

    // Create user record
    usersMap[user.email] = {
      profile: user,
      password: password || 'google_auth_user', // In a real app, verify hash
      createdAt: Date.now()
    };

    this._saveUsersMap(usersMap);
    return { success: true };
  },

  async loginUser(email: string, password?: string, isGoogle = false): Promise<{ success: boolean; user?: User; message?: string }> {
    await delay(800); // Simulate server request

    const usersMap = this._getUsersMap();
    const storedUser = usersMap[email];

    if (!storedUser) {
      return { success: false, message: "חשבון לא נמצא. יש לבצע הרשמה תחילה." };
    }

    // If strictly password login (not Google), verify password
    if (!isGoogle && storedUser.password !== password) {
      return { success: false, message: "סיסמה שגויה." };
    }

    return { success: true, user: storedUser.profile };
  },

  async userExists(email: string): Promise<boolean> {
    const usersMap = this._getUsersMap();
    return !!usersMap[email];
  },

  // --- DATABASE INTERNAL HELPERS ---

  _getUsersMap(): Record<string, any> {
    try {
      const data = localStorage.getItem(DB_COLLECTION_USERS);
      return data ? JSON.parse(data) : {};
    } catch { return {}; }
  },

  _saveUsersMap(data: Record<string, any>) {
    localStorage.setItem(DB_COLLECTION_USERS, JSON.stringify(data));
  },

  // --- DATA STORAGE METHODS (Cloud Simulation) ---

  getUserHistory(userId: string): HistoryItem[] {
    return this._loadData(userId, 'history') || [];
  },

  saveUserHistory(userId: string, history: HistoryItem[]) {
    return this._saveData(userId, 'history', history);
  },

  getUserSettings(userId: string): AppSettings | null {
    return this._loadData(userId, 'settings');
  },

  saveUserSettings(userId: string, settings: AppSettings) {
    return this._saveData(userId, 'settings', settings);
  },

  getUserAccessibility(userId: string): AccessibilityState | null {
    return this._loadData(userId, 'accessibility');
  },

  save(userId: string, collection: string, data: any) {
    return this._saveData(userId, collection, data); // Alias for compatibility
  },

  // Generic Data Handlers
  _saveData(userId: string, collection: string, data: any) {
    try {
      if (!userId) return false;
      const key = `${DB_COLLECTION_DATA}${userId}_${collection}`;
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("[Cloud Mock] Save failed", e);
      return false;
    }
  },

  _loadData(userId: string, collection: string) {
    try {
      if (!userId) return null;
      const key = `${DB_COLLECTION_DATA}${userId}_${collection}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("[Cloud Mock] Load failed", e);
      return null;
    }
  }
};