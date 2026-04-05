"use client"

import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Search, SlidersHorizontal, Download, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import api from "@/lib/api"

interface Department {
  id: string
  name: string
  code: string
}

interface Student {
  id: string
  matricNumber: string
  level: string
  currentCgpa: number
  isAtRisk: boolean
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  user: { firstName: string; lastName: string; email: string }
  department: { id: string; name: string; code: string }
}

interface StudentsResponse {
  students: Student[]
  total: number
  page: number
  totalPages: number
}

const LEVEL_LABELS: Record<string, string> = {
  L100: "100",
  L200: "200",
  L300: "300",
  L400: "400",
  L500: "500",
}

const riskBadge = (risk: string) => {
  if (risk === "HIGH") return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">High</Badge>
  if (risk === "MEDIUM") return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Medium</Badge>
  return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Low</Badge>
}

export default function StudentsPage() {
  const [data, setData] = useState<StudentsResponse | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [riskLevel, setRiskLevel] = useState("")
  const [level, setLevel] = useState("")

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, departmentId, riskLevel, level])

  // Fetch departments once
  useEffect(() => {
    api.get<Department[]>("/admin/departments")
      .then((res) => setDepartments(res.data))
      .catch(console.error)
  }, [])

  // Fetch students
  const fetchStudents = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "10" })
    if (debouncedSearch) params.set("search", debouncedSearch)
    if (departmentId) params.set("departmentId", departmentId)
    if (riskLevel) params.set("riskLevel", riskLevel)
    if (level) params.set("level", level)

    api.get<StudentsResponse>(`/students?${params}`)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, departmentId, riskLevel, level])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const students = data?.students ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {loading ? "Loading…" : `${total.toLocaleString()} student${total !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 dark:border-slate-700 dark:text-slate-300">
          <Download size={14} />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9 dark:border-slate-700 dark:bg-slate-800"
                placeholder="Search name or matric number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="w-44 dark:border-slate-700 dark:bg-slate-800">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={riskLevel} onValueChange={setRiskLevel}>
              <SelectTrigger className="w-36 dark:border-slate-700 dark:bg-slate-800">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="HIGH">High Risk</SelectItem>
                <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                <SelectItem value="LOW">Low Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-32 dark:border-slate-700 dark:bg-slate-800">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="L100">100 Level</SelectItem>
                <SelectItem value="L200">200 Level</SelectItem>
                <SelectItem value="L300">300 Level</SelectItem>
                <SelectItem value="L400">400 Level</SelectItem>
                <SelectItem value="L500">500 Level</SelectItem>
              </SelectContent>
            </Select>
            {(search || departmentId || riskLevel || level) && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs dark:text-slate-400"
                onClick={() => {
                  setSearch("")
                  setDepartmentId("")
                  setRiskLevel("")
                  setLevel("")
                }}
              >
                <SlidersHorizontal size={13} />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base dark:text-white">All Students</CardTitle>
          <CardDescription className="dark:text-slate-400">
            {loading
              ? "Loading students…"
              : `Showing ${students.length} of ${total.toLocaleString()} students`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-800">
                <TableHead className="pl-6 dark:text-slate-400">Student</TableHead>
                <TableHead className="dark:text-slate-400">Matric No.</TableHead>
                <TableHead className="dark:text-slate-400">Department</TableHead>
                <TableHead className="dark:text-slate-400">Level</TableHead>
                <TableHead className="dark:text-slate-400">CGPA</TableHead>
                <TableHead className="dark:text-slate-400">Risk</TableHead>
                <TableHead className="pr-6 dark:text-slate-400" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="dark:border-slate-800">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j} className={j === 0 ? "pl-6" : j === 6 ? "pr-6" : ""}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    No students found. Add students to get started.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id} className="dark:border-slate-800">
                    <TableCell className="pl-6 font-medium dark:text-white">
                      {s.user.firstName} {s.user.lastName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {s.matricNumber}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                      {s.department.name}
                    </TableCell>
                    <TableCell className="text-sm dark:text-slate-300">
                      {LEVEL_LABELS[s.level] ?? s.level}L
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-semibold ${
                        s.currentCgpa < 2.0
                          ? "text-red-600"
                          : s.currentCgpa < 2.5
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}>
                        {s.currentCgpa.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>{riskBadge(s.riskLevel)}</TableCell>
                    <TableCell className="pr-6">
                      <Link href={`/admin/students/${s.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye size={14} />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <p>
          {total === 0
            ? "No students"
            : `Showing ${(page - 1) * 10 + 1}–${Math.min(page * 10, total)} of ${total.toLocaleString()}`}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            className="dark:border-slate-700"
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            className="dark:border-slate-700"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
