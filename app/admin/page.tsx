"use client"

import { useAdmin } from "@/contexts/admin-context"
import AdminLogin from "@/components/admin/admin-login"
import UniversalContentEditor from "@/components/admin/universal-content-editor"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function AdminPage() {
  const { isAdmin, logout } = useAdmin()

  if (!isAdmin) {
    return <AdminLogin />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white shadow-sm border-b mb-8">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-purple-700">Admin Dashboard</h1>
          <Button variant="outline" onClick={logout} className="flex items-center bg-transparent">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      <UniversalContentEditor />
    </div>
  )
}
