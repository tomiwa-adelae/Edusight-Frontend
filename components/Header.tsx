"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"
import { Logo } from "./Logo"
import { homeNavLinks } from "@/constants/nav-links"
import { useAuth } from "@/store/useAuth"
import { UserDropdown } from "./UserDropdown"
import { MobileNavbar } from "./MobileNavbar"
import { cn } from "@/lib/utils"
import { IconLock } from "@tabler/icons-react"

export const Header = () => {
  const pathname = usePathname()
  const { user, _hasHydrated } = useAuth()

  const isActive = (slug: string) =>
    pathname === slug || pathname.startsWith(`${slug}/`)

  return (
    <header className="fixed top-0 z-50 w-full overflow-hidden border-b border-white/10 bg-black">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent" />

      <div className="container mx-auto flex h-20 items-center justify-between">
        {/* Logo — already a Link internally, no outer Link needed */}
        <Logo type="white" />

        <nav className="hidden items-center gap-1 text-sm font-medium text-white lg:flex">
          {homeNavLinks.map(({ slug, label, comingSoon }, index) =>
            comingSoon ? (
              <span
                key={index}
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-white/40"
              >
                <IconLock size={13} />
                {label}
              </span>
            ) : (
              <Link
                key={index}
                href={slug}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-white/10",
                  isActive(slug)
                    ? "bg-white/20 font-semibold text-white"
                    : "text-white/80"
                )}
              >
                {label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center space-x-1">
          {_hasHydrated && user ? (
            <UserDropdown />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-md px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 md:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
              >
                Get Started
              </Link>
            </>
          )}
          <MobileNavbar />
        </div>
      </div>
    </header>
  )
}
