"use client"

import React, { useEffect, useState } from "react"
import {
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  XCircle,
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
import { toast } from "sonner"
import api from "@/lib/api"

interface PredictionRun {
  id: string
  algorithm: string
  cohortLabel: string
  academicSession: string
  semester: string
  totalStudents: number
  flaggedStudents: number
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"
  durationSeconds: number | null
  createdAt: string
  completedAt: string | null
  triggeredBy: { firstName: string; lastName: string }
  modelMetrics: { accuracy: number; f1Score: number; aucRoc: number }[]
}

const ALGO_LABELS: Record<string, string> = {
  RANDOM_FOREST: "Random Forest",
  XGBOOST: "XGBoost",
  LOGISTIC_REGRESSION: "Logistic Regression",
  DECISION_TREE: "Decision Tree",
  SVM: "Support Vector Machine",
}

const SEM_LABELS: Record<string, string> = {
  FIRST: "First Semester",
  SECOND: "Second Semester",
}

function statusBadge(status: string) {
  if (status === "COMPLETED")
    return (
      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        Completed
      </Badge>
    )
  if (status === "RUNNING")
    return (
      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        Running
      </Badge>
    )
  if (status === "FAILED")
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        Failed
      </Badge>
    )
  return (
    <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
      Pending
    </Badge>
  )
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—"
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
}

export default function PredictionsPage() {
  const [runs, setRuns] = useState<PredictionRun[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [mlHealthy, setMlHealthy] = useState<boolean | null>(null)

  // Form state
  const [algorithm, setAlgorithm] = useState("RANDOM_FOREST")
  const [level, setLevel] = useState("all")
  const [academicSession, setAcademicSession] = useState("2024/2025")
  const [semester, setSemester] = useState("SECOND")

  useEffect(() => {
    fetchRuns()
    checkHealth()
  }, [])

  function checkHealth() {
    api
      .get("/predictions/health")
      .then((res) => setMlHealthy((res.data as any).models_trained === true))
      .catch(() => setMlHealthy(false))
  }

  function fetchRuns() {
    setLoading(true)
    api
      .get<PredictionRun[]>("/predictions")
      .then((res) => setRuns(res.data))
      .catch(() => toast.error("Could not load prediction runs"))
      .finally(() => setLoading(false))
  }

  async function handleRun() {
    if (!mlHealthy) {
      toast.error(
        "ML service is not reachable or models are not trained. Start the FastAPI service first."
      )
      return
    }
    setRunning(true)
    try {
      const body: any = { algorithm, academicSession, semester }
      if (level !== "all") body.level = level

      const res = await api.post<{
        runId: string
        totalStudents: number
        flaggedStudents: number
      }>("/predictions/run", body)
      toast.success(
        `Prediction complete — ${res.data.flaggedStudents} student(s) flagged out of ${res.data.totalStudents}`
      )
      fetchRuns()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Prediction run failed")
    } finally {
      setRunning(false)
    }
  }

  const latestCompleted = runs.find((r) => r.status === "COMPLETED")
  const latestMetrics = latestCompleted?.modelMetrics?.[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Predictions
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Run the ML model to predict student performance and flag at-risk
          students
        </p>
      </div>

      {/* ML health indicator */}
      {mlHealthy === false && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
          <XCircle size={16} />
          ML service is not running. Start it with:{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-900/40">
            python -m uvicorn app.main:app --port 8001
          </code>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Run Prediction Panel */}
        <Card className="lg:col-span-1 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">
              Run New Prediction
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Configure and trigger the model against current student data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                ML Algorithm
              </label>
              <Select
                value={algorithm}
                onValueChange={(v) => v && setAlgorithm(v)}
              >
                <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RANDOM_FOREST">
                    Random Forest (Recommended)
                  </SelectItem>
                  <SelectItem value="XGBOOST">XGBoost</SelectItem>
                  <SelectItem value="LOGISTIC_REGRESSION">
                    Logistic Regression
                  </SelectItem>
                  <SelectItem value="DECISION_TREE">Decision Tree</SelectItem>
                  <SelectItem value="SVM">Support Vector Machine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Target Cohort
              </label>
              <Select value={level} onValueChange={(v) => v && setLevel(v)}>
                <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="L100">100 Level Only</SelectItem>
                  <SelectItem value="L200">200 Level Only</SelectItem>
                  <SelectItem value="L300">300 Level Only</SelectItem>
                  <SelectItem value="L400">400 Level Only</SelectItem>
                  <SelectItem value="L500">500 Level Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Academic Session
              </label>
              <Select
                value={academicSession}
                onValueChange={(v) => v && setAcademicSession(v)}
              >
                <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2023/2024">2023/2024</SelectItem>
                  <SelectItem value="2022/2023">2022/2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Semester
              </label>
              <Select
                value={semester}
                onValueChange={(v) => v && setSemester(v)}
              >
                <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIRST">First Semester</SelectItem>
                  <SelectItem value="SECOND">Second Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={handleRun}
              disabled={running || mlHealthy === false}
            >
              {running ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Running…
                </>
              ) : (
                <>
                  <Play size={14} /> Run Prediction
                </>
              )}
            </Button>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              {mlHealthy === true
                ? "ML service ready · models trained"
                : mlHealthy === false
                  ? "ML service not reachable"
                  : "Checking ML service…"}
            </p>
          </CardContent>
        </Card>

        {/* Latest run summary */}
        <div className="space-y-4 lg:col-span-2">
          {latestCompleted ? (
            <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <CardContent>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                      Last Run Completed
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      {new Date(latestCompleted.createdAt).toLocaleString(
                        "en-NG"
                      )}{" "}
                      · {ALGO_LABELS[latestCompleted.algorithm]} ·{" "}
                      {formatDuration(latestCompleted.durationSeconds)}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {[
                        {
                          label: "Students Analysed",
                          value: latestCompleted.totalStudents.toLocaleString(),
                        },
                        {
                          label: "At-Risk Flagged",
                          value:
                            latestCompleted.flaggedStudents.toLocaleString(),
                        },
                        {
                          label: "F1 Score",
                          value: latestMetrics
                            ? (latestMetrics.f1Score * 100).toFixed(1) + "%"
                            : "—",
                        },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="rounded-lg bg-white/70 p-2.5 dark:bg-emerald-900/20"
                        >
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                            {label}
                          </p>
                          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-400" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No predictions run yet. Configure and click "Run Prediction"
                  to get started.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Risk breakdown from latest run */}
          {latestCompleted && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Flagged (High+Medium)",
                  value: latestCompleted.flaggedStudents,
                  color: "text-red-600",
                  bg: "bg-red-50 dark:bg-red-950/30",
                },
                {
                  label: "Total Students",
                  value: latestCompleted.totalStudents,
                  color: "text-slate-700 dark:text-slate-200",
                  bg: "bg-slate-50 dark:bg-slate-800/40",
                },
                {
                  label: "Flagged Rate",
                  value: `${((latestCompleted.flaggedStudents / latestCompleted.totalStudents) * 100).toFixed(1)}%`,
                  color: "text-amber-600",
                  bg: "bg-amber-50 dark:bg-amber-950/30",
                },
              ].map(({ label, value, color, bg }) => (
                <Card key={label} className={`${bg} border-0`}>
                  <CardContent>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {label}
                    </p>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Run history */}
      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base dark:text-white">
            Run History
          </CardTitle>
          <CardDescription className="dark:text-slate-400">
            All previous prediction runs
          </CardDescription>
        </CardHeader>
        <CardContent className={runs.length === 0 && !loading ? "pb-8" : "p-0"}>
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : runs.length === 0 ? (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              No runs yet. Run your first prediction above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="dark:border-slate-800">
                  <TableHead className="pl-6 dark:text-slate-400">
                    Cohort
                  </TableHead>
                  <TableHead className="dark:text-slate-400">Date</TableHead>
                  <TableHead className="dark:text-slate-400">
                    Algorithm
                  </TableHead>
                  <TableHead className="dark:text-slate-400">
                    Students
                  </TableHead>
                  <TableHead className="dark:text-slate-400">Flagged</TableHead>
                  <TableHead className="dark:text-slate-400">
                    F1 Score
                  </TableHead>
                  <TableHead className="dark:text-slate-400">
                    Duration
                  </TableHead>
                  <TableHead className="pr-6 dark:text-slate-400">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((r) => {
                  const m = r.modelMetrics?.[0]
                  return (
                    <TableRow key={r.id} className="dark:border-slate-800">
                      <TableCell className="max-w-[220px] truncate pl-6 text-sm dark:text-slate-300">
                        {r.cohortLabel}
                      </TableCell>
                      <TableCell className="text-sm dark:text-slate-300">
                        {new Date(r.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                        {ALGO_LABELS[r.algorithm] ?? r.algorithm}
                      </TableCell>
                      <TableCell className="text-sm dark:text-slate-300">
                        {r.totalStudents.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-red-600">
                          {r.flaggedStudents}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm dark:text-slate-300">
                        {m ? (m.f1Score * 100).toFixed(1) + "%" : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDuration(r.durationSeconds)}
                      </TableCell>
                      <TableCell className="pr-6">
                        {statusBadge(r.status)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
