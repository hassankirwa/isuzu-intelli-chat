"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("admin-token")
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (username: string, password: string) => {
    // Check if it's the default admin account
    if (username === "admin" && password === "admin123") {
      // Use the same token value that's used as fallback in API routes
      localStorage.setItem("admin-token", "admin-token-test-123");
      
      // Also set a cookie for middleware to check
      document.cookie = `admin-token=true; path=/; max-age=${60 * 60 * 24 * 7}`; // 1 week
      
      // Call NextAuth signIn function if available
      try {
        // Attempt to sign in with NextAuth - no redirect
        const signInModule = await import('next-auth/react');
        await signInModule.signIn("credentials", {
          username,
          password,
          redirect: false,
        });
      } catch (error) {
        console.error("NextAuth signin error:", error);
        // Continue even if NextAuth fails
      }
      
      setIsAuthenticated(true);
      return true;
    }
    
    // Check for registered admins in localStorage
    try {
      const admins = JSON.parse(localStorage.getItem("admins") || "[]")
      const admin = admins.find(
        (admin: any) => admin.username === username && admin.password === password
      )
      
      if (admin) {
        // Use the same token value that's used as fallback in API routes
        localStorage.setItem("admin-token", "admin-token-test-123");
        localStorage.setItem("current-admin", username);
        
        // Also set a cookie for middleware to check
        document.cookie = `admin-token=true; path=/; max-age=${60 * 60 * 24 * 7}`; // 1 week
        
        // Call NextAuth signIn function if available
        try {
          // Attempt to sign in with NextAuth - no redirect
          const signInModule = await import('next-auth/react');
          await signInModule.signIn("credentials", {
            username,
            password,
            redirect: false,
          });
        } catch (error) {
          console.error("NextAuth signin error:", error);
          // Continue even if NextAuth fails
        }
        
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error("Error checking admin credentials:", error)
    }
    
    return false
  }

  const logout = () => {
    localStorage.removeItem("admin-token")
    localStorage.removeItem("current-admin")
    setIsAuthenticated(false)
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

