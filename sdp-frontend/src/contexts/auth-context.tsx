import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  type ReactNode, // Type for children prop
} from "react"
import {
  getCurrentUser,
  userLogin,
  userLogout,
} from "../services/authService"
import type { User, AuthContextType } from "../types"; // Import types
import { useNavigate } from "react-router-dom";

// 1. Create the Context with correct typing
const AuthContext = createContext<AuthContextType | null>(null)

// Props type for the Provider
interface AuthProviderProps {
  children: ReactNode
}

// 2. Create the Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true) // Start loading
  const navigate = useNavigate();

  // --- Check session on initial load ---
  const checkAuthStatus = useCallback(async (): Promise<void> => {
    setIsLoading(true) // Start loading on check
    try {
      const userData = await getCurrentUser() // Fetch user data
      console.debug("User data:", userData) // Debugging log
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error: any) {
      // Catch potential errors (401 etc.)
      console.error(
        "Auth check failed:",
        error.status === 401 ? "Unauthorized" : error
      )
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false) // Finish loading regardless of outcome
    }
  }, [])

  useEffect(() => {
    checkAuthStatus() // Run on component mount
  }, [checkAuthStatus])

  // --- Login Function ---
  const login = async (username: string, password: string): Promise<void> => {
    try {
      await userLogin(username, password) // Call login API
      // Login success - refetch user data to update state
      await checkAuthStatus() // This sets isAuthenticated and user
    } catch (error: any) {
      setUser(null)
      setIsAuthenticated(false)
      throw error
    }
  }

  // --- Logout Function ---
  const logout = async (): Promise<void> => {
    try {
      await userLogout() // Call backend logout
    } catch (error) {
      console.error("Logout API call failed:", error)
      // Still proceed with client-side logout
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      navigate("/login");
    }
  }

  const changePassword = async (
    oldPassword: string,
    newPassword: string,
    username: string
  ): Promise<void> => {
    try {
      // await userChangePassword(oldPassword, newPassword, username)
    } catch (error: any) {
      console.error("Change password failed:", error)
      throw error
    }
  }

  // --- Value provided to consuming components ---
  // Ensure the value structure matches AuthContextType
  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    checkAuthStatus,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 3. Create a Custom Hook for easy consumption
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === null) {
    // Check for null instead of undefined
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
