"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Mail, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoginSchema, LoginSchemaType } from "@/lib/zodSchemas"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/store/useAuth"
import api from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuth()

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginSchemaType) {
    try {
      const { data } = await api.post("/auth/login", values)
      setUser(data.user)

      // Redirect based on role — send students without a profile to onboarding
      if (data.user.role === "STUDENT") {
        router.push(data.user.onboardingCompleted ? "/student/dashboard" : "/onboarding")
      } else {
        router.push("/admin/dashboard")
      }

      toast.success(data.message ?? "Welcome back!")
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? "Invalid email or password"
      toast.error(message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* Branding Header */}
        <div className="mb-8 flex flex-col items-center">
          <Logo type="black" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Academic Early Warning System
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="dark:text-white">Welcome Back</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Enter your credentials to access the analytics portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            className="pl-10 dark:border-slate-700 dark:bg-slate-800"
                            placeholder="t.adelae@acu.edu.ng"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            className="pl-10 dark:border-slate-700 dark:bg-slate-800"
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Signing in…" : "Sign In"}
                </Button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-blue-700 hover:underline dark:text-blue-400"
                  >
                    Register
                  </Link>
                </p>
              </form>
            </Form>
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
