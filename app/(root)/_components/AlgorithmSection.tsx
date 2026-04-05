import React from "react"
import { Cpu, Layers, GitBranch, Binary } from "lucide-react"

const models = [
  {
    name: "XGBoost",
    fullTitle: "Extreme Gradient Boosting",
    description:
      "Our primary high-performance algorithm designed for speed and accuracy with structured tabular data.",
    performance: 94,
    icon: <Cpu className="text-blue-500" />,
  },
  {
    name: "Random Forest",
    fullTitle: "Ensemble Learning",
    description:
      "Constructs multiple decision trees to provide a robust, averaged prediction that prevents overfitting.",
    performance: 91,
    icon: <GitBranch className="text-indigo-500" />,
  },
  {
    name: "SVM",
    fullTitle: "Support Vector Machine",
    description:
      "Excellent for high-dimensional data, finding the optimal hyperplane to separate pass/fail categories.",
    performance: 87,
    icon: <Layers className="text-slate-500" />,
  },
]

export const AlgorithmSection = () => {
  return (
    <section className="bg-white py-24">
      <div className="container">
        <div className="grid items-start gap-12 lg:grid-cols-3">
          {/* Left Side: Explanation */}
          <div className="sticky top-32 lg:col-span-1">
            <h2 className="mb-4 text-sm font-bold tracking-widest text-blue-700 uppercase">
              Core Intelligence
            </h2>
            <h3 className="mb-6 text-4xl leading-tight font-black text-slate-900">
              The Algorithms <br />
              Behind the Model.
            </h3>
            <p className="mb-8 leading-relaxed text-slate-600">
              We don't rely on a single guess. Our system compares multiple
              <span className="font-bold text-slate-900">
                {" "}
                Supervised Learning{" "}
              </span>
              algorithms to ensure every student's prediction is backed by the
              most mathematically accurate model available.
            </p>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="rounded-lg bg-white p-2 shadow-sm">
                <Binary className="text-blue-600" size={20} />
              </div>
              <p className="text-xs font-medium text-slate-500">
                Tested using 10-fold Cross-Validation as specified in Chapter
                3.10.
              </p>
            </div>
          </div>

          {/* Right Side: Algorithm Cards */}
          <div className="space-y-6 lg:col-span-2">
            {models.map((model, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-blue-100"
              >
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div className="flex gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-110">
                      {model.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">
                        {model.name}
                      </h4>
                      <p className="mb-2 text-xs font-bold tracking-tighter text-blue-600 uppercase">
                        {model.fullTitle}
                      </p>
                      <p className="max-w-md text-sm leading-relaxed text-slate-500">
                        {model.description}
                      </p>
                    </div>
                  </div>

                  {/* Accuracy Indicator */}
                  <div className="min-w-[120px] text-right">
                    <p className="text-3xl font-black text-slate-900">
                      {model.performance}%
                    </p>
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Benchmarked Accuracy
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all delay-300 duration-1000"
                        style={{ width: `${model.performance}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
