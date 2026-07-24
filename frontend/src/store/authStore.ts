// store/authStore.ts
import { create } from "zustand";
import { isMockAuth, auth, db } from "../lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { API_BASE_URL as OUTFIT_CIRCLE_API_BASE } from "../lib/apiConfig";

export interface UserProfile {
  uid: string;
  phone: string;
  name: string;
  age: number;
  city: string;
  username: string;
  user_id: number; // Outfit Circle backend's numeric id — required for all board/invite calls
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
  registerPhoneUser: (
    phone: string,
    name: string,
    age: number,
    city: string,
    username: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

async function registerWithOutfitCircle(username: string, name: string) {
  const res = await fetch(`${OUTFIT_CIRCLE_API_BASE}/outfit-circle/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, name }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Failed to register username. Try a different one.");
  }

  return res.json() as Promise<{ user_id: number; name: string; username: string }>;
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
      const session = localStorage.getItem("mock_phone_session");
      if (session) {
        set({ user: JSON.parse(session), isInitialized: true });
      } else {
        set({ user: null, isInitialized: true });
      }
    } else {
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
                  username: data.username || "",
                  user_id: Number(data.user_id) || 0,
                },
                pendingPhoneDetails: null,
                isInitialized: true,
              });
            } else {
              set({
                user: null,
                pendingPhoneDetails: { phone: firebaseUser.phoneNumber },
                isInitialized: true,
              });
            }
          } catch (e) {
            console.error("Firestore lookup error", e);
            set({
              user: null,
              pendingPhoneDetails: { phone: firebaseUser.phoneNumber },
              isInitialized: true,
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
        await new Promise((r) => setTimeout(r, 800));
        console.log(`Demo OTP "123456" dispatched successfully to ${phone}`);
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
            city: found.city,
            username: found.username,
            user_id: found.user_id,
          };
          localStorage.setItem("mock_phone_session", JSON.stringify(profile));
          set({ user: profile, pendingPhoneDetails: null });
          return true;
        } else {
          set({ pendingPhoneDetails: { phone } });
          return false;
        }
      } else {
        return false;
      }
    } finally {
      set({ loading: false });
    }
  },

  registerPhoneUser: async (phone, name, age, city, username) => {
    set({ loading: true });
    try {
      const backendUser = await registerWithOutfitCircle(username, name);

      const uid = "phone_" + Math.random().toString(36).substr(2, 9);
      const profile: UserProfile = {
        uid,
        phone,
        name,
        age,
        city,
        username: backendUser.username,
        user_id: backendUser.user_id,
      };

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
            username: profile.username,
            user_id: profile.user_id,
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
  },
}));