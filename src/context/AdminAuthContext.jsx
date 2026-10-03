import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../api/supabase";
import { setAuthToken } from "../api/client";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(currentSession || null);
      setUser(currentSession?.user || null);
      setAuthToken(currentSession?.access_token || null);
      setLoading(false);
    };

    loadSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession || null);
      setUser(currentSession?.user || null);
      setAuthToken(currentSession?.access_token || null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    setSession(data.session);
    setUser(data.user);
    setAuthToken(data.session?.access_token || null);

    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        session,
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(session)
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
