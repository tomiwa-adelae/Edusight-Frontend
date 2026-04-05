"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Logo } from "@/components/Logo"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Logo type="black" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Academic Early Warning System
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="dark:text-white">Reset Password</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Enter your institutional email and we'll send a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-10" placeholder="p.adeleke@acu.edu.ng" type="email" />
              </div>
            </div>

            <Button className="w-full">Send Reset Link</Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </CardContent>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck size={16} />
          <p className="text-xs font-medium uppercase">
            Nigeria Data Protection Act (2023) Compliant
          </p>
        </div>
      </div>
    </div>
  )
}
