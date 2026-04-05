import React from "react"

export const TrustBar = () => {
  const techs = [
    {
      name: "Next.js",
      logo: "https://cdn.worldvectorlogo.com/logos/next-js.svg",
    },
    {
      name: "Python",
      logo: "https://cdn.worldvectorlogo.com/logos/python-5.svg",
    },
    {
      name: "FastAPI",
      logo: "https://cdn.worldvectorlogo.com/logos/fastapi-1.svg",
    },
    {
      name: "PostgreSQL",
      logo: "https://cdn.worldvectorlogo.com/logos/postgresql.svg",
    },
  ]

  return (
    <div className="border-y border-slate-100 bg-white py-10">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* University Identity */}
          <div className="flex items-center gap-4 border-r-0 border-slate-200 pr-0 md:border-r md:pr-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
              ACU
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Affiliation
              </p>
              <p className="text-sm font-bold text-slate-900">
                Ajayi Crowther University
              </p>
            </div>
          </div>

          {/* Technology Stack Text */}
          <div className="flex-1 text-center md:text-left">
            <p className="mb-4 text-sm font-medium text-slate-500 md:mb-0">
              Built with industry-standard technologies for{" "}
              <span className="text-lg font-bold text-blue-700 italic">
                Educational Data Mining (EDM)
              </span>
            </p>
          </div>

          {/* Tech Logos */}
          <div className="flex items-center gap-8 opacity-50 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
            {techs.map((tech) => (
              <img
                key={tech.name}
                src={tech.logo}
                alt={tech.name}
                className="h-6 w-auto object-contain"
                title={tech.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
