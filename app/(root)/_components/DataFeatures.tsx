import React from "react"
import { BookOpen, Users, Clock, Home } from "lucide-react"

const categories = [
  {
    title: "Academic Background",
    icon: <BookOpen className="text-blue-600" />,
    features: [
      "Previous CGPA",
      "JAMB/UTME Scores",
      "Internal Assessment Grades",
    ],
    color: "bg-blue-50",
  },
  {
    title: "Learning Engagement",
    icon: <Clock className="text-emerald-600" />,
    features: ["Attendance Rate", "Assignment Submissions", "LMS Activity"],
    color: "bg-emerald-50",
  },
  {
    title: "Socioeconomic Status",
    icon: <Home className="text-amber-600" />,
    features: ["Parental Education", "Income Level", "Sponsorship Type"],
    color: "bg-amber-50",
  },
  {
    title: "Behavioral Factors",
    icon: <Users className="text-indigo-600" />,
    features: ["Study Hours/Week", "Internet Access", "Peer Study Groups"],
    color: "bg-indigo-50",
  },
]

export const DataFeatures = () => {
  return (
    <section className="bg-slate-50 py-24">
      <div className="container">
        <div className="mb-16 text-center">
          <h2 className="mb-2 text-sm font-bold tracking-widest text-blue-700 uppercase">
            The Engine Room
          </h2>
          <h3 className="mb-4 text-4xl font-black text-slate-900">
            Multi-Dimensional Data Input
          </h3>
          <p className="mx-auto max-w-2xl text-slate-600">
            Our models process over 14 distinct features categorized into four
            key dimensions to ensure a holistic prediction of student success.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-blue-500"
            >
              <div
                className={`h-14 w-14 ${cat.color} mb-6 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-110`}
              >
                {cat.icon}
              </div>
              <h4 className="mb-4 text-xl font-bold text-slate-900">
                {cat.title}
              </h4>
              <ul className="space-y-3">
                {cat.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center text-sm text-slate-500"
                  >
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Technical Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-400 italic">
            *All data inputs are processed according to the Nigeria Data
            Protection Act (2023) standards mentioned in Chapter 3.12.
          </p>
        </div>
      </div>
    </section>
  )
}
