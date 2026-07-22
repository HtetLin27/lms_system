import { useEffect } from 'react';
import App from './App.jsx';
import { useAuthStore } from './stores/authStore.js';

export default function AppWithAuth() {
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return <App />;
}
