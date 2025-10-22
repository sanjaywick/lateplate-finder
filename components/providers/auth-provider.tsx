"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
  profileComplete?: boolean
  phone?: string
  hasDiabetes?: boolean
  dietaryPreference?: string
  allergies?: string[]
  favoritesCuisines?: string[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setToken(storedToken)

        // Verify token is still valid by fetching user profile
        verifyToken(storedToken)
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }

    setLoading(false)
  }, [])

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
      } else {
        // Token is invalid, clear auth data
        logout()
      }
    } catch (error) {
      console.error("Token verification error:", error)
      logout()
    }
  }

  const login = (userData: User, authToken: string) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("token", authToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper function to make authenticated API requests
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("No authentication token found")
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
