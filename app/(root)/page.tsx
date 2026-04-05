import React from "react"
import { Hero } from "./_components/Hero"
import { TrustBar } from "./_components/TrustBar"
import { DataFeatures } from "./_components/DataFeatures"
import { AlgorithmSection } from "./_components/AlgorithmSection"
import { SystemPreview } from "./_components/SystemPreview"
import { FinalCTA } from "./_components/FinalCTA"

const page = () => {
  return (
    <div>
      <Hero />
      <TrustBar />
      <DataFeatures />
      <AlgorithmSection />
      <SystemPreview />
      <FinalCTA />
    </div>
  )
}

export default page
