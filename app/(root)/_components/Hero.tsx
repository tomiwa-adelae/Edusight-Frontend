import React from "react"
import { ArrowRight, BrainCircuit, BarChart3, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Hero = () => {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-slate-50 py-20">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 z-0 h-full w-full overflow-hidden">
        <div className="absolute top-[10%] left-[-5%] h-[40%] w-[40%] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute right-[-5%] bottom-[10%] h-[30%] w-[30%] rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Side: Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-xs font-bold tracking-wider text-blue-700 uppercase">
              <BrainCircuit size={16} />
              <span>Predictive Analytics for ACU</span>
            </div>

            <h1 className="mb-6 text-5xl leading-[1.1] font-extrabold text-slate-900 md:text-7xl">
              Empowering Success Through{" "}
              <span className="text-blue-700">Predictive AI.</span>
            </h1>

            <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-slate-600 md:text-xl lg:mx-0">
              An advanced Early Warning System designed to identify at-risk
              students using Machine Learning, enabling proactive academic
              intervention at Ajayi Crowther University.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Button>Access Portal</Button>
              <Button variant={"secondary"}>View Methodology</Button>
            </div>
          </div>

          {/* Right Side: Visual Image/Mockup */}
          <div className="relative">
            {/* The "Main Image" - A clean dashboard mockup or AI visualization */}
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-white/40 bg-slate-900 shadow-2xl md:aspect-video lg:aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />

              {/* Floating "Result" Card */}
              <div className="relative z-20 w-4/5 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-400 uppercase">
                      Model Analysis
                    </p>
                    <h3 className="text-xl font-bold text-white">
                      Student Risk Profile
                    </h3>
                  </div>
                  <ShieldCheck className="text-emerald-400" />
                </div>

                <div className="space-y-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[85%] bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Prediction Confidence
                    </span>
                    <span className="font-bold text-white">94.2%</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                      <p className="text-[10px] text-slate-400 uppercase">
                        Status
                      </p>
                      <p className="font-bold text-emerald-400">On Track</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                      <p className="text-[10px] text-slate-400 uppercase">
                        Alert Level
                      </p>
                      <p className="font-bold text-slate-200">Low Risk</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Chart Icon in background */}
              <BarChart3
                size={200}
                className="absolute -right-10 -bottom-10 rotate-12 text-white/5"
              />
            </div>

            {/* Small Floating Badge */}
            <div className="absolute -top-6 -right-6 hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xl md:block">
              <p className="mb-1 text-xs font-bold text-slate-500">
                Total Students Scanned
              </p>
              <p className="text-2xl font-black text-blue-700">1,240+</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
