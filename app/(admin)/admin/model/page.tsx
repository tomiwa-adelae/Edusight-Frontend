"use client"

import React, { useEffect, useState } from "react"
import { Trophy } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import api from "@/lib/api"

interface AlgoMetrics {
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  auc_roc: number
  cohen_kappa: number
  confusion_matrix: number[][]
  feature_importance?: Record<string, number>
}

type MetricsMap = Record<string, AlgoMetrics>

const ALGO_LABELS: Record<string, string> = {
  RANDOM_FOREST: "Random Forest",
  XGBOOST: "XGBoost",
  LOGISTIC_REGRESSION: "Logistic Regression",
  DECISION_TREE: "Decision Tree",
  SVM: "SVM",
}

const FEATURE_LABELS: Record<string, string> = {
  current_cgpa: "Current CGPA",
  avg_attendance_rate: "Attendance Rate",
  cgpa_trend: "CGPA Trend",
  study_hours_per_week: "Study Hours/Week",
  family_income_range: "Family Income",
  father_education: "Father's Education",
  mother_education: "Mother's Education",
  academic_self_confidence: "Self-Confidence",
  library_visit_frequency: "Library Usage",
  study_group_participation: "Study Groups",
  adviser_consultation_freq: "Adviser Consult.",
  part_time_work: "Part-Time Work",
  internet_access: "Internet Access",
  parent_occupation: "Parent Occupation",
  number_of_books: "Books Owned",
  level: "Academic Level",
}

const HYPERPARAMS: Record<string, Record<string, string>> = {
  RANDOM_FOREST: {
    n_estimators: "200",
    max_depth: "12",
    min_samples_leaf: "4",
    class_weight: "balanced",
    random_state: "42",
  },
  XGBOOST: {
    n_estimators: "200",
    max_depth: "6",
    learning_rate: "0.1",
    subsample: "0.8",
    colsample_bytree: "0.8",
  },
  LOGISTIC_REGRESSION: {
    max_iter: "1000",
    solver: "lbfgs",
    class_weight: "balanced",
  },
  DECISION_TREE: {
    max_depth: "8",
    min_samples_leaf: "5",
    class_weight: "balanced",
  },
  SVM: { kernel: "rbf", C: "1.0", class_weight: "balanced" },
}

const pct = (v: number) => (v * 100).toFixed(2)

const CM_LABELS = ["Fail", "At Risk", "Pass"]
const CM_COLORS = [
  [
    "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
    "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400",
  ],
  [
    "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400",
    "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400",
  ],
  [
    "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400",
    "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400",
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  ],
]

function ConfusionMatrix({ matrix }: { matrix: number[][] }) {
  const rowSums = matrix.map((row) => row.reduce((a, b) => a + b, 0))
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Header row */}
        <div className="mb-1 flex items-center gap-1 pl-24">
          {CM_LABELS.map((l) => (
            <div
              key={l}
              className="w-24 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400"
            >
              {l}
            </div>
          ))}
        </div>
        {/* Label column header */}
        <div className="mb-1 flex items-center gap-1">
          <div className="w-24 pr-2 text-right text-[10px] text-slate-400 dark:text-slate-500">
            Actual ↓ / Pred →
          </div>
          {CM_LABELS.map((_, ci) => (
            <div key={ci} className="w-24" />
          ))}
        </div>
        {matrix.map((row, ri) => (
          <div key={ri} className="mb-1 flex items-center gap-1">
            <div className="w-24 pr-2 text-right text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              {CM_LABELS[ri]}
            </div>
            {row.map((val, ci) => {
              const pctVal =
                rowSums[ri] > 0 ? ((val / rowSums[ri]) * 100).toFixed(1) : "0.0"
              return (
                <div
                  key={ci}
                  className={`flex h-16 w-24 flex-col items-center justify-center rounded-lg ${CM_COLORS[ri][ci]}`}
                >
                  <span className="text-xl font-bold">{val}</span>
                  <span className="text-[10px] opacity-70">{pctVal}%</span>
                </div>
              )
            })}
          </div>
        ))}
        <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
          Diagonal = correct predictions. Off-diagonal = misclassifications.
        </p>
      </div>
    </div>
  )
}

export default function ModelPage() {
  const [metrics, setMetrics] = useState<MetricsMap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<MetricsMap>("/predictions/metrics")
      .then((res) => {
        // Handle both FastAPI format (snake_case keys) and
        // DB fallback format (array with camelCase keys)
        const data = res.data
        if (Array.isArray(data)) {
          // DB fallback — convert array to map
          const map: MetricsMap = {}
          for (const row of data as any[]) {
            map[row.algorithm] = {
              accuracy: row.accuracy,
              precision: row.precision,
              recall: row.recall,
              f1_score: row.f1Score,
              auc_roc: row.aucRoc,
              cohen_kappa: row.cohenKappa,
              confusion_matrix: row.confusionMatrix,
            }
          }
          setMetrics(map)
        } else {
          setMetrics(data)
        }
      })
      .catch(() =>
        setError(
          "Could not load model metrics. Make sure the ML service is running and models are trained."
        )
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !metrics || Object.keys(metrics).length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            ML Model
          </h1>
        </div>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            {error ?? "No trained models found."}
            <p className="mt-2 text-xs">python train.py --regen</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Sort by F1 score descending
  const sorted = Object.entries(metrics).sort(
    (a, b) => b[1].f1_score - a[1].f1_score
  )
  const [bestKey, bestMetrics] = sorted[0]

  // Chart data
  const f1ChartData = sorted.map(([algo, m]) => ({
    name: ALGO_LABELS[algo] ?? algo,
    f1: parseFloat(pct(m.f1_score)),
  }))

  // Feature importance from best model
  const bestFI = bestMetrics.feature_importance ?? {}
  const featureData = Object.entries(bestFI)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, val]) => ({
      feature: FEATURE_LABELS[key] ?? key,
      importance: parseFloat((val * 100).toFixed(2)),
    }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          ML Model
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Algorithm comparison and performance metrics · 80/20 train/test split
        </p>
      </div>

      {/* Best model banner */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20">
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-200">
                Best Performing Algorithm: {ALGO_LABELS[bestKey] ?? bestKey}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                F1 Score: {pct(bestMetrics.f1_score)}% · AUC-ROC:{" "}
                {bestMetrics.auc_roc.toFixed(4)} · Cohen's Kappa:{" "}
                {bestMetrics.cohen_kappa.toFixed(4)} · Trained on 800 student
                records
              </p>
            </div>
            <Badge className="ml-auto bg-blue-600 text-white">
              Active Model
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Comparison table */}
      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="border-b">
          <CardTitle className="text-base dark:text-white">
            Algorithm Comparison
          </CardTitle>
          <CardDescription className="dark:text-slate-400">
            All metrics computed on the 20% hold-out test set (200 students)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-800">
                <TableHead className="pl-6 dark:text-slate-400">
                  Algorithm
                </TableHead>
                <TableHead className="dark:text-slate-400">Accuracy</TableHead>
                <TableHead className="dark:text-slate-400">Precision</TableHead>
                <TableHead className="dark:text-slate-400">Recall</TableHead>
                <TableHead className="dark:text-slate-400">F1 Score</TableHead>
                <TableHead className="dark:text-slate-400">AUC-ROC</TableHead>
                <TableHead className="pr-6 dark:text-slate-400">
                  Kappa
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(([algo, m], i) => (
                <TableRow
                  key={algo}
                  className={`dark:border-slate-800 ${i === 0 ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium dark:text-white">
                        {ALGO_LABELS[algo] ?? algo}
                      </span>
                      {i === 0 && (
                        <Badge className="bg-blue-600 px-1.5 py-0 text-[10px] text-white">
                          Best
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {pct(m.accuracy)}%
                  </TableCell>
                  <TableCell className="text-sm dark:text-slate-300">
                    {pct(m.precision)}%
                  </TableCell>
                  <TableCell className="text-sm dark:text-slate-300">
                    {pct(m.recall)}%
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-sm font-bold ${i === 0 ? "text-blue-600" : "dark:text-slate-300"}`}
                    >
                      {pct(m.f1_score)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-sm dark:text-slate-300">
                    {m.auc_roc.toFixed(4)}
                  </TableCell>
                  <TableCell className="pr-6 text-sm dark:text-slate-300">
                    {m.cohen_kappa.toFixed(4)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b">
            <CardTitle className="text-base dark:text-white">
              F1 Score Comparison
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Primary metric for imbalanced classification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={f1ChartData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip formatter={(v) => [`${v}%`, "F1 Score"]} />
                <Bar
                  dataKey="f1"
                  radius={[4, 4, 0, 0]}
                  fill="#2563eb"
                  label={{
                    position: "top",
                    fontSize: 9,
                    formatter: (v: unknown) => (v != null ? `${v}%` : ""),
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {featureData.length > 0 && (
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base dark:text-white">
                Feature Importance
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                {ALGO_LABELS[bestKey]} — mean decrease in impurity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={featureData}
                  layout="vertical"
                  barSize={14}
                  margin={{ left: 10, right: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 9 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    dataKey="feature"
                    type="category"
                    tick={{ fontSize: 9 }}
                    width={120}
                  />
                  <Tooltip formatter={(v) => [`${v}%`, "Importance"]} />
                  <Bar
                    dataKey="importance"
                    fill="#7c3aed"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confusion Matrix */}
      {bestMetrics.confusion_matrix &&
        bestMetrics.confusion_matrix.length === 3 && (
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="border-b">
              <CardTitle className="text-base dark:text-white">
                Confusion Matrix
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                {ALGO_LABELS[bestKey]} — actual vs. predicted classes on the 20%
                test set
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConfusionMatrix matrix={bestMetrics.confusion_matrix} />
            </CardContent>
          </Card>
        )}

      {/* Hyperparameter details for best model */}
      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="border-b">
          <CardTitle className="text-base dark:text-white">
            Best Model — Hyperparameters
          </CardTitle>
          <CardDescription className="dark:text-slate-400">
            {ALGO_LABELS[bestKey]} · Fixed hyperparameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(HYPERPARAMS[bestKey] ?? {}).map(
              ([param, value]) => (
                <div
                  key={param}
                  className="rounded-lg border border-slate-100 p-3 dark:border-slate-800"
                >
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    {param}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {value}
                  </p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
