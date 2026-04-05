"use client"

import React, { useState } from "react"
import { Download, FileText, BarChart3, Users, TrendingUp, AlertTriangle, Database, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from "@/lib/api"

// ── CSV helpers ────────────────────────────────────────────────────────────────

function downloadCsv(filename: string, rows: string[][], headers: string[]) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))]
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Report definitions ─────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = {
  L100: "100", L200: "200", L300: "300", L400: "400", L500: "500",
}

type ReportKey = "at-risk" | "cgpa-distribution" | "model-performance" | "full-export"

interface AtRiskStudent {
  matricNumber: string
  level: string
  currentCgpa: number
  avgAttendanceRate: number
  riskLevel: string
  admissionYear: string
  user: { firstName: string; lastName: string; email: string }
  department: { name: string; code: string }
}

interface ModelMetricRow {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  aucRoc: number
  cohenKappa: number
}

type MetricsMap = Record<string, ModelMetricRow & { f1_score?: number; auc_roc?: number; cohen_kappa?: number }>

interface StudentRow {
  matricNumber: string
  level: string
  currentCgpa: number
  avgAttendanceRate: number
  riskLevel: string
  isAtRisk: boolean
  admissionYear: string
  user: { firstName: string; lastName: string; email: string }
  department: { name: string; code: string }
}

export default function ReportsPage() {
  const [loading, setLoading] = useState<ReportKey | null>(null)

  async function handleExport(key: ReportKey) {
    setLoading(key)
    try {
      if (key === "at-risk") {
        const res = await api.get<AtRiskStudent[]>("/admin/reports/at-risk")
        const rows = res.data.map((s) => [
          `${s.user.firstName} ${s.user.lastName}`,
          s.matricNumber,
          s.department.name,
          `${LEVEL_LABELS[s.level] ?? s.level} Level`,
          s.currentCgpa.toFixed(2),
          s.avgAttendanceRate > 0 ? `${s.avgAttendanceRate.toFixed(1)}%` : "—",
          s.riskLevel,
          s.admissionYear,
          s.user.email,
        ])
        downloadCsv(
          `EduSight_AtRisk_Report_${new Date().toISOString().slice(0, 10)}.csv`,
          rows,
          ["Full Name", "Matric Number", "Department", "Level", "CGPA", "Avg Attendance", "Risk Level", "Admission Year", "Email"],
        )
        toast.success(`${rows.length} at-risk student(s) exported`)
      }

      else if (key === "model-performance") {
        const res = await api.get<MetricsMap>("/predictions/metrics")
        const data = res.data
        const entries = Array.isArray(data)
          ? (data as any[]).map((r) => [r.algorithm, r])
          : Object.entries(data)
        const rows = entries.map(([algo, m]: [string, any]) => [
          algo,
          ((m.accuracy ?? 0) * 100).toFixed(2) + "%",
          ((m.precision ?? 0) * 100).toFixed(2) + "%",
          ((m.recall ?? 0) * 100).toFixed(2) + "%",
          ((m.f1_score ?? m.f1Score ?? 0) * 100).toFixed(2) + "%",
          (m.auc_roc ?? m.aucRoc ?? 0).toFixed(4),
          (m.cohen_kappa ?? m.cohenKappa ?? 0).toFixed(4),
        ])
        downloadCsv(
          `EduSight_ModelPerformance_${new Date().toISOString().slice(0, 10)}.csv`,
          rows,
          ["Algorithm", "Accuracy", "Precision", "Recall", "F1 Score", "AUC-ROC", "Cohen Kappa"],
        )
        toast.success("Model performance report exported")
      }

      else if (key === "cgpa-distribution" || key === "full-export") {
        const res = await api.get<{ students: StudentRow[] }>("/students?page=1&limit=10000")
        const students = res.data.students
        if (key === "cgpa-distribution") {
          const rows = students.map((s) => [
            `${s.user.firstName} ${s.user.lastName}`,
            s.matricNumber,
            s.department.name,
            `${LEVEL_LABELS[s.level] ?? s.level} Level`,
            s.currentCgpa > 0 ? s.currentCgpa.toFixed(2) : "—",
            s.riskLevel,
          ])
          downloadCsv(
            `EduSight_CGPADistribution_${new Date().toISOString().slice(0, 10)}.csv`,
            rows,
            ["Full Name", "Matric Number", "Department", "Level", "CGPA", "Risk Level"],
          )
        } else {
          const rows = students.map((s) => [
            `${s.user.firstName} ${s.user.lastName}`,
            s.matricNumber,
            s.department.name,
            s.department.code,
            `${LEVEL_LABELS[s.level] ?? s.level} Level`,
            s.currentCgpa > 0 ? s.currentCgpa.toFixed(2) : "—",
            s.avgAttendanceRate > 0 ? `${s.avgAttendanceRate.toFixed(1)}%` : "—",
            s.riskLevel,
            s.isAtRisk ? "Yes" : "No",
            s.admissionYear,
            s.user.email,
          ])
          downloadCsv(
            `EduSight_FullExport_Anonymised_${new Date().toISOString().slice(0, 10)}.csv`,
            rows,
            ["Full Name", "Matric Number", "Department", "Dept Code", "Level", "CGPA", "Avg Attendance", "Risk Level", "At Risk", "Admission Year", "Email"],
          )
        }
        toast.success(`${students.length} student record(s) exported`)
      }
    } catch {
      toast.error("Export failed. Try again.")
    } finally {
      setLoading(null)
    }
  }

  const reportCards: {
    key: ReportKey
    title: string
    description: string
    icon: React.ElementType
    color: string
    bg: string
    badge: string
    badgeColor: string
  }[] = [
    {
      key: "at-risk",
      title: "At-Risk Students Report",
      description: "Full list of flagged students with risk levels, CGPA, and contact info",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/30",
      badge: "Live data",
      badgeColor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
    {
      key: "model-performance",
      title: "Model Performance Report",
      description: "Accuracy, F1, AUC-ROC and Cohen Kappa for all 5 trained algorithms",
      icon: BarChart3,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      badge: "Current run",
      badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      key: "cgpa-distribution",
      title: "CGPA Distribution Report",
      description: "CGPA and risk level for all registered students across departments",
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/30",
      badge: "Live data",
      badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    },
    {
      key: "full-export",
      title: "Full Dataset Export",
      description: "All student academic data in CSV format for research and validation",
      icon: Database,
      color: "text-slate-600",
      bg: "bg-slate-100 dark:bg-slate-800/40",
      badge: "Anonymisable",
      badgeColor: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    },
  ]

  const staticCards: {
    title: string
    description: string
    icon: React.ElementType
    color: string
    bg: string
    badge: string
    badgeColor: string
  }[] = [
    {
      title: "Attendance Report",
      description: "Attendance rates per department and student, highlighting below-threshold students",
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      badge: "Requires course data",
      badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
      title: "Cohort Analysis Report",
      description: "Comparative analysis across academic sessions",
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      badge: "Requires multi-session data",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Generate and export system reports as CSV</p>
      </div>

      {/* Live export cards */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Live Exports
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {reportCards.map(({ key, title, description, icon: Icon, color, bg, badge, badgeColor }) => (
            <Card key={key} className="dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl p-2.5 ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <Badge className={badgeColor}>{badge}</Badge>
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
                <div className="mt-4 flex items-center justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs dark:border-slate-700 dark:text-slate-300"
                    onClick={() => handleExport(key)}
                    disabled={loading === key}
                  >
                    {loading === key
                      ? <><Loader2 size={12} className="animate-spin" /> Exporting…</>
                      : <><Download size={12} /> Export CSV</>
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Requires additional data */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Requires Additional Data
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {staticCards.map(({ title, description, icon: Icon, color, bg, badge, badgeColor }) => (
            <Card key={title} className="opacity-60 dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl p-2.5 ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <Badge className={badgeColor}>{badge}</Badge>
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
                <div className="mt-4 flex items-center justify-end">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs dark:border-slate-700 dark:text-slate-300" disabled>
                    <Download size={12} /> Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
