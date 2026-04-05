"use client"

import React, { useEffect, useState } from "react"
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import api from "@/lib/api"

// ── Enum value → human label maps ────────────────────────────────────────────

const FAMILY_INCOME = [
  { value: "BELOW_50K", label: "Below ₦50,000" },
  { value: "BETWEEN_50K_100K", label: "₦50,000 – ₦100,000" },
  { value: "BETWEEN_100K_250K", label: "₦100,000 – ₦250,000" },
  { value: "BETWEEN_250K_500K", label: "₦250,000 – ₦500,000" },
  { value: "ABOVE_500K", label: "Above ₦500,000" },
]

const EDUCATION_LEVEL = [
  { value: "NO_FORMAL", label: "No formal education" },
  { value: "PRIMARY", label: "Primary School" },
  { value: "SECONDARY", label: "Secondary School (SSCE)" },
  { value: "OND_NCE", label: "OND / NCE" },
  { value: "BACHELORS", label: "Bachelor's Degree" },
  { value: "POSTGRADUATE", label: "Postgraduate" },
]

const PARENT_OCCUPATION = [
  { value: "CIVIL_SERVANT", label: "Civil Servant / Government Employee" },
  { value: "PRIVATE_SECTOR", label: "Private Sector Employee" },
  { value: "SELF_EMPLOYED", label: "Self-Employed / Business Owner" },
  { value: "FARMER_ARTISAN", label: "Farmer / Artisan / Trader" },
  { value: "PROFESSIONAL", label: "Professional (Doctor, Lawyer, etc.)" },
  { value: "UNEMPLOYED_RETIRED", label: "Unemployed / Retired" },
]

const INTERNET_ACCESS = [
  { value: "RELIABLE", label: "Yes, reliable" },
  { value: "LIMITED", label: "Yes, but limited / unstable" },
  { value: "NONE", label: "No" },
]

const PART_TIME_WORK = [
  { value: "NO", label: "No" },
  { value: "WEEKENDS_ONLY", label: "Yes — weekends only" },
  { value: "WEEKDAY_EVENINGS", label: "Yes — weekday evenings" },
  { value: "SIGNIFICANT_HOURS", label: "Yes — significant hours" },
]

const BOOK_COUNT = [
  { value: "NONE", label: "None" },
  { value: "ONE_TO_FIVE", label: "1 – 5 books" },
  { value: "SIX_TO_TEN", label: "6 – 10 books" },
  { value: "ELEVEN_TO_TWENTY", label: "11 – 20 books" },
  { value: "ABOVE_TWENTY", label: "More than 20 books" },
]

const STUDY_HOURS = [
  { value: "ZERO_TO_TWO", label: "0 – 2 hours" },
  { value: "THREE_TO_FIVE", label: "3 – 5 hours" },
  { value: "SIX_TO_TEN", label: "6 – 10 hours" },
  { value: "ELEVEN_TO_FIFTEEN", label: "11 – 15 hours" },
  { value: "ABOVE_FIFTEEN", label: "More than 15 hours" },
]

const VISIT_FREQUENCY = [
  { value: "NEVER", label: "Never" },
  { value: "RARELY", label: "Rarely (once a month)" },
  { value: "SOMETIMES", label: "Sometimes (once a week)" },
  { value: "OFTEN", label: "Often (multiple times a week)" },
  { value: "REGULARLY", label: "Regularly" },
]

const ADVISER_CONSULTATION = [
  { value: "NEVER", label: "Never" },
  { value: "ONCE_PER_SEMESTER", label: "Once per semester" },
  { value: "TWO_TO_THREE_PER_SEMESTER", label: "2 – 3 times per semester" },
  { value: "REGULARLY", label: "Regularly" },
]

const SELF_CONFIDENCE = [
  { value: "1", label: "Very Low (1/5)" },
  { value: "2", label: "Low (2/5)" },
  { value: "3", label: "Moderate (3/5)" },
  { value: "4", label: "High (4/5)" },
  { value: "5", label: "Very High (5/5)" },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface SocioFields {
  familyIncomeRange: string
  fatherEducation: string
  motherEducation: string
  parentOccupation: string
  internetAccess: string
  partTimeWork: string
  numberOfBooks: string
}

interface StudyFields {
  studyHoursPerWeek: string
  libraryVisitFrequency: string
  studyGroupParticipation: string
  academicSelfConfidence: string
  adviserConsultationFreq: string
}

const EMPTY_SOCIO: SocioFields = {
  familyIncomeRange: "",
  fatherEducation: "",
  motherEducation: "",
  parentOccupation: "",
  internetAccess: "",
  partTimeWork: "",
  numberOfBooks: "",
}

const EMPTY_STUDY: StudyFields = {
  studyHoursPerWeek: "",
  libraryVisitFrequency: "",
  studyGroupParticipation: "",
  academicSelfConfidence: "",
  adviserConsultationFreq: "",
}

const steps = [
  { id: 1, label: "Socioeconomic" },
  { id: 2, label: "Study Behaviour" },
  { id: 3, label: "Review & Submit" },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuestionnairePage() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [socio, setSocio] = useState<SocioFields>(EMPTY_SOCIO)
  const [study, setStudy] = useState<StudyFields>(EMPTY_STUDY)

  // Pre-fill if already submitted
  useEffect(() => {
    api.get<{ socioeconomicData: any; studyBehavior: any }>("/students/questionnaire")
      .then(({ data }) => {
        if (data.socioeconomicData) {
          const s = data.socioeconomicData
          setSocio({
            familyIncomeRange: s.familyIncomeRange ?? "",
            fatherEducation: s.fatherEducation ?? "",
            motherEducation: s.motherEducation ?? "",
            parentOccupation: s.parentOccupation ?? "",
            internetAccess: s.internetAccess ?? "",
            partTimeWork: s.partTimeWork ?? "",
            numberOfBooks: s.numberOfBooks ?? "",
          })
        }
        if (data.studyBehavior) {
          const b = data.studyBehavior
          setStudy({
            studyHoursPerWeek: b.studyHoursPerWeek ?? "",
            libraryVisitFrequency: b.libraryVisitFrequency ?? "",
            studyGroupParticipation: b.studyGroupParticipation ?? "",
            academicSelfConfidence: String(b.academicSelfConfidence ?? ""),
            adviserConsultationFreq: b.adviserConsultationFreq ?? "",
          })
          // If both sections exist, show as already submitted
          if (data.socioeconomicData) setSubmitted(true)
        }
      })
      .catch(() => {}) // silently ignore — empty form is fine
  }, [])

  const socioComplete = Object.values(socio).every(Boolean)
  const studyComplete = Object.values(study).every(Boolean)

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await api.post("/students/questionnaire", {
        ...socio,
        ...study,
        academicSelfConfidence: parseInt(study.academicSelfConfidence, 10),
      })
      setSubmitted(true)
      toast.success("Questionnaire submitted successfully!")
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Submission failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-emerald-100 p-6 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          Questionnaire Submitted!
        </h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Your responses have been saved and will be used to update your performance prediction.
        </p>
        <Button
          className="mt-6 gap-2 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => { setSubmitted(false); setStep(1) }}
        >
          Update Responses
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Questionnaire</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your responses help improve the accuracy of your performance prediction
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map(({ id, label }, i) => (
          <React.Fragment key={id}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                step > id || (id === 1 && socioComplete) || (id === 2 && studyComplete)
                  ? "bg-emerald-600 text-white"
                  : step === id
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
              )}>
                {step > id ? <CheckCircle2 size={14} /> : id}
              </div>
              <span className={cn(
                "hidden text-sm font-medium sm:block",
                step === id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
              )}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-px flex-1", step > id ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700")} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Step 1: Socioeconomic ── */}
      {step === 1 && (
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">Socioeconomic Background</CardTitle>
            <CardDescription className="dark:text-slate-400">
              This information is kept strictly confidential and used only for academic analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {([
                { key: "familyIncomeRange", label: "Monthly Family Income", options: FAMILY_INCOME },
                { key: "fatherEducation", label: "Father's Level of Education", options: EDUCATION_LEVEL },
                { key: "motherEducation", label: "Mother's Level of Education", options: EDUCATION_LEVEL },
                { key: "parentOccupation", label: "Parent / Guardian's Occupation", options: PARENT_OCCUPATION },
                { key: "internetAccess", label: "Do you have internet access at home?", options: INTERNET_ACCESS },
                { key: "partTimeWork", label: "Are you currently employed part-time?", options: PART_TIME_WORK },
                { key: "numberOfBooks", label: "How many academic books do you own?", options: BOOK_COUNT },
              ] as { key: keyof SocioFields; label: string; options: { value: string; label: string }[] }[]).map(({ key, label, options }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Select value={socio[key]} onValueChange={(v) => setSocio((p) => ({ ...p, [key]: v }))}>
                    <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setStep(2)}
                disabled={!socioComplete}
              >
                Next
                <ChevronRight size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Study Behaviour ── */}
      {step === 2 && (
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">Study Behaviour & Habits</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Tell us about how you study and engage with your academic work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {([
                { key: "studyHoursPerWeek", label: "Average study hours per week (outside class)", options: STUDY_HOURS },
                { key: "libraryVisitFrequency", label: "How often do you visit the library?", options: VISIT_FREQUENCY },
                { key: "studyGroupParticipation", label: "Do you participate in study groups?", options: VISIT_FREQUENCY },
                { key: "academicSelfConfidence", label: "How would you rate your academic self-confidence?", options: SELF_CONFIDENCE },
                { key: "adviserConsultationFreq", label: "How often do you consult your academic adviser?", options: ADVISER_CONSULTATION },
              ] as { key: keyof StudyFields; label: string; options: { value: string; label: string }[] }[]).map(({ key, label, options }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Select value={study[key]} onValueChange={(v) => setStudy((p) => ({ ...p, [key]: v }))}>
                    <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" className="gap-2 dark:border-slate-700" onClick={() => setStep(1)}>
                <ChevronLeft size={14} />
                Back
              </Button>
              <Button
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setStep(3)}
                disabled={!studyComplete}
              >
                Next
                <ChevronRight size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Review ── */}
      {step === 3 && (
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">Review & Submit</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Confirm that your responses are accurate before submitting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                By submitting this questionnaire, you confirm that:
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-emerald-700 dark:text-emerald-400">
                <li>All responses are truthful and accurate to the best of your knowledge</li>
                <li>Your data will be processed in line with the Nigeria Data Protection Act (2023)</li>
                <li>Responses are used solely for academic analysis and prediction at ACU</li>
              </ul>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Socioeconomic
              </p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { label: "Family Income", value: labelFor(FAMILY_INCOME, socio.familyIncomeRange) },
                  { label: "Father's Education", value: labelFor(EDUCATION_LEVEL, socio.fatherEducation) },
                  { label: "Mother's Education", value: labelFor(EDUCATION_LEVEL, socio.motherEducation) },
                  { label: "Parent Occupation", value: labelFor(PARENT_OCCUPATION, socio.parentOccupation) },
                  { label: "Internet Access", value: labelFor(INTERNET_ACCESS, socio.internetAccess) },
                  { label: "Part-Time Work", value: labelFor(PART_TIME_WORK, socio.partTimeWork) },
                  { label: "Books Owned", value: labelFor(BOOK_COUNT, socio.numberOfBooks) },
                ]).map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{label}</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Study Behaviour
              </p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { label: "Study Hours/Week", value: labelFor(STUDY_HOURS, study.studyHoursPerWeek) },
                  { label: "Library Visits", value: labelFor(VISIT_FREQUENCY, study.libraryVisitFrequency) },
                  { label: "Study Groups", value: labelFor(VISIT_FREQUENCY, study.studyGroupParticipation) },
                  { label: "Self-Confidence", value: labelFor(SELF_CONFIDENCE, study.academicSelfConfidence) },
                  { label: "Adviser Consultation", value: labelFor(ADVISER_CONSULTATION, study.adviserConsultationFreq) },
                ]).map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{label}</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" className="gap-2 dark:border-slate-700" onClick={() => setStep(2)}>
                <ChevronLeft size={14} />
                Back
              </Button>
              <Button
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                ) : (
                  <><CheckCircle2 size={14} /> Submit Questionnaire</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
