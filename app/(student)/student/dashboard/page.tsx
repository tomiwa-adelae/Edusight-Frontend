"use client"

import React, { useEffect, useState } from "react"
import {
  AlertTriangle,
  BookOpen,
  Clock,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Minus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import Link from "next/link"
import { useAuth } from "@/store/useAuth"
import api from "@/lib/api"

interface StudentProfile {
  id: string
  matricNumber: string
  level: string
  currentCgpa: number
  isAtRisk: boolean
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  user: { firstName: string; lastName: string; email: string; image?: string }
  department: { name: string; code: string }
  cgpaRecords: {
    id: string
    academicSession: string
    semester: string
    level: string
    semesterGpa: number
    cumulativeCgpa: number
  }[]
  predictions: {
    id: string
    riskLevel: string
    predictedClass: string
    probability: number
    featureContrib: Record<string, number>
    createdAt: string
  }[]
  socioeconomicData: { id: string } | null
  studyBehavior: { id: string } | null
}

const LEVEL_LABELS: Record<string, string> = {
  L100: "100",
  L200: "200",
  L300: "300",
  L400: "400",
  L500: "500",
}

const SEM_LABELS: Record<string, string> = {
  FIRST: "1st",
  SECOND: "2nd",
}

const riskColors: Record<string, { banner: string; badge: string; text: string }> = {
  HIGH: {
    banner: "from-red-600 to-rose-700",
    badge: "bg-white/20 text-white border-white/30",
    text: "text-red-200",
  },
  MEDIUM: {
    banner: "from-amber-500 to-orange-600",
    badge: "bg-white/20 text-white border-white/30",
    text: "text-amber-100",
  },
  LOW: {
    banner: "from-emerald-600 to-teal-700",
    badge: "bg-white/20 text-white border-white/30",
    text: "text-emerald-100",
  },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning,"
  if (h < 17) return "Good afternoon,"
  return "Good evening,"
}

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get<StudentProfile>("/students/me")
      .then((res) => setProfile(res.data))
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [])

  // Build chart data from cgpa records
  const chartData = (profile?.cgpaRecords ?? []).map((r) => ({
    semester: `${LEVEL_LABELS[r.level] ?? r.level}L / ${SEM_LABELS[r.semester] ?? r.semester}`,
    gpa: r.semesterGpa,
    cgpa: r.cumulativeCgpa,
  }))

  const latestPrediction = profile?.predictions?.[0] ?? null
  const questionnaireComplete =
    !!profile?.socioeconomicData && !!profile?.studyBehavior

  const risk = profile?.riskLevel ?? "LOW"
  const colors = riskColors[risk]

  const cgpaTrend = chartData.length >= 2
    ? chartData[chartData.length - 1].gpa - chartData[chartData.length - 2].gpa
    : null

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          Student profile not found
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Complete your onboarding to set up your profile.
        </p>
        <Link href="/onboarding">
          <Button className="mt-4">Go to Onboarding</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome + Risk banner */}
      <div className={`rounded-2xl bg-gradient-to-br ${colors.banner} p-6 text-white shadow-lg`}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm font-medium ${colors.text}`}>{getGreeting()}</p>
            <h1 className="text-2xl font-bold">
              {profile.user.firstName} {profile.user.lastName}
            </h1>
            <p className={`mt-1 text-sm ${colors.text}`}>
              {profile.matricNumber} · {profile.department.name} · {LEVEL_LABELS[profile.level] ?? profile.level} Level
            </p>
          </div>
          <Badge className={`${colors.badge} backdrop-blur-sm`}>
            <AlertTriangle className="mr-1.5 h-3 w-3" />
            {risk.charAt(0) + risk.slice(1).toLowerCase()} Risk
          </Badge>
        </div>

        {latestPrediction ? (
          <div className="mt-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm font-medium text-white">
              EduSight flagged your profile as <strong>{risk.toLowerCase()} risk</strong> with{" "}
              {(latestPrediction.probability * 100).toFixed(1)}% confidence.
              {risk !== "LOW" && " Early action can change this outcome."}
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm font-medium text-white">
              No prediction has been run yet. Your academic adviser will run an analysis soon.
            </p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Current CGPA",
            value: profile.currentCgpa > 0 ? profile.currentCgpa.toFixed(2) : "—",
            icon: BookOpen,
            bad: profile.currentCgpa > 0 && profile.currentCgpa < 2.5,
          },
          {
            label: "Risk Level",
            value: risk.charAt(0) + risk.slice(1).toLowerCase(),
            icon: AlertTriangle,
            bad: risk !== "LOW",
          },
          {
            label: "Predicted Status",
            value: latestPrediction
              ? latestPrediction.predictedClass === "PASS"
                ? "Pass"
                : latestPrediction.predictedClass === "AT_RISK"
                ? "At Risk"
                : "Fail"
              : "No data",
            icon: latestPrediction?.predictedClass === "PASS" ? CheckCircle2 : AlertTriangle,
            bad: latestPrediction ? latestPrediction.predictedClass !== "PASS" : false,
          },
          {
            label: "Questionnaire",
            value: questionnaireComplete ? "Complete" : "Incomplete",
            icon: questionnaireComplete ? CheckCircle2 : XCircle,
            bad: !questionnaireComplete,
          },
        ].map(({ label, value, icon: Icon, bad }) => (
          <Card key={label} className="dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="pt-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <div className="flex items-end justify-between">
                <p className={`text-xl font-bold ${bad ? "text-red-600" : "text-emerald-600"}`}>
                  {value}
                </p>
                <Icon className={`h-4 w-4 ${bad ? "text-red-400" : "text-emerald-400"}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prediction Detail Card */}
      {latestPrediction && (
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">Your EduSight Prediction</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Last analysed {new Date(latestPrediction.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Predicted Outcome",
                  value: latestPrediction.predictedClass === "PASS" ? "Pass"
                    : latestPrediction.predictedClass === "AT_RISK" ? "At Risk" : "Fail",
                  color: latestPrediction.predictedClass === "PASS" ? "text-emerald-600" : "text-red-600",
                },
                {
                  label: "Risk Level",
                  value: risk.charAt(0) + risk.slice(1).toLowerCase(),
                  color: risk === "LOW" ? "text-emerald-600" : risk === "MEDIUM" ? "text-amber-600" : "text-red-600",
                },
                {
                  label: "Model Confidence",
                  value: `${(latestPrediction.probability * 100).toFixed(1)}%`,
                  color: "text-blue-600",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Confidence bar */}
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Prediction confidence</span>
                <span>{(latestPrediction.probability * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    latestPrediction.predictedClass === "PASS" ? "bg-emerald-500"
                    : latestPrediction.predictedClass === "AT_RISK" ? "bg-amber-500"
                    : "bg-red-500"
                  }`}
                  style={{ width: `${(latestPrediction.probability * 100).toFixed(1)}%` }}
                />
              </div>
            </div>

            {/* Feature contributions — global model weights shown as top factors */}
            {Object.keys(latestPrediction.featureContrib ?? {}).length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                  Top factors the model weighs
                </p>
                <div className="space-y-1.5">
                  {Object.entries(latestPrediction.featureContrib as Record<string, number>)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([key, val]) => {
                      const FEAT_LABELS: Record<string, string> = {
                        current_cgpa: "Current CGPA", avg_attendance_rate: "Attendance Rate",
                        cgpa_trend: "CGPA Trend", study_hours_per_week: "Study Hours/Week",
                        family_income_range: "Family Income", father_education: "Father's Education",
                        mother_education: "Mother's Education", academic_self_confidence: "Self-Confidence",
                        library_visit_frequency: "Library Usage", study_group_participation: "Study Groups",
                        adviser_consultation_freq: "Adviser Consult.", part_time_work: "Part-Time Work",
                        internet_access: "Internet Access", level: "Academic Level",
                        parent_occupation: "Parent Occupation", number_of_books: "Books Owned",
                      }
                      const pct = (val * 100).toFixed(1)
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="w-36 shrink-0 text-xs text-slate-600 dark:text-slate-400">
                            {FEAT_LABELS[key] ?? key}
                          </span>
                          <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${Math.min(parseFloat(pct) * 2.5, 100)}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs text-slate-500">{pct}%</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* CGPA Trend */}
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">Your CGPA Trend</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Semester GPA across your academic history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex h-50 items-center justify-center text-sm text-slate-400">
                No academic records yet
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="semester" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="gpa"
                      name="Semester GPA"
                      stroke={risk === "HIGH" ? "#ef4444" : risk === "MEDIUM" ? "#f59e0b" : "#22c55e"}
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                {cgpaTrend !== null && (
                  <p className={`mt-2 flex items-center gap-1.5 text-xs ${cgpaTrend < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {cgpaTrend < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    {cgpaTrend < 0
                      ? `GPA dropped by ${Math.abs(cgpaTrend).toFixed(2)} from last semester`
                      : `GPA improved by ${cgpaTrend.toFixed(2)} from last semester`}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Academic snapshot */}
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">Academic Snapshot</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Your current academic standing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "Department",
                value: `${profile.department.name} (${profile.department.code})`,
                bad: false,
              },
              {
                label: "Current Level",
                value: `${LEVEL_LABELS[profile.level] ?? profile.level} Level`,
                bad: false,
              },
              {
                label: "Cumulative CGPA",
                value: profile.currentCgpa > 0 ? profile.currentCgpa.toFixed(2) : "Not recorded",
                bad: profile.currentCgpa > 0 && profile.currentCgpa < 2.5,
              },
              {
                label: "Semesters Recorded",
                value: profile.cgpaRecords.length > 0 ? `${profile.cgpaRecords.length} semester${profile.cgpaRecords.length !== 1 ? "s" : ""}` : "None yet",
                bad: false,
              },
              {
                label: "Questionnaire Status",
                value: questionnaireComplete ? "Submitted" : "Not submitted",
                bad: !questionnaireComplete,
              },
            ].map(({ label, value, bad }) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
                <span className={`text-sm font-semibold ${bad ? "text-red-600" : "text-slate-800 dark:text-slate-100"}`}>
                  {value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <CardHeader>
          <CardTitle className="text-base text-emerald-800 dark:text-emerald-300">
            Recommended Actions
          </CardTitle>
          <CardDescription className="text-emerald-700 dark:text-emerald-400">
            Steps to improve your academic standing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {[
              !questionnaireComplete && "Complete your questionnaire so the model can generate accurate predictions for you.",
              profile.currentCgpa > 0 && profile.currentCgpa < 2.5 && "Your CGPA is below 2.5 — visit your academic adviser for a counselling session.",
              risk !== "LOW" && "Aim for at least 80% attendance in all your courses this semester.",
              risk !== "LOW" && "Join a peer study group for your most challenging courses.",
              !questionnaireComplete || risk !== "LOW" ? "Dedicate a minimum of 3 hours per course per week to personal study." : "Keep up the great work — maintain your study habits and attendance.",
            ]
              .filter(Boolean)
              .slice(0, 4)
              .map((rec, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">{rec as string}</p>
                </li>
              ))}
          </ul>
          {!questionnaireComplete && (
            <Link href="/student/questionnaire">
              <Button className="mt-4 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                Fill Questionnaire
                <ArrowRight size={13} />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
