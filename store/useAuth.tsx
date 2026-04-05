import { create } from "zustand"
import { persist } from "zustand/middleware"

export type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  phoneNumber?: string | null
  image?: string | null
  dob?: string | null
  gender?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  role: "STUDENT" | "LECTURER" | "ADMIN"
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
} | null

type AuthState = {
  user: User
  setUser: (user: User) => void
  clearUser: () => void
  _hasHydrated: boolean
  setHasHydrated: (hasHydrated: boolean) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      _hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: "edusight-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
