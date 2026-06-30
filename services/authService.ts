import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

// Set a simple cookie helper for demo mode
function setDemoCookie(name: string, value: string, days: number = 1) {
  if (typeof window === "undefined") return;
  const expires = new Date(Date.now() + days * 86400 * 1000).toUTCString();
  document.cookie = `${name}=${value}; path=/; expires=${expires}; SameSite=Lax`;
}

function deleteDemoCookie(name: string) {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
}

export const authService = {
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      // Demo authentication mode credentials
      const demoEmail = "admin@rusticjewels.com";
      const demoPassword = "admin"; // Easy password for testing

      if (email.toLowerCase() === demoEmail && password === demoPassword) {
        setDemoCookie("rustic_mock_admin_session", "authenticated", 7);
        return { success: true };
      } else {
        return {
          success: false,
          error: "Invalid credentials. For demo mode, use email 'admin@rusticjewels.com' and password 'admin'."
        };
      }
    }

    // Real Supabase Sign In
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  async signOut(): Promise<boolean> {
    if (!isSupabaseConfigured) {
      deleteDemoCookie("rustic_mock_admin_session");
      // Redirect to login page on success
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      return true;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out from Supabase:", error);
      return false;
    }
    
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    return true;
  },

  async getCurrentUserEmail(): Promise<string | null> {
    if (!isSupabaseConfigured) {
      if (typeof window === "undefined") return null;
      // Read cookie
      const cookies = document.cookie.split("; ");
      const session = cookies.find((c) => c.startsWith("rustic_mock_admin_session="));
      return session?.split("=")[1] === "authenticated" ? "admin@rusticjewels.com" : null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    return user?.email || null;
  }
};
