"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import api from "@/lib/api"

// ── Label maps (matching backend enums) ──────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = {
  L100: "100",
  L200: "200",
  L300: "300",
  L400: "400",
  L500: "500",
}
const SEM_LABELS: Record<string, string> = { FIRST: "1st", SECOND: "2nd" }
const ALGO_LABELS: Record<string, string> = {
  RANDOM_FOREST: "Random Forest",
  XGBOOST: "XGBoost",
  LOGISTIC_REGRESSION: "Logistic Regression",
  DECISION_TREE: "Decision Tree",
  SVM: "SVM",
}

const SOCIO_LABELS: Record<string, Record<string, string>> = {
  familyIncomeRange: {
    BELOW_50K: "Below ₦50,000",
    BETWEEN_50K_100K: "₦50k – ₦100k",
    BETWEEN_100K_250K: "₦100k – ₦250k",
    BETWEEN_250K_500K: "₦250k – ₦500k",
    ABOVE_500K: "Above ₦500,000",
  },
  educationLevel: {
    NO_FORMAL: "No formal education",
    PRIMARY: "Primary School",
    SECONDARY: "Secondary School",
    OND_NCE: "OND / NCE",
    BACHELORS: "Bachelor's Degree",
    POSTGRADUATE: "Postgraduate",
  },
  parentOccupation: {
    CIVIL_SERVANT: "Civil Servant",
    PRIVATE_SECTOR: "Private Sector",
    SELF_EMPLOYED: "Self-Employed",
    FARMER_ARTISAN: "Farmer / Artisan",
    PROFESSIONAL: "Professional",
    UNEMPLOYED_RETIRED: "Unemployed / Retired",
  },
  internetAccess: {
    RELIABLE: "Yes, reliable",
    LIMITED: "Limited / unstable",
    NONE: "No",
  },
  partTimeWork: {
    NO: "No",
    WEEKENDS_ONLY: "Weekends only",
    WEEKDAY_EVENINGS: "Weekday evenings",
    SIGNIFICANT_HOURS: "Significant hours",
  },
  bookCount: {
    NONE: "None",
    ONE_TO_FIVE: "1 – 5",
    SIX_TO_TEN: "6 – 10",
    ELEVEN_TO_TWENTY: "11 – 20",
    ABOVE_TWENTY: "20+",
  },
  studyHours: {
    ZERO_TO_TWO: "0 – 2 hrs/week",
    THREE_TO_FIVE: "3 – 5 hrs/week",
    SIX_TO_TEN: "6 – 10 hrs/week",
    ELEVEN_TO_FIFTEEN: "11 – 15 hrs/week",
    ABOVE_FIFTEEN: "> 15 hrs/week",
  },
  visitFrequency: {
    NEVER: "Never",
    RARELY: "Rarely",
    SOMETIMES: "Sometimes",
    OFTEN: "Often",
    REGULARLY: "Regularly",
  },
  adviserConsultation: {
    NEVER: "Never",
    ONCE_PER_SEMESTER: "Once/semester",
    TWO_TO_THREE_PER_SEMESTER: "2–3×/semester",
    REGULARLY: "Regularly",
  },
}

function lbl(map: Record<string, string>, val?: string | null) {
  if (!val) return "—"
  return map[val] ?? val
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Student {
  id: string
  matricNumber: string
  level: string
  admissionYear: string
  currentCgpa: number
  isAtRisk: boolean
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  user: {
    firstName: string
    lastName: string
    email: string
    image?: string
    phoneNumber?: string
    gender?: string
  }
  department: { name: string; code: string; faculty: string }
  cgpaRecords: {
    id: string
    academicSession: string
    semester: string
    level: string
    semesterGpa: number
    cumulativeCgpa: number
  }[]
  scores: {
    id: string
    academicSession: string
    semester: string
    caScore: number
    examScore: number
    totalScore: number
    grade: string
    gradePoint: number
    course: { code: string; title: string; creditUnits: number }
  }[]
  attendanceRecords: {
    id: string
    academicSession: string
    semester: string
    totalClasses: number
    attendedClasses: number
    attendanceRate: number
    course: { code: string; title: string }
  }[]
  predictions: {
    id: string
    algorithm: string
    predictedClass: string
    riskLevel: string
    probability: number
    createdAt: string
  }[]
  socioeconomicData: {
    familyIncomeRange: string
    fatherEducation: string
    motherEducation: string
    parentOccupation: string
    internetAccess: string
    partTimeWork: string
    numberOfBooks: string
  } | null
  studyBehavior: {
    studyHoursPerWeek: string
    libraryVisitFrequency: string
    studyGroupParticipation: string
    academicSelfConfidence: number
    adviserConsultationFreq: string
  } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function riskBadge(risk: string) {
  if (risk === "HIGH")
    return (
      <Badge className="bg-red-100 px-3 py-1 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
        High Risk
      </Badge>
    )
  if (risk === "MEDIUM")
    return (
      <Badge className="bg-amber-100 px-3 py-1 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        Medium Risk
      </Badge>
    )
  return (
    <Badge className="bg-emerald-100 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      Low Risk
    </Badge>
  )
}

function predClassBadge(cls: string) {
  if (cls === "FAIL")
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        Fail
      </Badge>
    )
  if (cls === "AT_RISK")
    return (
      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        At Risk
      </Badge>
    )
  return (
    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      Pass
    </Badge>
  )
}

function gradeBadge(grade: string) {
  const bad = ["F", "E"].includes(grade)
  const mid = grade === "D"
  return (
    <Badge
      className={
        bad
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : mid
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      }
    >
      {grade}
    </Badge>
  )
}

function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase()
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    api
      .get<Student>(`/students/${id}`)
      .then((res) => setStudent(res.data))
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (notFound || !student) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          Student not found
        </p>
        <Link href="/admin/students">
          <Button variant="outline" className="mt-4">
            Back to Students
          </Button>
        </Link>
      </div>
    )
  }

  const chartData = student.cgpaRecords.map((r) => ({
    semester: `${LEVEL_LABELS[r.level] ?? r.level}L/${SEM_LABELS[r.semester] ?? r.semester}`,
    gpa: r.semesterGpa,
    cgpa: r.cumulativeCgpa,
  }))

  const cgpaTrend =
    chartData.length >= 2
      ? chartData[chartData.length - 1].gpa -
        chartData[chartData.length - 2].gpa
      : null

  const latestPrediction = student.predictions[0] ?? null

  // Average attendance across all records
  const avgAttendance =
    student.attendanceRecords.length > 0
      ? student.attendanceRecords.reduce((s, r) => s + r.attendanceRate, 0) /
        student.attendanceRecords.length
      : null

  return (
    <div className="space-y-6">
      <Link href="/admin/students">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-slate-500 dark:text-slate-400"
        >
          <ArrowLeft size={14} />
          Back to Students
        </Button>
      </Link>

      {/* Student header */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-400">
          {initials(student.user.firstName, student.user.lastName)}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {student.user.firstName} {student.user.lastName}
            </h1>
            {riskBadge(student.riskLevel)}
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {student.matricNumber} · {student.department.name} ·{" "}
            {LEVEL_LABELS[student.level] ?? student.level} Level
            {student.user.gender
              ? ` · ${student.user.gender.charAt(0) + student.user.gender.slice(1).toLowerCase()}`
              : ""}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {student.user.email}
            {student.user.phoneNumber ? ` · ${student.user.phoneNumber}` : ""}
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Current CGPA",
            value:
              student.currentCgpa > 0 ? student.currentCgpa.toFixed(2) : "—",
            sub:
              cgpaTrend !== null
                ? cgpaTrend < 0
                  ? "Falling"
                  : "Rising"
                : "No trend data",
            bad: student.currentCgpa > 0 && student.currentCgpa < 2.5,
          },
          {
            label: "Avg Attendance",
            value:
              avgAttendance !== null ? `${avgAttendance.toFixed(0)}%` : "—",
            sub:
              avgAttendance !== null && avgAttendance < 70
                ? "Below 70% threshold"
                : "On track",
            bad: avgAttendance !== null && avgAttendance < 70,
          },
          {
            label: "Risk Level",
            value:
              student.riskLevel.charAt(0) +
              student.riskLevel.slice(1).toLowerCase(),
            sub: latestPrediction
              ? `${(latestPrediction.probability * 100).toFixed(1)}% confidence`
              : "No prediction yet",
            bad: student.riskLevel !== "LOW",
          },
          {
            label: "Courses Recorded",
            value:
              student.scores.length > 0 ? String(student.scores.length) : "—",
            sub:
              student.cgpaRecords.length > 0
                ? `${student.cgpaRecords.length} semester${student.cgpaRecords.length !== 1 ? "s" : ""}`
                : "No records",
            bad: false,
          },
        ].map(({ label, value, sub, bad }) => (
          <Card key={label} className="dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="pt-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {label}
              </p>
              <p
                className={`text-2xl font-bold ${bad ? "text-red-600" : "text-slate-900 dark:text-white"}`}
              >
                {value}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="dark:bg-slate-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic Record</TabsTrigger>
          <TabsTrigger value="socioeconomic">Socioeconomic</TabsTrigger>
          <TabsTrigger value="history">Prediction History</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-sm dark:text-white">
                  CGPA Trend
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Semester GPA across academic history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <div className="flex h-45 items-center justify-center text-sm text-slate-400">
                    No CGPA records yet
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="semester" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="gpa"
                          name="Semester GPA"
                          stroke={
                            student.riskLevel === "HIGH"
                              ? "#ef4444"
                              : student.riskLevel === "MEDIUM"
                                ? "#f59e0b"
                                : "#22c55e"
                          }
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    {cgpaTrend !== null && (
                      <p
                        className={`mt-2 flex items-center gap-1.5 text-xs ${cgpaTrend < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
                      >
                        {cgpaTrend < 0 ? (
                          <TrendingDown size={12} />
                        ) : (
                          <TrendingUp size={12} />
                        )}
                        {cgpaTrend < 0
                          ? `GPA dropped by ${Math.abs(cgpaTrend).toFixed(2)} from last semester`
                          : `GPA improved by ${cgpaTrend.toFixed(2)} from last semester`}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-sm dark:text-white">
                  Student Profile
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Personal and academic details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Department", value: student.department.name },
                  { label: "Faculty", value: student.department.faculty },
                  {
                    label: "Level",
                    value: `${LEVEL_LABELS[student.level] ?? student.level} Level`,
                  },
                  { label: "Admission Year", value: student.admissionYear },
                  { label: "Matric Number", value: student.matricNumber },
                  { label: "Email", value: student.user.email },
                  { label: "Phone", value: student.user.phoneNumber ?? "—" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-slate-100 py-1 last:border-0 dark:border-slate-800"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {value}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {student.isAtRisk && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      Recommended Actions
                    </p>
                    <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-amber-700 dark:text-amber-400">
                      <li>
                        Schedule academic counselling session within 7 days
                      </li>
                      <li>Notify department head and course advisers</li>
                      {avgAttendance !== null && avgAttendance < 70 && (
                        <li>
                          Monitor attendance — currently{" "}
                          {avgAttendance.toFixed(0)}% (below 70% threshold)
                        </li>
                      )}
                      <li>Follow up on questionnaire data completeness</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Academic Record ── */}
        <TabsContent value="academic" className="mt-4 space-y-4">
          {/* CGPA Records */}
          {student.cgpaRecords.length > 0 && (
            <Card className="dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-sm dark:text-white">
                  CGPA History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-slate-800">
                      <TableHead className="pl-6 dark:text-slate-400">
                        Session
                      </TableHead>
                      <TableHead className="dark:text-slate-400">
                        Semester
                      </TableHead>
                      <TableHead className="dark:text-slate-400">
                        Level
                      </TableHead>
                      <TableHead className="dark:text-slate-400">
                        Semester GPA
                      </TableHead>
                      <TableHead className="pr-6 dark:text-slate-400">
                        Cumulative CGPA
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.cgpaRecords.map((r) => (
                      <TableRow key={r.id} className="dark:border-slate-800">
                        <TableCell className="pl-6 text-sm dark:text-slate-300">
                          {r.academicSession}
                        </TableCell>
                        <TableCell className="text-sm dark:text-slate-300">
                          {SEM_LABELS[r.semester] ?? r.semester}
                        </TableCell>
                        <TableCell className="text-sm dark:text-slate-300">
                          {LEVEL_LABELS[r.level] ?? r.level}L
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm font-semibold ${r.semesterGpa < 2.0 ? "text-red-600" : r.semesterGpa < 2.5 ? "text-amber-600" : "text-emerald-600"}`}
                          >
                            {r.semesterGpa.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6">
                          <span
                            className={`text-sm font-semibold ${r.cumulativeCgpa < 2.0 ? "text-red-600" : r.cumulativeCgpa < 2.5 ? "text-amber-600" : "text-emerald-600"}`}
                          >
                            {r.cumulativeCgpa.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Course Scores */}
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-sm dark:text-white">
                Course Scores
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                {student.scores.length > 0
                  ? `${student.scores.length} course records`
                  : "No scores recorded yet"}
              </CardDescription>
            </CardHeader>
            {student.scores.length > 0 && (
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-slate-800">
                      <TableHead className="pl-6 dark:text-slate-400">
                        Course
                      </TableHead>
                      <TableHead className="dark:text-slate-400">
                        Session
                      </TableHead>
                      <TableHead className="dark:text-slate-400">CA</TableHead>
                      <TableHead className="dark:text-slate-400">
                        Exam
                      </TableHead>
                      <TableHead className="dark:text-slate-400">
                        Total
                      </TableHead>
                      <TableHead className="pr-6 dark:text-slate-400">
                        Grade
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.scores.map((s) => (
                      <TableRow key={s.id} className="dark:border-slate-800">
                        <TableCell className="pl-6">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {s.course.code}
                          </p>
                          <p className="text-sm dark:text-slate-300">
                            {s.course.title}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                          {s.academicSession} ·{" "}
                          {SEM_LABELS[s.semester] ?? s.semester}
                        </TableCell>
                        <TableCell className="text-sm dark:text-slate-300">
                          {s.caScore}
                        </TableCell>
                        <TableCell className="text-sm dark:text-slate-300">
                          {s.examScore}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm font-semibold ${s.totalScore < 45 ? "text-red-600" : s.totalScore < 50 ? "text-amber-600" : "text-slate-700 dark:text-slate-300"}`}
                          >
                            {s.totalScore}/100
                          </span>
                        </TableCell>
                        <TableCell className="pr-6">
                          {gradeBadge(s.grade)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>

          {/* Attendance */}
          {student.attendanceRecords.length > 0 && (
            <Card className="dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-sm dark:text-white">
                  Attendance Records
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-slate-800">
                      <TableHead className="pl-6 dark:text-slate-400">
                        Course
                      </TableHead>
                      <TableHead className="dark:text-slate-400">
                        Session
                      </TableHead>
                      <TableHead className="dark:text-slate-400">
                        Attended
                      </TableHead>
                      <TableHead className="pr-6 dark:text-slate-400">
                        Rate
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.attendanceRecords.map((a) => (
                      <TableRow key={a.id} className="dark:border-slate-800">
                        <TableCell className="pl-6">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {a.course.code}
                          </p>
                          <p className="text-sm dark:text-slate-300">
                            {a.course.title}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                          {a.academicSession} ·{" "}
                          {SEM_LABELS[a.semester] ?? a.semester}
                        </TableCell>
                        <TableCell className="text-sm dark:text-slate-300">
                          {a.attendedClasses}/{a.totalClasses}
                        </TableCell>
                        <TableCell className="pr-6">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={a.attendanceRate}
                              className="h-1.5 w-20"
                            />
                            <span
                              className={`text-sm font-semibold ${a.attendanceRate < 70 ? "text-red-600" : "text-emerald-600"}`}
                            >
                              {a.attendanceRate.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Socioeconomic ── */}
        <TabsContent value="socioeconomic" className="mt-4">
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-sm dark:text-white">
                Socioeconomic & Study Profile
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Data collected via student questionnaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!student.socioeconomicData && !student.studyBehavior ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  This student has not submitted the questionnaire yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {student.socioeconomicData &&
                    [
                      {
                        label: "Family Income",
                        value: lbl(
                          SOCIO_LABELS.familyIncomeRange,
                          student.socioeconomicData.familyIncomeRange
                        ),
                      },
                      {
                        label: "Father's Education",
                        value: lbl(
                          SOCIO_LABELS.educationLevel,
                          student.socioeconomicData.fatherEducation
                        ),
                      },
                      {
                        label: "Mother's Education",
                        value: lbl(
                          SOCIO_LABELS.educationLevel,
                          student.socioeconomicData.motherEducation
                        ),
                      },
                      {
                        label: "Parent Occupation",
                        value: lbl(
                          SOCIO_LABELS.parentOccupation,
                          student.socioeconomicData.parentOccupation
                        ),
                      },
                      {
                        label: "Internet Access",
                        value: lbl(
                          SOCIO_LABELS.internetAccess,
                          student.socioeconomicData.internetAccess
                        ),
                      },
                      {
                        label: "Part-Time Work",
                        value: lbl(
                          SOCIO_LABELS.partTimeWork,
                          student.socioeconomicData.partTimeWork
                        ),
                      },
                      {
                        label: "Books Owned",
                        value: lbl(
                          SOCIO_LABELS.bookCount,
                          student.socioeconomicData.numberOfBooks
                        ),
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-lg border border-slate-100 p-3 dark:border-slate-800"
                      >
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {label}
                        </p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {value}
                        </p>
                      </div>
                    ))}
                  {student.studyBehavior &&
                    [
                      {
                        label: "Study Hours/Week",
                        value: lbl(
                          SOCIO_LABELS.studyHours,
                          student.studyBehavior.studyHoursPerWeek
                        ),
                      },
                      {
                        label: "Library Usage",
                        value: lbl(
                          SOCIO_LABELS.visitFrequency,
                          student.studyBehavior.libraryVisitFrequency
                        ),
                      },
                      {
                        label: "Study Groups",
                        value: lbl(
                          SOCIO_LABELS.visitFrequency,
                          student.studyBehavior.studyGroupParticipation
                        ),
                      },
                      {
                        label: "Self-Confidence",
                        value: `${student.studyBehavior.academicSelfConfidence}/5`,
                      },
                      {
                        label: "Adviser Consultation",
                        value: lbl(
                          SOCIO_LABELS.adviserConsultation,
                          student.studyBehavior.adviserConsultationFreq
                        ),
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-lg border border-slate-100 p-3 dark:border-slate-800"
                      >
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {label}
                        </p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {value}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Prediction History ── */}
        <TabsContent value="history" className="mt-4">
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-sm dark:text-white">
                Prediction History
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                {student.predictions.length > 0
                  ? `${student.predictions.length} prediction${student.predictions.length !== 1 ? "s" : ""} recorded`
                  : "No predictions run yet"}
              </CardDescription>
            </CardHeader>
            <CardContent
              className={student.predictions.length === 0 ? "pb-6" : "p-0"}
            >
              {student.predictions.length === 0 ? (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Run a prediction from the Predictions page to see results
                  here.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-slate-800">
                      <TableHead className="pl-6 dark:text-slate-400">
                        Date
                      </TableHead>
                      <TableHead className="dark:text-slate-400">
                        Algorithm
                      </TableHead>
                      <TableHead className="dark:text-slate-400">
                        Prediction
                      </TableHead>
                      <TableHead className="dark:text-slate-400">
                        Risk
                      </TableHead>
                      <TableHead className="pr-6 dark:text-slate-400">
                        Confidence
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.predictions.map((p) => (
                      <TableRow key={p.id} className="dark:border-slate-800">
                        <TableCell className="pl-6 text-sm dark:text-slate-300">
                          {new Date(p.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                          {ALGO_LABELS[p.algorithm] ?? p.algorithm}
                        </TableCell>
                        <TableCell>
                          {predClassBadge(p.predictedClass)}
                        </TableCell>
                        <TableCell>{riskBadge(p.riskLevel)}</TableCell>
                        <TableCell className="pr-6 text-sm dark:text-slate-300">
                          {(p.probability * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
