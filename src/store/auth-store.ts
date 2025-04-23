import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserInfo {
    id: string;
    role: string;
}

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    user: UserInfo | null;
    setToken: (token: string) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            isAuthenticated: false,
            user: null,

            setToken: (token: string) => {
                set({ token, isAuthenticated: true });
            },

            clearAuth: () => {
                set({ token: null, isAuthenticated: false, user: null });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

if (typeof window !== 'undefined') {
    useAuthStore.persist.rehydrate();
}
