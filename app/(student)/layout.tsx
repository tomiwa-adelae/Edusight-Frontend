"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  ClipboardList,
  LogOut,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconSchool } from "@tabler/icons-react"

const navItems = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/profile", label: "My Profile", icon: User },
  {
    href: "/student/questionnaire",
    label: "Questionnaire",
    icon: ClipboardList,
  },
]

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Nav */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600">
              <IconSchool className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-wider text-slate-900 uppercase dark:text-white">
              EduSight
            </span>
          </Link>

          {/* Center nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle className="text-slate-500 dark:text-slate-400" />
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-500 dark:text-slate-400"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      AO
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-slate-700 sm:block dark:text-slate-300">
                    Adebayo O.
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-slate-500">
                  CSC/19/0012
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/student/profile" className="gap-2">
                    <User size={13} /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-red-600 dark:text-red-400">
                  <LogOut size={13} /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
