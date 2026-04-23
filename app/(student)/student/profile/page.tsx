"use client"

import React, { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import api from "@/lib/api"

interface Score {
  id: string
  academicSession: string
  semester: string
  caScore: number
  examScore: number
  totalScore: number
  grade: string
  gradePoint: number
  course: { code: string; title: string; creditUnits: number }
}

interface CgpaRecord {
  id: string
  academicSession: string
  semester: string
  level: string
  semesterGpa: number
  cumulativeCgpa: number
}

interface StudentProfile {
  id: string
  matricNumber: string
  level: string
  currentCgpa: number
  avgAttendanceRate: number
  riskLevel: string
  admissionYear: string
  user: {
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
    gender?: string
  }
  department: { name: string; code: string; faculty: string }
  cgpaRecords: CgpaRecord[]
  scores: Score[]
}

const LEVEL_LABELS: Record<string, string> = {
  L100: "100",
  L200: "200",
  L300: "300",
  L400: "400",
  L500: "500",
}

const SEM_LABELS: Record<string, string> = {
  FIRST: "First Semester",
  SECOND: "Second Semester",
}

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
}

const gradeColor = (grade: string) => {
  if (["A"].includes(grade))
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
  if (["B"].includes(grade))
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
  if (["C"].includes(grade))
    return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
  if (["D"].includes(grade))
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
}

const riskBadge: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  MEDIUM:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  LOW: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}

// Group scores by session + semester key
function groupScores(scores: Score[]) {
  const map = new Map<
    string,
    { session: string; semester: string; scores: Score[] }
  >()
  for (const s of scores) {
    const key = `${s.academicSession}__${s.semester}`
    if (!map.has(key))
      map.set(key, {
        session: s.academicSession,
        semester: s.semester,
        scores: [],
      })
    map.get(key)!.scores.push(s)
  }
  return Array.from(map.values())
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<StudentProfile>("/students/me")
      .then((res) => setProfile(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          Profile not found
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Complete your onboarding first.
        </p>
      </div>
    )
  }

  const initials = `${profile.user.firstName[0]}${profile.user.lastName[0]}`
  const grouped = groupScores(profile.scores)

  // Match cgpaRecord for a given session+semester
  const cgpaFor = (session: string, sem: string) =>
    profile.cgpaRecords.find(
      (r) => r.academicSession === session && r.semester === sem
    )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          {initials.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {profile.user.firstName} {profile.user.lastName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {profile.matricNumber} · {profile.department.name} ·{" "}
            {LEVEL_LABELS[profile.level] ?? profile.level} Level
            {profile.user.gender
              ? ` · ${GENDER_LABELS[profile.user.gender] ?? profile.user.gender}`
              : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className={riskBadge[profile.riskLevel] ?? riskBadge.LOW}>
              {profile.riskLevel.charAt(0) +
                profile.riskLevel.slice(1).toLowerCase()}{" "}
              Risk
            </Badge>
            {profile.currentCgpa > 0 && (
              <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                CGPA: {profile.currentCgpa.toFixed(2)}
              </Badge>
            )}
            {profile.avgAttendanceRate > 0 && (
              <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Attendance: {profile.avgAttendanceRate.toFixed(0)}%
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="academic">
        <TabsList className="dark:bg-slate-800">
          <TabsTrigger value="academic">Academic Record</TabsTrigger>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
        </TabsList>

        {/* Academic Record */}
        <TabsContent value="academic" className="mt-4 space-y-4">
          {grouped.length === 0 && profile.cgpaRecords.length === 0 ? (
            <Card className="dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                No academic records yet. Records will appear here after semester
                results are entered.
              </CardContent>
            </Card>
          ) : grouped.length > 0 ? (
            grouped.map((group) => {
              const cgpa = cgpaFor(group.session, group.semester)
              return (
                <Card
                  key={`${group.session}-${group.semester}`}
                  className="dark:border-slate-800 dark:bg-slate-900"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm dark:text-white">
                        {group.session} —{" "}
                        {SEM_LABELS[group.semester] ?? group.semester}
                      </CardTitle>
                      {cgpa && (
                        <Badge
                          className={
                            cgpa.semesterGpa >= 3.5
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : cgpa.semesterGpa >= 2.5
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : cgpa.semesterGpa >= 1.5
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          GPA: {cgpa.semesterGpa.toFixed(2)} · CGPA:{" "}
                          {cgpa.cumulativeCgpa.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="dark:border-slate-800">
                          <TableHead className="pl-6 dark:text-slate-400">
                            Code
                          </TableHead>
                          <TableHead className="dark:text-slate-400">
                            Course Title
                          </TableHead>
                          <TableHead className="dark:text-slate-400">
                            CA
                          </TableHead>
                          <TableHead className="dark:text-slate-400">
                            Exam
                          </TableHead>
                          <TableHead className="dark:text-slate-400">
                            Total
                          </TableHead>
                          <TableHead className="dark:text-slate-400">
                            GP
                          </TableHead>
                          <TableHead className="pr-6 dark:text-slate-400">
                            Grade
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.scores.map((s) => (
                          <TableRow
                            key={s.id}
                            className="dark:border-slate-800"
                          >
                            <TableCell className="pl-6 text-xs text-slate-500 dark:text-slate-400">
                              {s.course.code}
                            </TableCell>
                            <TableCell className="text-sm dark:text-slate-300">
                              {s.course.title}
                            </TableCell>
                            <TableCell className="text-sm dark:text-slate-300">
                              {s.caScore}
                            </TableCell>
                            <TableCell className="text-sm dark:text-slate-300">
                              {s.examScore}
                            </TableCell>
                            <TableCell className="text-sm font-medium dark:text-slate-200">
                              {s.totalScore}
                            </TableCell>
                            <TableCell className="text-sm dark:text-slate-300">
                              {s.gradePoint.toFixed(1)}
                            </TableCell>
                            <TableCell className="pr-6">
                              <Badge className={gradeColor(s.grade)}>
                                {s.grade}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            // Has cgpaRecords but no per-course scores yet
            profile.cgpaRecords.map((r) => (
              <Card
                key={r.id}
                className="dark:border-slate-800 dark:bg-slate-900"
              >
                <CardContent className="flex items-center justify-between px-6 py-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {r.academicSession} — {SEM_LABELS[r.semester] ?? r.semester}
                  </p>
                  <div className="flex gap-2">
                    <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      GPA: {r.semesterGpa.toFixed(2)}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      CGPA: {r.cumulativeCgpa.toFixed(2)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Personal Info */}
        <TabsContent value="personal" className="mt-4">
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base dark:text-white">
                Personal Information
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Your details on the EduSight system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Full Name",
                    value: `${profile.user.firstName} ${profile.user.lastName}`,
                  },
                  { label: "Matric Number", value: profile.matricNumber },
                  { label: "Department", value: profile.department.name },
                  { label: "Faculty", value: profile.department.faculty },
                  {
                    label: "Current Level",
                    value: `${LEVEL_LABELS[profile.level] ?? profile.level} Level`,
                  },
                  { label: "Admission Year", value: profile.admissionYear },
                  {
                    label: "Gender",
                    value: profile.user.gender
                      ? (GENDER_LABELS[profile.user.gender] ??
                        profile.user.gender)
                      : "—",
                  },
                  { label: "Email", value: profile.user.email },
                  { label: "Phone", value: profile.user.phoneNumber ?? "—" },
                  {
                    label: "Current CGPA",
                    value:
                      profile.currentCgpa > 0
                        ? profile.currentCgpa.toFixed(2)
                        : "—",
                  },
                  {
                    label: "Avg. Attendance",
                    value:
                      profile.avgAttendanceRate > 0
                        ? `${profile.avgAttendanceRate.toFixed(1)}%`
                        : "—",
                  },
                  {
                    label: "Risk Status",
                    value:
                      profile.riskLevel.charAt(0) +
                      profile.riskLevel.slice(1).toLowerCase(),
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
