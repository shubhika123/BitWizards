// store/authStore.ts
import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import { API_BASE_URL as OUTFIT_CIRCLE_API_BASE } from "../lib/apiConfig";

// Toggle true for local browser-only testing with OTP '123456'
export const isMockAuth = true; 

export interface UserProfile {
  uid: string;
  phone: string;
  name: string;
  age: number;
  city: string;
  username: string;
  user_id: number; // PostgreSQL backend's numeric id — required for database relations
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isInitialized: boolean;
  isMock: boolean;
  pendingPhoneDetails: { phone: string } | null;
  initAuth: () => void;
  checkPhoneExists: (phone: string) => Promise<boolean>;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<boolean>; // returns true if registered
  registerPhoneUser: (
    phone: string,
    name: string,
    age: number,
    city: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

async function registerUserWithBackend(name: string, phone: string, city: string) {
  const res = await fetch(`${OUTFIT_CIRCLE_API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, city }),
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
      const session = typeof window !== 'undefined' ? localStorage.getItem("mock_phone_session") : null;
      if (session) {
        const parsed = JSON.parse(session);
        fetch(`${OUTFIT_CIRCLE_API_BASE}/auth/verify/${parsed.user_id}`)
          .then(res => {
            if (res.status === 404) {
              get().logout();
            } else {
              if (parsed.city) localStorage.setItem("selectedCity", parsed.city);
              set({ user: parsed, isInitialized: true });
            }
          })
          .catch(e => {
            console.error("Verification error", e);
            if (parsed.city) localStorage.setItem("selectedCity", parsed.city);
            set({ user: parsed, isInitialized: true });
          });
      } else {
        set({ user: null, isInitialized: true });
      }
    } else {
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user && session.user.phone) {
          try {
            // Retrieve custom profile data from local storage linked to the Supabase Auth UUID
            const localProfileStr = localStorage.getItem(`supabase_profile_${session.user.id}`);
            if (localProfileStr) {
              const parsed = JSON.parse(localProfileStr);
              const res = await fetch(`${OUTFIT_CIRCLE_API_BASE}/auth/verify/${parsed.user_id}`);
              if (res.status === 404) {
                get().logout();
              } else {
                if (parsed.city) localStorage.setItem("selectedCity", parsed.city);
                set({
                  user: parsed,
                  pendingPhoneDetails: null,
                  isInitialized: true,
                });
              }
            } else {
              set({
                user: null,
                pendingPhoneDetails: { phone: session.user.phone },
                isInitialized: true,
              });
            }
          } catch (e) {
            console.error("Supabase lookup or verification error", e);
            set({
              user: null,
              pendingPhoneDetails: { phone: session.user.phone },
              isInitialized: true,
            });
          }
        } else {
          set({ user: null, pendingPhoneDetails: null, isInitialized: true });
        }
      });
    }
  },

  checkPhoneExists: async (phone) => {
    try {
      const res = await fetch(`${OUTFIT_CIRCLE_API_BASE}/auth/check-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.exists === true;
      }
      return false;
    } catch (e) {
      console.error("Failed to check phone existence", e);
      return false;
    }
  },

  sendOTP: async (phone) => {
    set({ loading: true });
    try {
      if (isMockAuth) {
        await new Promise((r) => setTimeout(r, 800));
        console.log(`Demo OTP "123456" dispatched successfully to ${phone}`);
      } else {
        // Send OTP using Supabase Phone Auth
        // Ensure phone number includes country code
        const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
        const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
        if (error) {
          throw new Error("Supabase OTP Error: " + error.message);
        }
      }
    } finally {
      set({ loading: false });
    }
  },

  verifyOTP: async (phone, otp) => {
    set({ loading: true });
    try {
      let foundProfile: UserProfile | null = null;

      if (isMockAuth) {
        await new Promise((r) => setTimeout(r, 1500)); // Simulate real-world network delay for OTP verification
        if (otp !== "123456") {
          throw new Error("Invalid OTP code. Please use the demo code 123456");
        }
        const mockUsers = JSON.parse(localStorage.getItem("mock_phone_users") || "{}");
        if (mockUsers[phone]) {
          foundProfile = { ...mockUsers[phone] };
        }
      } else {
        const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
        const { data, error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp, type: 'sms' });
        
        if (error) {
           throw new Error("Verification failed: " + error.message);
        }
        
        const localProfileStr = localStorage.getItem(`supabase_profile_${data.user?.id}`);
        if (localProfileStr) {
          foundProfile = JSON.parse(localProfileStr);
        }
      }

      // If we don't have it in local storage, check the backend database directly
      if (!foundProfile) {
        try {
          const res = await fetch(`${OUTFIT_CIRCLE_API_BASE}/outfit-circle/users/by-phone/${encodeURIComponent(phone)}`);
          if (res.ok) {
            const dbUser = await res.json();
            foundProfile = {
              uid: "phone_" + Math.random().toString(36).substr(2, 9), // placeholder for mock
              phone: dbUser.phone,
              name: dbUser.name,
              age: dbUser.age || 20,
              city: dbUser.city,
              username: dbUser.username,
              user_id: dbUser.user_id
            };

            // Re-hydrate local storage
            if (isMockAuth) {
              const mockUsers = JSON.parse(localStorage.getItem("mock_phone_users") || "{}");
              mockUsers[phone] = foundProfile;
              localStorage.setItem("mock_phone_users", JSON.stringify(mockUsers));
            }
            // For supabase, we would ideally need the supabase UUID but since this is mock first, 
            // the uid above is a fallback. The supabase block above handles it if possible.
          }
        } catch (e) {
          console.error("Failed to recover profile from backend", e);
        }
      }

      if (foundProfile) {
        if (isMockAuth) {
          localStorage.setItem("mock_phone_session", JSON.stringify(foundProfile));
        }
        if (foundProfile.city) {
          localStorage.setItem("selectedCity", foundProfile.city);
        }
        set({ user: foundProfile, pendingPhoneDetails: null });
        return true;
      } else {
        set({ pendingPhoneDetails: { phone } });
        return false;
      }

    } finally {
      set({ loading: false });
    }
  },

  registerPhoneUser: async (phone, name, age, city) => {
    set({ loading: true });
    try {
      // 1. Create the user in the FastAPI PostgreSQL Database via the new Auth Router
      const backendUser = await registerUserWithBackend(name, phone, city);

      let uid = "phone_" + Math.random().toString(36).substr(2, 9);
      
      if (!isMockAuth) {
         const { data: { session } } = await supabase.auth.getSession();
         if (session?.user) {
             uid = session.user.id;
         }
      }

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
        // Save the profile associated with the Supabase UID
        localStorage.setItem(`supabase_profile_${uid}`, JSON.stringify(profile));
      }
      
      if (city) {
        localStorage.setItem("selectedCity", city);
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
        await supabase.auth.signOut();
      }
      set({ user: null, pendingPhoneDetails: null });
    } finally {
      set({ loading: false });
    }
  },
}));