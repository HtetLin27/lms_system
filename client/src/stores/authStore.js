import api from '../api/axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { token, user } = res.data;

          // Why store token in localStorage here AND in the store:
          // The Axios interceptor reads from localStorage on every request.
          // The store holds it for components that need to check auth status.
          localStorage.setItem('token', token);

          set({ user, token, loading: false });
          return user;
        } catch (err) {
          set({ loading: false });
          throw err; // re-throw so the login form can show the error
        }
      },

      register: async (name, email, password, role = 'student') => {
        set({ loading: true });
        try {
          const res = await api.post('/auth/register', {
            name,
            email,
            password,
            role,
          });
          const { token, user } = res.data;

          localStorage.setItem('token', token);
          set({ user, token, loading: false });
          return user;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) return; // not logged in, nothing to fetch

        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.user });
        } catch {
          // Token expired or invalid — log the user out
          get().logout();
        }
      },

      // What:  Updates the user in the store after a profile edit.
      // Why not re-fetch from API:
      //   The updateProfile controller returns the updated user.
      //   We use that response directly instead of making a second request.
      setUser: (user) => set({ user }),
    }),
    {
      name: 'lms-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useIsStudent = () => useAuthStore((s) => s.user?.role === 'student');
export const useIsInstructor = () => useAuthStore((s) => s.user?.role === 'instructor');
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === 'admin');
export const useIsLoggedIn = () => useAuthStore((s) => !!s.user);
