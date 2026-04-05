import React from "react"
import { ArrowRight, UserCircle2, GraduationCap } from "lucide-react"

export const FinalCTA = () => {
  return (
    <section className="bg-white py-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-[3rem] bg-blue-700 shadow-2xl shadow-blue-200">
          {/* Decorative Background Circles */}
          <div className="absolute top-0 right-0 h-96 w-96 translate-x-1/4 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/2 rounded-full bg-indigo-500/20 blur-2xl" />

          <div className="relative z-10 px-8 py-16 text-center md:p-20">
            <h2 className="mb-6 text-3xl leading-tight font-black text-white md:text-5xl">
              Ready to transform <br className="hidden md:block" /> student
              outcomes at ACU?
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-blue-100 opacity-90">
              Join the Department of Computer Science in pioneering a
              data-driven approach to academic excellence. Log in to your
              specialized portal below.
            </p>

            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              {/* Lecturer Button */}
              <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-10 py-5 font-black text-blue-700 shadow-lg transition-all hover:-translate-y-1 hover:bg-blue-50 sm:w-auto">
                <UserCircle2 size={24} />
                Lecturer Portal
                <ArrowRight size={20} className="ml-2" />
              </button>

              {/* Student Button */}
              <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-blue-600 bg-blue-800 px-10 py-5 font-black text-white transition-all hover:bg-blue-900 sm:w-auto">
                <GraduationCap size={24} />
                Student Login
              </button>
            </div>

            <p className="mt-10 text-xs font-medium tracking-[0.3em] text-blue-300 uppercase">
              Developed by Tomiwa Adelae • CSC 499 Project
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
