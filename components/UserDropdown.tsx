"use client"

import { ChevronDownIcon, LogOutIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSignout } from "@/hooks/use-signout"
import {
  IconLayoutDashboard,
  IconUser,
  IconShieldFilled,
} from "@tabler/icons-react"
import Link from "next/link"
import { useAuth } from "@/store/useAuth"

export function UserDropdown() {
  const { user } = useAuth()
  const handleSignout = useSignout()

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "ES"

  const dashboardHref =
    user?.role === "STUDENT" ? "/student/dashboard" : "/admin/dashboard"

  return (
    <DropdownMenu>
      {/* asChild passes the trigger behaviour into the inner element,
          avoiding a <button> inside a <button> */}
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-white/10">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.image ?? undefined}
              alt={`${user?.firstName ?? "User"} avatar`}
              className="size-full object-cover"
            />
            <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-white md:block">
            {user?.firstName}
          </span>
          <ChevronDownIcon size={14} className="text-white/60" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-52">
        <div className="flex min-w-0 flex-col px-1.5 py-1">
          <span className="truncate text-sm font-medium text-foreground">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user?.email}
          </span>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={dashboardHref} className="flex items-center gap-2">
              <IconLayoutDashboard size={15} className="opacity-60" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={user?.role === "STUDENT" ? "/student/profile" : "/admin/settings"}
              className="flex items-center gap-2"
            >
              <IconUser size={15} className="opacity-60" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {(user?.role === "ADMIN" || user?.role === "LECTURER") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                  <IconShieldFilled size={15} className="opacity-60" />
                  <span>Admin Portal</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignout}
          className="flex items-center gap-2 text-red-600 focus:text-red-600 dark:text-red-400"
        >
          <LogOutIcon size={15} className="opacity-60" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
