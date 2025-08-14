import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import MainLayout from "@/components/layout/main-layout"
import { AdminProvider } from "@/contexts/admin-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ms. G's Math Classes",
  description: "Welcome to Ms. G's math class website with resources and schedules",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminProvider>
          <MainLayout>{children}</MainLayout>
        </AdminProvider>
      </body>
    </html>
  )
}
