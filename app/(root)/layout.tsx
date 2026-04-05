import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <Header />
      <div className="pt-20">{children}</div>
      <Footer />
    </div>
  )
}
