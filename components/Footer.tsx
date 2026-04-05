import {
  IconBrandGithub,
  IconGlobe,
  IconMail,
  IconShield,
} from "@tabler/icons-react"
import { Logo } from "./Logo"
import { homeNavLinks } from "@/constants/nav-links"

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12 text-slate-400">
      <div className="container">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Column 1: Project Identity */}
          <div className="col-span-1 md:col-span-2">
            <Logo />
            <p className="mb-6 max-w-sm text-sm leading-relaxed">
              Development of a Machine Learning Model for Predicting Student
              Performance. An Early Warning System built for the Department of
              Computer Science, Ajayi Crowther University, Oyo.
            </p>
            <div className="flex w-fit items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs">
              <IconShield size={14} className="text-emerald-500" />
              <span>NDPA (2023) Compliant Data Handling</span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="mb-6 text-sm font-bold tracking-widest text-white uppercase">
              Platform
            </h4>
            <ul className="space-y-3 text-sm">
              {homeNavLinks.map((link) => (
                <li key={link.slug}>
                  <a
                    href={link.slug}
                    className="transition-colors hover:text-blue-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Institutional Links */}
          <div>
            <h4 className="mb-6 text-sm font-bold tracking-widest text-white uppercase">
              Institution
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://acu.edu.ng"
                  target="_blank"
                  className="flex items-center gap-2 transition-colors hover:text-blue-400"
                >
                  <IconGlobe size={14} />
                  ACU Portal
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@acu.edu.ng"
                  className="flex items-center gap-2 transition-colors hover:text-blue-400"
                >
                  <IconMail size={14} />
                  Dept. Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 transition-colors hover:text-blue-400"
                >
                  <IconBrandGithub size={14} />
                  Project Source
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-900 pt-8 text-xs font-medium md:flex-row">
          <p>© {currentYear} Tomiwa Adelae. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span className="tracking-tighter text-slate-500 uppercase">
              CSC 499 • Project Defense Version 1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
