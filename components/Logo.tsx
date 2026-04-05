import { cn } from "@/lib/utils"
import { IconSchool } from "@tabler/icons-react"
import { Playfair_Display } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import React from "react"

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
})

export const Logo = ({
  type = "white",
  size = "h-12 md:h-16",
}: {
  type?: "white" | "black"
  size?: string
}) => {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center space-x-2",
        type === "white" ? "text-white" : "text-black"
      )}
    >
      <IconSchool />
      <h3 className="text-base font-semibold uppercase">EduSight</h3>
    </Link>
  )
}
