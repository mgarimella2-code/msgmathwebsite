"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Edit } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"

const classes = [
  { name: "AP PreCalc", slug: "ap-precalc" },
  { name: "Math 1: Period 1", slug: "math-1-period-1" },
  { name: "Math 1 Honors", slug: "math-1-honors" },
  { name: "Math 1: Period 4", slug: "math-1-period-4" },
  { name: "Math 1: Period 5", slug: "math-1-period-5" },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAdmin()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-purple-600">
                Ms. G's Math Classes
              </Link>

              <nav className="hidden md:flex items-center space-x-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center">
                      Classes <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {classes.map((cls) => (
                      <DropdownMenuItem key={cls.slug} asChild>
                        <Link href={`/class/${cls.slug}`}>{cls.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link href="/announcements" className="text-gray-700 hover:text-purple-600">
                  Announcements
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">
                  <Edit className="h-4 w-4 mr-2" />
                  {isAdmin ? "Admin Dashboard" : "Admin Login"}
                </Link>
              </Button>

              {/* Mobile menu */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Menu <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/">Home</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/announcements">Announcements</Link>
                    </DropdownMenuItem>
                    {classes.map((cls) => (
                      <DropdownMenuItem key={cls.slug} asChild>
                        <Link href={`/class/${cls.slug}`}>{cls.name}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
