"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  ChevronRight, 
  Home, 
  Plane, 
  Settings,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Fleet', href: '/fleet', icon: Plane },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Desktop Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 hidden md:flex flex-col`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                Drone Tracker
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Fleet Management System
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  sidebarCollapsed ? "" : "rotate-180"
                }`}
              />
            </Button>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Theme Toggle & Status */}
        {!sidebarCollapsed && (
          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Theme
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-1 h-6 w-6"
              >
                {darkMode ? (
                  <Sun className="w-3 h-3" />
                ) : (
                  <Moon className="w-3 h-3" />
                )}
              </Button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className={`fixed inset-0 z-50 md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                  Drone Tracker
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Fleet Management System
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="text-gray-400 md:hidden"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {/* Breadcrumb can be added here */}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-950">
          {children}
        </div>
      </div>
    </div>
  )
}
