"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AdminContextType {
  isAdmin: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

// Simple password - you can change this
const ADMIN_PASSWORD = "MsG2024!"

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if admin is already logged in
    const adminStatus = localStorage.getItem("ms-g-admin")
    if (adminStatus === "true") {
      setIsAdmin(true)
    }
  }, [])

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      localStorage.setItem("ms-g-admin", "true")
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    localStorage.removeItem("ms-g-admin")
  }

  return <AdminContext.Provider value={{ isAdmin, login, logout }}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
