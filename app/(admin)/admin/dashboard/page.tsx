"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users,
  AlertTriangle,
  TrendingUp,
  BrainCircuit,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from "lucide-react"
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useAuth } from "@/store/useAuth"
import api from "@/lib/api"

interface DashboardStats {
  totalStudents: number
  atRiskCount: number
  averageCgpa: number
  departments: number
  cgpaDistribution: { range: string; count: number }[]
  riskDistribution: { name: string; value: number; color: string }[]
  recentAtRisk: {
    id: string
    matricNumber: string
    currentCgpa: number
    riskLevel: string
    user: { firstName: string; lastName: string }
    department: { name: string }
  }[]
}

const riskBadge = (risk: string) => {
  if (risk === "HIGH")
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        High Risk
      </Badge>
    )
  if (risk === "MEDIUM")
    return (
      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        Medium Risk
      </Badge>
    )
  return (
    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      Low Risk
    </Badge>
  )
}

function StatSkeleton() {
  return (
    <Card className="dark:border-slate-800 dark:bg-slate-900">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<DashboardStats>("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statCards = stats
    ? [
        {
          label: "Total Students",
          value: stats.totalStudents.toLocaleString(),
          change: `${stats.departments} department${stats.departments !== 1 ? "s" : ""}`,
          up: true,
          icon: Users,
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-950/40",
        },
        {
          label: "At-Risk Students",
          value: stats.atRiskCount.toLocaleString(),
          change:
            stats.totalStudents > 0
              ? `${((stats.atRiskCount / stats.totalStudents) * 100).toFixed(1)}% of cohort`
              : "0% of cohort",
          up: false,
          icon: AlertTriangle,
          color: "text-red-600",
          bg: "bg-red-50 dark:bg-red-950/40",
        },
        {
          label: "Average CGPA",
          value: stats.averageCgpa.toFixed(2),
          change: "Across all students",
          up: true,
          icon: TrendingUp,
          color: "text-emerald-600",
          bg: "bg-emerald-50 dark:bg-emerald-950/40",
        },
        {
          label: "Model F1 Score",
          value: "—",
          change: "No runs yet",
          up: true,
          icon: BrainCircuit,
          color: "text-violet-600",
          bg: "bg-violet-50 dark:bg-violet-950/40",
        },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Here's what's happening in EduSight today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : statCards.map(
              ({ label, value, change, up, icon: Icon, color, bg }) => (
                <Card
                  key={label}
                  className="dark:border-slate-800 dark:bg-slate-900"
                >
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {label}
                        </p>
                        <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                          {value}
                        </p>
                        <p
                          className={`mt-1 flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}
                        >
                          {up ? (
                            <ArrowUpRight size={12} />
                          ) : (
                            <ArrowDownRight size={12} />
                          )}
                          {change}
                        </p>
                      </div>
                      <div className={`rounded-xl p-2.5 ${bg}`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* CGPA Distribution Bar Chart */}
        <Card className="lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">
              CGPA Distribution
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Student GPA spread across the cohort
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.cgpaDistribution ?? []} barSize={28}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    className="dark:stroke-slate-700"
                  />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Risk Distribution Pie Chart */}
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">
              Risk Distribution
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Current prediction risk levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats?.riskDistribution ?? []}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(stats?.riskDistribution ?? []).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent at-risk students */}
      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base dark:text-white">
              Recent At-Risk Alerts
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Students flagged by the prediction model
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs dark:border-slate-700 dark:text-slate-300"
          >
            <Link href="/admin/students">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : stats?.recentAtRisk.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No at-risk students flagged yet. Run a prediction to see results
              here.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats?.recentAtRisk.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {s.user.firstName} {s.user.lastName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {s.matricNumber} · {s.department.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      CGPA {s.currentCgpa.toFixed(2)}
                    </span>
                    {riskBadge(s.riskLevel)}
                    <Link href={`/admin/students/${s.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye size={14} />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
