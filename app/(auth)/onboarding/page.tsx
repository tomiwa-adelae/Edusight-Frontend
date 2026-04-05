"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { BookOpen, GraduationCap, Hash, CalendarDays, TrendingUp, Clock } from "lucide-react"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/store/useAuth"
import api from "@/lib/api"

interface Department {
  id: string
  name: string
  code: string
}

const OnboardingSchema = z.object({
  matricNumber: z.string().min(3, "Enter a valid matric number").max(30),
  departmentId: z.string().min(1, "Select your department"),
  level: z.enum(["L100", "L200", "L300", "L400", "L500"], {
    required_error: "Select your current level",
  }),
  admissionYear: z
    .string()
    .regex(/^\d{4}$/, "Enter a 4-digit year, e.g. 2021"),
  currentCgpa: z
    .string()
    .regex(/^\d(\.\d{1,2})?$/, "Enter a valid CGPA, e.g. 3.45")
    .refine((v) => parseFloat(v) >= 0 && parseFloat(v) <= 5.0, "CGPA must be between 0.00 and 5.00"),
  avgAttendanceRate: z
    .string()
    .regex(/^\d{1,3}(\.\d)?$/, "Enter a number between 0 and 100")
    .refine((v) => parseFloat(v) >= 0 && parseFloat(v) <= 100, "Must be between 0 and 100"),
})
type OnboardingValues = z.infer<typeof OnboardingSchema>

const LEVEL_LABELS = [
  { value: "L100", label: "100 Level" },
  { value: "L200", label: "200 Level" },
  { value: "L300", label: "300 Level" },
  { value: "L400", label: "400 Level" },
  { value: "L500", label: "500 Level" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, setUser } = useAuth()
  const [departments, setDepartments] = useState<Department[]>([])

  // Redirect non-students or already-onboarded users
  useEffect(() => {
    if (!user) {
      router.replace("/login")
      return
    }
    if (user.role !== "STUDENT") {
      router.replace("/admin/dashboard")
      return
    }
    if (user.onboardingCompleted) {
      router.replace("/student/dashboard")
    }
  }, [user, router])

  // Fetch departments
  useEffect(() => {
    api.get<Department[]>("/admin/departments")
      .then((res) => setDepartments(res.data))
      .catch(() => toast.error("Could not load departments"))
  }, [])

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      matricNumber: "",
      departmentId: "",
      admissionYear: "",
      currentCgpa: "",
      avgAttendanceRate: "",
    },
  })

  async function onSubmit(values: OnboardingValues) {
    try {
      await api.post("/students/onboarding", values)
      // Mark onboarding done in local store
      if (user) setUser({ ...user, onboardingCompleted: true })
      toast.success("Profile set up! Welcome to EduSight.")
      router.push("/student/dashboard")
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? "Could not complete setup. Try again."
      toast.error(message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Logo type="black" />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Let's set up your student profile
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="dark:text-white">Complete Your Profile</CardTitle>
            <CardDescription className="dark:text-slate-400">
              We need a few academic details to get you started, {user?.firstName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Matric Number */}
                <FormField
                  control={form.control}
                  name="matricNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matric Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            className="pl-10 dark:border-slate-700 dark:bg-slate-800"
                            placeholder="e.g. CSC/21/0042"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Department */}
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                            <BookOpen className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No departments found
                            </SelectItem>
                          ) : (
                            departments.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name} ({d.code})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Level + Admission Year side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                              <GraduationCap className="mr-2 h-4 w-4 text-slate-400" />
                              <SelectValue placeholder="Level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LEVEL_LABELS.map((l) => (
                              <SelectItem key={l.value} value={l.value}>
                                {l.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="admissionYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Year</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CalendarDays className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                              className="pl-10 dark:border-slate-700 dark:bg-slate-800"
                              placeholder="2021"
                              maxLength={4}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* CGPA + Attendance side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="currentCgpa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current CGPA</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <TrendingUp className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                              className="pl-10 dark:border-slate-700 dark:bg-slate-800"
                              placeholder="e.g. 3.45"
                              inputMode="decimal"
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
                    name="avgAttendanceRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avg. Attendance (%)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                              className="pl-10 dark:border-slate-700 dark:bg-slate-800"
                              placeholder="e.g. 75"
                              inputMode="decimal"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Your CGPA is on the 5-point scale. Attendance is your average across all courses.
                  These are used for your initial performance prediction.
                </p>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting || departments.length === 0}
                >
                  {form.formState.isSubmitting ? "Saving…" : "Continue to Dashboard"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
