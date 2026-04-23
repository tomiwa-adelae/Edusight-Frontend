import React from "react"
import { ArrowRight, UserCircle2, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const FinalCTA = () => {
  return (
    <section className="bg-white py-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-[3rem] bg-blue-700 shadow-2xl shadow-blue-200">
          {/* Decorative Background Circles */}
          <div className="absolute top-0 right-0 h-96 w-96 translate-x-1/4 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/2 rounded-full bg-indigo-500/20 blur-2xl" />

          <div className="relative z-10 px-8 py-16 text-center md:p-20">
            <h2 className="mb-6 text-3xl leading-tight font-semibold text-white md:text-5xl">
              Ready to transform <br className="hidden md:block" /> student
              outcomes at ACU?
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-blue-100 opacity-90">
              Join the Department of Computer Science in pioneering a
              data-driven approach to academic excellence. Log in to your
              specialized portal below.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              {/* Lecturer Button */}
              <Link href={"/login"}>
                <Button>
                  <UserCircle2 />
                  Login
                </Button>
              </Link>

              {/* Student Button */}
              <Link href={"/register"}>
                <Button variant="outline">
                  <GraduationCap size={24} />
                  Get Started
                </Button>
              </Link>
            </div>

            <p className="mt-10 text-xs font-medium text-blue-300 uppercase">
              Developed by Tomiwa Adelae • CSC 499 Project
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
