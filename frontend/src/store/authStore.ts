// store/authStore.ts
import { create } from "zustand";
import { isMockAuth, auth, db } from "../lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  phone: string;
  name: string;
  age: number;
  city: string;
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isInitialized: boolean;
  isMock: boolean;
  pendingPhoneDetails: { phone: string } | null;
  initAuth: () => void;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<boolean>; // returns true if registered
  registerPhoneUser: (phone: string, name: string, age: number, city: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  isInitialized: false,
  isMock: isMockAuth,
  pendingPhoneDetails: null,

  initAuth: () => {
    if (get().isInitialized) return;

    if (isMockAuth) {
      // Mock Session Restoration
      const session = localStorage.getItem("mock_phone_session");
      if (session) {
        set({ user: JSON.parse(session), isInitialized: true });
      } else {
        set({ user: null, isInitialized: true });
      }
    } else {
      // Firebase standard listener
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser && firebaseUser.phoneNumber) {
          try {
            const docRef = doc(db, "users", firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              set({
                user: {
                  uid: firebaseUser.uid,
                  phone: firebaseUser.phoneNumber,
                  name: data.name || "",
                  age: Number(data.age) || 0,
                  city: data.city || "",
                },
                pendingPhoneDetails: null,
                isInitialized: true
              });
            } else {
              set({
                user: null,
                pendingPhoneDetails: { phone: firebaseUser.phoneNumber },
                isInitialized: true
              });
            }
          } catch (e) {
            console.error("Firestore lookup error", e);
            set({
              user: null,
              pendingPhoneDetails: { phone: firebaseUser.phoneNumber },
              isInitialized: true
            });
          }
        } else {
          set({ user: null, pendingPhoneDetails: null, isInitialized: true });
        }
      });
    }
  },

  sendOTP: async (phone) => {
    set({ loading: true });
    try {
      if (isMockAuth) {
        // Mock OTP Delay simulation
        await new Promise((r) => setTimeout(r, 800));
        console.log(`Demo OTP "123456" dispatched successfully to ${phone}`);
      } else {
        // Firebase phone authentication verifier can be triggered here if keys configured
        // For standard offline resilience, mock flow covers most environments
      }
    } finally {
      set({ loading: false });
    }
  },

  verifyOTP: async (phone, otp) => {
    set({ loading: true });
    try {
      if (otp !== "123456") {
        throw new Error("Invalid OTP code. Please use the demo code 123456");
      }

      if (isMockAuth) {
        const mockUsers = JSON.parse(localStorage.getItem("mock_phone_users") || "{}");
        const found = mockUsers[phone];
        
        if (found) {
          const profile: UserProfile = {
            uid: found.uid,
            phone: found.phone,
            name: found.name,
            age: found.age,
            city: found.city
          };
          localStorage.setItem("mock_phone_session", JSON.stringify(profile));
          set({ user: profile, pendingPhoneDetails: null });
          return true; // Already registered
        } else {
          set({ pendingPhoneDetails: { phone } });
          return false; // Registration required
        }
      } else {
        // Firebase verification confirmation
        return false;
      }
    } finally {
      set({ loading: false });
    }
  },

  registerPhoneUser: async (phone, name, age, city) => {
    set({ loading: true });
    try {
      const uid = "phone_" + Math.random().toString(36).substr(2, 9);
      const profile: UserProfile = { uid, phone, name, age, city };

      if (isMockAuth) {
        const mockUsers = JSON.parse(localStorage.getItem("mock_phone_users") || "{}");
        mockUsers[phone] = profile;
        localStorage.setItem("mock_phone_users", JSON.stringify(mockUsers));
        localStorage.setItem("mock_phone_session", JSON.stringify(profile));
      } else {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await setDoc(doc(db, "users", currentUser.uid), {
            name,
            age,
            city,
            phone,
            createdAt: new Date().toISOString(),
          });
        }
      }
      set({ user: profile, pendingPhoneDetails: null });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      if (isMockAuth) {
        localStorage.removeItem("mock_phone_session");
      } else {
        await signOut(auth);
      }
      set({ user: null, pendingPhoneDetails: null });
    } finally {
      set({ loading: false });
    }
  }
}));
