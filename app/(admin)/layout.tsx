"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { IconSchool } from "@tabler/icons-react"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users, badge: "187" },
  { href: "/admin/predictions", label: "Predictions", icon: BrainCircuit },
  { href: "/admin/model", label: "ML Model", icon: BarChart3 },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Sidebar */}
      <aside
        className={cn(
          "relative flex h-screen flex-col bg-blue-950 text-white transition-all duration-300 dark:bg-slate-900",
          collapsed ? "w-16" : "w-60"
        )}
        style={{ position: "sticky", top: 0 }}
      >
        {/* Logo */}
        <div className={cn("flex items-center gap-2.5 border-b border-white/10 px-4 py-5", collapsed && "justify-center px-0")}>
          <IconSchool className="h-6 w-6 shrink-0 text-blue-400" />
          {!collapsed && (
            <span className="text-sm font-bold uppercase tracking-wider text-white">
              EduSight
            </span>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-blue-800 bg-blue-950 text-white shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Nav section label */}
        {!collapsed && (
          <p className="mt-4 px-4 text-[10px] font-semibold tracking-widest text-blue-300/60 uppercase">
            Main Menu
          </p>
        )}

        {/* Nav items */}
        <nav className="mt-2 flex-1 space-y-0.5 px-2">
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-blue-200 hover:bg-white/10 hover:text-white",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="flex-1">{label}</span>
                )}
                {!collapsed && badge && (
                  <Badge className="bg-red-500 px-1.5 py-0 text-[10px] text-white">
                    {badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: user + actions */}
        <div className="border-t border-white/10 p-3">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-xs text-white">TA</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">Dr. T. Adelae</p>
                  <p className="truncate text-xs text-blue-300">Administrator</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle className="h-8 w-8 text-blue-200 hover:bg-white/10 hover:text-white" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start gap-2 text-xs text-blue-200 hover:bg-white/10 hover:text-white"
                >
                  <LogOut size={13} />
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-blue-600 text-[10px] text-white">TA</AvatarFallback>
              </Avatar>
              <ThemeToggle className="h-7 w-7 text-blue-200 hover:bg-white/10 hover:text-white" />
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Admin Portal
            </p>
            <span className="hidden text-slate-300 dark:text-slate-600 md:block">·</span>
            <p className="hidden text-xs text-slate-400 md:block dark:text-slate-500">
              Ajayi Crowther University
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
