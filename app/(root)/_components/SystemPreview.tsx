import React from "react"
import { LayoutDashboard, UserCheck, PieChart, BellRing } from "lucide-react"

export const SystemPreview = () => {
  return (
    <section className="overflow-hidden bg-slate-900 py-24 text-white">
      <div className="container">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-sm font-bold tracking-[0.2em] text-blue-400 uppercase">
            Interface Preview
          </h2>
          <h3 className="mb-6 text-3xl font-black md:text-5xl">
            Designed for Academic <span className="text-blue-500">Action.</span>
          </h3>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            A seamless bridge between complex Machine Learning outputs and
            practical classroom intervention.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Main Dashboard Preview (Large Card) */}
          <div className="group relative rounded-3xl border border-white/10 bg-slate-800/50 p-8 md:col-span-2">
            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-2xl bg-blue-600 p-3">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold">Lecturer Command Center</h4>
                <p className="text-sm text-slate-400">
                  Real-time departmental performance tracking
                </p>
              </div>
            </div>
            {/* Simulated UI element */}
            <div className="space-y-4 opacity-80 transition-opacity group-hover:opacity-100">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-20 rounded-2xl border border-white/5 bg-slate-700/50 p-4 text-center">
                  <p className="text-xs text-slate-500 uppercase">
                    Total Students
                  </p>
                  <p className="text-xl font-bold">482</p>
                </div>
                <div className="h-20 rounded-2xl border border-white/5 bg-slate-700/50 p-4 text-center">
                  <p className="text-xs text-slate-500 uppercase">
                    Avg. Accuracy
                  </p>
                  <p className="text-xl font-bold text-blue-400">94.1%</p>
                </div>
                <div className="h-20 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                  <p className="text-xs text-[10px] font-bold text-red-400 uppercase">
                    High Risk Flag
                  </p>
                  <p className="text-xl font-bold text-red-500">12</p>
                </div>
              </div>
              <div className="flex h-48 items-center justify-center rounded-2xl border border-white/5 bg-slate-900/50 text-slate-600 italic">
                [ Interactive Performance Graph Visualization ]
              </div>
            </div>
          </div>

          {/* Side Card 1: Notifications */}
          <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 shadow-xl shadow-blue-900/20">
            <BellRing size={40} className="mb-8" />
            <div>
              <h4 className="mb-2 text-xl font-bold">Early Warnings</h4>
              <p className="text-sm leading-relaxed text-blue-100">
                Automated alerts sent to Course Advisors when a student's risk
                probability exceeds the 75% threshold.
              </p>
            </div>
          </div>

          {/* Side Card 2: Student Profiling */}
          <div className="rounded-3xl border border-white/10 bg-slate-800/50 p-8">
            <UserCheck size={32} className="mb-6 text-emerald-400" />
            <h4 className="mb-4 text-xl font-bold">Intervention Tracking</h4>
            <ul className="space-y-3">
              {[
                "Performance Logs",
                "Study Hour Audit",
                "Risk Explanations",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-slate-400"
                >
                  <div className="h-1 w-1 rounded-full bg-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Final Logic Card */}
          <div className="flex items-center gap-8 rounded-3xl border border-white/10 bg-slate-800/50 p-8 md:col-span-2">
            <div className="hidden sm:block">
              <PieChart size={80} className="text-blue-500 opacity-50" />
            </div>
            <div>
              <h4 className="mb-2 text-xl font-bold text-blue-400">
                SHAP Explainability Integration
              </h4>
              <p className="text-sm text-slate-400">
                Our system doesn't just predict; it explains. See exactly which
                features (like attendance or parental income) are driving a
                student's risk score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
